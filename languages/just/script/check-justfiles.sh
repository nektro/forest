#!/usr/bin/env bash
# Parse every justfile under the given directories (or the given files) and
# list the ones with syntax errors. Matches justfile and .justfile in any
# case, and *.just.
#
#   script/check-justfiles.sh ~/src/just
set -euo pipefail

[ $# -gt 0 ] || { echo "usage: $0 <dir-or-file>..." >&2; exit 2; }
here=$(cd "$(dirname "$0")/.." && pwd)
work=$(mktemp -d)
trap 'rm -rf "$work"' EXIT

# Make the paths absolute before leaving the caller's directory.
paths=()
for p in "$@"; do
  if [ -d "$p" ]; then paths+=("$(cd "$p" && pwd)"); else paths+=("$(cd "$(dirname "$p")" && pwd)/$(basename "$p")"); fi
done

cd "$here"
quiet() { grep -v -i -e 'warning' -e 'init-config' -e 'configuration' -e 'language grammars' -e '^$' || true; }

find "${paths[@]}" -name node_modules -prune -o -type f \( \
  -iname justfile -o -iname .justfile -o -name '*.just' \
\) -print > "$work/all.txt"
echo "== $(wc -l < "$work/all.txt" | tr -d ' ') files"
{ tree-sitter parse -q --paths "$work/all.txt" 2>&1 || true; } | quiet | awk '{print "  error: " $1}'
