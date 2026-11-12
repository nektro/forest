; Highlights for Go.
;
; When several patterns match a node, the last one wins, so general patterns
; come first and more specific ones after them.

(identifier) @variable

(type_identifier) @type

(field_identifier) @property

(package_identifier) @module

(label_name) @label

; Comments
; --------

(comment) @comment

; Literals
; --------

(interpreted_string_literal) @string
(raw_string_literal) @string
(escape_sequence) @string.escape
(rune_literal) @character
(int_literal) @number
(imaginary_literal) @number
(float_literal) @number.float

(import_spec
  path: (_) @string.special)

(field_declaration
  tag: (_) @string.special)

; Predeclared identifiers. They can be shadowed, so they are identifiers in
; the tree and recognized here by name.
; --------------------------------------------------------------------------

((identifier) @boolean
  (#any-of? @boolean "true" "false"))

((identifier) @constant.builtin
  (#any-of? @constant.builtin "nil" "iota"))

((type_identifier) @type.builtin
  (#any-of? @type.builtin
    "any" "bool" "byte" "comparable" "complex64" "complex128" "error"
    "float32" "float64" "int" "int8" "int16" "int32" "int64" "rune"
    "string" "uint" "uint8" "uint16" "uint32" "uint64" "uintptr"))

; Conversions such as `string(b)` and arguments such as `make([]int, n)`
; put a type name in expression position.
((identifier) @type.builtin
  (#any-of? @type.builtin
    "any" "bool" "byte" "comparable" "complex64" "complex128" "error"
    "float32" "float64" "int" "int8" "int16" "int32" "int64" "rune"
    "string" "uint" "uint8" "uint16" "uint32" "uint64" "uintptr"))

; Declarations
; ------------

(package_clause
  name: (package_identifier) @module)

(import_spec
  name: (package_identifier) @module)

(function_declaration
  name: (identifier) @function)

(method_declaration
  name: (field_identifier) @function.method)

(method_elem
  name: (field_identifier) @function.method)

(parameter_declaration
  name: (identifier) @variable.parameter)

(variadic_parameter_declaration
  name: (identifier) @variable.parameter)

(type_parameter_declaration
  name: (identifier) @type)

(const_spec
  name: (identifier) @constant)

; Calls
; -----

(call_expression
  function: (identifier) @function.call)

(call_expression
  function: (selector_expression
    field: (field_identifier) @function.method.call))

(call_expression
  function: (index_expression
    operand: (identifier) @function.call))

(call_expression
  function: (index_expression
    operand: (selector_expression
      field: (field_identifier) @function.method.call)))

((call_expression
  function: (identifier) @function.builtin)
  (#any-of? @function.builtin
    "append" "cap" "clear" "close" "complex" "copy" "delete" "imag" "len"
    "make" "max" "min" "new" "panic" "print" "println" "real" "recover"))

; Composite literal keys are usually struct fields.
(keyed_element
  key: (identifier) @property)

; Keywords
; --------

[
  "const"
  "var"
  "import"
  "package"
  "default"
  "range"
  "goto"
] @keyword

(fallthrough_statement) @keyword

[
  "type"
  "struct"
  "interface"
  "map"
  "chan"
] @keyword.type

"func" @keyword.function

"return" @keyword.return

[
  "go"
  "select"
] @keyword.coroutine

"defer" @keyword.exception

[
  "if"
  "else"
  "switch"
  "case"
] @keyword.conditional

[
  "for"
  "break"
  "continue"
] @keyword.repeat

; `.(type)` in a type switch
(type_switch_statement
  "type" @keyword)

; Operators
; ---------

[
  "+" "-" "*" "/" "%"
  "&" "|" "^" "<<" ">>" "&^"
  "+=" "-=" "*=" "/=" "%="
  "&=" "|=" "^=" "<<=" ">>=" "&^="
  "&&" "||" "!"
  "<-" "++" "--"
  "==" "!=" "<" "<=" ">" ">="
  "=" ":="
  "~"
  "..."
] @operator

; Punctuation
; -----------

[
  "(" ")"
  "[" "]"
  "{" "}"
] @punctuation.bracket

[
  "," ";" "." ":"
] @punctuation.delimiter
