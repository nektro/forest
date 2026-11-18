# tree-sitter-kdl

A [tree-sitter](https://tree-sitter.github.io) grammar for
[KDL](https://kdl.dev) 2.0, with no external scanner.

## KDL 1.0

KDL 1.0 documents parse too, where the two versions differ only in tokens:

- bare `true`, `false` and `null` are `boolean` and `null` values
- `r"…"` and `r#"…"#` raw strings, which may span lines
- the `\/` escape

KDL 1.0's quoted strings could span lines without `"""`; those are errors
here.

## Tree shape

- `document` and `children` hold `node`s. A node has an optional `type`, a
  `name`, any number of `argument`s and `property`s, and `children` fields
  for its children blocks.
- `argument` has an optional `type` and a `value`; `property` has `key`, an
  optional `type` and `value`. `_value` is a supertype covering
  `identifier`, `string`, `raw_string`, `number`, `boolean` and `null`.
- A `string` (single-line `"…"` or multi-line `"""…"""`) contains
  `string_content` and `escape_sequence` children. A `raw_string` is one
  token.
- `#inf`, `#-inf` and `#nan` are `number`s.
- A `/-` comment is a `slashdash` child of the node, argument, property or
  children block it comments out. The version marker `/- kdl-version 2` is
  an ordinary slashdashed node.
- `line_comment`, `block_comment` and `line_continuation` (a `\` before a
  newline, with any `//` comment between) are extras. Block comments nest.

## Queries

`queries/highlights.scm` captures node names as `@tag`, property keys as
`@property` and type annotations as `@type`. A slashdashed element is a
`@comment`, along with its names and values down to the entries of a
commented-out node (and the names of the nodes in a commented-out children
block); anything deeper keeps its usual colors. `queries/folds.scm` folds
children blocks, block comments and strings.

## Known limitations

- Raw strings take up to six `#`s (`######"…"######`); more is an error. A
  grammar has no way to match a closing quote against the hashes that opened
  it, so each count is a token of its own.
- A `\` line continuation right at the end of the file is an error.
- The grammar is more lenient than the spec in ways that do not change the
  tree for a valid document:
  - Entries need no whitespace between them: `node"a"1` is three tokens.
  - Numbers are not checked against what follows, so `1.0.0` and `0x` split
    into several numbers and identifiers.
  - `inf`, `nan` and `-inf` are identifiers.
  - Multi-line strings are not checked for a newline after the opening `"""`
    or for a shared indentation prefix.
  - `\u{…}` escapes are not checked for surrogates or values over `10FFFF`.

Of the official test suite's 243 valid inputs, all but the `\` at the end of
the file parse without errors; of its 95 invalid inputs, 50 are errors.

## Development

```bash
tree-sitter generate --js-runtime bun
```

```bash
tree-sitter test
```

```bash
bun script/check-highlights.ts
```

`script/check-test-suite.sh` runs the official test suite from a checkout
of [kdl-org/kdl](https://github.com/kdl-org/kdl):

```bash
script/check-test-suite.sh ~/src/kdl/tests/test_cases
```

`script/update-corpus-fields.py` rewrites the expected trees in
`test/corpus` with field names, which `tree-sitter test --update` leaves
out.
