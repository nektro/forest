(function_declaration
  name: [
    (identifier) @name
    (dot_index_expression
      field: (identifier) @name)
  ]) @definition.function

(function_declaration
  name: (method_index_expression
    method: (identifier) @name)) @definition.method

(local_function_declaration
  name: (identifier) @name) @definition.function

(global_function_declaration
  name: (identifier) @name) @definition.function

(assignment_statement
  left: (variable_list
    .
    name: [
      (identifier) @name
      (dot_index_expression
        field: (identifier) @name)
    ])
  right: (expression_list
    .
    value: (function_definition))) @definition.function

(local_variable_declaration
  .
  name: (identifier) @name
  value: (expression_list
    .
    value: (function_definition))) @definition.function

(field
  name: (identifier) @name
  value: (function_definition)) @definition.function

(function_call
  name: [
    (identifier) @name
    (dot_index_expression
      field: (identifier) @name)
    (method_index_expression
      method: (identifier) @name)
  ]) @reference.call
