; Highlights for Windows batch files.
;
; When several patterns match a node, the last one wins, so general patterns
; come first and more specific ones after them. Batch is case-insensitive, so
; name matches spell out both cases.

(comment) @comment

(label) @label

; Keywords
; --------

[
  "if"
  "else"
  "not"
  "exist"
  "defined"
  "errorlevel"
  "cmdextversion"
  "/i"
] @keyword.conditional

[
  "for"
  "in"
  "do"
  "/d"
  "/r"
  "/l"
  "/f"
] @keyword.repeat

"set" @keyword

(set_statement
  option: _ @keyword)

"@" @keyword

; Commands
; --------

(command_name) @function.call

((command_name) @function.builtin
  (#match? @function.builtin "^([Aa][Ss][Ss][Oo][Cc]|[Bb][Rr][Ee][Aa][Kk]|[Cc][Aa][Ll][Ll]|[Cc][Dd]|[Cc][Hh][Dd][Ii][Rr]|[Cc][Ll][Ss]|[Cc][Oo][Ll][Oo][Rr]|[Cc][Oo][Pp][Yy]|[Dd][Aa][Tt][Ee]|[Dd][Ee][Ll]|[Dd][Ii][Rr]|[Ee][Cc][Hh][Oo]|[Ee][Nn][Dd][Ll][Oo][Cc][Aa][Ll]|[Ee][Rr][Aa][Ss][Ee]|[Ee][Xx][Ii][Tt]|[Ff][Tt][Yy][Pp][Ee]|[Gg][Oo][Tt][Oo]|[Mm][Dd]|[Mm][Kk][Dd][Ii][Rr]|[Mm][Kk][Ll][Ii][Nn][Kk]|[Mm][Oo][Vv][Ee]|[Pp][Aa][Tt][Hh]|[Pp][Aa][Uu][Ss][Ee]|[Pp][Oo][Pp][Dd]|[Pp][Rr][Oo][Mm][Pp][Tt]|[Pp][Uu][Ss][Hh][Dd]|[Rr][Dd]|[Rr][Ee][Nn]|[Rr][Ee][Nn][Aa][Mm][Ee]|[Rr][Mm][Dd][Ii][Rr]|[Ss][Ee][Tt][Ll][Oo][Cc][Aa][Ll]|[Ss][Hh][Ii][Ff][Tt]|[Ss][Tt][Aa][Rr][Tt]|[Tt][Ii][Mm][Ee]|[Tt][Ii][Tt][Ll][Ee]|[Tt][Yy][Pp][Ee]|[Vv][Ee][Rr]|[Vv][Ee][Rr][Ii][Ff][Yy]|[Vv][Oo][Ll])$"))

; `echo.`, `echo:` and `echo(` print their text.
((command_name) @function.builtin
  (#match? @function.builtin "^[Ee][Cc][Hh][Oo][.:(/\\\\,;=+\\[\\]]"))

; `goto label`, `call :label`
(command
  name: (command_name) @function.builtin
  .
  argument: (word) @label
  (#match? @function.builtin "^([Gg][Oo][Tt][Oo]|[Cc][Aa][Ll][Ll])$"))

; Options passed to a command: /b, -x, --flag
(command
  argument: (word) @variable.parameter
  (#match? @variable.parameter "^(/|-)"))

; Literals
; --------

[
  (string)
  (value)
] @string

(command_string) @string.special

(escape_sequence) @string.escape

; Variables
; ---------

(variable_name) @variable

[
  (variable)
  (delayed_variable)
] @variable

[
  (parameter)
  (for_variable)
] @variable.parameter

; Operators
; ---------

[
  "&"
  "&&"
  "||"
  "|"
  ">"
  ">>"
  "<"
  ">&"
  "<&"
  "=="
  "equ"
  "neq"
  "lss"
  "leq"
  "gtr"
  "geq"
  "="
] @operator

; Punctuation
; -----------

[
  "("
  ")"
] @punctuation.bracket

[
  ","
  ";"
] @punctuation.delimiter
