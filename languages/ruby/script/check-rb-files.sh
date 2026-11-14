#!/usr/bin/env bash
# Parse every Ruby file under the given directories and list the ones with
# syntax errors.
#
#   script/check-rb-files.sh ~/src/ruby
set -euo pipefail

[ $# -gt 0 ] || { echo "usage: $0 <dir>..." >&2; exit 2; }
here=$(cd "$(dirname "$0")/.." && pwd)
work=$(mktemp -d)
trap 'rm -rf "$work"' EXIT

# Make the directories absolute before leaving the caller's directory.
dirs=()
for d in "$@"; do dirs+=("$(cd "$d" && pwd)"); done

cd "$here"
quiet() { grep -v -i -e 'warning' -e 'init-config' -e 'configuration' -e 'language grammars' -e '^$' || true; }

find "${dirs[@]}" -name node_modules -prune -o -type f \( -name '*.rb' -o -name '*.rake' -o -name '*.gemspec' -o -name Rakefile -o -name Gemfile \) -print > "$work/all.txt"
echo "== $(wc -l < "$work/all.txt" | tr -d ' ') files"
{ tree-sitter parse -q --paths "$work/all.txt" 2>&1 || true; } | quiet | awk '{print "  error: " $1}'
