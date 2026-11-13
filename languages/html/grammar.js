/**
 * @file HTML grammar for tree-sitter
 * @license MIT
 *
 * HTML as written in practice: case-insensitive tag names, void elements,
 * unquoted and valueless attributes, raw text in `<script>` and `<style>`,
 * escapable raw text in `<textarea>` and `<title>`, and the end tags HTML
 * lets you leave out (`<p>`, `<li>`, `<td>`, `<tr>`, `<option>`, `<html>`,
 * `<head>`, `<body>` and others).
 *
 * There is no external scanner. Other HTML grammars use one to keep a stack of
 * open tag names. Here, instead:
 *
 * - Tag names that matter to the parser (void elements, raw text elements,
 *   elements with optional end tags, and the block elements that close a
 *   `<p>`) are their own case-insensitive tokens. The generic `tag_name`
 *   token is built to match every other name and none of those, so the two
 *   never compete.
 * - An element whose end tag is left out may only be followed by an element
 *   that closes it (`<li>` by `<li>`, `<p>` by `<div>`, `<td>` by `<td>` or
 *   `<tr>`, ...) or by the end of its parent. At a `<` or `</` the parser
 *   keeps both readings (a GLR conflict) and the tag name that follows
 *   settles it.
 *
 * End tags are not matched to start tags by name, so `<div></span>` parses.
 * See the README.
 */

/// <reference types="tree-sitter-cli/dsl" />
// @ts-check

// ── Tag names ───────────────────────────────────────────────────────────────

// Each category is a set of names the parser treats alike. Names in no
// category are `tag_name`.
const NAMES = {
  script: ['script'],
  style: ['style'],
  textarea: ['textarea'],
  title: ['title'],
  void: [
    'area', 'base', 'basefont', 'bgsound', 'br', 'col', 'embed', 'frame',
    'img', 'input', 'keygen', 'link', 'meta', 'param', 'source', 'track', 'wbr',
  ],
  // A void element that also closes an open `<p>`.
  hr: ['hr'],
  // Elements whose start tag closes an open `<p>`.
  block: [
    'address', 'article', 'aside', 'blockquote', 'center', 'details', 'dialog',
    'dir', 'div', 'dl', 'fieldset', 'figcaption', 'figure', 'footer', 'form',
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'header', 'hgroup', 'listing', 'main',
    'menu', 'nav', 'ol', 'pre', 'search', 'section', 'summary', 'table', 'ul',
  ],
  // Elements whose end tag may be left out.
  p: ['p'],
  li: ['li'],
  dtdd: ['dt', 'dd'],
  option: ['option'],
  optgroup: ['optgroup'],
  tr: ['tr'],
  cell: ['td', 'th'],
  tsection: ['thead', 'tbody', 'tfoot'],
  head: ['head'],
  body: ['body'],
  html: ['html'],
};

// For each element with an optional end tag, the elements whose start tag
// ends it. It is also ended by the end of its parent.
const CLOSED_BY = {
  p: ['p', 'block', 'hr', 'li', 'dtdd', 'tr', 'cell', 'tsection'],
  li: ['li'],
  dtdd: ['dtdd'],
  option: ['option', 'optgroup'],
  optgroup: ['optgroup'],
  tr: ['tr', 'tsection'],
  cell: ['cell', 'tr', 'tsection'],
  tsection: ['tsection'],
  head: ['body'],
  body: [],
  html: [],
};
const OPTIONAL_END = Object.keys(CLOSED_BY);

// Categories that may appear in each kind of content. `flow` is the content
// of every element without special rules.
const FLOW = ['generic', 'block', 'void', 'hr', 'script', 'style', 'textarea', 'title',
  'p', 'li', 'dtdd', 'option', 'optgroup', 'tr', 'cell', 'tsection'];
