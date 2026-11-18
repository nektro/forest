# tree-sitter-make

A [tree-sitter](https://tree-sitter.github.io) grammar for GNU make's
makefiles, as the GNU make manual describes them and GNU make reads them,
with no external scanner. It covers rules (`:`, `::`, grouped `&:`, static
pattern rules, order-only prerequisites, inline `;` recipes), target-specific
variables, every assignment operator (`=`, `:=`, `::=`, `:::=`, `?=`, `+=`,
`!=`) with `override`, `export`, `private` and `unexport`, `define`/`endef`
and `undefine`, `ifeq`/`ifneq`/`ifdef`/`ifndef` with `else` chains, `include`,
`-include`, `sinclude`, `load`, `vpath`, variable and substitution references
in `$()` and `${}`, automatic variables, every built-in function, `$$`, line
continuations, `.SECONDEXPANSION` references (`$$(...)`) in prerequisites,
and recipe lines with their `@`, `-` and `+` prefixes.

## How it works without a scanner

make reads a makefile a logical line at a time. A line that starts with a
tab, after a rule, is a recipe line; anything else is a makefile line.
Comment lines, blank lines and conditionals do not end a rule's recipe.

- **A line break followed by a tab is a token of its own.** `_recipe_nl` is a
  line break, with any blank lines before it, followed by a tab; `_eol` is a
  bare line break. The lexer takes the longest match, so after a rule or a
  recipe line the token says whether the next line is a recipe line. Where
  no recipe can follow, `_recipe_nl` is not valid, and a tab is whitespace,
  as it is to make: `ifdef X` then `\tCFLAGS += -g` is an assignment.
- **The parser keeps both readings where a line is ambiguous.** After a rule,
  a comment line either belongs to the recipe or ends the rule, and a
  conditional either holds recipe lines or makefile lines. These are declared
  conflicts, so tree-sitter's GLR parser follows both until a line settles
  it: a recipe line is not valid at the top level, and an assignment is not
  valid in a recipe. When both readings parse to the end, dynamic precedence
  picks the one make would: a tab-led line after comment lines is a recipe
  line even when it would also parse as a rule (`\techo a: b`), a conditional
  after a rule joins its recipe, and trailing blank lines do not.
- **Each context has its own text token.** A recipe line's text runs to the
  end of the line and keeps `#`. A value's text stops at `#`, which starts a
  comment (`\#` does not). Argument text stops at `,` and the closing
  delimiter, except in the one-argument functions (`$(info a, b)`,
  `$(shell ...)`), where a comma is text. Inside a reference `#` is text, as
  in make.
- **Function names need the whitespace after them.** `$(dir)` is a
  variable and `$(dir $(x))` a call: the parser sees the name, then either
  the whitespace token that starts the arguments or the closing delimiter.
- **A text token never starts with `#`.** tree-sitter's lexer follows a
  longer comment once a text token has stopped at a space, so `$(info # a
  (b))` would lose to a comment. A `#` that is text is lexed on its own
  instead, where it outranks a comment.

## Tree shape

- `source_file` holds items: `rule`, `target_variable`,
  `variable_assignment`, `conditional`, `define_directive`,
  `undefine_directive`, `include_directive`, `load_directive`,
  `vpath_directive`, `export_directive`, `unexport_directive`, and
  `comment`s. A line of only references (`$(eval ...)`, `$(call ...)`) puts
  them in the parent directly.
- `rule` has `targets` (a `targets` node), `operator` (`:`, `::`, `&:`,
  `&::`), `target_pattern` for a static pattern rule, `prerequisites` and
  `order_only` (both `prerequisites` nodes), and `recipe`. The lists hold
  `word`s and references side by side: `$(ARCH)_x.o` is a reference and a
  word, with no node around the pair.
- `recipe` holds `recipe_line`s, with `comment`s and `conditional`s between
  them. A `recipe_line` has an optional `prefix` and the references in it;
  its text has no node, so a line less its children is what goes to the
  shell. A recipe may start with `;` on the rule's line.
- `target_variable` is `targets` and an `assignment`, a
  `variable_assignment`.
- `variable_assignment` has `modifier`s, a `name` (`word`s and references),
  an `operator` and a `value`, a `text` node holding the references in it.
- `define_directive` has `modifier`s, a `name`, an optional `operator` and a
  `body`, a `define_body` with the references in it.
- `conditional` has a `condition`, an `ifeq_directive` (`operator`, `left`,
  `right`, each a `text` or a `string`) or `ifdef_directive` (`operator`,
  `variable`), then the items or recipe lines of every branch, with an
  `else_directive` (and its own optional `condition`) where each `else`
  branch starts.
- `variable_reference` has `name` (`variable_name`s and nested references)
  and, for a substitution reference, `pattern` and `replacement`.
  `function_call` has `function` (a `function_name`) and `argument`s, each a
  `text`. `automatic_variable` is `$@`, `$<`, `$(@D)` and the rest, and
  `escape_sequence` is `$$`. `$x` is a `variable_reference` with no
  children.

## Leniency and limits

- **Semantics are not checked.** `else` after `else`, `override` without an
  assignment, and too many arguments to a function all parse. A name that
  is not a built-in function is a variable, as in make: `$(foo bar)` is a
  `variable_reference` with two `variable_name`s.
- **Commas split every argument of a many-argument function**, including the
  last: make keeps commas in the third argument of `$(if a,b,c,d)`.
- **A recipe that crosses a conditional's branches is partly supported.** A
  rule in a conditional's branches whose recipe follows the top-level
  `endif` parses, with the `recipe` as a sibling of the `conditional`. Recipe
  lines right after `else` for a rule in the branch before it are an error;
  so are recipe lines after a nested `endif`, where tab-led lines are more
  often indented directives.
- **`.RECIPEPREFIX` is not followed.** Recipe lines start with a tab.
- **A `define` does not nest.** An `endef` at the start of a line ends the
  outermost `define`.
- **Words cannot hold parentheses**, so archive members (`lib.a(x.o)`) and
  `ifeq(` without a space are errors. Words also cannot end with `+`, `?`,
  `!` or `&`, so that `x+=1` splits before `+=`.
- **Directive keywords are names where the line allows:** `include: x.h` is
  a rule and `all: include` a prerequisite. `ifeq`, `else`, `endif`,
  `define` and `endef` are always keywords at the start of a line.
- **A reference that is never closed** inside a `define` runs on to the end
  of the body, since arguments may span lines there.
- nmake (`!include`, `!IF`), BSD make (`.if`) and autoconf templates
  (`@VAR@` lines) are not GNU make and do not parse.

## Queries

- `highlights.scm`: directives (`@keyword`, `@keyword.import`,
  `@keyword.conditional`), targets (`@function`, special targets such as
  `.PHONY` as `@function.builtin`), prerequisites, patterns and paths
  (`@string.special.path`), assigned and referenced variables, make's own
  variables and automatic variables (`@variable.builtin`), built-in
  functions (`@function.builtin`) and the function `$(call ...)` calls
  (`@function.call`), `$$` (`@string.escape`), operators, and `$(`/`)` and
  recipe prefixes (`@punctuation.special`).
- `injections.scm`: each `recipe_line`, each `$(shell ...)` argument and
  each `!=` value as bash, with references left out of the injected text.
- `folds.scm`: rules, conditionals and defines.
- `tags.scm`: targets, variables and defines as definitions; variable
  references and `$(call ...)`ed names as references.

## Validation

`script/check-makefiles.sh <dir-or-file>...` parses every `Makefile`,
`makefile`, `GNUmakefile`, `Kbuild`, `*.mk`, `*.make` and `*.gmk` under the
given paths and lists the ones with syntax errors. Results from 2026-11-18:

| Input | Files | Errors |
| --- | --- | --- |
| torvalds/linux | 3,386 | 1: a `//` comment, which make reads as a rule with `(c)` as an archive member |
| openjdk/jdk | 293 | 1: a vendored makefile with space-indented recipe lines, which make rejects |
| postgres/postgres (regress and contrib) | 69 | 0 |
| ruby/ruby | 13 | 3: `common.mk`, which is also nmake's (`!include`); a bare `ERROR` line in a branch make skips; an unclosed `$(eval` in a `define` |
| sqlite/sqlite | 6 | 1: recipe lines right after `else` (see limits) |
| moby/buildkit, NixOS/nixpkgs, swiftlang/swift, cython/cython, python/cpython, golang/go, Kitware/CMake, kdl-org/kdl | 70 | 0 |

That is 3,837 files and 4.9 MB, parsed at about 20 MB/s. A cross-check of
the same trees against the source compares each tab-led line after a rule
with the `recipe_line`s; the lines that differ are the errors above and
tab-indented makefile lines outside any rule, which make reads as makefile
lines too.

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
script/check-makefiles.sh ~/src/linux
```

The highlight tests are in `test/highlight-web/` and
`script/check-highlights.ts` runs them, because a comment line in a
`define` body is text and one in a recipe joins the recipe; the script
removes the assertion lines before parsing.

`tree-sitter test --update` writes corpus trees without field names. To record
them with fields, run `script/update-corpus-fields.py` instead, then review the
diff: it records what the parser does now, not what it should do.
`test/corpus/crlf.txt` has CRLF line endings and is left alone by the script.
