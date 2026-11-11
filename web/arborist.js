// Browser entry point, bundled by web/build.ts into dist/arborist.js and
// exposed as the global `Arborist`.

import { Language, Parser, Query } from "web-tree-sitter";
import LANGUAGES from "arborist:languages";
import RUNTIME_WASM from "arborist:runtime-wasm";

// Grammar .wasm files are fetched relative to this script, unless the script
// tag has data-base="..." or Arborist.baseURL is set before the first load.
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
  parse(source, oldTree) {
    return this.#parser.parse(source, oldTree ?? null);
  }

  /**
   * Highlight ranges for `source` (or an existing tree of it), as
   * `{ start, end, name }` objects with UTF-16 offsets. Ranges nest; they are
   * sorted by start, outer ranges first. When several patterns capture the
   * same node, the last one in highlights.scm wins.
   */
  highlights(source, tree) {
    const query = this.query("highlights");
    if (!query) return [];
    const ownTree = !tree;
    tree ??= this.parse(source);
    try {
      const byRange = new Map();
      for (const { name, node, patternIndex } of query.captures(tree.rootNode)) {
        if (name.startsWith("_")) continue;
        const { startIndex: start, endIndex: end } = node;
        if (start === end) continue;
        const key = start * 0x100000000 + end;
        const prev = byRange.get(key);
        if (!prev || patternIndex >= prev.patternIndex) byRange.set(key, { start, end, name, patternIndex });
      }
      return [...byRange.values()]
        .sort((a, b) => a.start - b.start || b.end - a.end)
        .map(({ start, end, name }) => ({ start, end, name }));
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

/** Load a grammar by name (see Arborist.languages). Resolves to a Grammar. */
function load(name) {
  const info = LANGUAGES[name];
  if (!info) return Promise.reject(new Error(`arborist: unknown language "${name}"`));
  let promise = loading.get(name);
  if (!promise) {
    promise = (async () => {
      await init();
      const language = await Language.load(new URL(info.wasm, Arborist.baseURL).href);
      return new Grammar(name, language, info);
    })();
    promise.catch(() => loading.delete(name));
    loading.set(name, promise);
  }
  return promise;
}

/** The language name for a file name or extension ("main.zig", ".zig", "zig"), or null. */
function languageForFile(file) {
  const ext = String(file).split(/[\\/]/).pop().split(".").pop();
  for (const [name, info] of Object.entries(LANGUAGES)) {
    if (info.fileTypes.includes(ext)) return name;
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
  if (!name) throw new Error("arborist: cannot tell the element's language");
  const grammar = await load(name);
  el.innerHTML = grammar.highlightHTML(el.textContent);
  el.classList.add("arborist");
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

const Arborist = {
  version: __ARBORIST_VERSION__,
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
    return (await load(name)).highlightHTML(source);
  },
  highlightElement,
  highlightAll,
  // The underlying web-tree-sitter classes, for anything not covered above.
  Parser,
  Language,
  Query,
};

globalThis.Arborist = Arborist;

// <script src="arborist.js" data-auto> highlights the page once it has loaded.
if (script?.hasAttribute("data-auto")) {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => highlightAll());
  } else {
    highlightAll();
  }
}
