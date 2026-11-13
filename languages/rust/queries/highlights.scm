; Highlights for Rust.
;
; When several patterns match a node, the last one wins, so general patterns
; come first and more specific ones after them.

(identifier) @variable

(metavariable) @variable

(self) @variable.builtin

; Names by convention
; -------------------

((identifier) @type
  (#match? @type "^[A-Z]"))

((identifier) @constant
  (#match? @constant "^_*[A-Z][A-Z0-9_]+$"))

; Types
; -----

(type_identifier) @type

((type_identifier) @type.builtin
  (#any-of? @type.builtin
    "bool" "char" "str" "u8" "u16" "u32" "u64" "u128" "usize"
    "i8" "i16" "i32" "i64" "i128" "isize" "f16" "f32" "f64" "f128"))

((identifier) @type.builtin
  (#any-of? @type.builtin
    "bool" "char" "str" "u8" "u16" "u32" "u64" "u128" "usize"
    "i8" "i16" "i32" "i64" "i128" "isize" "f16" "f32" "f64" "f128"))

((type_identifier) @type.builtin
  (#eq? @type.builtin "Self"))

((identifier) @type.builtin
  (#eq? @type.builtin "Self"))

(inferred_type) @type.builtin

(never_type) @type.builtin

(lifetime) @label

(label) @label

; Paths
; -----

; Modules and crates in paths are highlighted as types.

(scoped_identifier
  path: (identifier) @type)

(scoped_type_identifier
  path: (identifier) @type)

; The middle parts of a path: `collections` in `std::collections::HashMap`.
(scoped_identifier
  path: (scoped_identifier
    name: (identifier) @type))

(scoped_type_identifier
  path: (scoped_identifier
    name: (identifier) @type))

(scoped_use_list
  path: (scoped_identifier
    name: (identifier) @type))

(use_wildcard
  (scoped_identifier
    name: (identifier) @type))

(use_wildcard
  (identifier) @type)

(scoped_use_list
  path: (identifier) @type)

(use_declaration
  argument: (identifier) @type)

(use_declaration
  argument: (scoped_identifier
    name: (identifier) @type))

(use_as_clause
  path: (identifier) @type)

(use_list
  (identifier) @type)

(mod_item
  name: (identifier) @type)

(extern_crate_declaration
  name: (identifier) @type)

(extern_crate_declaration
  alias: (identifier) @type)

; Names in a path that look like types or constants keep that look.
(scoped_identifier
  path: (identifier) @type
  (#match? @type "^[A-Z]"))

(scoped_identifier
  name: (identifier) @type
  (#match? @type "^[A-Z]"))

(scoped_identifier
  name: (identifier) @constant
  (#match? @constant "^_*[A-Z][A-Z0-9_]+$"))

(scoped_type_identifier
  path: (identifier) @type
  (#match? @type "^[A-Z]"))

((use_declaration
  argument: (scoped_identifier
    name: (identifier) @type))
  (#match? @type "^[A-Z]"))

((use_list
  (identifier) @type)
  (#match? @type "^[A-Z]"))

; Fields, parameters and variants
; -------------------------------

(field_identifier) @property

(shorthand_field_identifier) @property

; Field accesses (`self.rest`) are variables; field declarations and
; initializers stay properties. Method calls are matched further down.
(field_expression
  field: (field_identifier) @variable)

(shorthand_field_initializer
  (identifier) @property)

(parameter
  pattern: (identifier) @variable.parameter)

(parameter
  pattern: (mut_pattern
    (identifier) @variable.parameter))

(parameter
  pattern: (ref_pattern
    (identifier) @variable.parameter))

(closure_parameters
  (identifier) @variable.parameter)

(enum_variant
  name: (identifier) @constant)

(const_item
  name: (identifier) @constant)

(static_item
  name: (identifier) @constant)

(const_parameter
  name: (identifier) @constant)

; Functions
; ---------

(function_item
  name: (identifier) @function)

(call_expression
  function: (identifier) @function.call)

(call_expression
  function: (scoped_identifier
    name: (identifier) @function.call))

(call_expression
  function: (field_expression
    field: (field_identifier) @function.method.call))

(generic_function
  function: (identifier) @function.call)

(generic_function
  function: (scoped_identifier
    name: (identifier) @function.call))

(generic_function
  function: (field_expression
    field: (field_identifier) @function.method.call))

(macro_invocation
  macro: (identifier) @tag
  "!" @tag)

(macro_invocation
  macro: (scoped_identifier
    name: (identifier) @tag)
  "!" @tag)

(macro_definition
  name: (identifier) @tag)

; Attributes
; ----------

(attribute_item) @attribute

(inner_attribute_item) @attribute

(attribute
  (identifier) @attribute)

(attribute
  (scoped_identifier
    name: (identifier) @attribute))

; Comments
; --------

(line_comment) @comment

(block_comment) @comment

(doc_comment) @comment.documentation

((block_comment) @comment.documentation
  (#match? @comment.documentation "^/[*][*][^*/]|^/[*]!"))

(shebang) @keyword.directive

; Literals
; --------

(string_literal) @string

(raw_string_literal) @string

(escape_sequence) @string.escape

(char_literal) @character

(integer_literal) @number

(float_literal) @number.float

(boolean_literal) @boolean

; Keywords
; --------

[
  "as"
  "box"
  "default"
  "dyn"
  "impl"
  "in"
  "move"
  "raw"
  "ref"
  "safe"
  "union"
  "use"
  "where"
  "yeet"
  "do"
  "gen"
  "auto"
  "final"
  "let"
  "macro_rules"
  "macro"
  (mutable_specifier)
  (ref_specifier)
] @keyword

[
  "struct"
  "enum"
  "trait"
  "type"
] @keyword.type

[
  "const"
  "static"
  "extern"
  "unsafe"
  "pub"
  (visibility_modifier)
] @keyword.modifier

"fn" @keyword.function

[
  "mod"
  "crate"
] @keyword.import

(use_declaration
  "use" @keyword.import)

(extern_crate_declaration
  "extern" @keyword.import)

[
  "async"
  "await"
] @keyword.coroutine

[
  "return"
  "yield"
  "become"
] @keyword.return

[
  "if"
  "else"
  "match"
] @keyword.conditional

[
  "loop"
  "while"
  "for"
  "break"
  "continue"
] @keyword.repeat

"try" @keyword.exception

(for_lifetimes
  "for" @keyword)

(higher_ranked_trait_bound
  (for_lifetimes
    "for" @keyword))

(impl_item
  "for" @keyword)

(crate) @keyword.import

(super) @keyword.import

; Operators
; ---------

[
  "+" "-" "*" "/" "%" "^" "!" "&" "|" "&&" "||" "<<" ">>"
  "+=" "-=" "*=" "/=" "%=" "^=" "&=" "|=" "<<=" ">>=" "="
  "==" "!=" ">" "<" ">=" "<=" "@" ".." "..=" "..." "?" "->" "=>"
] @operator

(closure_parameters
  "|" @punctuation.bracket)

(type_arguments
  ["<" ">"] @punctuation.bracket)

(type_parameters
  ["<" ">"] @punctuation.bracket)

(for_lifetimes
  ["<" ">"] @punctuation.bracket)

(bracketed_type
  ["<" ">"] @punctuation.bracket)

(reference_type
  "&" @operator)

(pointer_type
  "*" @operator)

; Punctuation
; -----------

["(" ")" "[" "]" "{" "}"] @punctuation.bracket

["," "." ":" "::" ";"] @punctuation.delimiter

(attribute_item
  "#" @punctuation.special)

(inner_attribute_item
  ["#" "!"] @punctuation.special)

; Macro bodies
; ------------

; A token tree is not parsed, so its punctuation keeps a neutral color.
(token_tree
  ["(" ")" "[" "]" "{" "}"] @punctuation.bracket)

(macro_invocation
  "!" @tag)

(macro_definition
  "!" @tag)

; A name followed by `(..)` in a token tree is most likely a call, a tuple
; struct or enum variant included:
; `format!("{}", f(x))` and `self.area()`.
(token_tree
  (identifier) @function.call
  .
  (token_tree
    .
    "("))

(token_tree
  "."
  .
  (identifier) @function.method.call
  .
  (token_tree
    .
    "("))

(token_tree
  "self" @variable.builtin)

; `name!` in a token tree is a macro.
(token_tree
  (identifier) @tag
  .
  "!" @tag)
