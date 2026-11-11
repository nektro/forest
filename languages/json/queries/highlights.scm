; Highlights for JSON.
;
; When several patterns match a node, the last one wins, so general patterns
; come first and more specific ones after them.

(string) @string

(pair
  key: (string) @property)

(escape_sequence) @string.escape

(number) @number

[
  (true)
  (false)
] @boolean

(null) @constant.builtin

(comment) @comment

[
  "{"
  "}"
  "["
  "]"
] @punctuation.bracket

[
  ":"
  ","
] @punctuation.delimiter
