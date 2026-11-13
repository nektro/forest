((comment) @injection.content
  (#set! injection.language "comment"))

; The script given to `bash -c`, `sh -c` and `eval` in single quotes.
((command
  name: (command_name
    (word) @_command)
  argument: (word) @_flag
  .
  argument: (raw_string) @injection.content)
  (#any-of? @_command "bash" "sh")
  (#eq? @_flag "-c")
  (#offset! @injection.content 0 1 0 -1)
  (#set! injection.language "bash"))

((command
  name: (command_name
    (word) @_command)
  .
  argument: (raw_string) @injection.content)
  (#eq? @_command "eval")
  (#offset! @injection.content 0 1 0 -1)
  (#set! injection.language "bash"))
