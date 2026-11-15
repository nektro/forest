; Highlights for Zig.
;
; When several patterns match a node, the last one wins, so general patterns
; come first and more specific ones after them.

(identifier) @variable

; Types by convention
; -------------------

((identifier) @type
  (#match? @type "^[A-Z][a-zA-Z0-9_]*$")
  (#not-match? @type "^[A-Z][A-Z0-9_]+$"))

((identifier) @constant
  (#match? @constant "^[A-Z][A-Z0-9_]+$"))

; Comments
; --------

(doc_comment) @comment.documentation
(container_doc_comment) @comment.documentation
(comment) @comment

; Literals
; --------

(string) @string
(multiline_string) @string
(escape_sequence) @string.escape
(character) @character
(integer) @number
(float) @number.float

((identifier) @constant.builtin
  (#any-of? @constant.builtin "null" "undefined"))

((identifier) @boolean
  (#any-of? @boolean "true" "false"))

(unreachable) @constant.builtin

; Builtins
; --------

(builtin_identifier) @function.builtin

((identifier) @type.builtin
  (#match? @type.builtin
    "^(i|u)[0-9]+$|^(isize|usize|c_char|c_short|c_ushort|c_int|c_uint|c_long|c_ulong|c_longlong|c_ulonglong|c_longdouble|f16|f32|f64|f80|f128|bool|anyopaque|void|noreturn|type|anyerror|comptime_int|comptime_float)$"))

(anyframe) @type.builtin
(anytype) @type.builtin

; Declarations
; ------------

(function_declaration
  name: (identifier) @function)

(test_declaration
  name: (identifier) @function)

(parameter
  name: (identifier) @variable.parameter)

(container_field
  name: (identifier) @property)

; Enum members and other bare fields: `a,` / `a = 1,` in an enum or union.
(enum_declaration
  (container_field
    type: (identifier) @constant))

(variable_declaration
  name: (identifier) @type
  value: [
    (struct_declaration)
    (enum_declaration)
    (union_declaration)
    (opaque_declaration)
    (error_set_type)
  ])

(variable_declaration
  name: (identifier) @function
  value: (function_type))

; Fields, enum literals and errors
; --------------------------------

(field_expression
  member: (identifier) @property)

(field_initializer
  name: (identifier) @property)

(enum_literal
  name: (identifier) @constant)

(error_value
  name: (identifier) @constant)

(error_set_type
  (identifier) @constant)

; Calls
; -----

(call_expression
  function: (identifier) @function.call)

(call_expression
  function: (field_expression
    member: (identifier) @function.method.call))

; Labels and captures
; -------------------

; Block labels on blocks, loops and switches, and break/continue targets.
(_
  label: (identifier) @label)

(payload
  (identifier) @variable)

(pointer_capture
  (identifier) @variable)

; Keywords
; --------

[
  "asm"
  "test"
  "usingnamespace"
] @keyword

[
  "const"
  "var"
] @keyword

[
  "struct"
  "enum"
  "union"
  "opaque"
  "error"
] @keyword.type

(tagged) @keyword.type

[
  "fn"
] @keyword.function

[
  "and"
  "or"
  "orelse"
] @keyword.operator

[
  "return"
] @keyword.return

[
  "if"
  "else"
  "switch"
] @keyword.conditional

(else) @keyword.conditional

[
  "for"
  "while"
  "break"
  "continue"
] @keyword.repeat

[
  "try"
  "catch"
  "errdefer"
] @keyword.exception

[
  "defer"
  "suspend"
  "nosuspend"
  "resume"
] @keyword.coroutine

[
  "pub"
  "export"
  "extern"
  "inline"
  "noinline"
  "threadlocal"
  "comptime"
  "noalias"
  "volatile"
  "allowzero"
  "align"
  "addrspace"
  "linksection"
  "callconv"
  "bitpack"
  "packed"
  "anyframe"
] @keyword.modifier

(container_layout) @keyword.modifier

; Operators
; ---------

[
  "!" "!=" "%" "%=" "&" "&=" "*" "*%" "*%=" "*=" "*|" "*|=" "+" "+%" "+%="
  "++" "+=" "+|" "+|=" "-" "-%" "-%=" "-=" "->" "-|" "-|=" "/" "/=" "<"
  "<<" "<<=" "<<|" "<<|=" "<=" "=" "==" "=>" ">" ">=" ">>" ">>=" "?" "^"
  "^=" "|=" "||" "~" ".." "..." ".*"
] @operator

(variadic_parameter) @operator

; Punctuation
; -----------

[
  "(" ")" "[" "]" "{" "}" "[*"
] @punctuation.bracket

[
  ";" "," "." ":"
] @punctuation.delimiter

(payload
  "|" @punctuation.bracket)

"|" @operator

(pointer_type
  "c" @keyword.modifier)
