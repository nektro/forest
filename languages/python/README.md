# tree-sitter-python

A [tree-sitter](https://tree-sitter.github.io) grammar for
[Python](https://www.python.org) 3.14, with no external scanner. It also takes
two Python 3.15 additions: `lazy import` and unpacking in comprehensions
(`[*x for x in y]`).

## How it works without a scanner

Other Python grammars keep a stack of indentation widths in an external
scanner and emit INDENT and DEDENT tokens. This one puts the indentation in
the line break tokens instead.

- **A line break is one token per indentation width.** `_nl_4` is a line
  break, with any blank lines before it, followed by 4 columns of
  indentation. Widths 0 to 39 have a token each; deeper lines share
  `_nl_deep`. The lexer takes the longest match, so the token after a
  statement tells exactly how far the next line is indented.
- **A block is a run of statements separated by line breaks of one width.**
  Each width has its own block rule (`_block_4` is
  `_nl_4 statement (_nl_4 statement)*`), and a compound statement's body may
  be a block of any width. The block goes on while the line breaks have its
  width and ends at any other, which then belongs to an enclosing block. The
  parser never compares widths: in valid Python a body is indented further
  than every block around it, so its width is not theirs.
- **Clauses use the width of their statement's block.** An `if` in `_block_4`
  takes `elif` and `else` only after `_nl_4`, so an `else` goes to the `if`
  at its own indentation. The same goes for the `else` of `for` and `while`
  and the `except`, `else` and `finally` clauses of `try`. At such a line
  break the parser keeps both readings (a clause, or the next statement) until
  the keyword after it.
- **Inside brackets a line break is not a token.** tree-sitter only lexes the
  tokens the current state accepts. No line break token is valid inside
  `()`, `[]` or `{}`, so there it is skipped like a space.
- **A comment on a line of its own takes the line break before it.** A
  comment may sit at any indentation. If its line break were a token, a
  comment at column 0 inside a function would end the function.
- **Every kind of string has its own tokens.** Quote (`'`, `"`, `'''`,
  `"""`), raw or not, and f-string (or t-string) or not make 16 kinds, each
  with start, text and end tokens. Text outranks comments, so `"# x"` is a
  string. A `#` in a string is a token of its own: a run of text holding it
  could be outlasted by a comment starting at the `#`.

A tab counts as one column. That gives the same nesting as Python for valid
code, which must indent consistently whether a tab is 1 or 8 columns wide,
and lets tab-indented code nest 40 deep before its widths are shared.

## Leniency and limits

- **The top level checks no indentation.** Any line break separates two
  top-level statements, so indented snippets parse (a method copied out of a
  class, say).
- **Clauses may come in any order.** `else` before `elif`, a `try` without
  `except` or `finally`, and `finally` before `except` are accepted. Needing
  the order would add parse states for every indentation width.
- **Blocks deeper than 40 columns share a token**, so a body that deep is not
  told apart from the block it is in: the lines after it stay inside it. A
  clause there that has no statement of its own width before it is accepted
  on its own, as a statement of the block, rather than as an error.
- **An own-line comment starts at the end of the line before it**, since it
  holds the line break and indentation. Highlighting is not affected (the
  extra characters are whitespace), but tools that read the comment's start
  position see the previous line. That includes the highlight tests of
  `tree-sitter test`; see Development.
- **Assignment targets are expressions.** `f() = 1` and `a + b = 1` parse.
- **Bytes and strings take the same escapes**, and invalid escapes such as
  `\d` are text.
- Python 2 is not supported (`print x`, `exec x`, backticks, `1L`, `<>`).

## Tree shape

The node names follow the widely used
[tree-sitter-python](https://github.com/tree-sitter/tree-sitter-python), so
most of its queries work here. The differences:

- Unparenthesized tuples are `expression_list` everywhere, including on the
  left of `=` and in `for` targets (no `pattern_list`, `tuple_pattern` or
  `list_splat_pattern` there).
- `with_item` has `value` and `alias` fields instead of an `as_pattern`.
  `except_clause` and `except_group_clause` have `value`, `alias` and `body`.
- `type_alias_statement` has `name`, `type_parameters` and `value` fields.
- Type parameters are `type_parameters` holding `type_parameter` nodes with
  `name`, `bound` and `default` fields.
- `import_statement` and `import_from_statement` may start with `lazy`.
- `string` holds `string_start`, `string_content`, `escape_sequence`,
  `escape_interpolation`, `interpolation` and `string_end` directly. Text may
  be split into several `string_content` nodes.
- Patterns are `case_pattern` nodes holding `as_pattern`, `union_pattern`,
  `class_pattern`, `keyword_pattern`, `list_pattern`, `tuple_pattern`,
  `dict_pattern`, `splat_pattern`, `complex_pattern`, `dotted_name` or a
  literal.
- There is no `line_continuation` node, and `print` and `exec` are names.

`match`, `type` and `lazy` are soft keywords: where a name is expected they
are `identifier`s.

## Queries

`queries/highlights.scm` captures keywords by kind (`@keyword.import`,
`@keyword.conditional`, `@keyword.exception`, ...), builtins
(`@function.builtin`, `@type.builtin` for builtin classes and exceptions,
`@variable.builtin` for `self`, `cls` and dunder names), names in type
annotations as `@type`, docstrings as `@string.documentation` and f-string
format specs as `@string.special`. Names that look like classes (`Name`) or
constants (`NAME`) are captured as such.

`queries/locals.scm`, `queries/tags.scm` and `queries/folds.scm` cover
scopes and definitions, definitions and calls, and folding.

## Validation

`script/check-python-files.sh <dir>...` parses every `.py` and `.pyi` file
under the given directories and lists those with errors. Results from
2026-11-13:

| Input | Files | Result |
| --- | --- | --- |
| CPython `main` `Lib/` and `Tools/` | 2,292 | All parse but `badsyntax_3131.py` (a deliberate syntax error) |
| Swift, Linux, Rust, nixpkgs, CMake, Ruby, Go, Zig, SQLite and OpenJDK checkouts | 1,180 | All parse but 3: two nixpkgs files with `@substitution@` placeholders and an OpenJDK file in Python 2 |
| Cython checkout | 479 | All parse but 6: Cython syntax in `.py` files (2), Python 2 (3) and a pattern CPython rejects (`case 0.25 - +1.75j`) |

The trees were also checked against Python's own parser. Of the CPython
`Lib/` and `Tools/` and Swift `utils/` files, the 2,364 that Python 3.9's
`ast` module reads all agree on the line of every statement and of the
compound statement (or `elif`) holding it.

Parsing runs at about 10 MB/s on CPython's largest test files.

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
script/check-python-files.sh ~/src/cpython/Lib ~/src/cpython/Tools
```

The highlight tests are in `test/highlight-web/` rather than
`test/highlight/`, and `script/check-highlights.ts` runs them, because
`tree-sitter test` locates assertions by the positions of comment nodes.

`tree-sitter test --update` writes corpus trees without field names. To record
them with fields, run `script/update-corpus-fields.py` instead, then review the
diff: it records what the parser does now, not what it should do.

`MAX_INDENT` in `grammar.js` sets the number of indentation widths with a
token of their own. Each one adds parse states and symbols, so the parse
table grows faster than the number of widths: 40 widths give a 1.4 MB wasm
file.
