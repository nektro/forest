; Scopes
; ------

[
  (translation_unit)
  (function_definition)
  (compound_statement)
  (for_statement)
  (if_statement)
  (while_statement)
  (do_statement)
  (switch_statement)
  (statement_expression)
] @local.scope

; Definitions
; -----------

(declaration
  declarator: (identifier) @local.definition.var)

(declaration
  declarator: (init_declarator
    declarator: (identifier) @local.definition.var))

(declaration
  declarator: (pointer_declarator
    declarator: (identifier) @local.definition.var))

(declaration
  declarator: (init_declarator
    declarator: (pointer_declarator
      declarator: (identifier) @local.definition.var)))

(declaration
  declarator: (array_declarator
    declarator: (identifier) @local.definition.var))

(declaration
  declarator: (init_declarator
    declarator: (array_declarator
      declarator: (identifier) @local.definition.var)))

(parameter_declaration
  declarator: (identifier) @local.definition.parameter)

(parameter_declaration
  declarator: (pointer_declarator
    declarator: (identifier) @local.definition.parameter))

(parameter_declaration
  declarator: (array_declarator
    declarator: (identifier) @local.definition.parameter))

(function_definition
  declarator: (function_declarator
    declarator: (identifier) @local.definition.function))

(function_definition
  declarator: (pointer_declarator
    declarator: (function_declarator
      declarator: (identifier) @local.definition.function)))

(type_definition
  declarator: (type_identifier) @local.definition.type)

(enumerator
  name: (identifier) @local.definition.constant)

(labeled_statement
  label: (statement_identifier) @local.definition.label)

(preproc_def
  name: (identifier) @local.definition.macro)

(preproc_function_def
  name: (identifier) @local.definition.macro)

; References
; ----------

(identifier) @local.reference

(type_identifier) @local.reference
