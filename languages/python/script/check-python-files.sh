#!/usr/bin/env bash
# Parse every Python file under the given directories and list the ones with
# syntax errors.
#
#   script/check-python-files.sh ~/src/cpython/Lib ~/src/cpython/Tools
set -euo pipefail

[ $# -gt 0 ] || { echo "usage: $0 <dir>..." >&2; exit 2; }
here=$(cd "$(dirname "$0")/.." && pwd)
work=$(mktemp -d)
trap 'rm -rf "$work"' EXIT

cd "$here"
quiet() { grep -v -i -e 'warning' -e 'init-config' -e 'configuration' -e 'language grammars' -e '^$' || true; }

find "$@" -type f \( -name '*.py' -o -name '*.pyi' \) -not -path '*/node_modules/*' 2>/dev/null > "$work/all.txt" || true
echo "== $(wc -l < "$work/all.txt" | tr -d ' ') files"
{ tree-sitter parse -q --paths "$work/all.txt" 2>&1 || true; } | quiet | awk '{print "  error: " $1}'
