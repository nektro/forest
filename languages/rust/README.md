# tree-sitter-rust

A [tree-sitter](https://tree-sitter.github.io) grammar for Rust 2024.

- **No external scanner.** Everything is in `grammar.js`, including the parts
  of Rust's lexical grammar that are not regular:
  - Block comments nest. A block comment is a rule, not a token, and its
    contents are a run of immediate tokens. Text inside it outranks `//` and
    `/*`, so `/* http://x */` and `/* a /* b */ // c */` are single
    comments.
  - Raw strings are one token per number of `#`s, from 0 to 16
    (`MAX_RAW_HASHES`). Each is a regular expression that ends at the first
    `"` followed by that many `#`s.
  - `1.` is a decimal followed by a `.` token, so the parser decides between
    `1.`, `1..2` and `1.max(2)`. `t.0.1` is two field accesses.
  - `'a'` is a character and `'a` a lifetime: the longest match wins.
- **Follows the Rust Reference.** It covers let chains and `let`-`else`,
  async closures, `&raw const`, `use<..>` capture bounds, `unsafe extern`
  blocks with `safe` items, `#[unsafe(..)]` attributes, labeled blocks, and
  `gen` and `try` blocks. It also accepts some unstable syntax used in the
  standard library: `const` traits and impls, `[const]` and `~const` bounds,
  `impl(crate)` trait restrictions, `const` closures, `default` items,
  `super let`, `do yeet`, `macro` items and `derive()`/`attr()` macro rules.

## Validation

`script/check-rust-repo.sh <rust checkout>` parses `library/`, `compiler/`,
and the `tests/ui` files marked `check-pass`, `build-pass` or `run-pass`, and
lists the files with errors. Results against a rust-lang/rust checkout from
2026-11-12 (`8eb778d0409`):

| Input | Result |
| --- | --- |
| 2,045 files in `library/` | all parse without errors |
| 2,240 files in `compiler/` | all parse without errors |
| 8,080 `tests/ui` files that should compile | 7,884 parse; the other 196 are below |

Of the 196 `tests/ui` files that fail:

- 164 use unstable syntax this grammar does not cover: delegation (`reuse`),
  `move(..)` expressions, `&pin mut`, unsafe binders, return type notation
  (`T::f(..): Send`), non-lifetime binders (`for<T>`), `gen fn`, `use`
  closures, never patterns, postfix `match`, guard patterns, frontmatter,
  `for await` and others
- 9 use `gen` as a variable name in an expression (see Known limitations)
- 8 use Rust 2015 anonymous parameters (`fn f(u8);`) or `try` as a name
- 15 are syntax corner cases: `while break 'a {}`, `Box<<T as A>::B>`, a bare
  `#!` shebang, a raw string that contains a NUL byte, and similar

Parsing runs at about 12 MB/s.

## Ambiguity

Rust has few real ambiguities, and the parser keeps both readings until one
fails:

- `if x {}`, `match x {}`, `while x {}` and `for _ in x {}`: `x {` may start a
  struct literal. That reading fails as soon as the block after it is
  missing. When both succeed, the result is what Rust does:
  `if x == S {} {}` is an `if` with an empty body, then a block.
- `1.` followed by a name is a method call (`1.max(2)`); followed by
  anything else it is a float.

At the start of a statement, an expression that ends in a block (`if`,
`match`, `loop`, `unsafe {}`, ...) or a macro invocation ends the statement,
as in Rust: `if a {} *b = 1;` is two statements. A `.` or `?` after it
continues the expression: `match x {}.len();`.

## Weak keywords

`union`, `default`, `auto`, `raw`, `safe` and `macro_rules` are keywords only
where Rust uses them. Everywhere else they are identifiers:
`fn union(default: u8)`, `&raw const x` and `macro_rules.len()` all parse.

## Leniency

- The top level of a file accepts statements as well as items, so snippets
  such as `let x = 1;` parse.
- A macro invocation at the start of a statement never needs a `;`, whatever
  its delimiters.
- Modifiers and visibility are not checked against the item they are on.
- Integer and float suffixes are limited to the ones Rust defines
  (`u8`...`usize`, `f16`...`f128`).

## Known limitations

- `gen` is always a keyword where a `gen` block could start, so a variable
  named `gen` cannot start an expression (`gen.next()`). Everywhere else,
  `gen` is an identifier.
- Rust 2015 anonymous parameters (`fn f(u8);` in a trait) are errors, and so
  is `try` as an identifier.
- Raw strings with more than 16 `#`s are errors.
- Token trees (macro arguments and bodies) are not parsed. The injection query
  reparses the arguments of macro invocations as Rust, and the highlight query
  marks a name followed by `(..)` inside a token tree as a call.

## Tree shape

- `_expression`, `_type`, `_pattern`, `_literal` and `_declaration_statement`
  are supertypes.
- Node names follow the tree-sitter-rust grammar where the constructs are the
  same: `function_item`, `impl_item`, `scoped_identifier`,
  `scoped_type_identifier`, `field_expression`, `match_arm`, `token_tree` and
  so on.
- Primitive types are `type_identifier`s. The highlight query picks them out.
  It also highlights modules and crates in paths (`std::fmt`) as types.
- Labels and lifetimes are single tokens: `label` and `lifetime`.
- Comments are `line_comment`, `doc_comment` (`///` and `//!`) and
  `block_comment`, which contains a `block_comment` for each nested comment.

## Queries

`queries/` contains `highlights.scm`, `locals.scm`, `tags.scm`, `folds.scm` and
`injections.scm`. In `highlights.scm` the last matching pattern wins, so
general patterns come first.

## Development

```bash
tree-sitter generate --js-runtime bun
```

```bash
tree-sitter test
```

```bash
script/check-rust-repo.sh ~/src/rust
```

`tree-sitter test --update` writes corpus trees without field names. To record
them with fields, run `script/update-corpus-fields.py` instead, then review the
diff: it records what the parser does now, not what it should do.
