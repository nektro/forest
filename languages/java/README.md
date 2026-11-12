# tree-sitter-java

A [tree-sitter](https://tree-sitter.github.io) grammar for Java SE 25.

- **No external scanner.** Every Java token is regular, so everything is in
  `grammar.js`. Text blocks are a run of immediate tokens, so comments and
  whitespace inside them are never skipped, and `\"""` or a lone `"` do not
  end them.
- **Follows the JLS.** Rules follow the Java Language Specification
  (chapters 3 and 7–15). It covers records, sealed types, switch expressions,
  record patterns and guards, text blocks, `var`, unnamed variables (`_`),
  module declarations, `import module` and compact source files. It also
  accepts the `value` modifier of value classes (JEP 401, a preview
  feature).

## Validation

`script/check-java-files.sh <dir>...` parses every `.java` file under the
given directories and lists those with errors. Results against an OpenJDK
checkout from 2026-11-11 (`9b2b58a78e8`):

| Input | Result |
| --- | --- |
| 14,037 files in `src/` | all parse without errors |
| 39,158 files in `test/` | 38,979 parse; the other 179 are below |

The 179 test files that fail are all ones javac rejects or that use
unsupported escapes:

- 63 are javac's examples of its own error messages
  (`langtools/tools/javac/diags/examples`)
- 98 are tests that must fail to compile, and fail for syntax reasons
- 11 use `\uXXXX` escapes outside string and character literals (see Known
  limitations)
- 7 are deliberately broken inputs for parser recovery tests, or have an
  unclosed comment

All 58 Java files in the SQLite source tree (`ext/jni`) parse too.

Parsing runs at about 14 MB/s on an 18 MB file.

## Ambiguity

Java is not LR(1): a name can start a type or an expression. In
`Foo<Bar> x;` against `a < b;`, `Foo[] x;` against `a[0] = 1;`, and
`(T) x` against `(a) - b`, the parser keeps both readings until one fails.
When both parse, it chooses what the JLS chooses:

- a local variable declaration over an expression statement (`a < b > c;` is
  a declaration)
- `(a) - b` and `(a) + b` are subtractions and additions. A cast can only be
  followed by `+` or `-` after a primitive type, as in `(int) -x`
- `yield` followed by an expression is a yield statement, `yield (x);`
  included
- `case R()` is a record pattern, not a call

`String::length` and `a.b::c` read the receiver as an expression
(`identifier`, `field_access`). Only a receiver that cannot be an expression
(`List<T>::new`, `int[]::new`) is a type.

## Contextual keywords

`record`, `yield`, `sealed`, `permits`, `when`, `value`, `module`, `open`,
`requires`, `exports`, `opens`, `to`, `uses`, `provides`, `with` and
`transitive` are
keywords only where the JLS uses them. Everywhere else they are names:
`record.get()`, `value++`, `int module = 1;` and `import module.foo.Bar;` all
parse.
`var` is never a keyword. It is a `type_identifier`, and the highlight query
picks it out.

## Leniency

- The order of package, import and type declarations is not checked, and
  methods and fields are accepted at the top level of any file, not only in
  compact source files.
- An expression statement can be any expression, not only an assignment,
  increment, call or `new`. This keeps half-written code in one piece.
- Modifiers are not checked against the declaration they are on.

## Known limitations

- `yield++;` and `yield--;` on a variable named `yield` are parse errors.
- Unicode escapes (`\u0041`) are recognized in strings and character
  literals, but not in identifiers or elsewhere in the source.

## Tree shape

- `_expression`, `_primary_expression`, `_statement`, `_type`,
  `_simple_type`, `_unannotated_type`, `_literal` and `_pattern` are
  supertypes.
- Names in types are `type_identifier`. Dotted names in package, import,
  module and annotation positions are `scoped_identifier`. In expressions
  they are `field_access`.
- A switch at the start of a statement is a `switch_statement`. Anywhere else
  it is a `switch_expression`. Both have a `switch_block` of
  `switch_block_statement_group`s or `switch_rule`s.
- `string_literal` and `text_block` both contain `string_fragment` and
  `escape_sequence` children.

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
script/check-java-files.sh ~/src/openjdk/src ~/src/openjdk/test
```

`tree-sitter test --update` writes corpus trees without field names. To record
them with fields, run `script/update-corpus-fields.py` instead, then review the
diff: it records what the parser does now, not what it should do.
