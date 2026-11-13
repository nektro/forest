; Scopes
; ------

[
  (source_file)
  (function_item)
  (closure_expression)
  (block)
  (if_expression)
  (match_arm)
  (for_expression)
  (while_expression)
  (loop_expression)
  (impl_item)
  (trait_item)
] @local.scope

; Definitions
; -----------

(parameter
  pattern: (identifier) @local.definition.parameter)

(parameter
  pattern: (mut_pattern
    (identifier) @local.definition.parameter))

(closure_parameters
  (identifier) @local.definition.parameter)

(self_parameter
  (self) @local.definition.parameter)

(let_declaration
  pattern: (identifier) @local.definition.var)

(let_declaration
  pattern: (mut_pattern
    (identifier) @local.definition.var))

(let_condition
  pattern: (identifier) @local.definition.var)

(for_expression
  pattern: (identifier) @local.definition.var)

(tuple_pattern
  (identifier) @local.definition.var)

(tuple_struct_pattern
  (identifier) @local.definition.var)

(slice_pattern
  (identifier) @local.definition.var)

(captured_pattern
  .
  (identifier) @local.definition.var)

(field_pattern
  name: (shorthand_field_identifier) @local.definition.var)

(field_pattern
  pattern: (identifier) @local.definition.var)

(type_parameter
  name: (type_identifier) @local.definition.type)

(const_parameter
  name: (identifier) @local.definition.constant)

(function_item
  name: (identifier) @local.definition.function)

; References
; ----------

(identifier) @local.reference

(type_identifier) @local.reference
