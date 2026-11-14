/**
 * @file Python grammar for tree-sitter
 * @license MIT
 *
 * Python 3.14, with no external scanner. Also `lazy import` and unpacking in
 * comprehensions from Python 3.15.
 *
 * Python's blocks are delimited by indentation. Other grammars track the
 * indentation of every open block in an external scanner and emit INDENT and
 * DEDENT tokens. Here there is no scanner, so the line breaks carry the
 * indentation instead:
 *
 * - **A line break is one token per indentation width.** `_nl_4` is a line
 *   break (with any blank lines before it) followed by an indentation of 4
 *   columns. Widths from 0 to MAX_INDENT - 1 have a token each, and every
 *   deeper width shares `_nl_deep`. The lexer always takes the longest match,
 *   so the token after a statement says exactly how far the next line is
 *   indented.
 * - **A block is a run of statements separated by one of those tokens.**
 *   `_block_4` is `_nl_4 statement (_nl_4 statement)*`. A compound statement's
 *   body is a block of any width. The block goes on as long as the next line
 *   break has its width, and ends at any other line break, which then belongs
 *   to an enclosing block. Each block width is its own rule, so the parser
 *   state says which width continues the innermost block without having to
 *   remember the outer ones: in valid Python a body is indented further than
 *   every block around it, so its width differs from theirs.
 * - **Clauses that continue a statement use the width of its block.** An
 *   `if` inside `_block_4` takes its `elif` and `else` only after `_nl_4`, so
 *   an `else` is attached to the `if` at its own indentation. The same goes
 *   for `for`/`while` `else` and the `except`, `else` and `finally` clauses of
 *   `try`. At a line break of that width the parser keeps both readings (a
 *   clause, or the next statement) until the keyword after it.
 * - **Inside brackets a line break is not a token.** tree-sitter only lexes
 *   tokens the current parse state accepts, and no line break token is
 *   accepted inside `()`, `[]` or `{}`, so there it is skipped like a space.
 *
 * A tab counts as one column. Python requires indentation to be consistent
 * whether a tab is 1 or 8 columns wide, so in valid code the lines of a block
 * have the same indentation and a nested body has more under either measure;
 * counting characters gives the same nesting and lets tab-indented code nest
 * MAX_INDENT deep.
 *
 * Every statement's lookahead set holds every line break token, so the parse
 * table grows with MAX_INDENT. Rules are shaped to keep those sets the same
 * everywhere (see `_try_statement_*`): a set that differed by context would
 * split the states for each combination of enclosing widths.
 *
 * Comments may sit at any indentation, so a comment on a line of its own takes
 * the line break (and blank lines) before it into its token; otherwise its
 * line break would read as a dedent.
 *
 * String literals are lexed without a scanner by giving every kind of string
 * (quote, raw or not, f-string or not) its own tokens.
 */

/// <reference types="tree-sitter-cli/dsl" />
// @ts-check

// Indentation widths (in columns) with a line break token of their own.
// Deeper lines share `_nl_deep`, so two blocks nested that deep are not told
// apart.
const MAX_INDENT = 40;
/** @type {(number | 'deep')[]} */
const WIDTHS = [...Array(MAX_INDENT).keys(), 'deep'];

const PREC = {
  LAMBDA: -2,
  CONDITIONAL: -1,
  OR: 10,
  AND: 11,
  NOT: 12,
  COMPARE: 13,
  BIT_OR: 14,
  BIT_XOR: 15,
  BIT_AND: 16,
  SHIFT: 17,
  PLUS: 18,
  TIMES: 19,
  UNARY: 20,
  POWER: 21,
  AWAIT: 22,
  CALL: 23,
};

// Lexical precedence. A comment outranks the line breaks; the text of a string
// outranks a comment, so `"# x"` is a string.
const LEX = {
  LONE_BACKSLASH: 1,
  COMMENT: 1,
  STRING_TEXT: 2,
  ESCAPE: 3,
  STRING_END: 4,
};

// Hard keywords. They are never identifiers.
const RESERVED = [
  'False', 'None', 'True', 'and', 'as', 'assert', 'async', 'await', 'break',
  'class', 'continue', 'def', 'del', 'elif', 'else', 'except', 'finally',
  'for', 'from', 'global', 'if', 'import', 'in', 'is', 'lambda', 'nonlocal',
  'not', 'or', 'pass', 'raise', 'return', 'try', 'while', 'with', 'yield',
];

