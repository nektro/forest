(create_table_statement
  name: (object_reference
    name: (identifier) @name)) @definition.class

(create_view_statement
  name: (object_reference
    name: (identifier) @name)) @definition.class

(create_type_statement
  name: (object_reference
    name: (identifier) @name)) @definition.type

(create_function_statement
  name: (object_reference
    name: (identifier) @name)) @definition.function

(create_trigger_statement
  name: (object_reference
    name: (identifier) @name)) @definition.function

(create_index_statement
  name: (object_reference
    name: (identifier) @name)) @definition.constant

(cte
  name: (identifier) @name) @definition.class

(function_call
  name: (object_reference
    name: (identifier) @name)) @reference.call

(table_reference
  name: (object_reference
    name: (identifier) @name)) @reference.class
