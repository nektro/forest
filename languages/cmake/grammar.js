/**
 * @file CMake grammar for tree-sitter
 * @license MIT
 *
 * The CMake language as described in cmake-language(7): command
 * invocations whose arguments are bracket, quoted or unquoted arguments,
 * with variable references (`${x}`, `$ENV{x}`, `$CACHE{x}`) and generator
 * expressions (`$<...>`) inside quoted and unquoted arguments.
 *
 * There is no external scanner. Two things usually need one:
 *
 * - Bracket arguments and comments (`[==[ ... ]==]`) end at a `]` followed
 *   by as many `=` as they opened with. Each level from 0 to
 *   MAX_BRACKET_LEVEL is its own token, whose regex matches any content that
 *   does not contain that level's closing bracket. Deeper brackets, like the
 *   `#[====...====[.rst:` that opens CMake's module documentation, share one
 *   token that ends at the first `]` with more than MAX_BRACKET_LEVEL `=`.
 * - Quoted and unquoted arguments are runs of pieces (text, escapes,
 *   variable references) with nothing skipped between them. Every piece
 *   after the first is an immediate token, so whitespace and comments are
 *   never skipped inside an argument, and whitespace ends an unquoted one.
 *
 * Lexical precedence settles the remaining overlaps: text inside a quoted
 * argument beats a `#` comment, a bracket argument beats unquoted text that
 * starts an argument, and unquoted text that continues an argument beats a
 * bracket argument (`a[[b]]` is one unquoted argument, as in CMake).
 */

/// <reference types="tree-sitter-cli/dsl" />
// @ts-check

/**
 * Brackets up to `[========[` match their closing bracket exactly. Deeper
 * ones close at the first `]` with at least as many `=` as this plus one.
 */
const MAX_BRACKET_LEVEL = 8;

const PREC = {
  // Lexical precedences.
  start_text: 0,
  bracket: 1,
  continue_text: 2,
  quoted_text: 3,
  // Inside a generator expression, its own tokens win over the text of the
  // argument around it, so it does not end early.
  genex: 4,
  genex_close: 5,
};

/**
 * A regex source for a bracket of `level` `=` signs: `[==[`, then anything
 * that does not contain `]==]`, then `]==]`. With `orMore`, the brackets
 * have `level` or more `=` and the first closing bracket that does ends it.
 *
 * The content is a run of non-`]` characters and `]=*` groups. A group whose
 * `=` run cannot close the bracket can be followed by anything; one that
 * could must not be followed by `]`. Taking each `=` run whole (a group is
 * followed by something other than `=`) keeps a run from being split to hide
 * a closing bracket.
 *
 * @param {number} level
 * @param {boolean} [orMore]
 */
function bracketSource(level, orMore = false) {
  const eq = '='.repeat(level) + (orMore ? '=*' : '');
  // `=` runs that do not close: shorter than `level`, or, for an exact
  // level, longer.
  const short = '=?'.repeat(Math.max(level - 1, 0));
  const other = orMore ? short : level === 0 ? '=+' : `(${short}|${'='.repeat(level + 1)}=*)`;
  // A `]` and an `=` run that does not close, then another `]` group.
  const open = `\\]${other}`;
  // A `]` and a whole `=` run, then a character that is neither `]` nor `=`.
  const closedGroup = `\\]=*[^\\]=]`;
  const content = `([^\\]]|(${open})*${closedGroup})*(${open})*`;
  return `\\[${eq}\\[${content}\\]${eq}\\]`;
}

const BRACKETS = [
  ...Array.from({length: MAX_BRACKET_LEVEL + 1}, (_, i) => bracketSource(i)),
  bracketSource(MAX_BRACKET_LEVEL + 1, true),
];

/**
 * A case-insensitive regex for a command name: CMake command names ignore
 * case, so `IF`, `If` and `if` are all `if`.
 *
 * @param {string} word
 */
function caseless(word) {
  return new RegExp(
    word
      .split('')
      .map((c) => (/[a-z]/.test(c) ? `[${c}${c.toUpperCase()}]` : c))
      .join(''),
  );
}

/**
 * The block-structuring commands. Each gets its own command node
 * (`if_command`, `endif_command`, ...) whose name is an anonymous node of
 * that word, whatever case it was written in.
 */
