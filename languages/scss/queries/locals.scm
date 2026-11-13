; Scopes
; ------

[
  (stylesheet)
  (block)
  (mixin_statement)
  (function_statement)
  (each_statement)
  (for_statement)
  (include_statement)
] @local.scope

; Definitions
; -----------

(parameter
  name: (variable) @local.definition.parameter)

(variable_declaration
  name: (variable) @local.definition.var)

(each_statement
  (variable) @local.definition.var)

(for_statement
  variable: (variable) @local.definition.var)

; References
; ----------

(variable) @local.reference
