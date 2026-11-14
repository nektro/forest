; Scopes
; ------

[
  (program)
  (method)
  (singleton_method)
  (class)
  (singleton_class)
  (module)
  (block)
  (do_block)
  (lambda)
] @local.scope

; Definitions
; -----------

(assignment
  left: (identifier) @local.definition.var)

(operator_assignment
  left: (identifier) @local.definition.var)

(left_assignment_list
  (identifier) @local.definition.var)

(rest_assignment
  (identifier) @local.definition.var)

(destructured_left_assignment
  (identifier) @local.definition.var)

(for
  pattern: (identifier) @local.definition.var)

(exception_variable
  (identifier) @local.definition.var)

(parameters
  (identifier) @local.definition.parameter)

(method_parameters
  (identifier) @local.definition.parameter)

(lambda_parameters
  (identifier) @local.definition.parameter)

(block_parameters
  (identifier) @local.definition.parameter)

(destructured_parameter
  (identifier) @local.definition.parameter)

(optional_parameter
  name: (identifier) @local.definition.parameter)

(keyword_parameter
  name: (identifier) @local.definition.parameter)

(splat_parameter
  name: (identifier) @local.definition.parameter)

(hash_splat_parameter
  name: (identifier) @local.definition.parameter)

(block_parameter
  name: (identifier) @local.definition.parameter)

; References
; ----------

(identifier) @local.reference
