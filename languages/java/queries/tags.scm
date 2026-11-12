(class_declaration
  name: (identifier) @name) @definition.class

(record_declaration
  name: (identifier) @name) @definition.class

(enum_declaration
  name: (identifier) @name) @definition.enum

(interface_declaration
  name: (identifier) @name) @definition.interface

(annotation_type_declaration
  name: (identifier) @name) @definition.interface

(method_declaration
  name: (identifier) @name) @definition.method

(constructor_declaration
  name: (identifier) @name) @definition.constructor

(compact_constructor_declaration
  name: (identifier) @name) @definition.constructor

(module_declaration
  name: (_) @name) @definition.module

(method_invocation
  name: (identifier) @name
  arguments: (argument_list) @reference.call)

(object_creation_expression
  type: [
    (type_identifier) @name
    (generic_type
      type: (type_identifier) @name)
    (scoped_type_identifier
      name: (type_identifier) @name)
  ]) @reference.class

(superclass
  [
    (type_identifier) @name
    (generic_type
      type: (type_identifier) @name)
  ]) @reference.class

(super_interfaces
  (type_list
    [
      (type_identifier) @name
      (generic_type
        type: (type_identifier) @name)
    ])) @reference.implementation

(extends_interfaces
  (type_list
    [
      (type_identifier) @name
      (generic_type
        type: (type_identifier) @name)
    ])) @reference.interface
