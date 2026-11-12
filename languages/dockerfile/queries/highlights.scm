; Highlights for Dockerfiles.
;
; When several patterns match a node, the last one wins, so general patterns
; come first and more specific ones after them. Shell-form commands are left
; to the shell grammar in injections.scm.

[
  "FROM"
  "AS"
  "RUN"
  "CMD"
  "LABEL"
  "MAINTAINER"
  "EXPOSE"
  "ENV"
  "ADD"
  "COPY"
  "ENTRYPOINT"
  "VOLUME"
  "USER"
  "WORKDIR"
  "ARG"
  "ONBUILD"
  "STOPSIGNAL"
  "HEALTHCHECK"
  "SHELL"
] @keyword

"NONE" @constant.builtin

(comment) @comment

; Images
; ------

(image_name) @type

(image_tag) @constant

(image_digest) @string.special

(image_alias) @label

; Options and names
; -----------------

(param
  "--" @property
  name: (param_name) @property)

(variable) @variable

(label_key) @property

(port) @number

(signal) @constant

; Strings
; -------

[
  (double_quoted_string)
  (single_quoted_string)
  (json_string)
] @string

[
  (escape_sequence)
  (json_escape_sequence)
  (line_continuation)
] @string.escape

; Heredocs
; --------

(heredoc_line) @string

[
  (heredoc_marker)
  (heredoc_end)
] @label

; Expansions
; ----------

(expansion
  [
    "$"
    "${"
    "}"
  ] @punctuation.special)

(expansion
  (variable) @variable)

(expansion_operator) @operator

; Punctuation
; -----------

"=" @operator

[
  "["
  "]"
] @punctuation.bracket

"," @punctuation.delimiter
