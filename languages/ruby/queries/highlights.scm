; Highlights for Ruby.
;
; When several patterns match a node, the last one wins, so general patterns
; come first and more specific ones after them.

(identifier) @variable

; Constants: `Foo` names a class or module, `FOO` a value.
(constant) @type

((constant) @constant
  (#match? @constant "^_*[A-Z][A-Z0-9_]*$"))

; Variables
; ---------

[
  (instance_variable)
  (class_variable)
] @variable.member

(global_variable) @variable.builtin

[
  (self)
  (super)
] @variable.builtin

; Parameters
; ----------

(parameters
  (identifier) @variable.parameter)

(method_parameters
  (identifier) @variable.parameter)

(lambda_parameters
  (identifier) @variable.parameter)

(block_parameters
  (identifier) @variable.parameter)

(block_parameters
  locals: (identifier) @variable.parameter)

(destructured_parameter
  (identifier) @variable.parameter)

(optional_parameter
  name: (identifier) @variable.parameter)

(keyword_parameter
  name: (identifier) @variable.parameter)

(splat_parameter
  name: (identifier) @variable.parameter)

(hash_splat_parameter
  name: (identifier) @variable.parameter)

(block_parameter
  name: (identifier) @variable.parameter)

; Calls
; -----

; `foo?` and `foo!` are always methods.
((identifier) @function.call
  (#match? @function.call "[?!]$"))

(call
  method: [
    (identifier)
    (constant)
  ] @function.call)

(call
  method: (operator) @operator)

; Methods that read like keywords, called without a receiver.
(call
  !receiver
  method: (identifier) @function.builtin
  (#any-of? @function.builtin
    "require" "require_relative" "load" "autoload" "include" "extend"
    "prepend" "attr_reader" "attr_writer" "attr_accessor" "private"
    "protected" "public" "module_function" "private_constant"
    "public_constant" "private_class_method" "public_class_method"
    "define_method" "alias_method" "raise" "fail" "catch" "throw" "loop"
    "lambda" "proc" "puts" "print" "p" "pp" "binding" "block_given?"
    "using" "refine" "freeze" "frozen?" "format" "sprintf" "printf"
    "warn" "exit" "abort" "at_exit" "sleep" "rand" "srand"))

((identifier) @function.builtin
  (#any-of? @function.builtin "block_given?" "binding" "__method__" "__dir__" "__callee__"))

; Definitions
; -----------

(method
  name: [
    (identifier)
    (constant)
  ] @function.method)

(singleton_method
  name: [
    (identifier)
    (constant)
  ] @function.method)

(setter
  name: (identifier) @function.method)

(method
  name: (operator) @function.method)

(singleton_method
  name: (operator) @function.method)

(alias
  name: (identifier) @function.method)

(alias
  alias: (identifier) @function.method)

(class
  name: (constant) @type)

(class
  name: (scope_resolution
    name: (constant) @type))

(module
  name: (constant) @type)

(module
  name: (scope_resolution
    name: (constant) @type))

(superclass
  (constant) @type)

; Hash keys: `{key: value}`, `foo(key: value)`
(pair
  key: (hash_key_symbol) @property)

(keyword_pattern
  key: (hash_key_symbol) @property)

; Literals
; --------

[
  (string)
  (bare_string)
  (heredoc_body)
] @string

(heredoc_beginning) @label

(subshell) @string.special

[
  (simple_symbol)
  (delimited_symbol)
  (bare_symbol)
] @string.special.symbol

(regex) @string.regexp

(escape_sequence) @string.escape

(character) @character

[
  (integer)
  (float)
  (rational)
  (complex)
] @number

[
  (true)
  (false)
] @boolean

[
  (nil)
  (file)
  (line)
  (encoding)
] @constant.builtin

[
  (comment)
  (uninterpreted)
] @comment

; The code in an interpolation has captures of its own, which win over the
; string around it. Its delimiters are at the end, after punctuation.

; Keywords
; --------

[
  "if"
  "unless"
  "else"
  "elsif"
  "case"
  "when"
  "then"
] @keyword.conditional

(in_clause
  "in" @keyword.conditional)

(if_modifier
  "if" @keyword.conditional)

(unless_modifier
  "unless" @keyword.conditional)

[
  "while"
  "until"
  "for"
  "do"
] @keyword.repeat

(for
  "in" @keyword.repeat)

[
  "begin"
  "rescue"
  "ensure"
  "retry"
] @keyword.exception

[
  "return"
  "yield"
  "break"
  "next"
  "redo"
] @keyword.return

"def" @keyword.function

[
  "class"
  "module"
] @keyword.type

[
  "and"
  "or"
  "not"
  "defined?"
] @keyword.operator

[
  "alias"
  "undef"
  "BEGIN"
  "END"
  "end"
] @keyword

(test_pattern
  "in" @keyword.operator)

; Operators and punctuation
; -------------------------

[
  "="
  "+="
  "-="
  "*="
  "**="
  "/="
  "%="
  "||="
  "&&="
  "|="
  "&="
  "^="
  "<<="
  ">>="
  "=="
  "!="
  "==="
  "<=>"
  "=~"
  "!~"
  "<"
  "<="
  ">"
  ">="
  "+"
  "-"
  "*"
  "**"
  "/"
  "%"
  "!"
  "~"
  "&"
  "^"
  "<<"
  ">>"
  "&&"
  "||"
  ".."
  "..."
  "=>"
  "->"
  "?"
] @operator

(binary
  operator: "|" @operator)

(alternative_pattern
  "|" @operator)

(conditional
  ":" @operator)

(splat_argument
  "*" @operator)

(hash_splat_argument
  "**" @operator)

(block_argument
  "&" @operator)

(variable_reference_pattern
  "^" @operator)

(expression_reference_pattern
  "^" @operator)

[
  ","
  ";"
  "."
  "&."
  "::"
] @punctuation.delimiter

[
  "("
  ")"
  "["
  "]"
  "{"
  "}"
] @punctuation.bracket

(block_parameters
  "|" @punctuation.bracket)

(block_parameters
  "||" @punctuation.bracket)

; `/` also delimits a regex.
(regex
  "/" @string.regexp)

(interpolation
  [
    "#{"
    "}"
  ] @punctuation.special)

(interpolation
  "#" @punctuation.special)
