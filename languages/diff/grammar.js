/**
 * @file Diff and patch grammar for tree-sitter
 * @license MIT
 *
 * Unified diffs (`diff -u`, `git diff`, `git format-patch`, `hg diff`,
 * `svn diff`), git's combined diffs for merges (`diff --cc`), context diffs
 * (`diff -c`) and normal diffs (`diff`), with no external scanner.
 *
 * Without a scanner the line counts in a hunk header cannot be used to find
 * the end of the hunk, so lines are classified by how they start:
 *
 * - Newlines are extras. A line-start token can follow any newline; tokens
 *   inside a line are `token.immediate`, so they never match at the start of
 *   the next one. Blank lines vanish, which is what a mailer that strips the
 *   space from empty context lines needs.
 * - Lexical precedence beats match length in tree-sitter, so the markers that
 *   start a header line (`--- `, `diff `, `@@ `, `index `) win over a whole
 *   line read as a hunk line or as text. Hunk lines win over text, and every
 *   token inside a line wins over every line-start token.
 * - A hunk runs until a line that cannot be in it. `--- ` after a hunk is
 *   either a deleted line (`-- x`) or the start of the next file; the parser
 *   follows both and keeps the file when a `+++ ` line follows.
 * - Lines with no `@@` header before them make a hunk only at the start of
 *   the input, after a line of text or after the file names. Anywhere else
 *   the parser would have to choose between continuing a hunk and starting
 *   one at every line.
 */

/* eslint-disable arrow-parens */
/* eslint-disable camelcase */
/* eslint-disable-next-line spaced-comment */
/// <reference types="tree-sitter-cli/dsl" />
// @ts-check

const PREC = {
  TEXT: -1,
  // A line that is only `---`, and a deleted line in a hunk with no header,
  // which cannot be `---`.
  SEPARATOR: 1,
  // Hunk lines.
  LINE: 2,
  // Context-diff (`- x`) and combined-diff (`--x`) lines over unified ones,
  // which are valid after them too.
  WIDE_LINE: 3,
  // Markers that start a header line.
  MARKER: 4,
  // Anything inside a line, after its first token.
  INLINE: 6,
};

// The rest of a line.
const REST = /[^\r\n]+/;

/** A token that starts a hunk line and runs to the end of it. */
const line = (re, p = PREC.LINE) => token(prec(p, re));

/** A token that starts a header line. */
const marker = (s) => token(prec(PREC.MARKER, s));

/** A token inside a line. */
const inline = (s) => token.immediate(prec(PREC.INLINE, s));

/** One or more `rule`s separated by `sep`. */
const sep1 = (rule, sep) => seq(rule, repeat(seq(sep, rule)));

