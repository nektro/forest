; Targets, variables and defines a makefile defines, and the variables and
; `$(call ...)`ed defines it refers to.

(rule
  targets: (targets
    (word) @name)) @definition.function

(variable_assignment
  name: (word) @name) @definition.constant

(define_directive
  name: (word) @name) @definition.macro

(variable_reference
  name: (variable_name) @name) @reference.constant

(function_call
  function: (function_name) @_call
  .
  argument: (text) @name
  (#eq? @_call "call")) @reference.call
