; Labels are the subroutines and jump targets of a script; `call :label` and
; `goto label` refer to them.

(label) @name @definition.function

(command
  name: (command_name) @_name
  .
  argument: (word) @name
  (#match? @_name "^([Gg][Oo][Tt][Oo]|[Cc][Aa][Ll][Ll])$")
  (#match? @name "^:?[^:]")) @reference.call
