; Highlights for TypeScript and JSX.
;
; When several patterns match a node, the last one wins, so general patterns
; come first and more specific ones after them. Keywords come before names:
; a contextual keyword used as a name (`x.type`, `{ get: 1 }`) is a name node
; with the keyword token inside it, at the same position, and the name wins.

; Punctuation
; -----------

[
  ";"
  "."
  ","
  ":"
] @punctuation.delimiter

(optional_chain) @punctuation.delimiter

[
  "("
  ")"
  "["
  "]"
  "{"
  "}"
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

(template_substitution
  [
    "${"
    "}"
  ] @punctuation.special)

(template_type
  [
    "${"
    "}"
  ] @punctuation.special)

; Operators
; ---------

[
  "-"
  "--"
  "-="
  "+"
  "++"
  "+="
  "*"
  "*="
  "**"
  "**="
  "/="
  "%"
  "%="
  "<"
  "<="
  "<<"
  "<<="
  "="
  "=="
  "==="
  "!"
  "!="
  "!=="
  "=>"
  ">"
  ">="
  ">>"
  ">>="
  ">>>"
  ">>>="
  "~"
  "^"
  "&"
  "|"
  "^="
  "&="
  "|="
  "&&"
  "||"
  "??"
  "&&="
  "||="
  "??="
  "..."
  "?"
  "-?:"
  "+?:"
  "?:"
] @operator

; `/` is also a regex delimiter.
(binary_expression
  operator: "/" @operator)

(ternary_expression
  [
    "?"
    ":"
  ] @keyword.conditional.ternary)

(conditional_type
  [
    "?"
    ":"
  ] @keyword.conditional.ternary)

; Keywords
; --------

[
  "as"
  "async"
  "await"
  "class"
  "const"
  "debugger"
  "declare"
  "delete"
  "extends"
  "get"
  "implements"
  "in"
  "infer"
  "instanceof"
  "is"
  "keyof"
  "let"
  "new"
  "of"
  "satisfies"
  "set"
  "typeof"
  "unique"
  "var"
  "void"
  "with"
  "using"
  "asserts"
  "out"
  "accessor"
  "target"
  "meta"
] @keyword

[
  "enum"
  "interface"
  "type"
  "namespace"
  "module"
  "global"
] @keyword.type

[
  "abstract"
  "private"
  "protected"
  "public"
  "readonly"
  "static"
  "override"
] @keyword.modifier

(override_modifier) @keyword.modifier

[
  "function"
] @keyword.function

[
  "return"
  "yield"
] @keyword.return

[
  "if"
  "else"
  "switch"
  "case"
  "default"
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
] @keyword.exception

[
  "import"
  "export"
  "from"
  "require"
  "defer"
  "source"
  "assert"
] @keyword.import

(import) @keyword.import

; Names
; -----

(identifier) @variable

; Names by convention
; -------------------

((identifier) @type
  (#match? @type "^[A-Z]"))

((identifier) @constant
  (#match? @constant "^_*[A-Z][A-Z0-9_]+$"))

((shorthand_property_identifier) @constant
  (#match? @constant "^_*[A-Z][A-Z0-9_]+$"))

((identifier) @variable.builtin
  (#any-of? @variable.builtin
    "arguments" "module" "console" "window" "document" "globalThis"
    "require" "exports"))

((identifier) @function.builtin
  (#eq? @function.builtin "require"))

[
  (this)
  (super)
] @variable.builtin

; Properties
; ----------

(property_identifier) @property

(private_property_identifier) @property

(shorthand_property_identifier) @property

(shorthand_property_identifier_pattern) @variable

; Parameters
; ----------

(required_parameter
  pattern: (identifier) @variable.parameter)

(optional_parameter
  pattern: (identifier) @variable.parameter)

(required_parameter
  pattern: (rest_pattern
    (identifier) @variable.parameter))

(required_parameter
  pattern: (object_pattern
    (shorthand_property_identifier_pattern) @variable.parameter))

(required_parameter
  pattern: (object_pattern
    (pair_pattern
      value: (identifier) @variable.parameter)))

(required_parameter
  pattern: (array_pattern
    (identifier) @variable.parameter))

(arrow_function
  parameter: (identifier) @variable.parameter)

(catch_clause
  parameter: (identifier) @variable.parameter)

; Functions
; ---------

(function_declaration
  name: (identifier) @function)

(function_expression
  name: (identifier) @function)

(generator_function_declaration
  name: (identifier) @function)

(generator_function
  name: (identifier) @function)

(function_signature
  name: (identifier) @function)

(method_definition
  name: (property_identifier) @function.method)

(method_definition
  name: (private_property_identifier) @function.method)

(method_signature
  name: (property_identifier) @function.method)

((method_definition
  name: (property_identifier) @constructor)
  (#eq? @constructor "constructor"))

(pair
  key: (property_identifier) @function.method
  value: [
    (function_expression)
    (arrow_function)
  ])

(variable_declarator
  name: (identifier) @function
  value: [
    (function_expression)
    (arrow_function)
  ])

(assignment_expression
  left: (member_expression
    property: (property_identifier) @function.method)
  right: [
    (function_expression)
    (arrow_function)
  ])

(call_expression
  function: (identifier) @function.call)

(call_expression
  function: (member_expression
    property: [
      (property_identifier)
      (private_property_identifier)
    ] @function.method.call))

(new_expression
  constructor: (identifier) @constructor)

(new_expression
  constructor: (member_expression
    property: (property_identifier) @constructor))

(decorator
  "@" @attribute
  (identifier) @attribute)

(decorator
  (call_expression
    function: (identifier) @attribute))

(decorator
  (member_expression
    property: (property_identifier) @attribute))

(decorator
  (call_expression
    function: (member_expression
      property: (property_identifier) @attribute)))

; Types
; -----

(type_identifier) @type

(predefined_type) @type.builtin

(this_type) @variable.builtin

((type_identifier) @type.builtin
  (#any-of? @type.builtin
    "Array" "ReadonlyArray" "Promise" "Record" "Partial" "Required"
    "Readonly" "Pick" "Omit" "Exclude" "Extract" "NonNullable" "ReturnType"
    "Parameters" "InstanceType" "Awaited" "Map" "Set" "WeakMap" "WeakSet"))

(nested_type_identifier
  module: (identifier) @module)

(internal_module
  name: (identifier) @module)

(internal_module
  name: (nested_identifier
    (identifier) @module))

(module
  name: (identifier) @module)

(import_alias
  name: (identifier) @module)

(namespace_import
  (identifier) @module)

(type_predicate
  name: (identifier) @variable.parameter)

(asserts
  (identifier) @variable.parameter)

(enum_declaration
  name: (identifier) @type)

(enum_body
  name: (property_identifier) @constant)

(enum_assignment
  name: (property_identifier) @constant)

(class
  name: (type_identifier) @type)

; Labels
; ------

(statement_identifier) @label

; Literals
; --------

[
  (string)
  (template_string)
  (template_literal_type)
] @string

(escape_sequence) @string.escape

(regex) @string.regexp

(regex_flags) @character.special

(number) @number

[
  (true)
  (false)
] @boolean

[
  (null)
  (undefined)
] @constant.builtin

[
  (comment)
  (html_comment)
  (hash_bang_line)
] @comment

((comment) @comment.documentation
  (#match? @comment.documentation "^/[*][*][^*].*[*]/$"))

; JSX
; ---

(jsx_opening_element
  name: (identifier) @tag)

(jsx_closing_element
  name: (identifier) @tag)

(jsx_self_closing_element
  name: (identifier) @tag)

; Capitalized names are components.
(jsx_opening_element
  name: (identifier) @type
  (#match? @type "^[A-Z]"))

(jsx_closing_element
  name: (identifier) @type
  (#match? @type "^[A-Z]"))

(jsx_self_closing_element
  name: (identifier) @type
  (#match? @type "^[A-Z]"))

(jsx_opening_element
  name: (member_expression
    property: (property_identifier) @type))

(jsx_closing_element
  name: (member_expression
    property: (property_identifier) @type))

(jsx_self_closing_element
  name: (member_expression
    property: (property_identifier) @type))

(jsx_namespace_name
  (identifier) @tag)

(jsx_attribute
  (property_identifier) @tag.attribute)

(jsx_attribute
  (jsx_namespace_name
    (identifier) @tag.attribute))

(html_character_reference) @string.special

(jsx_opening_element
  [
    "<"
    ">"
  ] @tag.delimiter)

(jsx_closing_element
  [
    "<"
    "/"
    ">"
  ] @tag.delimiter)

(jsx_self_closing_element
  [
    "<"
    "/"
    ">"
  ] @tag.delimiter)

(jsx_expression
  [
    "{"
    "}"
  ] @punctuation.special)
