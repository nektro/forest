;; Highlights for CMake.
;;
;; When several patterns match a node, the last one wins, so general patterns
;; come first and more specific ones after them.
;;
;; Command names ignore case. Builtin commands are matched in lower and upper
;; case, the two ways they are written in practice.

; Commands
; --------

(command
  name: (identifier) @function.call)

((command
  name: (identifier) @function.builtin)
  (#match? @function.builtin "^(add_compile_definitions|add_compile_options|add_custom_command|add_custom_target|add_definitions|add_dependencies|add_executable|add_library|add_link_options|add_subdirectory|add_test|aux_source_directory|break|build_command|cmake_file_api|cmake_host_system_information|cmake_instrumentation|cmake_language|cmake_minimum_required|cmake_parse_arguments|cmake_path|cmake_pkg_config|cmake_policy|configure_file|continue|create_test_sourcelist|ctest_build|ctest_configure|ctest_coverage|ctest_empty_binary_directory|ctest_memcheck|ctest_read_custom_files|ctest_run_script|ctest_sleep|ctest_start|ctest_submit|ctest_test|ctest_update|ctest_upload|define_property|enable_language|enable_testing|execute_process|export|file|find_file|find_library|find_package|find_path|find_program|fltk_wrap_ui|get_cmake_property|get_directory_property|get_filename_component|get_property|get_source_file_property|get_target_property|get_test_property|include|include_directories|include_external_msproject|include_guard|include_regular_expression|install|link_directories|link_libraries|list|load_cache|mark_as_advanced|math|message|option|project|qt_wrap_cpp|qt_wrap_ui|remove_definitions|return|separate_arguments|set|set_directory_properties|set_property|set_source_files_properties|set_target_properties|set_tests_properties|site_name|source_group|string|target_compile_definitions|target_compile_features|target_compile_options|target_include_directories|target_link_directories|target_link_libraries|target_link_options|target_precompile_headers|target_sources|try_compile|try_run|unset|variable_watch|ADD_COMPILE_DEFINITIONS|ADD_COMPILE_OPTIONS|ADD_CUSTOM_COMMAND|ADD_CUSTOM_TARGET|ADD_DEFINITIONS|ADD_DEPENDENCIES|ADD_EXECUTABLE|ADD_LIBRARY|ADD_LINK_OPTIONS|ADD_SUBDIRECTORY|ADD_TEST|AUX_SOURCE_DIRECTORY|BREAK|BUILD_COMMAND|CMAKE_FILE_API|CMAKE_HOST_SYSTEM_INFORMATION|CMAKE_INSTRUMENTATION|CMAKE_LANGUAGE|CMAKE_MINIMUM_REQUIRED|CMAKE_PARSE_ARGUMENTS|CMAKE_PATH|CMAKE_PKG_CONFIG|CMAKE_POLICY|CONFIGURE_FILE|CONTINUE|CREATE_TEST_SOURCELIST|CTEST_BUILD|CTEST_CONFIGURE|CTEST_COVERAGE|CTEST_EMPTY_BINARY_DIRECTORY|CTEST_MEMCHECK|CTEST_READ_CUSTOM_FILES|CTEST_RUN_SCRIPT|CTEST_SLEEP|CTEST_START|CTEST_SUBMIT|CTEST_TEST|CTEST_UPDATE|CTEST_UPLOAD|DEFINE_PROPERTY|ENABLE_LANGUAGE|ENABLE_TESTING|EXECUTE_PROCESS|EXPORT|FILE|FIND_FILE|FIND_LIBRARY|FIND_PACKAGE|FIND_PATH|FIND_PROGRAM|FLTK_WRAP_UI|GET_CMAKE_PROPERTY|GET_DIRECTORY_PROPERTY|GET_FILENAME_COMPONENT|GET_PROPERTY|GET_SOURCE_FILE_PROPERTY|GET_TARGET_PROPERTY|GET_TEST_PROPERTY|INCLUDE|INCLUDE_DIRECTORIES|INCLUDE_EXTERNAL_MSPROJECT|INCLUDE_GUARD|INCLUDE_REGULAR_EXPRESSION|INSTALL|LINK_DIRECTORIES|LINK_LIBRARIES|LIST|LOAD_CACHE|MARK_AS_ADVANCED|MATH|MESSAGE|OPTION|PROJECT|QT_WRAP_CPP|QT_WRAP_UI|REMOVE_DEFINITIONS|RETURN|SEPARATE_ARGUMENTS|SET|SET_DIRECTORY_PROPERTIES|SET_PROPERTY|SET_SOURCE_FILES_PROPERTIES|SET_TARGET_PROPERTIES|SET_TESTS_PROPERTIES|SITE_NAME|SOURCE_GROUP|STRING|TARGET_COMPILE_DEFINITIONS|TARGET_COMPILE_FEATURES|TARGET_COMPILE_OPTIONS|TARGET_INCLUDE_DIRECTORIES|TARGET_LINK_DIRECTORIES|TARGET_LINK_LIBRARIES|TARGET_LINK_OPTIONS|TARGET_PRECOMPILE_HEADERS|TARGET_SOURCES|TRY_COMPILE|TRY_RUN|UNSET|VARIABLE_WATCH)$"))

((command
  name: (identifier) @keyword.return)
  (#match? @keyword.return "^(return|RETURN)$"))

((command
  name: (identifier) @keyword.repeat)
  (#match? @keyword.repeat "^(break|continue|BREAK|CONTINUE)$"))

[
  "if"
  "elseif"
  "else"
  "endif"
] @keyword.conditional

[
  "foreach"
  "endforeach"
  "while"
  "endwhile"
] @keyword.repeat

[
  "function"
  "endfunction"
  "macro"
  "endmacro"
] @keyword.function

[
  "block"
  "endblock"
] @keyword

; Arguments
; ---------

(quoted_argument) @string

(bracket_argument) @string

[
  (escape_sequence)
  (line_continuation)
] @string.escape

((unquoted_argument) @boolean
  (#match? @boolean "^(ON|OFF|TRUE|FALSE|YES|NO|IGNORE|NOTFOUND|[A-Za-z0-9_]*-NOTFOUND)$"))

; Conditions in if(), elseif() and while().
((if_command
  arguments: (argument_list
    (unquoted_argument) @keyword.operator))
  (#match? @keyword.operator "^(NOT|AND|OR|COMMAND|POLICY|TARGET|TEST|DEFINED|EXISTS|IS_READABLE|IS_WRITABLE|IS_EXECUTABLE|IS_NEWER_THAN|IS_DIRECTORY|IS_SYMLINK|IS_ABSOLUTE|MATCHES|LESS|GREATER|EQUAL|LESS_EQUAL|GREATER_EQUAL|STRLESS|STRGREATER|STREQUAL|STRLESS_EQUAL|STRGREATER_EQUAL|VERSION_LESS|VERSION_GREATER|VERSION_EQUAL|VERSION_LESS_EQUAL|VERSION_GREATER_EQUAL|IN_LIST|PATH_EQUAL)$"))

((elseif_command
  arguments: (argument_list
    (unquoted_argument) @keyword.operator))
  (#match? @keyword.operator "^(NOT|AND|OR|COMMAND|POLICY|TARGET|TEST|DEFINED|EXISTS|IS_READABLE|IS_WRITABLE|IS_EXECUTABLE|IS_NEWER_THAN|IS_DIRECTORY|IS_SYMLINK|IS_ABSOLUTE|MATCHES|LESS|GREATER|EQUAL|LESS_EQUAL|GREATER_EQUAL|STRLESS|STRGREATER|STREQUAL|STRLESS_EQUAL|STRGREATER_EQUAL|VERSION_LESS|VERSION_GREATER|VERSION_EQUAL|VERSION_LESS_EQUAL|VERSION_GREATER_EQUAL|IN_LIST|PATH_EQUAL)$"))

((while_command
  arguments: (argument_list
    (unquoted_argument) @keyword.operator))
  (#match? @keyword.operator "^(NOT|AND|OR|COMMAND|POLICY|TARGET|TEST|DEFINED|EXISTS|IS_READABLE|IS_WRITABLE|IS_EXECUTABLE|IS_NEWER_THAN|IS_DIRECTORY|IS_SYMLINK|IS_ABSOLUTE|MATCHES|LESS|GREATER|EQUAL|LESS_EQUAL|GREATER_EQUAL|STRLESS|STRGREATER|STREQUAL|STRLESS_EQUAL|STRGREATER_EQUAL|VERSION_LESS|VERSION_GREATER|VERSION_EQUAL|VERSION_LESS_EQUAL|VERSION_GREATER_EQUAL|IN_LIST|PATH_EQUAL)$"))

((argument_group
  (unquoted_argument) @keyword.operator)
  (#match? @keyword.operator "^(NOT|AND|OR|COMMAND|POLICY|TARGET|TEST|DEFINED|EXISTS|IS_READABLE|IS_WRITABLE|IS_EXECUTABLE|IS_NEWER_THAN|IS_DIRECTORY|IS_SYMLINK|IS_ABSOLUTE|MATCHES|LESS|GREATER|EQUAL|LESS_EQUAL|GREATER_EQUAL|STRLESS|STRGREATER|STREQUAL|STRLESS_EQUAL|STRGREATER_EQUAL|VERSION_LESS|VERSION_GREATER|VERSION_EQUAL|VERSION_LESS_EQUAL|VERSION_GREATER_EQUAL|IN_LIST|PATH_EQUAL)$"))

(foreach_command
  arguments: (argument_list
    .
    (unquoted_argument) @variable))

((foreach_command
  arguments: (argument_list
    (_)
    (unquoted_argument) @keyword))
  (#match? @keyword "^(IN|LISTS|ITEMS|ZIP_LISTS|RANGE)$"))

; The variable that set(), unset() and option() name.
((command
  name: (identifier) @_name
  arguments: (argument_list
    .
    (unquoted_argument) @variable))
  (#match? @_name "^(set|unset|option|SET|UNSET|OPTION)$"))

; Definitions
; -----------

(function_command
  arguments: (argument_list
    (_)
    (unquoted_argument) @variable.parameter))

(macro_command
  arguments: (argument_list
    (_)
    (unquoted_argument) @variable.parameter))

(function_command
  arguments: (argument_list
    .
    (unquoted_argument) @function))

(macro_command
  arguments: (argument_list
    .
    (unquoted_argument) @function.macro))

; Variable references
; -------------------

(variable) @variable

((variable) @variable.builtin
  (#match? @variable.builtin "^(CMAKE|PROJECT)_"))

(variable_reference
  [
    "${"
    "$ENV{"
    "$CACHE{"
    "}"
  ] @punctuation.special)

; Generator expressions
; ---------------------

; The name: the first piece of text, unless a nested expression comes first.
(generator_expression
  .
  (genex_text) @function.builtin)

(generator_expression
  [
    "$<"
    ">"
  ] @punctuation.special)

(generator_expression
  [
    ":"
    ","
  ] @punctuation.delimiter)

; Comments and punctuation
; ------------------------

[
  (line_comment)
  (bracket_comment)
] @comment

[
  "("
  ")"
] @punctuation.bracket
