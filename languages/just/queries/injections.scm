((comment) @injection.content
  (#set! injection.language "comment"))

; Backticks run in the shell.
((backtick
  (command) @injection.content)
  (#set! injection.language "bash"))

; Each line of a recipe without a shebang is run by the shell on its own, so
; each is injected on its own. Interpolations and the `@`/`-` prefix are left
; out. A `set shell` or `[script]` recipe is still read as shell.
((recipe_line) @injection.content
  (#set! injection.language "bash"))

; A shebang recipe's body is one script. Its shebang names the interpreter;
; the body, less the shebang and interpolations, is injected as a whole.
((recipe_body
  (shebang) @_shebang) @injection.content
  (#match? @_shebang "^#!.*[/ ](ba|z|da|k)?sh( |$)")
  (#set! injection.language "bash"))

((recipe_body
  (shebang) @_shebang) @injection.content
  (#match? @_shebang "^#!.*[/ ](python[0-9.]*|uv run.*|pypy[0-9.]*)( |$)")
  (#set! injection.language "python"))

((recipe_body
  (shebang) @_shebang) @injection.content
  (#match? @_shebang "^#!.*[/ ](node|deno|bun|tsx|ts-node)( |$)")
  (#set! injection.language "typescript"))

((recipe_body
  (shebang) @_shebang) @injection.content
  (#match? @_shebang "^#!.*[/ ]ruby( |$)")
  (#set! injection.language "ruby"))

((recipe_body
  (shebang) @_shebang) @injection.content
  (#match? @_shebang "^#!.*[/ ](lua|luajit)[0-9.]*( |$)")
  (#set! injection.language "lua"))

((recipe_body
  (shebang) @_shebang) @injection.content
  (#match? @_shebang "^#!.*[/ ]nix-shell( |$)")
  (#set! injection.language "bash"))
