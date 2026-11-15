# tree-sitter-just

A [tree-sitter](https://tree-sitter.github.io) grammar for
[just](https://github.com/casey/just)'s justfiles, as just's own lexer and
parser read them (`GRAMMAR.md`, `src/lexer.rs` and `src/parser.rs`), with no
external scanner. It covers the current syntax: settings, aliases,
`export`/`unexport`/`eager`, `import?` and `mod?`, user-defined functions,
attributes with keyword arguments, recipe parameters and variadics,
dependencies with arguments (`(dep a b)`), mapped dependencies (`*(dep *xs)`)
and subsequents (`&& dep`), `if`/`else if`/`else`, `assert(...)`, the `/`,
`+`, `++`, `==`, `!=`, `=~`, `!~`, `&&`, `||` and `!` operators, list
literals, cooked, raw, indented, shell-expanded (`x"..."`) and format
(`f"...{{x}}..."`) strings, backticks, and recipe bodies with interpolations,
line prefixes and shebangs.

## How it works without a scanner

just's lexer keeps a stack of indentation widths to tell where a recipe body
ends. This grammar puts the indentation in the line break token instead, the
way the Python grammar in this repository does.

- **A line break followed by indentation is a token of its own.** `_body_nl`
  is a line break, with any blank lines before it, followed by spaces or
  tabs; `_eol` is a bare line break. The lexer takes the longest match, so the
  token after a recipe header or a body line says whether the next line is
  part of the body (it is indented) or starts a new item (it is not). Since
  just requires every top-level item to start at column 0, nothing else needs
  to compare widths.
- **Line breaks are also extras.** tree-sitter lexes only the tokens the
  current state accepts and treats an extra as a regular token wherever it is
  valid. No line break is valid inside `()`, `[]`, `{}` or `{{ }}`, so there
  it is skipped like a space, as just does. A backslash before a line break is
  an extra everywhere outside a body.
- **Body text outranks every other token a body line could start with**,
  except the `@`/`-` prefixes and, on a body's first line, a shebang. So `#`
  in a body is shell text, not a comment, and `{` that does not start `{{` is
  text.
- **Keywords are names too.** `export foo='bar':` is a recipe named `export`,
  and `mod := "m"` an assignment. At the start of an item the parser keeps
  both readings (declared conflicts) until a later token settles it.
  Elsewhere, tree-sitter lexes a keyword that is not valid as an identifier.
- **`x` and `f` prefixes are part of the opening quote.** `x"..."` and
  `f"..."` are each one token, since `x` alone is a name: `x + "a"` and
  `x"a"` differ only in the space.

## Tree shape

- `source_file` holds items: `recipe`, `assignment` (with an optional `eager`
  `modifier`), `export`, `unexport`, `alias`, `function_definition`, `import`,
  `module` and `setting`, and `comment`s.
- Any item may start with `attributes` lines: `[` `attribute`, ... `]`. An
  `attribute` has a `name` and `argument`s, which are expressions or
  `keyword_argument`s (`long="x"`).
- `recipe` is a `recipe_header` and an optional `body`. The header has
  `quiet` (`@`), `name`, `parameters` (`parameter`s, each with `export`
  (`$`), `name` and `default`, then a `variadic_parameter` with `kind` `+` or
  `*`), and `dependencies`. A `dependency` has a `recipe` (an `identifier`, or
  a `module_path` such as `mod::recipe`), `argument`s and `mapped` (`*`); a
  starred argument is a `starred_argument`. Dependencies after `&&` are in the
  same `dependencies` node, after the `&&` token.
- `recipe_body` takes one of two shapes. If its first line is a `shebang`, the
  body is run as one script: it holds the `shebang` and the `interpolation`s,
  with no node per line. Otherwise it holds a `recipe_line` per line, each
  run by the shell on its own, with an optional `prefix` (`@`, `-`, `@-`,
  `-@`) and `interpolation`s. Body text has no node, so a line less its
  children is exactly what goes to the shell.
- Expressions are `binary_expression` (`left`, `operator`, `right`),
  `unary_expression` (`!` or a leading `/`, with an `operand`),
  `if_expression` (`condition`, `consequence` and `alternative`, each branch a
  `block`), `call_expression` (`function`, `arguments`), `assert_expression`
  (`condition`, `message`), `parenthesized_expression`, `list`, `string`,
  `format_string`, `backtick` (with a `command`) and `identifier`.
- Precedence follows just: `||` binds loosest, then `&&`, then the
  comparisons, then `/`, `+` and `++`, which all bind to the right at one
  level (`a + b / c` is `a + (b / c)`); `!` applies to a single value.
- `string` holds `escape_sequence`s (`\n`, `\t`, `\"`, `\u{1F600}`, a
  backslash before a line break). Raw strings (`'...'`, `'''...'''`) have no
  children. `format_string` holds `escape_sequence`s and `interpolation`s;
  `{{{{` in one is an escaped `{{` and has no node.

## Leniency and limits

- **Semantics are not checked.** Unknown attributes and settings, duplicate
  recipes, undefined variables, parameters after a variadic one, and the
  types of setting values all parse.
- **Indentation is not checked for consistency.** A body may mix tabs and
  spaces, or change its indentation from line to line; just rejects both.
  Indented lines after a non-recipe item are skipped like spaces.
- **Line breaks are accepted anywhere one is not meaningful**, such as after
  an operator (`x := a +` then `b` on the next line) or between a recipe's
  name and its colon. just allows them only inside delimiters.
- **A comment at column 0 ends a recipe body**, as in just, so indented lines
  after it are an error.
- **`[script]` recipes have line nodes.** Only a shebang tells the grammar a
  body is a script; `[script("python3")]` bodies are parsed (and injected) as
  shell lines.
- **A shebang line is not interpolated**: `#!{{ interpreter }}` is one
  `shebang` token.
- Invalid escape sequences such as `\q` parse as `escape_sequence`s; just
  rejects them.

## Queries

- `highlights.scm`: keywords, settings (`@property`), recipe names
  (`@function`), dependencies and alias targets (`@function.call`),
  parameters, attributes (`@attribute`), just's built-in functions
  (`@function.builtin`) and constants such as `HEX` and `RED`
  (`@constant.builtin`), strings, escapes, backticks (`@string.special`),
  import and module paths, operators, interpolation braces, prefixes and the
  `@` and `$` markers (`@punctuation.special`), and shebangs (`@comment`, as
  the interpreter reads them).
- `injections.scm`: each `recipe_line` and each backtick as bash. A shebang
  recipe's body as a whole, in the language its shebang names: bash (`sh`,
  `bash`, `zsh`, `dash`, `ksh`, `nix-shell`), Python (`python`, `pypy`,
  `uv run`), TypeScript (`node`, `deno`, `bun`), Ruby or Lua. Interpolations
  and prefixes are left out of the injected text.
- `folds.scm`: recipes, conditionals, call arguments and lists.
- `tags.scm`: recipes, aliases, functions, variables and modules as
  definitions; dependencies, alias targets and calls as references.

## Validation

`script/extract-just-examples.py <just-checkout> <out-dir>` writes the
justfiles of a casey/just checkout: the `just` and `justfile` blocks of its
README, and every justfile its integration tests pass to `.justfile(...)`,
unindented the way its test harness does. Test justfiles whose test expects
`error:` on stderr go in a separate directory.
`script/check-justfiles.sh <dir-or-file>...` parses every `justfile`,
`.justfile` and `*.just` under the given paths and lists the ones with syntax
errors. Results from 2026-11-14:

| Input | Files | Errors |
| --- | --- | --- |
| casey/just's own justfile and `examples/` | 8 | 0 |
| casey/just README code blocks | 223 | 1: a block that uses `·` in place of indentation |
| casey/just test justfiles that just accepts | 1,033 | 0 |
| casey/just test justfiles that just rejects | 523 | 47, all syntax errors (unterminated strings, `=` for `:=`, `els`, stray delimiters, `\` before a non-newline, a variadic before a plain parameter); the other 476 are semantic errors |
| ublue-os/bluefin, aurora and bazzite (the `ujust` recipe collections), pop-os/cosmic-files, cosmic-term and cosmic-epoch, a crates.io crate | 37, 359 KB with the above | 0 |

On the real-world files, the trees have one `recipe` per recipe header a
regular expression finds (319) and one `shebang` per shebang line that
starts a body (156; a 157th `#!` sits inside a heredoc in a script).

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
script/check-justfiles.sh ~/src/just
```

The highlight tests are in `test/highlight-web/` and
`script/check-highlights.ts` runs them, because an assertion comment at
column 0 would end the recipe body above it; the script removes the
assertion lines before parsing.

`tree-sitter test --update` writes corpus trees without field names. To record
them with fields, run `script/update-corpus-fields.py` instead, then review the
diff: it records what the parser does now, not what it should do.
