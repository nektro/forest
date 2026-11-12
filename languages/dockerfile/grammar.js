/**
 * @file Dockerfile grammar for tree-sitter
 * @license MIT
 *
 * Follows the Dockerfile reference (https://docs.docker.com/reference/dockerfile/)
 * as BuildKit's `docker/dockerfile:1` frontend reads it, with no external
 * scanner:
 *
 * - Newlines end instructions. A backslash at the end of a line joins it to
 *   the next, and comment and blank lines inside such a continuation are
 *   skipped, as BuildKit does.
 * - Shell-form commands (`RUN`, `CMD`, `ENTRYPOINT`, `HEALTHCHECK CMD`) are
 *   kept as opaque `shell_fragment` text for a shell grammar to inject into;
 *   exec form (`["a", "b"]`) is parsed as a JSON string array.
 * - Other arguments are words: unquoted text, quoted strings and `$VAR` /
 *   `${VAR...}` expansions, concatenated when nothing separates them.
 * - Heredocs (`RUN <<EOF`, `COPY <<EOF /dest`) are supported for up to three
 *   per instruction. A regular grammar cannot match a closing delimiter to its
 *   opener, so a body ends at the first line that is only an upper-case
 *   identifier (`EOF`, `EOT`, `SCRIPT_END`). See README.md.
 *
 * Only `\` is a line continuation. Parser directives, `# escape=` included,
 * are comments and do not change that.
 */

/// <reference types="tree-sitter-cli/dsl" />
// @ts-check

// Instruction keywords are case-insensitive. Returns a regex matching `word`
// in any case, aliased to the upper-case word so queries can match "FROM".
function keyword(word) {
  const re = word.split('').map(c => `[${c.toUpperCase()}${c.toLowerCase()}]`).join('');
  return alias(new RegExp(re), word);
}

// Shell-form text. A fragment runs to the end of the line, a heredoc marker
// (`<<EOF`), or a line continuation. `<` is allowed when it does not start a
// heredoc: `a < b`, `<<<` here-strings, `$((1 << 2))` and `<\path` stay in the
// fragment. A backslash is allowed when it does not end the line.
const SHELL_UNIT = [
  String.raw`[^\\\r\n<]`,
  String.raw`\\+[^\\\s]`,
  String.raw`\\+[ \t]+[^\\\s]`,
  String.raw`<[^<\\\r\n]`,
  String.raw`<\\+[^\\\s]`,
  String.raw`<<[^A-Za-z_"'\-\\\r\n]`,
].join('|');

// BuildKit reads `[...]` after RUN, CMD, ENTRYPOINT and SHELL as exec form
// when it is a JSON string array, and as shell form otherwise. A regular
// expression can tell the two apart: these match the start of a line that
// began like a JSON array and then stopped being one, so `[ "$X" = "y" ]`,
// `["a"] && b` and `["c:\windows"]` (a bad escape) are shell form.
const JSON_WS = String.raw`[ \t]*`;
const JSON_STRING_CHAR = String.raw`([^"\\\r\n]|\\["\\/bfnrtu])`;
const JSON_STRING = `"${JSON_STRING_CHAR}*"`;
// `[` and zero or more strings, after which `,` or `]` may follow.
const JSON_OPEN = String.raw`\[` + JSON_WS;
const JSON_ITEMS = `${JSON_OPEN}${JSON_STRING}${JSON_WS}(,${JSON_WS}${JSON_STRING}${JSON_WS})*`;
const NOT_JSON = [
  // `[` then neither a string nor `]`
  JSON_OPEN + String.raw`[^"\]\s\\]`,
  // a string then neither `,` nor `]`
  JSON_ITEMS + String.raw`[^,\]\s\\]`,
  // `,` then not a string
  `${JSON_ITEMS},${JSON_WS}` + String.raw`[^"\s\\]`,
  // the closing `]` then more text
  `(${JSON_OPEN}|${JSON_ITEMS})` + String.raw`\]` + JSON_WS + String.raw`[^\s\\]`,
  // an escape JSON does not have
  `(${JSON_OPEN}|${JSON_ITEMS},${JSON_WS})"${JSON_STRING_CHAR}*` + String.raw`\\[^"\\/bfnrtu\s]`,
].map(re => `(${re})`);

