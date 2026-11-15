/**
 * @file Justfile grammar for tree-sitter
 * @license MIT
 *
 * Follows the justfile syntax as just's own lexer and parser read it
 * (GRAMMAR.md, src/lexer.rs and src/parser.rs in casey/just), with no
 * external scanner.
 *
 * just's lexer keeps a stack of indentation widths to find recipe bodies.
 * Here the indentation goes in the line break token instead:
 *
 * - **A line break followed by indentation is its own token.** `_body_nl` is
 *   a line break, with any blank lines before it, followed by spaces or tabs.
 *   `_eol` is a bare line break. The lexer takes the longest match, so after
 *   a recipe header or a body line, the token says whether the next line
 *   continues the body (it is indented) or starts a new item (it is not).
 * - **Line breaks are also extras.** tree-sitter lexes only the tokens a
 *   state accepts, and treats an extra as a regular token wherever it is
 *   valid. Inside `()`, `[]`, `{}` and `{{ }}`, and after an operator, no
 *   line break is valid, so it is skipped like a space, as just does.
 * - **Body text outranks everything else a body line could start with**,
 *   except the line prefixes (`@`, `-`) and, on the first line, a shebang.
 *   A `#` in a body is text for the shell, not a comment.
 *
 * A shebang recipe's body is one script, so its lines get no nodes: the body
 * is the `shebang`, then text and interpolations. Other bodies are made of
 * `recipe_line`s, each run by the shell on its own.
 */

/// <reference types="tree-sitter-cli/dsl" />
// @ts-check

const PREC = {
  or: 1,
  and: 2,
  comparison: 3,
  concat: 4,
  not: 5,
  call: 6,
};

