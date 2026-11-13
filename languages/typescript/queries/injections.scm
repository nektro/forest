((comment) @injection.content
  (#set! injection.language "comment"))

((regex_pattern) @injection.content
  (#set! injection.language "regex"))

; Tagged templates: html`...`, css`...`, sql`...`, graphql`...`
(call_expression
  function: (identifier) @injection.language
  arguments: (template_string) @injection.content
  (#any-of? @injection.language "html" "css" "sql" "graphql")
  (#set! injection.include-children))

(call_expression
  function: (identifier) @_name
  arguments: (template_string) @injection.content
  (#eq? @_name "gql")
  (#set! injection.language "graphql")
  (#set! injection.include-children))
