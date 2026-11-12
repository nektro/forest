; A binding whose value is a function defines that function.
(binding
  attrpath: (attrpath
    attr: (identifier) @name .)
  expression: (function_expression)) @definition.function

(apply_expression
  function: [
    (variable_expression
      name: (identifier) @name)
    (select_expression
      attrpath: (attrpath
        attr: (identifier) @name .))
  ]) @reference.call
