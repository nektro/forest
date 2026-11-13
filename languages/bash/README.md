# tree-sitter-bash

A [tree-sitter](https://tree-sitter.github.io) grammar for Bash 5.2 scripts, as
described by the [Bash Reference Manual](https://www.gnu.org/software/bash/manual/bash.html).
POSIX `sh` scripts parse too.

- **No external scanner.** Everything is in `grammar.js`, including the parts
  of the shell's syntax that other grammars hand to a scanner:
  - Words are pieces with nothing between them: `a"b"$c` is one word (a
    `concatenation`) and `a "b" $c` three. Every piece after the first is an
    immediate token.
  - Newlines end commands only where a command can end. Elsewhere they are
    whitespace, so `a &&` at the end of a line and `if a` on the line before
    `then` need nothing special.
  - At the start of a command, an identifier is a token of its own and the
    parser looks at what comes next: `=`, `+=` or `[` make it an assignment,
    anything else the command name. Command words never begin like an
    assignment, so `a=1`, `a+=1`, `a[0]=1`, `a =1`, `g++ x` and `./a=b` all
    come out right. Reserved words that start a command are names before `=`
    (`select=1`) and arguments of `local` and friends (`local if function`).
  - Heredoc bodies; see below.
- **Covers the language.** Simple and compound commands, functions in all
  three forms, pipelines (`|`, `|&`), lists, `!`, every redirect (with file
  descriptors), here-strings, process substitution, `[[ ]]` with `=~` regular
  expressions, `(( ))` and `$(( ))` arithmetic with C operator precedence,
  `$[ ]`, C-style `for`, `select`, `case` with `;;`, `;&` and `;;&`, arrays and
  subscripts, every form of `${...}` expansion, `$'...'` and `$"..."` strings,
  backticks, and extended globs.

## Heredocs

A heredoc body starts at the end of the line that holds `<<WORD`, and ends at
a line that is exactly `WORD` (after tabs, for `<<-`). Matching the end to the
start needs memory a tree-sitter lexer does not have without a scanner, so:

- The rest of the line after `<<WORD` (more arguments and redirects, `| cmd`,
  `&& cmd`, `|| cmd`, `; cmd`) is parsed inside the `heredoc_redirect`, before
  the body. That is how the parser knows that the next newline starts a body:
  `cat <<EOF > out | sort && echo done` works.
- The delimiters `EOF`, `EOT`, `END`, `EOM`, `EOL` and `eof`, bare or quoted,
  have tokens of their own, and their bodies end only at that delimiter. A
  body that contains `USAGE`, `EOF2` or `END` (in an `EOF` heredoc) is fine.
- Any other delimiter falls into one of two families, and the body ends at
  the first line shaped like a delimiter of the family:
  - lower-case words (`<<cmake`, `<<end_of_file`): the first line that is a
    single lower-case word;
  - everything else (`<<USAGE`, `<<'___EOF___'`, `<<EoHEADER`): the first line
    that is a single word with an upper-case letter and no lower-case ones, or
    with at least two upper-case letters.

  So a `<<USAGE` body with a `DESCRIPTION` heading ends early. Adding a word
  to `HEREDOC_WORDS` in `grammar.js` makes its bodies exact; each one costs
  about 170 parser states.
- In a quoted heredoc (`<<'EOF'`, `<<"EOF"`, `<<\EOF`) the body is text. In an
  unquoted one, `$var`, `${...}`, `$(...)`, `` `...` `` and `$((...))` are
  parsed.

## Validation

`script/check-sh-files.sh <dir>...` parses every `.sh` and `.bash` file under
the given directories and lists the ones with syntax errors. Results on
2026-11-12:

| Input | Files | Parse without errors |
| --- | --- | --- |
| nixpkgs (`48c0cc98bf0`) | 1,230 | 1,224 |
| Linux (`067c5c24cef`) | 1,257 | 1,252 |
| rust-lang/rust (`8eb778d0409`) | 138 | all |
| CMake (`83f4fba5b46`) | 207 | all |
| Go, Zig, Swift, BuildKit and SQLite checkouts | 111 | 110 |

The 12 with errors:

| Count | Why |
| --- | --- |
| 4 | nixpkgs templates with `@substitutions@` that are not valid shell until substituted |
| 2 | Not bash: a zsh script (`${(@)x}`) and a ysh one |
| 3 | `$((cmd) \| wc -l)` and `((((cmd …`: a subshell right after `$(` or `(` with no space (see Limits) |
| 1 | A shell archive whose heredoc lines end in `&&`, continued after the body |
| 1 | An extended glob that spans lines |
| 1 | `eval local a=($x)`: bash allows array assignments in `eval`'s arguments |

Every one of the 481 heredocs in these files ends at its own delimiter, except
in the shell archive above.

Parsing runs at about 10 MB/s.

## Limits

- **Heredocs** are matched as described above.
- **`$((` and `((` are always arithmetic.** Bash tries arithmetic first and
  falls back to a command substitution or subshell that starts with a
  subshell. Here, `$((cmd) | x)` is an error; write `$( (cmd) | x)`.
- **A heredoc's line must be complete before its body.** When the line ends
  in `&&`, `||`, `|` or inside a compound command (`cat <<EOF | while read l;
  do`), bash reads the body first and the rest of the command after it. Here
  that is an error. Likewise for `if cmd <<EOF; then`.
- **Reserved words that end a block** (`fi`, `done`, `esac`, `then`, ...) are
  not names before `=`: the parser would need two tokens of lookahead.
- **Extended globs** do not nest and do not span lines.
- **`[` is a command**, not a test expression: its arguments are words.
- `time` and `coproc` are commands, not keywords. `{fd}>file` is the word
  `{fd}` followed by a redirect.
- A line continuation inside a word (`foo\` then `bar` on the next line)
  splits it in two.
- Arithmetic is not checked as strictly as bash does at run time: an
  expansion may stand in for an operator (`(( a $op b ))`), and `0x$h` and
  `16#$n` are numbers followed by expansions.

## Tree shape

- `program` holds statements and comments. `_expression` (in `[[ ]]`),
  `_arithmetic_expression` and `_primary_expression` (the pieces of a word)
  are supertypes.
- Node names follow tree-sitter-bash where the constructs are the same:
  `command` with `name: (command_name)`, `argument` and `redirect` fields;
  `variable_assignment`, `declaration_command`, `unset_command`, `pipeline`,
  `list`, `redirected_statement` (a compound command with redirects),
  `file_redirect`, `heredoc_redirect`, `herestring_redirect`, `expansion`,
  `simple_expansion`, `command_substitution`, `concatenation` and so on.
- Redirects of a simple command are inside the `command`. Assignments and
  redirects with no command after them (`a=1 b=2`, `> file`) are statements
  of their own, without a wrapper node.
- A `heredoc_redirect` has `delimiter: (heredoc_start)`, then whatever else
  was on its line, then `body: (heredoc_body)` with `heredoc_content`,
  expansions and `heredoc_end`.
- `${...}` is an `expansion` with an optional `prefix` (`#` or `!`), a
  `variable_name`, `special_variable_name` or `subscript`, and an optional
  `operator` and the words after it.
- In `[[ ]]`, the operands of `==`, `!=`, `=`, `<`, `>` and `-eq`-style
  operators are words, so `[[ $a = -x ]]` compares with `-x`. The right side
  of `=~` is a `regex`, which may contain spaces inside parentheses
  (`^(a|b c)$`), as bash allows.

## Queries

- `highlights.scm`: keywords, builtins and called commands, function names,
  variables (with bash's own as `@variable.builtin`), options (`-x`,
  `--flag`), strings, heredocs, regexes, numbers, operators and punctuation.
  The last matching pattern wins, so general patterns come first.
- `injections.scm`: comments as `comment`; the single-quoted script after
  `bash -c`, `sh -c` and `eval` as `bash`.
- `locals.scm`, `tags.scm` and `folds.scm`.

## Development

```bash
tree-sitter generate --js-runtime bun
```

```bash
tree-sitter test
```

```bash
script/check-sh-files.sh ~/src/nixpkgs ~/src/linux
```

`tree-sitter test --update` writes corpus trees without field names. To record
them with fields, run `script/update-corpus-fields.py` instead, then review the
diff: it records what the parser does now, not what it should do.
