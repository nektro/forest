; Highlights for GNU makefiles.
;
; When several patterns match a node, the last one wins, so general patterns
; come first and more specific ones after them. Recipe lines are left to the
; shell in injections.scm.

(comment) @comment

; Keywords
; --------

[
  "define"
  "endef"
  "undefine"
  "export"
  "unexport"
  "override"
  "private"
  "vpath"
] @keyword

[
  "include"
  "-include"
  "sinclude"
  "load"
  "-load"
] @keyword.import

[
  "ifeq"
  "ifneq"
  "ifdef"
  "ifndef"
  "else"
  "endif"
] @keyword.conditional

; Rules
; -----

(targets
  (word) @function)

; .PHONY, .SUFFIXES, .DEFAULT, .SECONDEXPANSION and the rest.
((targets
  (word) @function.builtin)
  (#match? @function.builtin "^\\.[A-Z_]+$"))

(target_pattern
  (word) @string.special.path)

(prerequisites
  (word) @string.special.path)

(prefix) @punctuation.special

; Variables
; ---------

(variable_assignment
  name: (word) @variable)

(define_directive
  name: (word) @variable)

(undefine_directive
  name: (word) @variable)

(export_directive
  variables: (word) @variable)

(unexport_directive
  variables: (word) @variable)

(ifdef_directive
  variable: (word) @variable)

(variable_name) @variable

; Variables make sets itself.
((variable_name) @variable.builtin
  (#any-of? @variable.builtin
    "MAKE" "MAKECMDGOALS" "MAKEFILE_LIST" "MAKEFLAGS" "MAKELEVEL" "MAKEOVERRIDES"
    "MAKE_HOST" "MAKE_RESTARTS" "MAKE_TERMERR" "MAKE_TERMOUT" "MAKE_VERSION"
    "MFLAGS" "CURDIR" "SHELL" ".DEFAULT_GOAL" ".FEATURES" ".INCLUDE_DIRS"
    ".LOADED" ".RECIPEPREFIX" ".SHELLFLAGS" ".SHELLSTATUS" ".VARIABLES"
    "SUFFIXES" "VPATH" "GPATH" "MAKESHELL" "MAKEFILES"))

(automatic_variable) @variable.builtin

; $(@D), $(<F) and the like, written as references.
((variable_reference
  name: (variable_name) @variable.builtin)
  (#match? @variable.builtin "^[@<^+?*%|][DF]?$"))

(function_name) @function.builtin

; The function `$(call ...)` calls.
(function_call
  function: (function_name) @_call
  .
  argument: (text) @function.call
  (#eq? @_call "call"))

(escape_sequence) @string.escape

(string) @string

(vpath_directive
  [
    pattern: (word)
    directory: (word)
  ] @string.special.path)

(include_directive
  path: (word) @string.special.path)

(load_directive
  path: (word) @string.special.path)

; Operators and punctuation
; -------------------------

(variable_assignment
  operator: _ @operator)

(define_directive
  operator: _ @operator)

(rule
  operator: _ @punctuation.delimiter)

(target_variable
  [
    ":"
    "::"
  ] @punctuation.delimiter)

[
  ";"
  "|"
] @punctuation.delimiter

(rule
  ":" @punctuation.delimiter)

(variable_reference
  [
    ":"
    "="
  ] @operator)

[
  "("
  ")"
  "{"
  "}"
] @punctuation.bracket

","  @punctuation.delimiter

[
  "$("
  "${"
  "$$("
  "$${"
] @punctuation.special

(variable_reference
  [
    ")"
    "}"
  ] @punctuation.special)

(function_call
  [
    ")"
    "}"
  ] @punctuation.special)
