; Scopes
; ------

[
  (program)
  (class_body)
  (interface_body)
  (enum_body)
  (annotation_type_body)
  (block)
  (method_declaration)
  (constructor_declaration)
  (compact_constructor_declaration)
  (record_declaration)
  (lambda_expression)
  (for_statement)
  (enhanced_for_statement)
  (catch_clause)
  (try_with_resources_statement)
  (switch_rule)
  (switch_block_statement_group)
] @local.scope

; Definitions
; -----------

(local_variable_declaration
  declarator: (variable_declarator
    name: (identifier) @local.definition.var))

(field_declaration
  declarator: (variable_declarator
    name: (identifier) @local.definition.field))

(formal_parameter
  name: (identifier) @local.definition.parameter)

(spread_parameter
  name: (identifier) @local.definition.parameter)

(catch_formal_parameter
  name: (identifier) @local.definition.parameter)

(lambda_expression
  parameters: (identifier) @local.definition.parameter)

(inferred_parameters
  (identifier) @local.definition.parameter)

(enhanced_for_statement
  name: (identifier) @local.definition.var)

(resource
  name: (identifier) @local.definition.var)

(type_pattern
  name: (identifier) @local.definition.var)

(instanceof_expression
  name: (identifier) @local.definition.var)

(method_declaration
  name: (identifier) @local.definition.method)

(type_parameter
  name: (type_identifier) @local.definition.type)

; References
; ----------

(identifier) @local.reference
