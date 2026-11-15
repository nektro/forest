// Checks the highlight assertions in test/highlight-web/*.just.
//
// `tree-sitter test` reads assertions from comment nodes, but a comment at
// column 0 ends a recipe body, so an assertion under a body line would change
// the tree it checks. This script removes the assertion lines, parses what is
// left, and checks each assertion against the line above it. It highlights
// the way web/forest.js does: the innermost capture at a position wins, and
// of captures of the same node, the last pattern in highlights.scm.
// Injections are not applied.
//
// An assertion is a line holding only `#`, then `<-` or `^`, then a capture:
//
//   x := "a"
//   # <- variable          the capture at the column of the `#`
//   #    ^ string          the capture at the column of the `^`
//
//   bun script/check-highlights.ts
import { $ } from "bun";
import { mkdtemp, readdir, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { Language, Parser, Query } from "web-tree-sitter";

const ASSERTION = /^(\s*)#(\s*)(<-|\^)\s+(\S+)\s*$/;

const here = join(import.meta.dir, "..");
const work = await mkdtemp(join(tmpdir(), "forest-just-"));
let failures = 0;
try {
  const wasm = join(work, "just.wasm");
  await $`tree-sitter build --wasm -o ${wasm} ${here}`.quiet();
  await Parser.init();
  const language = await Language.load(wasm);
  const parser = new Parser();
  parser.setLanguage(language);
  const query = new Query(language, await Bun.file(join(here, "queries/highlights.scm")).text());

  const dir = join(here, "test/highlight-web");
  for (const file of (await readdir(dir)).sort()) {
    // Split into code lines and the assertions on each.
    const code: string[] = [];
    const assertions: { row: number; column: number; expected: string; line: number }[] = [];
    (await Bun.file(join(dir, file)).text()).split("\n").forEach((line, i) => {
      const m = ASSERTION.exec(line);
      if (!m || code.length === 0) {
        code.push(line);
        return;
      }
      const column = m[3] === "<-" ? m[1].length : m[1].length + 1 + m[2].length;
      assertions.push({ row: code.length - 1, column, expected: m[4], line: i + 1 });
    });
    const source = code.join("\n");

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

    const lineStart: number[] = [];
    let offset = 0;
    for (const line of code) {
      lineStart.push(offset);
      offset += line.length + 1;
    }
    for (const { row, column, expected, line } of assertions) {
      const actual = captureAt(lineStart[row] + column);
      if (actual !== expected) {
        failures++;
        console.log(`${file}:${line}: line ${row + 1}, column ${column + 1}: expected ${expected}, got ${actual}`);
      }
    }
    console.log(`${file}: ${assertions.length} assertions`);
    tree.delete();
  }
} finally {
  await rm(work, { recursive: true, force: true });
}
if (failures) {
  console.log(`${failures} failed`);
  process.exit(1);
}
