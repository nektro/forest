cmake_minimum_required(VERSION 3.25)
project(Greeter VERSION 1.2.0 LANGUAGES CXX)

option(GREETER_BUILD_TESTS "Build the tests" ON)
set(CMAKE_CXX_STANDARD 20)

#[[
  The library, built static or shared depending on BUILD_SHARED_LIBS.
]]
add_library(greeter src/greeter.cpp src/format.cpp)
target_include_directories(greeter
  PUBLIC
    $<BUILD_INTERFACE:${CMAKE_CURRENT_SOURCE_DIR}/include>
    $<INSTALL_INTERFACE:include>)
target_compile_options(greeter PRIVATE
  $<$<CXX_COMPILER_ID:GNU,Clang>:-Wall -Wextra>
  $<$<CXX_COMPILER_ID:MSVC>:/W4>)

add_executable(greet src/main.cpp)
target_link_libraries(greet PRIVATE greeter)

if(GREETER_BUILD_TESTS AND NOT CMAKE_CROSSCOMPILING)
  enable_testing()
  foreach(name IN ITEMS hello goodbye)
    add_executable(test_${name} tests/${name}.cpp)
    target_link_libraries(test_${name} PRIVATE greeter)
    add_test(NAME ${name} COMMAND test_${name})
  endforeach()
endif()

install(TARGETS greeter greet)