// The first fragment of a command may not look like a JSON array, nor, after
// RUN, like an option (`--mount=...`).
const SHELL_FIRST_UNIT = [
  String.raw`[^\\\r\n<\[\-\s]`,
  String.raw`\\+[^\\\s]`,
  String.raw`\\+[ \t]+[^\\\s]`,
  String.raw`<[^<\\\r\n]`,
  String.raw`<\\+[^\\\s]`,
  String.raw`<<[^A-Za-z_"'\-\\\r\n]`,
  ...NOT_JSON,
].join('|');
const RUN_FIRST = `(${SHELL_FIRST_UNIT}|-[^\\-\\s\\\\])(${SHELL_UNIT})*`;
// CMD and ENTRYPOINT take no options: `CMD -- --flag` is shell form.
const CMD_FIRST = `(${SHELL_FIRST_UNIT}|-)(${SHELL_UNIT})*`;

// Unquoted word text: anything but whitespace, quotes and `$`, with `\x`
// escapes (including `\ `). Every `$` starts an expansion.
//
// No alternative here may continue past a character and then fail, as
// `\$[^A-Za-z_]` would on `#$x`: the lexer then forgets that `#` was a
// complete word piece and lexes `#$x ...` as a comment.
const WORD_UNIT = String.raw`[^\s"'$\\]|\\[^\s]|\\[ \t]+[^\s\\]`;
// A word may start with `[` only when it does not look like a JSON array:
// `[::1]:80` is a word, `["/data"]` is not.
const WORD_FIRST_UNIT = String.raw`[^\s"'$\\\[]|\[[^"\s\]\\]|\\[^\s]|\\[ \t]+[^\s\\]`;

// Lexical precedence, which tree-sitter applies before match length. Where a
// line could start with `#`, a word beats a comment, and a comment beats shell
// text (so a comment line inside a continued RUN is a comment).
//
// A piece of a word that directly follows another (`foo"bar"`, `=value`),
// and text inside strings and `${...}`, outranks everything that could start
// a new word, command or comment there.
const IMM_PREC = 3;
const WORD_PREC = 2;
const COMMENT_PREC = 1;