const without = (...names) => FLOW.filter(c => !names.includes(c));
const CONTENT = {
  flow: FLOW,
  // A `<p>` cannot hold anything that would close it.
  p: without(...CLOSED_BY.p),
  li: without('li'),
  dtdd: without('dtdd'),
  option: without('option', 'optgroup'),
  optgroup: without('optgroup'),
  tr: without('tr', 'tsection'),
  cell: without('cell', 'tr', 'tsection'),
  tsection: without('tsection'),
  html: [...FLOW, 'head', 'body'],
  document: [...FLOW, 'head', 'body', 'html'],
};
// The content kind inside each element with an optional end tag.
const INNER = {
  p: 'p', li: 'li', dtdd: 'dtdd', option: 'option', optgroup: 'optgroup',
  tr: 'tr', cell: 'cell', tsection: 'tsection', head: 'flow', body: 'flow', html: 'html',
};

// Characters a tag name cannot contain.
const NOT_NAME = '\\s/>"\'<=';

/** A case-insensitive pattern for one ASCII word. */
const ci = word => word.replace(/[a-z]/g, c => `[${c}${c.toUpperCase()}]`);

/** A case-insensitive regex matching exactly one of the words. */
const anyWord = words => new RegExp(words.map(ci).join('|'));

/**
 * A regex matching every tag name (an ASCII letter, then any characters but
 * whitespace, `/`, `>` and a few others) except the given words, in any
 * case. It walks a trie of the words: at each node, a name either follows a
 * child, or leaves the trie with any other character, or (if the node is not
 * a word) ends there.
 */
function nameExcept(words) {
  const root = {};
  for (const word of words) {
    let node = root;
    for (const c of word) node = node[c] ??= {};
    node.$ = true;
  }
  const both = c => /[a-z]/.test(c) ? c + c.toUpperCase() : c;
  const kids = node => Object.keys(node).filter(k => k !== '$');
  const rest = `[^${NOT_NAME}]*`;
  const below = node => {
    const parts = kids(node).map(k => `[${both(k)}]${below(node[k])}`);
    parts.push(`[^${NOT_NAME}${kids(node).map(both).join('')}]${rest}`);
    const alternatives = `(${parts.join('|')})`;
    return node.$ ? alternatives : alternatives + '?';
  };
  const first = kids(root).map(k => `[${both(k)}]${below(root[k])}`);
  const others = 'abcdefghijklmnopqrstuvwxyz'.split('').filter(c => !(c in root)).map(both);
  first.push(`[${others.join('')}]${rest}`);
  return new RegExp(first.join('|'));
}

// ── Raw text ────────────────────────────────────────────────────────────────

/**
 * A regex for a run of characters that does not contain `</word` in any case
 * (nor the characters in `exclude`). A `<` right before the `</word` cannot
 * be part of the run.
 */
function rawUntil(word, exclude = '') {
  const mismatch = [];
  for (let i = 0; i < word.length; i++) {
    const c = word[i];
    mismatch.push(ci(word.slice(0, i)) + `[^<${exclude}${c}${c.toUpperCase()}]`);
  }
  const unit = `[^<${exclude}]|<+([^</${exclude}]|/(${mismatch.join('|')}))`;
  return new RegExp(`(${unit})+`);
}

// ── Text ────────────────────────────────────────────────────────────────────

// A `&` that does not start a reference and a `<` that does not start a tag
// are text. Leading and trailing whitespace is left out of `text`.
const TEXT_INNER = '[^<&]|&+[^a-zA-Z#<&]|<+[^a-zA-Z/!?<&]';
const TEXT_START = '[^<&\\s]|&+[^a-zA-Z#<&]|<+[^a-zA-Z/!?<&]';
const TEXT_END = '[^<&\\s]|&+[^a-zA-Z#<&\\s]|<+[^a-zA-Z/!?<&\\s]';
const TEXT = new RegExp(`(${TEXT_START})((${TEXT_INNER})*(${TEXT_END}))?`);

// ── Rules ───────────────────────────────────────────────────────────────────

/** The hidden token for a category's tag names. */
const nameRule = ($, category) => category === 'generic' ? $.tag_name : $[`_${category}_name`];

