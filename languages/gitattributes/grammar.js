/**
 * @file gitattributes grammar for tree-sitter
 * @license MIT
 *
 * Follows gitattributes(5) as git's attr.c reads it, with no external
 * scanner:
 *
 * - Each line is blank, a comment (`#` as the first non-blank character), a
 *   macro definition (`[attr]name attr...`) or a pattern followed by
 *   attributes. Blanks are spaces, tabs and carriage returns, so CRLF files
 *   parse like LF ones.
 * - A pattern runs to the first blank. One that starts with `"` is C-quoted
 *   instead and ends at the closing quote; attributes may follow it directly.
 * - Unquoted patterns are split into glob pieces: wildcards (`*`, `**`, `?`),
 *   bracket expressions (`[a-z]`, `[[:digit:]]`) and backslash escapes. A `[`
 *   with no closing `]` is literal, as in git.
 * - Attributes are `name` (set), `-name` (unset), `!name` (unspecified) or
 *   `name=value`, separated by blanks.
 */

/// <reference types="tree-sitter-cli/dsl" />
// @ts-check

const BLANK = ' \\t\\r';

module.exports = grammar({
  name: 'gitattributes',

  // Blanks separate patterns from attributes, so they are explicit.
  extras: _ => [],

  rules: {
    source_file: $ => seq(
      repeat(seq(optional($._line), $._newline)),
      optional($._line),
    ),

    _line: $ => choice(
      $._blank,
      seq(optional($._blank), $._entry),
    ),

    _entry: $ => choice(
      seq($.comment, optional($._blank)),
      $.macro_definition,
      $.rule,
    ),

    _newline: _ => '\n',

    _blank: _ => token(new RegExp(`[${BLANK}]+`)),

    // A comment is a whole line. Carriage returns at its end are left out.
    comment: _ => token(prec(3, /#[^\r\n]*(\r+[^\r\n]+)*/)),

    // `pattern attr attr ...`
    rule: $ => choice(
      seq(
        field('pattern', $.pattern),
        repeat(seq($._blank, $.attribute)),
        optional($._blank),
      ),
      seq(
        field('pattern', $.quoted_pattern),
        optional(seq(
          optional($._blank),
          $.attribute,
          repeat(seq($._blank, $.attribute)),
        )),
        optional($._blank),
      ),
    ),

    // `[attr]name attr attr ...`
    macro_definition: $ => seq(
      token(prec(2, '[attr]')),
      field('name', $.attribute_name),
      repeat(seq($._blank, $.attribute)),
      optional($._blank),
    ),

    // Negative patterns are not allowed in gitattributes; git warns and
    // ignores the line. They still parse, with the `!` as its own token.
    pattern: $ => seq(
      optional('!'),
      repeat1(choice(
        $._pattern_text,
        $._literal_bracket,
        $.wildcard,
        $.bracket_expression,
        $.escape_sequence,
      )),
    ),

    _pattern_text: _ => token(new RegExp(`[^${BLANK}\\n*?\\[\\\\]+`)),

    // `[` that does not start a bracket expression. The lexer falls back to
    // it when no `]` closes the expression.
    _literal_bracket: _ => '[',

    wildcard: _ => /\*+|\?/,

    bracket_expression: _ => token(prec(1, new RegExp(
      '\\[[!^]?\\]?' +
      `(\\[:[a-zA-Z]+:\\]|\\\\[^${BLANK}\\n]|[^\\]\\\\${BLANK}\\n])*` +
      '\\]',
    ))),

    escape_sequence: _ => token(new RegExp(`\\\\[^${BLANK}\\n]?`)),

    quoted_pattern: $ => seq(
      token(prec(2, '"')),
      repeat(choice(
        token.immediate(/[^"\\\n]+/),
        alias($._quoted_escape, $.escape_sequence),
      )),
      token.immediate('"'),
    ),

    _quoted_escape: _ => token.immediate(/\\([0-7]{3}|[^\n])/),

    attribute: $ => choice(
      seq(
        field('state', choice('-', '!')),
        field('name', $.attribute_name),
        // git accepts and ignores a value here: `-foo=bar` unsets foo.
        optional(seq('=', optional(field('value', $.attribute_value)))),
      ),
      seq(
        field('name', $.attribute_name),
        optional(seq('=', optional(field('value', $.attribute_value)))),
      ),
    ),

    attribute_name: _ => /[A-Za-z0-9_.][-A-Za-z0-9_.]*/,

    attribute_value: _ => token(new RegExp(`[^${BLANK}\\n]+`)),
  },
});
