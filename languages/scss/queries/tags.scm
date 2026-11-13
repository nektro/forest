(mixin_statement
  name: (identifier) @name) @definition.macro

(function_statement
  name: (identifier) @name) @definition.function

(stylesheet
  (variable_declaration
    name: (variable) @name) @definition.constant)

(stylesheet
  (rule_set
    selectors: (selectors
      (placeholder_selector
        name: (placeholder_name) @name))) @definition.class)

(include_statement
  name: [
    (identifier) @name
    (namespaced_name
      name: (identifier) @name)
  ]) @reference.call

(call_expression
  function: [
    (identifier) @name
    (namespaced_name
      name: (identifier) @name)
  ]) @reference.call

(extend_statement
  (selectors
    (placeholder_selector
      name: (placeholder_name) @name))) @reference.class
