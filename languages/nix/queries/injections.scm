((comment) @injection.content
  (#set! injection.language "comment"))

; Build phases and hooks are shell scripts:
;   buildPhase = '' … '';
(binding
  attrpath: (attrpath
    attr: (identifier) @_name .)
  expression: (indented_string_expression
    (string_fragment) @injection.content)
  (#match? @_name "^(unpack|patch|configure|build|check|install|fixup|installCheck|dist|shell)Phase$|^(pre|post)(Unpack|Patch|Configure|Build|Check|Install|Fixup|InstallCheck|Dist)$|^shellHook$|^(script|preStart|postStart|preStop|postStop)$")
  (#set! injection.language "bash")
  (#set! injection.combined))

; writeShellScript "name" '' … '', runCommand "name" { } '' … '' and the like.
(apply_expression
  function: [
    (variable_expression
      name: (identifier) @_function)
    (select_expression
      attrpath: (attrpath
        attr: (identifier) @_function .))
  ]
  argument: (indented_string_expression
    (string_fragment) @injection.content)
  (#match? @_function "^(writeShellScript|writeShellScriptBin|writeShellApplication|runCommand|runCommandLocal|runCommandCC|writeScript|writeScriptBin)$")
  (#set! injection.language "bash")
  (#set! injection.combined))

; A language named in a comment right before a string: /* lua */ '' … ''
((comment) @injection.language
  .
  [
    (indented_string_expression
      (string_fragment) @injection.content)
    (string_expression
      (string_fragment) @injection.content)
  ]
  (#match? @injection.language "^/\\*\\s*[a-zA-Z0-9_+-]+\\s*\\*/$")
  (#gsub! @injection.language "/%*%s*([%w%p]+)%s*%*/" "%1")
  (#set! injection.combined))
