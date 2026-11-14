/**
 * @file Ruby grammar for tree-sitter
 * @license MIT
 *
 * Ruby 3.4, with no external scanner. See README.md for how the parts that
 * usually need one are handled: newlines, spacing around operators after a
 * method name (`foo -1` and `foo - 1`), string and regex contents, percent
 * literals, and heredocs.
 */

/// <reference types="tree-sitter-cli/dsl" />
// @ts-check

const PREC = {
  DO_BLOCK: -1,
  MODIFIER: 1,
  AND_OR: 2,
  NOT: 3,
  DEFINED: 4,
  ASSIGN: 10,
  RESCUE: 11,
  CONDITIONAL: 20,
  RANGE: 25,
  OR: 30,
  AND: 35,
  EQUALITY: 40,
  COMPARE: 45,
  BIT_OR: 50,
  BIT_AND: 55,
  SHIFT: 60,
  ADD: 65,
  MULTIPLY: 70,
  UNARY_MINUS: 75,
  POWER: 80,
  UNARY: 85,
  CALL: 90,
  // A method name followed by something that may start an argument or
  // continue an expression (`foo -1`, `foo *a`, `foo /re/`): an argument.
  COMMAND: 95,
  CURLY_BLOCK: 100,
};

// Lexical precedences. Operators and immediate tokens outrank the bare
// prefix operators (`-`, `*`, `&`, ...), symbols and character literals that
// can start at the same place; string contents outrank comments.
const OP = 2;
const STR = 3;
const NL = 10;

const imm = s => token.immediate(prec(OP, s));
const op = s => alias(token(prec(OP, s)), s);
const immOp = s => alias(imm(s), s);

const ID_START = String.raw`[a-z_]|[^\x00-\x7f]`;
const ID_CHAR = String.raw`[a-zA-Z0-9_]|[^\x00-\x7f]`;
const IDENT = `(${ID_START})(${ID_CHAR})*`;
const CONST = `[A-Z](${ID_CHAR})*`;
const ANY_IDENT = `([a-zA-Z_]|[^\\x00-\\x7f])(${ID_CHAR})*`;

const KEYWORDS = [
  'alias', 'and', 'begin', 'break', 'case', 'class', 'def', 'do', 'else',
  'elsif', 'end', 'ensure', 'false', 'for', 'if', 'in', 'module', 'next',
  'nil', 'not', 'or', 'redo', 'rescue', 'retry', 'return', 'self', 'super',
  'then', 'true', 'undef', 'unless', 'until', 'when', 'while', 'yield',
  '__FILE__', '__LINE__', '__ENCODING__', 'BEGIN', 'END',
];

// Method names that are operators: `def +(other)`, `a.==(b)`, `:<=>`.
const OPERATOR_METHODS = [
  '..', '|', '^', '&', '<=>', '==', '===', '=~', '>', '>=', '<', '<=', '+',
  '-', '*', '/', '%', '!', '!~', '**', '<<', '>>', '~', '+@', '-@', '~@',
  '[]', '[]=', '`', '!=',
];

// Global variables: `$foo`, `$0`, `$1`, `$-w`, and the punctuation ones.
const GLOBAL = String.raw`\$(${ANY_IDENT}|-[a-zA-Z0-9_]|[0-9]+|[!@&\x60'+~=\/\\,;.<>*$?:"_])`;

// Escapes in double-quoted strings, backticks, symbols and heredocs.
const ESCAPE = String.raw`\\(u\{[0-9a-fA-F \t]*\}|u[0-9a-fA-F]{4}|x[0-9a-fA-F]{1,2}|[0-7]{1,3}|[CM]-(\\[CM]-)*(\\.|.)|c(\\.|.)|\r?\n|.)`;

// Percent literals: `%w[...]`, `%q{...}`, `%r|...|`. Brackets nest; other
// delimiters end at the first unescaped copy.
const BRACKETS = { '(': ')', '[': ']', '{': '}', '<': '>' };
const DELIMITERS = ['(', '[', '{', '<', '|', '!', '"', "'", '/', '-', '^', ':'];
const DELIMITER_NAMES = {
  '(': 'paren', '[': 'bracket', '{': 'brace', '<': 'angle', '|': 'pipe',
  '!': 'bang', '"': 'dquote', "'": 'squote', '/': 'slash', '-': 'dash',
  '^': 'caret', ':': 'colon',
};
// `%(...)` without a letter only takes these, so that `x %-1` and the like
// stay operators.
const PLAIN_PERCENT_DELIMITERS = ['(', '[', '{', '<', '|', '!'];

// A method call without parentheses: the method, then `args`. After the
// method, an operator with space before and none after (`foo -1`, `foo *a`,
// `foo &b`, `foo /re/`, `foo ::A`) starts an argument.
function commandHead($, wrap) {
  const args = field('arguments', alias($.command_argument_list, $.argument_list));
  return choice(
    prec(PREC.COMMAND, wrap(seq($._call, args))),
    prec(PREC.COMMAND, wrap(seq(
      field('receiver', $._primary),
      choice(immOp('::'), '::'),
      field('method', $.constant),
      args,
    ))),
    prec(PREC.COMMAND, wrap(seq(field('method', choice($.identifier, $._function_identifier, $.constant, $.super)), args))),
  );
}

// Heredocs
// --------
//
// A heredoc's body starts on the line after `<<~EOS`, after the rest of that
// line, and ends at a line that is `EOS`. Without a scanner the lexer cannot
// remember the delimiter or that a body is due, so:
//
// - The parser remembers that a body is due. Each rule that can hold a
//   `heredoc_beginning` before the end of its line has a variant, named with
//   `_h`, that does (`withHeredocVariants` derives them). Where a line can
//   end (after a statement, after a `,` in a list, after `do |x|`), the
//   variant is followed by the `heredoc_body` token, which is valid nowhere
//   else.
// - The body is one token, from the newline before it to the newline after
//   the delimiter line. It ends at the first line that is the delimiter of one of three
//   families, and the longest match wins:
//   - the words in HEREDOC_WORDS (those used in ruby/ruby): at their last
//     line before a line that holds anything like the start of another
//     heredoc (`<<ID`, `<<~"ID"`). That line stops the body, which keeps
//     each body to its own lines, and the lexer's work linear;
//   - any other delimiter: the first line that is a single word (or `{#`
//     or `};`).
//   Two heredocs on one line (`foo(<<~A, <<~B)`) are one token when the
//   second ends with a word in HEREDOC_WORDS.

const HEREDOC_WORDS = [
  // Single letters, common in specs: `<<-G`, `<<~L`.
  ...'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  'RUBY', 'EOS', 'END', 'EOM', 'EOF', 'CODE', 'End', 'INPUT', 'EOY', 'YAML',
  'MSG', 'EXPECTED', 'STR', 'TABLE', 'DEPEND', 'SRC', 'HERE', 'EXP', 'WARNING',
  'JSON', 'TEXT', 'LOCKFILE', 'HEREDOC', 'END_OF_CODE', 'ERROR', 'RULES',
  'EOT', 'EOC', 'GEMSPEC', 'MESSAGE', 'OUTPUT', 'STUB', 'DOC', 'RAKEFILE',
  'CONFIG', 'H1', 'H2', 'ERR', 'HELP', 'MAKEFILE', '__EOC__', 'POWERSHELL',
  'RESPONSE', 'XML', 'SOURCE', 'MAKE', 'SPEC', 'EO_CMAKE', 'PREP', 'FOO',
  'INNER', 'SCRIPT', 'TOML', '__HEREDOC', 'SH', 'EXTCONF', 'EOYAML', 'EORB',
  'PREPARE', 'EOL', 'METHOD', 'ERB', 'DESC', 'VERSIONS', 'DUMP', '__EOS__',
  'EOE', 'PRE', '__EOM__', 'EOD', 'EOH', 'EOB', 'USAGE', 'SQL', 'HTML', 'CSS',
  'JS', 'SHELL', 'BASH', 'TEMPLATE', 'BODY', 'DATA', 'TEST', 'ACTUAL',
  'CERT', 'KEY', 'PKEY',
  'ruby', 'eoyml', 'eoprobe', 'eom', 'eoruby', 'eoyaml', 'eot', 'eos', 'eodoc',
  'end;', 'begin;', 'do;', 'else;', 'END;', '{#', '};',
];

