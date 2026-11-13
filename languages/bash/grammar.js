/**
 * @file Bash grammar for tree-sitter
 * @license MIT
 *
 * Bash 5.2, with no external scanner:
 *
 * - Words are concatenations of pieces (`a"b"$c`). A piece that directly
 *   follows another is an immediate token, so `a "b"` is two words and
 *   `a"b"` one.
 * - Newlines are terminators where a command may end and whitespace
 *   elsewhere, so `a &&\n b` and `if a\nthen` need nothing special.
 * - At the start of a command, an identifier is its own token. Followed by
 *   `=`, `+=` or `[` it starts an assignment, otherwise it is the command
 *   name: `a=1` assigns and `a =1` runs `a`. Command words never look like
 *   the start of an assignment.
 * - Heredoc bodies start at the end of the line holding `<<WORD`. The rest of
 *   that line (more words, redirects, `| cmd`, `&& cmd`, `; cmd`) is parsed
 *   inside the `heredoc_redirect`, so the parser knows a body comes next. A
 *   regular grammar cannot match the closing delimiter to its opener, so
 *   common delimiters (`EOF`, `EOT`, `END`, ...) each get their own tokens and
 *   end only at themselves; a body with any other delimiter ends at the first
 *   line shaped like one. See README.md.
 */

/// <reference types="tree-sitter-cli/dsl" />
// @ts-check

// Characters that end an unquoted word. Backtick is \x60.
const SPECIAL = String.raw`\s'"\x60$\\|&;()<>`;
const ESCAPE = String.raw`\\[^\r\n]`;
// An extended glob, `@(a|b)`, `!(*.txt)`, without nesting.
const EXTGLOB = String.raw`[?*+@!]\(([^()\s'"\x60]|"[^"\r\n]*"|'[^'\r\n]*')*\)`;

const WORD_UNIT = `[^${SPECIAL}]|${ESCAPE}|${EXTGLOB}`;
// `#` starts a comment at the start of a word.
const WORD_FIRST = `[^${SPECIAL}#]|${ESCAPE}|${EXTGLOB}`;

// The right side of `=~`. Parentheses group, may nest twice and may contain
// spaces. `$` is text when it ends the regex or comes before `|` or `)`.
const REGEX_GROUP_UNIT = String.raw`[^()\\\r\n]|\\[^\r\n]`;
const REGEX_GROUP = String.raw`\((${REGEX_GROUP_UNIT}|\((${REGEX_GROUP_UNIT})*\))*\)`;
const REGEX = String.raw`([^\s'"\x60$\\()]|\\[^\r\n]|\$[|)]|${REGEX_GROUP})+\$?`;

// Heredoc delimiters that are matched exactly: the body ends at a line that
// is the delimiter. Other delimiters fall into two families whose bodies end
// at the first line shaped like a delimiter of that family; see README.md.
// Each word costs about 170 parser states.
const HEREDOC_WORDS = ['EOF', 'EOT', 'END', 'EOM', 'EOL', 'eof'];
const HEREDOC_FAMILIES = [...HEREDOC_WORDS.map((_, i) => i), 'upper', 'lower'];

// The general family: a line with an upper-case letter and no lower-case
// ones (`END_HELP`, `---EOF---`), or with at least two upper-case letters
// (`EoHEADER`).
const HEREDOC_END = [
  String.raw`[A-Z0-9_.\-]*[A-Z][A-Z0-9_.\-]*`,
  String.raw`[A-Za-z0-9_.\-]*[A-Z][A-Za-z0-9_.\-]*[A-Z][A-Za-z0-9_.\-]*`,
].join('|');
// Lower-case delimiters (`<<cmake`): a line that is a lower-case word.
const HEREDOC_LOWER_END = String.raw`[a-z_][a-z0-9_]*`;

const HEREDOC_DELIMITER_UNIT = String.raw`[^\s'"\;&|<>()\x60]`;
const HEREDOC_QUOTED_UNIT = String.raw`"[^"\r\n]*"|'[^'\r\n]*'|\\[^\s]`;

