/**
 * @file YAML grammar for tree-sitter
 * @license MIT
 *
 * YAML 1.2, with no external scanner.
 *
 * YAML's block collections are delimited by indentation. Other grammars keep
 * a stack of indentation widths in an external scanner. Here, as in this
 * repository's Python grammar, the line breaks carry the indentation instead:
 *
 * - **A line break is one token per indentation width.** `_nl_4` is a line
 *   break (with any blank lines before it) followed by 4 spaces. Widths from
 *   0 to MAX_INDENT - 1 have a token each, and deeper lines share `_nl_deep`.
 *   The lexer takes the longest match, so the token says exactly how far the
 *   next line is indented.
 * - **A block collection is a run of entries separated by line breaks of one
 *   width.** `_bmap_4` is `pair (_nl_4 pair)*` and `_bseq_4` is
 *   `item (_nl_4 item)*`. A value on the lines after its key is a node of any
 *   greater width; a sequence may also have the width of its key. The
 *   collection ends at any other line break, which belongs to an enclosing
 *   collection.
 * - **Compact collections take their width from the indicator token.** `- `
 *   is one token per number of spaces after the dash (`_dash_2` for `- `,
 *   `_dash_4` for `-   `), so in `_bseq_4` the mapping in `-   a: 1` is
 *   `_bmap_8`. The same goes for `? ` and the `: ` of an explicit value.
 * - **Text that runs on to more indented lines carries its line break.** A
 *   line of a block scalar (`|`, `>`) under a node at width 4 is
 *   `_bsl_4`: a line break, at least 5 spaces, and the rest of the line. A
 *   plain scalar's continuation line is `_cont_4` the same way. As the longer
 *   match, either beats the line break token of its width.
 * - **Inside flow collections a line break is a space.** No line break
 *   token is valid inside `[]` or `{}`, so there the lexer takes the
 *   `_line_break_space` extra instead.
 * - **A comment on a line of its own takes the line break before it.**
 *   Otherwise a comment at a smaller indentation would end the collections
 *   around it.
 * - **The first line has no line break before it**, so its indentation is a
 *   token of its own (`_first_indent_4`), valid only at the start of the
 *   input.
 *
 * The parser never compares widths. A collection goes on at its own width
 * and ends at any other; a value on the next lines may be at any greater
 * width, which in valid YAML differs from the widths of the collections
 * around it.
 */

/// <reference types="tree-sitter-cli/dsl" />
// @ts-check

// Indentation widths (in spaces) with a line break token of their own.
// Deeper lines share `_nl_deep`, so collections nested that deep are not told
// apart.
const MAX_INDENT = 32;
/** @typedef {number | 'deep'} Width */
/** @type {Width[]} */
const WIDTHS = [...Array(MAX_INDENT).keys(), 'deep'];

// Lengths of the `- `, `? ` and `: ` indicator tokens: the character and up
// to MAX_GAP - 1 spaces. Longer gaps share the last token.
const MAX_GAP = 4;
const GAPS = [...Array(MAX_GAP).keys()].map((k) => k + 1);

// Lexical precedence. A comment and a plain scalar's continuation line
// outrank the line breaks (the lexer does not otherwise go on from a line
// break token to a longer token that starts with it); the text of a quoted or
// block scalar outranks a comment, so `"# x"` is a string; the document
// markers outrank the line breaks and the lines of a block scalar.
const LEX = {
  COMMENT: 1,
  TEXT: 2,
  ESCAPE: 3,
  MARKER: 4,
};

/** @param {Width} w @param {number} k @returns {Width} */
function widthAdd(w, k) {
  if (w === 'deep' || w + k >= MAX_INDENT) return 'deep';
  return w + k;
}

/** Widths greater than `w`. @param {Width} w @returns {Width[]} */
function widthsAbove(w) {
  return w === 'deep' ? ['deep'] : WIDTHS.filter((m) => m === 'deep' || m > w);
}

const BLANK_LINES = '(\\r?\\n[ \\t]*)*\\r?\\n';

// A line that does not start with `---` or `...` followed by a space.
const ROOT_LINE = (() => {
  const any = '[^\\r\\n]*';
  /** @param {string} c */
  const notMarker = (c) => [
    `${c}([^${c}\\r\\n]${any})?`,
    `${c}${c}([^${c}\\r\\n]${any})?`,
    `${c}${c}${c}[^ \\t\\r\\n]${any}`,
  ];
  return `([^\\-.\\r\\n]${any}|${[...notMarker('-'), ...notMarker('\\.')].join('|')})?`;
})();

