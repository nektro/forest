; Highlights for HTML.
;
; When several patterns match a node, the last one wins, so general patterns
; come first and more specific ones after them.

(comment) @comment

(doctype) @keyword.directive

"doctype" @keyword

; Elements

[
  (tag_name)
  (erroneous_end_tag_name)
] @tag

(attribute_name) @tag.attribute

[
  (attribute_value)
  (quoted_attribute_value)
] @string

(entity) @string.escape

; Punctuation

[
  "<"
  ">"
  "</"
  "/>"
  "<!"
] @punctuation.bracket

"=" @punctuation.delimiter
