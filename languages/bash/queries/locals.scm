; Scopes
; ------

; Variables are global unless declared with `local` (or `declare` and
; `typeset`) inside a function, so a function body is a scope only for those.
[
  (program)
  (function_definition)
] @local.scope

; Definitions
; -----------

(variable_assignment
  name: (variable_name) @local.definition.var)

(variable_assignment
  name: (subscript
    name: (variable_name) @local.definition.var))

(declaration_command
  (variable_name) @local.definition.var)

(for_statement
  variable: (variable_name) @local.definition.var)

(function_definition
  name: (word) @local.definition.function)

; References
; ----------

(simple_expansion
  (variable_name) @local.reference)

(expansion
  (variable_name) @local.reference)

(expansion
  (subscript
    name: (variable_name) @local.reference))

; Bare names in arithmetic: $(( n + 1 )), (( i++ )).
(arithmetic_expansion
  (variable_name) @local.reference)

(arithmetic_command
  (variable_name) @local.reference)

([
  (binary_expression)
  (unary_expression)
  (postfix_expression)
  (ternary_expression)
  (parenthesized_expression)
]
  (variable_name) @local.reference)