module.exports = grammar({
  name: 'diff',

  extras: _ => [/\r?\n/],

  conflicts: $ => [
    // `--- x` after a hunk: a deleted `-- x`, or the start of the next file.
    [$.hunk],
    [$.combined_hunk],
  ],

  rules: {
    source_file: $ => seq(
      optional(alias($._headerless_hunk, $.hunk)),
      repeat($._item),
    ),

    _item: $ => choice(
      $.file_diff,
      $._hunk,
      $.binary_files,
      $._separator,
      $.signature,
      $._text,
    ),

    // ---------------------------------------------------------------------
    // Files
    // ---------------------------------------------------------------------

    // One file's changes. Started by a `diff` command line, an svn `Index:`
    // line, or the old and new file names.
    file_diff: $ => prec.right(choice(
      seq(
        choice($.command, $.svn_index),
        repeat($._extended_header),
        optional($._file_names),
        repeat($._hunk),
      ),
      seq($._file_names, repeat($._hunk)),
    )),

    // `diff --git a/x b/x`, `diff -ruN old new`, `diff -r 1a2b file`.
    command: $ => seq(
      alias(marker(/diff[ \t]+/), 'diff'),
      sep1(choice($.option, $.argument), inline(/[ \t]+/)),
    ),

    option: _ => inline(/-[^\s]*/),

    argument: _ => inline(/[^\s-][^\s]*/),

    // svn's `Index: path`, usually followed by a line of `=`.
    svn_index: $ => seq(alias(marker('Index: '), 'Index:'), $.path),

    _file_names: $ => seq(
      choice(
        // Unified: `--- old` then `+++ new`.
        seq(
          alias($._dash_file, $.old_file),
          alias($._plus_file, $.new_file),
        ),
        // Context: `*** old` then `--- new`.
        seq(
          alias($._star_file, $.old_file),
          alias($._dash_file, $.new_file),
        ),
      ),
      optional(alias($._headerless_hunk, $.hunk)),
    ),

    _dash_file: $ => prec.dynamic(1, seq(alias(marker('--- '), '---'), $._file_name)),
    _plus_file: $ => seq(alias(marker('+++ '), '+++'), $._file_name),
    _star_file: $ => seq(alias(marker('*** '), '***'), $._file_name),

    // `a/src/main.c`, then an optional tab and timestamp (`diff -u`) or
    // revision (`svn diff`).
    _file_name: $ => choice(
      seq($.path, optional($._timestamp)),
      // `--- \t1970-01-01 ...`, as some tools write for a new file.
      $._timestamp,
    ),

    _timestamp: $ => seq(inline('\t'), optional($.timestamp)),

    path: _ => inline(/[^\t\r\n]+/),

    timestamp: _ => inline(REST),

    // git's extended headers, between `diff --git` and `---`.
    _extended_header: $ => choice(
      $.index,
      $.file_mode,
      $.similarity,
      $.rename,
      $.copy,
      $.binary_files,
      $.binary_patch,
      $.separator,
    ),

    // `index 1a2b3c4..5d6e7f8 100644`, or `index 1a2b,3c4d..5e6f` for a
    // merge.
    index: $ => seq(
      alias(marker(/index +/), 'index'),
      sep1($.hash, inline(',')),
      // Some tools write `...`.
      inline(/\.\.\.?/),
      $.hash,
      optional(seq(inline(' '), $.mode)),
    ),

    hash: _ => inline(/[0-9a-fA-F]+/),

    // `old mode 100644`, `new file mode 100755`, `deleted file mode
    // 100644,100644` and the combined `mode 100644,100644..100755`.
    file_mode: $ => seq(
      choice(
        alias(marker('old mode '), 'old mode'),
        alias(marker('new mode '), 'new mode'),
        alias(marker('new file mode '), 'new file mode'),
        alias(marker('deleted file mode '), 'deleted file mode'),
        alias(marker('mode '), 'mode'),
      ),
      sep1($.mode, inline(choice(',', '..'))),
    ),

    mode: _ => inline(/[0-7]+/),

    similarity: $ => seq(
      choice(
        alias(marker('similarity index '), 'similarity index'),
        alias(marker('dissimilarity index '), 'dissimilarity index'),
      ),
      $.percentage,
    ),

    percentage: _ => inline(/\d+%/),

    // `rename from`/`rename to`, and the older `rename old`/`rename new`.
    rename: $ => seq(
      choice(
        alias(marker('rename from '), 'rename from'),
        alias(marker('rename to '), 'rename to'),
        alias(marker('rename old '), 'rename old'),
        alias(marker('rename new '), 'rename new'),
      ),
      $.path,
    ),

    copy: $ => seq(
      choice(
        alias(marker('copy from '), 'copy from'),
        alias(marker('copy to '), 'copy to'),
      ),
      $.path,
    ),

    // `Binary files a/x and b/x differ`, from git and GNU diff.
    binary_files: _ => marker(/Binary files [^\r\n]* differ/),

    // `GIT binary patch`, then a `literal` or `delta` block of base85 for the
    // new contents and another for the old.
    binary_patch: $ => prec.right(seq(
      alias(marker('GIT binary patch'), 'GIT binary patch'),
      repeat($.binary_hunk),
    )),

    binary_hunk: $ => prec.right(seq(
      choice(
        alias(marker('literal '), 'literal'),
        alias(marker('delta '), 'delta'),
      ),
      $.size,
      repeat($.binary_data),
    )),

    size: _ => inline(/\d+/),

    // A length character, then base85.
    binary_data: _ => line(/[A-Za-z][0-9A-Za-z!#$%&()*+;<=>?@^_`{|}~-]*/),

    // ---------------------------------------------------------------------
    // Unified hunks
    // ---------------------------------------------------------------------

    _hunk: $ => choice(
      $.hunk,
      $.combined_hunk,
      $.context_hunk,
      $.normal_hunk,
    ),

    // `@@ -1,3 +1,4 @@ heading` and its lines.
    hunk: $ => seq($.hunk_header, repeat($._hunk_line)),

    // Lines with no header, as in a snippet or a commit message. None can be
    // `---`, a separator, or start with `--- `, a file name.
    _headerless_hunk: $ => repeat1(choice(
      $.context,
      $.addition,
      alias($._headerless_deletion, $.deletion),
      $.no_newline,
    )),

    hunk_header: $ => seq(
      alias(marker('@@ '), '@@'),
      field('old', $.range),
      inline(' '),
      field('new', $.range),
      alias(inline(/ @@/), '@@'),
      optional($._heading),
    ),

    // `-1,3` or `+1`: the first line and an optional count.
    range: $ => seq(
      inline(/[-+]/),
      field('start', $.number),
      optional(seq(inline(','), field('count', $.number))),
    ),

    number: _ => inline(/\d+/),

    // The text after the closing `@@`, often the enclosing function.
    _heading: $ => seq(inline(/[ \t]+/), optional($.heading)),

    heading: _ => inline(REST),

    _hunk_line: $ => choice(
      $.context,
      $.addition,
      $.deletion,
      $.no_newline,
    ),

    context: _ => line(/ [^\r\n]*/),

    addition: _ => line(/\+[^\r\n]*/),

    deletion: $ => choice(
      line(/-[^\r\n]*/),
      $._dash_deletion,
    ),

    // `--- ` starts a marker that wins over the line token. The line is also
    // read as the start of the next file, which wins if a `+++ ` line
    // follows.
    _dash_deletion: $ => seq(
      alias(marker('--- '), '---'),
      optional(alias(inline(REST), $.deleted_text)),
    ),

    // `-` and anything but `-- ` (a file name) or `--` and the end of the
    // line (a separator).
    _headerless_deletion: _ => line(/-(-(-[^ \r\n][^\r\n]*|[^-\r\n][^\r\n]*)?|[^-\r\n][^\r\n]*)?/, PREC.SEPARATOR),

    // `\ No newline at end of file`.
    no_newline: _ => line(/\\[^\r\n]*/),

    // ---------------------------------------------------------------------
    // Combined hunks
    // ---------------------------------------------------------------------

    // git's combined diff for a merge with two parents: `@@@ -1,2 -1,2 +1,3
    // @@@`, then lines with a column per parent.
    combined_hunk: $ => seq(
      $.combined_hunk_header,
      repeat($._combined_line),
    ),

    combined_hunk_header: $ => seq(
      alias(marker('@@@ '), '@@@'),
      sep1($.range, inline(' ')),
      alias(inline(/ @@@/), '@@@'),
      optional($._heading),
    ),

    _combined_line: $ => choice(
      alias(line(/  [^\r\n]*/, PREC.WIDE_LINE), $.context),
      alias(line(/(\+\+|\+ | \+)[^\r\n]*/, PREC.WIDE_LINE), $.addition),
      alias($._combined_deletion, $.deletion),
      $.no_newline,
    ),

    _combined_deletion: $ => choice(
      line(/(--|- | -)[^\r\n]*/, PREC.WIDE_LINE),
      $._dash_deletion,
    ),

    // ---------------------------------------------------------------------
    // Context hunks
    // ---------------------------------------------------------------------

    // A context diff's hunk:
    //
    //   ***************
    //   *** 1,4 ****
    //   ...old lines
    //   --- 1,5 ----
    //   ...new lines
    context_hunk: $ => seq(
      alias(marker(/\*{15}/), '***************'),
      optional($._heading),
      field('old', $.old_lines),
      field('new', $.new_lines),
    ),

    old_lines: $ => seq(
      alias(marker('*** '), '***'),
      alias($._context_range, $.range),
      alias(inline(/ \*{4}/), '****'),
      repeat($._context_line),
    ),

    new_lines: $ => prec.right(seq(
      alias(marker('--- '), '---'),
      alias($._context_range, $.range),
      alias(inline(/ -{4}/), '----'),
      repeat($._context_line),
    )),

    // `1,4`: the first and last lines.
    _context_range: $ => seq(
      field('start', $.number),
      optional(seq(inline(','), field('end', $.number))),
    ),

    _context_line: $ => choice(
      alias(line(/  [^\r\n]*/, PREC.WIDE_LINE), $.context),
      alias(line(/! [^\r\n]*/, PREC.WIDE_LINE), $.change),
      alias(line(/\+ [^\r\n]*/, PREC.WIDE_LINE), $.addition),
      alias(line(/- [^\r\n]*/, PREC.WIDE_LINE), $.deletion),
      $.no_newline,
    ),

    // ---------------------------------------------------------------------
    // Normal hunks
    // ---------------------------------------------------------------------

    // A normal diff's hunk: `2,3c2,4`, then `< old` lines, `---` and
    // `> new` lines.
    normal_hunk: $ => prec.right(seq(
      $.change_command,
      repeat(choice(
        alias(line(/<( [^\r\n]*)?/), $.deletion),
        alias($._separator_line, '---'),
        alias(line(/>( [^\r\n]*)?/), $.addition),
        $.no_newline,
      )),
    )),

    change_command: _ => marker(/\d+(,\d+)?[acd]\d+(,\d+)?/),

    // ---------------------------------------------------------------------
    // Around the diffs
    // ---------------------------------------------------------------------

    // A line that is only `---` (the end of the commit message in `git
    // format-patch`) or `=` (under svn's `Index:`). In a hunk, `---` is a
    // deleted line.
    separator: $ => choice(
      alias($._separator_line, '---'),
      alias(marker(/===+/), '==='),
    ),

    _separator: $ => prec.right(seq($.separator, optional($.diffstat))),

    // What `git format-patch` puts after its `---`:
    //
    //    src/main.c | 12 +++++++-----
    //    logo.png   | Bin 1024 -> 2048 bytes
    //    2 files changed, 7 insertions(+), 5 deletions(-)
    diffstat: $ => prec.right(choice(
      seq(repeat1($.diffstat_file), optional($.diffstat_summary)),
      $.diffstat_summary,
    )),

    diffstat_file: $ => seq(
      // Over text, which is valid here too.
      token(prec(PREC.WIDE_LINE, / +/)),
      alias(inline(/[^|\r\n]*[^ |\r\n]/), $.path),
      alias(inline(/ *\|/), '|'),
      optional(seq(
        inline(/ +/),
        choice(
          seq(
            $.number,
            optional(seq(
              inline(' '),
              optional(alias(inline(/\++/), $.added)),
              optional(alias(inline(/-+/), $.removed)),
            )),
          ),
          alias(inline(/Bin[^\r\n]*/), $.binary),
        ),
      )),
    ),

    diffstat_summary: _ => token(prec(PREC.MARKER, / +\d+ files? changed[^\r\n]*/)),

    _separator_line: _ => line(/---\r?\n/, PREC.SEPARATOR),

    // `-- ` and the line after it: the end of a `git format-patch` mail.
    signature: $ => prec.right(seq(
      alias(marker(/-- \r?\n/), '-- '),
      optional($.text),
    )),

    // Lines of text, then the lines of a hunk with no header.
    _text: $ => prec.right(seq(
      $.text,
      optional(alias($._headerless_hunk, $.hunk)),
    )),

    // Anything else: commit messages, mail headers, `Only in ...`.
    text: _ => token(prec(PREC.TEXT, REST)),
  },
});
