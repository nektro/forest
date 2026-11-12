([
  (line_comment)
  (block_comment)
] @injection.content
  (#set! injection.language "comment"))

; Javadoc
((block_comment) @injection.content
  (#match? @injection.content "^/[*][*][^*/]")
  (#set! injection.language "javadoc"))
