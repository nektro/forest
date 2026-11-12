(module_declaration
  name: (_) @name) @definition.module

(udp_declaration
  name: (_) @name) @definition.module

(function_declaration
  name: (_) @name) @definition.function

(task_declaration
  name: (_) @name) @definition.function

(define_directive
  name: (_) @name) @definition.macro

(module_instantiation
  type: (_) @name) @reference.class

(function_call
  function: [
    (identifier) @name
    (escaped_identifier) @name
    (hierarchical_identifier
      name: (_) @name)
  ]) @reference.call

(task_enable
  name: [
    (identifier) @name
    (escaped_identifier) @name
    (hierarchical_identifier
      name: (_) @name)
  ]) @reference.call
