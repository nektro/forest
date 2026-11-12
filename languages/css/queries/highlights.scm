; Highlights for CSS.
;
; When several patterns match a node, the last one wins, so general patterns
; come first and more specific ones after them.

(comment) @comment

; Selectors
; ---------

(tag_name) @tag

(class_name) @type

(id_name) @constant

(attribute_name) @attribute

(namespace_name) @module

[
  (universal_selector)
  (nesting_selector)
] @character.special

(pseudo_class_selector
  name: (class_name) @type)

(pseudo_element_selector
  name: (tag_name) @type)

(an_plus_b) @number

; Declarations
; ------------

(property_name) @property

(plain_value) @constant

; Custom property references: `var(--gap)`.
((plain_value) @property
  (#match? @property "^--"))

(color_value) @constant

(number_value) @number

(unicode_range) @number

(string_value) @string

(escape_sequence) @string.escape

(function_name) @function

(important) @keyword.modifier

; At-rules
; --------

[
  "@media"
  "@supports"
  "@container"
  "@layer"
  "@scope"
  "@page"
  "@keyframes"
  "@-webkit-keyframes"
  "@-moz-keyframes"
  "@-o-keyframes"
  "@charset"
  "@namespace"
  (at_keyword)
] @keyword

"@import" @keyword.import

[
  "and"
  "or"
  "not"
  "only"
  "of"
] @keyword.operator

[
  "from"
  "to"
  "selector"
] @keyword

(keyword_query) @constant

((keyword_query) @variable
  (#match? @variable "^--"))

(feature_name) @property

[
  (keyframes_name)
  (container_name)
] @label

(layer_name) @module

; Operators and punctuation
; -------------------------

[
  ">"
  "+"
  "~"
  "||"
  "-"
  "*"
  "/"
  "="
  "~="
  "|="
  "^="
  "$="
  "*="
  "<"
  "<="
  ">="
] @operator

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
  "::"
  "."
  "#"
  "|"
] @punctuation.delimiter
