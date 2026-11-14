; Scopes
; ------

[
  (module)
  (function_definition)
  (lambda)
  (class_definition)
  (list_comprehension)
  (dictionary_comprehension)
  (set_comprehension)
  (generator_expression)
] @local.scope

; Definitions
; -----------

(parameters
  (identifier) @local.definition.parameter)

(lambda_parameters
  (identifier) @local.definition.parameter)

(default_parameter
  name: (identifier) @local.definition.parameter)

(typed_parameter
  (identifier) @local.definition.parameter)

(typed_default_parameter
  name: (identifier) @local.definition.parameter)

(list_splat_pattern
  (identifier) @local.definition.parameter)

(dictionary_splat_pattern
  (identifier) @local.definition.parameter)

(type_parameter
  name: (identifier) @local.definition.type)

(function_definition
  name: (identifier) @local.definition.function)

(class_definition
  name: (identifier) @local.definition.type)

(assignment
  left: (identifier) @local.definition.var)

(assignment
  left: (expression_list
    (identifier) @local.definition.var))

(named_expression
  name: (identifier) @local.definition.var)

(for_statement
  left: (identifier) @local.definition.var)

(for_statement
  left: (expression_list
    (identifier) @local.definition.var))

(for_in_clause
  left: (identifier) @local.definition.var)

(for_in_clause
  left: (expression_list
    (identifier) @local.definition.var))

(with_item
  alias: (identifier) @local.definition.var)

(except_clause
  alias: (identifier) @local.definition.var)

(except_group_clause
  alias: (identifier) @local.definition.var)

(as_pattern
  alias: (identifier) @local.definition.var)

(aliased_import
  alias: (identifier) @local.definition.import)

(import_statement
  name: (dotted_name
    .
    (identifier) @local.definition.import))

(import_from_statement
  name: (dotted_name
    (identifier) @local.definition.import))

; References
; ----------

(identifier) @local.reference
