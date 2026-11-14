# tree-sitter-diff

A [tree-sitter](https://tree-sitter.github.io) grammar for diffs and patches,
with no external scanner:

- **Unified diffs** from `diff -u`, `git diff`, `hg diff` and `svn diff`,
  with git's extended headers (`index`, modes, renames, copies, similarity,
  `Binary files ... differ` and `GIT binary patch`).
- **Combined diffs** from `git diff --cc` and `git show` on a merge with two
  parents (`@@@ ... @@@`).
- **Context diffs** from `diff -c`, and **normal diffs** from plain `diff`.
- **Mail and logs around them**: `git format-patch` mails (headers, message,
  `---`, diffstat, `-- ` signature), `git log -p`, `diff -r`'s
  `Only in ...` lines.
- **Snippets**: `+`, `-` and space lines with no headers, as in a Markdown
  code block.

## How it works without a scanner

A hunk header says how many lines the hunk has; counting them needs state a
tree-sitter lexer does not have. So the grammar reads a diff the way a
syntax highlighter does, by how each line starts, and uses the parser to
settle the few cases where that is ambiguous.

- **Newlines are extras.** A line-start token can follow any newline. Every
  token after the first on a line is `token.immediate`, so it never matches
  at the start of the next line. Blank lines vanish, which is right for a
  patch whose empty context lines lost their space in a mailer or editor.
- **Lexical precedence beats match length.** In tree-sitter a token with
  higher precedence wins even if a lower one matches more text. Header
  markers (`--- `, `+++ `, `diff `, `@@ `, `index `, `rename from `) beat a
  whole line read as a hunk line, hunk lines beat text, and tokens inside a
  line beat all of them.
