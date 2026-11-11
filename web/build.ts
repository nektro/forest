// Builds the browser bundle into dist/:
//
//   arborist.js            one classic <script>: web-tree-sitter, its runtime
//                          wasm (inlined), every grammar's queries, and the
//                          Arborist API
//   tree-sitter-<lang>.wasm one per grammar, fetched on first use
//   arborist.css           default highlight theme
//   index.html             demo page
//
// Usage: bun web/build.ts

import { $ } from "bun";
import { cp, mkdir, readdir, rm, stat } from "node:fs/promises";
import { join } from "node:path";

const root = join(import.meta.dir, "..");
const dist = join(root, "dist");
const QUERY_KINDS = ["highlights", "injections", "locals", "tags", "folds"] as const;

type GrammarInfo = {
  wasm: string;
  title: string;
  scope: string;
  fileTypes: string[];
  queries: Partial<Record<(typeof QUERY_KINDS)[number], string>>;
};

async function mtime(path: string): Promise<number> {
  try {
    return (await stat(path)).mtimeMs;
  } catch {
    return -1;
  }
}

async function readQuery(dir: string, file: string | string[] | undefined) {
  if (!file) return undefined;
  const files = Array.isArray(file) ? file : [file];
  const parts = await Promise.all(files.map((f) => Bun.file(join(dir, f)).text()));
  return parts.join("\n");
}

await rm(dist, { recursive: true, force: true });
await mkdir(dist, { recursive: true });

const languages: Record<string, GrammarInfo> = {};
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
    await $`tree-sitter build --wasm -o ${join(dist, wasm)} ${grammarDir}`.quiet();

    const queries: GrammarInfo["queries"] = {};
    for (const kind of QUERY_KINDS) {
      const text = await readQuery(grammarDir, grammar[kind]);
      if (text) queries[kind] = text;
    }
    languages[grammar.name] = {
      wasm,
      title: grammar.title ?? grammar.name,
      scope: grammar.scope,
      fileTypes: grammar["file-types"] ?? [],
      queries,
    };
  }
}

const runtimeWasm = join(root, "node_modules/web-tree-sitter/web-tree-sitter.wasm");
if (!(await Bun.file(runtimeWasm).exists())) {
  throw new Error("web-tree-sitter is not installed; run `bun install` first");
}

const virtualModules: Plugin = {
  name: "arborist-virtual",
  setup(build) {
    build.onResolve({ filter: /^arborist:/ }, (args) => ({ path: args.path, namespace: "arborist" }));
    build.onLoad({ filter: /.*/, namespace: "arborist" }, async (args) => {
      switch (args.path) {
        case "arborist:languages":
          return { contents: `export default ${JSON.stringify(languages)};`, loader: "js" };
        case "arborist:runtime-wasm": {
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
  entrypoints: [join(import.meta.dir, "arborist.js")],
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
    __ARBORIST_VERSION__: JSON.stringify(pkg.version),
  },
});
if (!result.success) {
  for (const log of result.logs) console.error(log);
  process.exit(1);
}
console.log(`bundle    arborist.js`);

await cp(join(import.meta.dir, "arborist.css"), join(dist, "arborist.css"));
await cp(join(import.meta.dir, "demo.html"), join(dist, "index.html"));

for (const file of (await readdir(dist)).sort()) {
  const size = (await stat(join(dist, file))).size;
  console.log(`  ${file.padEnd(28)} ${(size / 1024).toFixed(1).padStart(8)} KiB`);
}
