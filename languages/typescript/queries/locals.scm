; Scopes
; ------

[
  (program)
  (statement_block)
  (function_declaration)
  (function_expression)
  (generator_function_declaration)
  (generator_function)
  (arrow_function)
  (method_definition)
  (class_body)
  (for_statement)
  (for_in_statement)
  (catch_clause)
  (switch_body)
] @local.scope

; Definitions
; -----------

(variable_declarator
  name: (identifier) @local.definition.var)

(variable_declarator
  name: (object_pattern
    (shorthand_property_identifier_pattern) @local.definition.var))

(variable_declarator
  name: (object_pattern
    (pair_pattern
      value: (identifier) @local.definition.var)))

(variable_declarator
  name: (array_pattern
    (identifier) @local.definition.var))

(for_in_statement
  left: (identifier) @local.definition.var)

(required_parameter
  pattern: (identifier) @local.definition.parameter)

(optional_parameter
  pattern: (identifier) @local.definition.parameter)

(required_parameter
  pattern: (rest_pattern
    (identifier) @local.definition.parameter))

(required_parameter
  pattern: (object_pattern
    (shorthand_property_identifier_pattern) @local.definition.parameter))

(arrow_function
  parameter: (identifier) @local.definition.parameter)

(catch_clause
  parameter: (identifier) @local.definition.parameter)

(function_declaration
  name: (identifier) @local.definition.function)

(generator_function_declaration
  name: (identifier) @local.definition.function)

(class_declaration
  name: (type_identifier) @local.definition.type)

(interface_declaration
  name: (type_identifier) @local.definition.type)

(type_alias_declaration
  name: (type_identifier) @local.definition.type)

(enum_declaration
  name: (identifier) @local.definition.type)

(type_parameter
  name: (type_identifier) @local.definition.type)

(import_clause
  (identifier) @local.definition.import)

(import_specifier
  alias: (identifier) @local.definition.import)

(import_specifier
  !alias
  name: (identifier) @local.definition.import)

(namespace_import
  (identifier) @local.definition.import)

; References
; ----------

(identifier) @local.reference

(type_identifier) @local.reference

(shorthand_property_identifier) @local.reference
