; Highlights for YAML.
;
; When several patterns match a node, the last one wins, so general patterns
; come first and more specific ones after them.

; Scalars
; -------

[
  (string_scalar)
  (double_quote_scalar)
  (single_quote_scalar)
  (block_scalar)
] @string

(escape_sequence) @string.escape

(null_scalar) @constant.builtin

(boolean_scalar) @boolean

[
  (integer_scalar)
  (float_scalar)
] @number

; Keys
; ----

(block_mapping_pair
  key: (flow_node
    [
      (plain_scalar)
      (double_quote_scalar)
      (single_quote_scalar)
    ] @property))

(flow_pair
  key: (flow_node
    [
      (plain_scalar)
      (double_quote_scalar)
      (single_quote_scalar)
    ] @property))

; The merge key.
(block_mapping_pair
  key: (flow_node
    (plain_scalar
      (string_scalar) @keyword
      (#eq? @keyword "<<"))))

; A key that is a typed scalar (`1: x`, `true: y`) is still a key.
(block_mapping_pair
  key: (flow_node
    (plain_scalar
      [
        (null_scalar)
        (boolean_scalar)
        (integer_scalar)
        (float_scalar)
      ] @property)))

; Properties and aliases
; ----------------------

(tag) @type

(anchor
  "&" @punctuation.special
  (anchor_name) @label)

(alias
  "*" @punctuation.special
  (alias_name) @label)

; Directives
; ----------

[
  "%YAML"
  "%TAG"
] @keyword.directive

(reserved_directive
  "%" @keyword.directive
  (directive_name) @keyword.directive)

(yaml_version) @number

(tag_handle) @type

(tag_prefix) @string.special

(directive_parameter) @string

; Punctuation
; -----------

[
  "---"
  "..."
] @punctuation.special

[
  "-"
  "?"
  ":"
  ","
] @punctuation.delimiter

[
  "["
  "]"
  "{"
  "}"
] @punctuation.bracket

(comment) @comment
