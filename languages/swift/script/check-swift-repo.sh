#!/usr/bin/env bash
# Parse the Swift sources in a swiftlang/swift checkout that are meant to be
# valid code, and list every file that does not parse cleanly.
#
#   script/check-swift-repo.sh ~/src/swift
#
# test/ and validation-test/ are left out (except test/Interpreter): most of
# their files check the compiler's diagnostics and are invalid on purpose.
set -euo pipefail

swift_root=${1:?usage: $0 <path to a swiftlang/swift checkout>}
here=$(cd "$(dirname "$0")/.." && pwd)
work=$(mktemp -d)
trap 'rm -rf "$work"' EXIT

cd "$here"
quiet() { grep -v -i -e 'warning' -e 'init-config' -e 'configuration' -e 'language grammars' -e 'parser directories' -e '^$' || true; }

for dir in stdlib benchmark SwiftCompilerSources test/Interpreter; do
  find "$swift_root/$dir" -name '*.swift' > "$work/files.txt"
  { tree-sitter parse -q --paths "$work/files.txt" 2>&1 || true; } | quiet > "$work/fail.txt"
  echo "== $dir: $(wc -l < "$work/fail.txt" | tr -d ' ') of $(wc -l < "$work/files.txt" | tr -d ' ') files have errors"
  awk '{print "  " $1}' "$work/fail.txt"
done
