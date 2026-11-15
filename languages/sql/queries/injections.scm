; Injections for SQL: the bodies of functions and DO blocks written in SQL,
; PL/pgSQL or PL/Python.
;
; PL/pgSQL is not SQL, but its statements are, so highlighting it as SQL
; marks most of it correctly. LANGUAGE can come before or after the body.

; CREATE FUNCTION ... AS $$ ... $$ LANGUAGE sql
(create_function_statement
  body: (dollar_quoted_string
    (string_content) @injection.content)
  language: (identifier) @_language
  (#match? @_language "^[\"]?([sS][qQ][lL]|[pP][lL][pP][gG][sS][qQ][lL])[\"]?$")
  (#set! injection.language "sql"))

(create_function_statement
  language: (identifier) @_language
  body: (dollar_quoted_string
    (string_content) @injection.content)
  (#match? @_language "^[\"]?([sS][qQ][lL]|[pP][lL][pP][gG][sS][qQ][lL])[\"]?$")
  (#set! injection.language "sql"))

(create_function_statement
  body: (dollar_quoted_string
    (string_content) @injection.content)
  language: (identifier) @_language
  (#match? @_language "^[\"]?[pP][lL][pP][yY][tT][hH][oO][nN]3?[uU]?[\"]?$")
  (#set! injection.language "python"))

(create_function_statement
  language: (identifier) @_language
  body: (dollar_quoted_string
    (string_content) @injection.content)
  (#match? @_language "^[\"]?[pP][lL][pP][yY][tT][hH][oO][nN]3?[uU]?[\"]?$")
  (#set! injection.language "python"))

; DO $$ ... $$, whose language is PL/pgSQL unless it says otherwise.
(do_statement
  !language
  body: (dollar_quoted_string
    (string_content) @injection.content)
  (#set! injection.language "sql"))

(do_statement
  language: (identifier) @_language
  body: (dollar_quoted_string
    (string_content) @injection.content)
  (#match? @_language "^[\"]?([sS][qQ][lL]|[pP][lL][pP][gG][sS][qQ][lL])[\"]?$")
  (#set! injection.language "sql"))

(do_statement
  body: (dollar_quoted_string
    (string_content) @injection.content)
  language: (identifier) @_language
  (#match? @_language "^[\"]?([sS][qQ][lL]|[pP][lL][pP][gG][sS][qQ][lL])[\"]?$")
  (#set! injection.language "sql"))
