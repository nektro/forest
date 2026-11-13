((comment) @injection.content
  (#set! injection.language "comment"))

(asm_expression
  template: [
    (string_literal)
    (concatenated_string)
  ] @injection.content
  (#set! injection.language "asm"))
