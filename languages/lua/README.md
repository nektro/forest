# tree-sitter-lua

A [tree-sitter](https://tree-sitter.github.io) grammar for Lua 5.5, which
also covers 5.1 through 5.4.

- **No external scanner.** The one part of Lua that is not regular is the
  long bracket (`[==[ ... ]==]`, `--[==[ ... ]==]`), which ends at the first
  `]` with the same number of `=` signs. Levels 0 through 10 are spelled out
  in `grammar.js`:
  - A long string is an opening token, immediate content tokens (a run of
    anything but `]`, or a lone `]`), and the closing token for its level.
    Where the closing bracket matches, it is the longest token, so it wins,
    which is exactly where Lua ends the string.
  - A long comment is one token, since comments are extras. Its body is a
    regex for "text that does not contain the closing bracket", built from a
    small automaton (`longBody` in `grammar.js`).
- **Follows `lparser.c` and `llex.c`** from the reference implementation.
  It covers integer division, bitwise operators, `goto` and labels,
  `<const>` and `<close>` attributes, and the Lua 5.5 additions: `global`
  declarations (`global x`, `global <const> *`, `global function f()`),
  attributes before a name list (`local <const> a, b`), and named varargs
  (`function f(...args)`).

## Validation

`script/check-lua-files.sh <dir>...` parses every `.lua` file under the
given directories and lists those with errors.

| Input | Result |
| --- | --- |
| Lua's test suite (`testes/`, 34 files, lua/lua `8cb93ba`) | all parse |
| neovim (`629e501`), Kong (`2103212`) and LuaRocks (`85bfe36`), 2,335 files | all parse but two deliberate syntax-error fixtures |

The long comment regexes were checked against Lua's rule (the comment ends
at the first closing bracket of its level) on every body of up to 7 to 9
characters over the alphabet `]`, `=`, `[`, `a` and newline, at every level.

Parsing runs at about 12 MB/s on a 19 MB file.

## `global`

Lua 5.5 builds with `LUA_COMPAT_GLOBAL` by default, so `global` is only a
keyword where a declaration can start. The grammar does the same:
`global x`, `global <const> *` and `global function f()` are declarations,
while `global = 1`, `global.x`, `global(1)` and `{global = 1}` use a
variable named `global`.

## Leniency

- Attributes accept any name, not only `const` and `close`.
- `...` is accepted outside vararg functions, `break` outside loops, and
  `goto` without a visible label. These are compile errors, not syntax
  errors, in Lua.
- Numbers accept LuaJIT's `LL`, `ULL` and `i` suffixes.
- Identifiers may contain non-ASCII characters, as LuaJIT allows.

## Known limitations

- Long brackets deeper than level 10 (`[===========[`) are parse errors.
  Raise `MAX_LEVEL` in `grammar.js` to support more, at the cost of a
  larger lexer.
- An unterminated long comment is an error, as in Lua, but only its first
  line becomes an `ERROR` node; the lines after it parse as code.

## Tree shape

- `statement`, `expression` and `variable` are supertypes.
- A call is `function_call` with `name` and `arguments` fields, both as a
  statement and inside expressions. A method call's name is a
  `method_index_expression`.
- `f\n(g)()` is a call of `f`, as in Lua.
- `string` has a `content` field (`string_content`) for every kind of
  string. In quoted strings, `string_content` contains `escape_sequence`
  children.
- `comment` is one node for line and long comments alike, and for a first
  line starting with `#` (`#!/usr/bin/env lua`), which Lua skips.

## Queries

`queries/` contains `highlights.scm`, `locals.scm`, `tags.scm`, `folds.scm`
and `injections.scm`. In `highlights.scm` the last matching pattern wins, so
general patterns come first.

## Development

```bash
tree-sitter generate --js-runtime bun
```

```bash
tree-sitter test
```

```bash
script/check-lua-files.sh ~/src/lua/testes
```

`tree-sitter test --update` writes corpus trees without field names. To record
them with fields, run `script/update-corpus-fields.py` instead, then review the
diff: it records what the parser does now, not what it should do.
