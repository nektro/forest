# tree-sitter-verilog

A [tree-sitter](https://tree-sitter.github.io) grammar for Verilog as defined by
IEEE 1364-2005, with no external scanner.

- **Follows the standard's syntax.** Rules follow Annex A of 1364-2005, and
  comments in `grammar.js` give the section each one comes from. Modules,
  UDPs (including their tables), configurations, generate constructs,
  specify blocks, attributes, tasks and functions are all covered.
- **Verilog, not SystemVerilog.** `logic`, `always_ff`, packed arrays,
  `'0`, `.name` port shorthand, `|=` and the like are errors.
- **Compiler directives are extras.** `` `ifdef ``, `` `define `` and the
  rest may appear anywhere, including inside a port list or an expression.

## Validation

`script/check-ivtest.sh <ivtest checkout>` parses the tests from
`regress-vlg.list` in [ivtest](https://github.com/steveicarus/ivtest),
Icarus Verilog's regression suite, leaving out tests that must fail to compile
and tests run as SystemVerilog. Against `a19e629`:

| Input | Result |
| --- | --- |
| 1,504 test files | 1,486 parse without errors |

The 18 that do not:

- 7 are split by `` `ifdef `` so that neither branch is a complete construct
  on its own (see below).
- 9 use SystemVerilog or Icarus extensions that `regress-vlg.list` does not
  flag: packed arrays, `.name` port connections, `|=`, `wire real`.
- 2 use `` `protect `` and `` `include `MACRO(args) ``, which are not
  handled.

It also parses all of [picorv32](https://github.com/YosysHQ/picorv32) and
[serv](https://github.com/olofk/serv) except for the same kinds of input:
unbalanced `` `ifdef `` branches, `'0`, and the non-standard `` `error ``.

## Preprocessing

There is no preprocessor: macro uses stay as `macro_usage` nodes, and both
branches of an `` `ifdef `` are parsed as if the directives were not there.
Code that is only valid after preprocessing does not parse cleanly:

- an `` `ifdef `` whose branches each hold half of a construct, such as two
  alternative `if (...) begin` lines sharing one `end`
- a macro standing for something other than an expression, statement or
  module item, such as part of a declaration (`` wire `RANGE x; ``)

`` `define `` bodies are kept as `macro_text`, which runs to the end of the
line, including lines joined with a backslash. Macro arguments are parsed as
expressions or statements, so `` `debug($display("x");) `` works.

## Leniency

Some things the standard rejects are accepted because tools accept them and
real code uses them:

- module items (`function`, `wire`, ...) at the top level, for files that
  are only ever `` `include ``d into a module
- a trailing comma after the last named port connection
- empty ordered parameter values (`#( , 4)`)
- `for (genvar i = 0; ...)` in a generate loop
- declarations mixed with statements in blocks, and several statements in a
  function or task body without `begin`/`end`
- a stray `;` as a module item

## Tree shape

- `_expression`, `_module_item` and `_statement` are supertypes.
- Names and selects are `identifier`, `escaped_identifier`,
  `hierarchical_identifier` (`scope`, `name`), `bit_select` (`value`,
  `index`) and `part_select` (`value` with `msb`/`lsb` or `base`,
  `operator`, `width`).
- In an ANSI port list, `(input a, b, output c)` gives a `port_declaration`
  for `a`, a bare `identifier` for `b`, and a `port_declaration` for `c`: the
  names after the first in a declaration are not grouped with it. Parameter
  port lists work the same way, with bare `parameter_assignment`s.
- Declarations list their names in `declarator` fields. A plain name is an
  identifier; a name with array dimensions or an initial value is a
  `declarator` node with `name`, `dimension` and `value`.
- Module and UDP instances are both `module_instantiation`; they look the
  same without knowing what the name refers to.
- `table_entry` has `inputs` and either `output` (combinational) or
  `current_state` and `next_state` (sequential).
- In specify blocks, the polarity is part of the path operator token (`+=>`,
  `-*>`), and an unparenthesized path delay is a list of simple values.
  Anything more complex needs parentheses: `= (t + 1)`.
- `` `default_nettype ``, `` `resetall ``, `` `celldefine ``, `` `line ``,
  `` `pragma `` and the other rarely used directives are one `directive`
  token, arguments included. Each token that can start an extra costs table
  space in every parse state, so only `` `define ``, `` `undef ``, the
  conditionals, `` `include `` and `` `timescale `` get their own structure.

## Queries

`queries/` contains `highlights.scm`, `folds.scm` and `tags.scm`. In
`highlights.scm` the last matching pattern wins, so general patterns come
first.

## Development

```bash
tree-sitter generate --js-runtime bun
```

```bash
tree-sitter test
```

```bash
script/check-ivtest.sh ~/src/ivtest
```

`tree-sitter test --update` writes corpus trees without field names. To record
them with fields, run `script/update-corpus-fields.py` instead, then review the
diff: it records what the parser does now, not what it should do.
