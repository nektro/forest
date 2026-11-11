(function_declaration
  name: (identifier) @name) @definition.function

(test_declaration
  name: (_) @name) @definition.test

(variable_declaration
  name: (identifier) @name
  value: [
    (struct_declaration)
    (union_declaration)
    (opaque_declaration)
  ]) @definition.class

(variable_declaration
  name: (identifier) @name
  value: (enum_declaration)) @definition.enum

(variable_declaration
  name: (identifier) @name
  value: (error_set_type)) @definition.type

(container_field
  name: (identifier) @name) @definition.field

(call_expression
  function: [
    (identifier) @name
    (field_expression
      member: (identifier) @name)
  ]) @reference.call
