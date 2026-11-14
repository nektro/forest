; Highlights for gitattributes files.
;
; When several patterns match a node, the last one wins, so general patterns
; come first and more specific ones after them.

(comment) @comment

; Patterns
; --------

[
  (pattern)
  (quoted_pattern)
] @string.special.path

[
  (wildcard)
  (bracket_expression)
] @character.special

(escape_sequence) @string.escape

(pattern
  "!" @operator)

; Attributes
; ----------

(attribute_name) @property

; Attributes git itself reads (gitattributes(5)), and the built-in `binary`
; macro.
((attribute_name) @property.builtin
  (#any-of? @property.builtin
    "text" "eol" "crlf" "working-tree-encoding" "ident" "filter" "diff"
    "merge" "conflict-marker-size" "whitespace" "export-ignore"
    "export-subst" "delta" "encoding" "binary"))

(attribute_value) @string

(attribute
  state: _ @operator)

"=" @operator

; Macros
; ------

"[attr]" @keyword

(macro_definition
  name: (attribute_name) @function.macro)