// A regex source for spaces of exactly width `w` (or at least MAX_INDENT).
/** @param {Width} w */
function spaces(w) {
  // (Written as `{n}` then `*`: `{n,}` did not match more than n characters.)
  if (w === 'deep') return `[ ]{${MAX_INDENT}}[ ]*`;
  return w === 0 ? '' : `[ ]{${w}}`;
}

// A regex source for spaces wider than `w`.
/** @param {Width} w */
function spacesAbove(w) {
  if (w === 'deep') return `[ ]{${MAX_INDENT + 1}}[ ]*`;
  return `[ ]{${w + 1}}[ ]*`;
}

// Plain scalars. In the block context a plain scalar may hold `,[]{}`; in a
// flow collection it may not. It never holds `: ` or ` #`, and does not start
// with an indicator unless it is `-`, `?` or `:` followed by a non-space.
/** @param {boolean} flow */
function plainParts(flow) {
  const f = flow ? ',\\[\\]{}' : '';
  const first = `([^\\s\\-?:,\\[\\]{}#&*!|>'"%@\`]|[-?:]+[^\\s:${f}])`;
  const unit = `([^\\s:${f}]|:+[^\\s:${f}])`;
  const wordStart = `([^\\s:#${f}]|:+[^\\s:${f}])`;
  const rest = `${unit}*([ \\t]+${wordStart}${unit}*)*`;
  return { first, rest, wordStart };
}
const PLAIN = plainParts(false);
const PLAIN_FLOW = plainParts(true);

/**
 * @param {RuleOrLiteral} rule
 * @param {RuleOrLiteral} separator
 */
function sep1(rule, separator) {
  return seq(rule, repeat(seq(separator, rule)));
}

