# tree-sitter-json

A [tree-sitter](https://tree-sitter.github.io) grammar for JSON
([RFC 8259](https://www.rfc-editor.org/rfc/rfc8259)), with no external scanner.

## Leniency

So that JSONC files (`tsconfig.json`, editor settings) and JSON Lines parse
without errors, it also accepts:

- `//` and `/* */` comments, anywhere whitespace is allowed
- a trailing comma after the last member of an object or array
- any number of top-level values, including none

Tokens are otherwise strict: numbers with leading zeros, `+`, a bare `.`, hex,
`NaN` or `Infinity`, single-quoted strings, unquoted keys, raw newlines in
strings and unknown escapes are errors.

## Tree shape

- `document` holds the top-level values. `_value` is a supertype covering
  `object`, `array`, `string`, `number`, `true`, `false` and `null`.
- `pair` has `key` (a `string`) and `value` fields.
- A `string` contains `string_content` and `escape_sequence` children; the
  empty string has none.

## Queries

`queries/highlights.scm` captures object keys as `@property`, and
`queries/folds.scm` folds objects and arrays.

## Development

```bash
tree-sitter generate --js-runtime bun
```

```bash
tree-sitter test
```
