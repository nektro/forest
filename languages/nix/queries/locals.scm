; Scopes
; ------

[
  (source_code)
  (function_expression)
  (let_expression)
  (let_attrset_expression)
  (rec_attrset_expression)
] @local.scope

; Definitions
; -----------

(function_expression
  universal: (identifier) @local.definition.parameter)

(formal
  name: (identifier) @local.definition.parameter)

; `let x = …;`, `rec { x = …; }`: the first attribute of a binding names a
; variable in the scope.
(let_expression
  (binding_set
    binding: (binding
      attrpath: (attrpath
        .
        attr: (identifier) @local.definition.var))))

(let_attrset_expression
  (binding_set
    binding: (binding
      attrpath: (attrpath
        .
        attr: (identifier) @local.definition.var))))

(rec_attrset_expression
  (binding_set
    binding: (binding
      attrpath: (attrpath
        .
        attr: (identifier) @local.definition.var))))

; `inherit x;` and `inherit (e) x;` in a let or rec set.
(let_expression
  (binding_set
    binding: (_
      attrs: (inherited_attrs
        attr: (identifier) @local.definition.var))))

(rec_attrset_expression
  (binding_set
    binding: (_
      attrs: (inherited_attrs
        attr: (identifier) @local.definition.var))))

; References
; ----------

(variable_expression
  name: (identifier) @local.reference)
