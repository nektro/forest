/**
 * @file Lua grammar for tree-sitter
 * @license MIT
 *
 * Lua 5.5 (and everything earlier back to 5.1), following the reference
 * parser `lparser.c` and lexer `llex.c`.
 *
 * There is no external scanner. The only part of Lua's lexical syntax that is
 * not regular is the long bracket: `[==[ ... ]==]` ends at the first `]`
 * followed by the same number of `=` signs and another `]`. Each level is
 * regular on its own, so levels 0 through MAX_LEVEL are spelled out:
 *
 * - A long string is an opening token, then content tokens, then the closing
 *   token for its level. The content tokens are immediate (so no comments or
 *   whitespace are skipped inside), and are either a run of anything but `]`
 *   or a lone `]`. The closing token is longer than a lone `]`, so it wins
 *   wherever it matches, which is exactly where Lua ends the string.
 * - A long comment has to be a single token, because comments are extras.
 *   For each level, the regex for its body is "any text that does not contain
 *   the closing bracket", built from a small automaton (see `longBody`).
 *
 * `global` is a keyword only where a global declaration can start, as with
 * Lua's default `LUA_COMPAT_GLOBAL`: `global.x = 1` and `global(x)` still
 * parse as uses of a variable named `global`.
 */

/// <reference types="tree-sitter-cli/dsl" />
// @ts-check

// The deepest long bracket level supported: `[==========[` has level 10.
const MAX_LEVEL = 10;

const PREC = {
  or: 1,
  and: 2,
  comparison: 3,
  bit_or: 4,
  bit_xor: 5,
  bit_and: 6,
  shift: 7,
  concat: 8,
  additive: 9,
  multiplicative: 10,
  unary: 11,
  power: 12,
  call: 13,
};

const BINARY_OPERATORS = [
  [prec.left, PREC.or, 'or'],
  [prec.left, PREC.and, 'and'],
  [prec.left, PREC.comparison, choice('<', '>', '<=', '>=', '~=', '==')],
  [prec.left, PREC.bit_or, '|'],
  [prec.left, PREC.bit_xor, '~'],
  [prec.left, PREC.bit_and, '&'],
  [prec.left, PREC.shift, choice('<<', '>>')],
  [prec.right, PREC.concat, '..'],
  [prec.left, PREC.additive, choice('+', '-')],
  [prec.left, PREC.multiplicative, choice('*', '/', '//', '%')],
  [prec.right, PREC.power, '^'],
];

const LEVELS = Array.from({ length: MAX_LEVEL + 1 }, (_, n) => n);

/** `=` repeated between 0 and `max` times, as regex source. */
function upTo(max) {
  if (max <= 0) return '';
  if (max === 1) return '=?';
  return `={0,${max}}`;
}

/**
 * Regex source for the body of a level-`n` long bracket: any text in which
 * the closing bracket `]` `=`{n} `]` cannot be found once the closing bracket
 * itself is appended.
 *
 * The automaton that looks for the closing bracket has a state for each
 * prefix of it that has just been read: nothing, `]`, `]=`, ... `]=`{n}. A
 * `]` always moves to the `]` state (unless it completes the bracket), so the
 * text is a sequence of segments, each returning to the empty state:
 *
 * - any character but `]`, or
 * - `]`, then any number of `=`{0,n-1}`]` (each `]` starts over), then
 *   something that breaks the match: fewer than n `=` and a character that
 *   is neither `=` nor `]`, or exactly n `=` and a character that is not `]`.
 *
 * The text may also end partway, in any state but `]=`{n}, since the closing
 * bracket must not overlap it.
 */
function longBody(n) {
  if (n === 0) return '([^\\]]|\\][^\\]])*';
  const restart = `(${upTo(n - 1)}\\])*`;
  const escape = `(${upTo(n - 1)}[^\\]=]|={${n}}[^\\]])`;
  const segment = `([^\\]]|\\]${restart}${escape})`;
  const tail = `(\\]${restart}${upTo(n - 1)})?`;
  return `${segment}*${tail}`;
}

