# tree-sitter-gitattributes

A [tree-sitter](https://tree-sitter.github.io) grammar for `.gitattributes`
files (and `.git/info/attributes`), as described by
[gitattributes(5)](https://git-scm.com/docs/gitattributes) and read by git's
`attr.c`.

- **No external scanner.** Newlines end lines; blanks (spaces, tabs and
  carriage returns, as git counts them) separate a pattern from its
  attributes, so CRLF files parse like LF ones.
- **Every line kind.** Blank lines, comments (`#` as the first non-blank
  character), macro definitions (`[attr]name attr...`) and patterns with
  attributes.
- **Every attribute state.** `name` (set), `-name` (unset), `!name`
  (unspecified) and `name=value`. The value runs to the next blank and may be
  empty or contain `=`.
- **Glob pieces.** Unquoted patterns are split into wildcards, bracket
  expressions and escapes. C-quoted patterns (`"with space.txt"`) are read
  with their escapes.

## Tree shape

- `source_file` holds `comment`, `rule` and `macro_definition` nodes. Blank
  lines and blanks have no node.
- `rule` has a `pattern` field, either a `pattern` or a `quoted_pattern`,
  followed by `attribute` nodes.
- `macro_definition` is `[attr]`, a `name` field (an `attribute_name`), and
  `attribute` nodes.
- `attribute` has a `name` field, an optional `state` field (the `-` or `!`)
  and an optional `value` field (an `attribute_value`) after `=`.
- `pattern` is an optional `!` and then the pattern's pieces: `wildcard`
  (`*`, `**`, `?`), `bracket_expression` (`[a-z]`, `[!0-9]`, `[]x]`,
  `[[:digit:]]`) and `escape_sequence` (`\#`, `\*`). Other text has no node
  of its own.
- `quoted_pattern` holds the `escape_sequence` nodes inside the quotes
  (`\t`, `\"`, `\303`). The glob pieces inside the quotes are not split out.

## What git accepts that is checked here, and what is not

- **Invalid attribute names are errors.** git drops a line with an attribute
  name outside `[-._0-9A-Za-z]` (or starting with `-`), so `*.c foo/bar` has
  an `ERROR` node.
- **Negative patterns parse.** git warns about `!pattern` and ignores the
  line; here the `!` is a token at the start of the `pattern`.
- **`-name=value` parses.** git unsets the attribute and ignores the value.
- **Attributes may follow a quoted pattern directly**, as git reads them:
  `"a b"text` sets `text`.
- **Macros are allowed in any file.** git accepts `[attr]` lines only in the
  top-level `.gitattributes`, `.git/info/attributes` and global attribute
  files; that is not a syntax rule.

## Limits

- **`[attr]` followed by a blank is a macro, not a pattern.** git reads a
  bare `[attr]` as a bracket expression matching `a`, `t` or `r`. Telling the
  two apart needs to look past the `]`, so here `[attr]` always starts a
  macro definition, and `[attr] text` is an error.
- **Quoted patterns must be valid C quoting.** git falls back to reading a
  pattern literally when its quotes are unterminated or hold an unknown
  escape. Here an unterminated quote is an error, and any backslash escape is
  accepted.
- A pattern with an unclosed `[` reads it literally, as git does: `foo[bar`
  is plain text.

## Validation

`script/check-gitattributes.sh <dir>...` parses every `.gitattributes`,
`*.gitattributes` and `info/attributes` under the given directories and lists
the ones with syntax errors.

Results on 2026-11-14: all 195 attribute files in local checkouts of
swiftlang/swift, rust-lang/rust, microsoft/TypeScript, Kitware CMake,
nixos/nixpkgs, torvalds/linux, ruby/ruby, python/cpython, openjdk, golang/go,
ziglang/zig, moby/buildkit (with its vendored modules) and others parse
without errors. They cover macro definitions, bracket expressions such as
`*.{bat,[bB][aA][tT]}`, comma-separated `whitespace=` values and
`linguist-*` attributes.

## Queries

- `highlights.scm`: comments, patterns and their glob pieces, attribute
  names (with the attributes git itself reads as `@property.builtin`), states,
  values, and macro definitions.
- `tags.scm`: macro definitions.

## Development

```bash
tree-sitter generate --js-runtime bun
```

```bash
tree-sitter test
```

`tree-sitter test --update` writes expected trees without field names;
`script/update-corpus-fields.py` rewrites them with fields. Review the diff.
