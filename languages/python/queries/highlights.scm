; Highlights for Python.
;
; When several patterns match a node, the last one wins, so general patterns
; come first and more specific ones after them.

(identifier) @variable

; Names by convention
; -------------------

((identifier) @type
  (#match? @type "^[A-Z]"))

((identifier) @constant
  (#match? @constant "^_*[A-Z][A-Z0-9_]+$"))

((identifier) @variable.builtin
  (#any-of? @variable.builtin "self" "cls"))

((identifier) @constant.builtin
  (#any-of? @constant.builtin "NotImplemented" "Ellipsis" "__debug__"))

((identifier) @variable.builtin
  (#any-of? @variable.builtin
    "__name__" "__file__" "__doc__" "__package__" "__spec__" "__loader__"
    "__builtins__" "__dict__" "__class__" "__module__" "__qualname__"
    "__all__" "__slots__" "__annotations__"))

((identifier) @type.builtin
  (#any-of? @type.builtin
    "bool" "bytearray" "bytes" "complex" "dict" "float" "frozenset" "int"
    "list" "memoryview" "object" "range" "set" "slice" "str" "tuple" "type"))

((identifier) @type.builtin
  (#match? @type.builtin
    "^(BaseException|Exception|BaseExceptionGroup|ExceptionGroup|ArithmeticError|AssertionError|AttributeError|BlockingIOError|BrokenPipeError|BufferError|ChildProcessError|ConnectionAbortedError|ConnectionError|ConnectionRefusedError|ConnectionResetError|EOFError|EnvironmentError|FileExistsError|FileNotFoundError|FloatingPointError|GeneratorExit|IOError|ImportError|IndentationError|IndexError|InterruptedError|IsADirectoryError|KeyError|KeyboardInterrupt|LookupError|MemoryError|ModuleNotFoundError|NameError|NotADirectoryError|NotImplementedError|OSError|OverflowError|PermissionError|ProcessLookupError|PythonFinalizationError|RecursionError|ReferenceError|RuntimeError|StopAsyncIteration|StopIteration|SyntaxError|SystemError|SystemExit|TabError|TimeoutError|TypeError|UnboundLocalError|UnicodeDecodeError|UnicodeEncodeError|UnicodeError|UnicodeTranslateError|ValueError|ZeroDivisionError|Warning|BytesWarning|DeprecationWarning|EncodingWarning|FutureWarning|ImportWarning|PendingDeprecationWarning|ResourceWarning|RuntimeWarning|SyntaxWarning|UnicodeWarning|UserWarning)$"))

; Attributes and parameters
; -------------------------

(attribute
  attribute: (identifier) @property)

((attribute
  attribute: (identifier) @constant)
  (#match? @constant "^_*[A-Z][A-Z0-9_]+$"))

(keyword_argument
  name: (identifier) @variable.parameter)

(parameters
  (identifier) @variable.parameter)

(lambda_parameters
  (identifier) @variable.parameter)

(default_parameter
  name: (identifier) @variable.parameter)

(typed_parameter
  (identifier) @variable.parameter)

(typed_default_parameter
  name: (identifier) @variable.parameter)

(list_splat_pattern
  (identifier) @variable.parameter)

(dictionary_splat_pattern
  (identifier) @variable.parameter)

(keyword_pattern
  name: (identifier) @variable.parameter)

((parameters
  .
  (identifier) @variable.builtin)
  (#any-of? @variable.builtin "self" "cls"))

; Types
; -----

(type
  (identifier) @type)

(type
  (subscript
    value: (identifier) @type))

(type
  (subscript
    subscript: (identifier) @type))

(type
  (binary_operator
    [
      left: (identifier) @type
      right: (identifier) @type
    ]))

(type
  (attribute
    attribute: (identifier) @type))

(type_parameter
  name: (identifier) @type)

(type_alias_statement
  name: (identifier) @type)

(class_definition
  name: (identifier) @type)

(class_definition
  superclasses: (argument_list
    (identifier) @type))

(class_pattern
  (dotted_name
    (identifier) @type .))

; Functions
; ---------

(function_definition
  name: (identifier) @function)

((class_definition
  body: (block
    [
      (function_definition
        name: (identifier) @function.method)
      (decorated_definition
        definition: (function_definition
          name: (identifier) @function.method))
    ])))

((class_definition
  body: (block
    [
      (function_definition
        name: (identifier) @constructor)
      (decorated_definition
        definition: (function_definition
          name: (identifier) @constructor))
    ]))
  (#eq? @constructor "__init__"))

(call
  function: (identifier) @function.call)

(call
  function: (attribute
    attribute: (identifier) @function.method.call))

((call
  function: (identifier) @constructor)
  (#match? @constructor "^[A-Z]"))

((call
  function: (attribute
    attribute: (identifier) @constructor))
  (#match? @constructor "^[A-Z]"))

((call
  function: (identifier) @type.builtin)
  (#match? @type.builtin
    "^(BaseException|Exception|BaseExceptionGroup|ExceptionGroup|ArithmeticError|AssertionError|AttributeError|BlockingIOError|BrokenPipeError|BufferError|ChildProcessError|ConnectionAbortedError|ConnectionError|ConnectionRefusedError|ConnectionResetError|EOFError|EnvironmentError|FileExistsError|FileNotFoundError|FloatingPointError|GeneratorExit|IOError|ImportError|IndentationError|IndexError|InterruptedError|IsADirectoryError|KeyError|KeyboardInterrupt|LookupError|MemoryError|ModuleNotFoundError|NameError|NotADirectoryError|NotImplementedError|OSError|OverflowError|PermissionError|ProcessLookupError|PythonFinalizationError|RecursionError|ReferenceError|RuntimeError|StopAsyncIteration|StopIteration|SyntaxError|SystemError|SystemExit|TabError|TimeoutError|TypeError|UnboundLocalError|UnicodeDecodeError|UnicodeEncodeError|UnicodeError|UnicodeTranslateError|ValueError|ZeroDivisionError|Warning|BytesWarning|DeprecationWarning|EncodingWarning|FutureWarning|ImportWarning|PendingDeprecationWarning|ResourceWarning|RuntimeWarning|SyntaxWarning|UnicodeWarning|UserWarning)$"))

((call
  function: (identifier) @function.builtin)
  (#any-of? @function.builtin
    "abs" "aiter" "all" "anext" "any" "ascii" "bin" "breakpoint" "callable"
    "chr" "classmethod" "compile" "delattr" "dir" "divmod" "enumerate" "eval"
    "exec" "filter" "format" "getattr" "globals" "hasattr" "hash" "help" "hex"
    "id" "input" "isinstance" "issubclass" "iter" "len" "locals" "map" "max"
    "min" "next" "oct" "open" "ord" "pow" "print" "property" "repr"
    "reversed" "round" "setattr" "sorted" "staticmethod" "sum" "super" "vars"
    "zip" "__import__"))

((call
  function: (identifier) @type.builtin)
  (#any-of? @type.builtin
    "bool" "bytearray" "bytes" "complex" "dict" "float" "frozenset" "int"
    "list" "memoryview" "object" "range" "set" "slice" "str" "tuple" "type"))

(decorator
  "@" @attribute)

(decorator
  (identifier) @attribute)

(decorator
  (attribute
    attribute: (identifier) @attribute))

(decorator
  (call
    function: (identifier) @attribute))

(decorator
  (call
    function: (attribute
      attribute: (identifier) @attribute)))

; Modules
; -------

(import_statement
  name: (dotted_name
    (identifier) @module))

(import_statement
  name: (aliased_import
    name: (dotted_name
      (identifier) @module)
    alias: (identifier) @module))

(import_from_statement
  module_name: (dotted_name
    (identifier) @module))

(import_from_statement
  module_name: (relative_import
    (dotted_name
      (identifier) @module)))

; Literals
; --------

(comment) @comment

((comment) @keyword.directive
  (#match? @keyword.directive "^\\s*#!"))

(string) @string

; A string on its own as the first statement of a module, class or function.
(module
  .
  (expression_statement
    (string) @string.documentation))

(class_definition
  body: (block
    .
    (expression_statement
      (string) @string.documentation)))

(function_definition
  body: (block
    .
    (expression_statement
      (string) @string.documentation)))

(escape_sequence) @string.escape

(escape_interpolation) @string.escape

(integer) @number

(float) @number.float

[
  (true)
  (false)
] @boolean

(none) @constant.builtin

(ellipsis) @constant.builtin

; Punctuation
; -----------

[
  ","
  "."
  ":"
  ";"
] @punctuation.delimiter

[
  "("
  ")"
  "["
  "]"
  "{"
  "}"
] @punctuation.bracket

(type_parameters
  [
    "["
    "]"
  ] @punctuation.bracket)

(interpolation
  [
    "{"
    "}"
  ] @punctuation.special)

(interpolation
  "=" @punctuation.special)

(type_conversion) @punctuation.special

(format_specifier) @string.special

(format_specifier
  ":" @punctuation.special)

; Operators
; ---------

[
  "-"
  "-="
  "->"
  "!="
  "*"
  "**"
  "**="
  "*="
  "/"
  "//"
  "//="
  "/="
  "&"
  "&="
  "%"
  "%="
  "^"
  "^="
  "+"
  "+="
  "<"
  "<<"
  "<<="
  "<="
  "="
  "=="
  ">"
  ">="
  ">>"
  ">>="
  "|"
  "|="
  "~"
  ":="
  "@="
] @operator

(binary_operator
  operator: "@" @operator)

(keyword_separator) @operator

(positional_separator) @operator

(list_splat
  "*" @operator)

(dictionary_splat
  "**" @operator)

(splat_pattern
  [
    "*"
    "**"
  ] @operator)

(list_splat_pattern
  "*" @operator)

(dictionary_splat_pattern
  "**" @operator)

(wildcard_import) @operator

(import_prefix) @punctuation.delimiter

; Keywords
; --------

[
  "and"
  "in"
  "is"
  "not"
  "or"
  "is not"
  "not in"
] @keyword.operator

[
  "as"
  "assert"
  "del"
  "global"
  "nonlocal"
  "pass"
  "with"
] @keyword

(type_alias_statement
  "type" @keyword.type)

"class" @keyword.type

[
  "def"
  "lambda"
] @keyword.function

[
  "async"
  "await"
] @keyword.coroutine

[
  "return"
  "yield"
] @keyword.return

(yield
  "from" @keyword.return)

[
  "if"
  "elif"
  "else"
  "match"
  "case"
] @keyword.conditional

(conditional_expression
  [
    "if"
    "else"
  ] @keyword.conditional.ternary)

[
  "for"
  "while"
  "break"
  "continue"
] @keyword.repeat

[
  "try"
  "except"
  "finally"
  "raise"
] @keyword.exception

(raise_statement
  "from" @keyword.exception)

(except_group_clause
  "*" @keyword.exception)

[
  "import"
  "lazy"
] @keyword.import

(import_from_statement
  "from" @keyword.import)
