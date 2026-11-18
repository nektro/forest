; Highlights for KDL.
;
; When several patterns match a node, the last one wins, so general patterns
; come first and more specific ones after them.

; Values
; ------

; A bare identifier in value position is a string.
[
  (identifier)
  (string)
  (raw_string)
] @string

(escape_sequence) @string.escape

(number) @number

(boolean) @boolean

(null) @constant.builtin

; Names
; -----

(node
  name: (_) @tag)

(property
  key: (_) @property)

(type
  (_) @type)

; Punctuation
; -----------

[
  "{"
  "}"
  "("
  ")"
] @punctuation.bracket

"=" @operator

";" @punctuation.delimiter

"\\" @punctuation.special

; Comments
; --------

[
  (line_comment)
  (block_comment)
] @comment

; `/-` comments out what follows it. The innermost capture wins, so the
; element's own names and values are captured as well, down to the entries
; of a commented-out node. Deeper than that (escapes, nodes inside a
; commented-out children block) keep their colors.

(slashdash) @comment

[
  (node
    (slashdash))
  (argument
    (slashdash))
  (property
    (slashdash))
  (children
    (slashdash))
] @comment

(node
  (slashdash)
  [
    name: (_) @comment
    type: (type
      (_) @comment)
    (argument
      type: (type
        (_) @comment)?
      value: (_) @comment)
    (property
      key: (_) @comment
      type: (type
        (_) @comment)?
      value: (_) @comment)
  ])

(argument
  (slashdash)
  type: (type
    (_) @comment)?
  value: (_) @comment)

(property
  (slashdash)
  key: (_) @comment
  type: (type
    (_) @comment)?
  value: (_) @comment)

(children
  (slashdash)
  [
    "{" @comment
    "}" @comment
    (node
      name: (_) @comment)
  ])
