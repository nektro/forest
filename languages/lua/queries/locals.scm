; Scopes
; ------

[
  (chunk)
  (do_statement)
  (while_statement)
  (repeat_statement)
  (if_statement)
  (elseif_statement)
  (else_statement)
  (for_statement)
  (function_declaration)
  (local_function_declaration)
  (global_function_declaration)
  (function_definition)
] @local.scope

; Definitions
; -----------

(local_variable_declaration
  name: (identifier) @local.definition.var)

(local_function_declaration
  name: (identifier) @local.definition.function)

(for_numeric_clause
  name: (identifier) @local.definition.var)

(for_generic_clause
  (name_list
    name: (identifier) @local.definition.var))

(parameters
  name: (identifier) @local.definition.parameter)

(vararg_parameter
  name: (identifier) @local.definition.parameter)

(label_statement
  name: (identifier) @local.definition.label)

; References
; ----------

(identifier) @local.reference
