/**
 * @file GNU Makefile grammar for tree-sitter
 * @license MIT
 *
 * Follows GNU make's syntax (the GNU make manual, and read.c, function.c and
 * expand.c in GNU make's source), with no external scanner.
 *
 * GNU make reads a makefile a logical line at a time. A line that starts
 * with a tab, after a rule, is a recipe line for that rule; any other line is
 * a makefile line. Comment lines, blank lines and conditional directives do
 * not end a rule's recipe. Here:
 *
 * - **A line break followed by a tab is its own token.** `_recipe_nl` is a
 *   line break, with any blank lines before it, followed by a tab. `_eol` is
 *   a bare line break. The lexer takes the longest match, so after a rule or
 *   a recipe line the token says whether the next line is a recipe line. In
 *   other states `_recipe_nl` is not valid, so a tab is whitespace, as in
 *   make.
 * - **A recipe goes on through comment lines, blank lines and conditionals.**
 *   After a rule, a bare line break either goes on with the recipe or ends
 *   the rule, and a conditional either holds recipe lines or makefile lines.
 *   The parser keeps both readings (declared conflicts) until a line settles
 *   it: a recipe line inside a conditional is not valid at the top level, and
 *   an assignment is not valid in a recipe. When both readings parse, dynamic
 *   precedence picks the one make would: a conditional joins the recipe, and
 *   trailing blank lines do not.
 * - **Each context has its own text token.** A recipe line's text runs to the
 *   end of the line and keeps `#`; a value's text stops at `#`, which starts
 *   a comment; an argument's text stops at `,` and parentheses, except in the
 *   functions that take one argument, where a comma is text.
 */

/// <reference types="tree-sitter-cli/dsl" />
// @ts-check

// Functions that take one argument: a comma in it is text.
const FUNCTIONS_1 = [
  'abspath', 'basename', 'dir', 'error', 'eval', 'firstword', 'flavor',
  'guile', 'info', 'lastword', 'notdir', 'origin', 'realpath', 'shell', 'sort',
  'strip', 'suffix', 'value', 'warning', 'wildcard', 'words',
];

// Functions whose arguments are separated by commas.
const FUNCTIONS_N = [
  'addprefix', 'addsuffix', 'and', 'call', 'file', 'filter', 'filter-out',
  'findstring', 'foreach', 'if', 'intcmp', 'join', 'let', 'or', 'patsubst',
  'subst', 'word', 'wordlist',
];

const ASSIGNMENT_OPERATORS = ['=', ':=', '::=', ':::=', '?=', '+=', '!='];

// The two delimiters a reference can use. Inside `$(...)` only parentheses
// nest, and inside `${...}` only braces.
const DELIMITERS = [
  { suffix: 'p', open: '$(', close: ')', group: '(', other: '()' },
  { suffix: 'b', open: '${', close: '}', group: '{', other: '{}' },
];

/**
 * A text token: runs of `unit`, with spaces and tabs between them but not at
 * either end, so the leading and trailing whitespace stays outside the node.
 *
 * Where `#` is text, it is in `unit` but not in `first`: a text token that
 * starts with `#` would lose to a comment running on past it (tree-sitter's
 * lexer follows a longer comment once the text has stopped at a space), so a
 * `#` there is the one-character `_hash` token instead, which wins.
 *
 * @param {string} unit a regular expression source for one unit of text
 * @param {string} [first] the same, for the first unit
 */
function text(unit, first = unit) {
  return new RegExp(`(${first})([ \\t]*(${unit}))*`);
}

/**
 * A variable reference: `$(name)` or `$(name:pattern=replacement)`.
 *
 * @param {any} $
 * @param {string} s the delimiter's suffix
 * @param {string} open
 * @param {string} close
 */
