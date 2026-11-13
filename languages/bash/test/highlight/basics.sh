#!/usr/bin/env bash
# <- comment
set -euo pipefail
# <- function.builtin
#   ^ variable.parameter

readonly VERSION="1.2.3"
# <- keyword
#        ^ variable
#               ^ operator
#                ^ string

usage() {
# <- function
#    ^ punctuation.bracket
#       ^ punctuation.bracket
  cat <<EOF >&2
# ^ function.call
#     ^ operator
#       ^ label
#           ^ operator
#             ^ number
usage: $0 [-v] FILE
EOF
# <- label
}
# <- punctuation.bracket

for f in "$@"; do
# <- keyword.repeat
#   ^ variable
#     ^ keyword.repeat
#          ^ variable.builtin
#            ^ punctuation.delimiter
#              ^ keyword.repeat
  if [[ -f $f && $f =~ \.txt$ ]]; then
# ^ keyword.conditional
#    ^ punctuation.bracket
#       ^ operator
#          ^ punctuation.special
#             ^ operator
#                   ^ operator
#                      ^ string.regexp
#                                 ^ keyword.conditional
    count=$(( count + 1 ))
#   ^ variable
#        ^ operator
#         ^ punctuation.special
#             ^ variable
#                   ^ operator
#                     ^ number
  fi
# ^ keyword.conditional
done 2>/dev/null
# <- keyword.repeat
#    ^ number
#     ^ operator

case "${1:-}" in
# <- keyword.conditional
#     ^ punctuation.special
#       ^ variable.builtin
#        ^ operator
#             ^ keyword.repeat
  -h|--help) usage ;;
#   ^ operator
#            ^ function.call
#                  ^ punctuation.delimiter
esac
# <- keyword.conditional

echo 'single' $'ansi\n' $(date) | tr a-z A-Z
# <- function.builtin
#    ^ string
#             ^ string
#                       ^ punctuation.special
#                         ^ function.call
#                               ^ operator
#                                 ^ function.call
