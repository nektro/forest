# tree-sitter-html

A [tree-sitter](https://tree-sitter.github.io) grammar for HTML, with no
external scanner.

It covers the doctype, comments, elements and attributes (quoted, unquoted
and valueless), character references, void elements, raw text in `<script>`
and `<style>`, and escapable raw text in `<title>` and `<textarea>`. Tag names
are case-insensitive. End tags that HTML lets you leave out may be left out:
`<p>`, `<li>`, `<dt>`, `<dd>`, `<option>`, `<optgroup>`, `<tr>`, `<td>`,
`<th>`, `<thead>`, `<tbody>`, `<tfoot>`, `<head>`, `<body>` and `<html>`.

## How it works without a scanner

Other HTML grammars keep a stack of open tag names in an external scanner.
This one does two things instead:

- **Tag names with parsing rules are their own tokens.** Void elements, raw
  text elements, elements with optional end tags, and the block elements that
  close a `<p>` (`div`, `ul`, `table`, `h1`, ...) each get a case-insensitive
  token. The generic `tag_name` token is a regex built from a trie of those
  names that matches every other name and none of them, so the two never
  compete. `<lix>` and `<divider>` are ordinary elements.
- **An element without its end tag must be followed by an element that closes
  it**, or by the end of its parent. `<li>` is closed by `<li>`; `<p>` by
  `<p>`, a block element, `<hr>`, `<li>`, `<dt>`, `<dd>` or a table part;
  `<td>` by `<td>`, `<th>`, `<tr>` or a table section; and so on. The content
  of each such element leaves out what would close it (a `<p>` cannot hold a
  `<div>`). At a `<` or `</` the parser keeps both readings (a GLR conflict)
  and the tag name after it settles which is right.

Whitespace must separate a tag name from its first attribute. Otherwise, in a
`<p>`, the start of `<div>` could be read as a tag `di` with an attribute `v`.

## Leniency and limits

- **End tags are not matched to start tags by name.** `<div></span>` parses
  without error.
- **Only special names can be stray end tags.** An end tag for a void, raw
  text or optional-end element with nothing to end (`</p>` after a `<div>`
  closed the paragraph, `</br>`, `</input>`) is an `erroneous_end_tag`. Any
  other end tag is taken to end its parent, so an extra `</div>` or `</a>`
  is an error.
- **Implied end tags follow the common cases only.** A `<li>` inside a
  `<span>` inside a `<li>` nests rather than closing the outer `<li>`, and a
  `<div>` in a `<span>` in a `<p>` stays inside the `<p>`. `<head>` is ended
  only by `<body>` or `</head>`, not by body content. `<colgroup>`,
  `<caption>`, `<rt>` and `<rp>` need their end tags.
- **`/>` closes any element**, as in SVG and MathML, except `<script>` and
  `<style>`, whose content follows it anyway. In HTML proper `<div/>` opens a
  `<div>`.
- **Raw text ends at the first `</script` or `</style`** in any case, even
  when not followed by `>`, whitespace or `/`. A `<` right before that end tag
  is an error.
- A `&` right before a letter or `#` always starts a reference, and named
  references may leave out the `;` (`&copy`). A `&` before `<` is a `text`
  node of its own.
- `<?...>` is a comment, as browsers treat it. `<![CDATA[` is not supported.

## Tree shape

The node names follow the widely used
[tree-sitter-html](https://github.com/tree-sitter/tree-sitter-html), so most
of its queries work here.

- `document` holds `doctype`, `element`, `script_element`, `style_element`,
  `text`, `entity`, `comment` and `erroneous_end_tag` nodes.
- An `element` is a `start_tag` (field `start`), its content and an optional
  `end_tag` (field `end`); or a lone `start_tag` for a void element; or a
  `self_closing_tag`. Tags have a `name` field (`tag_name`).
- `script_element` and `style_element` hold one `raw_text` node unless empty.
  `<title>` and `<textarea>` are `element`s holding only `text` and `entity`.
- An `attribute` has a `name` (`attribute_name`) and an optional `value`: an
  `attribute_value` when unquoted, or a `quoted_attribute_value` with an
  `attribute_value` inside (unless empty).
- `text` leaves out the whitespace at its start and end; whitespace between
  tags is not in the tree.

## Queries

`queries/highlights.scm` captures tag names as `@tag`, attribute names as
`@tag.attribute`, values as `@string` and references as `@string.escape`.
`queries/folds.scm` folds elements and comments.

`queries/injections.scm` injects:

| Where | Language |
| --- | --- |
| `<style>` content and `style="..."` attributes | `css` (the CSS grammar accepts bare declarations) |
| `<script>` with no `type`, or a JavaScript or TypeScript one (`module`, `text/javascript`, `text/typescript`, ...) | `typescript` |
| `on*="..."` event handler attributes | `typescript` |
| `<script>` with a JSON `type` (`application/json`, `application/ld+json`, `importmap`, `speculationrules`) | `json` |

Other script types, such as `text/template`, are left alone.

## Validation

`script/check-html-files.sh <dir>...` parses every `.html`, `.htm` and
`.shtml` file under the given directories and lists those with errors.
Results from 2026-11-13:

| Input | Files | Result |
| --- | --- | --- |
| OpenJDK, Rust, SQLite, Go, USWDS, CMake, nixpkgs, Swift, Linux and Zig checkouts | 453 | 440 parse; the 13 failures are below |

The 13 failures are not valid HTML:

- 3 are rustdoc Askama templates (`{% ... %}`, `{# ... #}`)
- 4 have a start tag where an end tag was meant (`<ol>` for `</ol>`, and
  likewise `<pre>`, `<HTML>` and `<a>`)
- 4 have an extra `</a>` or `</div>`
- 1 has unescaped `<T>` generics in code samples
- 1 is a deliberately truncated tag

Parsing runs at about 11 MB/s on a 2.5 MB file.

## Development

```bash
tree-sitter generate --js-runtime bun
```

```bash
tree-sitter test
```

```bash
script/check-html-files.sh ~/src/openjdk ~/src/rust
```

`tree-sitter test --update` writes corpus trees without field names. To record
them with fields, run `script/update-corpus-fields.py` instead, then review the
diff: it records what the parser does now, not what it should do.