// A regex source for the line break token of one indentation width: a line
// break, with any blank lines before it, then the indentation. A tab counts as
// one column (see the file comment).
/** @param {number | 'deep'} width */
function lineBreak(width) {
  const blankLines = '(\\r?\\n[ \\t\\f]*)*\\r?\\n\\f*';
  // (Written as `{n}` then `*`: `{n,}` did not match more than n characters.)
  if (width === 'deep') return `${blankLines}[ \\t]{${MAX_INDENT}}[ \\t]*`;
  if (width === 0) return blankLines;
  return `${blankLines}[ \\t]{${width}}`;
}

/**
 * @param {RuleOrLiteral} rule
 * @param {RuleOrLiteral} separator
 */
function sep1(rule, separator) {
  return seq(rule, repeat(seq(separator, rule)));
}

/** @param {RuleOrLiteral} rule */
function commaSep1(rule) {
  return sep1(rule, ',');
}

// The kinds of string literal: each quote, raw or not, f-string (or t-string)
// or not. Every kind has its own start, content and end tokens.
const QUOTES = [
  { name: 'sq', quote: "'" },
  { name: 'dq', quote: '"' },
  { name: 'tsq', quote: "'''" },
  { name: 'tdq', quote: '"""' },
];
const STRING_KINDS = QUOTES.flatMap((q) => [false, true].flatMap((raw) =>
  [false, true].map((interpolated) => ({
    ...q,
    raw,
    interpolated,
    id: `${interpolated ? 'f' : ''}${raw ? 'r' : ''}${q.name}`,
  }))));

/** @param {string} s */
function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** @param {(typeof STRING_KINDS)[number]} kind */
function stringPrefix(kind) {
  if (kind.raw && kind.interpolated) return '([rR][fFtT]|[fFtT][rR])';
  if (kind.raw) return '([rR][bB]?|[bB][rR])';
  if (kind.interpolated) return '[fFtT]';
  return '[uUbB]?';
}

/**
 * The tokens of a string's text, as `[name, rule]` pairs.
 * @param {(typeof STRING_KINDS)[number]} kind
 */
function stringContentTokens(kind) {
  const q = escapeRegex(kind.quote[0]);
  const braces = kind.interpolated ? '{}' : '';
  const triple = kind.quote.length === 3;
  // Characters that are always text. A `#` is a token of its own (`_hash`):
  // were it part of a longer run of text, a comment starting at the `#` could
  // be longer, and the lexer would take it.
  const plain = `[^#${q}\\\\${braces}${triple ? '' : '\\r\\n'}]`;
  // A backslash pair in a raw string. In a raw f-string a `{` after a
  // backslash still opens a replacement field.
  const rawPair = kind.interpolated ? `\\\\[^${braces}\\r\\n]|\\\\\\r?\\n` : '\\\\(.|\\r?\\n)';
  const unit = kind.raw ? `(${plain}|${rawPair})` : plain;
  // In a triple-quoted string, one or two quotes are text when followed by
  // something other than a quote.
  const text = triple ? `(${unit}|${q}{1,2}${unit})+` : `${unit}+`;
  /** @type {[string, RegExp][]} */
  const tokens = [[`_text_${kind.id}`, new RegExp(text)]];
  if (triple) {
    // One or two quotes right before a backslash or a brace.
    tokens.push([`_quotes_${kind.id}`, new RegExp(`${q}{1,2}`)]);
  }
  return tokens;
}

