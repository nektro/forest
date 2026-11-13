; Highlights for Bash.
;
; When several patterns match a node, the last one wins, so general patterns
; come first and more specific ones after them. Words without a role (most
; arguments) are left plain.

(comment) @comment

; Keywords
; --------

[
  "if"
  "then"
  "elif"
  "else"
  "fi"
  "case"
  "esac"
] @keyword.conditional

[
  "for"
  "select"
  "in"
  "while"
  "until"
  "do"
  "done"
] @keyword.repeat

"function" @keyword.function

[
  "declare"
  "typeset"
  "export"
  "readonly"
  "local"
  "unset"
  "unsetenv"
] @keyword

; Literals
; --------

[
  (string)
  (raw_string)
  (ansi_c_string)
  (translated_string)
  (heredoc_body)
] @string

(regex) @string.regexp

[
  (heredoc_start)
  (heredoc_end)
] @label

(number) @number

(file_descriptor) @number

; Variables
; ---------

(variable_name) @variable

(special_variable_name) @variable.builtin

((variable_name) @variable.builtin
  (#any-of? @variable.builtin
    "BASH" "BASHOPTS" "BASHPID" "BASH_ALIASES" "BASH_ARGC" "BASH_ARGV"
    "BASH_ARGV0" "BASH_CMDS" "BASH_COMMAND" "BASH_LINENO" "BASH_REMATCH"
    "BASH_SOURCE" "BASH_SUBSHELL" "BASH_VERSINFO" "BASH_VERSION" "CDPATH"
    "COLUMNS" "COMP_CWORD" "COMP_LINE" "COMP_POINT" "COMP_WORDS" "COMPREPLY"
    "DIRSTACK" "EPOCHREALTIME" "EPOCHSECONDS" "EUID" "FUNCNAME" "GROUPS" "HOME"
    "HOSTNAME" "HOSTTYPE" "IFS" "LINENO" "LINES" "MACHTYPE" "OLDPWD" "OPTARG"
    "OPTERR" "OPTIND" "OSTYPE" "PATH" "PIPESTATUS" "PPID" "PS1" "PS2" "PS3"
    "PS4" "PWD" "RANDOM" "REPLY" "SECONDS" "SHELL" "SHELLOPTS" "SHLVL" "SRANDOM"
    "UID"))

; Options passed to a command: -x, --flag, --name=value
(command
  argument: (word) @variable.parameter
  (#match? @variable.parameter "^-"))

; Functions and commands
; ----------------------

(command_name
  (word) @function.call)

((command_name
  (word) @function.builtin)
  (#any-of? @function.builtin
    "." ":" "[" "alias" "bg" "bind" "break" "builtin" "caller" "cd" "command"
    "compgen" "complete" "compopt" "continue" "coproc" "dirs" "disown" "echo"
    "enable" "eval" "exec" "exit" "false" "fc" "fg" "getopts" "hash" "help"
    "history" "jobs" "kill" "let" "logout" "mapfile" "popd" "printf" "pushd"
    "pwd" "read" "readarray" "return" "set" "shift" "shopt" "source" "suspend"
    "test" "time" "times" "trap" "true" "type" "ulimit" "umask" "unalias"
    "wait"))

(function_definition
  name: (word) @function)

; Operators
; ---------

[
  "|"
  "|&"
  "&&"
  "||"
  "!"
  "="
  "+="
  "=="
  "!="
  "=~"
  "<"
  ">"
  ">>"
  "&>"
  "&>>"
  "<&"
  ">&"
  ">|"
  "<>"
  "<<"
  "<<-"
  "<<<"
] @operator

(test_operator) @operator

(binary_expression
  operator: _ @operator)

(unary_expression
  operator: _ @operator)

(postfix_expression
  operator: _ @operator)

(ternary_expression
  [
    "?"
    ":"
  ] @operator)

(expansion
  [
    "#"
    "!"
  ] @operator)

(expansion
  operator: _ @operator)

; Punctuation
; -----------

[
  "("
  ")"
  "(("
  "{"
  "}"
  "["
  "]"
  "[["
  "]]"
] @punctuation.bracket

[
  ";"
  "&"
  ";;"
  ";&"
  ";;&"
] @punctuation.delimiter

(simple_expansion
  "$" @punctuation.special)

(expansion
  [
    "${"
    "}"
  ] @punctuation.special)

(command_substitution
  [
    "$("
    ")"
    "`"
  ] @punctuation.special)

(arithmetic_expansion
  [
    "$(("
    "$["
    ")"
    "]"
  ] @punctuation.special)

(process_substitution
  [
    "<("
    ">("
    ")"
  ] @punctuation.special)

(translated_string
  "$\"" @punctuation.special)
