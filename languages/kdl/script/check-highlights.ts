// Checks the highlight assertions in test/highlight-web/*.kdl, highlighting
// the way web/forest.js does: the innermost capture at a position wins, and of
// captures of the same node, the last pattern in highlights.scm.
//
// `tree-sitter test` picks between captures of one node differently, so the
// names and values inside a `/-` comment could not be checked the way
// forest.js shows them.
//
// An assertion is a line holding only a comment, after a line of code:
//
//   node "a"
//   // <- tag              the capture at the column of the `//`
//   //    ^ string         the capture at the column of the `^`
//
//   bun script/check-highlights.ts
//
// Set KDL_WASM to the path of a wasm file built with `tree-sitter build
// --wasm` to reuse it.
import { $ } from "bun";
import { mkdtemp, readdir, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { Language, Parser, Query } from "web-tree-sitter";

const here = join(import.meta.dir, "..");
const work = await mkdtemp(join(tmpdir(), "forest-kdl-"));
let failures = 0;
try {
  let wasm = process.env.KDL_WASM;
  if (!wasm) {
    wasm = join(work, "kdl.wasm");
    await $`tree-sitter build --wasm -o ${wasm} ${here}`.quiet();
  }
  await Parser.init();
  const language = await Language.load(wasm);
  const parser = new Parser();
  parser.setLanguage(language);
  const query = new Query(language, await Bun.file(join(here, "queries/highlights.scm")).text());

  const dir = join(here, "test/highlight-web");
  for (const file of (await readdir(dir)).sort()) {
    const source = await Bun.file(join(dir, file)).text();
    const tree = parser.parse(source)!;
    if (tree.rootNode.hasError) {
      console.log(`${file}: syntax error`);
      failures++;
    }
    // Capture per node range; the last pattern wins.
    const byRange = new Map<string, { start: number; end: number; name: string; pattern: number }>();
    for (const { name, node, patternIndex } of query.captures(tree.rootNode)) {
      if (node.startIndex === node.endIndex) continue;
      const key = `${node.startIndex}:${node.endIndex}`;
      const prev = byRange.get(key);
      if (!prev || patternIndex >= prev.pattern) {
        byRange.set(key, { start: node.startIndex, end: node.endIndex, name, pattern: patternIndex });
      }
    }
    const ranges = [...byRange.values()];
    const captureAt = (offset: number) => {
      let best: { start: number; end: number; name: string } | undefined;
      for (const r of ranges) {
        if (r.start <= offset && offset < r.end && (!best || r.end - r.start < best.end - best.start)) best = r;
      }
      return best?.name ?? "(none)";
    };

    const lines = source.split("\n");
    const lineStart: number[] = [];
    let offset = 0;
    for (const line of lines) {
      lineStart.push(offset);
      offset += line.length + 1;
    }
    let target = -1;
    let checked = 0;
    lines.forEach((line, row) => {
      const m = /^(\s*)\/\/(\s*)(<-|\^)\s+(\S+)\s*$/.exec(line);
      if (!m) {
        target = row;
        return;
      }
      if (target < 0) return;
      const column = m[3] === "<-" ? m[1].length : m[1].length + 2 + m[2].length;
      const expected = m[4];
      const actual = captureAt(lineStart[target] + column);
      checked++;
      if (actual !== expected) {
        failures++;
        console.log(`${file}:${target + 1}:${column + 1}: expected ${expected}, got ${actual}`);
      }
    });
    console.log(`${file}: ${checked} assertions`);
    tree.delete();
  }
} finally {
  await rm(work, { recursive: true, force: true });
}
if (failures) {
  console.log(`${failures} failed`);
  process.exit(1);
}