module.exports = grammar({
  name: 'python',

  extras: $ => [
    $.comment,
    /[\s\f﻿⁠​]/,
    // A backslash at the end of a line joins it to the next.
    /\\\r?\n/,
  ],

  word: $ => $.identifier,

  reserved: {
    global: _ => RESERVED,
  },

  supertypes: $ => [
    $._simple_statement,
    $.expression,
    $.primary_expression,
  ],

  inline: $ => [
    $._name,
    $._named_expression,
    $._named_or_splat,
    $._expression_or_splat,
    $._target,
    $._suite,
    ...WIDTHS.map((w) => $[`_statement_${w}`]),
    $._statement_any,
  ],

  conflicts: $ => [
    // `match` at the start of a statement may be a name: `match[x] = 1`.
    [$.primary_expression, $.match_statement],
    // `with (a, b):` has two context managers or one tuple.
    [$.with_item, $.tuple],
    [$.with_item, $.parenthesized_expression],
    // At a line break of a statement's own width, the next line may hold a
    // clause of that statement (`else`, `except`, ...) or the next statement.
    ...[...WIDTHS, 'any'].flatMap((w) => [
      [$[`_if_statement_${w}`]],
      [$[`_for_statement_${w}`]],
      [$[`_while_statement_${w}`]],
      [$[`_try_statement_${w}`]],
    ]),
  ],

  rules: {
    // The top level checks no indentation: any line break separates two
    // statements, so indented snippets parse.
    module: $ => seq(
      optional($._newline),
      optional(seq(
        $._statement_any,
        repeat(seq($._newline, optional($._statement_any))),
      )),
    ),

    // Line breaks
    // -----------

    ...Object.fromEntries(WIDTHS.map((w) => [
      `_nl_${w}`,
      _ => token(new RegExp(lineBreak(w))),
    ])),

    _newline: $ => choice(...WIDTHS.map((w) => $[`_nl_${w}`])),

    // Blocks and statements, one rule per indentation width
    // ------------------------------------------------------

    ...Object.fromEntries([...WIDTHS, 'any'].flatMap((w) => {
      /** @param {GrammarSymbols<string>} $ */
      const nl = ($) => w === 'any' ? $._newline : $[`_nl_${w}`];
      /** @type {[string, ($: GrammarSymbols<string>) => RuleOrLiteral][]} */
      const rules = [
        [`_statement_${w}`, $ => choice(
          $._simple_statements,
          $._compound_statement,
          alias($[`_if_statement_${w}`], $.if_statement),
          alias($[`_for_statement_${w}`], $.for_statement),
          alias($[`_while_statement_${w}`], $.while_statement),
          alias($[`_try_statement_${w}`], $.try_statement),
          // Blocks deeper than MAX_INDENT share a line break token, so a
          // clause in one may come after the end of a nested body that the
          // parser has not seen end. There it is accepted on its own, as a
          // statement of the block, when it cannot continue a statement.
          ...(w === 'deep' ? [prec.dynamic(-1, choice(
            $.elif_clause,
            $.else_clause,
            $.except_clause,
            $.except_group_clause,
            $.finally_clause,
            $.case_clause,
          ))] : []),
        )],
        // Python wants the clauses in order (`elif`s before `else`; `except`,
        // `else`, `finally`) and a `try` to have at least one. Here any clause
        // of the statement may follow, which takes fewer parse states per
        // width. A `try` body that had to be followed by a clause would also
        // give the states inside it lookahead sets of their own, and nested
        // `try`s would multiply them.
        [`_if_statement_${w}`, $ => seq(
          $._if_head,
          repeat(seq(nl($), field('alternative', choice($.elif_clause, $.else_clause)))),
        )],
        [`_for_statement_${w}`, $ => seq(
          $._for_head,
          optional(seq(nl($), field('alternative', $.else_clause))),
        )],
        [`_while_statement_${w}`, $ => seq(
          $._while_head,
          optional(seq(nl($), field('alternative', $.else_clause))),
        )],
        [`_try_statement_${w}`, $ => seq(
          $._try_head,
          repeat(seq(nl($), choice(
            $.except_clause,
            $.except_group_clause,
            $.else_clause,
            $.finally_clause,
          ))),
        )],
      ];
      if (w !== 'any') {
        rules.push(
          // A line break with no statement after it ends the file with an
          // indented blank line.
          [`_block_${w}`, $ => prec.right(seq(
            nl($),
            $[`_statement_${w}`],
            repeat(seq(nl($), optional($[`_statement_${w}`]))),
          ))],
          [`_case_block_${w}`, $ => prec.right(seq(
            nl($),
            $.case_clause,
            repeat(seq(nl($), $.case_clause)),
          ))],
        );
      }
      return rules;
    })),

    // The body of a compound statement: simple statements on the same line,
    // or an indented block.
    _suite: $ => choice(
      alias($._simple_statements, $.block),
      ...WIDTHS.map((w) => alias($[`_block_${w}`], $.block)),
    ),

    _simple_statements: $ => seq(sep1($._simple_statement, ';'), optional(';')),

    _simple_statement: $ => choice(
      $.import_statement,
      $.import_from_statement,
      $.assert_statement,
      $.expression_statement,
      $.return_statement,
      $.delete_statement,
      $.raise_statement,
      $.pass_statement,
      $.break_statement,
      $.continue_statement,
      $.global_statement,
      $.nonlocal_statement,
      $.type_alias_statement,
    ),

    // Compound statements without clauses, which need no indentation width.
    _compound_statement: $ => choice(
      $.with_statement,
      $.function_definition,
      $.class_definition,
      $.decorated_definition,
      $.match_statement,
    ),

    // Simple statements
    // -----------------

    // `lazy` (Python 3.15) defers the import until the name is used.
    import_statement: $ => seq(
      optional('lazy'),
      'import',
      commaSep1(field('name', choice($.dotted_name, $.aliased_import))),
    ),

    import_from_statement: $ => seq(
      optional('lazy'),
      'from',
      field('module_name', choice($.relative_import, $.dotted_name)),
      'import',
      choice(
        $.wildcard_import,
        $._import_list,
        seq('(', $._import_list, ')'),
      ),
    ),

    _import_list: $ => seq(
      commaSep1(field('name', choice($.dotted_name, $.aliased_import))),
      optional(','),
    ),

    relative_import: $ => seq($.import_prefix, optional($.dotted_name)),

    import_prefix: _ => repeat1(choice('.', '...')),

    aliased_import: $ => seq(
      field('name', $.dotted_name),
      'as',
      field('alias', $.identifier),
    ),

    wildcard_import: _ => '*',

    dotted_name: $ => prec(1, sep1($.identifier, '.')),

    assert_statement: $ => seq('assert', commaSep1($.expression)),

    expression_statement: $ => choice(
      $._expressions,
      $.assignment,
      $.augmented_assignment,
      $.yield,
    ),

    assignment: $ => seq(
      field('left', $._expressions),
      choice(
        seq('=', field('right', $._right_hand_side)),
        seq(':', field('type', $.type)),
        seq(':', field('type', $.type), '=', field('right', $._right_hand_side)),
      ),
    ),

    augmented_assignment: $ => seq(
      field('left', $._expressions),
      field('operator', choice(
        '+=', '-=', '*=', '/=', '@=', '//=', '%=', '**=',
        '>>=', '<<=', '&=', '^=', '|=',
      )),
      field('right', choice($._expressions, $.yield)),
    ),

    _right_hand_side: $ => choice(
      $._expressions,
      $.assignment,
      $.augmented_assignment,
      $.yield,
    ),

    yield: $ => prec.right(seq(
      'yield',
      optional(choice(seq('from', $.expression), $._expressions)),
    )),

    return_statement: $ => seq('return', optional($._expressions)),

    delete_statement: $ => seq('del', $._expressions),

    raise_statement: $ => seq(
      'raise',
      optional($._expressions),
      optional(seq('from', field('cause', $.expression))),
    ),

    pass_statement: _ => prec.left('pass'),
    break_statement: _ => prec.left('break'),
    continue_statement: _ => prec.left('continue'),

    global_statement: $ => seq('global', commaSep1($.identifier)),

    nonlocal_statement: $ => seq('nonlocal', commaSep1($.identifier)),

    type_alias_statement: $ => seq(
      'type',
      field('name', $.identifier),
      optional(field('type_parameters', $.type_parameters)),
      '=',
      field('value', $.type),
    ),

    // Compound statements
    // -------------------

    _if_head: $ => seq(
      'if',
      field('condition', $._named_expression),
      ':',
      field('consequence', $._suite),
    ),

    elif_clause: $ => seq(
      'elif',
      field('condition', $._named_expression),
      ':',
      field('consequence', $._suite),
    ),

    else_clause: $ => seq('else', ':', field('body', $._suite)),

    _try_head: $ => seq('try', ':', field('body', $._suite)),

    _for_head: $ => seq(
      optional('async'),
      'for',
      field('left', $._targets),
      'in',
      field('right', $._expressions),
      ':',
      field('body', $._suite),
    ),

    _while_head: $ => seq(
      'while',
      field('condition', $._named_expression),
      ':',
      field('body', $._suite),
    ),

    except_clause: $ => seq(
      'except',
      optional(seq(
        field('value', choice(
          $.expression,
          // Python 3.14: `except A, B:`
          alias(seq($.expression, repeat1(seq(',', $.expression))), $.expression_list),
        )),
        optional(seq('as', field('alias', $.identifier))),
      )),
      ':',
      field('body', $._suite),
    ),

    except_group_clause: $ => seq(
      'except',
      '*',
      field('value', choice(
        $.expression,
        alias(seq($.expression, repeat1(seq(',', $.expression))), $.expression_list),
      )),
      optional(seq('as', field('alias', $.identifier))),
      ':',
      field('body', $._suite),
    ),

    finally_clause: $ => seq('finally', ':', field('body', $._suite)),

    with_statement: $ => seq(
      optional('async'),
      'with',
      $.with_clause,
      ':',
      field('body', $._suite),
    ),

    with_clause: $ => choice(
      commaSep1($.with_item),
      prec.dynamic(1, seq('(', commaSep1($.with_item), optional(','), ')')),
    ),

    with_item: $ => seq(
      field('value', $.expression),
      optional(seq('as', field('alias', $._target))),
    ),

    function_definition: $ => seq(
      optional('async'),
      'def',
      field('name', $.identifier),
      optional(field('type_parameters', $.type_parameters)),
      field('parameters', $.parameters),
      optional(seq('->', field('return_type', $.type))),
      ':',
      field('body', $._suite),
    ),

    parameters: $ => seq('(', optional($._parameters), ')'),

    lambda_parameters: $ => $._lambda_parameters,

    _parameters: $ => seq(commaSep1($._parameter), optional(',')),

    _lambda_parameters: $ => seq(commaSep1($._lambda_parameter), optional(',')),

    _parameter: $ => choice(
      $._lambda_parameter,
      $.typed_parameter,
      $.typed_default_parameter,
    ),

    _lambda_parameter: $ => choice(
      $.identifier,
      $.default_parameter,
      $.list_splat_pattern,
      $.dictionary_splat_pattern,
      $.keyword_separator,
      $.positional_separator,
    ),

    typed_parameter: $ => seq(
      choice($.identifier, $.list_splat_pattern, $.dictionary_splat_pattern),
      ':',
      field('type', $.type),
    ),

    default_parameter: $ => seq(
      field('name', $.identifier),
      '=',
      field('value', $.expression),
    ),

    typed_default_parameter: $ => seq(
      field('name', $.identifier),
      ':',
      field('type', $.type),
      '=',
      field('value', $.expression),
    ),

    list_splat_pattern: $ => seq('*', $.identifier),

    dictionary_splat_pattern: $ => seq('**', $.identifier),

    keyword_separator: _ => '*',

    positional_separator: _ => '/',

    type_parameters: $ => seq('[', commaSep1($.type_parameter), optional(','), ']'),

    type_parameter: $ => seq(
      optional(choice('*', '**')),
      field('name', $.identifier),
      optional(seq(':', field('bound', $.type))),
      optional(seq('=', field('default', $.type))),
    ),

    class_definition: $ => seq(
      'class',
      field('name', $.identifier),
      optional(field('type_parameters', $.type_parameters)),
      optional(field('superclasses', $.argument_list)),
      ':',
      field('body', $._suite),
    ),

    decorated_definition: $ => seq(
      repeat1(seq($.decorator, $._newline)),
      field('definition', choice($.function_definition, $.class_definition)),
    ),

    decorator: $ => seq('@', $._named_expression),

    match_statement: $ => seq(
      'match',
      field('subject', choice(
        $._named_expression,
        alias(seq(
          $._named_or_splat,
          choice(',', seq(repeat1(seq(',', $._named_or_splat)), optional(','))),
        ), $.expression_list),
        $.list_splat,
      )),
      ':',
      field('body', choice(...WIDTHS.map((w) => alias($[`_case_block_${w}`], $.block)))),
    ),

    case_clause: $ => seq(
      'case',
      commaSep1(choice($.case_pattern, $.splat_pattern)),
      optional(','),
      optional(field('guard', alias($._guard, $.if_clause))),
      ':',
      field('consequence', $._suite),
    ),

    _guard: $ => seq('if', $._named_expression),

    // Patterns
    // --------

    case_pattern: $ => choice(
      $.as_pattern,
      $.union_pattern,
      $._closed_pattern,
    ),

    as_pattern: $ => seq(
      choice($.union_pattern, $._closed_pattern),
      'as',
      field('alias', $.identifier),
    ),

    union_pattern: $ => prec.left(seq(
      $._closed_pattern,
      repeat1(seq('|', $._closed_pattern)),
    )),

    _closed_pattern: $ => choice(
      $.string,
      $.concatenated_string,
      $.true,
      $.false,
      $.none,
      seq(optional(choice('-', '+')), choice($.integer, $.float)),
      $.complex_pattern,
      $.dotted_name,
      $.class_pattern,
      $.list_pattern,
      $.tuple_pattern,
      $.dict_pattern,
    ),

    complex_pattern: $ => seq(
      optional(choice('-', '+')),
      choice($.integer, $.float),
      choice('+', '-'),
      choice($.integer, $.float),
    ),

    list_pattern: $ => seq(
      '[',
      optional(seq(commaSep1(choice($.case_pattern, $.splat_pattern)), optional(','))),
      ']',
    ),

    tuple_pattern: $ => seq(
      '(',
      optional(seq(commaSep1(choice($.case_pattern, $.splat_pattern)), optional(','))),
      ')',
    ),

    dict_pattern: $ => seq(
      '{',
      optional(seq(commaSep1(choice($._key_value_pattern, $.splat_pattern)), optional(','))),
      '}',
    ),

    _key_value_pattern: $ => seq(
      field('key', $._closed_pattern),
      ':',
      field('value', $.case_pattern),
    ),

    splat_pattern: $ => seq(choice('*', '**'), $.identifier),

    class_pattern: $ => seq(
      $.dotted_name,
      '(',
      optional(seq(commaSep1(choice($.case_pattern, $.keyword_pattern)), optional(','))),
      ')',
    ),

    keyword_pattern: $ => seq(
      field('name', $.identifier),
      '=',
      field('value', $.case_pattern),
    ),

    // Expressions
    // -----------

    _expressions: $ => choice($._expression_or_splat, $.expression_list),

    _expression_or_splat: $ => choice($.expression, $.list_splat),

    _named_expression: $ => choice($.expression, $.named_expression),

    _named_or_splat: $ => choice($.expression, $.named_expression, $.list_splat),

    // An unparenthesized tuple.
    expression_list: $ => prec.right(seq(
      $._expression_or_splat,
      choice(',', seq(repeat1(seq(',', $._expression_or_splat)), optional(','))),
    )),

    // Assignment targets in `for`, comprehensions and `with ... as`.
    _targets: $ => choice(
      $._target,
      alias(prec.right(seq(
        $._target,
        choice(',', seq(repeat1(seq(',', $._target)), optional(','))),
      )), $.expression_list),
    ),

    _target: $ => choice(
      $.primary_expression,
      alias(seq('*', $.primary_expression), $.list_splat),
    ),

    named_expression: $ => seq(
      field('name', $._name),
      ':=',
      field('value', $.expression),
    ),

    expression: $ => choice(
      $.comparison_operator,
      $.not_operator,
      $.boolean_operator,
      $.lambda,
      $.primary_expression,
      $.conditional_expression,
    ),

    primary_expression: $ => choice(
      $.await,
      $.binary_operator,
      $._name,
      $.string,
      $.concatenated_string,
      $.integer,
      $.float,
      $.true,
      $.false,
      $.none,
      $.unary_operator,
      $.attribute,
      $.subscript,
      $.call,
      $.list,
      $.list_comprehension,
      $.dictionary,
      $.dictionary_comprehension,
      $.set,
      $.set_comprehension,
      $.tuple,
      $.parenthesized_expression,
      $.generator_expression,
      $.ellipsis,
    ),

    // A name, where a soft keyword may be one.
    _name: $ => choice(
      $.identifier,
      alias(choice('match', 'type', 'lazy'), $.identifier),
    ),

    not_operator: $ => prec(PREC.NOT, seq('not', field('argument', $.expression))),

    boolean_operator: $ => choice(
      prec.left(PREC.AND, seq(
        field('left', $.expression),
        field('operator', 'and'),
        field('right', $.expression),
      )),
      prec.left(PREC.OR, seq(
        field('left', $.expression),
        field('operator', 'or'),
        field('right', $.expression),
      )),
    ),

    binary_operator: $ => {
      /** @type {[typeof prec.left, string, number][]} */
      const table = [
        [prec.left, '+', PREC.PLUS],
        [prec.left, '-', PREC.PLUS],
        [prec.left, '*', PREC.TIMES],
        [prec.left, '@', PREC.TIMES],
        [prec.left, '/', PREC.TIMES],
        [prec.left, '%', PREC.TIMES],
        [prec.left, '//', PREC.TIMES],
        [prec.right, '**', PREC.POWER],
        [prec.left, '|', PREC.BIT_OR],
        [prec.left, '&', PREC.BIT_AND],
        [prec.left, '^', PREC.BIT_XOR],
        [prec.left, '<<', PREC.SHIFT],
        [prec.left, '>>', PREC.SHIFT],
      ];
      return choice(...table.map(([fn, operator, precedence]) => fn(precedence, seq(
        field('left', $.primary_expression),
        field('operator', operator),
        field('right', $.primary_expression),
      ))));
    },

    unary_operator: $ => prec(PREC.UNARY, seq(
      field('operator', choice('+', '-', '~')),
      field('argument', $.primary_expression),
    )),

    comparison_operator: $ => prec.left(PREC.COMPARE, seq(
      $.primary_expression,
      repeat1(seq(
        field('operators', choice(
          '<', '<=', '==', '!=', '>=', '>',
          'in',
          alias(seq('not', 'in'), 'not in'),
          'is',
          alias(seq('is', 'not'), 'is not'),
        )),
        $.primary_expression,
      )),
    )),

    lambda: $ => prec(PREC.LAMBDA, seq(
      'lambda',
      field('parameters', optional($.lambda_parameters)),
      ':',
      field('body', $.expression),
    )),

    conditional_expression: $ => prec.right(PREC.CONDITIONAL, seq(
      $.expression,
      'if',
      $.expression,
      'else',
      $.expression,
    )),

    await: $ => prec(PREC.AWAIT, seq('await', $.primary_expression)),

    attribute: $ => prec(PREC.CALL, seq(
      field('object', $.primary_expression),
      '.',
      field('attribute', $.identifier),
    )),

    subscript: $ => prec(PREC.CALL, seq(
      field('value', $.primary_expression),
      '[',
      commaSep1(field('subscript', choice($._named_expression, $.slice, $.list_splat))),
      optional(','),
      ']',
    )),

    slice: $ => seq(
      optional($.expression),
      ':',
      optional($.expression),
      optional(seq(':', optional($.expression))),
    ),

    call: $ => prec(PREC.CALL, seq(
      field('function', $.primary_expression),
      field('arguments', choice($.argument_list, $.generator_expression)),
    )),

    argument_list: $ => seq(
      '(',
      optional(seq(
        commaSep1(choice(
          $._named_expression,
          $.list_splat,
          $.dictionary_splat,
          $.keyword_argument,
        )),
        optional(','),
      )),
      ')',
    ),

    keyword_argument: $ => seq(
      field('name', $._name),
      '=',
      field('value', $.expression),
    ),

    list_splat: $ => seq('*', $.expression),

    dictionary_splat: $ => seq('**', $.expression),

    type: $ => choice($.expression, $.list_splat),

    list: $ => seq(
      '[',
      optional(seq(commaSep1($._named_or_splat), optional(','))),
      ']',
    ),

    set: $ => seq('{', commaSep1($._named_or_splat), optional(','), '}'),

    tuple: $ => seq(
      '(',
      optional(choice(
        seq($._named_or_splat, ','),
        seq($._named_or_splat, repeat1(seq(',', $._named_or_splat)), optional(',')),
      )),
      ')',
    ),

    parenthesized_expression: $ => seq(
      '(',
      choice($._named_expression, $.yield),
      ')',
    ),

    dictionary: $ => seq(
      '{',
      optional(seq(commaSep1(choice($.pair, $.dictionary_splat)), optional(','))),
      '}',
    ),

    pair: $ => seq(
      field('key', $.expression),
      ':',
      field('value', $.expression),
    ),

    // A comprehension's element may be unpacked (`[*x for x in y]`, Python
    // 3.15).
    list_comprehension: $ => seq(
      '[',
      field('body', $._named_or_splat),
      $._comprehension_clauses,
      ']',
    ),

    dictionary_comprehension: $ => seq(
      '{',
      field('body', choice($.pair, $.dictionary_splat)),
      $._comprehension_clauses,
      '}',
    ),

    set_comprehension: $ => seq(
      '{',
      field('body', $._named_or_splat),
      $._comprehension_clauses,
      '}',
    ),

    generator_expression: $ => seq(
      '(',
      field('body', $._named_or_splat),
      $._comprehension_clauses,
      ')',
    ),

    _comprehension_clauses: $ => seq(
      $.for_in_clause,
      repeat(choice($.for_in_clause, $.if_clause)),
    ),

    for_in_clause: $ => seq(
      optional('async'),
      'for',
      field('left', $._targets),
      'in',
      field('right', $.expression),
    ),

    if_clause: $ => seq('if', $.expression),

    ellipsis: _ => '...',

    true: _ => 'True',
    false: _ => 'False',
    none: _ => 'None',

    integer: _ => token(choice(
      /0[xX](_?[0-9a-fA-F])+/,
      /0[bB](_?[01])+/,
      /0[oO](_?[0-7])+/,
      /[0-9](_?[0-9])*[jJ]?/,
    )),

    float: _ => {
      const digits = /[0-9](_?[0-9])*/.source;
      const exponent = `[eE][+-]?${digits}`;
      return token(choice(
        new RegExp(`${digits}\\.(${digits})?(${exponent})?[jJ]?`),
        new RegExp(`\\.${digits}(${exponent})?[jJ]?`),
        new RegExp(`${digits}${exponent}[jJ]?`),
      ));
    },

    identifier: _ => /[_\p{XID_Start}][_\p{XID_Continue}]*/,

    // Strings
    // -------

    concatenated_string: $ => seq($.string, repeat1($.string)),

    string: $ => choice(...STRING_KINDS.map((k) => $[`_string_${k.id}`])),

    ...Object.fromEntries(STRING_KINDS.flatMap((kind) => {
      const text = stringContentTokens(kind);
      /** @type {[string, ($: GrammarSymbols<string>) => RuleOrLiteral][]} */
      const rules = [
        [`_string_start_${kind.id}`, _ => token(new RegExp(stringPrefix(kind) + escapeRegex(kind.quote)))],
        ...text.map(([name, regex]) => /** @type {[string, ($: GrammarSymbols<string>) => RuleOrLiteral]} */ (
          [name, _ => token.immediate(prec(LEX.STRING_TEXT, regex))]
        )),
        [`_string_${kind.id}`, $ => seq(
          alias($[`_string_start_${kind.id}`], $.string_start),
          repeat(choice(
            ...text.map(([name]) => alias($[name], $.string_content)),
            alias($._hash, $.string_content),
            ...(kind.raw ? [] : [$.escape_sequence, alias($._invalid_escape, $.string_content)]),
            ...(kind.raw && kind.interpolated ? [alias($._lone_backslash, $.string_content)] : []),
            ...(kind.interpolated ? [$.escape_interpolation, $.interpolation] : []),
          )),
          alias($[`_string_end_${kind.name}`], $.string_end),
        )],
      ];
      return rules;
    })),

    ...Object.fromEntries(QUOTES.map((q) => [
      `_string_end_${q.name}`,
      // Above the text tokens, so that `"""` ends a string rather than being
      // read as `""` and `"`.
      _ => token.immediate(prec(LEX.STRING_END, q.quote)),
    ])),

    escape_sequence: _ => token.immediate(prec(LEX.ESCAPE, /\\(x[0-9a-fA-F]{2}|u[0-9a-fA-F]{4}|U[0-9a-fA-F]{8}|N\{[^}\r\n]*\}|[0-7]{1,3}|\r?\n|[\\'"abfnrtv])/)),

    // A backslash before a character that has no escape keeps both. Before a
    // brace (in an f-string) it is a backslash of its own.
    _invalid_escape: _ => token.immediate(prec(LEX.STRING_TEXT, /\\[^\r\n{}]?/)),

    // Below the text, which takes a backslash with the character after it.
    // (A string token is otherwise preferred to a longer regex token of the
    // same precedence.)
    _lone_backslash: _ => token.immediate(prec(LEX.LONE_BACKSLASH, '\\')),

    // A `#` in a string. It outranks a comment and, being one character, is
    // not outlasted by one.
    _hash: _ => token.immediate(prec(LEX.STRING_TEXT, '#')),

    escape_interpolation: _ => token.immediate(prec(LEX.STRING_TEXT, choice('{{', '}}'))),

    interpolation: $ => seq(
      alias(token.immediate('{'), '{'),
      field('expression', choice($._expressions, $.yield)),
      optional('='),
      optional(field('type_conversion', $.type_conversion)),
      optional(field('format_specifier', $.format_specifier)),
      '}',
    ),

    type_conversion: _ => /![a-z]/,

    format_specifier: $ => seq(
      ':',
      repeat(choice(
        token.immediate(prec(LEX.STRING_TEXT, /[^#{}\r\n]+/)),
        $._hash,
        $.interpolation,
      )),
    ),

    // Above the line break tokens, which would otherwise win (a valid token
    // is preferred to a longer extra).
    comment: _ => token(prec(LEX.COMMENT, /(\r?\n[ \t\f]*)*#[^\r\n]*/)),
  },
});
