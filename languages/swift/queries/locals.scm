; Scopes
; ------

[
  (source_file)
  (block)
  (closure_expression)
  (function_declaration)
  (initializer_declaration)
  (subscript_declaration)
  (accessor)
  (member_block)
  (if_statement)
  (guard_statement)
  (for_statement)
  (while_statement)
  (switch_case)
  (catch_clause)
] @local.scope

; Definitions
; -----------

(pattern_binding
  pattern: (identifier) @local.definition.var)

(pattern_binding
  pattern: (tuple_pattern
    element: (identifier) @local.definition.var))

(optional_binding_condition
  pattern: (identifier) @local.definition.var)

(value_binding_pattern
  pattern: (identifier) @local.definition.var)

(for_statement
  pattern: (identifier) @local.definition.var)

(function_declaration
  name: (identifier) @local.definition.function)

(parameter
  name: (identifier) @local.definition.parameter)

(closure_parameter
  name: (identifier) @local.definition.parameter)

(generic_parameter
  name: (type_identifier) @local.definition.type)

; References
; ----------

(identifier) @local.reference
