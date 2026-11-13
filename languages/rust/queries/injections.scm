([
  (line_comment)
  (block_comment)
] @injection.content
  (#set! injection.language "comment"))

; The body of a macro invocation is a token tree; reparse it as Rust.
(macro_invocation
  (token_tree) @injection.content
  (#set! injection.language "rust")
  (#set! injection.include-children))
