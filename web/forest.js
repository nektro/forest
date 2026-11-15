// Browser entry point, bundled by web/build.ts into dist/forest.js and
// exposed as the global `Forest`.

import { Language, Parser, Query } from "web-tree-sitter";
import LANGUAGES from "forest:languages";
import RUNTIME_WASM from "forest:runtime-wasm";

// Grammar .wasm files are fetched relative to this script, unless the script
// tag has data-base="..." or Forest.baseURL is set before the first load.
const script = typeof document !== "undefined" ? document.currentScript : null;
let baseURL =
  script?.dataset.base ??
  (script?.src ? new URL(".", script.src).href : globalThis.location?.href ?? "");

let ready = null;
function init() {
  ready ??= Parser.init({
    wasmBinary: Uint8Array.from(atob(RUNTIME_WASM), (c) => c.charCodeAt(0)),
    // Never fetched (wasmBinary is used), but without it web-tree-sitter
    // resolves its wasm URL against import.meta.url, which is gone here.
    locateFile: (path) => path,
  }).catch((err) => {
    ready = null;
    throw err;
  });
  return ready;
}

const escapeHTML = (s) => s.replace(/[&<>"]/g, (c) => `&${{ "&": "amp", "<": "lt", ">": "gt", '"': "quot" }[c]};`);

// "function.builtin" -> "hl-function hl-function-builtin"
const classCache = new Map();
function captureClass(name) {
  let cls = classCache.get(name);
  if (cls === undefined) {
    const parts = name.split(".");
    cls = parts.map((_, i) => `hl-${parts.slice(0, i + 1).join("-")}`).join(" ");
    classCache.set(name, cls);
  }
  return cls;
}

function tagForCapture(capture) {
  switch (capture) {
    case "comment":
    case "comment.documentation":
        return "c";
    case "punctuation.bracket":
    case "punctuation.special":
    case "punctuation.delimiter":
        return "p";
    case "string":
    case "string.special":
    case "string.special.path":
    case "string.special.symbol":
    case "character":
    case "string.escape":
    case "string.regexp":
        return "s";
    case "variable":
    case "variable.parameter":
    case "variable.builtin":
    case "variable.member":
        return "v";
    case "operator":
    case "tag.delimiter":
        return "o";
    case "function":
    case "function.builtin":
    case "function.call":
    case "function.method.call":
    case "function.method":
        return "f";
    case "keyword":
    case "keyword.conditional":
    case "keyword.repeat":
    case "keyword.directive":
    case "keyword.modifier":
    case "keyword.return":
    case "keyword.operator":
    case "keyword.type":
    case "keyword.function":
    case "keyword.import":
    case "keyword.conditional.ternary":
    case "keyword.coroutine":
    case "keyword.exception":
        return "k";
    case "label":
        return "l";
    case "type":
    case "type.builtin":
        return "t";
    case "constant":
    case "constant.builtin":
    case "boolean":
        return "co";
    case "property":
        return "pr";
    case "number":
        return "n";
    case "attribute":
    case "tag.attribute":
        return "at";
    case "tag":
        return "tg";
    case "module":
        return "ns";
    case "constructor":
        return "cr";
  }
}

/**
 * Sort ranges by start, outer first, and make them nest: a range that starts
 * inside another but ends after it is cut off at the other's end. (Ranges
 * from an injected language can cross the host's when the injection leaves
 * out the content node's children.)
 */
function nest(ranges) {
  ranges.sort((a, b) => a.start - b.start || b.end - a.end);
  const out = [];
  const stack = []; // end offsets of enclosing ranges
  for (const { start, end, name } of ranges) {
    while (stack.length && stack[stack.length - 1] <= start) stack.pop();
    const limit = stack.length ? stack[stack.length - 1] : Infinity;
    const clipped = Math.min(end, limit);
    if (clipped <= start) continue;
    out.push({ start, end: clipped, name });
    stack.push(clipped);
  }
  return out;
}

// Grammars whose .wasm has loaded, by name. Injections use only these, so
// highlighting stays synchronous; loadInjections() fills it in first.
const loaded = new Map();

// Injected regions nest at most this deep (HTML > TypeScript > CSS is 3).
const MAX_INJECTION_DEPTH = 4;

/** The bundled language for an injection's language name ("ts", "css"), or null. */
const injectionCache = new Map();
function resolveInjection(name) {
  if (!name) return null;
  if (injectionCache.has(name)) return injectionCache.get(name);
  let found = LANGUAGES[name] ? name : null;
  const lower = name.toLowerCase();
  for (const [lang, info] of Object.entries(LANGUAGES)) {
    if (found) break;
    if (info.injectionRegex && new RegExp(info.injectionRegex).test(lower)) found = lang;
  }
  found ??= languageForFile(lower);
  injectionCache.set(name, found);
  return found;
}

const rangeOf = (node) => ({
  startIndex: node.startIndex,
  endIndex: node.endIndex,
  startPosition: node.startPosition,
  endPosition: node.endPosition,
});

/**
 * The ranges of an injection's content node: the whole node, or (without
 * injection.include-children) the node less its children.
 */
function contentRanges(node, includeChildren) {
  const whole = rangeOf(node);
  if (includeChildren || node.childCount === 0) return [whole];
  const ranges = [];
  let start = whole;
  for (const child of node.children) {
    if (child.startIndex > start.startIndex) {
      ranges.push({ startIndex: start.startIndex, startPosition: start.startPosition,
        endIndex: child.startIndex, endPosition: child.startPosition });
    }
    start = { startIndex: child.endIndex, startPosition: child.endPosition };
  }
  if (whole.endIndex > start.startIndex) {
    ranges.push({ startIndex: start.startIndex, startPosition: start.startPosition,
      endIndex: whole.endIndex, endPosition: whole.endPosition });
  }
  return ranges;
}

/** Apply `(#offset! @capture start-row start-col end-row end-col)`, same-row only. */
function offsetRange(range, offset) {
  if (!offset) return range;
  const [sr, sc, er, ec] = offset;
  if (sr || er) return range;
  return {
    startIndex: range.startIndex + sc,
    endIndex: range.endIndex + ec,
    startPosition: { ...range.startPosition, column: range.startPosition.column + sc },
    endPosition: { ...range.endPosition, column: range.endPosition.column + ec },
  };
}

class Grammar {
  #parser;
  #queries = new Map();
  #info;

  constructor(name, language, info) {
    this.name = name;
    this.title = info.title;
    this.scope = info.scope;
    this.fileTypes = info.fileTypes;
    this.language = language;
    this.#parser = new Parser();
    this.#parser.setLanguage(language);
    this.#info = info;
  }

  /** The compiled query of the given kind ("highlights", "locals", ...), or null. */
  query(kind) {
    if (!this.#queries.has(kind)) {
      const source = this.#info.queries[kind];
      this.#queries.set(kind, source ? new Query(this.language, source) : null);
    }
    return this.#queries.get(kind);
  }

  /** Parse source text into a web-tree-sitter Tree. Call tree.delete() when done. */
  parse(source, oldTree, options) {
    return this.#parser.parse(source, oldTree ?? null, options);
  }

  /**
   * The injected regions of a tree, from injections.scm, as
   * `{ language, ranges }` with `language` a bundled language name. Regions
   * in languages that are not bundled are left out.
   */
  injections(tree) {
    const query = this.query("injections");
    if (!query) return [];
    const regions = [];
    const combined = new Map();
    for (const match of query.matches(tree.rootNode)) {
      const props = match.setProperties ?? {};
      let name = props["injection.language"];
      const nodes = [];
      for (const { name: capture, node } of match.captures) {
        if (capture === "injection.language") name = node.text;
        else if (capture === "injection.content") nodes.push(node);
      }
      const language = resolveInjection(name);
      if (!language || !nodes.length) continue;
      const offset = query.predicates[match.patternIndex]
        ?.find((p) => p.operator === "offset!" && p.operands[0]?.name === "injection.content")
        ?.operands.slice(1).map((o) => Number(o.value));
      const includeChildren = "injection.include-children" in props;
      const ranges = nodes
        .flatMap((node) => contentRanges(node, includeChildren))
        .map((r) => offsetRange(r, offset))
        .filter((r) => r.endIndex > r.startIndex);
      if (!ranges.length) continue;
      if ("injection.combined" in props) {
        const key = `${match.patternIndex}:${language}`;
        if (combined.has(key)) combined.get(key).ranges.push(...ranges);
        else {
          const region = { language, ranges };
          combined.set(key, region);
          regions.push(region);
        }
      } else {
        regions.push({ language, ranges });
      }
    }
    for (const region of combined.values()) region.ranges.sort((a, b) => a.startIndex - b.startIndex);
    return regions;
  }

  /**
   * Load every grammar that `source` injects, at any depth, so that
   * highlights() and highlightHTML() can use them. Resolves to this grammar.
   */
  async loadInjections(source, tree, depth = 0) {
    if (depth >= MAX_INJECTION_DEPTH || !this.#info.queries.injections) return this;
    const ownTree = !tree;
    tree ??= this.parse(source);
    try {
      const regions = this.injections(tree);
      const grammars = await Promise.all(regions.map((r) => load(r.language).catch(() => null)));
      for (const [i, grammar] of grammars.entries()) {
        if (!grammar) continue;
        const inner = grammar.parse(source, null, { includedRanges: regions[i].ranges });
        try {
          await grammar.loadInjections(source, inner, depth + 1);
        } finally {
          inner.delete();
        }
      }
    } finally {
      if (ownTree) tree.delete();
    }
    return this;
  }

  /**
   * Highlight ranges for `source` (or an existing tree of it), as
   * `{ start, end, name }` objects with UTF-16 offsets. Ranges nest; they are
   * sorted by start, outer ranges first. When several patterns capture the
   * same node, the last one in highlights.scm wins.
   */
  highlights(source, tree) {
    return nest(this.#highlights(source, tree, 0));
  }

  // Unsorted ranges, with injected languages' ranges in place of the host's
  // inside each injected region.
  #highlights(source, tree, depth) {
    const query = this.query("highlights");
    const ownTree = !tree;
    tree ??= this.parse(source);
    try {
      const byRange = new Map();
      for (const { name, node, patternIndex } of query?.captures(tree.rootNode) ?? []) {
        if (name.startsWith("_")) continue;
        const { startIndex: start, endIndex: end } = node;
        if (start === end) continue;
        const key = start * 0x100000000 + end;
        const prev = byRange.get(key);
        if (!prev || patternIndex >= prev.patternIndex) byRange.set(key, { start, end, name, patternIndex });
      }
      let ranges = [...byRange.values()];

      if (depth < MAX_INJECTION_DEPTH) {
        for (const { language, ranges: included } of this.injections(tree)) {
          const grammar = loaded.get(language);
          if (!grammar) continue;
          const inner = grammar.parse(source, null, { includedRanges: included });
          // The injected language owns its ranges: host ranges strictly
          // inside one give way. Ranges covering it (like a string around an
          // injected attribute value) stay, and so do the content node's
          // children when the injection leaves them out.
          ranges = ranges.filter((r) => !included.some((i) =>
            r.start >= i.startIndex && r.end <= i.endIndex && r.end - r.start < i.endIndex - i.startIndex));
          try {
            ranges.push(...grammar.#highlights(source, inner, depth + 1));
          } finally {
            inner.delete();
          }
        }
      }
      return ranges;
    } finally {
      if (ownTree) tree.delete();
    }
  }

  /** `source` as escaped HTML, with highlights as <span class="hl-…"> elements. */
  highlightHTML(source) {
    let out = "";
    let pos = 0;
    const stack = []; // end offsets of open spans
    const closeUntil = (offset) => {
      while (stack.length && stack[stack.length - 1] <= offset) {
        const end = stack.pop();
        out += escapeHTML(source.slice(pos, end)) + "</span>";
        pos = end;
      }
    };
    for (const { start, end, name } of this.highlights(source)) {
      closeUntil(start);
      out += escapeHTML(source.slice(pos, start)) + `<span class="${captureClass(name)}">`;
      pos = start;
      stack.push(end);
    }
    closeUntil(Infinity);
    return out + escapeHTML(source.slice(pos));
  }
}

const loading = new Map();

/** Load a grammar by name (see Forest.languages). Resolves to a Grammar. */
function load(name) {
  const info = LANGUAGES[name];
  if (!info) return Promise.reject(new Error(`forest: unknown language "${name}"`));
  let promise = loading.get(name);
  if (!promise) {
    promise = (async () => {
      await init();
      // Pass the bytes, not the URL: from a URL web-tree-sitter compiles the
      // module and then instantiates it synchronously, which Chrome refuses
      // on the main thread for modules over 8 MB (Ruby's is about 16 MB).
      const response = await fetch(new URL(info.wasm, Forest.baseURL).href);
      if (!response.ok) throw new Error(`forest: ${info.wasm}: HTTP ${response.status}`);
      const language = await Language.load(new Uint8Array(await response.arrayBuffer()));
      const grammar = new Grammar(name, language, info);
      loaded.set(name, grammar);
      return grammar;
    })();
    promise.catch(() => loading.delete(name));
    loading.set(name, promise);
  }
  return promise;
}

/** The language name for a file name or extension ("main.zig", ".zig", "zig"), or null. */
function languageForFile(file) {
  // A file type is an extension (`cmake`) or a whole file name
  // (`CMakeLists.txt`). Whole names are checked first.
  const base = String(file).split(/[\\/]/).pop();
  const ext = base.split(".").pop();
  for (const key of [base, ext]) {
    for (const [name, info] of Object.entries(LANGUAGES)) {
      if (info.fileTypes.includes(key)) return name;
    }
  }
  return null;
}

function elementLanguage(el) {
  for (let e = el; e && e.nodeType === 1; e = e.parentElement) {
    const lang = e.dataset.lang ?? /\blang(?:uage)?-(\S+)/.exec(e.className)?.[1];
    if (lang) return LANGUAGES[lang] ? lang : languageForFile(lang);
  }
  return null;
}

/**
 * Replace an element's text with highlighted HTML. The language comes from
 * `language`, or else a data-lang attribute or language-xxx class on the
 * element or an ancestor.
 */
async function highlightElement(el, language) {
  const name = language ?? elementLanguage(el);
  if (!name) throw new Error("forest: cannot tell the element's language");
  const grammar = await load(name);
  const source = el.textContent;
  await grammar.loadInjections(source);
  el.innerHTML = grammar.highlightHTML(source);
  el.classList.add("forest");
  el.dataset.highlighted = name;
  return el;
}

/** Highlight every element matching `selector` whose language is known. */
async function highlightAll(selector = "pre code, code[data-lang], pre[data-lang]") {
  const els = [...document.querySelectorAll(selector)].filter(
    (el) => !el.dataset.highlighted && elementLanguage(el),
  );
  return Promise.all(els.map((el) => highlightElement(el)));
}

const Forest = {
  version: __FOREST_VERSION__,
  /** Base URL that grammar .wasm files are fetched from. */
  get baseURL() {
    return baseURL;
  },
  set baseURL(url) {
    baseURL = new URL(url, globalThis.location?.href).href;
  },
  /** Names of the bundled languages. */
  languages: Object.keys(LANGUAGES),
  init,
  load,
  languageForFile,
  /** Highlighted HTML for `source` in language `name`. */
  async highlight(name, source) {
    const grammar = await load(name);
    await grammar.loadInjections(source);
    return grammar.highlightHTML(source);
  },
  highlightElement,
  highlightAll,
  captureClass,
  tagForCapture,
  // The underlying web-tree-sitter classes, for anything not covered above.
  Parser,
  Language,
  Query,
};

globalThis.Forest = Forest;

// <script src="forest.js" data-auto> highlights the page once it has loaded.
if (script?.hasAttribute("data-auto")) {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => highlightAll());
  } else {
    highlightAll();
  }
}
