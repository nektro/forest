/**
 * @file CSS grammar for tree-sitter
 * @license MIT
 *
 * CSS as browsers read it today: selectors level 4, nesting, cascade layers,
 * container and scope rules, media queries level 4 ranges, custom properties.
 *
 * There is no external scanner. The two places other CSS grammars use one are
 * handled in the grammar:
 *
 * - The descendant combinator is whitespace. Whitespace is an extra here, so
 *   `a b` is just two compound selectors side by side. What ties `a.b` into
 *   one compound is that the `.`, `#`, `[`, `:` and `::` that continue a
 *   compound selector are immediate tokens, which only match with no
 *   whitespace (or comment) before them.
 * - Inside a block, `a:hover {` and `color:red;` both start with a name and a
 *   colon. The parser keeps both readings (a GLR conflict) until one fails,
 *   which happens at the latest at the `{`, `;` or `}` that ends the item.
 */

/// <reference types="tree-sitter-cli/dsl" />
// @ts-check

// https://www.w3.org/TR/css-syntax-3/#tokenization
const ESCAPE = /\\([0-9a-fA-F]{1,6}(\r\n|[ \t\r\n\f])?|[^\r\n\f0-9a-fA-F])/;
const NAME_START = choice(/[a-zA-Z_]/, /[^\x00-\x7F]/, ESCAPE);
const NAME_CHAR = choice(/[a-zA-Z0-9_-]/, /[^\x00-\x7F]/, ESCAPE);

