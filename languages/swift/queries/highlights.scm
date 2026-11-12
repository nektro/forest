; Highlights for Swift.
;
; When several patterns match a node, the last one wins, so general patterns
; come first and more specific ones after them.

(identifier) @variable

; Types
; -----

(type_identifier) @type

((type_identifier) @type.builtin
  (#any-of? @type.builtin
    "Int" "Int8" "Int16" "Int32" "Int64" "Int128" "UInt" "UInt8" "UInt16"
    "UInt32" "UInt64" "UInt128" "Float" "Float16" "Float80" "Double" "Bool"
    "String" "Character" "Substring" "Void" "Never" "Any" "AnyObject"
    "Optional" "Array" "Dictionary" "Set"))

((type_identifier) @type.builtin
  (#eq? @type.builtin "Self"))

((identifier) @type.builtin
  (#eq? @type.builtin "Self"))

; Capitalized names in expressions are usually types: `String(x)`, `Foo.bar`.
((identifier) @type
  (#match? @type "^[A-Z]"))

(metatype_type
  kind: _ @keyword.type)

; Comments
; --------

(comment) @comment
(multiline_comment) @comment

((comment) @comment.documentation
  (#match? @comment.documentation "^///"))

((multiline_comment) @comment.documentation
  (#match? @comment.documentation "^/\\*\\*"))

(shebang) @keyword.directive

; Literals
; --------

[
  (string_literal)
  (multiline_string_literal)
  (raw_string_literal)
] @string

(regex_literal) @string.regexp

(escape_sequence) @string.escape

(integer_literal) @number
(float_literal) @number.float
(version) @number.float
(boolean_literal) @boolean
(nil_literal) @constant.builtin

; Variables and parameters
; ------------------------

(self_expression) @variable.builtin
(super_expression) @variable.builtin

((identifier) @variable.builtin
  (#match? @variable.builtin "^\\$[0-9]+$"))

(parameter
  name: (identifier) @variable.parameter)

(closure_parameter
  name: (identifier) @variable.parameter)

; Argument labels, parameter external names and tuple labels.
(argument
  label: (identifier) @label)

(tuple_element
  label: (identifier) @label)

(tuple_pattern_element
  label: (identifier) @label)

(parameter
  external_name: (identifier) @label)

(closure_parameter
  external_name: (identifier) @label)

(enum_case_parameter
  external_name: (identifier) @label)

(enum_case_parameter
  name: (identifier) @variable.parameter)

(tuple_type_element
  name: (identifier) @variable.parameter)

(argument_names
  name: (identifier) @label)

(labeled_trailing_closure
  label: (identifier) @label)

(labeled_statement
  label: (identifier) @label)

(break_statement
  label: (identifier) @label)

(continue_statement
  label: (identifier) @label)

(attribute_argument
  label: (identifier) @label)

; Properties
; ----------

(member_expression
  name: (identifier) @property)

(implicit_member_expression
  name: (identifier) @constant)

(pattern_binding
  pattern: (identifier) @variable)

(member_block
  (variable_declaration
    binding: (pattern_binding
      pattern: (identifier) @property)))

(key_path_expression
  member: (identifier) @property)

(enum_case_element
  name: (identifier) @constant)

(enum_case_pattern
  name: (identifier) @constant)

; Functions
; ---------

(function_declaration
  name: (identifier) @function)

(function_declaration
  name: (operator) @operator)

(macro_declaration
  name: (identifier) @function.macro)

(call_expression
  function: (identifier) @function.call)

(call_expression
  function: (member_expression
    name: (identifier) @function.method.call))

(call_expression
  function: (specialize_expression
    expression: (identifier) @function.call))

(function_reference
  function: (identifier) @function.call)

(function_reference
  function: (member_expression
    name: (identifier) @function.method.call))

; `String(x)`, `Foo.Bar(x)`: initializer calls.
((call_expression
  function: (identifier) @constructor)
  (#match? @constructor "^[A-Z]"))

((call_expression
  function: (member_expression
    name: (identifier) @constructor))
  (#match? @constructor "^[A-Z]"))

; `.init(...)`, `super.init()`, `Foo.init`
((member_expression
  name: (identifier) @constructor)
  (#eq? @constructor "init"))

((implicit_member_expression
  name: (identifier) @constructor)
  (#eq? @constructor "init"))

((member_expression
  name: (identifier) @variable.builtin)
  (#eq? @variable.builtin "self"))

(macro_expansion) @function.macro

(macro_expansion_declaration
  macro: (macro_expansion) @function.macro)

; Attributes
; ----------

(attribute
  "@" @attribute
  name: (_) @attribute)

(attribute
  name: (member_type
    (type_identifier) @attribute))

(attribute
  name: (generic_type
    name: (type_identifier) @attribute))

; Declarations of types
; ---------------------

(typealias_declaration
  name: (type_identifier) @type.definition)

(associatedtype_declaration
  name: (type_identifier) @type.definition)

(precedence_group_declaration
  name: (identifier) @type)

(precedence_group_attribute
  name: (identifier) @property)

(precedence_group_attribute
  value: (identifier) @constant)

(operator_declaration
  precedence_group: (identifier) @type)

(import_path
  (identifier) @module)

; Keywords
; --------

[
  "import"
  "typealias"
  "associatedtype"
  "operator"
  "precedencegroup"
  "let"
  "var"
  "subscript"
  "macro"
  "where"
  "in"
  "defer"
  "fallthrough"
] @keyword

[
  "struct"
  "class"
  "actor"
  "enum"
  "protocol"
  "extension"
  "some"
  "any"
] @keyword.type

[
  "func"
] @keyword.function

[
  "init"
  "deinit"
] @constructor

[
  "as"
  "is"
] @keyword.operator

[
  "return"
] @keyword.return

[
  "if"
  "else"
  "guard"
  "switch"
  "case"
  "default"
] @keyword.conditional

[
  "for"
  "while"
  "repeat"
  "break"
  "continue"
] @keyword.repeat

[
  "throw"
  "throws"
  "rethrows"
  "try"
  "catch"
  "do"
] @keyword.exception

[
  "async"
  "await"
] @keyword.coroutine

; `repeat each x` is a pack expansion, not a loop.
(pack_expansion_expression
  "repeat" @keyword)

(pack_expansion_type
  "repeat" @keyword)

[
  "each"
  "consume"
  "copy"
  "unsafe"
] @keyword

(modifier) @keyword.modifier
(type_specifier) @keyword.modifier

(capture_item
  specifier: _ @keyword.modifier)

(accessor
  [
    "get"
    "set"
    "willSet"
    "didSet"
    "_read"
    "_modify"
    "unsafeAddress"
    "unsafeMutableAddress"
    "borrow"
    "mutate"
    "mutating"
    "nonmutating"
    "__consuming"
    "borrowing"
    "consuming"
  ] @keyword)

(import_declaration
  kind: _ @keyword.type)

(generic_parameter
  [
    "each"
    "let"
  ] @keyword)

[
  "#if"
  "#elseif"
  "#else"
  "#endif"
] @keyword.directive

[
  "#available"
  "#unavailable"
] @keyword

(wildcard) @variable.builtin

; Operators
; ---------

[
  "!" "!=" "!==" "%" "%=" "&" "&&" "&*" "&*=" "&+" "&+=" "&-" "&-=" "&<<"
  "&<<=" "&=" "&>>" "&>>=" "*" "*=" "+" "+=" "-" "-=" "->" "..." "..<" "/"
  "/=" "<" "<<" "<<=" "<=" "=" "==" "===" ">" ">=" ">>" ">>=" "?" "??" "^"
  "^=" "|" "|=" "||" "~" "~=" ".==" ".!=" ".<" ".<=" ".>" ".>="
] @operator

(custom_operator) @operator
(operator) @operator

(key_path_expression
  "\\" @operator)

; Punctuation
; -----------

[
  "(" ")" "[" "]" "{" "}"
] @punctuation.bracket

[
  ";" "," "." ":"
] @punctuation.delimiter

; Generic angle brackets are brackets, not comparisons.
(type_arguments
  [
    "<"
    ">"
  ] @punctuation.bracket)

(generic_parameter_clause
  [
    "<"
    ">"
  ] @punctuation.bracket)

(primary_associated_types
  [
    "<"
    ">"
  ] @punctuation.bracket)

; Interpolation delimiters, `\(` and `)`.
(interpolation
  "\\(" @punctuation.special
  ")" @punctuation.special)