const eq = n => '='.repeat(n);
const escapeRe = s => s.replace(/[[\]]/g, '\\$&');
const open = n => `[${eq(n)}[`;
const close = n => `]${eq(n)}]`;

const commaSep1 = rule => seq(rule, repeat(seq(',', rule)));
const commaSep = rule => optional(commaSep1(rule));

module.exports = grammar({
  name: 'lua',

  extras: $ => [/\s/, $.comment],

  word: $ => $.identifier,

  supertypes: $ => [$.statement, $.expression, $.variable],

  inline: $ => [$._prefix_expression, $._name],

  conflicts: _ => [],

  rules: {
    chunk: $ => seq(
      optional(alias($._hash_bang_line, $.comment)),
      repeat($.statement),
      optional($.return_statement),
    ),

    // Lua skips a first line that starts with `#`. It is a `comment` in the
    // tree.
    _hash_bang_line: _ => /#.*/,

    block: $ => choice(
      seq(repeat1($.statement), optional($.return_statement)),
      $.return_statement,
    ),

    // Statements
    // ----------

    statement: $ => choice(
      $.empty_statement,
      $.assignment_statement,
      $.function_call,
      $.label_statement,
      $.break_statement,
      $.goto_statement,
      $.do_statement,
      $.while_statement,
      $.repeat_statement,
      $.if_statement,
      $.for_statement,
      $.function_declaration,
      $.local_function_declaration,
      $.global_function_declaration,
      $.local_variable_declaration,
      $.global_variable_declaration,
    ),

    empty_statement: _ => ';',

    return_statement: $ => prec.right(seq(
      'return',
      optional($.expression_list),
      optional(';'),
    )),

    assignment_statement: $ => seq(
      field('left', $.variable_list),
      '=',
      field('right', $.expression_list),
    ),

    variable_list: $ => commaSep1(field('name', $.variable)),

    expression_list: $ => commaSep1(field('value', $.expression)),

    label_statement: $ => seq('::', field('name', $.identifier), '::'),

    break_statement: _ => 'break',

    goto_statement: $ => seq('goto', field('label', $.identifier)),

    do_statement: $ => seq('do', field('body', optional($.block)), 'end'),

    while_statement: $ => seq(
      'while',
      field('condition', $.expression),
      'do',
      field('body', optional($.block)),
      'end',
    ),

    repeat_statement: $ => seq(
      'repeat',
      field('body', optional($.block)),
      'until',
      field('condition', $.expression),
    ),

    if_statement: $ => seq(
      'if',
      field('condition', $.expression),
      'then',
      field('consequence', optional($.block)),
      repeat(field('alternative', $.elseif_statement)),
      optional(field('alternative', $.else_statement)),
      'end',
    ),

    elseif_statement: $ => seq(
      'elseif',
      field('condition', $.expression),
      'then',
      field('consequence', optional($.block)),
    ),

    else_statement: $ => seq('else', field('body', optional($.block))),

    for_statement: $ => seq(
      'for',
      field('clause', choice($.for_numeric_clause, $.for_generic_clause)),
      'do',
      field('body', optional($.block)),
      'end',
    ),

    for_numeric_clause: $ => seq(
      field('name', $.identifier),
      '=',
      field('start', $.expression),
      ',',
      field('end', $.expression),
      optional(seq(',', field('step', $.expression))),
    ),

    for_generic_clause: $ => seq(
      $.name_list,
      'in',
      $.expression_list,
    ),

    name_list: $ => commaSep1(field('name', $.identifier)),

    function_declaration: $ => seq(
      'function',
      field('name', choice(
        $.identifier,
        alias($._function_name_dot, $.dot_index_expression),
        alias($._function_name_method, $.method_index_expression),
      )),
      $._function_body,
    ),

    _function_name_prefix: $ => choice(
      $.identifier,
      alias($._function_name_dot, $.dot_index_expression),
    ),

    _function_name_dot: $ => seq(
      field('table', $._function_name_prefix),
      '.',
      field('field', $.identifier),
    ),

    _function_name_method: $ => seq(
      field('table', $._function_name_prefix),
      ':',
      field('method', $.identifier),
    ),

    local_function_declaration: $ => seq(
      'local',
      'function',
      field('name', $.identifier),
      $._function_body,
    ),

    global_function_declaration: $ => seq(
      'global',
      'function',
      field('name', $.identifier),
      $._function_body,
    ),

    // `local <const> a, b <close> = ...` (an attribute before the names
    // applies to all of them; Lua 5.5)
    local_variable_declaration: $ => seq(
      'local',
      optional(field('attribute', $.attribute)),
      commaSep1($._declared_name),
      optional(seq('=', field('value', $.expression_list))),
    ),

    // `global x, y`, `global <const> *`, `global x = 1` (Lua 5.5)
    global_variable_declaration: $ => seq(
      'global',
      optional(field('attribute', $.attribute)),
      choice(
        alias('*', $.wildcard),
        seq(
          commaSep1($._declared_name),
          optional(seq('=', field('value', $.expression_list))),
        ),
      ),
    ),

    _declared_name: $ => seq(
      field('name', $.identifier),
      optional(field('attribute', $.attribute)),
    ),

    attribute: $ => seq('<', field('name', $.identifier), '>'),

    // Expressions
    // -----------

    expression: $ => choice(
      $.nil,
      $.false,
      $.true,
      $.number,
      $.string,
      $.vararg_expression,
      $.function_definition,
      $.table_constructor,
      $.binary_expression,
      $.unary_expression,
      $._prefix_expression,
    ),

    _prefix_expression: $ => choice(
      $.variable,
      $.function_call,
      $.parenthesized_expression,
    ),

    variable: $ => choice(
      $._name,
      $.bracket_index_expression,
      $.dot_index_expression,
    ),

    // A name used as a variable. `global` is a keyword only where a
    // declaration can start; everywhere else it is a name.
    _name: $ => choice($.identifier, alias('global', $.identifier)),

    nil: _ => 'nil',
    false: _ => 'false',
    true: _ => 'true',

    vararg_expression: _ => '...',

    parenthesized_expression: $ => seq('(', $.expression, ')'),

    bracket_index_expression: $ => seq(
      field('table', $._prefix_expression),
      '[',
      field('field', $.expression),
      ']',
    ),

    dot_index_expression: $ => seq(
      field('table', $._prefix_expression),
      '.',
      field('field', $.identifier),
    ),

    method_index_expression: $ => seq(
      field('table', $._prefix_expression),
      ':',
      field('method', $.identifier),
    ),

    // `f (g)` continues a call rather than starting a new statement, as in
    // Lua: the precedence makes the parser shift the `(`.
    function_call: $ => prec(PREC.call, seq(
      field('name', choice($._prefix_expression, $.method_index_expression)),
      field('arguments', $.arguments),
    )),

    arguments: $ => choice(
      seq('(', commaSep($.expression), ')'),
      $.table_constructor,
      $.string,
    ),

    function_definition: $ => seq('function', $._function_body),

    _function_body: $ => seq(
      field('parameters', $.parameters),
      field('body', optional($.block)),
      'end',
    ),

    parameters: $ => seq(
      '(',
      optional(choice(
        seq(
          commaSep1(field('name', $.identifier)),
          optional(seq(',', $.vararg_parameter)),
        ),
        $.vararg_parameter,
      )),
      ')',
    ),

    // `...`, or `...name` for a named vararg table (Lua 5.5).
    vararg_parameter: $ => seq('...', optional(field('name', $.identifier))),

    table_constructor: $ => seq(
      '{',
      optional(seq(
        $.field,
        repeat(seq($._field_separator, $.field)),
        optional($._field_separator),
      )),
      '}',
    ),

    _field_separator: _ => choice(',', ';'),

    field: $ => choice(
      seq('[', field('name', $.expression), ']', '=', field('value', $.expression)),
      seq(field('name', $._name), '=', field('value', $.expression)),
      field('value', $.expression),
    ),

    binary_expression: $ => choice(...BINARY_OPERATORS.map(([assoc, p, op]) =>
      assoc(p, seq(
        field('left', $.expression),
        field('operator', op),
        field('right', $.expression),
      )),
    )),

    unary_expression: $ => prec.left(PREC.unary, seq(
      field('operator', choice('not', '#', '-', '~')),
      field('operand', $.expression),
    )),

    // Literals
    // --------

    number: _ => {
      const hex = /[0-9a-fA-F]/;
      const decimal = choice(
        seq(/[0-9]+/, optional(seq('.', /[0-9]*/))),
        seq('.', /[0-9]+/),
      );
      const hexadecimal = seq(
        /0[xX]/,
        choice(
          seq(repeat1(hex), optional(seq('.', repeat(hex)))),
          seq('.', repeat1(hex)),
        ),
      );
      return token(seq(
        choice(
          seq(decimal, optional(/[eE][+-]?[0-9]+/)),
          seq(hexadecimal, optional(/[pP][+-]?[0-9]+/)),
        ),
        // LuaJIT's 64-bit integer and imaginary suffixes.
        optional(/[uU]?[lL][lL]|[iI]/),
      ));
    },

    string: $ => choice(
      seq(
        field('start', '"'),
        field('content', optional(alias($._double_quoted_content, $.string_content))),
        field('end', alias(token.immediate('"'), '"')),
      ),
      seq(
        field('start', "'"),
        field('content', optional(alias($._single_quoted_content, $.string_content))),
        field('end', alias(token.immediate("'"), "'")),
      ),
      ...LEVELS.map(n => seq(
        field('start', alias(open(n), open(n))),
        field('content', optional(alias($[`_long_content_${n}`], $.string_content))),
        field('end', alias(token.immediate(prec(1, close(n))), close(n))),
      )),
    ),

    // Above the precedence of comments, so `--` in a string is content.
    _double_quoted_content: $ => repeat1(choice(
      token.immediate(prec(1, /[^"\\\r\n]+/)),
      $.escape_sequence,
    )),

    _single_quoted_content: $ => repeat1(choice(
      token.immediate(prec(1, /[^'\\\r\n]+/)),
      $.escape_sequence,
    )),

    ...Object.fromEntries(LEVELS.map(n => [
      `_long_content_${n}`,
      $ => repeat1(choice($._long_content_run, $._long_content_bracket)),
    ])),

    _long_content_run: _ => token.immediate(prec(1, /[^\]]+/)),

    // A `]` that does not start the closing bracket. Where the closing
    // bracket matches, it is longer, so it wins.
    _long_content_bracket: _ => token.immediate(prec(1, /\]/)),

    escape_sequence: _ => token.immediate(prec(1, seq(
      '\\',
      choice(
        /[abfnrtv\\"']/,
        /\r\n?|\n\r?/,
        /z\s*/,
        /x[0-9a-fA-F]{2}/,
        /[0-9]{1,3}/,
        /u\{[0-9a-fA-F]+\}/,
      ),
    ))),

    identifier: _ => /[a-zA-Z_\u0080-￿][a-zA-Z0-9_\u0080-￿]*/,

    // A line comment, or a long comment of any supported level. A line
    // comment cannot start with a long bracket, so `--[[ a ]] b` is a long
    // comment followed by `b`.
    comment: _ => token(choice(
      /--([^\[\r\n][^\r\n]*|\[=*([^\[=\r\n][^\r\n]*)?)?/,
      ...LEVELS.map(n => new RegExp(
        `--${escapeRe(open(n))}${longBody(n)}${escapeRe(close(n))}`,
      )),
    )),
  },
});