module.exports = grammar({
  name: 'just',

  word: $ => $.identifier,

  extras: $ => [
    /[ \t\uFEFF]/,
    $._eol,
    $._line_continuation,
    $.comment,
  ],

  conflicts: $ => [
    // A keyword at the start of an item, followed by a name: the keyword's
    // item, or a recipe named after the keyword with a parameter.
    [$._item_name, $.alias],
    [$._item_name, $.export],
    [$._item_name, $.unexport],
    [$._item_name, $.module],
    [$._item_name, $.setting],
    [$._item_name, $.assignment],
  ],

  rules: {
    // Items are separated by line breaks.
    source_file: $ => seq(
      optional($._item),
      repeat(seq($._eol, optional($._item))),
    ),

    _item: $ => choice(
      $.recipe,
      $.assignment,
      $.alias,
      $.export,
      $.unexport,
      $.function_definition,
      $.import,
      $.module,
      $.setting,
    ),

    // Attributes go on lines of their own before an item. The rule is shared
    // by every item, so the parser need not know which item follows.
    _attribute_lines: $ => repeat1(seq($.attributes, $._eol)),

    // `[name, name: "value", name("a", key = "b")]`
    attributes: $ => seq(
      '[',
      commaSep1($.attribute),
      optional(','),
      ']',
    ),

    attribute: $ => seq(
      field('name', $.identifier),
      optional(choice(
        seq(':', field('argument', $._expression)),
        seq('(', optional(seq(
          commaSep1(field('argument', choice($._expression, $.keyword_argument))),
          optional(','),
        )), ')'),
      )),
    ),

    keyword_argument: $ => seq(
      field('name', $.identifier),
      '=',
      field('value', $._expression),
    ),

    // The keywords that start items are names too: `export foo='bar':` is a
    // recipe named `export`, and `mod := "x"` a variable. Elsewhere a keyword
    // that is not valid is lexed as an identifier anyway.
    _item_name: $ => choice(
      $.identifier,
      alias(choice('alias', 'eager', 'export', 'import', 'mod', 'set', 'unexport'), $.identifier),
    ),

    // name := expression
    assignment: $ => seq(
      optional($._attribute_lines),
      optional(field('modifier', 'eager')),
      field('name', $._item_name),
      ':=',
      field('value', $._expression),
    ),

    // export name := expression
    export: $ => seq(
      optional($._attribute_lines),
      'export',
      field('name', $.identifier),
      ':=',
      field('value', $._expression),
    ),

    unexport: $ => seq(
      optional($._attribute_lines),
      'unexport',
      field('name', $.identifier),
    ),

    // alias name := target
    alias: $ => seq(
      optional($._attribute_lines),
      'alias',
      field('name', $.identifier),
      ':=',
      field('target', $._target),
    ),

    // name(a, b) := expression
    function_definition: $ => seq(
      optional($._attribute_lines),
      field('name', $._item_name),
      field('parameters', $.function_parameters),
      ':=',
      field('body', $._expression),
    ),

    function_parameters: $ => seq(
      '(',
      optional(seq(commaSep1($.identifier), optional(','))),
      ')',
    ),

    // import? "path"
    import: $ => seq(
      optional($._attribute_lines),
      'import',
      optional(field('optional', '?')),
      field('path', $.string),
    ),

    // mod? name "path"
    module: $ => seq(
      optional($._attribute_lines),
      'mod',
      optional(field('optional', '?')),
      field('name', $.identifier),
      optional(field('path', $.string)),
    ),

    // set name, or set name := value
    setting: $ => seq(
      optional($._attribute_lines),
      'set',
      field('name', choice($.identifier, alias('export', $.identifier))),
      optional(seq(
        ':=',
        field('value', choice($.boolean, $._expression)),
      )),
    ),

    boolean: _ => choice('true', 'false'),

    // Recipes

    recipe: $ => seq(
      optional($._attribute_lines),
      $.recipe_header,
      optional(field('body', $.recipe_body)),
    ),

    // @name params: dependencies && dependencies
    recipe_header: $ => seq(
      optional(field('quiet', '@')),
      field('name', $._item_name),
      optional(field('parameters', $.parameters)),
      ':',
      optional(field('dependencies', $.dependencies)),
    ),

    parameters: $ => choice(
      seq(repeat1($.parameter), optional($.variadic_parameter)),
      $.variadic_parameter,
    ),

    // $name, or name=default. The default is a value, not an expression.
    parameter: $ => seq(
      optional(field('export', '$')),
      field('name', $.identifier),
      optional(seq('=', field('default', $._value))),
    ),

    // +name or *name
    variadic_parameter: $ => seq(
      field('kind', choice('+', '*')),
      $.parameter,
    ),

    dependencies: $ => choice(
      seq(repeat1($.dependency), optional(seq('&&', repeat1($.dependency)))),
      seq('&&', repeat1($.dependency)),
    ),

    // name, (name args...) or *(name args...)
    dependency: $ => choice(
      field('recipe', $._target),
      seq(
        optional(field('mapped', '*')),
        '(',
        field('recipe', $._target),
        repeat(field('argument', choice($._expression, $.starred_argument))),
        ')',
      ),
    ),

    starred_argument: $ => seq('*', $._value),

    _target: $ => choice($.identifier, $.module_path),

    // module::recipe
    module_path: $ => seq($.identifier, repeat1(seq('::', $.identifier))),

    recipe_body: $ => choice(
      // A script: the first line is a shebang.
      seq(
        $._body_nl,
        $.shebang,
        repeat(choice($._body_nl, $._text, $.interpolation)),
      ),
      repeat1(seq($._body_nl, optional($.recipe_line))),
    ),

    recipe_line: $ => choice(
      seq($.prefix, repeat(choice($._text, $.interpolation))),
      repeat1(choice($._text, $.interpolation)),
    ),

    // A line break, any blank lines after it, then indentation.
    _body_nl: _ => /(\r?\n[ \t]*)*\r?\n[ \t]+/,

    _eol: _ => /\r?\n/,

    _line_continuation: _ => /\\\r?\n/,

    shebang: _ => token(prec(3, /#![^\r\n]*/)),

    // @ (quiet), - (ignore errors), or both
    prefix: _ => token(prec(2, choice('@', '-', '@-', '-@'))),

    // Body text runs to a line break or `{{`. `{{{{` is an escaped `{{`. A
    // `{` that does not start `{{` is text too.
    _text: _ => token.immediate(prec(1, /([^\r\n{]|\{\{\{\{|\{[^\r\n{])+|\{/)),

    interpolation: $ => seq('{{', $._expression, '}}'),

    // Expressions

    _expression: $ => choice(
      $.binary_expression,
      $.unary_expression,
      $.if_expression,
      $._value,
    ),

    binary_expression: $ => choice(
      prec.right(PREC.or, seq(field('left', $._expression), field('operator', '||'), field('right', $._expression))),
      prec.right(PREC.and, seq(field('left', $._expression), field('operator', '&&'), field('right', $._expression))),
      prec.left(PREC.comparison, seq(
        field('left', $._expression),
        field('operator', choice('==', '!=', '=~', '!~')),
        field('right', $._expression),
      )),
      prec.right(PREC.concat, seq(
        field('left', $._expression),
        field('operator', choice('+', '++', '/')),
        field('right', $._expression),
      )),
    ),

    unary_expression: $ => choice(
      // `!` applies to a value: `!a + b` is `(!a) + b`.
      prec(PREC.not, seq(field('operator', '!'), field('operand', $._value))),
      // A leading `/` joins with the empty string: `/ "bin"` is `/bin`.
      prec.right(PREC.concat, seq(field('operator', '/'), field('operand', $._expression))),
    ),

    // if a == b { x } else if c { y } else { z }
    if_expression: $ => seq(
      'if',
      field('condition', $._expression),
      field('consequence', $.block),
      optional(seq('else', field('alternative', choice($.if_expression, $.block)))),
    ),

    block: $ => seq('{', $._expression, '}'),

    _value: $ => choice(
      $.identifier,
      $.call_expression,
      $.assert_expression,
      $.string,
      $.format_string,
      $.backtick,
      $.list,
      $.parenthesized_expression,
    ),

    call_expression: $ => prec(PREC.call, seq(
      field('function', $.identifier),
      field('arguments', $.arguments),
    )),

    arguments: $ => seq(
      '(',
      optional(seq(commaSep1($._expression), optional(','))),
      ')',
    ),

    // assert(condition, message)
    assert_expression: $ => seq(
      'assert',
      '(',
      field('condition', $._expression),
      optional(seq(',', field('message', $._expression))),
      optional(','),
      ')',
    ),

    parenthesized_expression: $ => seq('(', $._expression, ')'),

    list: $ => seq(
      '[',
      optional(seq(commaSep1($._expression), optional(','))),
      ']',
    ),

    identifier: _ => /[a-zA-Z_][a-zA-Z0-9_-]*/,

    // Strings. An `x` before the quote (`x"~/bin"`) asks for shell expansion;
    // it is part of the opening token, since `x` alone is a name.

    string: $ => choice(
      // "..." and x"..."
      seq(
        choice('"', token(prec(1, 'x"'))),
        repeat(choice($._string_content, $.escape_sequence)),
        token.immediate('"'),
      ),
      // """...""" (indented)
      seq(
        choice('"""', token(prec(1, 'x"""'))),
        repeat(choice($._string_content, $._indented_string_quote, $.escape_sequence)),
        token.immediate(prec(2, '"""')),
      ),
      // '...' and '''...''' are raw: no escapes.
      token(choice(
        /x?'[^']*'/,
        /x?'''([^']|'[^']|''[^'])*'''/,
      )),
    ),

    _string_content: _ => token.immediate(prec(1, /[^"\\]+/)),

    // One or two quotes inside a """ string.
    _indented_string_quote: _ => token.immediate(prec(1, /""?/)),

    // \n \r \t \\ \" \u{...}, and a backslash before a line break, which
    // removes it. Unknown escapes are errors in just; here they parse.
    escape_sequence: _ => token.immediate(prec(1, /\\(u\{[0-9a-fA-F]*\}|\r?\n|[^\r\n])/)),

    // f"text {{expression}} text"
    format_string: $ => choice(
      seq(
        token(prec(1, 'f"')),
        repeat(choice($._format_content, $.escape_sequence, $.interpolation)),
        token.immediate('"'),
      ),
      seq(
        token(prec(1, 'f"""')),
        repeat(choice($._format_content, $._indented_string_quote, $.escape_sequence, $.interpolation)),
        token.immediate(prec(2, '"""')),
      ),
      seq(
        token(prec(1, "f'")),
        repeat(choice($._raw_format_content, $.interpolation)),
        token.immediate("'"),
      ),
      seq(
        token(prec(1, "f'''")),
        repeat(choice($._raw_format_content, $._indented_raw_quote, $.interpolation)),
        token.immediate(prec(2, "'''")),
      ),
    ),

    // `{{{{` is an escaped `{{`.
    _format_content: _ => token.immediate(prec(1, /([^"\\{]|\{\{\{\{|\{[^"\\{])+|\{/)),

    _raw_format_content: _ => token.immediate(prec(1, /([^'{]|\{\{\{\{|\{[^'{])+|\{/)),

    _indented_raw_quote: _ => token.immediate(prec(1, /''?/)),

    // `command` and ```indented command```
    backtick: $ => choice(
      seq('`', optional(alias(token.immediate(prec(1, /[^`]+/)), $.command)), token.immediate('`')),
      seq('```', optional(alias(token.immediate(prec(1, /([^`]|`[^`]|``[^`])+/)), $.command)), token.immediate('```')),
    ),

    comment: _ => token(prec(-1, /#[^\r\n]*/)),
  },
});

/**
 * One or more of `rule`, separated by commas.
 *
 * @param {RuleOrLiteral} rule
 */
function commaSep1(rule) {
  return seq(rule, repeat(seq(',', rule)));
}
