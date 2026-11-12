/**
 * @file Nix grammar for tree-sitter
 * @license MIT
 *
 * Follows the Nix language as implemented by the reference lexer and parser
 * (nix: src/libexpr/lexer.l and parser.y). There is no external scanner.
 *
 * Strings
 * -------
 * The contents of `"…"` and `''…''` are lexed with immediate tokens, so
 * whitespace inside a string is never skipped. Text runs stop only at `$`,
 * `\` (or `'`) and the closing quote, so a text token is complete after every
 * character it takes; with a higher lexical precedence than comments, that
 * makes `#` and `/*` inside a string text, never the start of a comment. As in
 * lexer.l, a `$` only starts an interpolation when `{` follows it, `$${` is
 * literal, and in an indented string a single `'` is text.
 *
 * Paths
 * -----
 * The lexer.l rules are reproduced as tokens, so longest match decides between
 * a path, an identifier, a URI and an operator just as it does in Nix: `a/b`
 * is a path, `a / b` a division, `x:y` a URI and `x: y` a function. A path
 * with interpolations is a start token followed by immediate fragments and
 * interpolations. Nix only treats `foo/` as the start of a path when `${`
 * follows; without lookahead that cannot be told apart from `foo/ …`, so
 * `./`, `../` and `~/` are path starts, as is a lone `/` wherever a division
 * is not valid (`or /${x}`, but not `f /${x}`), and `foo/${x}` is not a path.
 * No file in nixpkgs writes one; `./foo/${x}` and `/nix/${x}` parse.
 */

/// <reference types="tree-sitter-cli/dsl" />
// @ts-check

// parser.y: the operator declarations, lowest first, plus NEGATE.
const PREC = {
  pipe: 1, // `|>` and `<|`, below every other operator
  impl: 2, // `->`, right
  or: 3, // `||`, left
  and: 4, // `&&`, left
  equality: 5, // `==` `!=`, nonassoc
  relational: 6, // `<` `>` `<=` `>=`, nonassoc
  update: 7, // `//`, right
  not: 8, // `!`
  additive: 9, // `+` `-`, left
  multiplicative: 10, // `*` `/`, left
  concat: 11, // `++`, right
  has_attr: 12, // `?`, nonassoc
  negate: 13, // unary `-`
};

