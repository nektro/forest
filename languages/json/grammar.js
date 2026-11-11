/**
 * @file JSON grammar for tree-sitter
 * @license MIT
 *
 * RFC 8259 JSON, plus what JSONC readers commonly accept: `//` and `/* *\/`
 * comments and a trailing comma in objects and arrays. A document is any
 * number of values, so JSON Lines and concatenated JSON parse too.
 *
 * Tokens follow the RFC: numbers have no leading zeros, `+`, leading or
 * trailing `.`, hex, `NaN` or `Infinity`; strings are double-quoted and may not
 * contain raw newlines; only the RFC's escape sequences are recognized.
 */

/// <reference types="tree-sitter-cli/dsl" />
// @ts-check

module.exports = grammar({
  name: 'json',

  extras: $ => [/\s/, $.comment],

  supertypes: $ => [$._value],

  rules: {
    document: $ => repeat($._value),

    _value: $ => choice(
      $.object,
      $.array,
      $.string,
      $.number,
      $.true,
      $.false,
      $.null,
    ),

    object: $ => seq('{', commaSep($.pair), '}'),

    pair: $ => seq(
      field('key', $.string),
      ':',
      field('value', $._value),
    ),

    array: $ => seq('[', commaSep($._value), ']'),

    string: $ => seq(
      '"',
      repeat(choice($.string_content, $.escape_sequence)),
      token.immediate('"'),
    ),

    // RFC 8259 forbids raw control characters in strings. Only newlines are
    // rejected here, so an unterminated string ends at the end of its line.
    string_content: _ => token.immediate(prec(1, /[^"\\\r\n]+/)),

    escape_sequence: _ => token.immediate(seq(
      '\\',
      /(["\\/bfnrt]|u[0-9a-fA-F]{4})/,
    )),

    number: _ => token(seq(
      optional('-'),
      choice('0', /[1-9][0-9]*/),
      optional(/\.[0-9]+/),
      optional(/[eE][+-]?[0-9]+/),
    )),

    true: _ => 'true',
    false: _ => 'false',
    null: _ => 'null',

    comment: _ => token(choice(
      seq('//', /[^\r\n]*/),
      seq('/*', /[^*]*\*+([^/*][^*]*\*+)*/, '/'),
    )),
  },
});

/**
 * Zero or more `rule`s separated by commas, with an optional trailing comma
 * after at least one.
 * @param {RuleOrLiteral} rule
 */
function commaSep(rule) {
  return optional(seq(rule, repeat(seq(',', rule)), optional(',')));
}
