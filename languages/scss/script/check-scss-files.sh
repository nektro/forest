#!/usr/bin/env bash
# Parse every .scss file under the given directories and list the ones with
# syntax errors.
#
#   script/check-scss-files.sh ~/src/bootstrap/scss
set -euo pipefail

[ $# -gt 0 ] || { echo "usage: $0 <dir>..." >&2; exit 2; }
here=$(cd "$(dirname "$0")/.." && pwd)
work=$(mktemp -d)
trap 'rm -rf "$work"' EXIT

cd "$here"
quiet() { grep -v -i -e 'warning' -e 'init-config' -e 'configuration' -e 'language grammars' -e '^$' || true; }

find "$@" -name '*.scss' > "$work/all.txt"
echo "== $(wc -l < "$work/all.txt" | tr -d ' ') files"
{ tree-sitter parse -q --paths "$work/all.txt" 2>&1 || true; } | quiet | awk '{print "  error: " $1}'
