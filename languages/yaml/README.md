# tree-sitter-yaml

A [tree-sitter](https://tree-sitter.github.io) grammar for
[YAML](https://yaml.org/spec/1.2.2/) 1.2, with no external scanner: block and
flow collections, compact and explicit entries, plain, quoted and block
scalars, anchors, aliases, tags, directives and multi-document streams.

## How it works without a scanner

Other YAML grammars keep a stack of indentation widths in an external
scanner. This one puts the indentation in the line break tokens, as this
repository's Python grammar does.

- **A line break is one token per indentation width.** `_nl_4` is a line
  break, with any blank lines before it, followed by 4 spaces. Widths 0 to 31
  have a token each; deeper lines share `_nl_deep`. The lexer takes the
  longest match, so the token after a node says how far the next line is
  indented.
- **A block collection is a run of entries separated by line breaks of one
  width.** Each width has its own rules (`_bmap_4` is
  `pair (_nl_4 pair)*`). A value on the lines after its key may be a node of
  any greater width, or a sequence at the key's own width. A collection goes
  on while the line breaks have its width and ends at any other, which then
  belongs to an enclosing collection. The parser never compares widths.
- **Compact collections take their width from the indicator.** `- ` is one
  token per number of spaces after the dash, so in a sequence at width 4 the
  mapping in `-   a: 1` is a mapping at width 8. The same goes for `? ` and
  for the `: ` of an explicit value.
- **Text that runs on to more indented lines carries its line break.** A
  line of a block scalar (`|`, `>`) under a node at width 4 is one token: a
  line break, at least 5 spaces and the rest of the line. A continuation line
  of a plain scalar is the same. Being longer, either beats the line break
  token of its width; a comment line inside a block scalar is text.
- **Where the indentation decides, the parser keeps both readings.** After
  `key:` or a sequence entry at the key's width, a line break of that width
  may lead to another entry (`- b`) or to the next key, and the token after
  it settles which. The grammar declares those conflicts.
- **A comment on a line of its own takes the line break before it**, so a
  comment at any indentation leaves the collections around it open.
- **Inside flow collections a line break is a space.** No line break token
  is valid inside `[]` or `{}`.
- **The first line has its own indentation token**, valid only at the start
  of the input, so a snippet that starts indented has its width.

A lexer detail shaped several tokens. tree-sitter's lexer does not go on from
a complete token to a longer one when the longer one only adds whitespace
before more characters, unless the longer one has a higher precedence. So
plain scalar continuation lines, the first line's indentation, document
markers after a line break and comments outrank the line break tokens. And a
line break is not in the whitespace regex of `extras`: as whitespace, the
lexer could skip it in the middle of another token, and `\n-x` after a scalar
became a single `-` token. Instead it is an extra token of its own with a
negative precedence, which only wins where no line break token is valid.

## Tree shape

The node names follow the widely used
[tree-sitter-yaml](https://github.com/tree-sitter-grammars/tree-sitter-yaml),
so most of its queries work here.

- `stream` holds `document`s and the comments outside them. A `document`
  holds `yaml_directive` (`yaml_version`), `tag_directive` (`tag_handle`,
  `tag_prefix`) and `reserved_directive` (`directive_name`,
  `directive_parameter`) nodes, the `---` and `...` markers, and its root
  node.
- `block_node` holds a `block_mapping`, `block_sequence` or `block_scalar`,
  after any `tag` and `anchor`. `block_mapping` holds `block_mapping_pair`s
  with `key` and `value` fields, for implicit (`a: 1`) and explicit
  (`? a` / `: 1`) keys. `block_sequence` holds `block_sequence_item`s.
- `flow_node` holds a scalar, `flow_sequence`, `flow_mapping` or `alias`,
  after any `tag` and `anchor`; with only properties it is an empty node with
  them. Flow collections hold `flow_node`s and `flow_pair`s (`key` and
  `value` fields).
- `plain_scalar` holds a `string_scalar`, or for the core schema's values a
  `null_scalar` (`~`, `null`), `boolean_scalar` (`true`, `False`),
  `integer_scalar` (`12`, `0x1F`, `0o17`) or `float_scalar` (`1.5`, `.inf`,
  `.nan`). A multi-line plain scalar is one `string_scalar`.
- `double_quote_scalar` and `single_quote_scalar` hold `escape_sequence`s
  (`\n`, `\x41`, `''`, ...). `block_scalar` has no children; its text runs
  from the indicator to the end of its last line.
- `anchor` is `&` and an `anchor_name`; `alias` is `*` and an `alias_name`.

## Leniency and limits

- **The top level checks no indentation.** A line that does not continue the
  root node starts another node in the same document, so indented snippets
  parse, and a document may hold more than one root node.
- **Any width greater than a key's is accepted for its value**, and a block
  scalar or plain scalar continues on any line more indented than its parent,
  even one less indented than its first line.
- **Collections deeper than 32 columns share a width.** There a value on the
  next lines nests in its key whatever its indentation, a sequence at its
  key's width nests too, plain scalars do not continue on the next line, and
  a block scalar takes every following line indented more than 32 columns.
- **A block scalar's indentation indicator is not used** to find its lines.
- **Any backslash pair in a double-quoted scalar is an escape sequence**, so
  `"\d"` is not an error.
- **An implicit key that ends in more than one colon** (`a:: b`) is read up
  to its last colon in YAML (key `a:`); here the key is `a` and the line is
  an error. A plain scalar token cannot leave out just the last colon of a
  run without lookahead.
- **Properties on two lines** before a block scalar (`&a` on one line, then
  `!tag |` on the next) are an error.
- `--- a: 1` (a mapping on the line of `---`) is an error, as in YAML.
- Tabs never count as indentation.

## Queries

- `highlights.scm`: keys as `@property` (and the merge key `<<` as
  `@keyword`), scalars as `@string`, `@number`, `@boolean` and
  `@constant.builtin`, escapes as `@string.escape`, tags as `@type`, anchor
  and alias names as `@label`, directives as `@keyword.directive`, and
  indicators as punctuation.
- `folds.scm`: mapping pairs, sequence items, flow collections, block
  scalars and quoted scalars.

## Validation

`script/check-yaml-files.sh <dir>...` parses every `.yaml` and `.yml` file
under the given directories and lists the ones with syntax errors.
`script/check-structure.ts` compares each file's tree with what Bun's YAML
parser (`Bun.YAML.parse`) reads from it: the nesting of mappings and
sequences, the number of entries, and the text of each key. Results from
2026-11-14:

| Input | Files | Errors | Structure |
| --- | --- | --- | --- |
| Linux (devicetree bindings, netlink specs, CI) | 5,972 | 1: a key ending in `::` | The other 5,970 that Bun reads agree; Bun rejects 1 |
| Ruby, BuildKit, Rust, Go, nixpkgs, Swift, CMake, CPython, TypeScript, Cython, OpenJDK, USWDS, Zig and just checkouts | 878 | 1: a tag on the line after an anchor, before a block scalar | The other 874 that Bun reads agree; Bun rejects 3 |

Parsing runs at about 10 MB/s on the largest of those files (the 550 KB
`arm_shared.spec.yml` in Rust's stdarch). A file of 20,000 `key:` lines each
followed by a sequence at the key's width, which makes the parser keep two
readings at every line, parses at about 3 MB/s.

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

```bash
script/check-yaml-files.sh ~/src/linux
```

```bash
find ~/src/linux -name '*.yaml' > /tmp/yaml-files.txt && bun script/check-structure.ts --paths /tmp/yaml-files.txt
```

The corpus tests put `|||` after their `===` and `---` lines, since YAML has
`---` lines of its own, and start each input on the line right after its
header: `tree-sitter test` keeps a blank line there as part of the input, and
the start of the input matters to YAML. The highlight tests are in
`test/highlight-web/` and `script/check-highlights.ts` runs them, because a
comment on a line of its own starts at the line break before it.

`tree-sitter test --update` writes corpus trees without field names. To record
them with fields, run `script/update-corpus-fields.py` instead, then review the
diff: it records what the parser does now, not what it should do.

`MAX_INDENT` in `grammar.js` sets the number of widths with a line break
token of their own and `MAX_GAP` the longest `- ` indicator; each width adds
rules and parse states. With 32 widths and gaps up to 4 the wasm file is
about 2.6 MB.
