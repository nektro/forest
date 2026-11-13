# tree-sitter-scss

A [tree-sitter](https://tree-sitter.github.io) grammar for SCSS, the
brace-and-semicolon syntax of [Sass](https://sass-lang.com). The indented
`.sass` syntax is not covered.

- **No external scanner.** Everything is in `grammar.js`. The two parts of CSS
  that usually need a scanner are handled in the grammar instead (see
  Ambiguity below).
- **Covers current Sass.** `@use` and `@forward`, module members
  (`math.div()`, `map.$x`, `mat.$x: 1`), placeholders, `@extend`, mixins with
  `@content` and `using`, functions, control flow, maps, interpolation in
  names, selectors, strings and queries, and the CSS-style
  `if(sass($a): x; else: y)` alongside the older `if($a, x, y)`. It also covers
  plain CSS: `@media` range queries, `@supports selector()`, `@container`,
  `@layer`, `@scope`, `:is()`, `:nth-child(2n + 1 of .x)` and so on.

## Validation

`script/check-scss-files.sh <dir>...` parses every `.scss` file under the
given directories and lists those with errors. Results on 2026-11-12:

| Project | Revision | Files | Result |
| --- | --- | --- | --- |
| twbs/bootstrap | `f9a7a89` | 138 | all parse |
| jgthms/bulma | `c5cd04b` | 179 | all parse |
| primer/css | `d0cdad7` | 113 | all parse |
| uswds/uswds | `029d6d7` | 682 | all parse |
| angular/components | `32cf962` | 434 | all parse |
| mastodon/mastodon | `918848e` | 135 | 134 parse |

The Mastodon file that fails has a typo in it (`--x: : color-mix(...)`).
Sass accepts it because it doesn't parse custom property values.

Parsing runs at about 13 MB/s on a 2.9 MB file.

## Ambiguity

**Whitespace in selectors.** `a.b` is one compound selector and `a .b` is a
descendant selector. Whatever continues a compound selector (`.b`, `#b`, `:b`,
`::b`, `[b]`) is a separate `token.immediate` with a higher lexical
precedence. It only matches when nothing was skipped before it. The same
approach joins the parts of a name with interpolation, like `.col-#{$i}-md`,
`margin-#{$side}` or `&--#{$mod}`. In values, `foo-#{$x}` is one
`interpolated_identifier` and `foo #{$x}` is two items.

**Declarations against nested rules.** Inside a block, `a:hover {` is a rule
and `color:red;` is a declaration. They look the same up to the `{` or `;`.
This is a declared conflict, and the GLR parser keeps both readings until one
fails. They never both succeed, because a declaration can't be followed by a
block. `mat.$x: 1;` against `mat.x {` works the same way.

**Minus.** A `-` followed by whitespace is binary, and one that touches what
follows is unary. So `$a - $b` is a subtraction, `$a -$b` is a two-item list,
and `a-b` is one identifier. Signed numbers are single tokens, so `1 -2` is a
list.

## Tree shape

- `stylesheet` and `block` hold statements. The last statement in either may
  leave out its `;`.
- `rule_set` has `selectors` and `body`. Compound selectors nest to the left,
  like tree-sitter-css: `a.b:hover` is
  `(pseudo_class_selector (class_selector (tag_name) name: (class_name)) name: (pseudo_class_name))`.
  Combinators are `descendant_selector`, `child_selector`,
  `adjacent_sibling_selector` and `sibling_selector`. The last three may have
  no left side (`> li` in a nested rule) or no right side (`& > {`).
- A plain name is a leaf (`tag_name`, `class_name`, `property_name`, ...). A
  name with interpolation has `identifier` and `interpolation` children.
- `declaration` has a `property` field, followed by its value items. Values
  are flat lists, like tree-sitter-css: the items and the commas between them
  are direct children. `_expression` is a supertype covering
  `binary_expression`, `unary_expression`, `call_expression`, `if_expression`,
  `map`, `parenthesized_expression`, `bracketed_list`, `variable`, `number`,
  `string` and the other literals.
- `@media`, `@supports` and `@container` conditions are a loose sequence of
  `keyword_query`, `feature_query` (`(min-width: 1px)`, `(width > 1px)`),
  `and`/`not`/`only`/`or`, interpolation and variables. That way anything Sass
  allows in a query parses.

## Known limitations

- An unquoted `url(...)` is one `url` token. Interpolation inside it, as in
  `url(#{$path}/a.woff2)`, is accepted but not parsed.
- Custom property values are parsed as SassScript. Raw tokens that Sass passes
  through, like a stray `:` or `{ }`, are errors.
- Nested properties with a value of their own (`font: 12px { family: x; }`)
  are not supported. `font: { family: x; }` is.
- `1-2` is a list of `1` and `-2`, and `(a)-(b)` is a list of `(a)` and
  `-(b)`. Sass treats both as subtraction.
- Namespaced selectors (`svg|a`), `@container style(...)` queries, and old IE
  hacks (`*zoom: 1`, `filter: progid:...`) are not supported.

## Queries

`queries/highlights.scm`, `locals.scm` (parameters and variables), `tags.scm`
(mixins, functions, top-level variables and placeholders, plus `@include`,
calls and `@extend` as references), `folds.scm` and `injections.scm`
(comments).

## Development

```bash
tree-sitter generate --js-runtime bun
```

```bash
tree-sitter test
```

`tree-sitter test --update` writes corpus trees without field names. To record
them with fields, run `script/update-corpus-fields.py` instead, then review the
diff.
