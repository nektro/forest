(function_declaration
  name: (identifier) @name) @definition.function

(method_declaration
  name: (field_identifier) @name) @definition.method

(method_elem
  name: (field_identifier) @name) @definition.interface

(type_spec
  name: (type_identifier) @name
  type: (struct_type)) @definition.class

(type_spec
  name: (type_identifier) @name
  type: (interface_type)) @definition.interface

(type_spec
  name: (type_identifier) @name) @definition.type

(type_alias
  name: (type_identifier) @name) @definition.type

(field_declaration
  name: (field_identifier) @name) @definition.field

(package_clause
  name: (package_identifier) @name) @definition.module

(const_spec
  name: (identifier) @name) @definition.constant

(call_expression
  function: [
    (identifier) @name
    (selector_expression
      field: (field_identifier) @name)
    (index_expression
      operand: [
        (identifier) @name
        (selector_expression
          field: (field_identifier) @name)
      ])
  ]) @reference.call

(type_identifier) @name @reference.type
