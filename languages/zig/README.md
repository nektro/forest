# tree-sitter-zig

A [tree-sitter](https://tree-sitter.github.io) grammar for [Zig](https://ziglang.org).

- **No external scanner.** Zig's grammar is context-free and all of its tokens
  are regular, so everything is in `grammar.js`, including strings, multiline
  strings and comments.
- **Follows the official grammar.** Rules are translated from
  `doc/langref/grammar.peg` in the Zig repository, and comments in `grammar.js`
  quote the PEG rule each one comes from.
- **Targets current Zig and still parses older code.** It accepts `bitpack`
  as well as `packed`, `usingnamespace`, `errdefer |err|`, and the old
  string-list asm clobbers.

## Validation

`script/check-zig-repo.sh <zig checkout>` parses every `.zig` file in a Zig
checkout, plus the sources embedded in `lib/std/zig/parser_test.zig`. Results
against Zig master from 2026-11-11 (`9281d7d39c`):

| Input | Result |
| --- | --- |
| 1,744 `.zig` files in the repository | all parse without errors, except `doc/langref/var_must_be_initialized.zig`, which Zig also rejects |
| 351 `zig fmt` canonical/transform inputs | all parse without errors |
| 45 `zig fmt` inputs that Zig must reject | 35 rejected; 10 accepted on purpose (see below) |

Parsing runs at about 14 MB/s on `src/codegen/x86_64/CodeGen.zig` (11 MB).

## Leniency

Some things Zig rejects are accepted here on purpose, because rejecting them
would break older code or needs more than a context-free token grammar:

- **Operator mixing.** Binary operators use classic precedence levels. Current
  Zig requires parentheses when mixing some operators (`a & b << c`,
  `a orelse b == c`, `a and b or c`) and rejects chained comparisons. Code that
  follows those rules gets the same tree either way.
- **Operator whitespace.** Zig requires the same whitespace on both sides of a
  binary operator (`2 -1` is an error) and rejects `&&`.
- **Placement rules.** Declarations between container fields and doc
  comments in unusual places are left for the compiler to report.

## Tree shape

- Statement forms win over the equivalent expression statement, as in the PEG:
  `{}` at the start of a statement is a `block`, and `if (a) b else c;` is an
  `if_statement` whose alternative is an `expression_statement`.
- Type positions (return types, annotations, field and parameter types) also
  accept the type-level `if`/`for`/`while`, so `fn f() if (c) A else B {}`
  parses as Zig does. Those nodes are shown as `if_expression` etc.
- A bare identifier field such as the enum member `a` or `a = 1` is in the
  container field's `type` field, as in the PEG and in Zig's own AST.
- `fn f() !T` has `return_type: (error_union_type value: …)` with no `error`
  field.
- `true`, `false`, `null`, `undefined` and primitive types are identifiers,
  as in Zig. The highlight queries recognize them by name.

## Queries

`queries/` contains `highlights.scm`, `locals.scm`, `tags.scm`, `folds.scm` and
`injections.scm`. In `highlights.scm` the last matching pattern wins, so general
patterns come first.

## Development

```bash
tree-sitter generate --js-runtime bun
```

```bash
tree-sitter test
```

```bash
script/check-zig-repo.sh ~/src/zig
```

`tree-sitter test --update` writes corpus trees without field names. To record
them with fields, run `script/update-corpus-fields.py` instead, then review the
diff: it records what the parser does now, not what it should do.

`.zon` files are a single expression rather than container members, so they
are not handled yet.