- **A hunk runs until a line that cannot be in it**: a header, or a line that
  does not start with a space, `+`, `-` or `\`.
- **`--- ` after a hunk is parsed both ways.** It is a deleted line starting
  `-- ` (a Lua or SQL comment) or the next file's `--- a/file`. The grammar
  declares that conflict, so the parser follows both, and the file header,
  which has a higher dynamic precedence, wins if a `+++ ` line and a hunk
  follow. Otherwise the header reading fails at the next line and the
  deleted line is left.
- **A hunk with no `@@` header** is allowed only at the start of the input,
  after a line of text, or right after the file names. If one could start
  after any hunk, the parser would have to choose between continuing a hunk
  and starting one at every line. In a hunk with no header, `---` is a
  separator and `--- x` a file name.

## Tree shape

- `source_file` holds `file_diff`s, hunks, `text` lines, `separator`s
  (`---` on its own, or a line of `=`), `diffstat`s, `signature`s and
  `binary_files` lines.
- `file_diff` starts with a `command` (`diff` with `option` and `argument`
  children), an `svn_index` (`Index: path`), or `old_file` and `new_file`.
  After a command come git's extended headers: `index` (`hash`es and a
  `mode`), `file_mode`, `similarity` (a `percentage`), `rename`, `copy`,
  `binary_files`, and `binary_patch` (`binary_hunk`s of `size` and
  `binary_data` lines). Then `old_file` and `new_file`, each a `path` and an
  optional `timestamp` after a tab, and the hunks.
- `hunk` is a `hunk_header` (`old` and `new` fields holding a `range` with
  `start` and `count` fields, then an optional `heading`) and its lines:
  `context`, `addition`, `deletion` and `no_newline`
  (`\ No newline at end of file`). A deleted line that starts `--- ` has a
  `deleted_text` child; other lines have no children.
- `combined_hunk` has a `combined_hunk_header` with a `range` per parent and
  the result, then the same line nodes.
- `context_hunk` has `old` and `new` fields: `old_lines` and `new_lines`,
  each a `range` (`start` and `end` fields) and lines, including `change` for
  `!` lines.
- `normal_hunk` is a `change_command` (`2,3c2,4`), then `deletion` (`<`) and
  `addition` (`>`) lines around `---`.
- `diffstat` has a `diffstat_file` per line (`path`, then a `number` and the
  `added` and `removed` bars, or `binary`) and a `diffstat_summary`.

## Leniency and limits

- **Header-like lines are always headers.** A deleted line that is exactly
  `-- ` (`-` and a space) is read as a mail signature, and one that starts
  `-- x` followed by an added line `++ y` and a hunk header is read as a
  file's headers. A text line that starts `diff `, `index `, `@@ ` or
  `Binary files ... differ` is a header.
- **Snippets are read like a highlighter reads them.** A commit message line
  that starts with `-` or a space, as in `git log -p` or a bulleted
  `format-patch` message, becomes a hunk line.
- **A hunk ends at the first line that cannot be in it**, so lines the counts
  say are past the hunk but that start with a space, `+` or `-` stay in it.
  `git diff` never writes such lines.
- Combined diffs with more than two parents (`@@@@`) are not supported.
- A `--- ` with no `+++ ` after it, a range with no numbers (`@@ -, +, @@`),
  and a header line wrapped by a mailer are errors.
- Paths and command arguments are not unquoted or split on spaces: a `path`
  runs to the tab or the end of the line, and a `command` argument to the
  next space.

## Queries

- `highlights.scm`: `@diff.plus`, `@diff.minus` and `@diff.delta` for added,
  removed and changed lines (and the `---`/`+++` markers and diffstat bars),
  `@keyword` for header keywords, `@string.special.path` for paths,
  `@number` for ranges, modes and counts, `@constant` for hashes, `@function`
  for hunk headings, and `@comment` for timestamps and the
  `\ No newline` marker. `web/arborist.css` colors the `diff` captures.
- `folds.scm`: files, hunks, binary patches and diffstats.

## Validation

`script/check-diffs.sh <dir-or-file>...` parses every `.diff`, `.patch` and
`.debdiff` file under the given paths and lists the ones with syntax errors.
`script/check-hunks.py <dir-or-file>...` reads every unified hunk the way
`patch` does, using the line counts in its header, and reports each line the
grammar classifies differently: a hunk line read as something else, or a
header read as a hunk line. Results from 2026-11-14:

| Input | Files | Errors | Hunk disagreements |
| --- | --- | --- | --- |
| Every patch in the nixpkgs, Rust, Go, CMake, CPython, Ruby, OpenJDK and Cython checkouts | 6,628 | 4: a `--- ` with no `+++`, `@@ -, +, @@`, a `$OUTPUT_LC$` placeholder in a range, and a mailer-wrapped header | 0 in the 5,618 with hunks |
| Generated: `git log -p --cc --binary` (Rust, Linux, Linux merges, nixpkgs with `--stat`), `git log -p -c` (TypeScript merges), `git format-patch` (150 Ruby and 60 Rust commits), `diff -c`, `-C1 -p`, `-u -p` and plain `diff` between Ruby releases | 218, 27 MB | 0 | 0 |

On the generated files the node counts match the input: one
`combined_hunk` per `@@@`, `context_hunk` per `***************`,
`normal_hunk` per change command, `binary_patch` per `GIT binary patch`, and
a `diffstat` and `signature` in each `format-patch` mail. A run of 20,000
`--- x` lines (each a fork) parses in about 0.15 seconds; 5 MB of `git log -p`
parses in 0.13 seconds.

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
script/check-diffs.sh ~/src/nixpkgs
```

```bash
script/check-hunks.py ~/src/nixpkgs
```

The corpus tests put `|||` after their `===` and `---` lines, since diffs
have dashed lines of their own. The highlight tests are in
`test/highlight-web/` and `script/check-highlights.ts` runs them, because
`tree-sitter test` reads assertions from comment nodes and a diff has none;
the script removes the assertion lines before parsing.

`tree-sitter test --update` writes corpus trees without field names. To record
them with fields, run `script/update-corpus-fields.py` instead, then review the
diff: it records what the parser does now, not what it should do.
