# tree-sitter-nix

A [tree-sitter](https://tree-sitter.github.io) grammar for the
[Nix language](https://nix.dev/manual/nix/latest/language/).

- **No external scanner.** Strings, indented strings and paths with
  interpolations are lexed with immediate tokens in `grammar.js`; see the
  comment at its top for how.
- **Follows the reference implementation.** Tokens are the regular expressions
  in Nix's `src/libexpr/lexer.l`, and the expression layers (function, `if`,
  operators, application, select, simple) are those of `parser.y`, so
  longest-match lexing gives the same results as Nix: `a/b` is a path and
  `a / b` a division, `x:y` is a URI and `x: y` a function, `1e5` is `1`
  applied to `e5`, and `f -1` is a subtraction.
- **Current syntax.** That includes the pipe operators `|>` and `<|`, `${…}` in
  paths, `or` as an attribute name, and the deprecated `let { … }`.

## Validation

`script/check-nix-files.sh <dir>...` parses every `.nix` file under the given
directories. Results from 2026-11-12:

| Input | Result |
| --- | --- |
| 45,392 files in nixpkgs (`48c0cc98b`) | all parse without errors |
| 458 files in Nix's `tests/functional/lang` (`eb1c348`) that Nix parses | all parse without errors except two that contain a NUL byte |
| 42 `parse-fail-*.nix` tests there | 30 rejected; 12 accepted (see below) |

The accepted `parse-fail` tests are errors Nix reports from its parser actions
rather than its grammar: duplicate attributes or formals, an undefined
variable, `a = …; a.b = …;` mixes, and a path with a trailing slash.

Parsing runs at about 18 MB/s on `pkgs/top-level/perl-packages.nix` (1.1 MB).

## Leniency and limits

- **Trailing slashes.** `./foo/` is accepted as a path.
- **`foo/${x}`.** Nix starts a path at `foo/` only when `${` follows, and
  tree-sitter cannot look ahead, so a path whose first interpolation comes
  right after its first `/` has to start with `./`, `../`, `~/` or `/`. A lone
  `/` start (`/${x}`) is recognized wherever a division is not valid, as in
  `a.b or /${x}`, but not as a function argument (`f /${x}`). No file in
  nixpkgs uses either form.
- **Non-associative operators.** `a == b == c` and `a < b < c` are errors in
  Nix; here they associate to the left.

## Tree shape

- `source_code` has an optional `expression`. Expression nodes are named
  `*_expression`; `_expression` is a supertype.
- Operators are `unary_expression` and `binary_expression` with an `operator`
  field; `a ? b.c` is a `has_attr_expression`.
- `f a b` is nested `apply_expression`s, `a.b.c or d` a `select_expression`
  with an `attrpath` and a `default`.
- A `function_expression` has a `universal` (the `x` in `x: …` or `x@{…}: …`),
  `formals`, or both, and a `body`.
- Attribute sets, `rec` sets, `let` and `let { … }` hold a `binding_set` of
  `binding`, `inherit` and `inherit_from` nodes.
- Strings, indented strings and paths are sequences of `string_fragment` or
  `path_fragment`, `escape_sequence` and `interpolation` children. Text is
  split where Nix splits it (around `$` and `''`), so one run of text may be
  several fragments.
- `true`, `false`, `null` and `builtins` are identifiers, as in Nix. The
  highlight queries recognize them by name.

## Queries

`queries/` contains `highlights.scm`, `locals.scm`, `tags.scm`, `folds.scm` and
`injections.scm`. In `highlights.scm` the last matching pattern wins, so general
patterns come first. `injections.scm` marks build phases, hooks and the
arguments of `writeShellScript`, `runCommand` and similar as `bash`, and an
indented string after a `/* lang */` comment as that language.

## Development

```bash
tree-sitter generate --js-runtime bun
```

```bash
tree-sitter test
```

```bash
script/check-nix-files.sh ~/src/nixpkgs
```

`tree-sitter test --update` writes corpus trees without field names. To record
them with fields, run `script/update-corpus-fields.py` instead, then review the
diff: it records what the parser does now, not what it should do.
