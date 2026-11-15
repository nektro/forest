// Builds the browser bundle into dist/:
//
//   forest.js            one classic <script>: web-tree-sitter, its runtime
//                          wasm (inlined), every grammar's queries, and the
//                          Forest API
//   tree-sitter-<lang>.wasm one per grammar, fetched on first use
//   forest.css           default highlight theme
//   index.html             demo page, with every grammar's examples/ in a picker
//
// Nothing here is specific to one language. Every languages/*/tree-sitter.json
// is picked up; per grammar, queries come from the paths it lists, falling
// back to queries/<kind>.scm, and files in examples/ feed the demo page.
//
// Usage: bun web/build.ts [--debug]
//
//   --debug  compile the grammar wasm with `tree-sitter build --debug`

import { $ } from "bun";
import { cp, mkdir, readdir, rm, stat } from "node:fs/promises";
import { join } from "node:path";

const root = join(import.meta.dir, "..");
const dist = join(root, "dist");
const debug = process.argv.slice(2).includes("--debug");
const QUERY_KINDS = ["highlights", "injections", "locals", "tags", "folds"] as const;

type GrammarInfo = {
  wasm: string;
  title: string;
  scope: string;
  fileTypes: string[];
  injectionRegex?: string;
  queries: Partial<Record<(typeof QUERY_KINDS)[number], string>>;
};

async function mtime(path: string): Promise<number> {
  try {
    return (await stat(path)).mtimeMs;
  } catch {
    return -1;
  }
}

async function readQuery(dir: string, kind: string, file: string | string[] | undefined) {
  // tree-sitter.json has no field for some kinds (folds), and listing the
  // conventional path is optional for the rest.
  file ??= `queries/${kind}.scm`;
  const files = Array.isArray(file) ? file : [file];
  if (!(await Promise.all(files.map((f) => Bun.file(join(dir, f)).exists()))).every(Boolean)) {
    return undefined;
  }
  const parts = await Promise.all(files.map((f) => Bun.file(join(dir, f)).text()));
  return parts.join("\n");
}

await rm(dist, { recursive: true, force: true });
await mkdir(dist, { recursive: true });

const languages: Record<string, GrammarInfo> = {};
// Demo-only sample sources: language -> [{ name, source }].
const examples: Record<string, { name: string; source: string }[]> = {};
const languagesDir = join(root, "languages");

for (const entry of (await readdir(languagesDir)).sort()) {
  const dir = join(languagesDir, entry);
  const configFile = Bun.file(join(dir, "tree-sitter.json"));
  if (!(await configFile.exists())) continue;
  const config = await configFile.json();

  for (const grammar of config.grammars) {
    const grammarDir = join(dir, grammar.path ?? ".");
    const src = join(grammarDir, "src");

    // parser.c is not checked in; regenerate it when grammar.json is newer.
    if ((await mtime(join(src, "parser.c"))) < (await mtime(join(src, "grammar.json")))) {
      console.log(`generate  ${grammar.name}`);
      await $`tree-sitter generate src/grammar.json`.cwd(grammarDir).quiet();
    }

    const wasm = `tree-sitter-${grammar.name}.wasm`;
    console.log(`wasm      ${wasm}`);
    await $`tree-sitter build --wasm ${debug ? ["--debug"] : []} -o ${join(dist, wasm)} ${grammarDir}`.quiet();

    const queries: GrammarInfo["queries"] = {};
    for (const kind of QUERY_KINDS) {
      const text = await readQuery(grammarDir, kind, grammar[kind]);
      if (text) queries[kind] = text;
    }
    languages[grammar.name] = {
      wasm,
      title: grammar.title ?? grammar.name,
      scope: grammar.scope,
      fileTypes: grammar["file-types"] ?? [],
      injectionRegex: grammar["injection-regex"],
      queries,
    };

    const examplesDir = join(grammarDir, "examples");
    const files = (await readdir(examplesDir).catch(() => [] as string[])).filter((f) => !f.startsWith(".")).sort();
    examples[grammar.name] = await Promise.all(
      files.map(async (name) => ({ name, source: await Bun.file(join(examplesDir, name)).text() })),
    );
  }
}

const runtimeWasm = join(root, "node_modules/web-tree-sitter/web-tree-sitter.wasm");
if (!(await Bun.file(runtimeWasm).exists())) {
  throw new Error("web-tree-sitter is not installed; run `bun install` first");
}

const virtualModules: Plugin = {
  name: "forest-virtual",
  setup(build) {
    build.onResolve({ filter: /^forest:/ }, (args) => ({ path: args.path, namespace: "forest" }));
    build.onLoad({ filter: /.*/, namespace: "forest" }, async (args) => {
      switch (args.path) {
        case "forest:languages":
          return { contents: `export default ${JSON.stringify(languages)};`, loader: "js" };
        case "forest:runtime-wasm": {
          const base64 = Buffer.from(await Bun.file(runtimeWasm).arrayBuffer()).toString("base64");
          return { contents: `export default ${JSON.stringify(base64)};`, loader: "js" };
        }
      }
      throw new Error(`unknown module ${args.path}`);
    });
  },
};
type Plugin = Parameters<typeof Bun.build>[0]["plugins"] extends (infer P)[] | undefined ? P : never;

const pkg = await Bun.file(join(root, "package.json")).json();
const result = await Bun.build({
  entrypoints: [join(import.meta.dir, "forest.js")],
  outdir: dist,
  target: "browser",
  format: "iife",
  minify: true,
  sourcemap: "linked",
  plugins: [virtualModules],
  // web-tree-sitter only touches these under Node.
  external: ["fs/promises", "module", "fs", "path", "url"],
  define: {
    // There is no import.meta in a classic script. web-tree-sitter only uses
    // it to find its wasm, which is inlined here instead.
    "import.meta.url": '""',
    __FOREST_VERSION__: JSON.stringify(pkg.version),
  },
});
if (!result.success) {
  for (const log of result.logs) console.error(log);
  process.exit(1);
}
console.log(`bundle    forest.js`);

await cp(join(import.meta.dir, "forest.css"), join(dist, "forest.css"));
// The demo page gets the examples inlined as JSON (with `<` escaped so the
// script element cannot be closed early).
const demo = await Bun.file(join(import.meta.dir, "demo.html")).text();
const PLACEHOLDER = "/*FOREST_EXAMPLES*/{}";
if (!demo.includes(PLACEHOLDER)) throw new Error(`demo.html is missing ${PLACEHOLDER}`);
await Bun.write(join(dist, "index.html"), demo.replace(PLACEHOLDER, () => JSON.stringify(examples).replace(/</g, "\\u003c")));

for (const file of (await readdir(dist)).sort()) {
  const size = (await stat(join(dist, file))).size;
  console.log(`  ${file.padEnd(28)} ${(size / 1024).toFixed(1).padStart(8)} KiB`);
}
