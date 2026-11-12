(function_definition
  (function_command
    arguments: (argument_list
      .
      (unquoted_argument) @name))) @definition.function

(macro_definition
  (macro_command
    arguments: (argument_list
      .
      (unquoted_argument) @name))) @definition.macro

(command
  name: (identifier) @name) @reference.call
