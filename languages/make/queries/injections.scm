((comment) @injection.content
  (#set! injection.language "comment"))

; Each recipe line is run by the shell on its own. References, `$$` and the
; `@`/`-`/`+` prefix are left out of the injected text.
((recipe_line) @injection.content
  (#set! injection.language "bash"))

; $(shell command) and NAME != command
((function_call
  function: (function_name) @_function
  argument: (text) @injection.content)
  (#eq? @_function "shell")
  (#set! injection.language "bash"))

((variable_assignment
  operator: "!="
  value: (text) @injection.content)
  (#set! injection.language "bash"))
