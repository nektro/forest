; Highlights for XML.
;
; When several patterns match a node, the last one wins, so general patterns
; come first and more specific ones after them.

(comment) @comment

; Elements

(tag_name) @tag

(attribute_name) @tag.attribute

(attribute_value) @string

[
  (entity_reference)
  (character_reference)
] @string.escape

(cdata) @string

; Prolog and processing instructions

(xml_declaration
  "xml" @keyword.directive)

(pi_target) @keyword.directive

; Document type declarations

[
  "<!DOCTYPE"
  "<!ELEMENT"
  "<!ATTLIST"
  "<!ENTITY"
  "<!NOTATION"
  "<![CDATA["
  "<!["
  "SYSTEM"
  "PUBLIC"
  "NDATA"
  "NOTATION"
  "INCLUDE"
  "IGNORE"
  "#PCDATA"
  "#REQUIRED"
  "#IMPLIED"
  "#FIXED"
  (empty)
  (any)
] @keyword

(attribute_type) @type.builtin

(doctype
  name: (name) @tag)

(element_declaration
  name: (name) @tag)

[
  (content_choice)
  (content_sequence)
  (mixed_content)
] @tag

(attlist_declaration
  name: (name) @tag)

(attribute_definition
  name: (name) @tag.attribute)

(entity_declaration
  name: (name) @constant)

(notation_declaration
  name: (name) @type)

(notation_type
  (name) @type)

(entity_declaration
  notation: (name) @type)

(nmtoken) @constant

[
  (system_literal)
  (pubid_literal)
  (entity_value)
] @string

(parameter_entity_reference) @string.special

; Punctuation

[
  "<"
  ">"
  "</"
  "/>"
  "<?"
  "?>"
  "["
  "]"
  "]]>"
  "("
  ")"
] @punctuation.bracket

[
  "="
  "|"
  ","
] @punctuation.delimiter

[
  "?"
  "*"
  "+"
] @operator
