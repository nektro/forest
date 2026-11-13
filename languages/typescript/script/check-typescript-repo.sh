#!/usr/bin/env bash
# Parse the TypeScript sources in a microsoft/TypeScript checkout and list the
# ones with syntax errors:
#
#   - the bundled lib .d.ts files and the VS Code extension sources
#   - compiler and conformance tests that compile without errors (no
#     .errors.txt baseline in any configuration) and contain only TypeScript
#     (no @filename for a .js, .json or other kind of file)
#
#   script/check-typescript-repo.sh ~/src/TypeScript
set -euo pipefail

ts_root=${1:?usage: $0 <path to a microsoft/TypeScript checkout>}
here=$(cd "$(dirname "$0")/.." && pwd)
work=$(mktemp -d)
trap 'rm -rf "$work"' EXIT

quiet() { grep -v -i -e 'warning' -e 'init-config' -e 'configuration' -e 'language grammars' -e '^$' || true; }
# check <description> <file list>
check() {
  echo "== $(wc -l < "$2" | tr -d ' ') $1"
  { (cd "$here" && tree-sitter parse -q --paths "$2" 2>&1) || true; } | quiet | awk '{print "  error: " $1}'
}

find "$ts_root/tsc/internal/bundled/libs" -name '*.ts' > "$work/libs.txt"
check "lib .d.ts files" "$work/libs.txt"

find "$ts_root/packages" -name '*.ts' -not -path '*/node_modules/*' > "$work/packages.txt"
check "files in packages/" "$work/packages.txt"

cases="$ts_root/tsc/testdata/tests/cases"
baselines="$ts_root/tsc/testdata/baselines/reference"
for kind in compiler conformance; do
  # Tests with an .errors.txt baseline (in any configuration) are skipped.
  ls "$baselines/$kind" | sed -n 's/\(([^)]*)\)*\.errors\.txt$//p' | sort -u > "$work/$kind-errors.txt"
  for ext in ts tsx; do
    find "$cases/$kind" -name "*.$ext" | while read -r f; do
      printf '%s\t%s\n' "$(basename "$f" ".$ext")" "$f"
    done | sort > "$work/$kind-$ext-all.txt"
    join -t "$(printf '\t')" -v 1 "$work/$kind-$ext-all.txt" "$work/$kind-errors.txt" | cut -f2 \
      | while read -r f; do
          grep -q -i -E '^[[:space:]]*//[[:space:]]*@filename:.*\.(jsx?|json|mjs|cjs|txt|md|html|map)[[:space:]]*$' "$f" || echo "$f"
        done > "$work/$kind-$ext.txt"
  done
  check "$kind .ts tests that should compile" "$work/$kind-ts.txt"
  check "$kind .tsx tests that should compile" "$work/$kind-tsx.txt"
done