function variableReference($, s, open, close) {
  return seq(
    open,
    choice(
      // A function's name, used as a variable: $(dir)
      field('name', alias(choice($._function_1, $._function_n), $.variable_name)),
      repeat1(field('name', choice(alias($[`_name_${s}`], $.variable_name), $._reference))),
    ),
    optional(seq(
      ':',
      optional(field('pattern', alias($[`_pattern_${s}`], $.text))),
      // Without `=`, make reads the colon as part of the name. It is
      // accepted, with what follows the colon as the pattern.
      optional(seq(
        '=',
        optional(field('replacement', alias($[`_replacement_${s}`], $.text))),
      )),
    )),
    close,
  );
}

/**
 * A function call: `$(name arguments)`.
 *
 * @param {any} $
 * @param {string} s the delimiter's suffix
 * @param {string} open
 * @param {string} close
 */
function functionCall($, s, open, close) {
  return choice(
    seq(
      open,
      field('function', alias($._function_1, $.function_name)),
      $._function_space,
      optional(field('argument', alias($[`_arg1_${s}`], $.text))),
      close,
    ),
    seq(
      open,
      field('function', alias($._function_n, $.function_name)),
      $._function_space,
      optional(field('argument', alias($[`_argn_${s}`], $.text))),
      repeat(seq(',', optional(field('argument', alias($[`_argn_${s}`], $.text))))),
      close,
    ),
  );
}

/** Rules for `$(...)` and `${...}` references, calls and arguments. */
function delimitedRules() {
  /** @type {Record<string, ($: any) => RuleOrLiteral>} */
  const rules = {};
  for (const { suffix: s, other } of DELIMITERS) {
    const esc = other.replace(/[(){}]/g, (c) => '\\' + c);
    // A variable name, up to `:` (a substitution reference) or the close.
    // `#` is text inside a reference.
    rules[`_name_${s}`] = _ => new RegExp(`[^\\s$:#${esc}][^\\s$:${esc}]*`);
    // The pattern and the replacement of a substitution reference.
    rules[`_pattern_text_${s}`] = _ => new RegExp(`[^\\s$=#${esc}][^\\s$=${esc}]*`);
    rules[`_replacement_text_${s}`] = _ => new RegExp(`[^\\s$#${esc}][^\\s$${esc}]*`);
    rules[`_pattern_${s}`] = $ => repeat1(choice($[`_pattern_text_${s}`], $._reference));
    rules[`_replacement_${s}`] = $ => repeat1(choice($[`_replacement_text_${s}`], $._reference));
    // Argument text with commas (one-argument functions, nested groups) and
    // without. A backslash-newline in it goes on to the next line.
    rules[`_text1_${s}`] = _ => text(
      String.raw`[^\s$\\${esc}]|\\\r?\n|\\`,
      String.raw`[^\s$\\#${esc}]|\\\r?\n|\\`,
    );
    rules[`_textn_${s}`] = _ => text(
      String.raw`[^\s$\\,${esc}]|\\\r?\n|\\`,
      String.raw`[^\s$\\,#${esc}]|\\\r?\n|\\`,
    );

    // An argument may span lines in a define body, where a line break is
    // text until the body is expanded.
    rules[`_arg1_${s}`] = $ => repeat1(choice($[`_text1_${s}`], $._hash, $._reference, $[`_group_${s}`], $._eol));
    rules[`_argn_${s}`] = $ => repeat1(choice($[`_textn_${s}`], $._hash, $._reference, $[`_group_${s}`], $._eol));

    // A balanced pair of the delimiter inside an argument. Commas in it are
    // text: make splits arguments only at the outer level.
    rules[`_group_${s}`] = $ => seq(
      other[0],
      repeat(choice($[`_text1_${s}`], $._hash, $._reference, $[`_group_${s}`], ',', $._eol)),
      other[1],
    );
  }
  return rules;
}

