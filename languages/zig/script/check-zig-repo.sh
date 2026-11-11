#!/usr/bin/env bash
# Parse every .zig file in a Zig checkout, plus the source snippets from
# lib/std/zig/parser_test.zig, and report anything that does not parse
# the way Zig does.
#
#   script/check-zig-repo.sh ~/src/zig
set -euo pipefail

zig_root=${1:?usage: $0 <path to a ziglang/zig checkout>}
here=$(cd "$(dirname "$0")/.." && pwd)
work=$(mktemp -d)
trap 'rm -rf "$work"' EXIT

cd "$here"
quiet() { grep -v -i -e 'warning' -e 'init-config' -e 'configuration' -e 'language grammars' -e '^$' || true; }

find "$zig_root" -name '*.zig' -not -path '*/.zig-cache/*' -not -path '*/zig-cache/*' > "$work/all.txt"
echo "== $(wc -l < "$work/all.txt" | tr -d ' ') files in $zig_root"
{ tree-sitter parse -q --paths "$work/all.txt" 2>&1 || true; } | quiet | awk '{print "  error: " $1}'

python3 -I "$here/script/extract-parser-tests.py" "$zig_root/lib/std/zig/parser_test.zig" "$work/snippets"

ls "$work"/snippets/ok/*.zig > "$work/ok.txt"
echo "== $(wc -l < "$work/ok.txt" | tr -d ' ') zig fmt snippets that must parse"
{ tree-sitter parse -q --paths "$work/ok.txt" 2>&1 || true; } | quiet | awk '{print "  error: " $1}'

accepted=0; total=0
for f in "$work"/snippets/err/*.zig; do
  total=$((total + 1))
  if tree-sitter parse -q "$f" >/dev/null 2>&1; then accepted=$((accepted + 1)); fi
done
echo "== $accepted of $total snippets that zig rejects are accepted (see README: leniency)"
