(class_declaration
  name: (type_identifier) @name) @definition.class

(struct_declaration
  name: (type_identifier) @name) @definition.class

(actor_declaration
  name: (type_identifier) @name) @definition.class

(enum_declaration
  name: (type_identifier) @name) @definition.enum

(protocol_declaration
  name: (type_identifier) @name) @definition.interface

(extension_declaration
  type: (_) @name) @definition.class

(typealias_declaration
  name: (type_identifier) @name) @definition.type

(associatedtype_declaration
  name: (type_identifier) @name) @definition.type

(function_declaration
  name: (_) @name) @definition.function

(macro_declaration
  name: (identifier) @name) @definition.macro

(member_block
  (function_declaration
    name: (_) @name) @definition.method)

(enum_case_element
  name: (identifier) @name) @definition.constant

(member_block
  (variable_declaration
    binding: (pattern_binding
      pattern: (identifier) @name)) @definition.field)

(call_expression
  function: [
    (identifier) @name
    (member_expression
      name: (identifier) @name)
  ]) @reference.call