module.exports = grammar({
  name: 'make',

  extras: $ => [
    /[ \t\f﻿]/,
    $._line_continuation,
    $.comment,
  ],

  conflicts: $ => [
    // After a recipe line, a bare line break either goes on with the recipe
    // (a comment line, a blank line or a conditional follows) or ends the
    // rule.
    [$.rule],
    [$.recipe],
    [$._recipe_after_endif],
    // A directive's keyword as the first name on a line, and `export NAME`
    // against `export NAME = value`.
    [$._keyword_word, $.include_directive],
    [$._keyword_word, $.load_directive],
    [$._keyword_word, $.vpath_directive],
    [$._keyword_word, $.undefine_directive],
    [$._keyword_word, $._modifier],
    [$._keyword_word, $._modifier, $.export_directive],
    [$._keyword_word, $._modifier, $.unexport_directive],
  ],

  rules: {
    // Items are separated by line breaks.
    source_file: $ => seq(
      optional($._top_item),
      repeat(seq($._eol, optional($._top_item))),
    ),

    _top_item: $ => choice(
      $._item,
      // A rule in a conditional's branches, with a recipe after `endif`.
      // Only at the top level: in a conditional, a tab-led line after an
      // inner `endif` is most often an indented directive.
      seq($.conditional, alias($._recipe_after_endif, $.recipe)),
    ),

    _item: $ => choice(
      $.rule,
      $.target_variable,
      $.variable_assignment,
      $.conditional,
      $.define_directive,
      $.undefine_directive,
      $.include_directive,
      $.export_directive,
      $.unexport_directive,
      $.vpath_directive,
      $.load_directive,
      // A line of only references, such as `$(eval ...)` or `$(call ...)`.
      $._reference_line,
    ),

    // Words and references, as targets, prerequisites and variable names. A
    // name like `$(ARCH)_FLAGS` is a reference and a word side by side.
    _names: $ => choice(
      seq(choice($.word, $._keyword_word, $._second_expansion), repeat($._name_piece)),
      $._reference_line,
    ),

    _name_piece: $ => choice($.word, $._keyword_word, $._reference, $._second_expansion),

    // A directive's keyword is a name where the directive cannot go:
    // `include: x.h` is a rule, `all: include` a prerequisite and
    // `export = 1` an assignment. At the start of a line, the parser keeps
    // both readings until the line shows which it is. When both parse
    // (`export A = 1` as `export` of `A`, or as a variable `export A`), the
    // directive wins.
    _keyword_word: $ => prec.dynamic(-1, alias(choice(
      'include', '-include', 'sinclude', 'load', '-load', 'vpath', 'export',
      'unexport', 'override', 'private', 'undefine',
    ), $.word)),

    _reference_line: $ => prec.right(seq($._reference, repeat($._name_piece))),

    // Rules

    // targets: prerequisites | order-only ; recipe
    // targets: target-pattern: prerequisites
    rule: $ => seq(
      field('targets', alias($._names, $.targets)),
      field('operator', choice(':', '::', '&:', '&::')),
      optional(seq(
        field('target_pattern', alias($._names, $.target_pattern)),
        ':',
      )),
      optional(field('prerequisites', alias($._names, $.prerequisites))),
      optional(seq(
        '|',
        optional(field('order_only', alias($._names, $.prerequisites))),
      )),
      optional(field('recipe', $.recipe)),
    ),

    // targets: NAME = value
    target_variable: $ => seq(
      field('targets', alias($._names, $.targets)),
      choice(':', '::'),
      field('assignment', $.variable_assignment),
    ),

    recipe: $ => choice(
      seq(';', optional($.recipe_line), repeat($._recipe_part)),
      repeat1($._recipe_part),
    ),

    // A recipe right after `endif`, for a rule in the conditional's branches.
    _recipe_after_endif: $ => seq($._recipe_entry, repeat($._recipe_part)),

    _recipe_part: $ => choice(
      $._recipe_entry,
      $._recipe_gap,
      seq($._eol, alias($._recipe_conditional, $.conditional)),
    ),

    // A tab-led line. After a comment line, it may also parse as a makefile
    // line, with the tab as whitespace (`\techo a: b` as a rule): make reads
    // it as a recipe line, so this reading wins.
    _recipe_entry: $ => prec.dynamic(100, seq($._recipe_nl, optional($.recipe_line))),

    // A blank or comment line in a recipe. At the end of a recipe, the
    // reading where the rule ends before the line wins.
    _recipe_gap: $ => prec.dynamic(-1, $._eol),

    // Recipe lines inside a conditional, with the same shape as
    // `conditional`. When it and a top-level conditional both parse, it
    // wins: make reads a conditional after a rule as part of the recipe.
    _recipe_conditional: $ => prec.dynamic(10, seq(
      field('condition', $._condition),
      repeat(choice($._recipe_body, seq($._eol, $.else_directive))),
      $._eol,
      'endif',
    )),

    _recipe_body: $ => choice(
      $._recipe_entry,
      $._eol,
      seq($._eol, alias($._recipe_conditional, $.conditional)),
    ),

    recipe_line: $ => choice(
      seq($.prefix, repeat(choice($._recipe_text, $._hash, $._reference))),
      repeat1(choice($._recipe_text, $._hash, $._reference)),
    ),

    // @ (silent), - (ignore errors), + (always run), in any combination.
    prefix: _ => token(prec(2, /[@+-]+/)),

    // Recipe text keeps `#` and backslash-newlines, and drops the tab after
    // one as make does.
    _recipe_text: _ => token(prec(1, text(
      String.raw`[^\s$\\]|\\\r?\n\t?|\\`,
      String.raw`[^\s$\\#]|\\\r?\n\t?|\\`,
    ))),

    // A `#` that is text, where a text token cannot start with one.
    _hash: _ => token(prec(2, '#')),

    // A line break, any blank lines after it, then a tab.
    _recipe_nl: _ => /(\r?\n[ \t]*)*\r?\n\t/,

    _eol: _ => /\r?\n/,

    _line_continuation: _ => /\\\r?\n/,

    // Variables

    // override export NAME := value
    variable_assignment: $ => seq(
      repeat(field('modifier', $._modifier)),
      field('name', $._names),
      field('operator', choice(...ASSIGNMENT_OPERATORS)),
      optional(field('value', $.text)),
    ),

    _modifier: _ => choice('override', 'export', 'private', 'unexport'),

    // A value: text and references, up to a comment or the end of the line.
    text: $ => repeat1(choice($._value_text, $._reference)),

    // Value text stops at `$` and `#`. `\#` is a `#`, and a backslash-newline
    // goes on to the next line.
    _value_text: _ => text(String.raw`[^\s$#\\]|\\[^\r\n$]|\\\r?\n|\\`),

    // define NAME = ... endef
    define_directive: $ => seq(
      repeat(field('modifier', $._modifier)),
      'define',
      field('name', $._names),
      optional(field('operator', choice(...ASSIGNMENT_OPERATORS))),
      choice(
        $._endef,
        seq($._eol, optional(field('body', $.define_body)), $._endef),
      ),
    ),

    // The lines of a define, as text, with the references in it.
    define_body: $ => repeat1(choice($._define_text, $._hash, $._reference, $._eol)),

    _define_text: _ => token(prec(1, /[^\s$#]([^\r\n$]*[^\s$])?/)),

    // `endef` at the start of a line. The line break before it is part of
    // the token, so it outranks a body line.
    _endef: _ => alias(token(prec(2, /\r?\n[ ]*endef/)), 'endef'),

    undefine_directive: $ => seq(
      repeat(field('modifier', $._modifier)),
      'undefine',
      field('name', $._names),
    ),

    export_directive: $ => seq(
      'export',
      optional(field('variables', $._names)),
    ),

    unexport_directive: $ => seq(
      'unexport',
      optional(field('variables', $._names)),
    ),

    // Directives

    include_directive: $ => seq(
      field('operator', choice('include', '-include', 'sinclude')),
      optional(field('path', $._names)),
    ),

    load_directive: $ => seq(
      field('operator', choice('load', '-load')),
      optional(field('path', $._names)),
    ),

    // vpath pattern directories. Directories may be separated by `:`.
    vpath_directive: $ => seq(
      'vpath',
      optional(seq(
        field('pattern', choice(alias($._path_word, $.word), $._reference)),
        repeat(field('directory', choice(alias($._path_word, $.word), $._reference))),
      )),
    ),

    _path_word: _ => /([^\s$#\\]|\\[^\r\n])+/,

    // Conditionals

    conditional: $ => seq(
      field('condition', $._condition),
      repeat(seq($._eol, optional(choice($._item, $.else_directive)))),
      $._eol,
      'endif',
    ),

    else_directive: $ => seq('else', optional(field('condition', $._condition))),

    _condition: $ => choice($.ifeq_directive, $.ifdef_directive),

    // ifeq (a,b), ifeq "a" "b", ifneq 'a' 'b'
    ifeq_directive: $ => seq(
      field('operator', choice('ifeq', 'ifneq')),
      choice(
        seq(
          '(',
          optional(field('left', alias($._argn_p, $.text))),
          ',',
          optional(field('right', alias($._arg1_p, $.text))),
          ')',
        ),
        seq(field('left', $.string), field('right', $.string)),
      ),
    ),

    ifdef_directive: $ => seq(
      field('operator', choice('ifdef', 'ifndef')),
      field('variable', $._names),
    ),

    string: $ => choice(
      seq('"', repeat(choice(token.immediate(/[^"$\r\n]+/), $._reference)), '"'),
      seq('\'', repeat(choice(token.immediate(/[^'$\r\n]+/), $._reference)), '\''),
    ),

    // Words: targets, prerequisites and names. A word cannot end with `+`,
    // `?`, `!` or `&`, so that `x+=1`, `x?=1`, `x!=cmd` and `a&: b` split
    // before the operator.
    word: _ => /([+?!&]*([^\s:;|=#$\\()+?!&]|\\[^\r\n]))+/,

    // References

    _reference: $ => choice(
      $.variable_reference,
      $.function_call,
      $.automatic_variable,
      $.escape_sequence,
    ),

    // $(name), ${name}, $(name:a=b) and $x
    variable_reference: $ => choice(
      ...DELIMITERS.map(({ suffix, open, close }) => variableReference($, suffix, open, close)),
      // $x: a one-character name
      token(/\$[^\s(){}$@<^+?*%|]/),
    ),

    // $$(name) and $$(function ...) in targets and prerequisites, expanded
    // a second time under .SECONDEXPANSION. In a recipe, `$$(` is the shell's.
    _second_expansion: $ => choice(
      alias($._second_variable_reference, $.variable_reference),
      alias($._second_function_call, $.function_call),
    ),

    _second_variable_reference: $ => choice(
      ...DELIMITERS.map(({ suffix, open, close }) => variableReference($, suffix, '$' + open, close)),
    ),

    _second_function_call: $ => choice(
      ...DELIMITERS.map(({ suffix, open, close }) => functionCall($, suffix, '$' + open, close)),
    ),

    // $@ $< $^ $+ $? $* $% $|, and $(@D), $(<F) and so on.
    automatic_variable: _ => token(choice(
      /\$[@<^+?*%|]/,
      /\$\([@<^+?*%|][DF]?\)/,
      /\$\{[@<^+?*%|][DF]?\}/,
    )),

    // $$ is a literal $.
    escape_sequence: _ => '$$',

    // $(function arguments)
    function_call: $ => choice(
      ...DELIMITERS.map(({ suffix, open, close }) => functionCall($, suffix, open, close)),
    ),

    _function_1: _ => choice(...FUNCTIONS_1),
    _function_n: _ => choice(...FUNCTIONS_N),

    // The whitespace after a function's name: `$(dir)` is a variable, and
    // `$(dir x)` a call. It outranks whitespace and a line continuation as
    // extras, which would match the same text.
    _function_space: _ => token(prec(1, /([ \t]|\\\r?\n)+/)),

    ...delimitedRules(),

    // A comment runs to the end of the line, and on past a backslash-newline.
    comment: _ => token(prec(-1, /#([^\\\r\n]|\\[^\r\n]|\\\r?\n)*\\?/)),
  },
});
