#!/usr/bin/env bash
# Copy a directory into a dated archive and keep the newest few.
set -euo pipefail

readonly KEEP=${KEEP:-5}
declare -a excludes=(--exclude='*.tmp' --exclude=.cache)

usage() {
  cat >&2 <<EOF
usage: ${0##*/} [-n] SOURCE DEST

  -n  show what would be done
EOF
  exit 2
}

dry_run=false
while getopts ':n' opt; do
  case $opt in
    n) dry_run=true ;;
    *) usage ;;
  esac
done
shift $((OPTIND - 1))
(( $# == 2 )) || usage

src=$1 dest=${2%/}
archive="$dest/$(basename "$src")-$(date +%Y%m%d).tar.gz"

if [[ ! -d $src ]]; then
  echo "not a directory: $src" >&2
  exit 1
elif $dry_run; then
  echo "would write $archive"
  exit 0
fi

mkdir -p "$dest"
tar -czf "$archive" "${excludes[@]}" -C "$(dirname "$src")" "${src##*/}"

# Delete all but the newest $KEEP archives.
mapfile -t old < <(ls -1t "$dest"/*.tar.gz | tail -n +$((KEEP + 1)))
for f in "${old[@]}"; do
  rm -f -- "$f" && echo "removed $f"
done
