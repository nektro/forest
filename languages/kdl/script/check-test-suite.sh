#!/usr/bin/env bash
# Parse the official KDL test suite (https://github.com/kdl-org/kdl, in
# tests/test_cases) and list the valid inputs with syntax errors. Inputs with
# no expected_kdl output are meant to fail; the count of those that parse
# without an error is printed too, since this grammar is more lenient than the
# spec (it does not check that entries are separated by whitespace, for one).
#
#   script/check-test-suite.sh ~/src/kdl/tests/test_cases
set -euo pipefail

[ $# -eq 1 ] || { echo "usage: $0 <test_cases dir>" >&2; exit 2; }
cases=$(cd "$1" && pwd)
here=$(cd "$(dirname "$0")/.." && pwd)
work=$(mktemp -d)
trap 'rm -rf "$work"' EXIT

cd "$here"
quiet() { grep -v -i -e 'warning' -e 'init-config' -e 'configuration' -e 'language grammars' -e '^$' || true; }

: > "$work/valid.txt"
: > "$work/invalid.txt"
for f in "$cases"/input/*.kdl; do
  if [ -f "$cases/expected_kdl/$(basename "$f")" ]; then
    echo "$f" >> "$work/valid.txt"
  else
    echo "$f" >> "$work/invalid.txt"
  fi
done

echo "== $(wc -l < "$work/valid.txt" | tr -d ' ') valid inputs"
{ tree-sitter parse -q --paths "$work/valid.txt" 2>&1 || true; } | quiet | awk '{print "  error: " $0}'

total=$(wc -l < "$work/invalid.txt" | tr -d ' ')
rejected=$({ tree-sitter parse -q --paths "$work/invalid.txt" 2>&1 || true; } | quiet | wc -l | tr -d ' ')
echo "== $total invalid inputs, $rejected rejected"
