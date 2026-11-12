((comment) @injection.content
  (#set! injection.language "comment"))

; Shell form. The fragments of one command are injected together, so a shell
; grammar sees the command without the line continuations and comment lines
; BuildKit drops.
((shell_command
  (shell_fragment) @injection.content)
  (#set! injection.language "bash")
  (#set! injection.combined))

; RUN <<EOF bodies are scripts for the shell. COPY and ADD bodies are file
; contents of unknown type.
((run_instruction
  (heredoc_body) @injection.content)
  (#set! injection.language "bash"))