// lexer.l
const PATH_CHAR = /[a-zA-Z0-9._\-+]/.source;
const ID = /[a-zA-Z_][a-zA-Z0-9_'\-]*/;
const INT = /[0-9]+/;
const FLOAT = /(([1-9][0-9]*\.[0-9]*)|(0?\.[0-9]+))([Ee][+-]?[0-9]+)?/;
const PATH = new RegExp(`${PATH_CHAR}*(\\/${PATH_CHAR}+)+\\/?`);
const HPATH = new RegExp(`~(\\/${PATH_CHAR}+)+\\/?`);
const SPATH = new RegExp(`<${PATH_CHAR}+(\\/${PATH_CHAR}+)*>`);
const URI = /[a-zA-Z][a-zA-Z0-9+\-.]*:[a-zA-Z0-9%/?:@&=+$,\-_.!~*']+/;

module.exports = grammar({
  name: 'nix',

  extras: $ => [/\s/, $.comment],

  word: $ => $.identifier,

  reserved: {
    // `or` is left out: it is also an attribute name (`lib.or`).
    global: _ => ['assert', 'else', 'if', 'in', 'inherit', 'let', 'rec', 'then', 'with'],
  },

  supertypes: $ => [$._expression],

  rules: {
    source_code: $ => optional(field('expression', $._expression)),

    // parser.y: expr, expr_function
    _expression: $ => choice(
      $.function_expression,
      $.assert_expression,
      $.with_expression,
      $.let_expression,
      $._expr_if,
    ),

    function_expression: $ => choice(
      seq(field('universal', $.identifier), ':', field('body', $._expression)),
      seq(field('formals', $.formals), ':', field('body', $._expression)),
      seq(
        field('formals', $.formals), '@', field('universal', $.identifier),
        ':', field('body', $._expression),
      ),
      seq(
        field('universal', $.identifier), '@', field('formals', $.formals),
        ':', field('body', $._expression),
      ),
    ),

    // Nix allows a trailing comma, and `...` only last.
    formals: $ => seq(
      '{',
      repeat(seq(field('formal', $.formal), ',')),
      optional(choice(field('formal', $.formal), field('ellipses', $.ellipses))),
      '}',
    ),

    formal: $ => seq(
      field('name', $.identifier),
      optional(seq('?', field('default', $._expression))),
    ),

    ellipses: _ => '...',

    assert_expression: $ => seq(
      'assert', field('condition', $._expression), ';', field('body', $._expression),
    ),

    with_expression: $ => seq(
      'with', field('environment', $._expression), ';', field('body', $._expression),
    ),

    let_expression: $ => seq(
      'let', optional($.binding_set), 'in', field('body', $._expression),
    ),

    // parser.y: expr_if
    _expr_if: $ => choice($.if_expression, $._expr_op),

    if_expression: $ => seq(
      'if', field('condition', $._expression),
      'then', field('consequence', $._expression),
      'else', field('alternative', $._expression),
    ),

    // parser.y: expr_op
    _expr_op: $ => choice(
      $.has_attr_expression,
      $.unary_expression,
      $.binary_expression,
      $._expr_apply,
    ),

    unary_expression: $ => choice(
      prec(PREC.not, seq(field('operator', '!'), field('argument', $._expr_op))),
      prec(PREC.negate, seq(field('operator', '-'), field('argument', $._expr_op))),
    ),

    binary_expression: $ => choice(
      ...[
        [prec.left, PREC.pipe, '|>'],
        [prec.right, PREC.pipe, '<|'],
        [prec.right, PREC.impl, '->'],
        [prec.left, PREC.or, '||'],
        [prec.left, PREC.and, '&&'],
        [prec.left, PREC.equality, choice('==', '!=')],
        [prec.left, PREC.relational, choice('<', '>', '<=', '>=')],
        [prec.right, PREC.update, '//'],
        [prec.left, PREC.additive, choice('+', '-')],
        [prec.left, PREC.multiplicative, choice('*', '/')],
        [prec.right, PREC.concat, '++'],
      ].map(([assoc, p, op]) => assoc(p, seq(
        field('left', $._expr_op),
        field('operator', op),
        field('right', $._expr_op),
      ))),
    ),

    has_attr_expression: $ => prec(PREC.has_attr, seq(
      field('expression', $._expr_op),
      '?',
      field('attrpath', $.attrpath),
    )),

    // parser.y: expr_app
    _expr_apply: $ => choice($.apply_expression, $._expr_select),

    apply_expression: $ => seq(
      field('function', $._expr_apply),
      field('argument', $._expr_select),
    ),

    // parser.y: expr_select
    _expr_select: $ => choice($.select_expression, $._expr_simple),

    select_expression: $ => seq(
      field('expression', $._expr_simple),
      '.',
      field('attrpath', $.attrpath),
      optional(seq('or', field('default', $._expr_select))),
    ),

    // parser.y: expr_simple
    _expr_simple: $ => choice(
      $.variable_expression,
      $.integer_expression,
      $.float_expression,
      $.string_expression,
      $.indented_string_expression,
      $.path_expression,
      $.hpath_expression,
      $.spath_expression,
      $.uri_expression,
      $.parenthesized_expression,
      $.attrset_expression,
      $.let_attrset_expression,
      $.rec_attrset_expression,
      $.list_expression,
    ),

    variable_expression: $ => field('name', $.identifier),

    identifier: _ => ID,

    integer_expression: _ => INT,

    float_expression: _ => FLOAT,

    uri_expression: _ => URI,

    spath_expression: _ => SPATH,

    path_expression: $ => seq(
      choice(
        alias(PATH, $.path_fragment),
        // Starts that are only a path when `${` follows: `./${x}`, `../${x}`,
        // and `/${x}` where a division is not valid (lower precedence).
        seq(
          alias(choice(/\.\.?\//, token(prec(-1, '/'))), $.path_fragment),
          alias($._immediate_interpolation, $.interpolation),
        ),
      ),
      repeat($._path_part),
    ),

    hpath_expression: $ => seq(
      choice(
        alias(HPATH, $.path_fragment),
        seq(alias('~/', $.path_fragment), alias($._immediate_interpolation, $.interpolation)),
      ),
      repeat($._path_part),
    ),

    _path_part: $ => choice(
      // Right after a path part lexer.l is still in a path state, so an
      // unspaced `/` (or `+`, `-`, `.`) continues the path.
      alias(token.immediate(prec(1, new RegExp(`(${PATH_CHAR}|\\/)+`))), $.path_fragment),
      alias($._immediate_interpolation, $.interpolation),
    ),

    parenthesized_expression: $ => seq('(', field('expression', $._expression), ')'),

    list_expression: $ => seq('[', repeat(field('element', $._expr_select)), ']'),

    attrset_expression: $ => seq('{', optional($.binding_set), '}'),

    rec_attrset_expression: $ => seq('rec', '{', optional($.binding_set), '}'),

    // The deprecated `let { …; body = …; }`.
    let_attrset_expression: $ => seq('let', '{', optional($.binding_set), '}'),

    binding_set: $ => repeat1(field('binding', choice($.binding, $.inherit, $.inherit_from))),

    binding: $ => seq(
      field('attrpath', $.attrpath), '=', field('expression', $._expression), ';',
    ),

    inherit: $ => seq('inherit', optional(field('attrs', $.inherited_attrs)), ';'),

    inherit_from: $ => seq(
      'inherit',
      '(', field('expression', $._expression), ')',
      optional(field('attrs', $.inherited_attrs)),
      ';',
    ),

    inherited_attrs: $ => repeat1(field('attr', $._attr)),

    attrpath: $ => seq(field('attr', $._attr), repeat(seq('.', field('attr', $._attr)))),

    _attr: $ => choice(
      $.identifier,
      alias('or', $.identifier),
      $.string_expression,
      $.interpolation,
    ),

    interpolation: $ => seq('${', field('expression', $._expression), '}'),

    _immediate_interpolation: $ => seq(
      token.immediate('${'), field('expression', $._expression), '}',
    ),

    // lexer.l, <STRING>. lexer.l pairs a `$` with the next character unless
    // that is `{`; here `$$` and a lone `$` are their own fragments, which
    // splits the text the same way (`$${` is literal, `$$${` interpolates).
    string_expression: $ => seq(
      '"',
      repeat(choice(
        alias(token.immediate(prec(1, /[^$"\\]+/)), $.string_fragment),
        alias(token.immediate(choice('$', '$$')), $.string_fragment),
        alias(token.immediate(/\\(.|\n)/), $.escape_sequence),
        alias($._immediate_interpolation, $.interpolation),
      )),
      token.immediate('"'),
    ),

    // lexer.l, <IND_STRING>. A `'` not followed by another is text.
    indented_string_expression: $ => seq(
      "''",
      repeat(choice(
        alias(token.immediate(prec(1, /[^$']+/)), $.string_fragment),
        alias(token.immediate(choice('$', '$$', "'")), $.string_fragment),
        alias(token.immediate(choice("''$", "'''", /''\\(.|\n)/)), $.escape_sequence),
        alias($._immediate_interpolation, $.interpolation),
      )),
      token.immediate("''"),
    ),

    comment: _ => token(choice(
      /#[^\r\n]*/,
      /\/\*([^*]|\*+[^*/])*\*+\//,
    )),
  },
});
