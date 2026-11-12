# tree-sitter-dockerfile

A [tree-sitter](https://tree-sitter.github.io) grammar for Dockerfiles, as
described by the [Dockerfile reference](https://docs.docker.com/reference/dockerfile/)
and read by BuildKit's `docker/dockerfile:1` frontend.

- **No external scanner.** Newlines end instructions; a backslash at the end of
  a line continues the instruction, and comment and blank lines inside a
  continuation are skipped, as BuildKit does. Heredocs are handled in
  `grammar.js` too, with the limits below.
- **Every instruction.** `FROM`, `RUN`, `CMD`, `LABEL`, `MAINTAINER`,
  `EXPOSE`, `ENV`, `ADD`, `COPY`, `ENTRYPOINT`, `VOLUME`, `USER`, `WORKDIR`,
  `ARG`, `ONBUILD`, `STOPSIGNAL`, `HEALTHCHECK` and `SHELL`, in any case, with
  `--option[=value]` flags and `--` to end them, exec and shell form, the
  deprecated `ENV key value` and `LABEL key value` forms, and BuildKit labs'
  `ENV`/`LABEL`/`VOLUME --unset`.
- **Parser directives** (`# syntax=`, `# escape=`, `# check=`) are plain
  comments.

## Tree shape

- `source_file` holds instructions and comments. `_instruction` is a
  supertype covering the `*_instruction` nodes.
- `from_instruction` has an `image_spec` with `name`, `tag` and `digest`
  fields, and an `as` field for the stage name. A `:` followed by digits and
  `/` stays in the name, so `localhost:5000/app:1.0` has the name
  `localhost:5000/app` and the tag `1.0`.
- Shell form is a `shell_command` of `shell_fragment` nodes: one per line, or
  split around heredoc markers. The text is not parsed; `queries/injections.scm`
  hands it to a `bash` grammar. Exec form is a `json_string_array`.
- `env_pair`, `arg_pair` and `label_pair` have `name` (or `key`) and `value`
  (or `default`) fields. `param` is `--name` with an optional `value`.
- Other arguments are role nodes (`path`, `value`, `port`, `user`, `signal`,
  `image_alias`) whose children are the pieces of the word (or, for
  `WORKDIR`, `USER`, `STOPSIGNAL` and `MAINTAINER`, of the words to the end of
  the line):
  `double_quoted_string`, `single_quoted_string` and `expansion` (`$VAR`, or
  `${VAR}` with an optional `expansion_operator` and `expansion_word`).
  Unquoted text has no node of its own.
- A heredoc is a `heredoc_marker` in the instruction's line and a
  `heredoc_body` (`heredoc_line` nodes, then `heredoc_end`) after it.

## Limits

- **Heredoc ends are guessed.** Matching a closing delimiter to its opener
  needs an external scanner, so a body ends at the first line that is only an
  upper-case identifier: `EOF`, `EOT`, `PY`, `SCRIPT_END`. So a lower-case
  delimiter (`<<eot`, `<<robots.txt`) is not seen to end the body, and a body
  line that is only an upper-case word ends it early, as an inner `BUNDLE`
  does in a `cat <<BUNDLE` nested in a `COPY <<-EOF` body. Shell heredocs
  nested in a body with lower-case delimiters, as buildkit's own
  `lint.Dockerfile` does, are fine. Up to three heredocs per instruction are
  supported.
- **`\` is the only line continuation.** `# escape=`` ` `` is a comment like
  any other and does not make the backtick a continuation, so Windows
  Dockerfiles that use it parse each line as its own instruction.
- **Exec form or shell form.** As in BuildKit, `[...]` is exec form when it is
  a JSON string array and shell form otherwise: `RUN [ "$X" = "y" ]`,
  `["a"] && b` and `["c:\windows"]` (a bad JSON escape) are shell form. The
  exception is a JSON array cut off by the end of the line (an unterminated
  string or a missing `]`), which is an error here.
- **`$` always starts an expansion.** `$1` or a `$` before a space is an
  `expansion` (with no `variable` in the second case); BuildKit leaves them as
  text.
- A `#` after an argument on the same line (`EXPOSE 80 # http`) is part of the
  arguments, as BuildKit reads it, not a comment. `WORKDIR`, `USER`,
  `STOPSIGNAL` and `MAINTAINER` take the rest of the line, spaces included.
- After a bare `--` that ends the options, an argument starting with `--` is
  still read as an option.
- Unknown instructions are errors.

## Validation

`script/check-dockerfiles.sh <dir>...` parses every `Dockerfile`,
`Containerfile`, `*.Dockerfile` and `Dockerfile.*` under the given directories
and lists the ones with syntax errors. `script/extract-go-dockerfiles.py` pulls
the Dockerfiles embedded as raw strings in Go tests out of a checkout, and
`script/extract-docs-examples.py` pulls the `dockerfile` code blocks out of a
saved copy of the [Dockerfile reference](https://docs.docker.com/reference/dockerfile/).

Results on 2026-11-11, against [moby/buildkit](https://github.com/moby/buildkit)
master (`8cd4dbe13`) and the reference as published that day:

| Input | Parse without errors |
| --- | --- |
| 61 Dockerfiles in the buildkit repository | 52 |
| 547 Dockerfiles embedded as raw strings in buildkit's Go sources | 531 |
| 156 `dockerfile` code blocks in the reference | 144 |

The 37 with errors:

| Count | Why |
| --- | --- |
| 11 | Synopsis lines in the reference, such as `COPY [--chown=<user>:<group>] <src> ... <dest>` |
| 11 | Invalid Dockerfiles from buildkit's tests and the reference: unknown instructions (`FNTRYPOINT`, `BADCMD`), `ENV` or `HEALTHCHECK` with no arguments, `HEALTHCHECK CONNECT`, `FROM ""`, unterminated quotes, a parser directive split by a continuation, and the edge cases in `parser_heredoc_test.go` |
| 6 | Go templates (`%s`, `{{.Name}}`) cut off where the test splices in more text |
| 3 | `# escape=`` ` `` (see Limits) |
| 2 | `<<eot` with a lower-case delimiter, in `dockerfile_parents_test.go` (see Limits) |
| 2 | A `cat <<BUNDLE` heredoc nested in a `COPY <<-EOF` body, in `dockerfile_sbom_test.go` (see Limits) |
| 2 | A JSON array cut off by the end of the line, which BuildKit reads as shell form (`jeztah-invalid-json-*`) |

## Queries

- `highlights.scm`: instruction keywords, image names, tags and digests,
  options, variables and expansions, strings, heredocs and comments.
- `injections.scm`: shell-form commands and `RUN` heredoc bodies as `bash`;
  comments as `comment`.
- `folds.scm`: multi-line instructions, JSON arrays and heredoc bodies.
- `tags.scm`: build stages (`FROM ... AS name`) and `ARG`/`ENV` names as
  definitions; `FROM <stage>` and `COPY --from=<stage>` as references.

## Development

```bash
tree-sitter generate --js-runtime bun
```

```bash
tree-sitter test
```

`tree-sitter test --update` writes expected trees without field names;
`script/update-corpus-fields.py` rewrites them with fields. Review the diff.
