((comment) @injection.content
  (#set! injection.language "comment"))

; regexp.MustCompile(`...`), regexp.Compile("...") and friends
(call_expression
  function: (selector_expression
    operand: (identifier) @_package
    field: (field_identifier) @_function)
  arguments: (argument_list
    .
    [
      (raw_string_literal
        (string_content) @injection.content)
      (interpreted_string_literal
        (string_content) @injection.content)
    ])
  (#eq? @_package "regexp")
  (#any-of? @_function "Compile" "CompilePOSIX" "MatchString" "MustCompile" "MustCompilePOSIX")
  (#set! injection.language "regex"))
