# tree-sitter-ruby

A [tree-sitter](https://tree-sitter.github.io) grammar for Ruby 3.4, as
described by the [Ruby syntax documentation](https://docs.ruby-lang.org/en/master/syntax_rdoc.html).

- **No external scanner.** Everything is in `grammar.js`, including the parts
  of Ruby's syntax that other grammars hand to a scanner:
  - Newlines end statements only where a statement can end. Elsewhere they
    are whitespace, so `a +` at the end of a line, `foo(a,` and `[` need
    nothing special. A newline token includes the next line's indentation.
    A line that starts with `.` or `&.` continues the expression before it
    (blank lines may come between, comment lines may not).
  - Method calls without parentheses. After a method name, spacing decides
    what an operator means, as in Ruby: `foo -1`, `foo *args`, `foo &blk`,
    `foo ::A` and `foo /re/` pass an argument, while `foo - 1` and `foo-1` are
    binary. `foo [1]` passes an array and `foo[1]` indexes; `foo (1)` passes a
    parenthesized expression and `foo(1)` is an argument list. Operators come
    in three tokens for this: right after the left side, with space on both
    sides, and with space before only.
  - `foo { ... }` after a method name is a block, never a hash. A `do` block
    goes to the outermost command (`foo bar do ... end` gives it to `foo`), a
    `{ }` block to the nearest call, and `while x do` keeps its `do`.
  - `if`, `unless`, `while` and `until` after a method name are modifiers
    (`foo if x`), so an argument without parentheses cannot be an `if`
    expression; in parentheses it can.
  - A keyword followed by `:` is a hash key: `foo if: x`, `{class: "a"}`.
  - String, symbol, regex and backtick contents with escapes and `#{...}`,
    `#@ivar`, `#@@cvar` and `#$gvar` interpolations.
  - Percent literals `%w %W %i %I %q %Q %s %r %x` and `%( )` with the
    delimiters `( [ { < | ! " ' / - ^ :` (plain `%` with the first six).
    Brackets nest.
  - Heredocs; see below.
- **Covers the language.** Classes, modules, `class << self`, methods with
  every kind of parameter (`(a, b = 1, *c, d:, e: 2, **f, &g)`, `(...)`,
  `(*, **, &)`), singleton and endless methods, operator methods, blocks with
  block-local variables and numbered or `it` parameters, lambdas, multiple
  assignment with splats and nesting, operator assignment, `begin`/`rescue`/
  `else`/`ensure` (also in method and block bodies), `case`/`when`, pattern
  matching with `case`/`in`, `=>` and `in` (array, find, hash and constant
  patterns, alternatives, pins, guards), all the modifiers, `BEGIN`/`END`,
  `alias`, `undef`, `defined?`, safe navigation, ranges with no beginning or
  end, `=begin`/`=end` comments and `__END__`.

## Heredocs

A heredoc's body starts on the line after `<<~EOS`, after the rest of that
line, which may hold more code (`foo(<<~EOS, 1).strip`), and ends at a line
that is `EOS`. A lexer without a scanner cannot remember that a body is due,
or which delimiter ends it, so:

- **The parser remembers that a body is due.** Each rule that can hold a
  `heredoc_beginning` with the rest of the line still to come has a variant
  that does (generated in `grammar.js`, named with `_h`). Where a line can
  end in that variant, the next token must be a `heredoc_body`: after a
  statement, after a `,` in a list (`[<<~A,` then the body, then more
  elements), before a closing bracket, after `do |x|` (`foo(<<~EOS) do |x|`),
  and after the condition of `if`, `unless`, `elsif`, `while` and `until`.
  The body token is valid nowhere else.
- **The body is one token**, from the newline that ends the line to the
  newline after the delimiter line. It ends at the delimiter of one of two
  families, and the longest match wins:
  - The words in `HEREDOC_WORDS`, which are the delimiters ruby/ruby uses
    (`EOS`, `RUBY`, `SQL`, `end;`, single letters such as `G`, ...). The body
    ends at the last such line before a line holding anything like the
    start of another heredoc (`<<ID`, `<<~'ID'`). That line stops the body,
    which keeps each body to its own lines and the lexer's work linear.
    Lines between that happen to be other delimiters (a `USAGE` heading in an
    `EOS` body) are fine.
  - Any other delimiter: the first line that is a single word.

  So a `<<~FIXTURE` body with a line `foo` ends early. Adding a word to
  `HEREDOC_WORDS` makes its bodies exact; words cost lexer states, not parser
  states.
- Two heredocs on one line (`foo(<<~A, <<~END)`) are one body token when
  the second delimiter is one of the words. The `"#{<<~"begin;"}\n#{<<~'end;'}"`
  idiom of Ruby's own tests works this way.
- The body is text: interpolations in it are not parsed, for either kind of
  heredoc.

## Validation

`script/check-rb-files.sh <dir>...` parses every Ruby file under the given
directories and lists the ones with syntax errors. On ruby/ruby
(`ccaceb137d`), on 2026-11-13:

| Files | Parse without errors |
| --- | --- |
| 7,554 | 7,452 (98.6%) |

The 102 with errors:

| Count | Why |
| --- | --- |
| 47 | Heredocs that end elsewhere (see below), or whose line continues after the body |
| 11 | TRICK contest entries in `sample/trick*`, obfuscated on purpose |
| 6 | `if ... end.foo` and `if ... end + x`: an `if`, `unless`, `while` or `until` used as a receiver or left operand (see Limits) |
| 4 | Percent literals with delimiters outside the list above (`%@...@`, `%%...%`, `%r+...+`) |
| 4 | Two encoding fixtures in UTF-16 and two files that are invalid on purpose |
| 30 | Rare forms, each in a file or two: a `do` block on a command chained with `.foo`, `-> x: { }`, `foo (:a) { }`, `nil [ ]`, `x!=y` without spaces, `{:a==>1}`, `x ?a :b`, a heredoc inside a block parameter's default, ... |

`script/check-heredocs.py <file>...` compares the end of every heredoc body
with its delimiter. Of the 6,993 bodies in ruby/ruby, 6,804 (97.3%) end at
their own delimiter. Most of the rest are bodies that contain the start of
another heredoc (Ruby code in a heredoc that has heredocs of its own), bodies
with a delimiter outside `HEREDOC_WORDS` and a single-word line before it,
lines with two such heredocs, and 25 heredocs with delimiters like `},` and
`...end racc/parser.rb/module_eval...`.

Parsing runs at about 10 MB/s.

## Limits

- **Heredocs** are matched as described above. A body that contains a line
  like `x = <<~EOS` (a heredoc inside a heredoc) ends early. A line that
  continues after its heredoc's body (it ends in `or`, `&&` or a `(` that
  closes later) is an error.
- **`if`, `unless`, `while` and `until` are not primaries.** They are
  statements, right sides of assignments, arguments in parentheses and
  right operands of binary operators, but not receivers (`if a then b end.c`)
  or left operands. A primary that starts with one of these keywords could
  start an argument after a method name, and the parser could not tell
  `foo if x` from `foo(if x ... end)` without unbounded lookahead.
- **Local variables are not tracked.** Ruby reads `x -1` as `x - 1` when `x`
  is a local variable, and as `x(-1)` otherwise; here it is always the call.
  Likewise `x [1]`, `x /2/` and `x *y`. With the usual spacing (`x - 1`,
  `x[1]`) there is no difference.
- **`?` and `:` need spaces** in a conditional: `a ?b :c` reads `?b` as a
  character and `:c` as a symbol.
- `a!=b` without spaces is `a!` followed by `=b`.
- Comment lines between a call and a following `.method` line end the
  statement.
- A `-` directly before a number is part of it: `-2.abs` is a call on the
  integer `-2`, as in Ruby, but so is `-2 ** 2` a power of `-2`, where Ruby
  negates `2 ** 2`.

## Tree shape

- Node names follow the tree-sitter-ruby grammar where the constructs are the
  same: `program`, `call` with `receiver`, `method`, `arguments` and `block`
  fields, `argument_list`, `block` and `do_block` with `block_parameters`,
  `method`, `singleton_method`, `class`, `module`, `singleton_class`,
  `body_statement`, `assignment`, `operator_assignment`, `binary`, `unary`,
  `conditional`, `range`, `pair` with a `hash_key_symbol` key, `string` with
  `string_content`, `escape_sequence` and `interpolation`, `simple_symbol`,
  `delimited_symbol`, `string_array` and `symbol_array` of `bare_string` and
  `bare_symbol`, `regex`, `subshell`, `heredoc_beginning`, `heredoc_body`,
  `if`, `unless`, `while`, `until`, `for`, `case`/`when`, `case_match`/
  `in_clause`, `begin`/`rescue`/`else`/`ensure`, the `*_modifier` nodes,
  `lambda`, `scope_resolution`, `element_reference` and the pattern nodes.
- A method call without parentheses is a `call` like any other.
- A `heredoc_body` is a sibling of the statement whose line started it, or a
  child of the list, `do_block` or `if` it continues; it is not linked to
  its `heredoc_beginning`. Two bodies from one line are one node.
- A setter method name (`def name=`) is a `setter`; operator method names
  are `operator`.
- `_statement`, `_expression`, `_arg`, `_primary` and `_pattern` are
  supertypes.

## Queries

- `highlights.scm`: keywords, methods (defined, called, and the usual
  receiver-less ones like `require` and `attr_reader` as builtins),
  parameters, instance, class and global variables, constants (`Foo` as a
  type, `FOO` as a constant), hash keys, strings, symbols, regexes,
  heredocs, numbers, operators and punctuation. The last matching pattern
  wins, so general patterns come first.
- `injections.scm`: comments as `comment`.
- `locals.scm`, `tags.scm` and `folds.scm`.

## Size

The heredoc variants roughly double the parse table: about 15,000 states.
The wasm build is about 16 MB, 700 KB gzipped, and `tree-sitter generate`
takes a minute or two. Chrome will not instantiate a module over 8 MB
synchronously on the main thread, so `forest.js` fetches each grammar's
bytes and hands them to web-tree-sitter, which then instantiates them
asynchronously.

## Development

```bash
tree-sitter generate --js-runtime bun
```

```bash
tree-sitter test
```

```bash
script/check-rb-files.sh ~/src/ruby
```

```bash
script/check-heredocs.py $(find ~/src/ruby -name '*.rb')
```

`tree-sitter test --update` writes corpus trees without field names. To record
them with fields, run `script/update-corpus-fields.py` instead, then review the
diff: it records what the parser does now, not what it should do.
