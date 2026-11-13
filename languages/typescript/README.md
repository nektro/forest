# tree-sitter-typescript

A [tree-sitter](https://tree-sitter.github.io) grammar for
[TypeScript](https://www.typescriptlang.org) 5.x, including the JavaScript it
contains and JSX. One grammar covers `.ts`, `.mts`, `.cts` and `.tsx` files.

## No external scanner

Other TypeScript and JavaScript grammars handle several things in a scanner.
This one does them in `grammar.js`:

- **Automatic semicolon insertion.** The `;` that ends a statement, class
  member or type member is optional. Where the next token could either
  continue the expression or start a new statement, precedence makes the
  parser continue the expression. That is JavaScript's own rule: a semicolon
  is inserted only before a token that cannot continue the statement. So
  `a⏎(b)` is a call, `a⏎[0]` a subscript, `a⏎.b()` a member access and
  `a⏎/b/g` a division, as in JavaScript, while `a⏎b` is two statements.
- **Regular expressions.** `/` is one token for division and the start of a
  regex, so the parser, not the lexer, decides which it is. Only after a
  regex's opening `/` is the pattern lexed.
- **Template strings.** The text is a run of immediate tokens that outrank
  comments, so `` `// ${x}` `` and `` `/* ${x}` `` are templates with a
  substitution. A `/` and a `$` right before `${` are tokens of their own.
- **JSX text** outranks comments in the same way: `<p>// x</p>` is text.
- **Generics.** `f<T>(x)` and `a < b > (c)` are both tried; type arguments
  win when both parse, and `f(a < b, c > d)` is two comparisons.
- **Type assertions and JSX.** `<T>x` and `<T>…</T>` are both tried; a JSX
  element needs its closing tag. In a `.tsx` file TypeScript reads `<T>x` as
  JSX, so the result can differ from `tsc` there (see Known limitations).
- **Line breaks inside types.** TypeScript does not continue a type across a
  line break before `[` or `<`. In an object type or class body without
  separators, `a: T⏎[k: string]: U` and `f(): T⏎<U>(x: U): U` keep both
  readings until the indexed access or generic one fails.

## Validation

`script/check-typescript-repo.sh <TypeScript checkout>` parses the TypeScript
sources in a [microsoft/TypeScript](https://github.com/microsoft/TypeScript)
checkout and lists the files with errors. Results against `main` from
2026-11-12 (`056d69edb8`):

| Input | Result |
| --- | --- |
| 116 lib `.d.ts` files | all parse without errors |
| 185 files in `packages/` | all parse without errors |
| 129 `.tsx` compiler and conformance tests that compile | all parse without errors |
| 5,173 `.ts` compiler and conformance tests that compile | 5,150 parse; the other 23 are below |

The tests are those with no `.errors.txt` baseline and no `@filename` for a
JavaScript or JSON file. Of the 23 that fail:

- 10 test parser corner cases: `var;` (twice), `import * from Zero from
  "./0"`, a NUL byte in a string, a `#!` line after other code,
  `{ @x! class C {} }`, `declare class C extends await {}`, an interface
  member `new;`, `for await (async of x)` and `<const T extends/>`.
- 3 use `from` as a default import name (`import type from from "./a"`).
- 4 use a predefined type's name as a name in a type: `(string) => string`,
  `(number) => number`, `({ a: string }: O) => any` and `var x: string.X`.
- 6 are listed under Known limitations.

All 1,569 `.ts` files in a local bun package cache (RxJS, tailwindcss and
others) parse without errors.

Parsing runs at about 10 MB/s on ordinary code and 30 MB/s on `.d.ts` files.

## Leniency

- Separators between members of an object type or interface are optional
  (`{ a: string b: number }`), and so are the `;` after class members.
- Modifiers (`public`, `static`, `readonly`, `abstract`, ...) are accepted in
  any order and on any member.
- `<T>x` type assertions are accepted in `.tsx` files.
- A `return`, `break`, `continue` or postfix `++` followed by a line break
  does not end the statement: `return⏎x` returns `x`. JavaScript would insert
  a semicolon there.

## Known limitations

- A statement that is an arrow function with a block body, followed by a line
  that starts with `(`, is read as a call: `() => {}⏎(x)`.
- `abstract`, `readonly` and similar words are names only where they cannot be
  modifiers: `interface abstract { abstract(): void }` and
  `(readonly as number)` are errors.
- An object type member named `extends` on the line after a type is read as
  the start of a conditional type.
- `infer U extends X ? A : B` inside parentheses: the constraint is always
  taken, so the conditional fails.
- `a<b>?.()`: an instantiation expression followed by an optional call.

## Tree shape

- Node names follow tree-sitter-typescript where the constructs are the same:
  `lexical_declaration`, `variable_declarator`, `call_expression`,
  `member_expression`, `arrow_function`, `type_annotation`,
  `type_identifier`, `predefined_type`, `generic_type`, `interface_body`,
  `jsx_element` and so on.
- `expression`, `primary_expression`, `statement`, `declaration`, `pattern`,
  `type` and `primary_type` are supertypes.
- Contextual keywords (`type`, `get`, `async`, `module`, `declare`, ...) are
  `identifier`, `property_identifier` or `shorthand_property_identifier`
  nodes where they are names: `x.type`, `{ get: 1 }`, `module.exports`.
- `extends Base<T>` in a class heritage is an `instantiation_expression`.
- `import("./a").B` in a type is a `nested_type_identifier` whose module is
  an `import_type`.
- Assignments to destructuring patterns (`[a, b] = [b, a]`) may come out as
  `array`/`object` or `array_pattern`/`object_pattern` on the left.

## Queries

`queries/` contains `highlights.scm`, `locals.scm`, `tags.scm`, `folds.scm`
and `injections.scm`. In `highlights.scm` the last matching pattern wins.
Keyword patterns come before the patterns for names: a contextual keyword
used as a name is a name node with the keyword token at the same position, and
the name pattern wins. `injections.scm` injects `regex` into regex literals
and `html`, `css`, `sql` and `graphql` into tagged templates.

## Development

```bash
tree-sitter generate --js-runtime bun
```

```bash
tree-sitter test
```

```bash
script/check-typescript-repo.sh ~/src/TypeScript
```

`tree-sitter test --update` writes corpus trees without field names. To record
them with fields, run `script/update-corpus-fields.py` instead, then review the
diff: it records what the parser does now, not what it should do.
