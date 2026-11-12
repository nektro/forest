# A comment
# <- comment
#[[ A bracket
    comment ]]
# <- comment
cmake_minimum_required(VERSION 3.20)
# <- function.builtin
#                     ^ punctuation.bracket
project(demo LANGUAGES CXX)
# <- function.builtin
option(DEMO_TESTS "Build the tests" ON)
#      ^ variable
#                 ^ string
#                                   ^ boolean
set(SOURCES main.cpp "${CMAKE_CURRENT_SOURCE_DIR}/util.cpp" [=[raw]=])
#   ^ variable
#                     ^ punctuation.special
#                       ^ variable.builtin
#                                                           ^ string
add_library(demo ${SOURCES})
#                ^ punctuation.special
#                  ^ variable
target_compile_options(demo PRIVATE $<$<CONFIG:Debug>:-O0>)
#                                   ^ punctuation.special
#                                       ^ function.builtin
#                                             ^ punctuation.delimiter
message(STATUS "tab\there")
#                  ^ string.escape
if(DEMO_TESTS AND NOT WIN32)
# <- keyword.conditional
#             ^ keyword.operator
#                 ^ keyword.operator
  foreach(test IN LISTS TESTS)
# ^ keyword.repeat
#         ^ variable
#              ^ keyword
    add_test(NAME ${test} COMMAND ${test})
  endforeach()
# ^ keyword.repeat
elseif(EXISTS "$ENV{HOME}/x")
# <- keyword.conditional
#      ^ keyword.operator
endif()
# <- keyword.conditional
function(demo_add name)
# <- keyword.function
#        ^ function
#                 ^ variable.parameter
  my_helper(${name})
# ^ function.call
  return()
# ^ keyword.return
endfunction()
# <- keyword.function
macro(demo_macro arg)
#     ^ function.macro
#                ^ variable.parameter
endmacro()
