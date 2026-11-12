#!/usr/bin/env bash
# Parse the Verilog tests in an ivtest checkout (Icarus Verilog's regression
# suite, https://github.com/steveicarus/ivtest) and list the files that do
# not parse.
#
# Tests come from regress-vlg.list, leaving out those that must fail to
# compile (CE) and those run as SystemVerilog or Verilog-AMS.
#
#   script/check-ivtest.sh ~/src/ivtest
set -euo pipefail

ivtest=${1:?usage: $0 <path to an ivtest checkout>}
here=$(cd "$(dirname "$0")/.." && pwd)
work=$(mktemp -d)
trap 'rm -rf "$work"' EXIT

cd "$here"
quiet() { grep -v -i -e 'warning' -e 'init-config' -e 'configuration' -e 'language grammars' -e '^$' || true; }

grep -v '^#' "$ivtest/regress-vlg.list" |
  awk 'NF >= 3 && $2 !~ /^CE/ && $2 !~ /-g2005-sv|-g2009|-g2012|-gverilog-ams/ { print $3 "/" $1 ".v" }' |
  sort -u |
  while read -r f; do [ -f "$ivtest/$f" ] && echo "$ivtest/$f"; done > "$work/files.txt"

echo "== $(wc -l < "$work/files.txt" | tr -d ' ') files from $ivtest/regress-vlg.list"
{ tree-sitter parse -q --paths "$work/files.txt" 2>&1 || true; } | quiet | awk '{print "  error: " $1}'
