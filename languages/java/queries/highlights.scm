; Highlights for Java.
;
; When several patterns match a node, the last one wins, so general patterns
; come first and more specific ones after them.

(identifier) @variable

(this) @variable.builtin

(super) @variable.builtin

; Names by convention
; -------------------

((identifier) @type
  (#match? @type "^[A-Z]"))

((identifier) @constant
  (#match? @constant "^_*[A-Z][A-Z0-9_]+$"))

; Types
; -----

(type_identifier) @type

(primitive_type) @type.builtin

(void_type) @type.builtin

((type_identifier) @type.builtin
  (#eq? @type.builtin "var"))

(class_declaration
  name: (identifier) @type)

(record_declaration
  name: (identifier) @type)

(enum_declaration
  name: (identifier) @type)

(interface_declaration
  name: (identifier) @type)

(annotation_type_declaration
  name: (identifier) @type)

; Methods and constructors
; ------------------------

(method_declaration
  name: (identifier) @function.method)

(annotation_type_element_declaration
  name: (identifier) @function.method)

(method_invocation
  name: (identifier) @function.method.call)

(method_reference
  name: (identifier) @function.method)

(constructor_declaration
  name: (identifier) @constructor)

(compact_constructor_declaration
  name: (identifier) @constructor)

(explicit_constructor_invocation
  constructor: (_) @constructor)

(object_creation_expression
  type: (type_identifier) @constructor)

(object_creation_expression
  type: (generic_type
    type: (type_identifier) @constructor))

(object_creation_expression
  type: (scoped_type_identifier
    name: (type_identifier) @constructor))

; Variables, fields and parameters
; --------------------------------

(field_declaration
  declarator: (variable_declarator
    name: (identifier) @property))

(field_access
  field: (identifier) @property)

(formal_parameter
  name: (identifier) @variable.parameter)

(spread_parameter
  name: (identifier) @variable.parameter)

(catch_formal_parameter
  name: (identifier) @variable.parameter)

(lambda_expression
  parameters: (identifier) @variable.parameter)

(inferred_parameters
  (identifier) @variable.parameter)

(element_value_pair
  key: (identifier) @variable.member)

(enum_constant
  name: (identifier) @constant)

((field_access
  field: (identifier) @constant)
  (#match? @constant "^_*[A-Z][A-Z0-9_]+$"))

((variable_declarator
  name: (identifier) @constant)
  (#match? @constant "^_*[A-Z][A-Z0-9_]+$"))

; Annotations, packages and labels
; --------------------------------

; Dotted names outside expressions (packages, imports, modules, annotation
; names) are scoped_identifiers. Their parts are packages or modules, except
; for a capitalized last part, which names a type.

(package_declaration
  name: (identifier) @module)

(import_declaration
  [
    name: (identifier)
    module: (identifier)
  ] @module)

(module_declaration
  name: (identifier) @module)

(_
  [
    module: (identifier)
    package: (identifier)
  ] @module)

(scoped_identifier
  [
    scope: (identifier)
    name: (identifier)
  ] @module)

((scoped_identifier
  name: (identifier) @type)
  (#match? @type "^[A-Z]"))

((scoped_identifier
  name: (identifier) @constant)
  (#match? @constant "^_*[A-Z][A-Z0-9_]+$"))

(annotation
  "@" @attribute
  name: (identifier) @attribute)

(annotation
  "@" @attribute
  name: (scoped_identifier
    name: (identifier) @attribute))

(annotation_type_declaration
  "@" @keyword.type)

(asterisk) @character.special

(labeled_statement
  label: (identifier) @label)

(break_statement
  label: (identifier) @label)

(continue_statement
  label: (identifier) @label)

; Literals
; --------

(string_literal) @string

(text_block) @string

(escape_sequence) @string.escape

(character_literal) @character

(integer_literal) @number

(floating_point_literal) @number.float

[
  (true)
  (false)
] @boolean

(null_literal) @constant.builtin

(underscore_pattern) @variable.builtin

; Comments
; --------

[
  (line_comment)
  (block_comment)
] @comment

((block_comment) @comment.documentation
  (#match? @comment.documentation "^/[*][*][^*/]"))

((line_comment) @comment.documentation
  (#match? @comment.documentation "^///"))

; Keywords
; --------

[
  "assert"
  "default"
  "extends"
  "implements"
  "permits"
  "package"
  "to"
  "with"
  "when"
] @keyword

[
  "class"
  "record"
  "enum"
  "interface"
] @keyword.type

[
  "abstract"
  "final"
  "native"
  "non-sealed"
  "private"
  "protected"
  "public"
  "sealed"
  "static"
  "strictfp"
  "synchronized"
  "transient"
  "volatile"
  "open"
  "value"
] @keyword.modifier

(requires_modifier) @keyword.modifier

[
  "import"
  "module"
  "requires"
  "exports"
  "opens"
  "uses"
  "provides"
] @keyword.import

"new" @keyword.operator

"instanceof" @keyword.operator

[
  "return"
  "yield"
] @keyword.return

[
  "if"
  "else"
  "switch"
  "case"
] @keyword.conditional

[
  "for"
  "while"
  "do"
  "break"
  "continue"
] @keyword.repeat

[
  "try"
  "catch"
  "finally"
  "throw"
  "throws"
] @keyword.exception

(wildcard
  [
    "extends"
    "super"
  ] @keyword)

(class_literal
  "class" @keyword)

; Operators
; ---------

[
  "+" "-" "*" "/" "%" "++" "--" "!" "~" "&" "|" "^" "<<" ">>" ">>>"
  "&&" "||" "==" "!=" "<" "<=" ">" ">=" "=" "+=" "-=" "*=" "/=" "%="
  "&=" "|=" "^=" "<<=" ">>=" ">>>=" "->" "::" "?"
] @operator

(wildcard
  "?" @character.special)

; Punctuation
; -----------

[
  "(" ")" "[" "]" "{" "}"
] @punctuation.bracket

(type_arguments
  [
    "<"
    ">"
  ] @punctuation.bracket)

(type_parameters
  [
    "<"
    ">"
  ] @punctuation.bracket)

[
  ";" "," "." ":" "..."
] @punctuation.delimiter

(ternary_expression
  ":" @operator)
