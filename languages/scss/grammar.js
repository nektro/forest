/**
 * @file SCSS grammar for tree-sitter
 * @license MIT
 *
 * SCSS, the brace-and-semicolon syntax of Sass (not the indented `.sass`
 * syntax), with no external scanner.
 *
 * Two things in CSS usually need a scanner, and are done here in the grammar
 * instead:
 *
 * - Whitespace is significant in selectors: `a.b` is one compound selector
 *   and `a .b` is a descendant selector. Everything that continues a compound
 *   selector (`.b`, `#b`, `:b`, `::b`, `[b]`) is a separate `token.immediate`
 *   with a higher lexical precedence, so it only matches when nothing was
 *   skipped before it. The same trick glues interpolation onto names, as in
 *   `.col-#{$i}-md` or `margin-#{$side}`.
 *
 * - Inside a block, `a:hover {` is a nested rule and `color:red;` is a
 *   declaration, and the two cannot be told apart until the `{` or `;`. That
 *   spot is a declared conflict, and the GLR parser keeps both readings until
 *   one fails. The two never both succeed, since a declaration cannot be
 *   followed by a block.
 *
 * In SassScript, `-` is binary when whitespace follows it (`$a - $b`) and
 * unary otherwise (`$a -$b` is a two-item list), which keeps space-separated
 * lists unambiguous. Lists are flat: a declaration's value is just its items
 * and commas, as in tree-sitter-css.
 */

/// <reference types="tree-sitter-cli/dsl" />
// @ts-check

const PREC = {
  assign: 0,
  or: 1,
  and: 2,
  equality: 3,
  relational: 4,
  additive: 5,
  multiplicative: 6,
  unary: 7,
};

// Identifier characters: ASCII name characters, anything non-ASCII, and
// escapes.
const NAME_START = /[a-zA-Z_]|[^\x00-\x7F]|\\[^\r\n]/;
const NAME_CHAR = /[a-zA-Z0-9_-]|[^\x00-\x7F]|\\[^\r\n]/;

