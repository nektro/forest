# tree-sitter-css

A [tree-sitter](https://tree-sitter.github.io) grammar for CSS, covering
Selectors Level 4, CSS Nesting, cascade layers, container and scope rules,
media query ranges and custom properties.

- **No external scanner.** Everything is in `grammar.js`. Other CSS grammars
  use a scanner in two places, and this one handles both in the grammar:
  - *The descendant combinator is whitespace.* Here whitespace is an extra, so
    `a b` is simply two compound selectors next to each other. `a.b` stays one
    compound because the `.`, `#`, `[`, `:`, `::` and `|` that continue a
    compound are immediate tokens (`token.immediate`). They only match when no
    whitespace comes before them. So `a :hover` is `a *:hover` and `a:hover`
    is one selector.
  - *Nested rules look like declarations.* Inside a block, `a:hover {` and
    `color:red;` both start with a name and a colon. The parser keeps both
    readings (a declared GLR conflict) until one fails. That happens at the
    latest at the `{`, `;` or `}` that ends the item. A custom property
    (`--x: { ... }`) can hold braces, but only a `--` name starts one, so it
    never competes with a rule.

## Validation

`script/check-css-files.sh <dir>...` parses every `.css` file under the given
directories and lists the ones with errors. Results from 2026-11-11:

| Input | Result |
| --- | --- |
| 1,360 files from npm: highlight.js 11.10, open-props 1.7, Pico 2.0, animate.css 4.1, Tachyons 4.12, Primer CSS 21.3, Pure 3.0, Font Awesome 6.5, Bootstrap 5.3, Bulma 1.0, Foundation 6.8, water.css, github-markdown-css, normalize.css and modern-normalize | all parse without errors |
| 26 `.css` files in Go, Zig, Linux, OpenJDK, Swift and SQLite checkouts | 25 parse; the other is a Go `html/template` file, not CSS |

Parsing runs at about 13 MB/s on Primer's 1.3 MB `primer.css`.

## Leniency

- Declarations are accepted at the top level, as in a `style` attribute, and
  the last declaration in a block may leave out its semicolon.
- A combinator with nothing before it (`> a`, `+ b`) is accepted in any
  selector, not only in nested rules and `:has()`.
- Inside parentheses and brackets, and in custom property values, any
  delimiter is accepted (`.`, `!`, `?`, `&`, `|`, `~`, `^`, `$`, `<`, `>`),
  since custom properties may hold any tokens.
- The IE star hack, `*zoom: 1`, parses as a declaration.
- Property names, values and pseudo-class names are not checked against
  any list, so unknown or vendor-prefixed ones parse too.

## Known limitations

- At-rule names are case-sensitive here (`@media`, not `@MEDIA`), except that
  unknown at-rules parse as `at_rule` whatever their case.
- `url(` must be lowercase or uppercase (`url(`, `URL(`) to get the unquoted
  URL token. Other casings parse as ordinary functions.

## Tree shape

- `_selector`, `_value` and `_query` are supertypes.
- Selectors nest to the left. In a compound selector, each simple selector
  has its left neighbour in a `selector` field:
  `a.b:hover` is `(pseudo_class_selector selector: (class_selector selector:
  (tag_name) name: (class_name)) name: (class_name))`. Combinators are
  `descendant_selector`, `child_selector`, `adjacent_sibling_selector`,
  `sibling_selector` and `column_selector`, with `left` and `right` fields.
- A `declaration` has a `name` (`property_name`) and one `value` field for
  each component. `,`, `/` and math operators are anonymous children between
  them. `!important` is an `important` child.
- `url(...)` is a `call_expression` whose `arguments` hold a `string_value`
  or a `plain_value` with the whole unquoted URL.
- Queries in `@media`, `@supports`, `@container` and `@import` are
  `keyword_query`, `feature_query`, `range_query`, `parenthesized_query`,
  `binary_query`, `unary_query`, `selector_query` or `call_expression`.
- Other at-rules are an `at_rule` with an `at_keyword` name, `prelude`
  values and an optional `body` block.

## Queries

`queries/highlights.scm` and `queries/folds.scm`. In `highlights.scm` the last
matching pattern wins, so general patterns come first.

## Development

```bash
tree-sitter generate --js-runtime bun
```

```bash
tree-sitter test
```

```bash
script/check-css-files.sh ~/src/some-project
```

`tree-sitter test --update` writes corpus trees without field names. To record
them with fields, run `script/update-corpus-fields.py` instead, then review the
diff: it records what the parser does now, not what it should do.
