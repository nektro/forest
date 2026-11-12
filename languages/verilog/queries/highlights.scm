; Highlights for Verilog.
;
; When several patterns match a node, the last one wins, so general patterns
; come first and more specific ones after them.

(identifier) @variable

(escaped_identifier) @variable

; Constants by convention
; -----------------------

((identifier) @constant
  (#match? @constant "^[A-Z][A-Z0-9_]*$"))

; Comments and directives
; -----------------------

(comment) @comment

[
  "`define"
  "`undef"
  "`ifdef"
  "`ifndef"
  "`elsif"
  "`include"
  "`timescale"
  (else_directive)
  (endif_directive)
  (directive)
] @keyword.directive

(define_directive
  name: (_) @constant.macro)

(macro_parameter
  name: (_) @variable.parameter)

(macro_text) @string.special

[
  (undef_directive
    name: (_) @constant.macro)
  (ifdef_directive
    name: (_) @constant.macro)
  (elsif_directive
    name: (_) @constant.macro)
]

(include_directive
  path: (_) @string.special.path)

(time_literal) @number

(macro_identifier) @constant.macro

; Literals
; --------

(number) @number

(real_number) @number.float

(string) @string

(escape_sequence) @string.escape

[
  (level_symbol)
  (edge_symbol)
  (no_change)
  (edge_descriptor)
] @constant

; Declarations
; ------------

(module_declaration
  name: (_) @type.definition)

(udp_declaration
  name: (_) @type.definition)

(config_declaration
  name: (_) @type.definition)

(module_instantiation
  type: (_) @type)

(instance
  name: (_) @variable.member)

(port_declaration
  name: (_) @variable.parameter)

(port_declaration
  declarator: [
    (identifier)
    (escaped_identifier)
  ] @variable.parameter)

(port_declaration
  declarator: (declarator
    name: (_) @variable.parameter))

(port
  name: (_) @variable.parameter)

(named_port_connection
  name: (_) @property)

(named_parameter_assignment
  name: (_) @property)

(parameter_assignment
  name: (_) @constant)

(specparam_assignment
  name: (_) @constant)

(function_declaration
  name: (_) @function)

(task_declaration
  name: (_) @function)

(function_call
  function: [
    (identifier)
    (escaped_identifier)
  ] @function.call)

(function_call
  function: (hierarchical_identifier
    name: (_) @function.call))

(task_enable
  name: [
    (identifier)
    (escaped_identifier)
  ] @function.call)

(task_enable
  name: (hierarchical_identifier
    name: (_) @function.call))

(system_identifier) @function.builtin

[
  (seq_block
    name: (_) @label)
  (par_block
    name: (_) @label)
  (generate_block
    name: (_) @label)
]

(disable_statement
  name: (_) @label)

(attribute_spec
  name: (_) @attribute)

(cell_reference
  library: (_) @module)

; Keywords
; --------

[
  "module"
  "macromodule"
  "endmodule"
  "primitive"
  "endprimitive"
  "table"
  "endtable"
  "config"
  "endconfig"
  "design"
  "instance"
  "cell"
  "liblist"
  "use"
  "specify"
  "endspecify"
  "generate"
  "endgenerate"
  "begin"
  "end"
  "fork"
  "join"
  "initial"
  "always"
  "assign"
  "deassign"
  "force"
  "release"
  "defparam"
  "disable"
  "wait"
  "pulsestyle_onevent"
  "pulsestyle_ondetect"
  "showcancelled"
  "noshowcancelled"
  "edge"
] @keyword

[
  "function"
  "endfunction"
  "task"
  "endtask"
] @keyword.function

[
  "input"
  "output"
  "inout"
  "parameter"
  "localparam"
  "specparam"
  "automatic"
  "signed"
  "vectored"
  "scalared"
] @keyword.modifier

[
  "if"
  "else"
  "case"
  "casez"
  "casex"
  "endcase"
  "default"
  "ifnone"
] @keyword.conditional

[
  "for"
  "while"
  "repeat"
  "forever"
] @keyword.repeat

[
  "posedge"
  "negedge"
  "or"
] @keyword.operator

[
  "wire"
  "tri"
  "tri0"
  "tri1"
  "triand"
  "trior"
  "trireg"
  "wand"
  "wor"
  "uwire"
  "supply0"
  "supply1"
  "reg"
  "integer"
  "real"
  "realtime"
  "time"
  "event"
  "genvar"
] @type.builtin

; Gates
(gate_instantiation
  type: _ @function.builtin)

; Drive and charge strengths
(strength
  [
    "strong0"
    "strong1"
    "pull0"
    "pull1"
    "weak0"
    "weak1"
    "highz0"
    "highz1"
    "supply0"
    "supply1"
    "small"
    "medium"
    "large"
  ] @constant.builtin)

; Operators and punctuation
; -------------------------

[
  "="
  "<="
  "+"
  "-"
  "*"
  "/"
  "%"
  "**"
  "!"
  "~"
  "&"
  "~&"
  "|"
  "~|"
  "^"
  "~^"
  "^~"
  "&&"
  "||"
  "=="
  "!="
  "==="
  "!=="
  "<"
  ">"
  ">="
  "<<"
  ">>"
  "<<<"
  ">>>"
  "?"
  "->"
  "=>"
  "*>"
  "+=>"
  "-=>"
  "+*>"
  "-*>"
  "&&&"
  "+:"
  "-:"
] @operator

(conditional_expression
  ":" @operator)

[
  "#"
  "@"
] @punctuation.special

[
  "("
  ")"
  "["
  "]"
  "{"
  "}"
  "(*"
  "*)"
] @punctuation.bracket

[
  ";"
  ","
  "."
  ":"
] @punctuation.delimiter
