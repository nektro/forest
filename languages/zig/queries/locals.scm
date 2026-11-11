; Scopes
; ------

[
  (source_file)
  (block)
  (function_declaration)
  (test_declaration)
  (comptime_declaration)
  (struct_declaration)
  (enum_declaration)
  (union_declaration)
  (opaque_declaration)
  (if_statement)
  (if_expression)
  (for_statement)
  (for_expression)
  (while_statement)
  (while_expression)
  (switch_case)
] @local.scope

; Definitions
; -----------

(variable_declaration
  name: (identifier) @local.definition.var)

(function_declaration
  name: (identifier) @local.definition.function)

(parameter
  name: (identifier) @local.definition.parameter)

(payload
  (identifier) @local.definition.var)

(pointer_capture
  (identifier) @local.definition.var)

(container_field
  name: (identifier) @local.definition.field)

; References
; ----------

(identifier) @local.reference
