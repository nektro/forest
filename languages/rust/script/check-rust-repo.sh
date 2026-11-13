#!/usr/bin/env bash
# Parse the .rs files in a rust-lang/rust checkout and list the ones with
# syntax errors:
#
#   - library/ and compiler/
#   - tests/ui files that are expected to compile (marked check-pass,
#     build-pass or run-pass)
#
#   script/check-rust-repo.sh ~/src/rust
set -euo pipefail

rust_root=${1:?usage: $0 <path to a rust-lang/rust checkout>}
here=$(cd "$(dirname "$0")/.." && pwd)
work=$(mktemp -d)
trap 'rm -rf "$work"' EXIT

cd "$here"
quiet() { grep -v -i -e 'warning' -e 'init-config' -e 'configuration' -e 'language grammars' -e '^$' || true; }
check() {
  echo "== $(wc -l < "$2" | tr -d ' ') $1"
  { tree-sitter parse -q --paths "$2" 2>&1 || true; } | quiet | awk '{print "  error: " $1}'
}

find "$rust_root/library" -name '*.rs' > "$work/library.txt"
check "files in library/" "$work/library.txt"

find "$rust_root/compiler" -name '*.rs' > "$work/compiler.txt"
check "files in compiler/" "$work/compiler.txt"

find "$rust_root/tests/ui" -name '*.rs' -print0 \
  | xargs -0 grep -l -E '^//@ *(check|build|run)-pass' > "$work/ui.txt" || true
check "tests/ui files that should compile" "$work/ui.txt"
