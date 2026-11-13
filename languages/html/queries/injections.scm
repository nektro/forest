; Injections for HTML: CSS in <style> and style="", TypeScript in <script>
; and on* event handler attributes, JSON in JSON-typed <script>s.
;
; Type values are matched in lowercase, as they are written in practice.

; <style>
(style_element
  (raw_text) @injection.content
  (#set! injection.language "css"))

; <script> with no type attribute. Attributes always follow whitespace, so
; `data-type=` does not count as a type.
(script_element
  (start_tag) @_start
  (raw_text) @injection.content
  (#not-match? @_start "\\s[tT][yY][pP][eE]\\s*=")
  (#set! injection.language "typescript"))

; <script type="module">, <script type="text/javascript">, ...
(script_element
  (start_tag
    (attribute
      name: (attribute_name) @_name
      value: [
        (attribute_value) @_type
        (quoted_attribute_value
          (attribute_value) @_type)
      ]))
  (raw_text) @injection.content
  (#match? @_name "^[tT][yY][pP][eE]$")
  (#match? @_type "^(module|(text|application)/((x-)?(java|ecma)script|typescript|babel|jsx)(;.*)?)$")
  (#set! injection.language "typescript"))

; <script type="application/json">, "application/ld+json", "importmap",
; "speculationrules"
(script_element
  (start_tag
    (attribute
      name: (attribute_name) @_name
      value: [
        (attribute_value) @_type
        (quoted_attribute_value
          (attribute_value) @_type)
      ]))
  (raw_text) @injection.content
  (#match? @_name "^[tT][yY][pP][eE]$")
  (#match? @_type "^(importmap|speculationrules|application/([a-z.+-]+\\+)?json)$")
  (#set! injection.language "json"))

; style="color: red". The CSS grammar accepts declarations at the top level.
(attribute
  name: (attribute_name) @_name
  value: [
    (attribute_value) @injection.content
    (quoted_attribute_value
      (attribute_value) @injection.content)
  ]
  (#match? @_name "^[sS][tT][yY][lL][eE]$")
  (#set! injection.language "css"))

; onclick="go()" and other event handlers.
(attribute
  name: (attribute_name) @_name
  value: [
    (attribute_value) @injection.content
    (quoted_attribute_value
      (attribute_value) @injection.content)
  ]
  (#match? @_name "^[oO][nN][a-zA-Z]+$")
  (#set! injection.language "typescript"))