/** A start tag (or self-closing tag, with `close` = '/>'). */
function startTag($, category, close = '>') {
  const name = category === 'generic'
    ? $.tag_name
    : alias(nameRule($, category), $.tag_name);
  return seq(
    '<',
    field('name', name),
    // Whitespace must separate the name from the first attribute. Without
    // it, `<div` in a context where `div` is not valid would lex as the tag
    // name `di` and an attribute `v`.
    optional(seq($._space, repeat($.attribute))),
    close,
  );
}

function endTag($, category) {
  const name = category === 'generic'
    ? $.tag_name
    : alias(nameRule($, category), $.tag_name);
  return seq('</', field('name', name), '>');
}

/** The elements that close an open `c` and may appear in content `kind`. */
const closersIn = (kind, c) => CLOSED_BY[c].filter(d => CONTENT[kind].includes(d));

/**
 * The items of one kind of content: text, references, comments and the
 * elements its categories allow.
 *
 * An element with an optional end tag and no end tag (an "open" element) may
 * only be followed by an element that closes it, or end the content. So the
 * content is `repeat(item) optional(trailing)`: `item` covers ordinary
 * elements, closed elements, and an open element together with the closing
 * element after it; `trailing` is a chain of open elements, each closing the
 * one before.
 */
function contentRules(kind) {
  const allowed = CONTENT[kind];
  const rules = {};
  const open = c => $ => alias($[`_${c}_body`], $.element);
  const closedOf = c => $ => OPTIONAL_END.includes(c)
    ? alias($[`_${c}_closed`], $.element)
    : elementOf(c)($);

  rules[`_${kind}_item`] = $ => choice(
    $.text,
    $.entity,
    $.comment,
    $.erroneous_end_tag,
    alias($._optional_end_self_closing, $.element),
    ...allowed.map(c => closedOf(c)($)),
    ...allowed.filter(c => OPTIONAL_END.includes(c) && closersIn(kind, c).length)
      .map(c => $[`_${kind}_${c}_then`]),
    ...(kind === 'document' ? [$.doctype] : []),
  );

  const trailing = allowed.filter(c => OPTIONAL_END.includes(c));
  if (trailing.length) {
    rules[`_${kind}_trailing`] = $ => choice(...trailing.map(c => $[`_${kind}_${c}_last`]));
  }

  for (const c of trailing) {
    const closers = closersIn(kind, c);
    // An open element, then one that closes it.
    if (closers.length) {
      rules[`_${kind}_${c}_then`] = $ => seq(
        open(c)($),
        choice(
          ...closers.map(d => closedOf(d)($)),
          ...closers
            .filter(d => OPTIONAL_END.includes(d) && closersIn(kind, d).length)
            .map(d => $[`_${kind}_${d}_then`]),
        ),
      );
    }
    // An open element at the end of the content, maybe followed by more
    // open elements that close it.
    const next = closers.filter(d => OPTIONAL_END.includes(d));
    rules[`_${kind}_${c}_last`] = $ => next.length
      ? seq(open(c)($), optional(choice(...next.map(d => $[`_${kind}_${d}_last`]))))
      : open(c)($);
  }
  return rules;
}

/** The content of an element (or the document) of the given kind. */
function content($, kind) {
  const parts = [repeat($[`_${kind}_item`])];
  if (CONTENT[kind].some(c => OPTIONAL_END.includes(c))) parts.push(optional($[`_${kind}_trailing`]));
  return parts.length === 1 ? parts[0] : seq(...parts);
}

/** The element node for a category without an optional end tag. */
function elementOf(category) {
  return $ => {
    switch (category) {
      case 'generic': return $.element;
      case 'script': return $.script_element;
      case 'style': return $.style_element;
      default: return alias($[`_${category}_element`], $.element);
    }
  };
}

const ALL_SPECIAL = Object.values(NAMES).flat();