module.exports = grammar({
  name: 'dockerfile',

  extras: $ => [/[ \t\f]/, $._line_continuation, $._final_backslash, $.comment],

  supertypes: $ => [$._instruction],

  rules: {
    // Parser directives (`# syntax=...`, `# escape=...`, `# check=...`) are
    // comments here.
    source_file: $ => seq(
      repeat(choice(seq($._instruction, $._newline), $._newline)),
      optional($._instruction),
    ),

    _instruction: $ => choice(
      $.from_instruction,
      $.run_instruction,
      $.cmd_instruction,
      $.label_instruction,
      $.maintainer_instruction,
      $.expose_instruction,
      $.env_instruction,
      $.add_instruction,
      $.copy_instruction,
      $.entrypoint_instruction,
      $.volume_instruction,
      $.user_instruction,
      $.workdir_instruction,
      $.arg_instruction,
      $.onbuild_instruction,
      $.stopsignal_instruction,
      $.healthcheck_instruction,
      $.shell_instruction,
    ),

    // FROM [--platform=<platform>] <image> [AS <name>]
    from_instruction: $ => seq(
      keyword('FROM'),
      repeat($._option),
      $.image_spec,
      optional(seq(keyword('AS'), field('as', $.image_alias))),
    ),

    // name[:tag][@digest]
    image_spec: $ => seq(
      field('name', $.image_name),
      optional(seq(token.immediate(':'), field('tag', $.image_tag))),
      optional(seq(token.immediate('@'), field('digest', $.image_digest))),
    ),

    // A `:` belongs to the name when it is a registry port, `host:5000/repo`.
    image_name: $ => seq(
      choice(token(prec(WORD_PREC, /([^\s:@$"'\\\[-]|:[0-9]+\/)([^\s:@$"'\\]|:[0-9]+\/)*/)), $.expansion),
      repeat(choice(
        token.immediate(prec(IMM_PREC, /([^\s:@$"'\\]|:[0-9]+\/)+/)),
        alias($._imm_expansion, $.expansion),
      )),
    ),

    image_tag: $ => repeat1(choice(
      token.immediate(prec(IMM_PREC, /[^\s@$"'\\]+/)),
      alias($._imm_expansion, $.expansion),
    )),

    image_digest: $ => repeat1(choice(
      token.immediate(prec(IMM_PREC, /[^\s$"'\\]+/)),
      alias($._imm_expansion, $.expansion),
    )),

    image_alias: $ => $._word,

    // RUN [--mount=...] <command>
    run_instruction: $ => seq(
      keyword('RUN'),
      repeat($._option),
      $._command_with_heredocs,
    ),

    cmd_instruction: $ => seq(keyword('CMD'), $._command),

    entrypoint_instruction: $ => seq(keyword('ENTRYPOINT'), $._command),

    shell_instruction: $ => seq(keyword('SHELL'), $.json_string_array),

    // CMD and ENTRYPOINT
    _command: $ => choice(
      $.json_string_array,
      alias($._cmd_shell_command, $.shell_command),
    ),

    _cmd_shell_command: $ => seq(
      alias($._cmd_fragment_first, $.shell_fragment),
      repeat(alias($._shell_fragment_rest, $.shell_fragment)),
    ),

    // RUN. Shell form may contain heredoc markers, each followed by a body
    // after the line ends.
    _command_with_heredocs: $ => choice(
      $.json_string_array,
      $.shell_command,
      ...heredocForms($, n => alias($[`_shell_heredoc_${n}`], $.shell_command)),
    ),

    shell_command: $ => $._shell_fragments,

    _shell_fragments: $ => seq(
      alias($._shell_fragment_first, $.shell_fragment),
      repeat(alias($._shell_fragment_rest, $.shell_fragment)),
    ),

    _shell_rest: $ => repeat1(alias($._shell_fragment_rest, $.shell_fragment)),

    _shell_heredoc_1: $ => seq(
      optional($._shell_fragments),
      $.heredoc_marker,
      optional($._shell_rest),
    ),
    _shell_heredoc_2: $ => seq($._shell_heredoc_1, $.heredoc_marker, optional($._shell_rest)),
    _shell_heredoc_3: $ => seq($._shell_heredoc_2, $.heredoc_marker, optional($._shell_rest)),

    _shell_fragment_first: _ => new RegExp(RUN_FIRST),
    _cmd_fragment_first: _ => new RegExp(CMD_FIRST),
    _shell_fragment_rest: _ => new RegExp(`(${SHELL_UNIT})+`),

    // <<EOF, <<-EOF, <<"EOF", <<'EOF'
    heredoc_marker: _ => token(prec(IMM_PREC, seq(
      '<<',
      optional('-'),
      choice(
        /[A-Za-z_][A-Za-z0-9_.\-]*/,
        /"[^"\r\n]+"/,
        /'[^'\r\n]+'/,
      ),
    ))),

    heredoc_body: $ => seq(
      repeat(seq($.heredoc_line, $._newline)),
      $.heredoc_end,
    ),

    // A body ends at a line that is only an upper-case identifier. Lower-case
    // delimiters are left alone so that shell heredocs nested in a body
    // (`cat <<eot > file` inside `RUN <<EOF`) do not end it. Declared before
    // heredoc_line: a line that both match is an end. Both outrank comment, so
    // a `# ...` line in a body is part of the body.
    heredoc_end: _ => token(prec(WORD_PREC, /[A-Z_][A-Z0-9_]*/)),

    heredoc_line: _ => token(prec(WORD_PREC, /[^\r\n]+/)),

    // ["executable", "param1", "param2"]
    json_string_array: $ => seq(
      '[',
      optional(seq(
        $.json_string,
        repeat(seq(',', $.json_string)),
      )),
      ']',
    ),

    json_string: $ => seq(
      '"',
      repeat(choice(
        token.immediate(prec(IMM_PREC, /[^"\\\r\n]+/)),
        $.json_escape_sequence,
      )),
      token.immediate('"'),
    ),

    json_escape_sequence: _ => token.immediate(seq(
      '\\',
      /(["\\/bfnrt]|u[0-9a-fA-F]{4})/,
    )),

    // LABEL <key>=<value> [<key>=<value>...]
    // LABEL --unset <key>... (BuildKit labs) takes bare keys.
    label_instruction: $ => seq(
      keyword('LABEL'),
      choice(
        repeat1($.label_pair),
        alias($._legacy_label_pair, $.label_pair),
        seq(repeat1($._option), choice(repeat1($.label_pair), repeat1($._label_key))),
      ),
    ),

    label_pair: $ => seq(
      field('key', $._label_key),
      $._assign,
      optional(field('value', alias($._imm_word, $.value))),
    ),

    // LABEL key value with spaces (deprecated)
    _legacy_label_pair: $ => seq(field('key', $._label_key), repeat1(field('value', $.value))),

    _label_key: $ => choice(
      alias(token(prec(WORD_PREC, /[^\s="'$\\]+/)), $.label_key),
      $.double_quoted_string,
      $.single_quoted_string,
      $.expansion,
    ),

    // MAINTAINER <name> (deprecated)
    maintainer_instruction: $ => seq(keyword('MAINTAINER'), alias($._words, $.value)),

    // EXPOSE <port>[/<protocol>]...
    expose_instruction: $ => seq(keyword('EXPOSE'), repeat1($.port)),

    port: $ => $._word,

    // ENV <key>=<value>... or ENV <key> <value> (deprecated)
    // ENV --unset <name>... (BuildKit labs) takes bare names.
    env_instruction: $ => seq(
      keyword('ENV'),
      choice(
        repeat1($.env_pair),
        alias($._legacy_env_pair, $.env_pair),
        seq(repeat1($._option), choice(repeat1($.env_pair), repeat1($.variable))),
      ),
    ),

    env_pair: $ => seq(
      field('name', $.variable),
      $._assign,
      optional(field('value', alias($._imm_word, $.value))),
    ),

    _legacy_env_pair: $ => seq(field('name', $.variable), repeat1(field('value', $.value))),

    // ARG <name>[=<default>]...
    arg_instruction: $ => seq(keyword('ARG'), repeat1($.arg_pair)),

    arg_pair: $ => seq(
      field('name', $.variable),
      optional(seq(
        $._assign,
        optional(field('default', alias($._imm_word, $.value))),
      )),
    ),

    // The `=` of key=value. Its precedence beats a value word starting with
    // `=`, which the deprecated `ENV key value` form would otherwise allow.
    _assign: _ => alias(token.immediate(prec(IMM_PREC + 1, '=')), '='),

    variable: _ => token(prec(WORD_PREC, /[^\s="'$\\]+/)),

    // ADD/COPY [--chown=...] <src>... <dest>, or a JSON array of paths
    add_instruction: $ => seq(keyword('ADD'), repeat($._option), $._paths_with_heredocs),

    copy_instruction: $ => seq(keyword('COPY'), repeat($._option), $._paths_with_heredocs),

    _paths_with_heredocs: $ => choice(
      $.json_string_array,
      $._paths,
      ...heredocForms($, n => $[`_path_heredoc_${n}`]),
    ),

    _paths: $ => repeat1($.path),

    _path_heredoc_1: $ => seq(optional($._paths), $.heredoc_marker, optional($._paths)),
    _path_heredoc_2: $ => seq($._path_heredoc_1, $.heredoc_marker, optional($._paths)),
    _path_heredoc_3: $ => seq($._path_heredoc_2, $.heredoc_marker, optional($._paths)),

    path: $ => $._word,

    // VOLUME ["/data"] or VOLUME /var/log /var/db
    volume_instruction: $ => seq(
      keyword('VOLUME'),
      repeat($._option),
      choice($.json_string_array, $._paths),
    ),

    // USER <user>[:<group>]
    user_instruction: $ => seq(keyword('USER'), $.user),

    user: $ => $._words,

    workdir_instruction: $ => seq(keyword('WORKDIR'), alias($._words, $.path)),

    // ONBUILD <instruction>
    onbuild_instruction: $ => seq(keyword('ONBUILD'), $._instruction),

    stopsignal_instruction: $ => seq(keyword('STOPSIGNAL'), $.signal),

    signal: $ => $._words,

    // HEALTHCHECK [--interval=...] CMD <command>, or HEALTHCHECK NONE
    healthcheck_instruction: $ => seq(
      keyword('HEALTHCHECK'),
      choice(
        keyword('NONE'),
        seq(repeat($._option), $.cmd_instruction),
      ),
    ),

    // Options, and a bare `--` that ends them (`COPY -- --file /dest`).
    _option: $ => choice($.param, alias($._double_dash, '--')),

    _double_dash: _ => token(prec(IMM_PREC, '--')),

    // --name or --name=value
    param: $ => seq(
      alias($._double_dash, '--'),
      field('name', alias(token.immediate(prec(IMM_PREC, /[A-Za-z][A-Za-z0-9\-]*/)), $.param_name)),
      optional(seq(
        $._assign,
        optional(field('value', alias($._imm_word, $.value))),
      )),
    ),

    value: $ => $._word,

    // A word is pieces with nothing between them: foo"bar"$BAZ is one word.
    _word: $ => seq(
      choice(
        token(prec(WORD_PREC, new RegExp(`(${WORD_FIRST_UNIT})(${WORD_UNIT})*`))),
        $.double_quoted_string,
        $.single_quoted_string,
        $.expansion,
      ),
      repeat($._imm_piece),
    ),

    _imm_word: $ => repeat1($._imm_piece),

    // MAINTAINER, USER, WORKDIR and STOPSIGNAL take the rest of the line as
    // one argument, spaces included: `WORKDIR /my dir` is one path.
    _words: $ => repeat1($._word),

    _imm_piece: $ => choice(
      token.immediate(prec(IMM_PREC, new RegExp(`(${WORD_UNIT})+`))),
      alias($._imm_double_quoted_string, $.double_quoted_string),
      alias($._imm_single_quoted_string, $.single_quoted_string),
      alias($._imm_expansion, $.expansion),
    ),

    double_quoted_string: $ => seq('"', $._double_quoted_rest),

    _imm_double_quoted_string: $ => seq(token.immediate(prec(IMM_PREC, '"')), $._double_quoted_rest),

    _double_quoted_rest: $ => seq(
      repeat(choice(
        // A line continuation inside the string. The joined line continues
        // the string.
        alias(token.immediate(prec(IMM_PREC + 1, /\\[ \t]*\r?\n([ \t\f]*\r?\n)*/)), $.line_continuation),
        token.immediate(prec(IMM_PREC, /[^"\\$\r\n]+/)),
        $.escape_sequence,
        alias($._imm_expansion, $.expansion),
      )),
      token.immediate('"'),
    ),

    escape_sequence: _ => token.immediate(/\\[^\r\n]/),

    single_quoted_string: _ => /'[^'\r\n]*'/,

    _imm_single_quoted_string: _ => token.immediate(prec(IMM_PREC, /'[^'\r\n]*'/)),

    // $VAR, ${VAR}, ${VAR:-default}, ${VAR#prefix}, ...
    expansion: $ => choice(
      seq('$', optional($._expansion_simple)),
      seq('${', $._expansion_braced),
    ),

    _imm_expansion: $ => choice(
      seq(token.immediate(prec(IMM_PREC, '$')), optional($._expansion_simple)),
      seq(token.immediate(prec(IMM_PREC, '${')), $._expansion_braced),
    ),

    // `$` before something other than a name (`$1`, `$ `, `$@`) is a lone
    // expansion. BuildKit leaves it as text.
    _expansion_simple: $ => alias(token.immediate(prec(IMM_PREC + 1, /[A-Za-z_][A-Za-z0-9_]*|[0-9]/)), $.variable),

    _expansion_braced: $ => seq(
      alias(token.immediate(/[A-Za-z_][A-Za-z0-9_]*/), $.variable),
      optional(seq(
        field('operator', alias(
          token.immediate(prec(IMM_PREC, choice(':-', ':+', ':?', '-', '+', '?', '#', '##', '%', '%%', '/', '//'))),
          $.expansion_operator,
        )),
        repeat(choice(
          alias(token.immediate(prec(IMM_PREC, /[^}$\\\r\n]+/)), $.expansion_word),
          $.escape_sequence,
          alias($._imm_expansion, $.expansion),
        )),
      )),
      token.immediate('}'),
    ),

    // A comment line, with its line ending, so that a comment between the
    // lines of a continued instruction does not end it. BuildKit only treats
    // `#` as a comment at the start of a line; elsewhere a word or shell text
    // starting with `#` outranks it.
    comment: _ => token(prec(COMMENT_PREC, /#[^\r\n]*(\r?\n([ \t\f]*\r?\n)*)?/)),

    // A newline, and any blank lines after it.
    _newline: _ => /\r?\n([ \t\f]*\r?\n)*/,

    // A backslash at the end of a line, and any blank lines after it, which
    // BuildKit drops from the joined instruction.
    _line_continuation: _ => /\\+[ \t]*\r?\n([ \t\f]*\r?\n)*/,

    // A backslash with nothing after it but the end of the file. BuildKit
    // ignores it. Everything else that starts with a backslash outranks it.
    _final_backslash: _ => token(prec(-1, /\\[ \t]*/)),
  },
});

// The 1-, 2- and 3-heredoc forms of an instruction: the line, then a body per
// marker. `line(n)` is the rule for a line with n markers.
function heredocForms($, line) {
  return [1, 2, 3].map(n => seq(
    line(n),
    ...Array.from({length: n}, () => seq($._newline, $.heredoc_body)).flat(),
  ));
}
