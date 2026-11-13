#!/usr/bin/env bash
# Parse every .c and .h file under the given directories and list the ones
# that do not parse without errors.
#
#   script/check-c-repo.sh ~/src/sqlite/src ~/src/zig/lib/libc
set -euo pipefail

here=$(cd "$(dirname "$0")/.." && pwd)
work=$(mktemp -d)
trap 'rm -rf "$work"' EXIT

find "$@" -type f \( -name '*.c' -o -name '*.h' \) | sort > "$work/all.txt"
total=$(wc -l < "$work/all.txt" | tr -d ' ')

cd "$here"
{ tree-sitter parse -q --paths "$work/all.txt" 2>&1 || true; } |
  grep -v -i -e 'warning' -e 'init-config' -e 'configuration' -e 'language grammars' -e '^$' |
  awk '{print $1}' > "$work/errors.txt" || true
failed=$(wc -l < "$work/errors.txt" | tr -d ' ')

cat "$work/errors.txt"
echo "== $((total - failed)) of $total files parse without errors"
