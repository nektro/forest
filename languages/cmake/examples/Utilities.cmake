include_guard(GLOBAL)

# Appends a definition to a target, warning when it is already there.
function(greeter_add_definition target name)
  get_target_property(defs ${target} COMPILE_DEFINITIONS)
  if(defs AND "${name}" IN_LIST defs)
    message(WARNING "${target} already defines ${name}")
    return()
  endif()
  target_compile_definitions(${target} PRIVATE ${name})
endfunction()

macro(greeter_option var doc default)
  if(DEFINED ENV{${var}})
    set(${var} "$ENV{${var}}" CACHE STRING "${doc}" FORCE)
  else()
    set(${var} ${default} CACHE STRING "${doc}")
  endif()
endmacro()

set(script [=[
  print("brackets keep ]] and \"quotes\" as they are")
]=])

block(SCOPE_FOR VARIABLES)
  string(REPLACE ";" "\;" escaped "${script}")
  file(WRITE "${CMAKE_BINARY_DIR}/script.py" "${escaped}")
endblock()
