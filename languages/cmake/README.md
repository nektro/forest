# tree-sitter-cmake

A [tree-sitter](https://tree-sitter.github.io) grammar for the CMake
language, following
[cmake-language(7)](https://cmake.org/cmake/help/latest/manual/cmake-language.7.html).

- **No external scanner.** CMake's two scanner-shaped tokens are handled in
  `grammar.js`:
  - Bracket arguments and comments (`[==[ ... ]==]`) close at a `]` with as
    many `=` as they opened with. Each level from 0 to 8 is its own token,
    whose regex matches content that does not contain that level's closing
    bracket. Deeper brackets share one token that closes at the first `]`
    with 9 or more `=`. This covers the 71-`=` brackets that open CMake's
    module documentation (`#[====...====[.rst:`).
  - Quoted and unquoted arguments are runs of immediate tokens, so
    whitespace and `#` are never skipped inside them, and whitespace ends an
    unquoted argument.
- **Parses inside arguments.** Variable references (`${x}`, `$ENV{x}`,
  `$CACHE{x}`, nested `${a_${b}}`) and generator expressions (`$<...>`) are
  nodes inside quoted and unquoted arguments.
- **Blocks.** `if`/`elseif`/`else`/`endif`, `foreach`, `while`, `function`,
  `macro` and `block` are nested statements, so they fold and their bodies
  can be queried. Command names ignore case, as in CMake: `IF`, `If` and `if`
  are all `if`. A longer name such as `whiletest` is an ordinary command.

## Validation

`script/check-cmake-files.sh <dir>...` parses every `CMakeLists.txt` and
`.cmake` file under the given directories and lists those with errors.
Results from 2026-11-12:

| Input | Result |
| --- | --- |
| 12,760 files in a CMake checkout (`83f4fba5b4`) | 12,719 parse; the other 41 are below |
| 579 files in Swift, Zig, Linux and OpenJDK | 578 parse; the other is a C header template named `config.h.cmake` |

The 41 CMake files that fail are all ones CMake rejects or that are not
CMake code:

- 35 are tests that CMake must reject (`Tests/RunCMake/Syntax`, unclosed or
  mismatched blocks, unterminated calls, UTF-16 and UTF-32 files, and the
  like)
- 2 are tests whose bad variable references are never evaluated, so CMake
  does not report them (`${CMAKE_ CURRENT_SOURCE_DIR}`,
  `${CMAKE_${lang}_SIMULATE_ID)`)
- 4 are templates: a C header, `@VAR@` lines for `configure_file`, and a
  regex of expected output

Parsing runs at about 19 MB/s on a 6.8 MB file.

## Generator expressions

CMake reads generator expressions only after it has split a call into
arguments, so one can run across arguments:

```cmake
target_compile_options(t PRIVATE $<$<CXX_COMPILER_ID:GNU>:-Wall -Wextra>)
```

The outer expression starts in `$<...>:-Wall`. Its `>` comes at the end of
`-Wextra>`. A `generator_expression` therefore ends at its `>` or at the end
of its argument, whichever comes first. Here the first argument has the
complete inner expression and an unclosed outer one, and `-Wextra>` is plain
text.

## Leniency

- Commands do not need a newline between them: `a() b()` parses.
- Any character but a newline can be escaped. CMake accepts only `\t`, `\r`,
  `\n`, `\;` and escaped punctuation.
- Arguments do not need whitespace between them. `a"b"` is an unquoted
  argument followed by a quoted one. CMake reads it as one legacy argument.
- `else()`, `endif()` and the other block commands are ordinary commands
  where no block is open.
- `@VAR@` is allowed in variable names, for `configure_file` templates.

## Known limitations

- `$(VAR)`, the legacy Make-style reference, is a `$` followed by an
  `argument_group`.
- Bracket arguments deeper than 8 close at the first `]` with 9 or more `=`,
  even if it has fewer than the opening bracket.
- A variable reference must close in the argument it opens in, and its name
  is limited to the characters CMake allows (`A-Za-z0-9/_.+-`, escapes and
  nested references).

## Tree shape

- `source_file` holds commands and block statements. A `command` has `name`
  (an `identifier`) and `arguments` (an `argument_list`).
- Block statements (`if_statement`, `foreach_loop`, `while_loop`,
  `function_definition`, `macro_definition`, `block_statement`) hold their
  opening and closing commands (`if_command`, `endif_command`, ...) and the
  body between them. `if_statement` also has `elseif_clause` and
  `else_clause` children. The name of a block command is an anonymous node
  of the lowercase word (`"if"`), however it was written.
- `_argument` is a supertype covering `bracket_argument`, `quoted_argument`
  and `unquoted_argument`. Parentheses inside an argument list are an
  `argument_group`.
- `quoted_argument` contains `string_content`, `escape_sequence`,
  `line_continuation`, `variable_reference` and `generator_expression`
  children. `unquoted_argument` has the same children except
  `string_content`; its plain text is not a node.
- `variable_reference` has a `name` field, a `variable`. A
  `generator_expression` holds `genex_text`, nested references and
  expressions, and anonymous `:` and `,`.
- Comments are `line_comment` and `bracket_comment`.

## Queries

`queries/` contains `highlights.scm`, `folds.scm` and `tags.scm`. In
`highlights.scm` the last matching pattern wins, so general patterns come
first. Builtin commands are matched in lower and upper case.

## Development

```bash
tree-sitter generate --js-runtime bun
```

```bash
tree-sitter test
```

```bash
script/check-cmake-files.sh ~/src/cmake ~/src/swift
```

`tree-sitter test --update` writes corpus trees without field names. To record
them with fields, run `script/update-corpus-fields.py` instead, then review the
diff: it records what the parser does now, not what it should do.
