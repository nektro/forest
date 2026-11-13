; Definitions
; -----------

(function_item
  name: (identifier) @name) @definition.function

(declaration_list
  (function_item
    name: (identifier) @name) @definition.method)

(struct_item
  name: (type_identifier) @name) @definition.class

(union_item
  name: (type_identifier) @name) @definition.class

(enum_item
  name: (type_identifier) @name) @definition.class

(enum_variant
  name: (identifier) @name) @definition.constant

(trait_item
  name: (type_identifier) @name) @definition.interface

(trait_alias_item
  name: (type_identifier) @name) @definition.interface

(type_item
  name: (type_identifier) @name) @definition.type

(field_declaration
  name: (field_identifier) @name) @definition.field

(const_item
  name: (identifier) @name) @definition.constant

(static_item
  name: (identifier) @name) @definition.constant

(mod_item
  name: (identifier) @name) @definition.module

(macro_definition
  name: (identifier) @name) @definition.macro

(impl_item
  type: [
    (type_identifier) @name
    (generic_type type: (type_identifier) @name)
    (scoped_type_identifier name: (type_identifier) @name)
  ]) @reference.implementation

; References
; ----------

(call_expression
  function: [
    (identifier) @name
    (scoped_identifier name: (identifier) @name)
    (field_expression field: (field_identifier) @name)
    (generic_function function: [
      (identifier) @name
      (scoped_identifier name: (identifier) @name)
      (field_expression field: (field_identifier) @name)
    ])
  ]) @reference.call

(macro_invocation
  macro: [
    (identifier) @name
    (scoped_identifier name: (identifier) @name)
  ]) @reference.call

(impl_item
  trait: [
    (type_identifier) @name
    (generic_type type: (type_identifier) @name)
    (scoped_type_identifier name: (type_identifier) @name)
  ]) @reference.implementation
