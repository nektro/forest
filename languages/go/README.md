# tree-sitter-go

A [tree-sitter](https://tree-sitter.github.io) grammar for [Go](https://go.dev).

- **No external scanner.** Go's automatic semicolons are handled in
  `grammar.js`: a newline is a terminator token wherever a statement,
  declaration, spec or field can end, and ordinary whitespace everywhere else.
  tree-sitter only lexes tokens the current parse state accepts, so the newline
  after `x := a +` is skipped and the one after `x := a` ends the statement.
- **Follows the spec.** Rules are translated from
  [The Go Programming Language Specification](https://go.dev/ref/spec), and
  comments in `grammar.js` quote the productions.
- **Targets Go 1.27.** That includes methods with type parameters and
  composite literals without a type (`f({X: 1})`, `return {}`), both new in
  1.27, as well as generics, `for range n` and the rest of Go 1.26.
- **Go keywords are reserved.** They are never parsed as identifiers, even
  during error recovery.

## Validation

`script/check-go-repo.sh <go checkout>` parses the `.go` files in a Go
checkout. Results against Go master from 2026-11-11 (`a7c6a395`):

| Input | Result |
| --- | --- |
| 7,154 `.go` files in `src/`, outside `testdata` | all parse without errors |
| 2,760 files in `test/` that should compile (not `errorcheck` or `skip`) | all parse without errors |
| 50 gofmt and go/printer `.golden` files | all parse without errors except `generics.golden` (see below) |
| 19 files in `test/syntax/` that Go must reject | 16 rejected; 3 accepted on purpose (see below) |

Parsing runs at about 9 MB/s on
`src/cmd/compile/internal/ssa/rewrite/amd64/rewriteAMD64.go` (2.8 MB), and
faster on less expression-heavy code.

`generics.golden` has `type _[P *T | <-T | T,] struct{}`. go/parser reads
constraints as expressions, so it parses `<-T`; the type checker rejects it.
Here a constraint term must be a type or `~T`.

## Leniency

Some code Go rejects is accepted, because rejecting it would make snippets
fail to highlight or needs more than a context-free grammar:

- **Top-level statements.** `x := 1` and `fmt.Println(x)` are accepted at the
  top level, and the package clause, imports and declarations may come in any
  order, so that snippets from docs and blog posts highlight.
- **Newlines before a closing bracket.** Go inserts a semicolon after `3` in
  `[]int{1, 2, 3⏎}` and then fails ("need trailing comma"). Here the newline
  is skipped wherever a terminator is not valid.
- **Expressions where Go wants a name.** The left side of `:=` and the type
  switch variable (`switch main() := x.(type)`) are expression lists.
- **Types as operands.** Type literals are expressions, so that conversions
  (`[]byte(s)`, `interface{}(x)`) and `make([]int, n)` parse; this also
  accepts a bare `x := []int`.

## Tree shape

- Statements and declarations are direct children of `block`, `source_file`
  and case clauses; there is no statement-list node.
- Where an identifier is an expression it is an `identifier`. In type
  positions it is a `type_identifier`, `qualified_type` (`pkg.T`) or
  `generic_type` (`T[int]`). Type names in expressions stay expressions:
  `pkg.T(x)` is a call of a `selector_expression`, `F[int]` is an
  `index_expression` with one `index` per type argument, and `*T` is a
  `unary_expression`. The type of a composite literal is a type.
- `{…}` without a type is a `literal_value`, whether it is a nested element
  (`[][]int{{1}}`) or a Go 1.27 untyped composite literal. Where a statement
  may start, `{` opens a `block`, as in Go.
- `if x == T{} {` is an error, as in Go: inside an `if`, `for` or `switch`
  header, `T{` is the start of the block. Parenthesize the literal.
- `(a, b int)` is one `parameter_declaration` with two names; `(a, b)` is two
  with a type each.
- `true`, `false`, `nil`, `iota` and the predeclared types and functions are
  identifiers, as in Go. The highlight queries recognize them by name.
- A label on an empty statement keeps the `;` as an `empty_statement`
  (`L: ;`). A label right before `}` has no statement.

## Queries

`queries/` contains `highlights.scm`, `locals.scm`, `tags.scm`, `folds.scm` and
`injections.scm`. In `highlights.scm` the last matching pattern wins, so general
patterns come first. `injections.scm` marks the pattern passed to
`regexp.Compile` and its relatives as `regex`.

## Development

```bash
tree-sitter generate --js-runtime bun
```

```bash
tree-sitter test
```

```bash
script/check-go-repo.sh ~/src/go
```

`tree-sitter test --update` writes corpus trees without field names. To record
them with fields, run `script/update-corpus-fields.py` instead, then review the
diff: it records what the parser does now, not what it should do.
