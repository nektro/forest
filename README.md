# arborist

A bundle of tree-sitter grammars.

| Language | Directory | External scanner |
| --- | --- | --- |
| Bash | [languages/bash](languages/bash) | none |
| C (C23, with GNU and MSVC extensions) | [languages/c](languages/c) | none |
| CMake | [languages/cmake](languages/cmake) | none |
| CSS | [languages/css](languages/css) | none |
| Dockerfile | [languages/dockerfile](languages/dockerfile) | none |
| Go | [languages/go](languages/go) | none |
| HTML | [languages/html](languages/html) | none |
| Java | [languages/java](languages/java) | none |
| JSON (and JSONC, JSON Lines) | [languages/json](languages/json) | none |
| Lua (5.1 to 5.5) | [languages/lua](languages/lua) | none |
| Nix | [languages/nix](languages/nix) | none |
| Python (3.14) | [languages/python](languages/python) | none |
| Ruby | [languages/ruby](languages/ruby) | none |
| Rust | [languages/rust](languages/rust) | none |
| SCSS | [languages/scss](languages/scss) | none |
| Swift | [languages/swift](languages/swift) | none |
| TypeScript (and TSX) | [languages/typescript](languages/typescript) | none |
| Verilog (IEEE 1364-2005) | [languages/verilog](languages/verilog) | none |
| XML (and DTD) | [languages/xml](languages/xml) | none |
| Zig | [languages/zig](languages/zig) | none |

## On the web

`bun run build` writes a self-contained web package to `dist/`:

| File | What it is |
| --- | --- |
| `arborist.js` | One classic script: the web-tree-sitter runtime (its wasm inlined), every grammar's queries, and the `Arborist` API |
| `tree-sitter-<lang>.wasm` | One per grammar, fetched the first time that language is used |
| `arborist.css` | Optional default highlight theme (light and dark) |

Host those files together and add one script tag. With `data-auto`, every
`<pre><code class="language-zig">` (or anything with `data-lang="zig"`) is
highlighted once the page loads:

```html
<link rel="stylesheet" href="arborist.css">
<script src="arborist.js" data-auto></script>

<pre><code class="language-zig">const std = @import("std");</code></pre>
```

Or drive it yourself:

```html
<script src="arborist.js"></script>
<script>
  Arborist.load("zig").then((zig) => {
    out.innerHTML = zig.highlightHTML(source);   // escaped HTML with <span class="hl-…">
    const tree = zig.parse(source);              // a web-tree-sitter Tree
    console.log(tree.rootNode.toString());
    tree.delete();
  });
</script>
```

### API

| | |
| --- | --- |
| `Arborist.languages` | Names of the bundled languages |
| `Arborist.load(name)` | Promise of a grammar (loads the runtime and the `.wasm` once) |
| `Arborist.highlight(name, source)` | Promise of highlighted HTML |
| `Arborist.highlightElement(el, name?)` | Highlights an element's text in place; the language defaults to `data-lang` or a `language-xxx` class on it or an ancestor |
| `Arborist.highlightAll(selector?)` | `highlightElement` on every match whose language is known |
| `Arborist.languageForFile(path)` | Language name for a file name or extension, or `null` |
| `Arborist.baseURL` | Where `.wasm` files are fetched from. Defaults to the directory of `arborist.js`; override with `data-base="…"` on the script tag or by setting it before the first `load` |
| `Arborist.Parser`, `.Language`, `.Query` | The web-tree-sitter classes |

A loaded grammar has `parse(source, oldTree?)`, `highlights(source, tree?)`
(nested `{ start, end, name }` ranges in UTF-16 offsets), `highlightHTML(source)`,
`query(kind)` for `"highlights"`, `"locals"`, `"tags"`, `"folds"` or
`"injections"`, `injections(tree)` (the injected regions, as `{ language, ranges }`),
`loadInjections(source)`, and `language`.

Highlight classes are `hl-` plus every prefix of the capture name, so `@function.builtin` becomes `class="hl-function hl-function-builtin"`.
Injections are applied: in HTML, `<style>` is highlighted as CSS and
`<script>` as TypeScript, and so on for every grammar's `injections.scm`.
`highlight`, `highlightElement` and `highlightAll` fetch the grammars an
injection needs. `highlights` and `highlightHTML` are synchronous, so they
only use grammars that are already loaded; call `grammar.loadInjections(source)`
(a promise) first to load the rest.

The page must be served over HTTP(S); browsers will not fetch the `.wasm` from `file://`.

### Building

Needs [bun](https://bun.sh) and the `tree-sitter` CLI. The first wasm build
downloads wasi-sdk into `~/.cache/tree-sitter`.

```bash
bun install
```

```bash
bun run build
```

```bash
bun run serve
```

`serve` hosts `dist/` on http://localhost:8000 with a demo page.

### Adding a language

The build has no per-language code. It picks up every `languages/*/tree-sitter.json` and, for each grammar in it:

- regenerates `src/parser.c` from `src/grammar.json` when needed and builds `tree-sitter-<name>.wasm`
- bundles its queries: the paths `tree-sitter.json` lists, or else `queries/<kind>.scm` if it exists
- takes `title`, `scope` and `file-types` for `Arborist.languageForFile`
- puts every file in `examples/` on the demo page

The web-tree-sitter version in `package.json` should match the `tree-sitter` CLI's version, which sets the grammar ABI.
