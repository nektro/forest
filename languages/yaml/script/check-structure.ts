// Compares the collections in each file's tree with what Bun.YAML.parse reads
// from it: the nesting of mappings and sequences, the number of entries, and
// the text of plain and quoted keys. Scalar values are not compared, an alias
// matches anything, and a mapping with a `<<` merge key only needs its own
// keys to be among the parsed ones.
//
//   bun script/check-structure.ts <file>...
//   bun script/check-structure.ts --paths <file listing one path per line>
import { $ } from "bun";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { Language, Parser, type Node } from "web-tree-sitter";

type Shape = "scalar" | "any" | Shape[] | { keys: (string | null)[]; values: Shape[]; merge: boolean };

const here = join(import.meta.dir, "..");
const work = await mkdtemp(join(tmpdir(), "forest-yaml-"));
const wasm = join(work, "yaml.wasm");
await $`tree-sitter build --wasm -o ${wasm} ${here}`.quiet();
await Parser.init();
const parser = new Parser();
parser.setLanguage(await Language.load(wasm));
await rm(work, { recursive: true });

// Named children other than comments.
const kids = (node: Node) => node.namedChildren.filter((c): c is Node => !!c && c.type !== "comment");

function keyText(node: Node | null): string | null {
  if (!node) return "";
  const inner = kids(node).find((c) => c && !["tag", "anchor"].includes(c.type));
  if (!inner) return "";
  if (inner.type === "plain_scalar") return inner.text;
  if (inner.type === "double_quote_scalar") return JSON.parse(inner.text.replace(/\n\s*/g, " "));
  if (inner.type === "single_quote_scalar") return inner.text.slice(1, -1).replace(/''/g, "'");
  return null; // a collection or alias as a key: not compared
}

function shape(node: Node | null): Shape {
  if (!node) return "scalar";
  switch (node.type) {
    case "block_node":
    case "flow_node": {
      const inner = kids(node).filter((c) => c && !["tag", "anchor"].includes(c.type));
      return inner.length ? shape(inner[inner.length - 1]) : "scalar";
    }
    case "alias":
      return "any";
    case "block_sequence":
    case "flow_sequence":
      return kids(node).map((c) => {
        if (c!.type === "flow_pair") return { keys: [keyText(c!.childForFieldName("key"))], values: [shape(c!.childForFieldName("value"))], merge: false };
        if (c!.type === "block_sequence_item") return shape(kids(c!)[0] ?? null);
        return shape(c);
      });
    case "block_mapping":
    case "flow_mapping": {
      const keys: (string | null)[] = [];
      const values: Shape[] = [];
      for (const c of kids(node)) {
        if (c!.type === "block_mapping_pair" || c!.type === "flow_pair") {
          keys.push(keyText(c!.childForFieldName("key")));
          values.push(shape(c!.childForFieldName("value")));
        } else {
          keys.push(keyText(c)); // a flow mapping entry with no value
          values.push("scalar");
        }
      }
      return { keys, values, merge: keys.includes("<<") };
    }
    default:
      return "scalar";
  }
}

function fromValue(v: unknown): Shape {
  if (Array.isArray(v)) return v.map(fromValue);
  if (v && typeof v === "object" && !(v instanceof Date)) {
    const e = Object.entries(v);
    return { keys: e.map(([k]) => k), values: e.map(([, x]) => fromValue(x)), merge: false };
  }
  return "scalar";
}

function compare(a: Shape, b: Shape, path: string): string | null {
  if (a === "any") return null;
  if (typeof a === "string" || typeof b === "string") return a === b ? null : `${path}: ${describe(a)} vs ${describe(b)}`;
  if (Array.isArray(a) !== Array.isArray(b)) return `${path}: ${describe(a)} vs ${describe(b)}`;
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return `${path}: ${a.length} entries vs ${b.length}`;
    for (let i = 0; i < a.length; i++) {
      const d = compare(a[i], b[i], `${path}[${i}]`);
      if (d) return d;
    }
    return null;
  }
  const m = a as Exclude<Shape, string | Shape[]>;
  const n = b as Exclude<Shape, string | Shape[]>;
  if (m.merge || m.keys.includes(null)) return null;
  // Later duplicates replace earlier keys in the parsed value.
  const last = new Map<string, number>();
  m.keys.forEach((k, i) => last.set(k!, i));
  if (last.size !== n.keys.length) return `${path}: keys ${JSON.stringify(m.keys)} vs ${JSON.stringify(n.keys)}`;
  for (let i = 0; i < n.keys.length; i++) {
    const j = last.get(n.keys[i] as string);
    if (j === undefined) return `${path}: keys ${JSON.stringify(m.keys)} vs ${JSON.stringify(n.keys)}`;
    const d = compare(m.values[j], n.values[i], `${path}.${n.keys[i]}`);
    if (d) return d;
  }
  return null;
}

const describe = (s: Shape) => (typeof s === "string" ? s : Array.isArray(s) ? "sequence" : "mapping");

let checked = 0, skipped = 0;
const bad: string[] = [];
const args = process.argv.slice(2);
const files = args[0] === "--paths"
  ? (await Bun.file(args[1]).text()).split("\n").filter(Boolean)
  : args;
for (const file of files) {
  const text = await Bun.file(file).text();
  let value: unknown;
  try { value = Bun.YAML.parse(text); } catch { skipped++; continue; }
  const tree = parser.parse(text)!;
  if (tree.rootNode.hasError) {
    // Only this parser fails.
    bad.push(`${file}: syntax error`);
    tree.delete();
    continue;
  }
  const docs = kids(tree.rootNode).filter((c) => c!.type === "document");
  const roots = docs.map((d) => {
    const nodes = kids(d!).filter((c) => c!.type === "block_node" || c!.type === "flow_node");
    return nodes.length === 1 ? shape(nodes[0]) : nodes.length === 0 ? "scalar" : ("many" as unknown as Shape);
  });
  tree.delete();
  const ours: Shape = roots.length === 1 ? roots[0] : roots.length === 0 ? "scalar" : roots;
  // A document holding more than one node: the top level read past its end.
  const d = JSON.stringify(roots).includes('"many"') ? "several nodes at the top level" : compare(ours, fromValue(value), "$");
  checked++;
  if (d) bad.push(`${file}: ${d}`);
}
console.log(`${checked} compared, ${skipped} skipped (Bun.YAML cannot parse them), ${bad.length} differ or fail`);
for (const b of bad) console.log("  " + b);
process.exit(bad.length ? 1 : 0);
