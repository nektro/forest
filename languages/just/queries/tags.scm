; Recipes, variables, functions and modules a justfile defines, and the
; recipes and functions it refers to.

(recipe
  (recipe_header
    name: (identifier) @name)) @definition.function

(alias
  name: (identifier) @name) @definition.function

(function_definition
  name: (identifier) @name) @definition.function

(assignment
  name: (identifier) @name) @definition.constant

(export
  name: (identifier) @name) @definition.constant

(module
  name: (identifier) @name) @definition.module

(dependency
  recipe: (identifier) @name) @reference.call

(dependency
  recipe: (module_path
    (identifier) @name .)) @reference.call

(alias
  target: (identifier) @name) @reference.call

(call_expression
  function: (identifier) @name) @reference.call
