; Highlights for justfiles.
;
; When several patterns match a node, the last one wins, so general patterns
; come first and more specific ones after them. Recipe bodies are left to the
; shell (or the shebang's interpreter) in injections.scm.

(comment) @comment

; Keywords
; --------

[
  "alias"
  "export"
  "unexport"
  "eager"
  "set"
] @keyword

[
  "import"
  "mod"
] @keyword.import

[
  "if"
  "else"
] @keyword.conditional

"assert" @keyword

(import
  optional: "?" @keyword.modifier)

(module
  optional: "?" @keyword.modifier)

(boolean) @boolean

; Names
; -----

(identifier) @variable

(assignment
  name: (identifier) @variable)

(export
  name: (identifier) @variable)

(unexport
  name: (identifier) @variable)

(setting
  name: (identifier) @property)

(module
  name: (identifier) @module)

(module_path
  (identifier) @module
  .
  "::")

; just's constants: HEX, PATH_SEP, and the terminal styles (BOLD, RED, ...).
((identifier) @constant.builtin
  (#any-of? @constant.builtin
    "HEX" "HEXLOWER" "HEXUPPER" "PATH_SEP" "PATH_VAR_SEP" "CLEAR" "NORMAL"
    "BOLD" "ITALIC" "UNDERLINE" "INVERT" "HIDE" "STRIKETHROUGH" "BLACK" "RED"
    "GREEN" "YELLOW" "BLUE" "MAGENTA" "CYAN" "WHITE" "BG_BLACK" "BG_RED"
    "BG_GREEN" "BG_YELLOW" "BG_BLUE" "BG_MAGENTA" "BG_CYAN" "BG_WHITE"))

; Recipes
; -------

(recipe_header
  name: (identifier) @function)

(recipe_header
  quiet: "@" @punctuation.special)

(parameter
  name: (identifier) @variable.parameter)

(parameter
  export: "$" @punctuation.special)

(variadic_parameter
  kind: _ @operator)

(dependency
  recipe: (identifier) @function.call)

(dependency
  recipe: (module_path
    (identifier) @function.call .))

(dependency
  mapped: "*" @operator)

(starred_argument
  "*" @operator)

(alias
  name: (identifier) @function)

(alias
  target: (identifier) @function.call)

(alias
  target: (module_path
    (identifier) @function.call .))

(shebang) @comment

(prefix) @punctuation.special

; Functions
; ---------

(function_definition
  name: (identifier) @function)

(function_parameters
  (identifier) @variable.parameter)

(call_expression
  function: (identifier) @function.call)

(call_expression
  function: (identifier) @function.builtin
  (#any-of? @function.builtin
    "absolute_path" "append" "arch" "blake3" "blake3_file" "bool"
    "cache_directory" "canonicalize" "capitalize" "choose" "clean"
    "config_directory" "config_local_directory" "data_directory"
    "data_local_directory" "datetime" "datetime_utc" "encode_uri_component"
    "env" "env_var" "env_var_or_default" "error" "executable_directory"
    "extension" "file_name" "file_stem" "home_directory"
    "invocation_directory" "invocation_directory_native" "is_dependency"
    "join" "join_list" "just_executable" "just_pid" "just_version" "justfile"
    "justfile_directory" "kebabcase" "len" "lowercamelcase" "lowercase"
    "module_directory" "module_file" "module_path" "num_cpus" "num_jobs" "os"
    "os_family" "parent_directory" "path_exists" "prepend" "quote" "read"
    "recipe_name" "replace" "replace_regex" "require" "runtime_directory"
    "semver_matches" "sha256" "sha256_file" "shell" "shoutykebabcase"
    "shoutysnakecase" "show" "snakecase" "source_directory" "source_file"
    "split" "style" "titlecase" "trim" "trim_end" "trim_end_match"
    "trim_end_matches" "trim_start" "trim_start_match" "trim_start_matches"
    "uppercamelcase" "uppercase" "uuid" "which" "without_extension"))

; Attributes
; ----------

(attribute
  name: (identifier) @attribute)

(keyword_argument
  name: (identifier) @property)

; Strings
; -------

[
  (string)
  (format_string)
] @string

(escape_sequence) @string.escape

(backtick) @string.special

(import
  path: (string) @string.special.path)

(module
  path: (string) @string.special.path)

; Operators and punctuation
; -------------------------

[
  ":="
  "="
  "=="
  "!="
  "=~"
  "!~"
  "+"
  "++"
  "/"
  "!"
  "&&"
  "||"
] @operator

[
  "("
  ")"
  "["
  "]"
  "{"
  "}"
] @punctuation.bracket

[
  ","
  ":"
  "::"
] @punctuation.delimiter

(interpolation
  [
    "{{"
    "}}"
  ] @punctuation.special)
