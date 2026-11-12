#!/usr/bin/env bash
# Parse the .go files in a Go checkout and report any that do not parse:
#
#   - everything under src/ outside testdata directories
#   - test/ files that should compile (not marked errorcheck or skip)
#   - the gofmt and go/printer golden outputs
#
# and how many of test/syntax/*.go, which Go must reject, are accepted.
#
#   script/check-go-repo.sh ~/src/go
set -euo pipefail

go_root=${1:?usage: $0 <path to a golang/go checkout>}
here=$(cd "$(dirname "$0")/.." && pwd)
work=$(mktemp -d)
trap 'rm -rf "$work"' EXIT

cd "$here"
quiet() { grep -v -i -e 'warning' -e 'init-config' -e 'configuration' -e 'language grammars' -e '^$' || true; }
check() {
  echo "== $(wc -l < "$2" | tr -d ' ') $1"
  { tree-sitter parse -q --paths "$2" 2>&1 || true; } | quiet | awk '{print "  error: " $1}'
}

find "$go_root/src" -name '*.go' -not -path '*/testdata/*' > "$work/src.txt"
check "files in src/" "$work/src.txt"

find "$go_root/test" -name '*.go' -not -path '*/syntax/*' -print0 \
  | xargs -0 grep -L -E '^// *(errorcheck|skip)' > "$work/test.txt" || true
check "test/ files that should compile" "$work/test.txt"

find "$go_root/src/go/printer/testdata" "$go_root/src/cmd/gofmt/testdata" -name '*.golden' > "$work/golden.txt"
check "gofmt golden files" "$work/golden.txt"

accepted=0; total=0
for f in "$go_root"/test/syntax/*.go; do
  total=$((total + 1))
  if tree-sitter parse -q "$f" >/dev/null 2>&1; then
    accepted=$((accepted + 1))
    echo "  accepted: ${f#"$go_root"/}"
  fi
done
echo "== $accepted of $total test/syntax files that Go rejects are accepted (see README: leniency)"
