; Scopes
; ------

[
  (source_file)
  (function_declaration)
  (method_declaration)
  (func_literal)
  (block)
  (if_statement)
  (for_statement)
  (expression_switch_statement)
  (type_switch_statement)
  (expression_case)
  (type_case)
  (default_case)
  (communication_case)
] @local.scope

; Definitions
; -----------

(parameter_declaration
  name: (identifier) @local.definition.parameter)

(variadic_parameter_declaration
  name: (identifier) @local.definition.parameter)

(type_parameter_declaration
  name: (identifier) @local.definition.type)

(function_declaration
  name: (identifier) @local.definition.function)

(type_spec
  name: (type_identifier) @local.definition.type)

(type_alias
  name: (type_identifier) @local.definition.type)

(const_spec
  name: (identifier) @local.definition.constant)

(var_spec
  name: (identifier) @local.definition.var)

(short_var_declaration
  left: (expression_list
    (identifier) @local.definition.var))

(range_clause
  left: (expression_list
    (identifier) @local.definition.var))

(receive_statement
  left: (expression_list
    (identifier) @local.definition.var))

(type_switch_statement
  alias: (expression_list
    (identifier) @local.definition.var))

(import_spec
  name: (package_identifier) @local.definition.namespace)

(labeled_statement
  label: (label_name) @local.definition.label)

; References
; ----------

(identifier) @local.reference

(type_identifier) @local.reference
