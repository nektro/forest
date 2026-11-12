((comment) @injection.content
  (#set! injection.language "comment"))

; `load("...")` and `loadstring("...")` take Lua source.
(function_call
  name: (identifier) @_name
  (#any-of? @_name "load" "loadstring")
  arguments: (arguments
    .
    (string
      content: (string_content) @injection.content))
  (#set! injection.language "lua"))
