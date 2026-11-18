/**
 * @file KDL grammar for tree-sitter
 * @license MIT
 *
 * KDL 2.0 (https://kdl.dev), with no external scanner. KDL 1.0 documents
 * parse too where the two differ only in tokens: bare `true`, `false` and
 * `null`, `r"…"` / `r#"…"#` raw strings and the `\/` escape.
 *
 * Newlines end nodes, so they are tokens here rather than extras. A `\` line
 * continuation is an extra that swallows the newline after it.
 *
 * Without a scanner there is no way to match a closing `"###` against however
 * many `#`s opened a raw string, so raw strings are one token per hash count,
 * up to MAX_RAW_HASHES.
 */

/// <reference types="tree-sitter-cli/dsl" />
// @ts-check

const MAX_RAW_HASHES = 6;

// Unicode-space and newline code points from the spec's tables.
const UNICODE_SPACE = '\\t \\u00A0\\u1680\\u2000-\\u200A\\u202F\\u205F\\u3000';
const NEWLINE_CHARS = '\\n\\r\\u000B\\u000C\\u0085\\u2028\\u2029';
// Code points that may not appear literally anywhere (the BOM is allowed
// first in a file; it is whitespace here).
const DISALLOWED = '\\u0000-\\u0008\\u000E-\\u001F\\u007F\\u200E\\u200F\\u202A-\\u202E\\u2066-\\u2069\\uFEFF';
// Everything an identifier character may not be.
const NOT_IDENT = `\\\\/(){};\\[\\]"#=${UNICODE_SPACE}${NEWLINE_CHARS}${DISALLOWED}`;

const IDENT_CHAR = `[^${NOT_IDENT}]`;

/**
 * The rest of a raw string with `n` hashes, after its opening `#…#"`: a body
 * with no `"` followed by `n` hashes, then that closing sequence. With
 * `multiLine` false, the body has no newlines.
 * @param {number} n
 * @param {boolean} multiLine
 */
function rawStringTail(n, multiLine) {
  const nl = multiLine ? '' : NEWLINE_CHARS;
  // From a `"` in the body, up to n-1 hashes can follow before the body goes
  // on with another `"` or a character that is neither.
  const h = n > 1 ? `#{0,${n - 1}}` : '';
  return `([^"${nl}]|"(${h}")*${h}[^"#${nl}])*"(${h}")*#{${n}}`;
}

/**
 * The rest of a multi-line raw string with `n` hashes, after its opening
 * `#…#"""`: a body with no `"""` followed by `n` hashes, then that closing
 * sequence.
 * @param {number} n
 */
function multiLineRawStringTail(n) {
  // After three or more quotes, the body may go on with more quotes, or with
  // fewer than `n` hashes and three more quotes, before it returns to plain
  // text.
  const afterQuotes = n > 1
    ? `("|#{1,${n - 1}}""")*(#{0,${n - 1}}[^"#]|#{1,${n - 1}}""?[^"])`
    : '"*[^"#]';
  const close = n > 1 ? `("|#{1,${n - 1}}""")*#{${n}}` : '"*#';
  return `("{0,2}[^"]|"""${afterQuotes})*"""${close}`;
}