const BLOCK_COMMANDS = [
  'if', 'elseif', 'else', 'endif',
  'foreach', 'endforeach',
  'while', 'endwhile',
  'function', 'endfunction',
  'macro', 'endmacro',
  'block', 'endblock',
];

/** @type {Record<string, ($: any) => RuleOrLiteral>} */
const blockCommandRules = {};
for (const word of BLOCK_COMMANDS) {
  blockCommandRules[`${word}_command`] = ($) =>
    seq(
      field('name', alias(caseless(word), word)),
      field('arguments', $.argument_list),
    );
}

module.exports = grammar({
  name: 'cmake',

  extras: ($) => [/\s/, $.line_comment, $.bracket_comment],

  supertypes: ($) => [$._argument],

  rules: {
    source_file: ($) => repeat($._element),

    _element: ($) =>
      choice(
        $.command,
        $.if_statement,
        $.foreach_loop,
        $.while_loop,
        $.function_definition,
        $.macro_definition,
        $.block_statement,
      ),

    command: ($) =>
      seq(field('name', $.identifier), field('arguments', $.argument_list)),

    // Blocks
    // ------

    ...blockCommandRules,

    // After the block commands: a name that is exactly `if` (in any case)
    // matches both, and the earlier rule wins. A longer name like `iffy`
    // is an identifier, since the longer match wins.
    identifier: (_) => /[A-Za-z_][A-Za-z0-9_]*/,

    if_statement: ($) =>
      seq(
        $.if_command,
        repeat($._element),
        repeat($.elseif_clause),
        optional($.else_clause),
        $.endif_command,
      ),

    elseif_clause: ($) => seq($.elseif_command, repeat($._element)),

    else_clause: ($) => seq($.else_command, repeat($._element)),

    foreach_loop: ($) =>
      seq($.foreach_command, repeat($._element), $.endforeach_command),

    while_loop: ($) =>
      seq($.while_command, repeat($._element), $.endwhile_command),

    function_definition: ($) =>
      seq($.function_command, repeat($._element), $.endfunction_command),

    macro_definition: ($) =>
      seq($.macro_command, repeat($._element), $.endmacro_command),

    block_statement: ($) =>
      seq($.block_command, repeat($._element), $.endblock_command),

    // Arguments
    // ---------

    argument_list: ($) => seq('(', repeat($._argument_or_group), ')'),

    // Parentheses inside an argument list nest, as in `if((a OR b) AND c)`.
    argument_group: ($) => seq('(', repeat($._argument_or_group), ')'),

    _argument_or_group: ($) => choice($._argument, $.argument_group),

    _argument: ($) =>
      choice($.bracket_argument, $.quoted_argument, $.unquoted_argument),

    bracket_argument: (_) =>
      token(prec(PREC.bracket, choice(...BRACKETS.map((b) => new RegExp(b))))),

    quoted_argument: ($) =>
      seq(
        '"',
        repeat(
          choice(
            alias($._quoted_text, $.string_content),
            alias($._quoted_dollar, $.string_content),
            $.escape_sequence,
            $.line_continuation,
            $.variable_reference,
            alias($._quoted_generator_expression, $.generator_expression),
          ),
        ),
        token.immediate('"'),
      ),

    _quoted_text: (_) => token.immediate(prec(PREC.quoted_text, /[^"\\$]+/)),

    _quoted_dollar: (_) => token.immediate(prec(PREC.quoted_text, '$')),

    line_continuation: (_) => token.immediate(prec(PREC.quoted_text, /\\\r?\n/)),

    // An unquoted argument is one or more pieces with nothing between them.
    // The first piece may follow whitespace; the rest are immediate tokens.
    unquoted_argument: ($) =>
      seq(
        choice(
          $._unquoted_text_start,
          $._unquoted_dollar_start,
          alias($._escape_sequence_start, $.escape_sequence),
          alias($._variable_reference_start, $.variable_reference),
          alias($._generator_expression_start, $.generator_expression),
        ),
        repeat(
          choice(
            $._unquoted_text,
            $._unquoted_dollar,
            $.escape_sequence,
            $.variable_reference,
            alias($._unquoted_generator_expression, $.generator_expression),
          ),
        ),
      ),

    _unquoted_text_start: (_) => token(prec(PREC.start_text, /[^\s()#"\\$]+/)),

    _unquoted_text: (_) => token.immediate(prec(PREC.continue_text, /[^\s()#"\\$]+/)),

    // A `$` that does not start a reference is text. `${` and `$<` are longer,
    // so they win where they apply.
    _unquoted_dollar_start: (_) => token(prec(PREC.start_text, '$')),

    _unquoted_dollar: (_) => token.immediate(prec(PREC.continue_text, '$')),

    // Any character but a newline may be escaped. CMake itself only accepts
    // `\t`, `\r`, `\n`, `\;` and escaped punctuation.
    escape_sequence: (_) => token.immediate(prec(PREC.quoted_text, /\\[^\r\n]/)),

    _escape_sequence_start: (_) => token(/\\[^\r\n]/),

    // Variable references
    // -------------------

    variable_reference: ($) =>
      seq(
        choice(
          token.immediate(prec(PREC.genex, '${')),
          token.immediate(prec(PREC.genex, '$ENV{')),
          token.immediate(prec(PREC.genex, '$CACHE{')),
        ),
        optional(field('name', $.variable)),
        token.immediate('}'),
      ),

    _variable_reference_start: ($) =>
      seq(
        choice(
          alias(token('${'), '${'),
          alias(token('$ENV{'), '$ENV{'),
          alias(token('$CACHE{'), '$CACHE{'),
        ),
        optional(field('name', $.variable)),
        token.immediate('}'),
      ),

    // A variable name, which can be built from nested references:
    // `${CMAKE_${lang}_FLAGS}`.
    variable: ($) =>
      repeat1(
        choice(
          token.immediate(/[A-Za-z0-9/_.+\-@]+/),
          // `${$}` names the variable `$`. `${` is longer, so it wins.
          token.immediate(prec(PREC.quoted_text, '$')),
          $.escape_sequence,
          $.variable_reference,
        ),
      ),

    // Generator expressions
    // ---------------------
    //
    // `$<NAME:arg,arg>`. CMake only reads these after splitting arguments,
    // so one can run past the end of an argument: in
    // `$<$<CONFIG:Debug>:-a -b>` the outer one is closed by the `>` of the
    // next argument. A generator expression therefore ends at its `>` or at
    // the end of its argument, whichever comes first. Their text cannot hold
    // whitespace in an unquoted argument, but can in a quoted one, so each
    // context has its own rule.

    _generator_expression_start: ($) =>
      prec.right(seq(alias(token('$<'), '$<'), ...genexBody($, false))),

    _unquoted_generator_expression: ($) =>
      prec.right(seq(alias(token.immediate(prec(PREC.genex, '$<')), '$<'), ...genexBody($, false))),

    _quoted_generator_expression: ($) =>
      prec.right(seq(alias(token.immediate(prec(PREC.genex, '$<')), '$<'), ...genexBody($, true))),

    _genex_quoted_text: (_) => token.immediate(prec(PREC.genex, /[^"\\$>:,]+/)),

    _genex_unquoted_text: (_) => token.immediate(prec(PREC.genex, /[^\s()#"\\$>:,]+/)),

    // Comments
    // --------

    // `#` and then anything but a bracket. A `#[[` that never closes is a line
    // comment.
    line_comment: (_) => token(seq('#', /[^\r\n]*/)),

    bracket_comment: (_) =>
      token(prec(PREC.bracket, choice(...BRACKETS.map((b) => new RegExp('#' + b))))),
  },
});

/**
 * The inside of a generator expression and its closing `>`.
 *
 * @param {any} $
 * @param {boolean} quoted
 */
function genexBody($, quoted) {
  const text = quoted ? $._genex_quoted_text : $._genex_unquoted_text;
  const genex = quoted ? $._quoted_generator_expression : $._unquoted_generator_expression;
  return [
    repeat(
      choice(
        alias(text, $.genex_text),
        alias(token.immediate(prec(PREC.genex, ':')), ':'),
        alias(token.immediate(prec(PREC.genex, ',')), ','),
        alias(token.immediate(prec(PREC.genex, '$')), $.genex_text),
        $.escape_sequence,
        $.variable_reference,
        alias(genex, $.generator_expression),
      ),
    ),
    optional(alias(token.immediate(prec(PREC.genex_close, '>')), '>')),
  ];
}