module.exports = grammar({
  name: 'css',

  extras: $ => [/\s/, $.comment],

  word: $ => $.identifier,

  supertypes: $ => [$._selector, $._value, $._query],

  conflicts: $ => [
    // In a block (and at the top level, for style attributes), a name
    // followed by a colon starts either a declaration or a selector.
    [$._compound_selector, $._declaration_head],
    // `@container card {` names a container; `@container card and ...`
    // never happens, but the name and a query look alike.
    [$.container_statement, $._query],
  ],

  rules: {
    stylesheet: $ => seq(
      repeat(choice($.declaration, $._statement, ';')),
      optional(alias($.last_declaration, $.declaration)),
    ),

    _statement: $ => choice(
      $.rule_set,
      $.import_statement,
      $.charset_statement,
      $.namespace_statement,
      $.media_statement,
      $.supports_statement,
      $.container_statement,
      $.layer_statement,
      $.scope_statement,
      $.page_statement,
      $.keyframes_statement,
      $.at_rule,
    ),

    // Rules

    rule_set: $ => seq(
      field('selectors', $.selectors),
      field('body', $.block),
    ),

    block: $ => seq(
      '{',
      repeat(choice($.declaration, $._statement, ';')),
      optional(alias($.last_declaration, $.declaration)),
      '}',
    ),

    // Selectors

    selectors: $ => commaSep1($._selector),

    _selector: $ => choice(
      $._compound_selector,
      $.descendant_selector,
      $.child_selector,
      $.adjacent_sibling_selector,
      $.sibling_selector,
      $.column_selector,
    ),

    // Everything that can start or continue a compound selector. The first
    // simple selector of a compound may follow whitespace; the rest are
    // joined to it by an immediate token.
    _compound_selector: $ => choice(
      alias($.identifier, $.tag_name),
      $.universal_selector,
      $.nesting_selector,
      $.namespace_selector,
      $.class_selector,
      $.id_selector,
      $.attribute_selector,
      $.pseudo_class_selector,
      $.pseudo_element_selector,
    ),

    universal_selector: _ => '*',

    nesting_selector: _ => '&',

    // `svg|circle`, `*|a`, or `|a` for elements in no namespace.
    namespace_selector: $ => seq(
      choice(
        seq(
          field('namespace', choice(
            alias($.identifier, $.namespace_name),
            $.universal_selector,
          )),
          alias(token.immediate('|'), '|'),
        ),
        '|',
      ),
      field('name', choice(
        alias($.identifier, $.tag_name),
        $.universal_selector,
      )),
    ),

    class_selector: $ => compound($, '.', field('name', alias($.identifier, $.class_name))),

    id_selector: $ => compound($, '#', field('name', alias($.identifier, $.id_name))),

    attribute_selector: $ => compound($, '[', seq(
      optional(seq(
        optional(field('namespace', choice(
          alias($.identifier, $.namespace_name),
          $.universal_selector,
        ))),
        '|',
      )),
      field('name', alias($.identifier, $.attribute_name)),
      optional(seq(
        field('operator', choice('=', '~=', '|=', '^=', '$=', '*=')),
        field('value', choice(
          alias($.identifier, $.plain_value),
          $.string_value,
          $.number_value,
        )),
        optional(field('flag', alias($.identifier, $.plain_value))),
      )),
      ']',
    )),

    pseudo_class_selector: $ => compound($, ':', seq(
      field('name', alias($.identifier, $.class_name)),
      optional(field('arguments', alias($.pseudo_arguments, $.arguments))),
    )),

    pseudo_element_selector: $ => compound($, '::', seq(
      field('name', alias($.identifier, $.tag_name)),
      optional(field('arguments', alias($.pseudo_arguments, $.arguments))),
    )),

    pseudo_arguments: $ => seq(
      alias($._immediate_paren, '('),
      optional(choice(
        seq($.an_plus_b, optional(seq('of', $.selectors))),
        commaSep1(choice($._selector, $.string_value)),
      )),
      ')',
    ),

    // `2n+1`, `-n + 3`, `odd`. Spaces are allowed around the sign.
    an_plus_b: _ => choice(
      'odd',
      'even',
      token(choice(
        /[+-]?[0-9]*[nN](\s*[+-]\s*[0-9]+)?/,
        /[+-]?[0-9]+/,
      )),
    ),

    // A combinator with nothing on its left is a relative selector, as in a
    // nested rule (`> a {}`) or `:has(+ b)`.
    descendant_selector: $ => prec.left(seq(
      field('left', $._selector),
      field('right', $._compound_selector),
    )),
    child_selector: $ => combinator($, '>'),
    adjacent_sibling_selector: $ => combinator($, '+'),
    sibling_selector: $ => combinator($, '~'),
    column_selector: $ => combinator($, '||'),

    // Declarations

    declaration: $ => seq($._declaration_body, ';'),

    // The last declaration in a block may leave out its semicolon.
    last_declaration: $ => $._declaration_body,

    _declaration_body: $ => choice(
      seq(
        $._declaration_head,
        repeat(field('value', $._component)),
        optional($.important),
      ),
      // The IE star hack, `*zoom: 1`, which other browsers ignore.
      seq(
        field('name', alias($._star_property_name, $.property_name)),
        $._colon,
        repeat(field('value', $._component)),
        optional($.important),
      ),
      // A custom property's value is any run of tokens, braces included.
      seq(
        field('name', alias($.dashed_identifier, $.property_name)),
        $._colon,
        repeat(field('value', $._custom_component)),
        optional($.important),
      ),
    ),

    _declaration_head: $ => seq(
      field('name', alias($.identifier, $.property_name)),
      $._colon,
    ),

    _star_property_name: _ => token(seq('*', NAME_START, repeat(NAME_CHAR))),

    _colon: $ => choice(':', alias($._immediate_colon, ':')),

    important: _ => token(seq('!', /\s*/, /[iI][mM][pP][oO][rR][tT][aA][nN][tT]/)),

    // Values

    _component: $ => choice($._value, ',', '/', '+', '-', '*', '='),

    // Inside parentheses, a colon or comparison can be part of the value too,
    // as in `supports(display: grid)` or `@custom-media --x (width < 30em)`.
    // Other stray delimiters are accepted there and in custom property
    // values, which may hold any tokens at all.
    _nested_component: $ => choice(
      $._component,
      ':', '<', '<=', '>', '>=',
      '.', '!', '?', '&', '|', '~', '^', '$',
    ),

    _custom_component: $ => choice($._nested_component, $.block_value),

    _value: $ => choice(
      alias($.identifier, $.plain_value),
      alias($.dashed_identifier, $.plain_value),
      $.color_value,
      $.number_value,
      $.string_value,
      $.unicode_range,
      $.call_expression,
      $.parenthesized_value,
      $.bracketed_value,
    ),

    color_value: _ => token(seq('#', repeat1(choice(/[a-zA-Z0-9_-]/, /[^\x00-\x7F]/)))),

    number_value: $ => seq(
      $._number,
      optional($.unit),
    ),

    _number: _ => /[+-]?([0-9]*\.[0-9]+|[0-9]+)([eE][+-]?[0-9]+)?/,

    unit: _ => token.immediate(/[a-zA-Z]+|%/),

    unicode_range: _ => /[uU]\+[0-9a-fA-F?]{1,6}(-[0-9a-fA-F]{1,6})?/,

    string_value: $ => choice(
      seq(
        '"',
        repeat(choice(
          alias(token.immediate(prec(1, /[^"\\\r\n]+/)), $.string_content),
          $.escape_sequence,
        )),
        token.immediate('"'),
      ),
      seq(
        '\'',
        repeat(choice(
          alias(token.immediate(prec(1, /[^'\\\r\n]+/)), $.string_content),
          $.escape_sequence,
        )),
        token.immediate('\''),
      ),
    ),

    // A backslash before a newline continues the string on the next line.
    escape_sequence: _ => token.immediate(seq(
      '\\',
      /[0-9a-fA-F]{1,6}(\r\n|[ \t\r\n\f])?|\r\n|[^0-9a-fA-F]/,
    )),

    call_expression: $ => choice(
      seq(
        field('name', alias($.identifier, $.function_name)),
        field('arguments', $.arguments),
      ),
      // An unquoted URL is one token, so `url(data:a/b;c,d)` stays whole.
      seq(
        field('name', alias(choice('url', 'URL'), $.function_name)),
        field('arguments', alias($.url_arguments, $.arguments)),
      ),
    ),

    arguments: $ => seq(
      alias($._immediate_paren, '('),
      repeat($._nested_component),
      ')',
    ),

    url_arguments: $ => seq(
      alias($._immediate_paren, '('),
      optional(choice(
        $.string_value,
        alias(/([^()'"\\\s]|\\[^\r\n\f])+/, $.plain_value),
      )),
      ')',
    ),

    parenthesized_value: $ => seq('(', repeat($._nested_component), ')'),

    // Grid line names: `[full-start main-start]`.
    bracketed_value: $ => seq('[', repeat($._nested_component), ']'),

    block_value: $ => seq('{', repeat(choice($._custom_component, ';')), '}'),

    // At-rules

    import_statement: $ => seq(
      '@import',
      field('source', $._value),
      // `layer`, `layer(name)` and `supports(...)` come before the media
      // queries; they parse as a keyword query and calls.
      repeat(choice($._query, ',')),
      ';',
    ),

    charset_statement: $ => seq('@charset', $.string_value, ';'),

    namespace_statement: $ => seq(
      '@namespace',
      optional(field('prefix', alias($.identifier, $.namespace_name))),
      field('source', choice($.string_value, $.call_expression)),
      ';',
    ),

    media_statement: $ => seq(
      '@media',
      optional(commaSep1($._query)),
      field('body', $.block),
    ),

    supports_statement: $ => seq(
      '@supports',
      $._query,
      field('body', $.block),
    ),

    container_statement: $ => seq(
      '@container',
      optional(commaSep1(choice(
        seq(field('name', alias($.identifier, $.container_name)), optional($._query)),
        $._query,
      ))),
      field('body', $.block),
    ),

    layer_statement: $ => seq(
      '@layer',
      optional(commaSep1($.layer_name)),
      choice(';', field('body', $.block)),
    ),

    layer_name: _ => token(seq(
      seq(optional('-'), NAME_START, repeat(NAME_CHAR)),
      repeat(seq('.', optional('-'), NAME_START, repeat(NAME_CHAR))),
    )),

    scope_statement: $ => seq(
      '@scope',
      optional(seq('(', field('start', $.selectors), ')')),
      optional(seq('to', '(', field('end', $.selectors), ')')),
      field('body', $.block),
    ),

    page_statement: $ => seq(
      '@page',
      optional(field('selectors', $.selectors)),
      field('body', $.block),
    ),

    keyframes_statement: $ => seq(
      choice('@keyframes', '@-webkit-keyframes', '@-moz-keyframes', '@-o-keyframes'),
      field('name', choice(alias($.identifier, $.keyframes_name), $.string_value)),
      field('blocks', $.keyframe_block_list),
    ),

    keyframe_block_list: $ => seq('{', repeat(choice($.keyframe_block, ';')), '}'),

    keyframe_block: $ => seq(
      commaSep1(field('selector', choice(
        'from',
        'to',
        $.number_value,
        // Timeline ranges: `entry 10%`.
        seq(alias($.identifier, $.plain_value), $.number_value),
      ))),
      field('body', $.block),
    ),

    // Any other at-rule: `@font-face`, `@property`, `@counter-style`,
    // `@starting-style`, page margin boxes, and ones not invented yet.
    at_rule: $ => seq(
      field('name', $.at_keyword),
      repeat(field('prelude', $._nested_component)),
      choice(';', field('body', $.block)),
    ),

    at_keyword: _ => token(seq('@', optional('-'), NAME_START, repeat(NAME_CHAR))),

    // Media, supports and container queries

    _query: $ => choice(
      // `screen`, `(color)`, and custom media `(--narrow)`.
      alias(choice($.identifier, $.dashed_identifier), $.keyword_query),
      $.feature_query,
      $.range_query,
      $.parenthesized_query,
      $.binary_query,
      $.unary_query,
      $.selector_query,
      $.call_expression,
    ),

    feature_query: $ => seq(
      '(',
      field('feature', alias(choice($.identifier, $.dashed_identifier), $.feature_name)),
      ':',
      repeat1(field('value', $._nested_component)),
      ')',
    ),

    // `(width >= 600px)`, `(400px < width < 800px)`.
    range_query: $ => seq(
      '(',
      $._range_value,
      $._range_operator,
      $._range_value,
      optional(seq($._range_operator, $._range_value)),
      ')',
    ),

    _range_value: $ => choice(
      alias($.identifier, $.plain_value),
      $.number_value,
      $.call_expression,
    ),

    _range_operator: _ => choice('<', '<=', '>', '>=', '='),

    parenthesized_query: $ => seq('(', $._query, ')'),

    binary_query: $ => prec.left(seq(
      field('left', $._query),
      field('operator', choice('and', 'or')),
      field('right', $._query),
    )),

    // `not` and `only` apply to the whole query after them: `not print and
    // (color)` is `not (print and (color))`.
    unary_query: $ => prec.right(-1, seq(
      field('operator', choice('not', 'only')),
      field('argument', $._query),
    )),

    selector_query: $ => seq(
      'selector',
      alias($._immediate_paren, '('),
      $._selector,
      ')',
    ),

    // Tokens

    identifier: _ => token(seq(optional('-'), NAME_START, repeat(NAME_CHAR))),

    // `--name`: custom properties and other author-defined names.
    dashed_identifier: _ => token(seq('--', repeat(NAME_CHAR))),

    _immediate_paren: _ => token.immediate('('),
    _immediate_colon: _ => token.immediate(':'),

    comment: _ => token(seq('/*', /[^*]*\*+([^/*][^*]*\*+)*/, '/')),
  },
});

/**
 * A simple selector that starts a compound selector after `start`, or
 * continues one when `start` follows it immediately.
 * @param {GrammarSymbols<string>} $
 * @param {string} start
 * @param {RuleOrLiteral} rest
 */
function compound($, start, rest) {
  return choice(
    seq(start, rest),
    seq(
      field('selector', $._compound_selector),
      alias(token.immediate(start), start),
      rest,
    ),
  );
}

/**
 * A combinator between two selectors, or before one.
 * @param {GrammarSymbols<string>} $
 * @param {string} op
 */
function combinator($, op) {
  return prec.left(seq(
    optional(field('left', $._selector)),
    op,
    field('right', $._compound_selector),
  ));
}

/**
 * One or more `rule`s separated by commas.
 * @param {RuleOrLiteral} rule
 */
function commaSep1(rule) {
  return seq(rule, repeat(seq(',', rule)));
}