module.exports = grammar({
  name: 'html',

  extras: _ => [/\s/],

  conflicts: $ => [
    // Inside an element whose end tag may be left out, a `<` or `</` either
    // continues its content or ends it. The tag name that follows decides.
    ...OPTIONAL_END.map(c => [$[`_${c}_body`]]),
    // After an open element's content, a `</` is its own end tag or the
    // parent's, and a `<` starts the element that closes it or nothing.
    // At the top level there is no parent end tag, so neither question
    // comes up; in `<html>`, only the first does.
    ...Object.keys(CONTENT).filter(kind => kind !== 'document').flatMap(kind => CONTENT[kind]
      .filter(c => OPTIONAL_END.includes(c))
      .flatMap(c => {
        const pairs = [[$[`_${c}_closed`], $[`_${kind}_${c}_last`]]];
        if (kind !== 'html' && closersIn(kind, c).length) {
          pairs.push([$[`_${kind}_${c}_then`], $[`_${kind}_${c}_last`]]);
        }
        return pairs;
      })),
  ],

  rules: Object.assign(
    {
      document: $ => content($, 'document'),

      doctype: $ => seq(
        '<!',
        alias(token.immediate(new RegExp(ci('doctype'))), 'doctype'),
        optional(/[^>]+/),
        '>',
      ),

      // `<!-->` and `<!--->` are complete (empty) comments in HTML. A comment
      // ends at the first `-->` or `--!>`. `<?...>` is a "bogus comment".
      comment: _ => token(choice(
        seq('<!--', /-?>/),
        seq('<!--', /([^-]|-[^-]|--+[^-!>]|--!+[^>])*/, /-*--!?>/),
        /<\?[^>]*>/,
      )),

      // ── Elements ──────────────────────────────────────────────────────────

      element: $ => choice(
        seq(
          field('start', alias($._generic_start, $.start_tag)),
          content($, 'flow'),
          field('end', alias($._generic_end, $.end_tag)),
        ),
        alias($._generic_self_closing, $.self_closing_tag),
      ),

      _generic_start: $ => startTag($, 'generic'),
      _generic_end: $ => endTag($, 'generic'),
      _generic_self_closing: $ => startTag($, 'generic', '/>'),

      // Block elements are ordinary elements whose start tag closes a `<p>`.
      _block_element: $ => choice(
        seq(
          field('start', alias($._block_start, $.start_tag)),
          content($, 'flow'),
          field('end', alias($._block_end, $.end_tag)),
        ),
        alias($._block_self_closing, $.self_closing_tag),
      ),
      _block_start: $ => startTag($, 'block'),
      _block_end: $ => endTag($, 'block'),
      _block_self_closing: $ => startTag($, 'block', '/>'),

      // Void elements have no content and no end tag.
      _void_element: $ => choice(
        alias($._void_start, $.start_tag),
        alias($._void_self_closing, $.self_closing_tag),
      ),
      _void_start: $ => startTag($, 'void'),
      _void_self_closing: $ => startTag($, 'void', '/>'),

      _hr_element: $ => choice(
        alias($._hr_start, $.start_tag),
        alias($._hr_self_closing, $.self_closing_tag),
      ),
      _hr_start: $ => startTag($, 'hr'),
      _hr_self_closing: $ => startTag($, 'hr', '/>'),

      // Raw text elements. Their content runs to the matching end tag. A `/>`
      // does not close them.
      script_element: $ => seq(
        field('start', alias($._script_start, $.start_tag)),
        optional(alias($._script_text, $.raw_text)),
        field('end', alias($._script_end, $.end_tag)),
      ),

      style_element: $ => seq(
        field('start', alias($._style_start, $.start_tag)),
        optional(alias($._style_text, $.raw_text)),
        field('end', alias($._style_end, $.end_tag)),
      ),

      _script_start: $ => choice(startTag($, 'script'), startTag($, 'script', '/>')),
      _script_end: $ => endTag($, 'script'),
      _style_start: $ => choice(startTag($, 'style'), startTag($, 'style', '/>')),
      _style_end: $ => endTag($, 'style'),

      _script_text: _ => token.immediate(rawUntil('script')),
      _style_text: _ => token.immediate(rawUntil('style')),

      // Escapable raw text elements: text and character references, no tags.
      _textarea_element: $ => seq(
        field('start', alias($._textarea_start, $.start_tag)),
        repeat(choice(alias($._textarea_text, $.text), $.entity)),
        field('end', alias($._textarea_end, $.end_tag)),
      ),

      _title_element: $ => seq(
        field('start', alias($._title_start, $.start_tag)),
        repeat(choice(alias($._title_text, $.text), $.entity)),
        field('end', alias($._title_end, $.end_tag)),
      ),

      _textarea_start: $ => startTag($, 'textarea'),
      _textarea_end: $ => endTag($, 'textarea'),
      _title_start: $ => startTag($, 'title'),
      _title_end: $ => endTag($, 'title'),

      _textarea_text: _ => token.immediate(rawUntil('textarea', '&')),
      _title_text: _ => token.immediate(rawUntil('title', '&')),

      // `<p/>`, `<li/>`: no content and no end tag.
      _optional_end_self_closing: $ => choice(
        ...OPTIONAL_END.map(c => alias($[`_${c}_self_closing`], $.self_closing_tag)),
      ),

      // An end tag with no open element to end, as in `<p><div></div></p>`
      // (the `<div>` closed the `<p>`) or `<br></br>`. Only names with special
      // parsing rules count: any other end tag is taken to end its parent.
      // When the end tag could also end an open element, that reading wins.
      erroneous_end_tag: $ => prec.dynamic(-1, seq(
        '</',
        field('name', choice(...Object.keys(NAMES).filter(c => c !== 'block')
          .map(c => alias($[`_${c}_name`], $.erroneous_end_tag_name)))),
        '>',
      )),

      // ── Attributes ────────────────────────────────────────────────────────

      attribute: $ => seq(
        field('name', $.attribute_name),
        optional(seq(
          '=',
          field('value', choice($.attribute_value, $.quoted_attribute_value)),
        )),
      ),

      attribute_name: _ => /[^\s"'>\/=<]+/,

      // Unquoted.
      attribute_value: _ => /[^\s"'=<>`]+/,

      quoted_attribute_value: $ => choice(
        seq('"', optional(alias(token.immediate(/[^"]+/), $.attribute_value)), token.immediate('"')),
        seq('\'', optional(alias(token.immediate(/[^']+/), $.attribute_value)), token.immediate('\'')),
      ),

      // ── Text ──────────────────────────────────────────────────────────────

      // A `&` right before a tag (`<b>&</b>`) is text on its own.
      text: _ => token(choice(TEXT, /&+/)),

      // Named references may leave out the `;`, as many legacy ones can.
      entity: _ => token(choice(
        /&[a-zA-Z][a-zA-Z0-9]*;?/,
        /&#[0-9]+;?/,
        /&#[xX][0-9a-fA-F]+;?/,
      )),

      _space: _ => token.immediate(/\s+/),

      tag_name: _ => token.immediate(nameExcept(ALL_SPECIAL)),
    },

    // Name tokens, one per category.
    Object.fromEntries(Object.entries(NAMES).map(([c, words]) =>
      [`_${c}_name`, _ => token.immediate(anyWord(words))])),

    // Elements whose end tag may be left out: `_x_body` is the start tag and
    // content, `_x_closed` adds the end tag.
    Object.fromEntries(OPTIONAL_END.flatMap(c => [
      [`_${c}_body`, $ => seq(
        field('start', alias($[`_${c}_start`], $.start_tag)),
        content($, INNER[c]),
      )],
      [`_${c}_closed`, $ => seq($[`_${c}_body`], field('end', alias($[`_${c}_end`], $.end_tag)))],
      [`_${c}_start`, $ => startTag($, c)],
      [`_${c}_end`, $ => endTag($, c)],
      [`_${c}_self_closing`, $ => startTag($, c, '/>')],
    ])),

    ...Object.keys(CONTENT).map(contentRules),
  ),
});