// A line (without its newline) with nothing like a heredoc start in it:
// no `<<` followed by an optional `~` or `-`, an optional quote and a
// letter. Built from the five-state automaton that finds one: `X` keeps it
// at the start, `<` and what may follow move it on.
const HEREDOC_LINE_PARTS = (() => {
  const X = String.raw`[^<\r\n]`;
  const T = String.raw`[~\-]`;
  const Q = String.raw`['"\x60]`;
  const R = [
    String.raw`[^<\r\n~\-'"\x60A-Za-z_]`,
    `${T}${Q}${String.raw`[^<\r\nA-Za-z_]`}`,
    `${T}${String.raw`[^<\r\n'"\x60A-Za-z_]`}`,
    `${Q}${String.raw`[^<\r\nA-Za-z_]`}`,
  ].join('|');
  const loop = `(<+(${T}${Q}?|${Q})<)*`;
  // After a `<`, back to the start.
  const A = `${loop}(${X}|<+(${R}))`;
  // A line ending part way through a possible start.
  const tail1 = `<${loop}(<+${T}?${Q}?)?`;
  const line = `(${X}|<${A})*(${tail1})?`;
  // A non-empty line whose first character is in [^<\r\n] minus `except`.
  const startingWith = except => `([^<\\r\\n${except}]${line}|<${A}${line}|${tail1})`;
  return { line, startingWith };
})();

const HEREDOC_LINE = HEREDOC_LINE_PARTS.line;

const HEREDOC_BODY = (() => {
  const { line, startingWith } = HEREDOC_LINE_PARTS;
  const nl = String.raw`\r?\n`;
  // The delimiter line includes its newline, so that a word cannot end the
  // body part way through a line (`A` in `Array(x)`).
  const words = `[ \\t]*(${HEREDOC_WORDS.map(escapeRegExp).join('|')})${nl}`;
  // The other family: lines that are not a single word (and, as above, hold
  // no heredoc start), nor `{#` or `};`, and the single-word lines.
  const wordEnd = String.raw`[ \t]*[A-Za-z_][A-Za-z0-9_]*;?\r?\n`;
  const wordLine = '[ \\t]*(' + [
    startingWith('A-Za-z_{} \\t'),
    `[A-Za-z_][A-Za-z0-9_]*(;${startingWith('')}|${startingWith('A-Za-z0-9_;')})`,
    `\\{(${startingWith('#')}|#${startingWith('')})?`,
    `\\}(${startingWith(';')}|;${startingWith('')})?`,
  ].join('|') + ')?';
  return `${nl}((${line}${nl})*${words}|(${wordLine}${nl})*${wordEnd})`;
})();

// Rules with a variant (`name_h`) that holds a heredoc whose body has not
// started yet. The variant of a rule is the rule with one of its parts
// replaced by that part's variant; parts after it may hold more heredocs
// where they repeat (`foo(<<~A, <<~B)`). Some are written by hand.
const HEREDOC_RULES = [
  '_statements', '_block_statements', '_statement', 'if_modifier',
  'unless_modifier', 'while_modifier', 'until_modifier', 'rescue_modifier',
  '_expression', 'command_binary', 'command_unary', 'command_assignment',
  'command_operator_assignment', '_command_value', 'command_call',
  'command_argument_list', '_trailing_command', '_command_argument',
  'return_command', 'break_command', 'next_command', 'yield_command',
  'rescue_modifier_expression', '_arg', 'assignment', 'operator_assignment',
  'right_assignment_list', 'conditional', 'binary', 'unary', '_primary',
  '_lhs', '_call', 'call', 'argument_list', '_argument_list_contents',
  '_argument', 'splat_argument', 'hash_splat_argument', 'pair', 'array',
  '_element', 'hash', '_hash_item', 'string', '_dq_piece', 'interpolation',
  'parenthesized_statements', 'element_reference', 'block', 'lambda',
];
// Lists whose variants `listRules` writes.
const HEREDOC_LISTS = ['_command_list', '_argument_list', '_element_list', '_hash_item_list'];
const HEREDOC_SET = new Set([...HEREDOC_RULES, ...HEREDOC_LISTS]);

const HEREDOC_MANUAL = {
  // Inside `#{...}`, `(...)` and `{...}` on the line: a single statement.
  _statements: $ => $._statement_h,
  _block_statements: $ => $._statement_h,
  _primary: $ => choice(heredocVariant($, PRIMARY_RULE($)), $.heredoc_beginning),
};
let PRIMARY_RULE;

function withHeredocVariants(rules) {
  PRIMARY_RULE = rules._primary;
  const variants = {};
  for (const name of HEREDOC_RULES) {
    variants[`${name}_h`] = HEREDOC_MANUAL[name] ?? ($ => {
      const rule = heredocVariant($, rules[name]($));
      if (!rule) throw new Error(`no heredoc variant for ${name}`);
      return rule;
    });
  }
  return { ...rules, ...variants };
}

// The variant of a rule, or null if it cannot hold a heredoc.
function heredocVariant($, rule, inAlias = false) {
  const any = r => {
    const h = heredocVariant($, r);
    return h ? choice(r, h) : r;
  };
  switch (rule.type) {
    case 'SYMBOL': {
      if (!HEREDOC_SET.has(rule.name)) return null;
      const h = $[`${rule.name}_h`];
      return rule.name.startsWith('_') || inAlias ? h : alias(h, $[rule.name]);
    }
    case 'SEQ': {
      const alternatives = [];
      rule.members.forEach((member, i) => {
        const h = heredocVariant($, member);
        if (!h) return;
        const rest = rule.members.slice(i + 1).map(m =>
          m.type === 'REPEAT' || m.type === 'REPEAT1' ? { ...m, content: any(m.content) } : m);
        alternatives.push(seq(...rule.members.slice(0, i), h, ...rest));
      });
      return alternatives.length ? choice(...alternatives) : null;
    }
    case 'CHOICE': {
      const alternatives = rule.members.map(m => heredocVariant($, m)).filter(Boolean);
      return alternatives.length ? choice(...alternatives) : null;
    }
    case 'REPEAT': {
      const h = heredocVariant($, rule.content);
      return h ? seq(repeat(rule.content), h, repeat(any(rule.content))) : null;
    }
    case 'REPEAT1':
      return heredocVariant($, seq(rule.content, repeat(rule.content)));
    case 'FIELD': {
      const h = heredocVariant($, rule.content);
      return h ? field(rule.name, h) : null;
    }
    case 'ALIAS': {
      const h = heredocVariant($, rule.content, true);
      return h ? { ...rule, content: h } : null;
    }
    case 'PREC':
    case 'PREC_LEFT':
    case 'PREC_RIGHT':
    case 'PREC_DYNAMIC': {
      const h = heredocVariant($, rule.content);
      return h ? { ...rule, content: h } : null;
    }
    default:
      return null;
  }
}

// Rules for a comma-separated list, `name`, in which a heredoc's body may
// start after an element that begins one: after its comma (`[<<~A,`, then
// the body, then more elements), or before the closing bracket. `final` is
// another choice for the last element. The list's heredoc variant, for a
// list whose line ends after it, is written here too. The repetitions are
// left-recursive rules, which keep the parse stack short in long lists.
function listRules(name, element, { trailingComma, final }) {
  const items = `${name}_items`;
  const tail = `${name}_tail`;
  const parts = $ => {
    const e = element($);
    const h = heredocVariant($, e);
    // Before the closing bracket. A command's arguments have none: there
    // the body comes after the statement.
    const one = trailingComma ? choice(e, seq(h, $.heredoc_body)) : e;
    return { e, h, one };
  };
  return {
    [name]: $ => {
      const { one } = parts($);
      const last = final ? choice(one, final($)) : one;
      return prec.right(choice(
        seq(optional($[items]), last),
        ...(trailingComma ? [$[items]] : []),
      ));
    },
    // Elements, each followed by its comma (and maybe a heredoc's body).
    [items]: $ => {
      const { h, one } = parts($);
      const item = choice(seq(one, ','), seq(h, ',', $.heredoc_body));
      return prec.right(choice(item, seq($[items], item)));
    },
    [`${name}_h`]: $ => {
      const { h } = parts($);
      const finalH = final ? heredocVariant($, final($)) : null;
      return prec.right(choice(
        seq(optional($[items]), h, optional($[tail])),
        ...(finalH ? [seq(optional($[items]), finalH)] : []),
      ));
    },
    // After an element that begins a heredoc, the rest of the line.
    [tail]: $ => {
      const { e, h } = parts($);
      const more = [e, h, ...(final ? [final($), heredocVariant($, final($))].filter(Boolean) : [])];
      return prec.right(choice(seq(",", choice(...more)), seq($[tail], ",", choice(...more))));
    },
  };
}

// A condition and `then` or a newline, or a condition that starts a heredoc
// and the heredoc's body: `if try_compile(<<SRC)`.
function conditionThen($) {
  return choice(
    seq(field('condition', $._statement), $._then),
    seq(field('condition', $._statement_h), $.heredoc_body),
  );
}

function escapeRegExp(s) {
  return s.replace(/[.*+?^${}()|[\]\\\/-]/g, '\\$&');
}

function commaSep1(rule) {
  return seq(rule, repeat(seq(',', rule)));
}

function commaSep(rule) {
  return optional(commaSep1(rule));
}

module.exports = grammar({
  name: 'ruby',

  word: $ => $.identifier,

  extras: $ => [
    $.comment,
    /\s/,
    $._line_continuation,
    $.uninterpreted,
  ],

  supertypes: $ => [$._statement, $._expression, $._arg, $._primary, $._pattern],

  conflicts: $ => [
    // `[*a, b]` and `[*, b, *]` differ only at the end.
    [$._pattern, $._find_pattern_body],
  ],

  rules: withHeredocVariants({
    program: $ => optional($._statements),

    // Statements
    // ----------

    // Statements separated by newlines or `;`. The last needs no terminator.
    _statements: $ => choice(
      seq(
        repeat1(choice(seq($._statement, $._terminator), $._heredoc_statement, $._terminator)),
        optional($._statement),
      ),
      $._statement,
    ),

    // A statement on a line that started a heredoc, then the body. The body
    // starts with the newline that ends the statement.
    _heredoc_statement: $ => seq($._statement_h, $.heredoc_body),

    // Statements that do not start with a terminator: after `{`, a newline
    // is not a terminator, so `|params|` may be on the next line.
    _block_statements: $ => choice(
      seq($._statement, optional(seq($._terminator, optional($._statements)))),
      seq(';', optional($._statements)),
      seq($._heredoc_statement, optional($._statements)),
    ),

    _terminator: $ => choice($._newline, ';'),

    // A newline and the next line's indentation. It outranks every token
    // that could start after it, and includes the indentation, so that while
    // looking for a `_leading_dot` the lexer always has a newline to fall
    // back on, rather than reading the whitespace as part of a later token.
    _newline: _ => token(prec(NL, /\r?\n[ \t]*/)),

    _line_continuation: _ => /\\\r?\n/,

    _statement: $ => choice(
      $.undef,
      $.alias,
      $.if_modifier,
      $.unless_modifier,
      $.while_modifier,
      $.until_modifier,
      $.rescue_modifier,
      $.begin_block,
      $.end_block,
      $._expression,
    ),

    begin_block: $ => seq('BEGIN', '{', optional($._statements), '}'),
    end_block: $ => seq('END', '{', optional($._statements), '}'),

    if_modifier: $ => prec.left(PREC.MODIFIER, seq(
      field('body', $._statement), 'if', field('condition', $._expression),
    )),
    unless_modifier: $ => prec.left(PREC.MODIFIER, seq(
      field('body', $._statement), 'unless', field('condition', $._expression),
    )),
    while_modifier: $ => prec.left(PREC.MODIFIER, seq(
      field('body', $._statement), 'while', field('condition', $._expression),
    )),
    until_modifier: $ => prec.left(PREC.MODIFIER, seq(
      field('body', $._statement), 'until', field('condition', $._expression),
    )),
    rescue_modifier: $ => prec.left(PREC.MODIFIER, seq(
      field('body', $._statement), 'rescue', field('handler', $._expression),
    )),

    undef: $ => seq('undef', commaSep1($._method_name)),

    alias: $ => seq('alias', field('name', $._method_name), field('alias', $._method_name)),

    // Expressions
    // -----------

    _expression: $ => choice(
      alias($.command_binary, $.binary),
      alias($.command_unary, $.unary),
      alias($.command_assignment, $.assignment),
      alias($.command_operator_assignment, $.operator_assignment),
      alias($.command_call, $.call),
      alias($.command_call_with_block, $.call),
      alias($.return_command, $.return),
      alias($.break_command, $.break),
      alias($.next_command, $.next),
      alias($.yield_command, $.yield),
      $.match_pattern,
      $.test_pattern,
      $.if,
      $.unless,
      $.while,
      $.until,
      alias($._beginless_range, $.range),
      $._arg,
    ),

    command_binary: $ => prec.left(PREC.AND_OR, seq(
      field('left', $._expression),
      field('operator', choice('and', 'or')),
      field('right', $._expression),
    )),

    command_unary: $ => choice(
      prec(PREC.NOT, seq(field('operator', 'not'), field('operand', $._expression))),
      seq(field('operator', '!'), field('operand', alias($.command_call, $.call))),
    ),

    command_assignment: $ => prec.right(PREC.ASSIGN, seq(
      field('left', choice($._lhs, $.left_assignment_list)),
      '=',
      field('right', $._command_value),
    )),

    command_operator_assignment: $ => prec.right(PREC.ASSIGN, seq(
      field('left', $._lhs),
      field('operator', $._assignment_operator),
      field('right', $._command_value),
    )),

    // The right side of an assignment that is not an argument: `x = foo bar`,
    // `x = if a then b end`.
    _command_value: $ => choice(
      alias($.command_call, $.call),
      alias($.command_call_with_block, $.call),
      alias($.command_assignment, $.assignment),
      alias($.command_operator_assignment, $.operator_assignment),
      alias($.yield_command, $.yield),
      $.if,
      $.unless,
      $.while,
      $.until,
      alias($._beginless_range, $.range),
    ),

    // `x = foo rescue nil` rescues the right side only.
    rescue_modifier_expression: $ => prec(PREC.RESCUE, seq(
      field('body', $._arg), 'rescue', field('handler', $._arg),
    )),

    return_command: $ => prec.right(PREC.COMMAND, seq('return', alias($.command_argument_list, $.argument_list))),
    break_command: $ => prec.right(PREC.COMMAND, seq('break', alias($.command_argument_list, $.argument_list))),
    next_command: $ => prec.right(PREC.COMMAND, seq('next', alias($.command_argument_list, $.argument_list))),
    yield_command: $ => prec.right(PREC.COMMAND, seq('yield', alias($.command_argument_list, $.argument_list))),

    // `expr => pattern` and `expr in pattern`
    match_pattern: $ => prec(PREC.CONDITIONAL, seq(
      field('value', $._arg), op('=>'), field('pattern', $._pattern_top),
    )),
    test_pattern: $ => prec(PREC.CONDITIONAL, seq(
      field('value', $._arg), 'in', field('pattern', $._pattern_top),
    )),

    // A method call without parentheses: `puts a, b`, `foo.bar x`.
    command_call: $ => commandHead($, args => prec.right(seq(args))),

    command_call_with_block: $ => choice(
      commandHead($, args => prec.right(seq(args, field('block', $.do_block)))),
      // `foo <<~EOS do |x|`: the heredoc body comes before the block's.
      prec.right(seq(
        heredocVariant($, commandHead($, args => args)),
        field('block', alias($._heredoc_do_block, $.do_block)),
      )),
    ),

    // The last argument may be a command itself: `puts foo bar`.
    command_argument_list: $ => $._command_list,

    ...listRules('_command_list', $ => $._command_argument, { trailingComma: false, final: $ => $._trailing_command }),

    _trailing_command: $ => choice(alias($.command_call, $.call), alias($.yield_command, $.yield)),

    // Arguments
    // ---------

    _arg: $ => choice(
      $._primary,
      $.assignment,
      $.operator_assignment,
      $.conditional,
      $.range,
      $.binary,
      $.unary,
    ),

    assignment: $ => prec.right(PREC.ASSIGN, seq(
      field('left', choice($._lhs, $.left_assignment_list)),
      '=',
      field('right', choice(
        $._arg,
        $.splat_argument,
        $.right_assignment_list,
        alias($.rescue_modifier_expression, $.rescue_modifier),
      )),
    )),

    operator_assignment: $ => prec.right(PREC.ASSIGN, seq(
      field('left', $._lhs),
      field('operator', $._assignment_operator),
      field('right', choice($._arg, alias($.rescue_modifier_expression, $.rescue_modifier))),
    )),

    _assignment_operator: _ => choice(
      op('+='), op('-='), op('*='), op('**='), op('/='), op('%='), op('||='),
      op('&&='), op('|='), op('&='), op('^='), op('<<='), op('>>='),
    ),

    right_assignment_list: $ => prec.right(-1, seq(
      choice($._arg, $.splat_argument),
      repeat1(seq(',', choice($._arg, $.splat_argument))),
    )),

    left_assignment_list: $ => choice($._mlhs, $.rest_assignment, $.destructured_left_assignment),

    _mlhs: $ => prec.left(-1, seq(
      choice($._lhs, $.rest_assignment, $.destructured_left_assignment),
      choice(
        ',',
        repeat1(seq(',', choice($._lhs, $.rest_assignment, $.destructured_left_assignment))),
      ),
      optional(','),
    )),

    destructured_left_assignment: $ => prec(-1, seq('(', choice($._mlhs, $._lhs, $.rest_assignment), ')')),

    rest_assignment: $ => prec(-1, seq('*', optional($._lhs))),

    conditional: $ => prec.right(PREC.CONDITIONAL, seq(
      field('condition', $._arg),
      '?',
      field('consequence', $._arg),
      choice(':', immOp(':')),
      field('alternative', $._arg),
    )),

    range: $ => {
      const operator = field('operator', choice('..', '...'));
      return choice(
        prec.left(PREC.RANGE, seq(field('begin', $._arg), operator, field('end', $._arg))),
        prec.right(PREC.RANGE, seq(field('begin', $._arg), operator)),
      );
    },

    _beginless_range: $ => prec.right(PREC.RANGE, seq(field('operator', choice('..', '...')), field('end', $._arg))),

    binary: $ => {
      const table = [
        [prec.left, PREC.OR, op('||')],
        [prec.left, PREC.AND, op('&&')],
        [prec.left, PREC.EQUALITY, choice(op('=='), op('!='), op('==='), op('<=>'), op('=~'), op('!~'))],
        [prec.left, PREC.COMPARE, choice(op('<'), op('<='), op('>'), op('>='))],
        [prec.left, PREC.BIT_OR, choice(op('|'), op('^'))],
        [prec.left, PREC.BIT_AND, $._binary_amp],
        [prec.left, PREC.SHIFT, choice(op('<<'), op('>>'))],
        [prec.left, PREC.ADD, choice($._binary_plus, $._binary_minus)],
        [prec.left, PREC.MULTIPLY, choice($._binary_star, $._binary_slash, '%')],
        [prec.right, PREC.POWER, $._binary_star_star],
      ];
      // The right side may be an `if`: `message << if x then a else b end`.
      return choice(...table.map(([fn, p, operator]) => fn(p, seq(
        field('left', $._arg),
        field('operator', operator),
        field('right', choice($._arg, $.if, $.unless)),
      ))));
    },

    // Operators that can also start an argument. Directly after the left
    // side (`a-1`) or with space on both sides (`a - 1`) they are binary.
    // With space before and none after (`a -1`) they are the plain token,
    // which after a method name starts an argument: `foo -1`, `foo *args`,
    // `foo &blk`, `foo /re/`.
    _binary_minus: _ => choice(immOp('-'), alias(token(prec(OP, /-[ \t\r\n]/)), '-'), '-'),
    _binary_plus: _ => choice(immOp('+'), alias(token(prec(OP, /\+[ \t\r\n]/)), '+'), '+'),
    _binary_star: _ => choice(immOp('*'), alias(token(prec(OP, /\*[ \t\r\n]/)), '*'), '*'),
    _binary_star_star: _ => choice(immOp('**'), alias(token(prec(OP, /\*\*[ \t\r\n]/)), '**'), '**'),
    _binary_amp: _ => choice(immOp('&'), alias(token(prec(OP, /&[ \t\r\n]/)), '&'), '&'),
    _binary_slash: _ => choice(immOp('/'), alias(token(prec(OP, /\/[ \t\r\n]/)), '/'), '/'),

    unary: $ => choice(
      prec(PREC.DEFINED, seq(field('operator', 'defined?'), field('operand', $._arg))),
      prec.right(PREC.UNARY_MINUS, seq(field('operator', choice('-', '+')), field('operand', $._arg))),
      prec.right(PREC.UNARY, seq(field('operator', choice('!', '~')), field('operand', $._arg))),
    ),

    // Primaries
    // ---------

    _primary: $ => choice(
      $.parenthesized_statements,
      $._lhs,
      $._function_identifier,
      $.call,
      $.array,
      $.string_array,
      $.symbol_array,
      $.hash,
      $.subshell,
      $.simple_symbol,
      $.delimited_symbol,
      $.integer,
      $.float,
      $.rational,
      $.complex,
      $.string,
      $.character,
      $.chained_string,
      $.regex,
      $.lambda,
      $.method,
      $.singleton_method,
      $.class,
      $.singleton_class,
      $.module,
      $.begin,
      $.for,
      $.case,
      $.case_match,
      $.return,
      $.yield,
      $.break,
      $.next,
      $.redo,
      $.retry,
      $.file,
      $.line,
      $.encoding,
    ),

    parenthesized_statements: $ => seq('(', optional($._statements), ')'),

    _lhs: $ => prec.left(choice(
      $._variable,
      $.true,
      $.false,
      $.nil,
      $.scope_resolution,
      $.element_reference,
      alias($._call, $.call),
    )),

    _variable: $ => choice(
      $.self,
      $.instance_variable,
      $.class_variable,
      $.global_variable,
      $.identifier,
      $.constant,
      $.super,
    ),

    // `A::B`, and `::B` at the top level. Only the latter can start an
    // argument (`foo ::B`), so it takes `::` after a space only.
    scope_resolution: $ => choice(
      prec.left(PREC.CALL + 1, seq(field('scope', $._primary), choice(immOp('::'), '::'), field('name', $.constant))),
      prec.left(PREC.CALL + 1, seq('::', field('name', $.constant))),
    ),

    element_reference: $ => prec.left(PREC.CALL + 1, seq(
      field('object', $._primary),
      alias(imm('['), '['),
      optional($._argument_list_contents),
      ']',
    )),

    // `foo?` and `foo!`
    // One token, so `x.nil?` works although `nil` is a keyword. `a!=b`
    // without spaces is `a!` and `=b`.
    _function_identifier: $ => alias(token(new RegExp(`${IDENT}[?!]`)), $.identifier),

    // `a.b`, `a&.b`, `A::b`, and on a new line `.b`
    _call: $ => prec.left(PREC.CALL, seq(
      field('receiver', $._primary),
      choice(
        seq(
          field('operator', choice('.', op('&.'), alias($._leading_dot, '.'), alias($._leading_safe_dot, '&.'))),
          field('method', choice(
            $.identifier, $._function_identifier, $.constant, $.operator,
            $._keyword_identifier,
          )),
        ),
        seq(
          field('operator', choice(immOp('::'), '::')),
          field('method', choice($.identifier, $._function_identifier)),
        ),
      ),
    )),

    // A newline (and blank lines) before `.` or `&.`
    _leading_dot: _ => token(prec(NL + 1, /\r?\n[ \t\r\n]*\./)),
    _leading_safe_dot: _ => token(prec(NL + 1, /\r?\n[ \t\r\n]*&\./)),

    _keyword_identifier: $ => alias(choice(...KEYWORDS), $.identifier),

    call: $ => {
      const args = field('arguments', $.argument_list);
      const callee = choice(
        $._call,
        field('method', choice($.identifier, $._function_identifier, $.constant, $.super)),
        prec(PREC.CALL + 2, seq(
          field('receiver', $._primary),
          choice(immOp('::'), '::'),
          field('method', $.constant),
        )),
      );
      // `a.()`
      const dotCall = prec(PREC.CALL, seq(field('receiver', $._primary), choice('.', op('&.')), args));
      const withArgs = choice(prec(PREC.CALL, seq(callee, args)), dotCall);
      return choice(
        withArgs,
        prec(PREC.CURLY_BLOCK, seq(choice(callee, withArgs), field('block', $.block))),
        prec(PREC.DO_BLOCK, seq(choice(callee, withArgs), field('block', $.do_block))),
        prec(PREC.DO_BLOCK, seq(heredocVariant($, withArgs), field('block', alias($._heredoc_do_block, $.do_block)))),
      );
    },

    argument_list: $ => seq(
      alias(imm('('), '('),
      optional($._argument_list_contents),
      ')',
    ),

    _argument_list_contents: $ => $._argument_list,

    // In parentheses and brackets, an argument may also start with `..` or
    // be an `if`: `a[..2]`, `assert(if x then y end)`.
    // `foo(...)`, and a command as the last argument: `foo(bar baz)`.
    ...listRules('_argument_list', $ => $._argument, {
      trailingComma: true,
      final: $ => choice($.forward_argument, $._trailing_command),
    }),

    _argument: $ => choice($._command_argument, alias($._beginless_range, $.range), $.if, $.unless),

    _command_argument: $ => choice(
      $._arg,
      $.splat_argument,
      $.hash_splat_argument,
      $.block_argument,
      $.pair,
    ),

    forward_argument: _ => '...',

    splat_argument: $ => prec.right(PREC.COMMAND, seq('*', optional($._arg))),
    hash_splat_argument: $ => prec.right(PREC.COMMAND, seq('**', optional($._arg))),
    block_argument: $ => prec.right(PREC.COMMAND, seq('&', optional($._arg))),

    // Blocks
    // ------

    block: $ => prec(PREC.CURLY_BLOCK, seq(
      $._block_open,
      optional(field('parameters', $.block_parameters)),
      optional(field('body', alias($._block_statements, $.block_body))),
      '}',
    )),

    // `|params|` may be on the line after `do`.
    do_block: $ => seq(
      'do',
      optional(seq(optional($._terminator), field('parameters', $.block_parameters))),
      optional(field('body', $.body_statement)),
      'end',
    ),

    // After a method name, `{` could start a block or a hash argument. These
    // rules make the parser decide at the `{`, for the block, as Ruby does.
    _block_open: _ => prec(1, '{'),
    _hash_open: _ => '{',

    block_parameters: $ => choice(
      op('||'),
      seq(
        op('|'),
        optional(seq(commaSep1($._block_parameter), optional(','))),
        optional(seq(';', commaSep1(field('locals', $.identifier)))),
        op('|'),
      ),
    ),

    // In `|a = 1|` and `|a: 1|`, a default value ends before a `|`.
    _block_parameter: $ => choice(
      $.identifier,
      $.splat_parameter,
      $.hash_splat_parameter,
      $.hash_splat_nil,
      $.forward_parameter,
      $.block_parameter,
      $.destructured_parameter,
      alias($._block_optional_parameter, $.optional_parameter),
      alias($._block_keyword_parameter, $.keyword_parameter),
    ),

    _block_optional_parameter: $ => prec(PREC.BIT_OR + 1, seq(
      field('name', $.identifier), '=', field('value', $._arg),
    )),

    _block_keyword_parameter: $ => prec.right(PREC.BIT_OR + 1, seq(
      field('name', $.identifier),
      immOp(':'),
      optional(field('value', $._arg)),
    )),

    destructured_parameter: $ => seq('(', commaSep1($._parameter), optional(','), ')'),

    lambda: $ => seq(
      '->',
      optional(field('parameters', choice(
        alias($.parameters, $.lambda_parameters),
        alias($._bare_parameters, $.lambda_parameters),
      ))),
      field('body', choice($.block, $.do_block)),
    ),

    // Definitions
    // -----------

    method: $ => seq('def', $._method_rest),

    singleton_method: $ => seq(
      'def',
      field('object', choice($._variable, $.nil, $.true, $.false, seq('(', $._arg, ')'))),
      choice('.', '::'),
      $._method_rest,
    ),

    _method_rest: $ => {
      const name = field('name', $._method_definition_name);
      const params = field('parameters', $.parameters);
      const endless = seq('=', field('body', choice($._arg, alias($.rescue_modifier_expression, $.rescue_modifier), $._command_value)));
      return choice(
        seq(name, choice(
          params,
          seq(optional(field('parameters', alias($._bare_parameters, $.method_parameters))), $._terminator),
        ), optional(field('body', $.body_statement)), 'end'),
        seq(name, optional(params), endless),
      );
    },

    _method_definition_name: $ => choice(
      $.identifier,
      $._function_identifier,
      $.constant,
      alias($._setter_name, $.setter),
      $.operator,
      $._keyword_identifier,
    ),

    _setter_name: $ => seq(field('name', choice($.identifier, $.constant)), alias(imm('='), '=')),

    operator: _ => choice(...OPERATOR_METHODS.map(s => s === '[]' || s === '[]=' ? s : op(s))),

    _method_name: $ => choice(
      $.identifier,
      $._function_identifier,
      $.constant,
      alias($._setter_name, $.setter),
      $.simple_symbol,
      $.delimited_symbol,
      $.operator,
      $.global_variable,
      $._keyword_identifier,
    ),

    parameters: $ => prec(1, seq(
      choice(alias(imm('('), '('), '('),
      optional(seq(commaSep1($._parameter), optional(','))),
      ')',
    )),

    _bare_parameters: $ => prec.right(commaSep1($._parameter)),

    _parameter: $ => choice(
      $.identifier,
      $.optional_parameter,
      $.splat_parameter,
      $.hash_splat_parameter,
      $.hash_splat_nil,
      $.forward_parameter,
      $.block_parameter,
      $.keyword_parameter,
      $.destructured_parameter,
    ),

    optional_parameter: $ => prec(PREC.ASSIGN, seq(
      field('name', $.identifier), '=', field('value', $._arg),
    )),

    splat_parameter: $ => seq('*', optional(field('name', $.identifier))),
    hash_splat_parameter: $ => seq('**', optional(field('name', $.identifier))),
    hash_splat_nil: $ => seq('**', 'nil'),
    forward_parameter: _ => '...',
    block_parameter: $ => seq('&', optional(field('name', $.identifier))),

    keyword_parameter: $ => prec.right(PREC.ASSIGN, seq(
      field('name', $.identifier),
      immOp(':'),
      optional(field('value', $._arg)),
    )),

    class: $ => seq(
      'class',
      field('name', choice($.constant, $.scope_resolution)),
      optional(field('superclass', $.superclass)),
      $._terminator,
      optional(field('body', $.body_statement)),
      'end',
    ),

    superclass: $ => seq('<', $._expression),

    singleton_class: $ => seq(
      'class',
      '<<',
      field('value', $._arg),
      $._terminator,
      optional(field('body', $.body_statement)),
      'end',
    ),

    module: $ => seq(
      'module',
      field('name', choice($.constant, $.scope_resolution)),
      choice(
        seq($._terminator, optional(field('body', $.body_statement)), 'end'),
        'end',
      ),
    ),

    body_statement: $ => choice(
      seq(
        $._statements,
        repeat(choice($.rescue, $.else, $.ensure)),
      ),
      repeat1(choice($.rescue, $.else, $.ensure)),
    ),

    rescue: $ => seq(
      'rescue',
      optional(field('exceptions', $.exceptions)),
      optional(field('variable', $.exception_variable)),
      choice($._terminator, seq(optional($._terminator), 'then')),
      optional(field('body', alias($._statements, $.then))),
    ),

    exceptions: $ => commaSep1(choice($._arg, $.splat_argument)),

    exception_variable: $ => seq(op('=>'), $._lhs),

    ensure: $ => seq('ensure', optional($._statements)),

    else: $ => seq('else', optional($._statements)),

    // Control flow
    // ------------

    begin: $ => seq('begin', optional($.body_statement), 'end'),

    _then: $ => choice(
      $._terminator,
      seq(optional($._terminator), 'then'),
    ),

    then: $ => $._statements,

    if: $ => seq(
      'if',
      conditionThen($),
      optional(field('consequence', $.then)),
      optional(field('alternative', choice($.else, $.elsif))),
      'end',
    ),

    unless: $ => seq(
      'unless',
      conditionThen($),
      optional(field('consequence', $.then)),
      optional(field('alternative', $.else)),
      'end',
    ),

    elsif: $ => seq(
      'elsif',
      conditionThen($),
      optional(field('consequence', $.then)),
      optional(field('alternative', choice($.else, $.elsif))),
    ),

    while: $ => seq(
      'while',
      choice(
        seq(field('condition', $._statement), field('body', $.do)),
        seq(field('condition', $._statement_h), $.heredoc_body, field('body', alias($._heredoc_do, $.do))),
      ),
    ),

    until: $ => seq(
      'until',
      choice(
        seq(field('condition', $._statement), field('body', $.do)),
        seq(field('condition', $._statement_h), $.heredoc_body, field('body', alias($._heredoc_do, $.do))),
      ),
    ),

    for: $ => seq(
      'for',
      field('pattern', choice($._lhs, $.left_assignment_list)),
      'in',
      field('value', $._statement),
      field('body', $.do),
    ),

    // The body of a loop whose condition started a heredoc.
    _heredoc_do: $ => seq(optional($._statements), 'end'),

    do: $ => seq(
      choice($._terminator, seq(optional($._terminator), 'do')),
      optional($._statements),
      'end',
    ),

    case: $ => seq(
      'case',
      optional(field('value', $._statement)),
      repeat($._terminator),
      repeat1($.when),
      optional($.else),
      'end',
    ),

    when: $ => seq(
      'when',
      commaSep1(field('pattern', choice($._arg, $.splat_argument))),
      $._then,
      optional(field('body', $.then)),
    ),

    case_match: $ => seq(
      'case',
      field('value', $._statement),
      repeat($._terminator),
      repeat1(field('clauses', $.in_clause)),
      optional(field('else', $.else)),
      'end',
    ),

    in_clause: $ => seq(
      'in',
      field('pattern', $._pattern_top),
      optional(field('guard', choice($.if_guard, $.unless_guard))),
      $._then,
      optional(field('body', $.then)),
    ),

    if_guard: $ => seq('if', field('condition', $._expression)),
    unless_guard: $ => seq('unless', field('condition', $._expression)),

    return: _ => prec.left('return'),
    yield: $ => prec.left(seq('yield', optional(field('arguments', $.argument_list)))),
    break: _ => prec.left('break'),
    next: _ => prec.left('next'),
    redo: _ => 'redo',
    retry: _ => 'retry',

    // Patterns
    // --------

    // The pattern after `in` or `=>`, where an array or hash pattern needs no
    // brackets: `in a, *rest`, `in {x:}`, `in x: Integer`.
    _pattern_top: $ => choice(
      $._pattern_expr,
      alias($._array_pattern_body, $.array_pattern),
      alias($._find_pattern_body, $.find_pattern),
      alias($._hash_pattern_body, $.hash_pattern),
    ),

    _pattern: $ => choice($._pattern_expr, $.splat_parameter),

    _pattern_expr: $ => choice($.as_pattern, $._pattern_expr_alt),

    as_pattern: $ => seq(field('value', $._pattern_expr), op('=>'), field('name', $.identifier)),

    _pattern_expr_alt: $ => choice($.alternative_pattern, $._pattern_expr_basic),

    alternative_pattern: $ => seq(
      field('alternatives', $._pattern_expr_basic),
      repeat1(seq(op('|'), field('alternatives', $._pattern_expr_basic))),
    ),

    _pattern_expr_basic: $ => choice(
      $._pattern_value,
      $.identifier,
      $.array_pattern,
      $.find_pattern,
      $.hash_pattern,
      $.parenthesized_pattern,
    ),

    parenthesized_pattern: $ => seq('(', $._pattern_expr, ')'),

    _pattern_value: $ => choice(
      $._pattern_primitive,
      alias($._pattern_range, $.range),
      $.variable_reference_pattern,
      $.expression_reference_pattern,
      $._pattern_constant,
    ),

    _pattern_primitive: $ => choice(
      $.integer, $.float, $.rational, $.complex, $.string, $.character,
      $.chained_string, $.simple_symbol, $.delimited_symbol, $.regex,
      $.string_array, $.symbol_array, $.subshell, $.lambda, $.nil, $.true,
      $.false, $.self, $.file, $.line, $.encoding,
      alias($._pattern_unary_minus, $.unary),
    ),

    _pattern_unary_minus: $ => seq(field('operator', '-'), field('operand', choice($.integer, $.float, $.rational, $.complex))),

    _pattern_range: $ => {
      const operator = field('operator', choice('..', '...'));
      return choice(
        seq(field('begin', $._pattern_primitive), operator, field('end', $._pattern_primitive)),
        seq(operator, field('end', $._pattern_primitive)),
        prec(-1, seq(field('begin', $._pattern_primitive), operator)),
      );
    },

    variable_reference_pattern: $ => seq('^', field('name', choice(
      $.identifier, $.instance_variable, $.class_variable, $.global_variable,
    ))),

    expression_reference_pattern: $ => seq('^', '(', field('value', $._expression), ')'),

    _pattern_constant: $ => choice(
      $.constant,
      alias($._pattern_constant_resolution, $.scope_resolution),
    ),

    _pattern_constant_resolution: $ => seq(
      optional(field('scope', $._pattern_constant)),
      choice(immOp('::'), '::'),
      field('name', $.constant),
    ),

    array_pattern: $ => choice(
      seq('[', optional($._array_pattern_elements), ']'),
      seq(field('class', $._pattern_constant), alias(imm('['), '['), optional($._array_pattern_elements), ']'),
      seq(field('class', $._pattern_constant), alias(imm('('), '('), optional($._array_pattern_elements), ')'),
    ),

    _array_pattern_elements: $ => seq(commaSep1($._pattern), optional(',')),

    // Without brackets, after `in` or `=>`: `in a, b`, `in a,`, `in *rest`.
    _array_pattern_body: $ => choice(
      prec.right(seq($._pattern, repeat1(seq(',', optional($._pattern))))),
      $.splat_parameter,
    ),

    find_pattern: $ => choice(
      seq('[', $._find_pattern_body, ']'),
      seq(field('class', $._pattern_constant), alias(imm('('), '('), $._find_pattern_body, ')'),
      seq(field('class', $._pattern_constant), alias(imm('['), '['), $._find_pattern_body, ']'),
    ),

    _find_pattern_body: $ => seq(
      $.splat_parameter,
      repeat1(seq(',', $._pattern_expr)),
      ',',
      $.splat_parameter,
    ),

    hash_pattern: $ => choice(
      seq('{', optional($._hash_pattern_body), '}'),
      seq(field('class', $._pattern_constant), alias(imm('['), '['), $._hash_pattern_body, ']'),
      seq(field('class', $._pattern_constant), alias(imm('('), '('), $._hash_pattern_body, ')'),
    ),

    _hash_pattern_body: $ => prec.right(choice(
      seq(commaSep1($.keyword_pattern), optional(',')),
      seq(commaSep1($.keyword_pattern), ',', $._hash_pattern_any_rest),
      $._hash_pattern_any_rest,
    )),

    keyword_pattern: $ => prec.right(seq(
      choice(
        seq(field('key', choice($._label_name, $.string)), immOp(':')),
        field('key', alias($._keyword_label, $.hash_key_symbol)),
      ),
      optional(field('value', $._pattern_expr)),
    )),

    _hash_pattern_any_rest: $ => choice($.hash_splat_parameter, $.hash_splat_nil),

    // Collections
    // -----------

    array: $ => seq('[', optional($._element_list), ']'),

    ...listRules('_element_list', $ => $._element, { trailingComma: true }),

    _element: $ => choice($._arg, alias($._beginless_range, $.range), $.splat_argument, $.pair, $.hash_splat_argument),

    hash: $ => seq($._hash_open, optional($._hash_item_list), '}'),

    ...listRules('_hash_item_list', $ => $._hash_item, { trailingComma: true }),

    _hash_item: $ => choice($.pair, $.hash_splat_argument),

    pair: $ => choice(
      prec.right(1, seq(field('key', $._arg), op('=>'), field('value', $._arg))),
      prec.right(seq(
        choice(
          seq(field('key', $._label_name), immOp(':')),
          field('key', alias($._keyword_label, $.hash_key_symbol)),
        ),
        optional(field('value', $._arg)),
      )),
      // `"key": value` and `key?: value`. In `a ? b "c": d`, the `:` is the
      // conditional's.
      prec.right(-1, seq(
        field('key', choice($.string, $._function_label_name)),
        immOp(':'),
        optional(field('value', $._arg)),
      )),
    ),

    // Aliased one by one, so that the key is a single node.
    _label_name: $ => prec(-1, choice(alias($.identifier, $.hash_key_symbol), alias($.constant, $.hash_key_symbol))),

    _function_label_name: $ => prec(-1, alias(token(new RegExp(`${IDENT}[?!]`)), $.hash_key_symbol)),

    // A keyword followed by `:` is one token, so that `foo if: x` and
    // `foo if x` differ at the keyword.
    _keyword_label: _ => token(choice(...KEYWORDS.map(k => k + ':'))),

    // Literals
    // --------

    self: _ => 'self',
    super: _ => 'super',
    true: _ => 'true',
    false: _ => 'false',
    nil: _ => 'nil',
    file: _ => '__FILE__',
    line: _ => '__LINE__',
    encoding: _ => '__ENCODING__',

    identifier: _ => new RegExp(IDENT),
    constant: _ => new RegExp(CONST),
    instance_variable: _ => new RegExp(`@${ANY_IDENT}`),
    class_variable: _ => new RegExp(`@@${ANY_IDENT}`),
    global_variable: _ => new RegExp(GLOBAL),

    integer: _ => /-?(0[bB][01](_?[01])*|0[oO_]?[0-7](_?[0-7])*|0[dD][0-9](_?[0-9])*|0[xX][0-9a-fA-F](_?[0-9a-fA-F])*|[1-9](_?[0-9])*|0)/,
    float: _ => /-?([0-9](_?[0-9])*(\.[0-9](_?[0-9])*([eE][+-]?[0-9](_?[0-9])*)?|[eE][+-]?[0-9](_?[0-9])*))/,
    rational: _ => /-?(([0-9](_?[0-9])*(\.[0-9](_?[0-9])*)?|0[bB][01](_?[01])*|0[oO_]?[0-7](_?[0-7])*|0[dD][0-9](_?[0-9])*|0[xX][0-9a-fA-F](_?[0-9a-fA-F])*)r)/,
    complex: _ => /-?(([0-9](_?[0-9])*(\.[0-9](_?[0-9])*([eE][+-]?[0-9](_?[0-9])*)?|[eE][+-]?[0-9](_?[0-9])*)?|0[bB][01](_?[01])*|0[oO_]?[0-7](_?[0-7])*|0[dD][0-9](_?[0-9])*|0[xX][0-9a-fA-F](_?[0-9a-fA-F])*)r?i)/,

    // `?a`, `?\n`, `?\C-a`
    character: _ => new RegExp(String.raw`\?([^\s\\]|${ESCAPE.slice(0)})`),

    comment: _ => token(choice(
      /#[^\r\n]*/,
      /=begin([ \t][^\r\n]*)?\r?\n([^=\r\n][^\r\n]*\r?\n|=([^e\r\n][^\r\n]*)?\r?\n|=e([^n\r\n][^\r\n]*)?\r?\n|=en([^d\r\n][^\r\n]*)?\r?\n|=end[^ \t\r\n][^\r\n]*\r?\n|\r?\n)*=end([ \t][^\r\n]*)?/,
    )),

    // Everything after `__END__`.
    uninterpreted: _ => token(prec(1, /__END__(\r?\n(.|\r?\n)*)?/)),

    // Strings
    // -------

    chained_string: $ => seq($.string, repeat1($.string)),

    string: $ => choice(
      seq('"', repeat($._dq_piece), alias(imm('"'), '"')),
      seq("'", repeat($._sq_piece), alias(imm("'"), "'")),
      ...['Q', ''].flatMap(kind => (kind ? DELIMITERS : PLAIN_PERCENT_DELIMITERS).map(d =>
        $[`_percent_${kind}_string_${DELIMITER_NAMES[d]}`])),
      ...DELIMITERS.map(d => $[`_percent_q_string_${DELIMITER_NAMES[d]}`]),
    ),

    _dq_piece: $ => choice(
      alias($._dq_content, $.string_content),
      $.escape_sequence,
      $.interpolation,
      alias($._hash_content, $.string_content),
    ),

    _sq_piece: $ => choice(
      alias($._sq_content, $.string_content),
      alias($._sq_escape, $.escape_sequence),
    ),

    // Contents stop at every `#`, which is a token of its own when it does
    // not start an interpolation. A content token that could read `#` and
    // then stop would let the lexer find a comment after a space instead.
    _dq_content: _ => token.immediate(prec(STR, /[^"\\#]+/)),
    _sq_content: _ => token.immediate(prec(STR, /([^'\\]|\\[^'\\])+/)),
    _sq_escape: _ => token.immediate(prec(STR, /\\['\\]/)),

    // A `#` that does not start an interpolation.
    _hash_content: _ => token.immediate(prec(STR, '#')),

    escape_sequence: _ => token.immediate(prec(STR, new RegExp(ESCAPE))),

    interpolation: $ => choice(
      seq(alias(token.immediate(prec(STR, '#{')), '#{'), optional($._statements), '}'),
      seq(alias($._hash_content, '#'), $._short_interpolation_variable),
    ),

    // An interpolation that starts a word in `%W[...]` or `%I[...]`.
    // Below the immediate `#{`, so that `%W[a#{b}]` is one word.
    _word_interpolation: $ => seq(alias(token(prec(1, '#{')), '#{'), optional($._statements), '}'),

    // `#@a`, `#@@a`, `#$a`
    _short_interpolation_variable: $ => choice(
      alias(token.immediate(prec(STR + 1, new RegExp(`@${ANY_IDENT}`))), $.instance_variable),
      alias(token.immediate(prec(STR + 1, new RegExp(`@@${ANY_IDENT}`))), $.class_variable),
      alias(token.immediate(prec(STR + 1, new RegExp(GLOBAL))), $.global_variable),
    ),

    subshell: $ => choice(
      seq('`', repeat(choice(
        alias($._backtick_content, $.string_content),
        $.escape_sequence,
        $.interpolation,
        alias($._hash_content, $.string_content),
      )), alias(imm('`'), '`')),
      ...DELIMITERS.map(d => $[`_percent_x_string_${DELIMITER_NAMES[d]}`]),
    ),

    _backtick_content: _ => token.immediate(prec(STR, /[^`\\#]+/)),

    // `:a`, `:a?`, `:@a`, `:$a`, `:+`, and `:a=` (two tokens, so that
    // `:a=>1` is `:a` and `=>`).
    simple_symbol: $ => choice($._simple_symbol, seq($._simple_symbol, alias(imm('='), '='))),

    _simple_symbol: _ => token(new RegExp(
      `:(${ANY_IDENT}[?!]?|@@?${ANY_IDENT}|${GLOBAL}|` +
      OPERATOR_METHODS.filter(s => s !== '..').map(escapeRegExp).join('|') + ')',
    )),

    delimited_symbol: $ => choice(
      seq(':"', repeat($._dq_piece), alias(imm('"'), '"')),
      seq(":'", repeat($._sq_piece), alias(imm("'"), "'")),
      ...DELIMITERS.map(d => $[`_percent_s_string_${DELIMITER_NAMES[d]}`]),
    ),

    regex: $ => choice(
      seq('/', repeat($._regex_piece), alias($._regex_end, '/')),
      ...DELIMITERS.map(d => $[`_percent_r_string_${DELIMITER_NAMES[d]}`]),
    ),

    _regex_piece: $ => choice(
      alias($._regex_content, $.string_content),
      $.interpolation,
      alias($._hash_content, $.string_content),
    ),

    _regex_content: _ => token.immediate(prec(STR, /([^/\\#]|\\(.|\r?\n))+/)),
    _regex_end: _ => token.immediate(prec(STR, /\/[a-z]*/)),

    string_array: $ => choice(
      ...['w', 'W'].flatMap(kind => DELIMITERS.map(d => $[`_percent_${kind}_array_${DELIMITER_NAMES[d]}`])),
    ),

    symbol_array: $ => choice(
      ...['i', 'I'].flatMap(kind => DELIMITERS.map(d => $[`_percent_${kind}_array_${DELIMITER_NAMES[d]}`])),
    ),

    ...percentLiteralRules(),

    // Heredocs
    // --------

    // As an operator `<<` would win, so `foo <<~EOS` needs the same precedence.
    heredoc_beginning: _ => token(prec(OP, /<<[~-]?([a-zA-Z_][a-zA-Z0-9_]*|'[^'\r\n]*'|"[^"\r\n]*"|`[^`\r\n]*`)/)),

    heredoc_body: _ => token(prec(NL + 2, new RegExp(HEREDOC_BODY))),

    // A do-block opened on a line that started a heredoc: the body comes
    // first. `foo(<<~EOS) do |x|`
    _heredoc_do_block: $ => seq(
      'do',
      optional(field('parameters', $.block_parameters)),
      $.heredoc_body,
      optional(field('body', $.body_statement)),
      'end',
    ),
  }),
});

// Rules for percent literals. Each kind and delimiter is a rule of its own,
// since the contents end at a different character. For a bracket delimiter,
// a nested pair (`%w[a [b] c]`) is part of the contents.
function percentLiteralRules() {
  const rules = {};
  const kinds = {
    // kind: [interpolates, words, node for words]
    '': [true, false],
    Q: [true, false],
    q: [false, false],
    s: [false, false],
    r: [true, false],
    x: [true, false],
    w: [false, true, 'bare_string'],
    W: [true, true, 'bare_string'],
    i: [false, true, 'bare_symbol'],
    I: [true, true, 'bare_symbol'],
  };
  for (const d of DELIMITERS) {
    const close = BRACKETS[d] ?? d;
    const name = DELIMITER_NAMES[d];
    const nests = d in BRACKETS;
    const ex = escapeRegExp(d) + (nests ? escapeRegExp(close) : '');
    for (const interp of [false, true]) {
      const tag = `${name}_${interp ? 'i' : 'n'}`;
      // Contents of a string-like literal.
      const special = interp ? `\\\\#${ex}` : `\\\\${ex}`;
      // As in double-quoted strings, interpolating contents stop at `#`.
      const text = interp ? `[^${special}]+` : `([^${special}]|\\\\[^\\\\${ex}])+`;
      rules[`_pct_text_${tag}`] = _ => token.immediate(prec(STR, new RegExp(text)));
      // Contents of a word in a word list: no whitespace.
      const wspecial = special + '\\s';
      const wtext = interp ? `[^${wspecial}]+` : `([^${wspecial}]|\\\\[^\\\\${ex}\\s])+`;
      rules[`_pct_word_text_${tag}`] = _ => token.immediate(prec(STR, new RegExp(wtext)));
      rules[`_pct_word_start_${tag}`] = _ => token(prec(STR, new RegExp(wtext)));
      const esc = interp ? ESCAPE : `\\\\[\\\\${ex}\\s]`;
      if (!interp) {
        rules[`_pct_escape_${tag}`] = _ => token.immediate(prec(STR, new RegExp(esc)));
      }
      rules[`_pct_word_escape_start_${tag}`] = _ => token(prec(STR, new RegExp(esc)));
      // Pieces of a string-like literal, and a nested bracket pair.
      rules[`_pct_piece_${tag}`] = $ => choice(
        alias($[`_pct_text_${tag}`], $.string_content),
        interp ? $.escape_sequence : alias($[`_pct_escape_${tag}`], $.escape_sequence),
        ...(interp ? [$.interpolation, alias($._hash_content, $.string_content)] : []),
        ...(nests ? [$[`_pct_nested_${tag}`]] : []),
      );
      if (nests) {
        rules[`_pct_nested_${tag}`] = $ => seq(
          alias(token.immediate(prec(STR, d)), $.string_content),
          repeat($[`_pct_piece_${tag}`]),
          alias(token.immediate(prec(STR, close)), $.string_content),
        );
      }
      // A word: pieces with nothing between them. The first piece follows
      // whitespace or the opening delimiter.
      rules[`_pct_word_${tag}`] = $ => prec.right(seq(
        choice(
          alias($[`_pct_word_start_${tag}`], $.string_content),
          alias($[`_pct_word_escape_start_${tag}`], $.escape_sequence),
          ...(interp ? [alias($._word_interpolation, $.interpolation)] : []),
          ...(nests ? [$[`_pct_word_nested_start_${tag}`]] : []),
        ),
        repeat($[`_pct_word_piece_${tag}`]),
      ));
      // Pieces of a word.
      rules[`_pct_word_piece_${tag}`] = $ => choice(
        alias($[`_pct_word_text_${tag}`], $.string_content),
        interp ? $.escape_sequence : alias($[`_pct_escape_${tag}`], $.escape_sequence),
        ...(interp ? [$.interpolation, alias($._hash_content, $.string_content)] : []),
        ...(nests ? [$[`_pct_word_nested_${tag}`]] : []),
      );
      if (nests) {
        // `%w[[a] b]`: a word that starts with a nested pair.
        rules[`_pct_word_nested_start_${tag}`] = $ => seq(
          alias(token(prec(STR, d)), $.string_content),
          repeat($[`_pct_word_piece_${tag}`]),
          alias(token.immediate(prec(STR, close)), $.string_content),
        );
        rules[`_pct_word_nested_${tag}`] = $ => seq(
          alias(token.immediate(prec(STR, d)), $.string_content),
          repeat($[`_pct_word_piece_${tag}`]),
          alias(token.immediate(prec(STR, close)), $.string_content),
        );
      }
    }
  }
  for (const [kind, [interp, words, wordNode]] of Object.entries(kinds)) {
    for (const d of DELIMITERS) {
      if (kind === '' && !PLAIN_PERCENT_DELIMITERS.includes(d)) continue;
      const close = BRACKETS[d] ?? d;
      const name = DELIMITER_NAMES[d];
      const tag = `${name}_${interp ? 'i' : 'n'}`;
      const open = `%${kind}${d}`;
      const mk = words ? (r => token(prec(STR, r))) : (r => token.immediate(prec(STR, r)));
      const end = kind === 'r'
        ? alias(mk(new RegExp(escapeRegExp(close) + '[a-z]*')), close)
        : alias(mk(close), close);
      const ruleName = `_percent_${kind}_${words ? 'array' : 'string'}_${name}`;
      if (words) {
        rules[ruleName] = $ => seq(
          open,
          repeat(alias($[`_pct_word_${tag}`], $[wordNode])),
          end,
        );
      } else {
        rules[ruleName] = $ => seq(
          open,
          repeat($[`_pct_piece_${tag}`]),
          end,
        );
      }
    }
  }
  return rules;
}
