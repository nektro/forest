# tree-sitter-batch

A [tree-sitter](https://tree-sitter.github.io) grammar for Windows batch
files (`.bat`, `.cmd`), as cmd.exe reads them.

- **No external scanner.** Newlines end statements; spaces, tabs and carriage
  returns are blanks, so CRLF files parse like LF ones. A `^` at the end of a
  line continues it.
- **Lines.** Labels (`:name`), comments (`rem ...` and `::...`) and
  statements. `@` (or several) before a statement hides its echo.
- **Statements.** `command`, `set_statement`, `if_statement`,
  `for_statement` and parenthesized `block`s, joined into `list`s by `&`,
  `&&` and `||` and into `pipeline`s by `|`. `|` binds tightest, then `&&`
  and `||`, then `&`. Redirections (`>`, `>>`, `<`, `2>file`, `2>&1`) can
  follow a command or a block.
- **Words.** Text, `"strings"`, `%variables%` (with `:~start,length` and
  `:old=new` edits), `!delayed!` variables, parameters (`%1`, `%*`, `%~dp0`,
  `%~$PATH:1`), `for` variables (`%%i`, `%%~nxi`, `%%#`) and escapes (`^&`,
  `%%`). Pieces written next to each other form a `concatenation`.
- **Keywords are case-insensitive**: `IF`, `If` and `if` are the same.

## Tree shape

- `source_file` holds statements, `label` and `comment` nodes. Blank lines
  have no node.
- `command` has a `name` field (a `command_name`) and `argument` and
  `redirect` fields. `echo`, `goto`, `call`, `setlocal` and the rest are
  commands; `echo.`, `echo:` and `echo(` too. `echo.Text` has the command
  name `echo.Text`, as cmd reads it.
- `set_statement` has an optional `option` (`/a` or `/p`), a `name` field (a
  `variable_name`) and a `value` field (a `value`). An unquoted name runs to
  the `=` and keeps its blanks (`set a b=c` sets `a b`); an unquoted value
  runs to the end of the command. In `set "name=value"` the quotes are
  tokens of the statement, and anything after the closing quote is kept as
  further pieces, because cmd ends the value at the last quote on the line
  (`set "args=%args% "%~1""`).
- `if_statement` has a `condition` field (`comparison`, `exist_condition`,
  `defined_condition`, `errorlevel_condition` or `cmdextversion_condition`),
  a `consequence` and an optional `alternative`. `comparison` has `left`,
  `operator` (`==`, `equ`, `neq`, `lss`, `leq`, `gtr`, `geq`) and `right`.
  `/i` and `not` are tokens of the statement.
- `for_statement` has `option` fields (`/d`, `/r`, `/l`, `/f`, a `/r` root or
  `/f` options string), a `variable` (a `for_variable`), `item` fields for the
  set (words, strings and `command_string`s such as `('dir /b')`) and a
  `body`.
- `block` holds the statements between `(` and `)`, then `redirect` fields.
- `list` has `left`, `operator` and `right` fields; `pipeline` holds its
  statements.
- `redirect` has an `operator` field and, unless it duplicates a handle
  (`2>&1`), a `destination`.

## How it follows cmd

- **Bodies run to the end of the line.** `if x a & b` runs both commands
  only when `x` holds, so the `list` is the `consequence`. The same goes for
  `for ... do`.
- **`else` follows a block on the same line**: `if x (a) else b`. In
  `if x a else b`, cmd passes `else b` to `a` as arguments, and so does this
  grammar.
- **Parentheses.** Inside a block, a `)` ends the block unless escaped as
  `^)` or quoted. Outside one it is text, so `echo Usage (see docs)` is one
  command at the top level. Each statement rule exists twice for this, once
  for the top level and once for blocks (the `_block` rules), aliased to the
  same nodes.
- **A `)` that starts a line outside any block is ignored** by cmd, with the
  rest of its line. It parses as a `comment`.
- **`rem` comments run to the end of the line**, `)` and `&` included, as in
  cmd.
- **Quotes.** Inside quotes `^`, `&`, `|`, `<`, `>` and parentheses are
  text, but variables still expand. A string with no closing quote ends at
  the end of the line.
- **Variables.** `%name%` needs a name with no blanks that does not start
  with a digit, `~` or `*` (those are parameters), so in `echo 50% of 100%`
  the `%` signs are text. A `%` or `!` that does not start a variable is
  text too, so `100%` is a `concatenation` of `100` and `%`.

## Limits

- **Delayed expansion is not known.** `!name!` is a `delayed_variable`
  whether or not the script enabled delayed expansion.
- **Variables are not expanded.** Macros that hold code or line breaks, such
  as `set $macro=for ... do (%\n%`, are read as their literal text. The
  `%\n%` idiom expands to a line break at run time and fails to parse here.
- **Only `/a`, `/p`, `/i` and the `for` switches are recognized as
  options.** They are matched as written, so `set /abc=1` reads as `/a`.
- **Line continuation** joins lines but does not escape the next line's
  first character, so `a^` + newline + `b` is two words, not `ab`.
- **Hybrid scripts** (batch combined with JScript, VBScript, PowerShell or
  HTA in one file) only parse up to where the other language starts.

## Validation

`script/check-batch.sh <dir>...` parses every `.bat`, `.cmd` and `.btm` file
under the given directories and lists the ones with syntax errors.

Results on 2026-11-14:

- All 81 batch files in local checkouts of python/cpython, ruby/ruby, Kitware
  CMake, rust-lang/rust, golang/go, swiftlang/swift, sqlite, openjdk and
  cython parse without errors. They include sqlite's 860-line
  `build-all-msvc.bat`, with deeply nested blocks, and ruby's
  `win32/configure.bat`.
- All 48 batch files in chromium's depot_tools parse without errors.
- 89 of the 197 files in npocmaka/batch.scripts, a collection of advanced
  batch idioms, parse without errors. Of the other 108, 103 are hybrid
  scripts. The rest are two `%\n%` macro scripts and three files that
  demonstrate cmd parser crashes and syntax errors.

## Queries

- `highlights.scm`: comments, labels, keywords, command names (with cmd's
  built-in commands as `@function.builtin`), `goto`/`call` targets, options,
  variables, parameters, strings, values, escapes and operators.
- `tags.scm`: labels as definitions; `goto` and `call` targets as references.
- `folds.scm`: blocks, `if` and `for` statements.

## Development

```bash
tree-sitter generate --js-runtime bun
```

```bash
tree-sitter test
```

`tree-sitter test --update` writes expected trees without field names;
`script/update-corpus-fields.py` rewrites them with fields. Review the diff.
