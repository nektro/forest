((comment) @injection.content
  (#set! injection.language "comment"))

((doc_comment) @injection.content
  (#set! injection.language "comment"))

((container_doc_comment) @injection.content
  (#set! injection.language "comment"))

(asm_expression
  template: [
    (string)
    (multiline_string)
  ] @injection.content
  (#set! injection.language "asm"))