module.exports = grammar({
  name: 'kdl',

  extras: $ => [
    $._whitespace,
    $.line_comment,
    $.block_comment,
    $.line_continuation,
  ],

  word: $ => $.identifier,

  supertypes: $ => [$._value],

  rules: {
    document: $ => nodes($),

    node: $ => seq(
      optional($._slashdash),
      optional(field('type', $.type)),
      field('name', $._string),
      repeat(choice($.argument, $.property)),
      // At most one children block counts; commented-out ones may come
      // before and after it, but no entries.
      repeat(field('children', alias($._commented_children, $.children))),
      optional(seq(
        field('children', $.children),
        repeat(field('children', alias($._commented_children, $.children))),
      )),
    ),

    // `node-terminator` in the spec. A `//` comment before the newline is an
    // extra; the end of the file ends the last node of the document.
    _terminator: $ => choice($._newline, ';'),

    argument: $ => seq(
      optional($._slashdash),
      optional(field('type', $.type)),
      field('value', $._value),
    ),

    property: $ => seq(
      optional($._slashdash),
      field('key', $._string),
      '=',
      optional(field('type', $.type)),
      field('value', $._value),
    ),

    children: $ => seq('{', nodes($), '}'),

    _commented_children: $ => seq($._slashdash, '{', nodes($), '}'),

    type: $ => seq('(', $._string, ')'),

    // `/-` comments out the node, entry or children block after it, which
    // may start on a later line.
    _slashdash: $ => seq(alias('/-', $.slashdash), repeat($._newline)),

    _value: $ => choice(
      $._string,
      $.number,
      $.boolean,
      $.null,
    ),

    _string: $ => choice(
      $.identifier,
      $.string,
      $.raw_string,
    ),

    // An identifier may not start like a number: no leading digit, and no
    // digit after a leading sign or `.`. The spec also excludes `true`,
    // `false`, `null`, `inf`, `-inf` and `nan`; KDL 1.0's bare `true`,
    // `false` and `null` parse as keywords in value position.
    identifier: _ => token(choice(
      seq(
        new RegExp(`[^${NOT_IDENT}0-9+\\-.]`),
        new RegExp(`${IDENT_CHAR}*`),
      ),
      seq(
        /[+-]/,
        optional(seq(new RegExp(`[^${NOT_IDENT}0-9.]`), new RegExp(`${IDENT_CHAR}*`))),
      ),
      seq(
        /[+-]?\./,
        optional(seq(new RegExp(`[^${NOT_IDENT}0-9]`), new RegExp(`${IDENT_CHAR}*`))),
      ),
    )),

    string: $ => choice(
      seq(
        '"',
        repeat(choice(
          alias($._single_line_string_content, $.string_content),
          $.escape_sequence,
        )),
        token.immediate('"'),
      ),
      seq(
        '"""',
        repeat(choice(
          alias($._multi_line_string_content, $.string_content),
          alias($._multi_line_string_quotes, $.string_content),
          $.escape_sequence,
        )),
        token.immediate('"""'),
      ),
    ),

    // A raw newline is not allowed in a single-line string, so an
    // unterminated one ends at the end of its line.
    _single_line_string_content: _ => token.immediate(prec(1, new RegExp(`[^"\\\\${NEWLINE_CHARS}]+`))),

    // Any run without `\` or `"""`. Quotes right before a `\` are a token of
    // their own.
    _multi_line_string_content: _ => token.immediate(prec(1, /([^"\\]|"[^"\\]|""[^"\\])+/)),
    _multi_line_string_quotes: _ => token.immediate(/""?/),

    escape_sequence: _ => token.immediate(prec(1, seq(
      '\\',
      choice(
        /["\\bfnrts\/]/,
        /u\{[0-9a-fA-F]{1,6}\}/,
        // A whitespace escape drops the whitespace and newlines after it.
        new RegExp(`[${UNICODE_SPACE}${NEWLINE_CHARS}]+`),
      ),
    ))),

    // `#"…"#`, `##"…"##`, …; the body is taken literally, and `#"""` opens a
    // multi-line one. KDL 1.0 spelled them `r"…"`, `r#"…"#`, ….
    raw_string: _ => token(choice(
      ...range(1, MAX_RAW_HASHES).map(n => new RegExp(`#{${n}}"${rawStringTail(n, false)}`)),
      ...range(1, MAX_RAW_HASHES).map(n => new RegExp(`#{${n}}"""${multiLineRawStringTail(n)}`)),
      // KDL 1.0 raw strings may span lines.
      /r"[^"]*"/,
      ...range(1, MAX_RAW_HASHES).map(n => new RegExp(`r#{${n}}"${rawStringTail(n, true)}`)),
    )),

    number: _ => token(choice(
      /[+-]?[0-9][0-9_]*(\.[0-9][0-9_]*)?([eE][+-]?[0-9][0-9_]*)?/,
      /[+-]?0x[0-9a-fA-F][0-9a-fA-F_]*/,
      /[+-]?0o[0-7][0-7_]*/,
      /[+-]?0b[01][01_]*/,
      '#inf',
      '#-inf',
      '#nan',
    )),

    boolean: _ => choice('#true', '#false', 'true', 'false'),

    null: _ => choice('#null', 'null'),

    line_comment: _ => token(seq('//', new RegExp(`[^${NEWLINE_CHARS}]*`))),

    // Block comments nest: a nested one is an extra inside this one. Inside
    // one, `/` and `*` outrank a `//` comment, and `/*` and `*/` outrank them
    // in turn.
    block_comment: $ => seq(
      token(prec(2, '/*')),
      repeat(choice(
        token.immediate(prec(1, /[^*\/]+/)),
        token.immediate(prec(1, '*')),
        token.immediate(prec(1, '/')),
      )),
      token.immediate(prec(2, '*/')),
    ),

    // `escline` in the spec: a `\` joins the next line onto this node. A `//`
    // comment between the two is an extra of its own. (The spec also allows
    // a `\` right at the end of the file, which is an error here: an extra
    // must have one way to end.)
    line_continuation: $ => seq('\\', $._newline),

    _newline: _ => token(choice('\r\n', new RegExp(`[${NEWLINE_CHARS}]`))),

    _whitespace: _ => token(new RegExp(`[${UNICODE_SPACE}\\uFEFF]+`)),
  },
});

/**
 * The inside of a document or children block: nodes, each ended by a newline
 * or `;` except for the last one.
 * @param {GrammarSymbols<string>} $
 */
function nodes($) {
  return seq(
    repeat(choice($._newline, seq($.node, $._terminator))),
    optional($.node),
  );
}

/**
 * The integers from `start` to `end`, inclusive.
 * @param {number} start
 * @param {number} end
 */
function range(start, end) {
  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
}