function escapeRegExp(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

const IDENT = '[A-Za-z_][A-Za-z0-9_]*';

// A word at the start of a command that is not an identifier and does not
// begin like an assignment (`name=`, `name+=`, `name[`). An identifier there
// is the `_identifier` token, and the parser decides what it is.
const CMD_WORD = [
  // starts with something other than a letter or `_`
  `([^${SPECIAL}#A-Za-z_]|${ESCAPE}|${EXTGLOB})(${WORD_UNIT})*`,
  // a name, then neither a name character nor `=`, `+` or `[`
  `${IDENT}([^${SPECIAL}A-Za-z0-9_=+\\[]|${ESCAPE}|[?*@!]\\(([^()\\s'"\\x60]|"[^"\\r\\n]*"|'[^'\\r\\n]*')*\\))(${WORD_UNIT})*`,
  // a name and `+`, then not `=`: `g++`, `c++filt`
  `${IDENT}\\+([^${SPECIAL}=]|${ESCAPE}|${EXTGLOB})(${WORD_UNIT})*`,
].map(re => `(${re})`).join('|');

// Precedences. Immediate tokens that only follow an identifier (`=`, `+=`,
// `[`) outrank immediate word text, which outranks a comment.
const IMM_PREC = 1;
const NAME_PREC = 2;
const ASSIGN_PREC = 3;

const PREC = {
  list: 1,
  not: 2,
  pipe: 3,
  // test expressions
  test_or: 1,
  test_and: 2,
  test_not: 3,
  test_compare: 4,
  test_unary: 5,
};

const ARITH = {
  comma: 1,
  assign: 2,
  ternary: 3,
  or: 4,
  and: 5,
  bitor: 6,
  bitxor: 7,
  bitand: 8,
  equality: 9,
  compare: 10,
  shift: 11,
  add: 12,
  multiply: 13,
  power: 14,
  unary: 15,
  postfix: 16,
};

// Reserved words that start a command. Followed by `=` they are names:
// `select=1`, `function=$1`. (Words that end a block, like `fi`, cannot be:
// the parser would need to look two tokens ahead.)
const RESERVED = [
  'if', 'for', 'select', 'while', 'until', 'case', 'function',
  'declare', 'typeset', 'export', 'readonly', 'local', 'unset', 'unsetenv',
];

const imm = s => token.immediate(prec(ASSIGN_PREC, s));

module.exports = grammar({
  name: 'bash',

  extras: $ => [$.comment, /\s/, $._line_continuation],

  supertypes: $ => [$._expression, $._arithmetic_expression, $._primary_expression],

  rules: {
    program: $ => optional($._statements),

    // Statements, the last of which needs no terminator: the program, `( )`,
    // `$( )` and backticks.
    _statements: $ => choice(
      seq(repeat1(seq($._statement, $._terminator)), optional($._statement)),
      $._statement,
    ),

    // Statements that each end with a terminator, as before `then`, `do`,
    // `fi`, `done`, `esac` and `}`. Requiring it keeps those keywords from
    // being read as arguments: `if echo then; then`.
    _terminated_statements: $ => repeat1(seq($._statement, $._terminator)),

    _terminator: $ => choice(';', '&', $._newline),

    _newline: _ => /\r?\n/,

    _statement: $ => choice(
      $.command,
      $._command_prefix,
      $.declaration_command,
      $.unset_command,
      $.redirected_statement,
      $.function_definition,
      $.compound_statement,
      $.subshell,
      $.if_statement,
      $.while_statement,
      $.for_statement,
      $.c_style_for_statement,
      $.case_statement,
      $.test_command,
      $.arithmetic_command,
      $.pipeline,
      $.list,
      $.negated_command,
    ),

    // Commands that may be followed by redirects as a whole.
    _compound_command: $ => choice(
      $.compound_statement,
      $.subshell,
      $.if_statement,
      $.while_statement,
      $.for_statement,
      $.c_style_for_statement,
      $.case_statement,
      $.test_command,
      $.arithmetic_command,
    ),

    // a && b, a || b
    list: $ => prec.left(PREC.list, seq(
      $._statement,
      choice('&&', '||'),
      $._statement,
    )),

    // a | b |& c
    pipeline: $ => prec.right(PREC.pipe, seq(
      $._statement,
      choice('|', '|&'),
      $._statement,
    )),

    negated_command: $ => prec.right(PREC.not, seq('!', $._statement)),

    // Simple commands
    // ---------------

    command: $ => prec.left(seq(
      optional($._command_prefix),
      field('name', $.command_name),
      repeat(choice(
        field('argument', $._literal),
        field('redirect', $._redirect),
      )),
    )),

    command_name: $ => $._command_literal,

    // Assignments and redirects before the command name. Without a command
    // they are a statement of their own: `a=1 b=2`, `> file`. Both uses share
    // this rule, so the parser decides only when it sees what follows.
    _command_prefix: $ => repeat1(choice($.variable_assignment, $._redirect)),

    variable_assignment: $ => seq(
      field('name', choice(
        alias($._identifier, $.variable_name),
        ...RESERVED.map(w => alias(w, $.variable_name)),
        $.subscript,
      )),
      choice(imm('='), imm('+=')),
      optional(field('value', choice($._immediate_literal, $.array))),
    ),

    subscript: $ => seq(
      field('name', alias($._identifier, $.variable_name)),
      imm('['),
      repeat(field('index', $._subscript_piece)),
      ']',
    ),

    _subscript_piece: $ => choice(
      alias($._subscript_text, $.word),
      alias('$', $.word),
      $.string,
      $.raw_string,
      $.simple_expansion,
      $.expansion,
      $.command_substitution,
      $.arithmetic_expansion,
    ),

    _subscript_text: _ => token.immediate(prec(IMM_PREC, /([^\]$"'\x60\\]|\\(.|\r?\n))+/)),

    array: $ => seq(
      token.immediate('('),
      repeat($._literal),
      ')',
    ),

    // declare, typeset, export, readonly, local
    declaration_command: $ => prec.left(seq(
      choice('declare', 'typeset', 'export', 'readonly', 'local'),
      repeat(choice(
        prec(1, alias($._identifier, $.variable_name)),
        ...RESERVED.map(w => prec(1, alias(w, $.variable_name))),
        $.variable_assignment,
        $._command_literal,
        field('redirect', $._redirect),
      )),
    )),

    unset_command: $ => prec.left(seq(
      choice('unset', 'unsetenv'),
      repeat(choice(
        prec(1, alias($._identifier, $.variable_name)),
        ...RESERVED.map(w => prec(1, alias(w, $.variable_name))),
        $.subscript,
        $._command_literal,
        field('redirect', $._redirect),
      )),
    )),

    // Compound commands
    // -----------------

    redirected_statement: $ => prec.left(seq(
      field('body', choice($._compound_command, $.function_definition)),
      repeat1(field('redirect', $._redirect)),
    )),

    compound_statement: $ => seq('{', optional($._terminated_statements), '}'),

    subshell: $ => seq('(', optional($._statements), ')'),

    if_statement: $ => seq(
      'if',
      field('condition', $._terminated_statements),
      'then',
      optional($._terminated_statements),
      repeat($.elif_clause),
      optional($.else_clause),
      'fi',
    ),

    elif_clause: $ => seq(
      'elif',
      field('condition', $._terminated_statements),
      'then',
      optional($._terminated_statements),
    ),

    else_clause: $ => seq('else', optional($._terminated_statements)),

    while_statement: $ => seq(
      choice('while', 'until'),
      field('condition', $._terminated_statements),
      field('body', $.do_group),
    ),

    do_group: $ => seq('do', optional($._terminated_statements), 'done'),

    // for x in a b; do ...; done
    // for x; do ...; done
    // select x in a b; do ...; done
    for_statement: $ => seq(
      choice('for', 'select'),
      field('variable', alias($._identifier, $.variable_name)),
      choice(
        seq('in', repeat(field('value', $._literal)), $._terminator),
        optional($._terminator),
      ),
      field('body', choice($.do_group, $.compound_statement)),
    ),

    // for ((i = 0; i < n; i++)); do ...; done
    c_style_for_statement: $ => seq(
      'for',
      '((',
      optional(field('initializer', $._arithmetic_expression)),
      choice(';', $._newline),
      optional(field('condition', $._arithmetic_expression)),
      choice(';', $._newline),
      optional(field('update', $._arithmetic_expression)),
      ')',
      token.immediate(')'),
      optional($._terminator),
      field('body', choice($.do_group, $.compound_statement)),
    ),

    case_statement: $ => seq(
      'case',
      field('value', $._literal),
      optional($._terminator),
      'in',
      repeat($.case_item),
      optional(alias($._last_case_item, $.case_item)),
      'esac',
    ),

    case_item: $ => seq(
      $._case_patterns,
      repeat(seq($._statement, $._terminator)),
      optional($._statement),
      field('termination', choice(';;', ';&', ';;&')),
    ),

    // The last item may leave out `;;`, but then its statements end with a
    // terminator before `esac`.
    _last_case_item: $ => seq(
      $._case_patterns,
      repeat(seq($._statement, $._terminator)),
    ),

    _case_patterns: $ => seq(
      optional('('),
      field('value', $._literal),
      repeat(seq('|', field('value', $._literal))),
      ')',
    ),

    // foo() { ...; }
    // function foo { ...; }
    // function foo() { ...; }
    function_definition: $ => prec.right(seq(
      choice(
        seq(
          'function',
          field('name', alias($._command_word_token, $.word)),
          optional(seq('(', ')')),
        ),
        seq(
          field('name', alias($._command_word_token, $.word)),
          '(',
          ')',
        ),
      ),
      field('body', $._compound_command),
    )),

    _command_word_token: $ => choice($._identifier, $._command_word),

    // [[ expression ]]
    test_command: $ => seq('[[', $._expression, ']]'),

    // (( expression ))
    arithmetic_command: $ => seq(
      '((',
      $._arithmetic_expression,
      ')',
      token.immediate(')'),
    ),

    // Test expressions
    // ----------------

    _expression: $ => choice(
      $._literal,
      $.unary_expression,
      $.binary_expression,
      $.parenthesized_expression,
    ),

    unary_expression: $ => choice(
      prec(PREC.test_unary, seq(field('operator', $.test_operator), $._expression)),
      prec.right(PREC.test_not, seq(field('operator', '!'), $._expression)),
    ),

    binary_expression: $ => choice(
      prec.left(PREC.test_or, seq(
        field('left', $._expression),
        field('operator', '||'),
        field('right', $._expression),
      )),
      prec.left(PREC.test_and, seq(
        field('left', $._expression),
        field('operator', '&&'),
        field('right', $._expression),
      )),
      // The right side of a comparison is a word, so `[[ $a = -x ]]` compares
      // with the word `-x`.
      prec.left(PREC.test_compare, seq(
        field('left', $._literal),
        field('operator', choice('==', '=', '!=', '<', '>', $.test_operator)),
        field('right', $._literal),
      )),
      prec.left(PREC.test_compare, seq(
        field('left', $._literal),
        field('operator', '=~'),
        field('right', $._regex_literal),
      )),
    ),

    parenthesized_expression: $ => seq('(', $._expression, ')'),

    // -f, -eq, -nt, ...
    test_operator: _ => token(prec(IMM_PREC, /-[A-Za-z]+/)),

    // The right side of `=~`: regex text, quoted strings and expansions.
    _regex_literal: $ => choice(
      $._regex_piece,
      alias($._regex_concatenation, $.concatenation),
    ),

    _regex_concatenation: $ => prec.left(seq(
      $._regex_piece,
      repeat1(choice(
        alias($._immediate_regex, $.regex),
        $._immediate_primary,
      )),
    )),

    _regex_piece: $ => choice(
      $.regex,
      $.string,
      $.raw_string,
      $.ansi_c_string,
      $.simple_expansion,
      $.expansion,
      $.command_substitution,
    ),

    // Regex text may contain `|` and `$`, and spaces inside parentheses, as
    // bash allows: `^(a|b c)$`.
    regex: _ => new RegExp(REGEX),
    _immediate_regex: _ => token.immediate(prec(IMM_PREC, new RegExp(REGEX))),

    // Arithmetic
    // ----------

    _arithmetic_expression: $ => choice(
      $.number,
      alias($._arithmetic_concatenation, $.concatenation),
      $.translated_string,
      $.raw_string,
      alias($._identifier, $.variable_name),
      $.subscript,
      $.simple_expansion,
      $.expansion,
      $.command_substitution,
      $.arithmetic_expansion,
      $.string,
      alias($._arithmetic_binary, $.binary_expression),
      alias($._arithmetic_expanded_operator, $.binary_expression),
      alias($._arithmetic_unary, $.unary_expression),
      alias($._arithmetic_postfix, $.postfix_expression),
      alias($._arithmetic_ternary, $.ternary_expression),
      alias($._arithmetic_parenthesized, $.parenthesized_expression),
    ),

    _arithmetic_binary: $ => {
      const table = [
        [prec.left, ARITH.comma, ','],
        [prec.right, ARITH.assign, choice('=', '*=', '/=', '%=', '+=', '-=', '<<=', '>>=', '&=', '^=', '|=')],
        [prec.left, ARITH.or, '||'],
        [prec.left, ARITH.and, '&&'],
        [prec.left, ARITH.bitor, '|'],
        [prec.left, ARITH.bitxor, '^'],
        [prec.left, ARITH.bitand, '&'],
        [prec.left, ARITH.equality, choice('==', '!=')],
        [prec.left, ARITH.compare, choice('<', '<=', '>', '>=')],
        [prec.left, ARITH.shift, choice('<<', '>>')],
        [prec.left, ARITH.add, choice('+', '-')],
        [prec.left, ARITH.multiply, choice('*', '/', '%')],
        [prec.right, ARITH.power, '**'],
      ];
      return choice(...table.map(([fn, p, op]) => fn(p, seq(
        field('left', $._arithmetic_expression),
        field('operator', op),
        field('right', $._arithmetic_expression),
      ))));
    },

    // `0x$hex`, `16#$n`, `0${a}`, `$a$b`
    _arithmetic_concatenation: $ => prec.left(seq(
      choice($.number, $.simple_expansion, $.expansion, $.command_substitution),
      repeat1(choice(
        alias(token.immediate(/[0-9A-Za-z_@#]+/), $.number),
        alias($._immediate_simple_expansion, $.simple_expansion),
        alias($._immediate_expansion, $.expansion),
        alias($._immediate_command_substitution, $.command_substitution),
      )),
    )),

    // Bash expands before it evaluates, so an expansion may be the operator:
    // `(( a $op b ))`.
    _arithmetic_expanded_operator: $ => prec.left(ARITH.comma, seq(
      field('left', $._arithmetic_expression),
      field('operator', choice($.simple_expansion, $.expansion)),
      optional(field('right', $._arithmetic_expression)),
    )),

    _arithmetic_unary: $ => prec.right(ARITH.unary, seq(
      field('operator', choice('!', '~', '-', '+', '++', '--')),
      $._arithmetic_expression,
    )),

    _arithmetic_postfix: $ => prec.left(ARITH.postfix, seq(
      $._arithmetic_expression,
      field('operator', choice('++', '--')),
    )),

    _arithmetic_ternary: $ => prec.right(ARITH.ternary, seq(
      field('condition', $._arithmetic_expression),
      '?',
      field('consequence', $._arithmetic_expression),
      ':',
      field('alternative', $._arithmetic_expression),
    )),

    _arithmetic_parenthesized: $ => seq('(', $._arithmetic_expression, ')'),

    // 42, 0x2a, 0o52 is not bash, 8#52, 64#_@
    // A base or `0x` may be followed by an expansion: `16#$n`, `0x$h`.
    number: _ => /[0-9]+#[0-9A-Za-z@_]*|0[xX][0-9A-Fa-f]*|[0-9]+/,

    // Redirects
    // ---------

    _redirect: $ => choice($.file_redirect, $.heredoc_redirect, $.herestring_redirect),

    file_redirect: $ => {
      const ops = ['<', '>', '>>', '&>', '&>>', '<&', '>&', '>|', '<>'];
      const fdOps = ['<', '>', '>>', '<&', '>&', '>|', '<>'];
      return prec.left(seq(
        choice(
          field('operator', choice(...ops)),
          seq(
            field('descriptor', alias($._digits, $.file_descriptor)),
            field('operator', choice(...fdOps.map(op => alias(token.immediate(op), op)))),
          ),
        ),
        field('destination', $._literal),
      ));
    },

    herestring_redirect: $ => seq(
      choice(
        '<<<',
        seq(field('descriptor', alias($._digits, $.file_descriptor)), alias(token.immediate('<<<'), '<<<')),
      ),
      $._literal,
    ),

    // <<EOF, <<-EOF, <<'EOF', <<"EOF", <<\EOF
    //
    // The rest of the line comes before the body, so it is part of the
    // redirect: `cat <<EOF > out | sort && echo done`.
    heredoc_redirect: $ => seq(
      choice(
        field('operator', choice('<<', '<<-')),
        seq(
          field('descriptor', alias($._digits, $.file_descriptor)),
          field('operator', choice(alias(token.immediate('<<'), '<<'), alias(token.immediate('<<-'), '<<-'))),
        ),
      ),
      choice(...HEREDOC_FAMILIES.flatMap(family => [false, true].map(quoted => {
        const delimiter = field('delimiter', alias($[`_heredoc_start_${family}_${quoted ? 'q' : 'u'}`], $.heredoc_start));
        const body = field('body', alias($[`_heredoc_body_${family}_${quoted ? 'q' : 'u'}`], $.heredoc_body));
        return seq(delimiter, optional($._heredoc_rest_of_line), body);
      }))),
    ),

    _heredoc_rest_of_line: $ => choice(
      seq(
        repeat1(choice(field('argument', $._literal), field('redirect', $._redirect))),
        optional($._heredoc_continuation),
      ),
      $._heredoc_continuation,
    ),

    _heredoc_continuation: $ => choice(
      seq(choice('|', '|&', '&&', '||'), $._statement),
      seq(
        choice(';', '&'),
        optional(seq(
          $._statement,
          repeat(seq(choice(';', '&'), $._statement)),
          optional(choice(';', '&')),
        )),
      ),
    ),

    // Delimiters. Declared in order of preference for a word more than one
    // matches: a word in HEREDOC_WORDS, then a lower-case word, then anything.
    ...Object.fromEntries(HEREDOC_WORDS.flatMap((word, i) => [
      [`_heredoc_start_${i}_u`, _ => new RegExp(escapeRegExp(word))],
      [`_heredoc_start_${i}_q`, _ => new RegExp(`'${escapeRegExp(word)}'|"${escapeRegExp(word)}"|\\\\${escapeRegExp(word)}`)],
    ])),
    _heredoc_start_lower_u: _ => /[a-z_][a-z0-9_]*/,
    _heredoc_start_lower_q: _ => /'[a-z_][a-z0-9_]*'|"[a-z_][a-z0-9_]*"|\\[a-z_][a-z0-9_]*/,
    _heredoc_start_upper_u: _ => new RegExp(`(${HEREDOC_DELIMITER_UNIT})+`),
    _heredoc_start_upper_q: _ => new RegExp(`(${HEREDOC_DELIMITER_UNIT})*(${HEREDOC_QUOTED_UNIT})(${HEREDOC_DELIMITER_UNIT}|${HEREDOC_QUOTED_UNIT})*`),

    // Ends. Each family has its own: the delimiter itself, or for the general
    // families a line shaped like one (HEREDOC_END, HEREDOC_LOWER_END). An end
    // is lexed at the start of a line, and is declared before the content
    // tokens, so that a line that both match is an end while a longer line
    // (`EOF2`) is content.
    ...Object.fromEntries(HEREDOC_FAMILIES.map(family => {
      const end = typeof family === 'number' ? escapeRegExp(HEREDOC_WORDS[family])
        : family === 'lower' ? HEREDOC_LOWER_END : HEREDOC_END;
      return [`_heredoc_end_${family}`, _ => token.immediate(prec(IMM_PREC, new RegExp(`\\t*(${end})\\r?`)))];
    })),

    // A body is the newline that ends the heredoc's line, then lines that each
    // end with a newline, then the end. The lines are the same rule for every
    // delimiter, and an end can only follow a newline, so only a few parser
    // states depend on the delimiter.
    ...Object.fromEntries(HEREDOC_FAMILIES.flatMap(family => [
      [`_heredoc_body_${family}_u`, $ => seq(
        $._newline,
        optional($._heredoc_lines),
        alias($[`_heredoc_end_${family}`], $.heredoc_end),
      )],
      [`_heredoc_body_${family}_q`, $ => seq(
        $._newline,
        optional($._literal_heredoc_lines),
        alias($[`_heredoc_end_${family}`], $.heredoc_end),
      )],
    ])),

    _heredoc_lines: $ => repeat1(seq(repeat($._heredoc_piece), $._newline)),

    _literal_heredoc_lines: $ => repeat1(seq(
      optional(alias($._literal_heredoc_text, $.heredoc_content)),
      $._newline,
    )),

    _heredoc_piece: $ => choice(
      alias($._heredoc_text, $.heredoc_content),
      alias('$', $.heredoc_content),
      $.simple_expansion,
      $.expansion,
      $.command_substitution,
      $.arithmetic_expansion,
    ),

    _heredoc_text: _ => token.immediate(prec(IMM_PREC, /([^$\x60\\\r\n]|\\[^\r\n]?)+/)),
    _literal_heredoc_text: _ => token.immediate(prec(IMM_PREC, /[^\r\n]+/)),

    // Words
    // -----

    // A word: a piece, or pieces with nothing between them.
    _literal: $ => choice($._primary_expression, $.concatenation),

    concatenation: $ => prec.left(seq(
      $._primary_expression,
      repeat1($._immediate_primary),
    )),

    _primary_expression: $ => choice(
      $.word,
      alias($._digits, $.word),
      alias('$', $.word),
      $.string,
      $.raw_string,
      $.ansi_c_string,
      $.translated_string,
      $.simple_expansion,
      $.expansion,
      $.command_substitution,
      $.arithmetic_expansion,
      $.process_substitution,
    ),

    // A piece directly after another.
    _immediate_primary: $ => choice(
      alias($._immediate_word, $.word),
      alias(token.immediate('$'), $.word),
      alias($._immediate_string, $.string),
      alias($._immediate_raw_string, $.raw_string),
      alias($._immediate_ansi_c_string, $.ansi_c_string),
      alias($._immediate_translated_string, $.translated_string),
      alias($._immediate_simple_expansion, $.simple_expansion),
      alias($._immediate_expansion, $.expansion),
      alias($._immediate_command_substitution, $.command_substitution),
      alias($._immediate_arithmetic_expansion, $.arithmetic_expansion),
    ),

    // An assignment's value.
    _immediate_literal: $ => choice(
      $._immediate_primary,
      alias($._immediate_concatenation, $.concatenation),
    ),

    _immediate_concatenation: $ => prec.left(seq(
      $._immediate_primary,
      repeat1($._immediate_primary),
    )),

    // A word at the start of a command, or an argument of declare and unset.
    _command_literal: $ => choice(
      $._command_primary,
      alias($._command_concatenation, $.concatenation),
    ),

    _command_concatenation: $ => prec.left(seq(
      $._command_primary,
      repeat1($._immediate_primary),
    )),

    _command_primary: $ => choice(
      alias($._identifier, $.word),
      alias($._command_word, $.word),
      alias($._digits, $.word),
      alias('$', $.word),
      $.string,
      $.raw_string,
      $.ansi_c_string,
      $.translated_string,
      $.simple_expansion,
      $.expansion,
      $.command_substitution,
      $.arithmetic_expansion,
    ),

    // Declared before word and _command_word, so that a number is _digits
    // and may be a file descriptor: `2>&1`.
    _digits: _ => /[0-9]+/,

    _identifier: _ => new RegExp(IDENT),

    word: _ => new RegExp(`(${WORD_FIRST})(${WORD_UNIT})*`),

    _immediate_word: _ => token.immediate(prec(IMM_PREC, new RegExp(`(${WORD_UNIT})+`))),

    _command_word: _ => new RegExp(CMD_WORD),

    // Quoting
    // -------

    string: $ => seq('"', repeat($._string_part), '"'),
    _immediate_string: $ => seq(token.immediate('"'), repeat($._string_part), '"'),

    // $"..." is translated with gettext.
    translated_string: $ => seq('$"', repeat($._string_part), '"'),
    _immediate_translated_string: $ => seq(token.immediate('$"'), repeat($._string_part), '"'),

    _string_part: $ => choice(
      $.string_content,
      alias('$', $.string_content),
      $.simple_expansion,
      $.expansion,
      $.command_substitution,
      $.arithmetic_expansion,
    ),

    string_content: _ => token.immediate(prec(IMM_PREC, /([^"\x60$\\]|\\(.|\r?\n))+/)),

    raw_string: _ => /'[^']*'/,
    _immediate_raw_string: _ => token.immediate(/'[^']*'/),

    // $'...' with C escapes.
    ansi_c_string: _ => /\$'([^'\\]|\\(.|\r?\n))*'/,
    _immediate_ansi_c_string: _ => token.immediate(/\$'([^'\\]|\\(.|\r?\n))*'/),

    // Expansions
    // ----------

    // $name, $1, $@, $?
    simple_expansion: $ => seq('$', $._simple_expansion_name),
    _immediate_simple_expansion: $ => seq(token.immediate('$'), $._simple_expansion_name),

    _simple_expansion_name: $ => choice(
      alias(token.immediate(prec(NAME_PREC, new RegExp(IDENT))), $.variable_name),
      alias(token.immediate(prec(NAME_PREC, /[0-9@*#?$!-]/)), $.special_variable_name),
    ),

    // ${name}, ${#name}, ${!name}, ${name:-word}, ${name[i]//a/b}, ...
    expansion: $ => seq('${', $._expansion_body, '}'),
    _immediate_expansion: $ => seq(token.immediate('${'), $._expansion_body, '}'),

    _expansion_body: $ => choice(
      prec(2, seq(field('prefix', choice('#', '!')), $._expansion_target, optional($._expansion_operation))),
      prec(1, seq($._expansion_target, optional($._expansion_operation))),
    ),

    _expansion_target: $ => choice(
      alias($._identifier, $.variable_name),
      alias(/[0-9]+|[@*?$-]/, $.special_variable_name),
      alias('#', $.special_variable_name),
      alias('!', $.special_variable_name),
      $.subscript,
    ),

    _expansion_operation: $ => seq(
      field('operator', choice(
        ':-', '-', ':=', '=', ':?', '?', ':+', '+',
        '#', '##', '%', '%%', '/', '//', '/#', '/%',
        '^', '^^', ',', ',,', '@', ':', '*',
      )),
      repeat($._expansion_piece),
    ),

    _expansion_piece: $ => choice(
      alias($._expansion_text, $.word),
      alias('$', $.word),
      $.string,
      $.raw_string,
      $.ansi_c_string,
      $.simple_expansion,
      $.expansion,
      $.command_substitution,
      $.arithmetic_expansion,
    ),

    _expansion_text: _ => token.immediate(prec(IMM_PREC, /([^}$"'\x60\\]|\\(.|\r?\n))+/)),

    // $(...) and `...`
    command_substitution: $ => choice(
      seq('$(', optional($._statements), ')'),
      seq('`', optional($._statements), alias($._backtick_end, '`')),
    ),
    _immediate_command_substitution: $ => choice(
      seq(token.immediate('$('), optional($._statements), ')'),
      seq(token.immediate('`'), optional($._statements), alias($._backtick_end, '`')),
    ),

    // Backticks do not nest, so a backtick inside them always closes them.
    _backtick_end: _ => token(prec(5, '`')),

    // $[...], the old form of $((...)).
    _old_arithmetic_expansion: $ => seq('$[', optional($._arithmetic_expression), ']'),
    _immediate_old_arithmetic_expansion: $ => seq(token.immediate('$['), optional($._arithmetic_expression), ']'),

    // $((...)). `))` is two tokens, so `$(( (1) ))` and `$(((1)))` both work.
    arithmetic_expansion: $ => choice(
      seq('$((', optional($._arithmetic_expression), ')', token.immediate(')')),
      $._old_arithmetic_expansion,
    ),
    _immediate_arithmetic_expansion: $ => choice(
      seq(token.immediate('$(('), optional($._arithmetic_expression), ')', token.immediate(')')),
      $._immediate_old_arithmetic_expansion,
    ),

    // <(...) and >(...)
    process_substitution: $ => seq(choice('<(', '>('), optional($._statements), ')'),

    comment: _ => token(prec(-1, /#[^\r\n]*/)),

    // A token rather than an extra pattern, so that one at the end of the file
    // is not an error.
    _line_continuation: _ => token(/\\\r?\n/),
  },
});
