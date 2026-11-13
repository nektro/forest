; Highlights for SCSS.
;
; When several patterns match a node, the last one wins, so general patterns
; come first and more specific ones after them.

; Values
; ------

(identifier) @constant

; Custom property references: `var(--gap)`.
((identifier) @property
  (#match? @property "^--"))

(interpolated_identifier) @constant

(string) @string

(escape_sequence) @string.escape

(url) @string.special.path

(color) @constant

(number) @number

(unicode_range) @number

(boolean) @boolean

(null) @constant.builtin

(variable) @variable

(module) @module

(keyword_argument
  name: (variable) @variable.parameter)

(parameter
  name: (variable) @variable.parameter)

(call_expression
  function: (identifier) @function.call)

(call_expression
  function: (namespaced_name
    name: (identifier) @function.call))

(if_expression
  "if" @function.builtin)

(if_branch
  condition: (identifier) @keyword.conditional
  (#eq? @keyword.conditional "else"))

; Selectors
; ---------

(tag_name) @tag

(universal_selector) @tag

(nesting_selector) @variable.builtin

(nesting_selector
  (suffix) @type)

(class_name) @type

(id_name) @constant

(placeholder_name) @type

(attribute_name) @property

(pseudo_class_name) @type

(pseudo_element_name) @type

(nth) @number

; The plain parts of a name with interpolation in it.
(tag_name (identifier) @tag)
(class_name (identifier) @type)
(id_name (identifier) @constant)
(placeholder_name (identifier) @type)
(attribute_name (identifier) @property)
(pseudo_class_name (identifier) @type)
(pseudo_element_name (identifier) @type)

(keyframe_selectors) @attribute

(keyframe_selectors
  (number) @number)

; Declarations
; ------------

(property_name) @property

(property_name (identifier) @property)

(variable_declaration
  name: (variable) @variable)

(variable_declaration
  name: (namespaced_variable
    name: (variable) @variable))

(feature_query
  feature: (property_name) @property)

(keyword_query) @constant.builtin

; Definitions
; -----------

(mixin_statement
  name: (identifier) @function)

(function_statement
  name: (identifier) @function)

(include_statement
  name: (identifier) @function.call)

(include_statement
  name: (namespaced_name
    name: (identifier) @function.call))

(use_statement
  namespace: (identifier) @module)

(forward_prefix) @module

(forward_statement
  (identifier) @function)

; Keywords
; --------

[
  "@use"
  "@forward"
  "@import"
] @keyword.import

[
  "@mixin"
  "@function"
] @keyword.function

"@return" @keyword.return

[
  "@if"
  "@else"
  "@elseif"
] @keyword.conditional

(else_if_clause
  "if" @keyword.conditional)

[
  "@each"
  "@for"
  "@while"
] @keyword.repeat

[
  "@error"
  "@warn"
] @keyword.exception

[
  "@include"
  "@content"
  "@extend"
  "@debug"
  "@at-root"
  "@media"
  "@supports"
  "@container"
  "@page"
  "@scope"
  "@charset"
  (keyframes_keyword)
  (at_keyword)
] @keyword.directive

[
  "as"
  "with"
  "without"
  "show"
  "hide"
  "using"
  "in"
  "from"
  "through"
  "to"
  "of"
  "selector"
] @keyword

(keyframe_selectors
  [
    "from"
    "to"
  ] @attribute)

[
  "and"
  "or"
  "not"
  "only"
] @keyword.operator

[
  (important)
  (default_flag)
  (global_flag)
  (optional_flag)
] @keyword.modifier

; Operators and punctuation
; -------------------------

[
  "+"
  "-"
  "*"
  "/"
  "%"
  "=="
  "!="
  "<"
  ">"
  "<="
  ">="
  "="
  "~"
  "~="
  "|="
  "^="
  "$="
  "*="
  "..."
] @operator

(placeholder_selector
  "%" @punctuation.delimiter)

[
  "{"
  "}"
  "("
  ")"
  "["
  "]"
] @punctuation.bracket

[
  ","
  ";"
  ":"
  "."
  "#"
  "::"
] @punctuation.delimiter

(interpolation
  [
    "#{"
    "}"
  ] @punctuation.special)

(comment) @comment

(single_line_comment) @comment