module.exports = grammar({
  name: 'yaml',

  extras: $ => [
    $.comment,
    /[ \t\uFEFF]/,
    $._line_break_space,
  ],

  conflicts: $ => [
    ...WIDTHS.flatMap((w) => [
      // After a sequence entry at the width of the key whose value the
      // sequence is, a line break of that width is followed by the next
      // entry or by the next key of the mapping.
      [$[`_bseq_inmap_${w}`]],
      // After `key:` with nothing after it, likewise: the line break may
      // start a sequence at the key's width or the next key.
      [$[`_pair_${w}`]],
      // The same after `key: &anchor`.
      [$[`_props_inmap_${w}`], $[`_indicator_rest_${w}`]],
    ]),
  ],

  rules: {
    stream: $ => seq(
      optional(alias($._first_document, $.document)),
      repeat(alias($._document, $.document)),
      // The line break after a final `...`, or the only one in an input of
      // comments.
      optional($._newline),
    ),

    _newline: $ => choice(...WIDTHS.map((w) => $[`_nl_${w}`])),

    // Documents
    // ---------

    // A document that starts on the first line of the input, which has no
    // line break before it.
    _first_document: $ => prec.right(choice(
      alias($._first_end, '...'),
      // Input that starts indented, as a snippet may: the first line's
      // indentation gives the root node its width.
      ...WIDTHS.filter((w) => w !== 0).map((w) => seq(
        $[`_first_indent_${w}`],
        optional($[`_bnode_${w}`]),
        repeat($._body_line),
        optional($._end),
      )),
      seq($._root_inline, repeat($._body_line), optional($._end)),
      seq(
        alias($._first_start, '---'),
        optional($._root_after_marker),
        repeat($._body_line),
        optional($._end),
      ),
      seq(
        $._directive,
        repeat(seq($._nl_0, $._directive)),
        $._start,
        optional($._root_after_marker),
        repeat($._body_line),
        optional($._end),
      ),
    )),

    // A bare document comes only at the start of the input or after `...`:
    // elsewhere its line breaks continue the document before it.
    _document: $ => prec.right(choice(
      seq($._start, optional($._root_after_marker), repeat($._body_line), optional($._end)),
      seq($._first_body_line, repeat($._body_line), optional($._end)),
      seq(
        repeat1(seq($._nl_0, $._directive)),
        $._start,
        optional($._root_after_marker),
        repeat($._body_line),
        optional($._end),
      ),
      $._end,
    )),

    _start: $ => alias($._doc_start, '---'),
    _end: $ => alias($._doc_end, '...'),

    // The indentation of the first line. It outranks a token that would
    // start after it, so the lexer stops at the end of the spaces, and a
    // wider one outranks a narrower one: the lexer does not otherwise go on
    // to a longer token when only spaces would follow.
    ...Object.fromEntries(WIDTHS.filter((w) => w !== 0).map((w) => [
      `_first_indent_${w}`,
      _ => token(prec(LEX.MARKER + 1 + (w === 'deep' ? MAX_INDENT : w), new RegExp(spaces(w)))),
    ])),

    _first_start: _ => token(prec(LEX.MARKER, '---')),
    _first_end: _ => token(prec(LEX.MARKER, '...')),
    _doc_start: _ => token(prec(LEX.MARKER, new RegExp(`${BLANK_LINES}---`))),
    _doc_end: _ => token(prec(LEX.MARKER, new RegExp(`${BLANK_LINES}\\.\\.\\.`))),

    // The top level checks no indentation: a line of any width that does not
    // continue a node starts another, so indented snippets parse.
    _body_line: $ => choice(...WIDTHS.map((w) => seq(
      $[`_nl_${w}`],
      optional($[`_bnode_${w}`]),
    ))),

    _first_body_line: $ => choice(...WIDTHS.map((w) => seq($[`_nl_${w}`], $[`_bnode_${w}`]))),

    // The root node on the first line of the input.
    _root_inline: $ => choice(
      $._bnode_0,
      alias($._root_block_scalar, $.block_node),
      alias($._props_block_any, $.block_node),
    ),

    // The root node on the line of `---`.
    _root_after_marker: $ => choice(
      alias($._flow_key, $.flow_node),
      alias($._root_block_scalar, $.block_node),
      alias($._props_block_any, $.block_node),
    ),

    // (Wrappers like this one are rules of their own because an alias of a
    // `seq` names each of its children instead of wrapping them.)
    _root_block_scalar: $ => seq(
      optional($._props),
      alias($._block_scalar_root, $.block_scalar),
    ),
    _block_scalar_root: $ => seq($._block_scalar_indicator, repeat($._bsl_root)),

    // Properties, then a collection of any width on the next lines.
    _props_block_any: $ => seq(
      $._props,
      choice(...WIDTHS.map((w) => seq($[`_nl_${w}`], $[`_bcoll_${w}`]))),
    ),

    // Directives
    // ----------

    _directive: $ => choice($.yaml_directive, $.tag_directive, $.reserved_directive),

    yaml_directive: $ => seq('%YAML', $.yaml_version),
    yaml_version: _ => /[0-9]+\.[0-9]+/,

    tag_directive: $ => seq('%TAG', $.tag_handle, $.tag_prefix),
    tag_handle: _ => /!([0-9A-Za-z-]*!)?/,
    tag_prefix: _ => /[^\s]+/,

    reserved_directive: $ => seq(
      '%',
      alias(token.immediate(/[^\s]+/), $.directive_name),
      repeat($.directive_parameter),
    ),
    directive_parameter: _ => /[^\s#][^\s]*/,

    // Line breaks
    // -----------

    ...Object.fromEntries(WIDTHS.map((w) => [
      `_nl_${w}`,
      _ => token(new RegExp(BLANK_LINES + spaces(w))),
    ])),

    // A line of a block scalar under a node of width `w`.
    ...Object.fromEntries(WIDTHS.map((w) => [
      `_bsl_${w}`,
      _ => token(prec(LEX.TEXT, new RegExp(`${BLANK_LINES}${spacesAbove(w)}[^\\r\\n]*`))),
    ])),

    // A line of a block scalar at the top level, which may be at column 0 but
    // does not start with a document marker.
    _bsl_root: _ => token(prec(LEX.TEXT, new RegExp(`${BLANK_LINES}${ROOT_LINE}`))),

    // A continuation line of a plain scalar under a node of width `w`. Past
    // MAX_INDENT a deeper line cannot be told from one of the same width, so
    // plain scalars there do not continue.
    ...Object.fromEntries(WIDTHS.filter((w) => w !== 'deep').map((w) => [
      `_cont_${w}`,
      _ => token(prec(LEX.COMMENT, new RegExp(`${BLANK_LINES}${spacesAbove(w)}${PLAIN.wordStart}${PLAIN.rest}`))),
    ])),

    // Indicators followed by a number of spaces, which give the width of a
    // compact collection after them.
    ...Object.fromEntries(['dash', 'qmark', 'colon'].flatMap((name) => {
      const c = { dash: '-', qmark: '\\?', colon: ':' }[name];
      return GAPS.map((k) => [
        `_${name}_${k}`,
        _ => token(new RegExp(k === MAX_GAP ? `${c}[ ]{${k - 1}}[ ]*` : `${c}[ ]{${k - 1}}`)),
      ]);
    })),

    // Block collections, one set of rules per indentation width
    // ---------------------------------------------------------

    ...Object.fromEntries(WIDTHS.flatMap((w) => {
      /** @type {[string, ($: GrammarSymbols<string>) => RuleOrLiteral][]} */
      const rules = [
        // A node at the start of a line of width `w`.
        [`_bnode_${w}`, $ => choice(
          alias($[`_bcoll_${w}`], $.block_node),
          w === 0
            ? alias($._flow_key, $.flow_node)
            : alias($[`_flow_value_${w === 'deep' ? 'deep' : w - 1}`], $.flow_node),
        )],

        [`_bcoll_${w}`, $ => choice(
          alias($[`_bmap_${w}`], $.block_mapping),
          alias($[`_bseq_${w}`], $.block_sequence),
        )],

        // A line break with nothing after it ends the input with an indented
        // blank line.
        [`_bmap_${w}`, $ => prec.right(seq(
          alias($[`_pair_${w}`], $.block_mapping_pair),
          repeat(seq($[`_nl_${w}`], optional(alias($[`_pair_${w}`], $.block_mapping_pair)))),
        ))],

        [`_bseq_${w}`, $ => prec.right(seq(
          alias($[`_item_${w}`], $.block_sequence_item),
          repeat(seq($[`_nl_${w}`], optional(alias($[`_item_${w}`], $.block_sequence_item)))),
        ))],

        // A sequence at the width of its key. A line break of that width
        // after an entry may go on to the next key instead (see conflicts).
        [`_bseq_inmap_${w}`, $ => seq(
          alias($[`_item_${w}`], $.block_sequence_item),
          repeat(seq($[`_nl_${w}`], optional(alias($[`_item_${w}`], $.block_sequence_item)))),
        )],

        [`_pair_${w}`, $ => choice(
          // A pair with no value, and one whose value is a sequence at the
          // key's width, have the same precedence: at a line break of that
          // width the parser keeps both readings (see conflicts). A value on
          // more indented lines has a higher one, so the line break goes to
          // it. (The precedence that counts is that of the whole pair, not of
          // the value's own alternatives.)
          prec(-1, seq(field('key', alias($._flow_key, $.flow_node)), ':')),
          ...(w === 'deep' ? [] : [prec(-1, seq(
            field('key', alias($._flow_key, $.flow_node)),
            ':',
            $[`_nl_${w}`],
            field('value', alias($[`_inmap_node_${w}`], $.block_node)),
          )), prec(-1, seq(
            field('key', alias($._flow_key, $.flow_node)),
            ':',
            field('value', alias($[`_props_inmap_${w}`], $.block_node)),
          ))]),
          seq(field('key', alias($._flow_key, $.flow_node)), ':', field('value', $[`_indicator_rest_${w}`])),
          ...GAPS.map((k) => seq(
            alias($[`_qmark_${k}`], '?'),
            optional(field('key', $[`_compact_${w}_${k}`])),
            optional(seq(
              $[`_nl_${w}`],
              choice(...GAPS.map((j) => seq(
                alias($[`_colon_${j}`], ':'),
                optional(field('value', $[`_compact_${w}_${j}`])),
              ))),
            )),
          )),
        )],

        // An empty entry has a lower precedence than one whose node is on
        // the next lines, so a more indented line break goes to the node.
        [`_item_${w}`, $ => choice(...GAPS.flatMap((k) => [
          prec(-1, alias($[`_dash_${k}`], '-')),
          seq(alias($[`_dash_${k}`], '-'), $[`_compact_${w}_${k}`]),
        ]))],

        // A sequence at its key's width. (Past MAX_INDENT it reads as nested
        // in the key instead, since the widths cannot be told apart.)
        [`_inmap_node_${w}`, $ => alias($[`_bseq_inmap_${w}`], $.block_sequence)],
        [`_props_inmap_${w}`, $ => prec(-1, seq($._props, $[`_nl_${w}`], alias($[`_bseq_inmap_${w}`], $.block_sequence)))],

        // What may follow `- `, `? ` or `: ` in a collection of width `w`,
        // other than a compact collection.
        [`_indicator_rest_${w}`, $ => choice(
          alias($[`_flow_value_${w}`], $.flow_node),
          // Properties with no node: at the same precedence as properties
          // before a sequence at the key's width, so a line break of that
          // width keeps both readings.
          prec(-1, alias($._props, $.flow_node)),
          alias($[`_bscalar_node_${w}`], $.block_node),
          // A node on the following lines, more indented.
          prec(1, choice(...widthsAbove(w).map((m) => $[`_below_${m}`]))),
          alias($[`_props_next_${w}`], $.block_node),
          alias($[`_props_scalar_next_${w}`], $.flow_node),
        )],
        // Properties, then a scalar or flow collection on the next line.
        [`_props_scalar_next_${w}`, $ => prec(1, seq(
          $._props,
          choice(...widthsAbove(w).map((m) => $[`_below_scalar_${m}`])),
        ))],
        [`_bscalar_node_${w}`, $ => seq(optional($._props), alias($[`_bscalar_${w}`], $.block_scalar))],
        [`_bscalar_${w}`, $ => seq($._block_scalar_indicator, repeat($[`_bsl_${w}`]))],
        [`_props_next_${w}`, $ => prec(1, seq(
          $._props,
          choice(...widthsAbove(w).map((m) => $[`_below_coll_${m}`])),
        ))],

        // A flow node or plain scalar as a value in a collection of width
        // `w`. A plain scalar continues on lines indented further than `w`.
        [`_flow_value_${w}`, $ => choice(
          seq(optional($._props), $._flow_content),
          seq(optional($._props), alias($[`_plain_ml_${w}`], $.plain_scalar)),
        )],
        [`_plain_ml_${w}`, $ => w === 'deep' ? $._plain_single : choice(
          $._plain_single,
          alias($[`_plain_lines_${w}`], $.string_scalar),
        )],
      ];
      if (w !== 'deep') {
        rules.push([`_plain_lines_${w}`, $ => seq($._plain, repeat1($[`_cont_${w}`]))]);
      }
      // After an indicator of length k: a compact collection at width w + k,
      // or anything else an indicator may have after it.
      for (const k of GAPS) {
        rules.push([`_compact_${w}_${k}`, $ => choice(
          $[`_indicator_rest_${w}`],
          alias($[`_bcoll_${widthAdd(w, k)}`], $.block_node),
        )]);
      }
      return rules;
    })),

    // A line break of width `m` and a node after it. As rules of their own,
    // the parse states after the line break do not depend on the width of
    // the collection the node is in, so collections of every width share
    // them.
    ...Object.fromEntries(WIDTHS.filter((m) => m !== 0).flatMap((m) => {
      /** @type {[string, ($: GrammarSymbols<string>) => RuleOrLiteral][]} */
      const rules = [
        [`_below_${m}`, $ => prec(1, seq($[`_nl_${m}`], $[`_bnode_${m}`]))],
        [`_below_coll_${m}`, $ => prec(1, seq($[`_nl_${m}`], $[`_bcoll_${m}`]))],
        [`_below_scalar_${m}`, $ => prec(1, seq($[`_nl_${m}`], choice(
          $._flow_content,
          alias($[`_plain_ml_${m === 'deep' ? 'deep' : /** @type {number} */ (m) - 1}`], $.plain_scalar),
        )))],
      ];
      return rules;
    })),

    // Nodes
    // -----

    _props: $ => choice(
      seq($.tag, optional($.anchor)),
      seq($.anchor, optional($.tag)),
    ),

    tag: _ => token(/!(<[^>\s]*>|[^\s,\[\]{}]*)/),

    anchor: $ => seq('&', alias(token.immediate(/[^\s,\[\]{}]+/), $.anchor_name)),

    alias: $ => seq('*', alias(token.immediate(/[^\s,\[\]{}]+/), $.alias_name)),

    // An implicit key, or a node on a line of its own at the top level.
    _flow_key: $ => choice(
      seq(optional($._props), $._flow_content),
      seq(optional($._props), alias($._plain_single, $.plain_scalar)),
    ),

    _flow_content: $ => choice(
      $.alias,
      $.double_quote_scalar,
      $.single_quote_scalar,
      $.flow_sequence,
      $.flow_mapping,
    ),

    _block_scalar_indicator: _ => token(/[|>]([1-9][+-]?|[+-][1-9]?)?/),

    // Plain scalars
    // -------------

    _plain_single: $ => choice(
      alias($._plain, $.string_scalar),
      $.null_scalar,
      $.boolean_scalar,
      $.integer_scalar,
      $.float_scalar,
    ),

    // The core schema's tags for plain scalars. A plain scalar that is all
    // of one of these lexes as it: of tokens of the same length, a string
    // beats a regex, and of two regexes the one defined first wins (so these
    // come before `_plain`). A longer plain scalar wins on length.
    null_scalar: _ => choice('~', 'null', 'Null', 'NULL'),
    boolean_scalar: _ => choice('true', 'True', 'TRUE', 'false', 'False', 'FALSE'),
    integer_scalar: _ => token(/[-+]?[0-9]+|0o[0-7]+|0x[0-9a-fA-F]+/),
    float_scalar: _ => token(choice(
      /[-+]?(\.[0-9]+|[0-9]+\.[0-9]*)([eE][-+]?[0-9]+)?/,
      /[-+]?[0-9]+[eE][-+]?[0-9]+/,
      /[-+]?\.(inf|Inf|INF)/,
      /\.(nan|NaN|NAN)/,
    )),

    _plain: _ => token(new RegExp(PLAIN.first + PLAIN.rest)),
    // A `-` on its own is a plain scalar in a flow collection, as in `[-]`.
    _plain_flow: _ => token(new RegExp(`${PLAIN_FLOW.first}${PLAIN_FLOW.rest}|-`)),

    // Quoted scalars
    // --------------

    double_quote_scalar: $ => seq(
      '"',
      repeat(choice(
        token.immediate(prec(LEX.TEXT, /[^"\\]+/)),
        $.escape_sequence,
      )),
      token.immediate('"'),
    ),

    // Any backslash pair is an escape, so `"\d"` is not an error.
    escape_sequence: _ => token.immediate(prec(LEX.ESCAPE, choice(
      /\\x[0-9a-fA-F]{2}/,
      /\\u[0-9a-fA-F]{4}/,
      /\\U[0-9a-fA-F]{8}/,
      /\\\r?\n/,
      /\\[^\r\n]/,
    ))),

    single_quote_scalar: $ => seq(
      '\'',
      repeat(choice(
        token.immediate(prec(LEX.TEXT, /[^']+/)),
        alias(token.immediate(prec(LEX.ESCAPE, '\'\'')), $.escape_sequence),
      )),
      token.immediate('\''),
    ),

    // Flow collections
    // ----------------

    flow_sequence: $ => seq(
      '[',
      optional(seq(sep1($._flow_entry, ','), optional(','))),
      ']',
    ),

    flow_mapping: $ => seq(
      '{',
      optional(seq(sep1($._flow_entry, ','), optional(','))),
      '}',
    ),

    _flow_entry: $ => choice($._flow_node, $.flow_pair),

    flow_pair: $ => choice(
      seq(field('key', $._flow_node), ':', optional(field('value', $._flow_node))),
      seq(':', field('value', $._flow_node)),
      seq(
        '?',
        optional(field('key', $._flow_node)),
        optional(seq(':', optional(field('value', $._flow_node)))),
      ),
    ),

    _flow_node: $ => alias($._flow_item, $.flow_node),
    _flow_item: $ => choice(
      seq(optional($._props), $._flow_content),
      seq(optional($._props), alias($._plain_flow_scalar, $.plain_scalar)),
      $._props,
    ),

    // In a flow collection a plain scalar may run over several lines.
    _plain_flow_lines: $ => repeat1($._plain_flow),
    _plain_flow_scalar: $ => choice(
      alias($._plain_flow_lines, $.string_scalar),
      $.null_scalar,
      $.boolean_scalar,
      $.integer_scalar,
      $.float_scalar,
    ),

    // A line break where no line break token is valid, as in a flow
    // collection, is a space. It is an extra token rather than part of the
    // whitespace regex: the lexer may skip whitespace in the middle of a
    // token's characters, so with `\n` as whitespace, `\n-x` after a scalar
    // lexed as one `-` token holding the line break.
    _line_break_space: _ => token(prec(-1, /\r?\n/)),

    comment: _ => token(prec(LEX.COMMENT, /(\r?\n[ \t]*)*#[^\r\n]*/)),
  },
});