module.exports = grammar({
  name: 'scss',

  extras: $ => [/\s/, $.comment, $.single_line_comment],

  word: $ => $.identifier,

  supertypes: $ => [$._expression, $._selector],

  conflicts: $ => [
    // `a:hover {` against `a: hover;`, and `#{$x}: 1` against `#{$x} {`.
    [$._compound_selector, $._property_name],
    // `mat.$x: 1;` against `mat.x { }`.
    [$._compound_selector, $.namespaced_variable],
  ],

  rules: {
    stylesheet: $ => seq(repeat($._statement), optional($._last_statement)),

    // ------------------------------------------------------------------
    // Statements

    _statement: $ => choice(
      $.rule_set,
      $.declaration,
      $.nested_property,
      $.variable_declaration,
      $.keyframe_block,
      $.use_statement,
      $.forward_statement,
      $.import_statement,
      $.charset_statement,
      $.mixin_statement,
      $.function_statement,
      $.include_statement,
      $.content_statement,
      $.extend_statement,
      $.return_statement,
      $.if_statement,
      $.each_statement,
      $.for_statement,
      $.while_statement,
      $.debug_statement,
      $.warn_statement,
      $.error_statement,
      $.at_root_statement,
      $.media_statement,
      $.supports_statement,
      $.container_statement,
      $.keyframes_statement,
      $.page_statement,
      $.scope_statement,
      $.at_rule,
      ';',
    ),

    // The last statement in a block or file may leave out its semicolon.
    _last_statement: $ => choice(
      alias($._declaration_body, $.declaration),
      alias($._variable_declaration_body, $.variable_declaration),
      alias($._include_body, $.include_statement),
      alias($._content_body, $.content_statement),
      alias($._extend_body, $.extend_statement),
      alias($._return_body, $.return_statement),
      alias($._debug_body, $.debug_statement),
      alias($._warn_body, $.warn_statement),
      alias($._error_body, $.error_statement),
    ),

    block: $ => seq('{', repeat($._statement), optional($._last_statement), '}'),

    rule_set: $ => seq(field('selectors', $.selectors), field('body', $.block)),

    declaration: $ => seq($._declaration_body, ';'),

    _declaration_body: $ => seq(
      field('property', $._property_name),
      $._colon,
      repeat($._value_item),
    ),

    // `font: { family: x; size: y; }`
    nested_property: $ => seq(
      field('property', $._property_name),
      $._colon,
      field('body', $.block),
    ),

    // A declaration's colon may touch the property, which lexes as the
    // immediate colon of a pseudo-class.
    _colon: $ => choice(':', $._immediate_colon),

    _property_name: $ => named($, $.property_name),

    variable_declaration: $ => seq($._variable_declaration_body, ';'),

    _variable_declaration_body: $ => seq(
      field('name', choice($.variable, $.namespaced_variable)),
      ':',
      repeat1(choice($._value_item, $.default_flag, $.global_flag)),
    ),

    // `0% { }`, `from { }` and `to { }` in `@keyframes`, or in a mixin that
    // is included in one.
    keyframe_block: $ => seq(
      field('selectors', alias($._keyframe_selectors, $.keyframe_selectors)),
      field('body', $.block),
    ),

    _keyframe_selectors: $ => commaSep1(choice('from', 'to', $.number)),

    // ------------------------------------------------------------------
    // Modules

    use_statement: $ => seq(
      '@use',
      field('path', $.string),
      optional(seq('as', field('namespace', choice('*', $.identifier)))),
      optional(seq('with', field('configuration', $.map))),
      ';',
    ),

    forward_statement: $ => seq(
      '@forward',
      field('path', $.string),
      optional(seq('as', field('prefix', $.forward_prefix))),
      optional(seq(choice('show', 'hide'), commaSep1(choice($.identifier, $.variable)))),
      optional(seq('with', field('configuration', $.map))),
      ';',
    ),

    forward_prefix: _ => token(seq(/[a-zA-Z_-]/, /[a-zA-Z0-9_-]*/, '*')),

    import_statement: $ => seq(
      '@import',
      commaSep1(choice($.string, $.url, $.call_expression)),
      optional(seq($._query_start, repeat($._query_item))),
      ';',
    ),

    charset_statement: $ => seq('@charset', $.string, ';'),

    // ------------------------------------------------------------------
    // Mixins and functions

    mixin_statement: $ => seq(
      '@mixin',
      field('name', $.identifier),
      optional(field('parameters', $.parameters)),
      field('body', $.block),
    ),

    function_statement: $ => seq(
      '@function',
      field('name', $.identifier),
      field('parameters', $.parameters),
      field('body', $.block),
    ),

    parameters: $ => seq(
      '(',
      optional(seq(commaSep1($.parameter), optional(','))),
      ')',
    ),

    parameter: $ => choice(
      seq(field('name', $.variable), optional(seq(':', field('default', $._parameter_default)))),
      seq(field('name', $.variable), '...'),
    ),

    _parameter_default: $ => prec.right(repeat1($._expression)),

    include_statement: $ => seq(
      $._include_body,
      choice(';', seq(
        optional(seq('using', field('using', $.parameters))),
        field('body', $.block),
      )),
    ),

    _include_body: $ => seq(
      '@include',
      field('name', choice($.identifier, $.namespaced_name)),
      optional(field('arguments', $.arguments)),
    ),

    content_statement: $ => seq($._content_body, ';'),

    _content_body: $ => seq('@content', optional(field('arguments', $.arguments))),

    return_statement: $ => seq($._return_body, ';'),

    _return_body: $ => seq('@return', repeat1($._value_item)),

    extend_statement: $ => seq($._extend_body, ';'),

    _extend_body: $ => seq('@extend', $.selectors, optional($.optional_flag)),

    // ------------------------------------------------------------------
    // Control flow

    if_statement: $ => prec.right(seq(
      '@if',
      field('condition', $._expression),
      field('consequence', $.block),
      repeat(field('alternative', $.else_if_clause)),
      optional(field('alternative', $.else_clause)),
    )),

    else_if_clause: $ => seq(
      choice(seq('@else', 'if'), '@elseif'),
      field('condition', $._expression),
      field('consequence', $.block),
    ),

    else_clause: $ => seq('@else', field('body', $.block)),

    each_statement: $ => seq(
      '@each',
      commaSep1($.variable),
      'in',
      field('value', alias($._each_value, $.value)),
      field('body', $.block),
    ),

    _each_value: $ => repeat1($._value_item),

    for_statement: $ => seq(
      '@for',
      field('variable', $.variable),
      'from',
      field('from', $._expression),
      choice('through', 'to'),
      field('to', $._expression),
      field('body', $.block),
    ),

    while_statement: $ => seq(
      '@while',
      field('condition', $._expression),
      field('body', $.block),
    ),

    debug_statement: $ => seq($._debug_body, ';'),
    _debug_body: $ => seq('@debug', repeat1($._value_item)),

    warn_statement: $ => seq($._warn_body, ';'),
    _warn_body: $ => seq('@warn', repeat1($._value_item)),

    error_statement: $ => seq($._error_body, ';'),
    _error_body: $ => seq('@error', repeat1($._value_item)),

    at_root_statement: $ => seq(
      '@at-root',
      optional(choice($.selectors, $.at_root_query)),
      field('body', $.block),
    ),

    // `(without: media)`
    at_root_query: $ => seq(
      '(',
      choice('with', 'without'),
      ':',
      repeat1(choice($.identifier, $.interpolation)),
      ')',
    ),

    // ------------------------------------------------------------------
    // CSS at-rules

    media_statement: $ => seq('@media', repeat1($._query_item), field('body', $.block)),

    supports_statement: $ => seq('@supports', repeat1($._query_item), field('body', $.block)),

    container_statement: $ => seq('@container', repeat1($._query_item), field('body', $.block)),

    // Media, supports and container conditions are a loose run of keywords,
    // names and parenthesized features, so that anything Sass accepts in
    // them, interpolation included, parses.
    _query_item: $ => choice($._query_start, ','),

    _query_start: $ => choice(
      'and',
      'not',
      'only',
      'or',
      alias($.identifier, $.keyword_query),
      alias($._interpolated_name, $.keyword_query),
      $.interpolation,
      $.variable,
      $.namespaced_variable,
      $.string,
      $.feature_query,
      $.selector_query,
    ),

    feature_query: $ => seq(
      '(',
      choice(
        seq(field('feature', $._property_name), ':', repeat1($._value_item)),
        repeat1(choice(
          $._query_item,
          $.number,
          '<', '>', '<=', '>=', '=',
        )),
      ),
      ')',
    ),

    // `selector(:has(a))` in `@supports`
    selector_query: $ => seq(
      'selector',
      $._immediate_paren,
      $.selectors,
      ')',
    ),

    keyframes_statement: $ => seq(
      field('keyword', $.keyframes_keyword),
      field('name', choice($.identifier, $._interpolated_name, $.interpolation, $.string)),
      field('body', $.block),
    ),

    keyframes_keyword: _ => /@(-[a-zA-Z]+-)?keyframes/,

    page_statement: $ => seq('@page', optional($.selectors), field('body', $.block)),

    // `@scope (.card) to (.content) { }`
    scope_statement: $ => seq(
      '@scope',
      optional(seq('(', field('root', $.selectors), ')')),
      optional(seq('to', '(', field('limit', $.selectors), ')')),
      field('body', $.block),
    ),

    // Any other at-rule: `@font-face`, `@layer`, `@property`, `@namespace`...
    at_rule: $ => seq(
      field('keyword', $.at_keyword),
      repeat($._value_item),
      choice(';', field('body', $.block)),
    ),

    at_keyword: _ => /@[a-zA-Z_-][a-zA-Z0-9_-]*/,

    // ------------------------------------------------------------------
    // Selectors

    selectors: $ => commaSep1($._selector),

    _selector: $ => choice(
      $._compound_selector,
      $.descendant_selector,
      $.child_selector,
      $.adjacent_sibling_selector,
      $.sibling_selector,
    ),

    _compound_selector: $ => choice(
      named($, $.tag_name),
      $.universal_selector,
      $.nesting_selector,
      $.placeholder_selector,
      $.class_selector,
      $.id_selector,
      $.attribute_selector,
      $.pseudo_class_selector,
      $.pseudo_element_selector,
    ),


    universal_selector: _ => '*',

    // `&`, `&-suffix`, `&__element`, `&--#{$modifier}`
    nesting_selector: $ => prec.right(seq(
      '&',
      optional(alias($._suffix, $.suffix)),
    )),

    _suffix: $ => prec.right(repeat1($._name_part)),

    placeholder_selector: $ => seq('%', field('name', named($, $.placeholder_name))),

    class_selector: $ => prec(1, choice(
      seq('.', field('name', named($, $.class_name))),
      seq($._compound_selector, $._immediate_dot, field('name', named($, $.class_name))),
    )),

    id_selector: $ => prec(1, choice(
      seq('#', field('name', named($, $.id_name))),
      seq($._compound_selector, $._immediate_hash, field('name', named($, $.id_name))),
    )),

    attribute_selector: $ => prec(1, seq(
      optional($._compound_selector),
      choice('[', $._immediate_bracket),
      field('name', named($, $.attribute_name)),
      optional(seq(
        choice('=', '~=', '|=', '^=', '$=', '*='),
        field('value', choice($.string, $.identifier, $._interpolated_name, $.number)),
        optional(field('flag', $.identifier)),
      )),
      ']',
    )),

    pseudo_class_selector: $ => prec(1, seq(
      choice(':', seq($._compound_selector, $._immediate_colon)),
      field('name', named($, $.pseudo_class_name)),
      optional(field('arguments', $.pseudo_arguments)),
    )),

    pseudo_element_selector: $ => prec(1, seq(
      choice('::', seq($._compound_selector, $._immediate_double_colon)),
      field('name', named($, $.pseudo_element_name)),
      optional(field('arguments', $.pseudo_arguments)),
    )),

    // `:not(.a, .b)`, `:nth-child(2n + 1 of .x)`, `:lang(en)`
    pseudo_arguments: $ => seq(
      $._immediate_paren,
      optional(choice(
        $.selectors,
        seq($.nth, optional(seq('of', $.selectors))),
        $.string,
      )),
      ')',
    ),

    nth: _ => token(choice(
      /[+-]?\d*[nN](\s*[+-]\s*\d+)?/,
      /[+-]?\d+/,
    )),

    descendant_selector: $ => prec.left(seq($._selector, $._compound_selector)),

    child_selector: $ => choice(
      prec.left(seq(optional($._selector), '>', $._compound_selector)),
      prec(-1, seq($._selector, '>')),
    ),

    adjacent_sibling_selector: $ => choice(
      prec.left(seq(optional($._selector), '+', $._compound_selector)),
      prec(-1, seq($._selector, '+')),
    ),

    sibling_selector: $ => choice(
      prec.left(seq(optional($._selector), '~', $._compound_selector)),
      prec(-1, seq($._selector, '~')),
    ),

    _immediate_dot: _ => token.immediate(prec(1, '.')),
    _immediate_hash: _ => token.immediate(prec(1, '#')),
    _immediate_colon: _ => token.immediate(prec(1, ':')),
    _immediate_double_colon: _ => token.immediate(prec(1, '::')),
    _immediate_bracket: _ => token.immediate(prec(1, '[')),
    _immediate_paren: _ => token.immediate(prec(1, '(')),

    // ------------------------------------------------------------------
    // Names with interpolation

    // A name with at least one interpolation in it: `#{$x}`, `col-#{$i}`,
    // `#{$a}-#{$b}-c`. Every part after the first touches the one before.
    _interpolated_name: $ => seq(
      choice($.identifier, $.interpolation),
      repeat1($._name_part),
    ),

    // In selectors and property names, a lone interpolation is a name too,
    // and so is one after a `-` (`-#{$vendor}-transition`).
    _name_with_interpolation: $ => choice(
      $._interpolated_name,
      $.interpolation,
      seq('-', $._name_part, repeat($._name_part)),
    ),

    _name_part: $ => choice(
      $._name_continuation,
      alias($._immediate_interpolation, $.interpolation),
    ),

    _name_continuation: _ => token.immediate(prec(1, /([a-zA-Z0-9_-]|[^\x00-\x7F]|\\[^\r\n])+/)),

    interpolation: $ => seq('#{', repeat($._value_item), '}'),

    _immediate_interpolation: $ => seq(
      token.immediate(prec(1, '#{')),
      repeat($._value_item),
      '}',
    ),

    // ------------------------------------------------------------------
    // SassScript

    // Items of a flat list: expressions and the commas between them.
    _value_item: $ => choice($._expression, ','),

    _expression: $ => choice(
      $.binary_expression,
      $.unary_expression,
      $.identifier,
      alias($._interpolated_name, $.interpolated_identifier),
      $.interpolation,
      $.variable,
      $.namespaced_variable,
      $.number,
      $.color,
      $.string,
      $.boolean,
      $.null,
      $.important,
      $.unicode_range,
      $.url,
      $.call_expression,
      $.if_expression,
      $.parenthesized_expression,
      $.map,
      $.bracketed_list,
      $.nesting_selector,
    ),

    binary_expression: $ => {
      const table = [
        [PREC.assign, '='],
        [PREC.or, 'or'],
        [PREC.and, 'and'],
        [PREC.equality, choice('==', '!=')],
        [PREC.relational, choice('<', '>', '<=', '>=')],
        [PREC.additive, choice('+', $._binary_minus)],
        [PREC.multiplicative, choice('*', '/', '%')],
      ];
      return choice(...table.map(([p, op]) => prec.left(p, seq(
        field('left', $._expression),
        field('operator', op),
        field('right', $._expression),
      ))));
    },

    // `-` followed by whitespace. A `-` touching what follows is unary.
    _binary_minus: _ => alias(token(seq('-', /\s/)), '-'),

    unary_expression: $ => prec(PREC.unary, seq(
      field('operator', choice('-', 'not')),
      field('argument', $._expression),
    )),

    parenthesized_expression: $ => seq('(', repeat($._value_item), ')'),

    map: $ => seq('(', commaSep1($.pair), optional(','), ')'),

    pair: $ => seq(
      field('key', $._expression),
      ':',
      field('value', alias($._pair_value, $.value)),
    ),

    // `!default` is for `@forward ... with ($a: 1 !default)`.
    _pair_value: $ => prec.right(seq(repeat1($._expression), optional($.default_flag))),

    bracketed_list: $ => seq('[', repeat($._value_item), ']'),

    call_expression: $ => seq(
      field('function', choice($.identifier, $.namespaced_name)),
      field('arguments', $.arguments),
    ),

    // `if($condition, $if-true, $if-false)`, or the CSS-style
    // `if(sass($a > 1): x; else: y)`.
    if_expression: $ => seq(
      'if',
      field('arguments', choice(
        $.arguments,
        alias($._if_branches, $.if_branches),
      )),
    ),

    _if_branches: $ => seq(
      $._immediate_paren,
      $.if_branch,
      repeat(seq(';', $.if_branch)),
      optional(';'),
      ')',
    ),

    if_branch: $ => seq(
      field('condition', $._expression),
      ':',
      field('value', alias($._if_value, $.value)),
    ),

    _if_value: $ => repeat1($._value_item),

    namespaced_name: $ => seq(
      field('namespace', alias($.identifier, $.module)),
      $._immediate_dot,
      field('name', $.identifier),
    ),

    namespaced_variable: $ => seq(
      field('namespace', alias($.identifier, $.module)),
      $._immediate_dot,
      field('name', $.variable),
    ),

    arguments: $ => seq(
      $._immediate_paren,
      repeat(choice($._value_item, $.keyword_argument, '...')),
      ')',
    ),

    // Wins over an `if()` branch whose condition is a bare variable, which
    // CSS-style `if()` does not allow anyway.
    keyword_argument: $ => prec(1, seq(
      field('name', $.variable),
      ':',
      field('value', alias($._pair_value, $.value)),
    )),

    // ------------------------------------------------------------------
    // Tokens

    identifier: _ => token(seq(
      choice('--', seq(optional('-'), NAME_START)),
      repeat(NAME_CHAR),
    )),

    variable: _ => token(seq('$', choice(/[a-zA-Z_-]/, /[^\x00-\x7F]/), repeat(NAME_CHAR))),

    number: $ => seq(
      $._number_literal,
      optional($.unit),
    ),

    _number_literal: _ => token(seq(
      optional(/[+-]/),
      choice(/\d+(\.\d+)?/, /\.\d+/),
      optional(/[eE][+-]?\d+/),
    )),

    unit: _ => token.immediate(prec(1, /[a-zA-Z][a-zA-Z0-9]*|%/)),

    color: _ => /#[0-9a-fA-F]{3,8}/,

    string: $ => choice(
      seq(
        '"',
        repeat(choice(
          alias($._double_string_content, $.string_content),
          $.escape_sequence,
          alias($._immediate_interpolation, $.interpolation),
          alias($._string_hash, $.string_content),
        )),
        token.immediate('"'),
      ),
      seq(
        "'",
        repeat(choice(
          alias($._single_string_content, $.string_content),
          $.escape_sequence,
          alias($._immediate_interpolation, $.interpolation),
          alias($._string_hash, $.string_content),
        )),
        token.immediate("'"),
      ),
    ),

    _double_string_content: _ => token.immediate(prec(1, /[^"\\#\r\n]+/)),
    _single_string_content: _ => token.immediate(prec(1, /[^'\\#\r\n]+/)),
    _string_hash: _ => token.immediate('#'),

    escape_sequence: _ => token.immediate(choice(
      /\\[0-9a-fA-F]{1,6}[ \t]?/,
      /\\\r?\n/,
      /\\[^0-9a-fA-F\r\n]/,
    )),

    boolean: _ => choice('true', 'false'),

    null: _ => 'null',

    important: _ => token(seq('!', /[ \t]*/, /[iI][mM][pP][oO][rR][tT][aA][nN][tT]/)),
    default_flag: _ => token(seq('!', /[ \t]*/, 'default')),
    global_flag: _ => token(seq('!', /[ \t]*/, 'global')),
    optional_flag: _ => token(seq('!', /[ \t]*/, 'optional')),

    // `U+0025-00FF`, `U+4??`
    unicode_range: _ => /[uU]\+[0-9a-fA-F?]{1,6}(-[0-9a-fA-F]{1,6})?/,

    // An unquoted `url(...)`. Following Sass, it may not contain `$`, quotes,
    // parentheses or unescaped spaces outside interpolation; anything else is
    // an ordinary call. Interpolation in it is not parsed.
    url: _ => token(seq(
      /[uU][rR][lL]\(/,
      /[ \t\r\n]*/,
      repeat(choice(/[!#%&*-~]/, /[^\x00-\x7F]/, /\\[^\r\n]/, /#\{[^}]*\}/)),
      /[ \t\r\n]*/,
      ')',
    )),

    comment: _ => token(seq('/*', /[^*]*\*+([^/*][^*]*\*+)*/, '/')),

    single_line_comment: _ => token(seq('//', /[^\r\n]*/)),
  },
});

/**
 * A name that is a plain identifier (a leaf) or has interpolation in it.
 *
 * @param {GrammarSymbols<string>} $
 * @param {RuleOrLiteral} name
 */
function named($, name) {
  return choice(
    alias($.identifier, name),
    alias($._name_with_interpolation, name),
  );
}

/**
 * @param {RuleOrLiteral} rule
 */
function commaSep1(rule) {
  return seq(rule, repeat(seq(',', rule)));
}
