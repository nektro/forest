# tree-sitter-swift

A [tree-sitter](https://tree-sitter.github.io) grammar for
[Swift](https://swift.org), with no external scanner.

## No external scanner

A few parts of Swift's syntax depend on whitespace or newlines. Other Swift
grammars handle those in a scanner; this one uses immediate tokens (tokens
that only match with no whitespace before them) and grammar structure:

- **Calls and subscripts.** `f(x)` and `a[i]` need the `(` or `[` right after
  the callee, so `f` followed by `(x)` on the next line is two statements, as
  in Swift.
- **Postfix `?` and `!`.** Optional chaining, force unwrap, `T?`, `try?` and
  `as!` use immediate tokens. The ternary `?` does not, so `a ? b : c` and
  `a?.b` never compete.
- **Generic arguments.** In expressions, `Array<Int>()` needs an immediate
  `<`, so `a < b` is always a comparison. `a<b` without spaces is tried both
  ways; generic arguments win when both parse (`f<T>(x)`).
- **Trailing closures in conditions.** Swift does not allow
  `if items.contains { … } { }`. Conditions (`if`, `while`, `guard`, `for`,
  `switch`, `catch`) use a copy of the expression rules without trailing
  closures. Expression statements use another copy that cannot start with a
  closure, so a `{` after a statement is always a trailing closure. The copies
  are aliased to the ordinary node names.
- **Nested block comments.** `multiline_comment` is a rule, so
  `/* a /* b */ c */` is one comment.
- **Strings.** Plain, multiline and raw strings (up to three `#`), with
  interpolation and escapes, are all in the grammar.

## Leniency

Some things Swift rejects, or reads differently, are accepted here:

- **Newlines between statements.** A line that could continue the previous
  expression does: `a` then `.b()` is a member access (as in Swift), and `a`
  then `-b` is a subtraction (Swift reads a prefix `-`).
- **Spaces before call parentheses.** `f (x)` is `f` followed by a tuple,
  not a call.
- **Placement rules** (`case` outside an enum, modifiers on the wrong
  declaration, statements at the top level of a library) are left to the
  compiler.

Not supported:

- Bare regex literals (`/[a-z]+/`). Telling them apart from division needs
  whitespace context. `#/[a-z]+/#` works.
- `func ==<T>(…)` with no space between an operator name and `<`. The lexer
  reads `==<` as one operator.
- `[3 of Int]` inline array type sugar, init accessors and `@abi`/`@_effects`
  arguments that are not expressions.

## Tree shape

- Expression statements are direct children of `source_file`/`block`, with no
  wrapper node.
- `if` and `switch` are `if_statement` and `switch_statement` both as
  statements and as expressions (`let x = if c { 1 } else { 2 }`).
- Patterns reuse expression nodes where they look alike: `case .a:` has an
  `implicit_member_expression`, `case let x as Int:` a `value_binding_pattern`
  around a `cast_expression`. `enum_case_pattern`, `tuple_pattern`,
  `value_binding_pattern`, `optional_pattern` and `is_pattern` appear when a
  pattern needs them; patterns win ties.
- Freestanding macros are `macro_expansion` nodes, called like functions:
  `#selector(f)` and `#Preview { }` are `call_expression`s.
- Contextual keywords (`get`, `async`, `open`, `actor`, …) are `identifier`
  nodes where they are used as names. Keywords after `.` (`.init`, `.default`)
  are always `identifier`s.

## Validation

`script/check-swift-repo.sh <swift checkout>` parses the Swift sources in a
[swiftlang/swift](https://github.com/swiftlang/swift) checkout that are meant
to be valid. Results against `main` from 2026-11-11 (`0e4d3eb8648`):

| Directory | Files | Parse without errors |
| --- | --- | --- |
| `stdlib` | 527 | 512 (97%) |
| `benchmark` | 233 | 228 (98%) |
| `SwiftCompilerSources` | 206 | 204 (99%) |
| `test/Interpreter` | 587 | 553 (94%) |

Most remaining failures use the unsupported forms listed above, or very new
syntax (`nonisolated(nonsending)` in some positions, module selectors
`A::b`). Against swift-nio, swift-collections, swift-algorithms,
swift-argument-parser, swift-format, Alamofire, Vapor and
swift-composable-architecture, 2,957 of 2,976 files parse without errors;
most of the rest are tutorial snippets with placeholders, or bare regexes.

Parsing runs at about 10 MB/s. The generated parser is large because of the
expression copies: the wasm build is about 7.8 MB (450 KB gzipped).

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
script/check-swift-repo.sh ~/src/swift
```

`tree-sitter test --update` writes corpus trees without field names. To record
them with fields, run `script/update-corpus-fields.py` instead, then review the
diff: it records what the parser does now, not what it should do.
