; Highlights for C.
;
; When several patterns match a node, the last one wins, so general patterns
; come first and more specific ones after them.

; Identifiers
; -----------

(identifier) @variable

; Names in all caps are usually macros or enum constants.
((identifier) @constant
  (#match? @constant "^[A-Z][A-Z0-9_]*$"))

(type_identifier) @type

(field_identifier) @property

(statement_identifier) @label

(enumerator
  name: (identifier) @constant)

(parameter_declaration
  declarator: (identifier) @variable.parameter)

(parameter_declaration
  declarator: (pointer_declarator
    declarator: (identifier) @variable.parameter))

(parameter_declaration
  declarator: (array_declarator
    declarator: (identifier) @variable.parameter))

; Types
; -----

[
  (primitive_type)
  (sized_type_specifier)
  (bitint_type)
] @type.builtin

; The usual typedefs from the standard and POSIX headers.
((type_identifier) @type.builtin
  (#match? @type.builtin "^(u?int(8|16|32|64|max|ptr)?_t|u?int_(least|fast)(8|16|32|64)_t|size_t|ssize_t|ptrdiff_t|wchar_t|char(8|16|32)_t|max_align_t|nullptr_t|off_t|FILE|va_list)$"))

(macro_type_specifier
  name: (identifier) @function.macro)

; Functions
; ---------

(call_expression
  function: (identifier) @function.call)

(call_expression
  function: (field_expression
    field: (field_identifier) @function.call))

(function_declarator
  declarator: (identifier) @function)

(function_declarator
  declarator: (parenthesized_declarator
    (pointer_declarator
      declarator: (field_identifier) @property)))

; Attributes and macros used as modifiers
; ---------------------------------------

(attribute
  prefix: (identifier) @attribute)

(attribute
  name: (identifier) @attribute)

(macro_modifier) @attribute

(macro_modifier
  function: (identifier) @attribute)

; Preprocessor
; ------------

[
  "#include"
  "#define"
  "#if"
  "#ifdef"
  "#ifndef"
  "#elif"
  "#elifdef"
  "#elifndef"
  (preproc_else)
  (preproc_endif)
  (preproc_directive)
] @keyword.directive

"defined" @keyword.directive

(preproc_def
  name: (identifier) @constant.macro)

(preproc_function_def
  name: (identifier) @function.macro)

(preproc_params
  (identifier) @variable.parameter)

(preproc_ifdef
  name: (identifier) @constant.macro)

(preproc_elifdef
  name: (identifier) @constant.macro)

(preproc_defined
  name: (identifier) @constant.macro)

; Keywords
; --------

[
  "typedef"
  "struct"
  "union"
  "enum"
  "_Generic"
  "static_assert"
  "_Static_assert"
  "__declspec"
  "__based"
  "__extension__"
] @keyword

[
  (storage_class_specifier)
  (type_qualifier)
  (ms_call_modifier)
  (ms_pointer_modifier)
] @keyword.modifier

[
  "__attribute__"
  "__attribute"
  "alignas"
  "_Alignas"
] @keyword.modifier

[
  "typeof"
  "typeof_unqual"
  "__typeof"
  "__typeof__"
  "__typeof_unqual"
  "__typeof_unqual__"
  "_Atomic"
  "_BitInt"
] @keyword.type

[
  "sizeof"
  "alignof"
  "_Alignof"
  "__alignof"
  "__alignof__"
  "__real"
  "__real__"
  "__imag"
  "__imag__"
] @keyword.operator

(asm_expression
  [
    "asm"
    "__asm"
    "__asm__"
  ] @keyword)

(asm_expression
  qualifier: _ @keyword.modifier)

[
  "if"
  "else"
  "switch"
  "case"
  "default"
] @keyword.conditional

[
  "while"
  "do"
  "for"
] @keyword.repeat

[
  "break"
  "continue"
  "goto"
] @keyword

"return" @keyword.return

(linkage_specification
  "extern" @keyword.modifier)

; Literals
; --------

[
  (string_literal)
  (system_lib_string)
] @string

(system_lib_string) @string.special.path

(preproc_include
  path: (string_literal) @string.special.path)

(escape_sequence) @string.escape

(char_literal) @character

(number_literal) @number

((number_literal) @number.float
  (#match? @number.float "^(0[xX][0-9a-fA-F']*\\.?[0-9a-fA-F']*[pP]|[0-9']*\\.|[0-9']+[eE]|\\.[0-9])"))

[
  (true)
  (false)
] @boolean

(null) @constant.builtin

(comment) @comment

((comment) @comment.documentation
  (#match? @comment.documentation "^(///[^/]|/\\*\\*[^*/])"))

; Operators and punctuation
; -------------------------

[
  "="
  "*="
  "/="
  "%="
  "+="
  "-="
  "<<="
  ">>="
  "&="
  "^="
  "|="
  "||"
  "&&"
  "|"
  "^"
  "&"
  "=="
  "!="
  "<"
  ">"
  "<="
  ">="
  "<<"
  ">>"
  "+"
  "-"
  "*"
  "/"
  "%"
  "!"
  "~"
  "++"
  "--"
  "->"
  "?"
] @operator

(conditional_expression
  ":" @operator)

[
  "("
  ")"
  "["
  "]"
  "{"
  "}"
] @punctuation.bracket

[
  ";"
  ","
  "."
  ":"
  "::"
  "..."
] @punctuation.delimiter

(field_expression
  "." @operator)
