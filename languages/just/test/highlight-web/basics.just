# Settings and variables
# <- comment
set shell := ["bash", "-uc"]
# <- keyword
#   ^ property
#         ^ operator
#            ^ punctuation.bracket
#             ^ string
set export := true
#   ^ property
#             ^ boolean
export VERSION := `git describe`
# <- keyword
#      ^ variable
#                 ^ string.special
target := env("TARGET", "debug") + RED
# <- variable
#         ^ function.builtin
#                                  ^ constant.builtin
greeting(name) := "hi " + name
# <- function
#        ^ variable.parameter
path := x"~/bin" / f"v{{ VERSION }}\n"
#       ^ string
#                ^ operator
#                   ^ string
#                     ^ punctuation.special
#                        ^ variable
#                                  ^ string.escape
mode := if os() == "linux" { "a" } else { "b" }
#       ^ keyword.conditional
#                ^ operator
#                          ^ punctuation.bracket
#                                  ^ keyword.conditional
import? 'other.just'
# <- keyword.import
#     ^ keyword.modifier
#       ^ string.special.path
mod tools
# <- keyword.import
#   ^ module
alias b := build
# <- keyword
#     ^ function
#          ^ function.call

# Recipes
[group('dev'), confirm]
#^ attribute
#      ^ string
#              ^ attribute
@build $profile="debug" *flags: tools::lint (check profile)
# <- punctuation.special
#^ function
#      ^ punctuation.special
#       ^ variable.parameter
#               ^ string
#                       ^ operator
#                        ^ variable.parameter
#                               ^ module
#                                      ^ function.call
#                                            ^ function.call
#                                                  ^ variable
  @cargo build --profile {{ profile }} {{ join(flags) }}
# ^ punctuation.special
#                        ^ punctuation.special
#                           ^ variable
#                                         ^ function.builtin

script:
  #!/usr/bin/env python3
# ^ comment
  print("{{ target }}")
#           ^ variable
