; Highlights for Lua.
;
; When several patterns match a node, the last one wins, so general patterns
; come first and more specific ones after them.

(identifier) @variable

; Names by convention
; -------------------

((identifier) @constant
  (#match? @constant "^_*[A-Z][A-Z0-9_]+$"))

((identifier) @variable.builtin
  (#any-of? @variable.builtin "_G" "_ENV" "_VERSION" "self"))

((identifier) @module.builtin
  (#any-of? @module.builtin
    "coroutine" "debug" "io" "math" "os" "package" "string" "table" "utf8"))

; Fields, parameters and declarations
; -----------------------------------

(dot_index_expression
  field: (identifier) @property)

(field
  name: (identifier) @property)

(parameters
  name: (identifier) @variable.parameter)

(vararg_parameter
  name: (identifier) @variable.parameter)

(attribute
  "<" @punctuation.special
  name: (identifier) @attribute
  ">" @punctuation.special)

(label_statement
  name: (identifier) @label)

(goto_statement
  label: (identifier) @label)

; Functions
; ---------

(function_declaration
  name: (identifier) @function)

(function_declaration
  name: (dot_index_expression
    field: (identifier) @function))

(function_declaration
  name: (method_index_expression
    method: (identifier) @function.method))

(local_function_declaration
  name: (identifier) @function)

(global_function_declaration
  name: (identifier) @function)

(assignment_statement
  left: (variable_list
    .
    name: [
      (identifier) @function
      (dot_index_expression
        field: (identifier) @function)
    ])
  right: (expression_list
    .
    value: (function_definition)))

(local_variable_declaration
  .
  name: (identifier) @function
  value: (expression_list
    .
    value: (function_definition)))

(field
  name: (identifier) @function
  value: (function_definition))

(function_call
  name: [
    (identifier) @function.call
    (dot_index_expression
      field: (identifier) @function.call)
    (method_index_expression
      method: (identifier) @function.method.call)
  ])

(function_call
  name: (identifier) @function.builtin
  (#any-of? @function.builtin
    "assert" "collectgarbage" "dofile" "error" "getmetatable" "ipairs" "load"
    "loadfile" "next" "pairs" "pcall" "print" "rawequal" "rawget" "rawlen"
    "rawset" "require" "select" "setmetatable" "tonumber" "tostring" "type"
    "warn" "xpcall" "getfenv" "setfenv" "loadstring" "module" "unpack"))

; Metamethods
((identifier) @function.builtin
  (#any-of? @function.builtin
    "__add" "__sub" "__mul" "__div" "__mod" "__pow" "__unm" "__idiv" "__band"
    "__bor" "__bxor" "__shl" "__shr" "__bnot" "__concat" "__len" "__eq" "__lt"
    "__le" "__index" "__newindex" "__call" "__tostring" "__name" "__close"
    "__gc" "__mode" "__metatable" "__pairs"))

; Literals
; --------

(nil) @constant.builtin

[
  (true)
  (false)
] @boolean

(number) @number

(string) @string

(escape_sequence) @string.escape

(vararg_expression) @variable.builtin

(vararg_parameter
  "..." @variable.builtin)

(comment) @comment

((comment) @comment.documentation
  (#match? @comment.documentation "^---[^-]"))

; Keywords
; --------

[
  "local"
  "global"
] @keyword

(wildcard) @character.special

"function" @keyword.function

"return" @keyword.return

[
  "if"
  "then"
  "elseif"
  "else"
] @keyword.conditional

[
  "for"
  "while"
  "repeat"
  "until"
  "in"
] @keyword.repeat

(break_statement) @keyword.repeat

[
  "do"
  "end"
  "goto"
] @keyword

[
  "and"
  "or"
  "not"
] @keyword.operator

; Operators and punctuation
; -------------------------

(binary_expression
  operator: _ @operator)

(unary_expression
  operator: _ @operator)

(binary_expression
  operator: [
    "and"
    "or"
  ] @keyword.operator)

(unary_expression
  operator: "not" @keyword.operator)

"=" @operator

[
  ";"
  ":"
  "::"
  ","
  "."
] @punctuation.delimiter

[
  "("
  ")"
  "["
  "]"
  "{"
  "}"
] @punctuation.bracket
