; Highlights for Nix.
;
; When several patterns match a node, the last one wins, so general patterns
; come first and more specific ones after them.

(identifier) @variable

; Comments
; --------

(comment) @comment

; Literals
; --------

; Strings and paths are captured piece by piece, so that the code in an
; interpolation is not inside a string range.
(string_fragment) @string
(string_expression "\"" @string)
(indented_string_expression "''" @string)
(escape_sequence) @string.escape

(path_fragment) @string.special.path
(spath_expression) @string.special.path
(uri_expression) @string.special.url

(integer_expression) @number
(float_expression) @number.float

; Predefined names. They can be shadowed, so they are identifiers in the tree
; and recognized here by name.
; -------------------------------------------------------------------------

((identifier) @boolean
  (#any-of? @boolean "true" "false"))

((identifier) @constant.builtin
  (#any-of? @constant.builtin "null" "__curPos" "__currentSystem" "__currentTime"
    "__nixPath" "__nixVersion" "__storeDir" "__langVersion"))

((identifier) @module.builtin
  (#eq? @module.builtin "builtins"))

; Functions that are in scope without `builtins.`.
((identifier) @function.builtin
  (#any-of? @function.builtin
    "abort" "baseNameOf" "break" "derivation" "derivationStrict" "dirOf"
    "fetchGit" "fetchMercurial" "fetchTarball" "fetchTree" "fromTOML" "import"
    "isNull" "map" "placeholder" "removeAttrs" "scopedImport" "throw"
    "toString"))

; Attributes
; ----------

(attrpath
  attr: (identifier) @property)

(inherited_attrs
  attr: (identifier) @property)

; Functions
; ---------

(formal
  name: (identifier) @variable.parameter)

(function_expression
  universal: (identifier) @variable.parameter)

(apply_expression
  function: (variable_expression
    name: (identifier) @function.call))

(apply_expression
  function: (select_expression
    attrpath: (attrpath
      attr: (identifier) @function.call .)))

(binding
  attrpath: (attrpath
    attr: (identifier) @function .)
  expression: (function_expression))

((apply_expression
  function: (variable_expression
    name: (identifier) @function.builtin))
  (#any-of? @function.builtin
    "abort" "baseNameOf" "break" "derivation" "derivationStrict" "dirOf"
    "fetchGit" "fetchMercurial" "fetchTarball" "fetchTree" "fromTOML" "import"
    "isNull" "map" "placeholder" "removeAttrs" "scopedImport" "throw"
    "toString"))

(apply_expression
  function: (select_expression
    expression: (variable_expression
      name: (identifier) @module.builtin)
    attrpath: (attrpath
      attr: (identifier) @function.builtin .))
  (#eq? @module.builtin "builtins"))

; Keywords
; --------

[
  "let"
  "in"
  "rec"
  "inherit"
  "with"
] @keyword

"assert" @keyword.debug

[
  "if"
  "then"
  "else"
] @keyword.conditional

; Only in `a.b or c`; as an attribute name (`lib.or`) it is an identifier.
"or" @keyword.operator

; Operators
; ---------

[
  "!" "-" "+" "*" "/"
  "++" "//"
  "==" "!=" "<" "<=" ">" ">="
  "&&" "||" "->"
  "|>" "<|"
  "?"
  "="
  "@"
] @operator

; Punctuation
; -----------

[
  "(" ")"
  "[" "]"
  "{" "}"
] @punctuation.bracket

[
  "."
  ","
  ";"
  ":"
] @punctuation.delimiter

(ellipses) @punctuation.special

(interpolation
  "${" @punctuation.special
  "}" @punctuation.special)
