/**
 * @file Swift grammar for tree-sitter
 * @license MIT
 *
 * A Swift grammar with no external scanner. Swift's syntax depends on
 * whitespace in a few places that a scanner usually handles; here they are
 * handled with immediate tokens (tokens that only match when no whitespace
 * precedes them) and grammar structure instead:
 *
 * - Calls and subscripts: `f(x)` and `a[i]` need their `(`/`[` right after the
 *   callee. `f\n(x)` is two statements, as in Swift. (Swift also accepts
 *   spaces before the paren, `f (x)`; here that is two expressions.)
 * - Postfix `?` and `!` (optional chaining, force unwrap, `T?`, `try?`, `as!`)
 *   are immediate; the ternary `?` is not, so `a ? b : c` and `a?.b` never
 *   compete.
 * - Generic arguments in expressions (`Array<Int>()`) need an immediate `<`,
 *   so `a < b` is always a comparison.
 * - Trailing closures are not allowed in `if`/`while`/`for`/`switch`/`catch`
 *   conditions, as in Swift. Conditions use a copy of the expression rules
 *   (the `_cond_` rules) that have no trailing closures; the copies are
 *   aliased to the ordinary node names.
 * - Statements are separated by newlines or `;`. Newlines are not tokens, so
 *   a line that could continue the previous expression does (`a\n.b`,
 *   `a\n- b`). Swift agrees except for a prefix operator at the start of a
 *   line (`a\n-b`), which is rare.
 *
 * Block comments nest: `multiline_comment` is a rule, not a token.
 *
 * Strings, multiline strings and raw strings (up to `###"…"###`) with
 * interpolation are all in the grammar. Bare regex literals (`/…/`) are not
 * supported, since telling them from division needs whitespace context;
 * `#/…/#` regex literals are.
 */

/// <reference types="tree-sitter-cli/dsl" />
// @ts-check

const PREC = {
  statement_expression: -1,
  try: 0,
  assignment: 1,
  pattern: 2,
  ternary: 3,
  custom: 4,
  disjunction: 5,
  conjunction: 6,
  comparison: 7,
  nil_coalescing: 8,
  casting: 9,
  range: 10,
  addition: 11,
  multiplication: 12,
  shift: 13,
  prefix: 14,
  postfix: 15,
};

const TYPE_PREC = {
  attributed: 1,
  opaque: 2,
  function: 3,
  composition: 4,
  prefix: 5,
  postfix: 6,
};

// Operators that start like an immediate token (`<`, `?`, `!`) get the same
// lexical precedence, so that `a<=b`, `a??b` and `a!=b` lex as one operator.
const op = (/** @type {string} */ s) => (/^[<?!]./.test(s) ? token(prec(1, s)) : s);

const ASSIGNMENT_OPERATORS = [
  '=', '+=', '-=', '*=', '/=', '%=', '<<=', '>>=', '&=', '|=', '^=',
  '&+=', '&-=', '&*=', '&<<=', '&>>=',
];

// [precedence, operators, associativity]
const BINARY_OPERATORS = [
  [PREC.shift, ['<<', '>>', '&<<', '&>>'], 'left'],
  [PREC.multiplication, ['*', '/', '%', '&*', '&'], 'left'],
  [PREC.addition, ['+', '-', '&+', '&-', '|', '^'], 'left'],
  [PREC.range, ['...', '..<'], 'left'],
  [PREC.nil_coalescing, ['??'], 'right'],
  [PREC.comparison, ['==', '!=', '<', '<=', '>', '>=', '===', '!==', '~=', '.==', '.!=', '.<', '.<=', '.>', '.>='], 'left'],
  [PREC.conjunction, ['&&'], 'left'],
  [PREC.disjunction, ['||'], 'left'],
];

// `/` is not a Swift prefix operator by default, but libraries define it
// (case paths: `/Action.child`), and custom operators cannot start with `/`.
const PREFIX_OPERATORS = ['-', '+', '!', '~', '&', '...', '..<', '/'];

// Every operator token, for operator declarations, operator functions and
// operator references (`sorted(by: <)`).
const OPERATOR_TOKENS = [
  ...new Set([
    ...BINARY_OPERATORS.flatMap(([, ops]) => ops),
    ...PREFIX_OPERATORS,
    ...ASSIGNMENT_OPERATORS,
    '!', '?', '->',
  ]),
].map(op);

// Keywords that cannot be used as identifiers (without backticks).
const RESERVED = [
  'associatedtype', 'class', 'deinit', 'enum', 'extension', 'fileprivate',
  'func', 'import', 'init', 'inout', 'internal', 'let', 'operator', 'private',
  'precedencegroup', 'protocol', 'public', 'rethrows', 'static', 'struct',
  'subscript', 'typealias', 'var', 'break', 'case', 'catch', 'continue',
  'default', 'defer', 'do', 'else', 'fallthrough', 'for', 'guard', 'if', 'in',
  'repeat', 'return', 'throw', 'switch', 'where', 'while', 'as', 'false',
  'is', 'nil', 'self', 'Self', 'super', 'throws', 'true', 'try', 'await',
];

// Keywords that only mean something in context, and are ordinary
// identifiers everywhere else.
const CONTEXTUAL = [
  'get', 'set', 'willSet', 'didSet', '_read', '_modify', 'unsafeAddress',
  'unsafeMutableAddress', 'async', 'some', 'any', 'each', 'open', 'package',
  'final', 'override', 'mutating', 'nonmutating', 'lazy', 'weak', 'unowned',
  'optional', 'required', 'convenience', 'dynamic', 'indirect', 'infix',
  'prefix', 'postfix', 'nonisolated', 'isolated', 'distributed', 'consuming',
  'borrowing', 'sending', 'actor', 'macro', 'Type', 'Protocol', 'unsafe',
  'consume', 'copy', 'borrow', 'mutate',
  '__consuming', '__owned', '__shared',
];

// Contextual keywords that cannot name a type, because they would be
// ambiguous where a type is expected (`some View`, `inout T`).
const TYPE_SPECIFIERS = [
  'inout', 'borrowing', 'consuming', 'sending', 'isolated', '__owned',
  '__shared',
];
const TYPE_CONTEXTUAL = CONTEXTUAL.filter(k =>
  !['some', 'any', 'each', 'Type', 'Protocol', 'nonisolated', ...TYPE_SPECIFIERS].includes(k));

// Argument labels and parameter names can be any keyword but these.
const LABEL_RESERVED = RESERVED.filter(k => !['inout', 'let', 'var', '_'].includes(k));

const ACCESSOR_KINDS = [
  'get', 'set', 'willSet', 'didSet', '_read', '_modify', 'unsafeAddress',
  'unsafeMutableAddress', 'borrow', 'mutate',
];

// Characters that may start / continue an operator. `/` is left out so that
// `/*` and `//` always start comments; `?` cannot start an operator.
const OPERATOR_HEAD = '=\\-+!*%<>&|^~\\u00A1-\\u00A7\\u00A9\\u00AB\\u00AC\\u00AE\\u00B0\\u00B1\\u00B6\\u00BB\\u00BF\\u00D7\\u00F7\\u2016\\u2017\\u2020-\\u2027\\u2030-\\u203E\\u2041-\\u2053\\u2055-\\u205E\\u2190-\\u23FF\\u2500-\\u2775\\u2794-\\u2BFF\\u2E00-\\u2E7F\\u3001-\\u3003\\u3008-\\u3020\\u3030';
const OPERATOR_CHAR = OPERATOR_HEAD + '?\\u0300-\\u036F\\u1DC0-\\u1DFF\\u20D0-\\u20FF\\uFE00-\\uFE0F\\uFE20-\\uFE2F';

const commaSep = rule => optional(commaSep1(rule));
const commaSep1 = rule => seq(rule, repeat(seq(',', rule)));

/**
 * The expression rules from `_expression` down to `_postfix_expression`, in
 * three variants. The copies are aliased to the ordinary node names; they
 * differ only along the left edge of an expression (operands on the right
 * are always full expressions).
 *
 * - `''`: ordinary expressions.
 * - `'cond'`: conditions of `if`/`while`/`for`/`switch`/`catch`, where a `{`
 *   starts the body, so calls take no trailing closures.
 * - `'stmt'`: expression statements, which cannot start with a closure (or
 *   an `if`/`switch`, which are statements there), so a `{` after an
 *   expression statement is always a trailing closure.
 *
 * @param {'' | 'cond' | 'stmt'} variant
 */
function expressionRules(variant) {
  // `_postfix_expression` -> `_cond_postfix_expression`, but
  // `postfix_expression` -> `_cond__postfix_expression`, so they stay apart.
  const n = (/** @type {string} */ name) => (variant ? `_${variant}${name.startsWith('_') ? '' : '__'}${name}` : name);
  /** @param {GrammarSymbols<string>} $ @param {string} name */
  const node = ($, name) => (variant ? alias($[n(name)], $[name]) : $[name]);
  /** @param {GrammarSymbols<string>} $ */
  const expr = $ => $[n('_expression')];
  /** @param {GrammarSymbols<string>} $ */
  const unary = $ => $[n('_unary_expression')];
  /** @param {GrammarSymbols<string>} $ */
  const postfix = $ => $[n('_postfix_expression')];
  const cond = variant === 'cond';
  // Operands to the right of an operator. A statement can't start with a
  // closure, but its right-hand side can.
  /** @param {GrammarSymbols<string>} $ */
  const rhs = $ => (variant === 'stmt' ? $._expression : expr($));
  /** @param {GrammarSymbols<string>} $ */
  const rhsUnary = $ => (variant === 'stmt' ? $._unary_expression : unary($));

  return {
    [n('_expression')]: $ => choice(
      node($, 'assignment_expression'),
      node($, 'ternary_expression'),
      node($, 'binary_expression'),
      node($, 'cast_expression'),
      node($, 'try_expression'),
      node($, 'await_expression'),
      node($, 'unsafe_expression'),
      node($, 'pack_expansion_expression'),
      unary($),
    ),

    [n('_unary_expression')]: $ => choice(
      node($, 'prefix_expression'),
      node($, 'consume_expression'),
      node($, 'pack_element_expression'),
      postfix($),
    ),

    [n('assignment_expression')]: $ => prec.right(PREC.assignment, seq(
      field('target', expr($)),
      field('operator', choice(...ASSIGNMENT_OPERATORS.map(op))),
      field('value', rhs($)),
    )),

    [n('ternary_expression')]: $ => prec.right(PREC.ternary, seq(
      field('condition', expr($)),
      '?',
      field('consequence', $._expression),
      ':',
      field('alternative', rhs($)),
    )),

    [n('binary_expression')]: $ => choice(
      ...BINARY_OPERATORS.map(([precedence, operators, associativity]) => {
        const ops = operators.map(o => (o === '<' ? choice('<', alias($._immediate_lt, '<')) : op(o)));
        const operator = ops.length === 1 ? ops[0] : choice(...ops);
        return (associativity === 'right' ? prec.right : prec.left)(precedence, seq(
          field('left', expr($)),
          field('operator', operator),
          field('right', rhs($)),
        ));
      }),
      prec.left(PREC.custom, seq(
        field('left', expr($)),
        field('operator', $.custom_operator),
        field('right', rhs($)),
      )),
    ),

    // x as T, x as? T, x as! T, x is T
    [n('cast_expression')]: $ => prec.left(PREC.casting, seq(
      field('value', expr($)),
      field('operator', choice(
        'as',
        seq('as', alias($._immediate_question, '?')),
        seq('as', alias($._immediate_bang, '!')),
        'is',
      )),
      field('type', $._type),
    )),

    [n('try_expression')]: $ => prec.right(PREC.try, seq(
      'try',
      optional(choice(alias($._immediate_question, '?'), alias($._immediate_bang, '!'))),
      rhs($),
    )),

    [n('await_expression')]: $ => prec.right(PREC.try, seq('await', rhs($))),

    // `unsafe x` is an unsafe expression, not the identifier `unsafe`.
    [n('unsafe_expression')]: $ => prec.dynamic(1, prec.right(PREC.try, seq('unsafe', rhs($)))),

    // repeat each x, repeat f(each x). The operand never starts with a
    // closure, so `repeat {` is always a repeat-while loop.
    [n('pack_expansion_expression')]: $ => prec.right(PREC.try, seq('repeat', expr($))),

    // each x
    [n('pack_element_expression')]: $ => prec(PREC.prefix, seq('each', field('pack', rhsUnary($)))),

    // consume x, copy x
    [n('consume_expression')]: $ => prec(PREC.prefix, seq(
      field('operator', choice('consume', 'copy')),
      field('operand', rhsUnary($)),
    )),

    [n('prefix_expression')]: $ => prec(PREC.prefix, seq(
      field('operator', choice(...PREFIX_OPERATORS.map(op), $.custom_operator)),
      field('operand', rhsUnary($)),
    )),

    [n('_postfix_expression')]: $ => choice(
      node($, 'call_expression'),
      node($, 'subscript_expression'),
      node($, 'member_expression'),
      node($, 'optional_chaining_expression'),
      node($, 'force_unwrap_expression'),
      node($, 'postfix_expression'),
      node($, 'specialize_expression'),
      node($, 'function_reference'),
      variant ? $._primary_expression_no_brace : $._primary_expression,
    ),

    // Trailing closures have no precedence, so that where a `{` may also
    // follow the expression (a `var` initializer followed by `didSet`), both
    // parses are tried; see `pattern_binding`.
    [n('call_expression')]: $ => cond
      ? seq(field('function', postfix($)), field('arguments', $.argument_list))
      : choice(
        seq(
          field('function', postfix($)),
          field('arguments', $.argument_list),
          optional($._trailing_closures),
        ),
        seq(field('function', postfix($)), $._trailing_closures),
      ),

    [n('subscript_expression')]: $ => prec(PREC.postfix, seq(
      field('object', postfix($)),
      alias($._immediate_lbracket, '['),
      commaSep(field('argument', $.argument)),
      optional(','),
      ']',
    )),

    [n('member_expression')]: $ => prec(PREC.postfix, seq(
      field('object', postfix($)),
      '.',
      field('name', $._member_name),
    )),

    [n('optional_chaining_expression')]: $ => prec(PREC.postfix, seq(
      postfix($),
      alias($._immediate_question, '?'),
    )),

    [n('force_unwrap_expression')]: $ => prec(PREC.postfix, seq(
      postfix($),
      alias($._immediate_bang, '!'),
    )),

    // a... in a[i...]. Whether `...` is postfix or binary is only known
    // after it, so this has no static precedence and GLR decides; when both
    // parse (`a ...\nb`), the binary range wins.
    [n('postfix_expression')]: $ => prec.dynamic(-1, seq(
      field('operand', postfix($)),
      field('operator', '...'),
    )),

    // Array<Int>, foo<T>. `a<b` may also be a comparison, so this has no
    // static precedence: GLR tries both, and generic arguments win when
    // both parse (`f<T>(x)`).
    [n('specialize_expression')]: $ => prec.dynamic(1, seq(
      field('expression', postfix($)),
      field('arguments', alias($._expression_type_arguments, $.type_arguments)),
    )),

    // foo(_:bar:)
    [n('function_reference')]: $ => prec(PREC.postfix, seq(
      field('function', postfix($)),
      field('arguments', $.argument_names),
    )),
  };
}

/**
 * Rules for a value-binding pattern (`let x`, `case let .a(x)`) and the
 * pattern choice itself, for patterns followed by `:`/`in`/`=` (`cond`
 * false) or by a block (`cond` true, in `catch`).
 *
 * @param {boolean} cond
 */
function patternRules(cond) {
  const n = (/** @type {string} */ name) => (cond ? `_cond_${name.replace(/^_/, '')}` : name);
  return {
    [n('_pattern')]: $ => choice(
      prec(PREC.pattern, cond ? $._cond_expression : $._expression),
      cond ? alias($._cond_value_binding_pattern, $.value_binding_pattern) : $.value_binding_pattern,
      $.tuple_pattern,
      $.enum_case_pattern,
      $.optional_pattern,
      $.is_pattern,
    ),

    [n('value_binding_pattern')]: $ => prec.right(seq(
      choice('let', 'var'),
      field('pattern', cond ? $._cond_pattern : $._pattern),
    )),
  };
}

/**
 * `#if` blocks around some kind of content.
 *
 * @param {GrammarSymbols<string>} $
 * @param {RuleOrLiteral} content
 */
function ifConfig($, content) {
  return seq(
    '#if',
    field('condition', $._compilation_condition),
    repeat(content),
    repeat(seq(
      '#elseif',
      field('condition', $._compilation_condition),
      repeat(content),
    )),
    optional(seq('#else', repeat(content))),
    '#endif',
  );
}

/**
 * Raw strings with `hashes` pound signs, single- and multi-line.
 *
 * @param {GrammarSymbols<string>} $
 * @param {number} hashes
 */
function rawString($, hashes) {
  const h = '#'.repeat(hashes);
  const escape = token.immediate(prec(4, new RegExp(`\\\\${h}([0\\\\tnr"']|u\\{[0-9a-fA-F]{1,8}\\})`)));
  const interpolationStart = token.immediate(prec(4, `\\${h}(`));
  const part = content => choice(
    alias(content, $.string_content),
    alias(escape, $.escape_sequence),
    alias(seq(alias(interpolationStart, '\\('), $._interpolation_body), $.interpolation),
  );
  return choice(
    seq(
      token(prec(4, `${h}"`)),
      repeat(part(token.immediate(prec(3, choice(/[^"\\\n]+/, '"', '\\'))))),
      token.immediate(prec(4, `"${h}`)),
    ),
    seq(
      token(prec(4, `${h}"""`)),
      repeat(part(token.immediate(prec(3, choice(/[^"\\]+/, '"', '\\'))))),
      token.immediate(prec(4, `"""${h}`)),
    ),
  );
}

module.exports = grammar({
  name: 'swift',

  extras: $ => [/\s/, $.comment, $.multiline_comment],

  word: $ => $.identifier,

  supertypes: $ => [
    $._expression,
    $._type,
  ],

  inline: $ => [
    $._member_name,
    $._label,
    $._parameter_name,
  ],

  conflicts: $ => [
    // `final class Foo` / `final class func f()`: `class` is a modifier only
    // when another declaration keyword follows.
    [$.modifiers],

    // Patterns and expressions look alike until a `let`, `var` or `is`
    // shows up, or until the end; patterns win ties.
    [$.tuple_expression, $.tuple_pattern],

    // `var x = f() { didSet { } }`: a `{` after a `var` initializer may be a
    // trailing closure or the observers.
    [$.call_expression],
    [$._unary_expression, $.call_expression],

    // `f(a: b)` is a call, `f(a:b:)` names a function.
    [$.argument, $.argument_names],
    [$.attribute_argument],
    [$._cond_unary_expression, $._cond__specialize_expression],
    [$._unary_expression, $.specialize_expression],
    [$._stmt_unary_expression, $._stmt__specialize_expression],
    [$._if_config_members, $._if_config_attributes],
    [$._if_config_attributes, $.attributes],
    [$.if_config, $._if_config_attributes],
    [$._cond__member_expression, $.enum_case_pattern],
    [$.tuple_element, $._pattern],
    [$.inheritance_clause],
    [$._attribute_value, $.deinitializer_declaration],
    [$.attribute_argument, $._primary_expression_no_brace],
    [$.operator, $.attribute_argument],
    [$._identifier, $.unsafe_expression],
    [$._identifier, $._cond__unsafe_expression],
    [$._identifier, $.for_statement, $.unsafe_expression],
    [$._identifier, $.for_statement],
    [$._identifier, $._stmt__unsafe_expression],
    [$._identifier, $._expression_existential_type],
    [$._cond_unary_expression, $._cond__postfix_expression],
    [$._unary_expression, $.postfix_expression],
    [$._stmt_unary_expression, $._stmt__postfix_expression],
    [$.switch_case],
    [$._trailing_closures],
    [$._identifier, $.accessor],
    [$._primary_expression_no_brace, $.capture_item],
    [$._identifier, $.capture_item],
    [$.tuple_element, $._closure_parameter_name],
    [$._primary_expression_no_brace, $._closure_parameter_name],
    [$.tuple_expression, $.closure_parameter_clause],
    [$.wildcard, $._closure_parameter_name],
    [$._stmt__call_expression],
    [$._cond_postfix_expression, $._primary_expression],
  ],

  rules: {
    source_file: $ => seq(
      optional($.shebang),
      repeat(choice($._statement, ';')),
    ),

    // Tokens that must directly follow the previous token. Where the plain
    // token is valid too (a new statement may start with `(`), their
    // precedence makes them win.
    _immediate_lparen: _ => token.immediate(prec(1, '(')),
    _immediate_lbracket: _ => token.immediate(prec(1, '[')),
    _immediate_lt: _ => token.immediate(prec(1, '<')),
    _immediate_question: _ => token.immediate(prec(1, '?')),
    _immediate_bang: _ => token.immediate(prec(1, '!')),

    shebang: _ => /#![^\n]*/,

    // *** Lexical ***

    comment: _ => token(seq('//', /[^\n]*/)),

    multiline_comment: $ => seq(
      token(prec(2, '/*')),
      repeat(choice($._multiline_comment_content, $.multiline_comment)),
      token(prec(2, '*/')),
    ),

    _multiline_comment_content: _ => token(prec(1, choice(/[^*\/]+/, '*', '/'))),

    identifier: _ => token(choice(
      /[\p{XID_Start}_$][\p{XID_Continue}$]*/,
      /`[^`\n]+`/,
    )),

    _identifier: $ => choice(
      $.identifier,
      ...CONTEXTUAL.map(k => alias(k, $.identifier)),
    ),

    _type_identifier: $ => choice(
      alias($.identifier, $.type_identifier),
      ...TYPE_CONTEXTUAL.map(k => alias(k, $.type_identifier)),
      alias('Self', $.type_identifier),
    ),

    // After `.` any keyword is a member name (`.init`, `.default`, `.self`).
    _member_name: $ => choice(
      $._identifier,
      ...RESERVED.map(k => alias(k, $.identifier)),
      alias($.integer_literal, $.identifier),
    ),

    _label: $ => choice(
      $._identifier,
      ...LABEL_RESERVED.map(k => alias(k, $.identifier)),
    ),

    _parameter_name: $ => choice($._label, alias('_', $.identifier)),

    // Operators of two or more characters starting with `<` or `!` get the
    // lexical precedence of the operators from `op`, so the longest match
    // wins (`<=>` is one operator, `<=` is still `<=`).
    custom_operator: _ => token(choice(
      prec(1, new RegExp(`[<!][${OPERATOR_CHAR}]+`)),
      new RegExp(`[${OPERATOR_HEAD.replace('<', '').replace('!', '')}][${OPERATOR_CHAR}]*`),
      // Dot operators: .&, .==, .<=
      new RegExp(`\\.[${OPERATOR_HEAD}.][${OPERATOR_CHAR}.]*`),
    )),

    operator: $ => choice(...OPERATOR_TOKENS, $.custom_operator),

    // *** Literals ***

    integer_literal: _ => token(choice(
      /[0-9][0-9_]*/,
      /0x[0-9a-fA-F][0-9a-fA-F_]*/,
      /0o[0-7][0-7_]*/,
      /0b[01][01_]*/,
    )),

    float_literal: _ => token(choice(
      /[0-9][0-9_]*\.[0-9][0-9_]*([eE][+-]?[0-9][0-9_]*)?/,
      /[0-9][0-9_]*[eE][+-]?[0-9][0-9_]*/,
      /0x[0-9a-fA-F][0-9a-fA-F_]*(\.[0-9a-fA-F][0-9a-fA-F_]*)?[pP][+-]?[0-9][0-9_]*/,
    )),

    boolean_literal: _ => choice('true', 'false'),

    nil_literal: _ => 'nil',

    string_literal: $ => seq(
      '"',
      repeat(choice(
        alias(token.immediate(prec(3, /[^"\\\n]+/)), $.string_content),
        $.escape_sequence,
        $.interpolation,
      )),
      token.immediate('"'),
    ),

    multiline_string_literal: $ => seq(
      token(prec(4, '"""')),
      repeat(choice(
        alias(token.immediate(prec(3, choice(/[^"\\]+/, '"'))), $.string_content),
        $.escape_sequence,
        // A backslash at the end of a line joins it to the next.
        alias(token.immediate(prec(3, /\\[ \t]*\r?\n/)), $.escape_sequence),
        $.interpolation,
      )),
      token.immediate(prec(4, '"""')),
    ),

    raw_string_literal: $ => choice(rawString($, 1), rawString($, 2), rawString($, 3)),

    escape_sequence: _ => token.immediate(prec(3, /\\([0\\tnr"']|u\{[0-9a-fA-F]{1,8}\})/)),

    interpolation: $ => seq(alias(token.immediate(prec(3, '\\(')), '\\('), $._interpolation_body),

    _interpolation_body: $ => seq(
      commaSep(field('argument', $.argument)),
      ')',
    ),

    regex_literal: _ => token(choice(
      /#\/([^\/\\\n]|\\.|\/[^#\n])*\/#/,
      /##\/([^\/\\]|\\.|\/[^#]|\/#[^#])*\/##/,
    )),

    // *** Statements ***

    _statement: $ => choice(
      $._stmt_expression,
      $._declaration,
      $.if_statement,
      $.switch_statement,
      $.guard_statement,
      $.for_statement,
      $.while_statement,
      $.repeat_while_statement,
      $.do_statement,
      $.defer_statement,
      $.return_statement,
      $.throw_statement,
      $.break_statement,
      $.continue_statement,
      $.fallthrough_statement,
      $.labeled_statement,
      $.if_config,
    ),

    _statements: $ => repeat1(choice($._statement, ';')),

    block: $ => seq('{', optional($._body), '}'),

    // A body may start with a closure, as its implicit return value:
    // `func f() -> () -> Void { { ... } }`. Anywhere else a `{` after a
    // statement is a trailing closure.
    _body: $ => choice(
      $._statements,
      seq($.closure_expression, optional($._statements)),
    ),

    if_statement: $ => prec.right(seq(
      'if',
      commaSep1(field('condition', $._condition)),
      field('consequence', $.block),
      optional(seq('else', field('alternative', choice($.block, $.if_statement)))),
    )),

    guard_statement: $ => seq(
      'guard',
      commaSep1(field('condition', $._condition)),
      'else',
      field('body', $.block),
    ),

    _condition: $ => choice(
      $._cond_expression,
      $.optional_binding_condition,
      $.matching_condition,
      $.availability_condition,
    ),

    // let x = y, var x, let x: T = y
    optional_binding_condition: $ => prec.right(seq(
      choice('let', 'var', 'inout'),
      field('pattern', $._binding_pattern),
      optional(seq(':', field('type', $._type))),
      optional(seq('=', field('value', $._cond_expression))),
    )),

    // case .some(let x) = y
    matching_condition: $ => seq(
      'case',
      field('pattern', $._pattern),
      optional(seq(':', field('type', $._type))),
      '=',
      field('value', $._cond_expression),
    ),

    availability_condition: $ => seq(
      choice('#available', '#unavailable'),
      '(',
      commaSep1(field('argument', $.attribute_argument)),
      ')',
    ),

    for_statement: $ => seq(
      'for',
      optional('try'),
      optional('await'),
      optional('unsafe'),
      optional('case'),
      field('pattern', $._pattern),
      optional(seq(':', field('type', $._type))),
      'in',
      field('sequence', $._cond_expression),
      optional(seq('where', field('where', $._cond_expression))),
      field('body', $.block),
    ),

    while_statement: $ => seq(
      'while',
      commaSep1(field('condition', $._condition)),
      field('body', $.block),
    ),

    repeat_while_statement: $ => seq(
      'repeat',
      field('body', $.block),
      'while',
      field('condition', $._expression),
    ),

    switch_statement: $ => seq(
      'switch',
      field('subject', $._cond_expression),
      '{',
      repeat(choice($.switch_case, alias($._if_config_switch_cases, $.if_config))),
      '}',
    ),

    // A case's statements end at the next `case`, `default` or `@unknown`.
    switch_case: $ => seq(
      optional($.attribute),
      choice(
        seq('case', commaSep1(field('item', $.case_item))),
        'default',
      ),
      ':',
      optional($._statements),
    ),

    case_item: $ => seq(
      field('pattern', $._pattern),
      optional(seq('where', field('where', $._expression))),
    ),

    do_statement: $ => prec.right(seq(
      'do',
      optional($.throws_clause),
      field('body', $.block),
      repeat($.catch_clause),
    )),

    catch_clause: $ => seq(
      'catch',
      commaSep(field('item', alias($._catch_item, $.case_item))),
      field('body', $.block),
    ),

    _catch_item: $ => seq(
      field('pattern', $._cond_pattern),
      optional(seq('where', field('where', $._cond_expression))),
    ),

    defer_statement: $ => seq('defer', field('body', $.block)),

    return_statement: $ => prec.right(seq('return', optional(field('value', $._expression)))),

    throw_statement: $ => prec.right(seq('throw', field('value', $._expression))),

    break_statement: $ => prec.right(seq('break', optional(field('label', $._identifier)))),

    continue_statement: $ => prec.right(seq('continue', optional(field('label', $._identifier)))),

    fallthrough_statement: _ => 'fallthrough',

    labeled_statement: $ => seq(
      field('label', $._identifier),
      ':',
      field('statement', choice(
        $.for_statement,
        $.while_statement,
        $.repeat_while_statement,
        $.if_statement,
        $.switch_statement,
        $.do_statement,
      )),
    ),

    // *** Conditional compilation ***

    if_config: $ => ifConfig($, choice($._statement, ';')),

    _if_config_members: $ => ifConfig($, choice($._member, ';')),

    _if_config_attributes: $ => ifConfig($, $.attribute),

    _if_config_switch_cases: $ => ifConfig($, choice($.switch_case, alias($._if_config_switch_cases, $.if_config))),

    _compilation_condition: $ => choice(
      $._identifier,
      $.boolean_literal,
      $.integer_literal,
      alias($._compilation_call, $.call_expression),
      alias($._compilation_prefix, $.prefix_expression),
      alias($._compilation_binary, $.binary_expression),
      alias($._compilation_parenthesized, $.tuple_expression),
    ),

    _compilation_call: $ => seq(
      field('function', $._identifier),
      field('arguments', alias($._compilation_arguments, $.argument_list)),
    ),

    _compilation_arguments: $ => seq(
      alias($._immediate_lparen, '('),
      commaSep(field('argument', alias($._compilation_argument, $.argument))),
      ')',
    ),

    // os(iOS), canImport(A.B, _version: 1.2), swift(>=5.9), compiler(<6)
    _compilation_argument: $ => seq(
      optional(seq(field('label', $._label), ':')),
      field('value', choice(
        $._expression,
        alias($._version_requirement, $.prefix_expression),
      )),
    ),

    _version_requirement: $ => seq(
      field('operator', choice(op('>='), '<')),
      field('operand', choice($.integer_literal, $.float_literal, $.version)),
    ),

    _compilation_prefix: $ => seq(field('operator', '!'), field('operand', $._compilation_condition)),

    _compilation_binary: $ => choice(
      prec.left(2, seq(field('left', $._compilation_condition), field('operator', '&&'), field('right', $._compilation_condition))),
      prec.left(1, seq(field('left', $._compilation_condition), field('operator', '||'), field('right', $._compilation_condition))),
    ),

    _compilation_parenthesized: $ => seq('(', field('value', $._compilation_condition), ')'),

    version: _ => /[0-9]+\.[0-9]+\.[0-9]+/,

    // *** Declarations ***

    _declaration: $ => choice(
      $.import_declaration,
      $.variable_declaration,
      $.function_declaration,
      $.initializer_declaration,
      $.deinitializer_declaration,
      $.subscript_declaration,
      $.typealias_declaration,
      $.associatedtype_declaration,
      $.struct_declaration,
      $.class_declaration,
      $.actor_declaration,
      $.enum_declaration,
      $.protocol_declaration,
      $.extension_declaration,
      $.operator_declaration,
      $.precedence_group_declaration,
      $.macro_declaration,
    ),

    _member: $ => choice(
      $._declaration,
      $.enum_case_declaration,
      $.macro_expansion_declaration,
      alias($._if_config_members, $.if_config),
    ),

    member_block: $ => seq('{', repeat(choice($._member, ';')), '}'),

    // `#if` may wrap just some of a declaration's attributes:
    //   #if compiler(>=6) @available(macOS 15, *) #endif func f() {}
    attributes: $ => repeat1(choice($.attribute, alias($._if_config_attributes, $.if_config))),

    attribute: $ => prec.right(seq(
      '@',
      field('name', $._simple_type),
      optional(field('arguments', $.attribute_arguments)),
    )),

    attribute_arguments: $ => seq(
      alias($._immediate_lparen, '('),
      commaSep(field('argument', $.attribute_argument)),
      optional(','),
      ')',
    ),

    attribute_argument: $ => choice(
      seq(field('label', $._label), ':', field('value', $._attribute_value)),
      // before: macOS 14.0
      seq(field('label', $._label), ':', field('name', $._identifier), field('value', choice($.version, $._expression))),
      field('value', $._attribute_value),
      prec.dynamic(1, '*'),
      // iOS 13.0, macOS 10.15.4, borrow x
      seq(field('name', $._identifier), field('value', choice($.version, $._expression))),
      // @objc(foo:bar:)
      repeat1(seq(field('name', $._parameter_name), ':')),
      $.where_clause,
      // @abi(func f())
      $._declaration,
    ),

    _attribute_value: $ => choice(
      $._expression,
      // @derivative(of: +), @_implements(Equatable, ==(_:_:))
      $.operator,
      alias($._operator_reference, $.function_reference),
      // @derivative(of: init(_:))
      alias(choice('init', 'subscript', 'deinit', 'extension', 'public', 'private', 'fileprivate', 'internal'), $.identifier),
      alias($._keyword_reference, $.function_reference),
    ),

    _operator_reference: $ => seq(field('function', $.operator), field('arguments', $.argument_names)),

    _keyword_reference: $ => seq(
      field('function', alias(choice('init', 'subscript'), $.identifier)),
      field('arguments', $.argument_names),
    ),

    modifiers: $ => repeat1($.modifier),

    // A contextual keyword followed by another is a modifier (`async let`,
    // `final class`), not an expression statement.
    modifier: $ => prec(1, choice(
      seq(
        choice('public', 'private', 'fileprivate', 'internal', 'package', 'open'),
        optional(seq(alias($._immediate_lparen, '('), 'set', ')')),
      ),
      'static',
      'class',
      'final',
      'override',
      'mutating',
      'nonmutating',
      'lazy',
      'weak',
      seq('unowned', optional(seq(alias($._immediate_lparen, '('), $._identifier, ')'))),
      'optional',
      'required',
      'convenience',
      'dynamic',
      'indirect',
      'infix',
      'prefix',
      'postfix',
      seq('nonisolated', optional(seq(alias($._immediate_lparen, '('), $._identifier, ')'))),
      'isolated',
      'distributed',
      'consuming',
      'borrowing',
      '__consuming',
      'async',
    )),

    import_declaration: $ => seq(
      optional($.attributes),
      optional($.modifiers),
      'import',
      optional(field('kind', choice('typealias', 'struct', 'class', 'enum', 'protocol', 'let', 'var', 'func'))),
      field('path', $.import_path),
    ),

    import_path: $ => prec.right(seq($._identifier, repeat(seq('.', choice($._identifier, $.operator))))),

    variable_declaration: $ => prec.right(seq(
      optional($.attributes),
      optional($.modifiers),
      choice(
        seq('let', commaSep1(field('binding', alias($._let_binding, $.pattern_binding)))),
        seq('var', commaSep1(field('binding', $.pattern_binding))),
      ),
    )),

    _let_binding: $ => prec.right(seq(
      field('pattern', $._binding_pattern),
      optional(seq(':', field('type', $._type))),
      optional(seq('=', field('value', $._expression))),
    )),

    pattern_binding: $ => prec.right(choice(
      seq(
        field('pattern', $._binding_pattern),
        optional(seq(':', field('type', $._type))),
        optional(seq('=', field('value', $._expression))),
        // `var x = 0 { didSet { } }` could also be read as a call of `0`
        // with a trailing closure; the observers win.
        optional(field('accessors', prec.dynamic(10, $.accessor_block))),
      ),
      // A computed property: `var x: Int { ... }`
      seq(
        field('pattern', $._binding_pattern),
        ':',
        field('type', $._type),
        field('accessors', $.block),
      ),
    )),

    _binding_pattern: $ => choice(
      $._identifier,
      alias('_', $.wildcard),
      alias($._binding_tuple_pattern, $.tuple_pattern),
    ),

    _binding_tuple_pattern: $ => seq(
      '(',
      commaSep(seq(optional(seq(field('label', $._label), ':')), field('element', $._binding_pattern))),
      ')',
    ),

    // `{ get set }` / `{ get { } }` would also parse as statements calling
    // `get`; accessors win.
    accessor_block: $ => prec.dynamic(1, seq('{', repeat1($.accessor), '}')),

    accessor: $ => seq(
      optional($.attributes),
      optional(choice('mutating', 'nonmutating', '__consuming', 'borrowing', 'consuming')),
      field('kind', choice(...ACCESSOR_KINDS)),
      optional(seq(alias($._immediate_lparen, '('), field('parameter', $._identifier), ')')),
      optional($._effects),
      optional(field('body', $.block)),
    ),

    function_declaration: $ => prec.right(seq(
      optional($.attributes),
      optional($.modifiers),
      'func',
      field('name', choice($._identifier, $.operator)),
      optional(field('generic_parameters', $.generic_parameter_clause)),
      field('parameters', $.parameter_clause),
      optional($._effects),
      optional(seq('->', field('return_type', $._type))),
      optional($.where_clause),
      optional(field('body', $.block)),
    )),

    initializer_declaration: $ => prec.right(seq(
      optional($.attributes),
      optional($.modifiers),
      'init',
      optional(choice(alias($._immediate_question, '?'), alias($._immediate_bang, '!'))),
      optional(field('generic_parameters', $.generic_parameter_clause)),
      field('parameters', $.parameter_clause),
      optional($._effects),
      optional($.where_clause),
      optional(field('body', $.block)),
    )),

    deinitializer_declaration: $ => prec.right(seq(
      optional($.attributes),
      optional($.modifiers),
      'deinit',
      optional($._effects),
      optional(field('body', $.block)),
    )),

    subscript_declaration: $ => prec.right(seq(
      optional($.attributes),
      optional($.modifiers),
      'subscript',
      optional(field('generic_parameters', $.generic_parameter_clause)),
      field('parameters', $.parameter_clause),
      '->',
      field('return_type', $._type),
      optional($.where_clause),
      optional(field('accessors', choice($.accessor_block, $.block))),
    )),

    _effects: $ => prec(1, choice(
      seq('async', optional($.throws_clause)),
      $.throws_clause,
    )),

    throws_clause: $ => choice(
      'rethrows',
      seq('throws', optional(seq(alias($._immediate_lparen, '('), field('type', $._type), ')'))),
    ),

    parameter_clause: $ => seq('(', commaSep($.parameter), optional(','), ')'),

    parameter: $ => seq(
      optional($.attributes),
      optional(field('external_name', $._parameter_name)),
      field('name', $._parameter_name),
      ':',
      field('type', $._type),
      optional('...'),
      optional(seq('=', field('default_value', $._expression))),
    ),

    generic_parameter_clause: $ => seq(
      '<',
      commaSep1($.generic_parameter),
      optional(','),
      optional($.where_clause),
      '>',
    ),

    generic_parameter: $ => seq(
      optional($.attributes),
      optional(choice('each', 'let')),
      field('name', $._type_identifier),
      optional(seq(':', field('constraint', $._type))),
    ),

    where_clause: $ => prec.right(seq('where', commaSep1($._requirement))),

    _requirement: $ => choice($.conformance_requirement, $.same_type_requirement),

    conformance_requirement: $ => seq(
      optional('repeat'),
      field('left', $._type),
      ':',
      field('right', $._type),
    ),

    same_type_requirement: $ => seq(
      optional('repeat'),
      field('left', $._type),
      op('=='),
      field('right', $._type),
    ),

    inheritance_clause: $ => seq(':', commaSep1(field('type', $._type))),

    typealias_declaration: $ => seq(
      optional($.attributes),
      optional($.modifiers),
      'typealias',
      field('name', $._type_identifier),
      optional(field('generic_parameters', $.generic_parameter_clause)),
      '=',
      field('value', $._type),
      optional($.where_clause),
    ),

    associatedtype_declaration: $ => prec.right(seq(
      optional($.attributes),
      optional($.modifiers),
      'associatedtype',
      field('name', $._type_identifier),
      optional($.inheritance_clause),
      optional(seq('=', field('default', $._type))),
      optional($.where_clause),
    )),

    struct_declaration: $ => seq(
      optional($.attributes),
      optional($.modifiers),
      'struct',
      field('name', $._type_identifier),
      optional(field('generic_parameters', $.generic_parameter_clause)),
      optional($.inheritance_clause),
      optional($.where_clause),
      field('body', $.member_block),
    ),

    class_declaration: $ => seq(
      optional($.attributes),
      optional($.modifiers),
      'class',
      field('name', $._type_identifier),
      optional(field('generic_parameters', $.generic_parameter_clause)),
      optional($.inheritance_clause),
      optional($.where_clause),
      field('body', $.member_block),
    ),

    // `actor Foo` at the start of a statement is a declaration.
    actor_declaration: $ => prec(1, seq(
      optional($.attributes),
      optional($.modifiers),
      'actor',
      field('name', $._type_identifier),
      optional(field('generic_parameters', $.generic_parameter_clause)),
      optional($.inheritance_clause),
      optional($.where_clause),
      field('body', $.member_block),
    )),

    enum_declaration: $ => seq(
      optional($.attributes),
      optional($.modifiers),
      'enum',
      field('name', $._type_identifier),
      optional(field('generic_parameters', $.generic_parameter_clause)),
      optional($.inheritance_clause),
      optional($.where_clause),
      field('body', $.member_block),
    ),

    protocol_declaration: $ => seq(
      optional($.attributes),
      optional($.modifiers),
      'protocol',
      field('name', $._type_identifier),
      optional(field('primary_associated_types', $.primary_associated_types)),
      optional($.inheritance_clause),
      optional($.where_clause),
      field('body', $.member_block),
    ),

    primary_associated_types: $ => seq('<', commaSep1($._type_identifier), '>'),

    extension_declaration: $ => seq(
      optional($.attributes),
      optional($.modifiers),
      'extension',
      field('type', $._type),
      optional($.inheritance_clause),
      optional($.where_clause),
      field('body', $.member_block),
    ),

    enum_case_declaration: $ => seq(
      optional($.attributes),
      optional($.modifiers),
      'case',
      commaSep1(field('element', $.enum_case_element)),
    ),

    enum_case_element: $ => prec.right(seq(
      field('name', $._identifier),
      optional(field('parameters', $.enum_case_parameter_clause)),
      optional(seq('=', field('raw_value', $._expression))),
    )),

    enum_case_parameter_clause: $ => seq('(', commaSep($.enum_case_parameter), optional(','), ')'),

    enum_case_parameter: $ => seq(
      optional(seq(
        optional(field('external_name', $._parameter_name)),
        field('name', $._parameter_name),
        ':',
      )),
      field('type', $._type),
      optional(seq('=', field('default_value', $._expression))),
    ),

    operator_declaration: $ => prec.right(seq(
      optional($.modifiers),
      'operator',
      field('name', $.operator),
      optional(seq(':', commaSep1(field('precedence_group', $._identifier)))),
    )),

    precedence_group_declaration: $ => seq(
      optional($.attributes),
      optional($.modifiers),
      'precedencegroup',
      field('name', $._identifier),
      '{',
      repeat($.precedence_group_attribute),
      '}',
    ),

    // higherThan: A, B / associativity: left / assignment: true
    precedence_group_attribute: $ => seq(
      field('name', $._identifier),
      ':',
      choice(commaSep1(field('value', $._identifier)), field('value', $.boolean_literal)),
    ),

    macro_declaration: $ => prec.right(1, seq(
      optional($.attributes),
      optional($.modifiers),
      'macro',
      field('name', $._identifier),
      optional(field('generic_parameters', $.generic_parameter_clause)),
      field('parameters', $.parameter_clause),
      optional(seq('->', field('return_type', $._type))),
      optional(seq('=', field('definition', $._expression))),
      optional($.where_clause),
    )),

    // A freestanding macro in a type body: `#warning("x")`, `#myMacro { }`.
    macro_expansion_declaration: $ => prec.right(seq(
      optional($.attributes),
      optional($.modifiers),
      field('macro', $.macro_expansion),
      optional(field('arguments', $.argument_list)),
      optional($._trailing_closures),
    )),

    // *** Expressions ***

    ...expressionRules(''),
    ...expressionRules('cond'),
    ...expressionRules('stmt'),

    // After a trailing closure, `label:` on the next line may start another
    // trailing closure or a labeled statement, and an identifier may start
    // the next statement; GLR decides.
    _trailing_closures: $ => seq(
      field('trailing_closure', $.closure_expression),
      repeat(field('trailing_closure', $.labeled_trailing_closure)),
    ),

    labeled_trailing_closure: $ => seq(
      field('label', choice($._label, alias('_', $.identifier))),
      ':',
      field('closure', $.closure_expression),
    ),

    argument_list: $ => seq(
      alias($._immediate_lparen, '('),
      commaSep(field('argument', $.argument)),
      optional(','),
      ')',
    ),

    argument: $ => seq(
      optional(seq(field('label', $._label), ':')),
      field('value', choice(prec(PREC.pattern, $._expression), $.operator)),
    ),

    // (_:bar:) in foo(_:bar:)
    argument_names: $ => seq(
      alias($._immediate_lparen, '('),
      repeat1(seq(field('name', $._parameter_name), ':')),
      ')',
    ),

    _expression_type_arguments: $ => seq(
      alias($._immediate_lt, '<'),
      commaSep1(choice($._type, $.integer_literal)),
      '>',
    ),

    _primary_expression: $ => choice(
      $._primary_expression_no_brace,
      $.closure_expression,
      $.if_statement,
      $.switch_statement,
    ),

    _primary_expression_no_brace: $ => choice(
      $._identifier,
      alias('Self', $.identifier),
      $.integer_literal,
      $.float_literal,
      $.boolean_literal,
      $.nil_literal,
      $.string_literal,
      $.multiline_string_literal,
      $.raw_string_literal,
      $.regex_literal,
      $.self_expression,
      $.super_expression,
      $.array_literal,
      $.dictionary_literal,
      $.tuple_expression,
      $.implicit_member_expression,
      $.key_path_expression,
      $.macro_expansion,
      $.wildcard,
      // (any P).self, [any P]()
      alias($._expression_existential_type, $.existential_type),
    ),

    _expression_existential_type: $ => prec.dynamic(1, seq('any', field('constraint', $._type))),

    self_expression: _ => 'self',

    super_expression: _ => 'super',

    wildcard: _ => '_',

    macro_expansion: _ => /#[\p{XID_Start}_][\p{XID_Continue}]*/,

    array_literal: $ => seq(
      '[',
      commaSep(field('element', $._expression)),
      optional(','),
      ']',
    ),

    dictionary_literal: $ => seq(
      '[',
      choice(
        ':',
        seq(commaSep1(field('element', $.dictionary_element)), optional(',')),
      ),
      ']',
    ),

    dictionary_element: $ => seq(
      field('key', $._expression),
      ':',
      field('value', $._expression),
    ),

    tuple_expression: $ => seq(
      '(',
      commaSep(field('element', $.tuple_element)),
      optional(','),
      ')',
    ),

    // The same precedence as a pattern's expression, so `(a + 1)` in a
    // `case` is decided by GLR rather than statically as a pattern.
    tuple_element: $ => seq(
      optional(seq(field('label', $._label), ':')),
      field('value', prec(PREC.pattern, $._expression)),
    ),

    implicit_member_expression: $ => seq('.', field('name', $._member_name)),

    // \Foo.bar, \.bar?.baz, \.[0], \.self
    key_path_expression: $ => prec.right(seq(
      '\\',
      optional(field('root', choice(
        $._type_identifier,
        alias($._key_path_generic_root, $.generic_type),
        $.array_type,
        $.dictionary_type,
      ))),
      repeat1($._key_path_component),
    )),

    _key_path_generic_root: $ => seq(
      field('name', $._type_identifier),
      field('arguments', alias($._expression_type_arguments, $.type_arguments)),
    ),

    _key_path_component: $ => choice(
      seq('.', field('member', $._member_name)),
      alias($._key_path_subscript, $.key_path_subscript),
      alias($._immediate_question, '?'),
      alias($._immediate_bang, '!'),
    ),

    _key_path_subscript: $ => seq(
      choice(alias($._immediate_lbracket, '['), seq('.', '[')),
      commaSep(field('argument', $.argument)),
      ']',
    ),

    closure_expression: $ => seq(
      '{',
      optional(field('signature', $.closure_signature)),
      optional($._body),
      '}',
    ),

    // `{ (a, b) in` vs `{ (a, b) }` and `{ [x] in` vs `{ [x] }` are only
    // told apart at `in`; the signature wins.
    closure_signature: $ => prec.dynamic(1, seq(
      optional($.attributes),
      optional(field('captures', $.capture_list)),
      optional(choice(
        // { a, b in }
        commaSep1(field('parameter', alias($._closure_shorthand_parameter, $.closure_parameter))),
        // { (a: Int) in }
        field('parameters', $.closure_parameter_clause),
      )),
      // async throws -> Int
      optional($._effects),
      optional(seq('->', field('return_type', $._type))),
      'in',
    )),

    capture_list: $ => seq('[', commaSep1($.capture_item), optional(','), ']'),

    capture_item: $ => seq(
      optional(field('specifier', choice(
        'weak',
        seq('unowned', optional(seq(alias($._immediate_lparen, '('), $._identifier, ')'))),
      ))),
      choice(
        seq(field('name', $._identifier), '=', field('value', $._expression)),
        field('value', choice($._identifier, $.self_expression)),
      ),
    ),

    closure_parameter_clause: $ => seq('(', commaSep($.closure_parameter), optional(','), ')'),

    closure_parameter: $ => seq(
      optional($.attributes),
      optional(field('external_name', $._closure_parameter_name)),
      field('name', $._closure_parameter_name),
      optional(seq(':', field('type', $._type), optional('...'))),
    ),

    _closure_shorthand_parameter: $ => field('name', $._closure_parameter_name),

    _closure_parameter_name: $ => choice($._identifier, alias('_', $.identifier)),

    // *** Patterns ***

    ...patternRules(false),
    ...patternRules(true),

    tuple_pattern: $ => prec.dynamic(1, seq(
      '(',
      commaSep(field('element', $.tuple_pattern_element)),
      ')',
    )),

    tuple_pattern_element: $ => seq(
      optional(seq(field('label', $._label), ':')),
      field('pattern', $._pattern),
    ),

    // .some(let x), Result.success(let value). As in Swift's parser, the type
    // is parsed as an expression.
    enum_case_pattern: $ => prec.dynamic(1, prec(PREC.postfix, seq(
      optional(field('type', $._cond_postfix_expression)),
      '.',
      field('name', $._member_name),
      field('arguments', alias($._enum_case_pattern_arguments, $.tuple_pattern)),
    ))),

    _enum_case_pattern_arguments: $ => seq(
      alias($._immediate_lparen, '('),
      commaSep(field('element', $.tuple_pattern_element)),
      ')',
    ),

    is_pattern: $ => seq('is', field('type', $._type)),

    // case .some(let x)?, case (let a, let b)?
    optional_pattern: $ => seq(
      field('pattern', choice($.enum_case_pattern, $.tuple_pattern)),
      alias($._immediate_question, '?'),
    ),

    // *** Types ***

    _type: $ => choice(
      $._simple_type,
      $.optional_type,
      $.implicitly_unwrapped_optional_type,
      $.metatype_type,
      $.array_type,
      $.dictionary_type,
      $.tuple_type,
      $.function_type,
      $.composition_type,
      $.opaque_type,
      $.existential_type,
      $.attributed_type,
      $.suppressed_type,
      $.pack_expansion_type,
      $.pack_element_type,
    ),

    _simple_type: $ => choice(
      $._type_identifier,
      $.generic_type,
      $.member_type,
    ),

    generic_type: $ => prec(TYPE_PREC.postfix + 1, seq(
      field('name', $._type_identifier),
      field('arguments', $.type_arguments),
    )),

    type_arguments: $ => seq(
      choice('<', alias($._immediate_lt, '<')),
      commaSep1(choice($._type, $.integer_literal)),
      optional(','),
      '>',
    ),

    member_type: $ => prec(TYPE_PREC.postfix, seq(
      field('base', $._simple_type),
      '.',
      field('name', choice($._type_identifier, $.generic_type)),
    )),

    optional_type: $ => prec(TYPE_PREC.postfix, seq(
      field('wrapped', $._type),
      alias($._immediate_question, '?'),
    )),

    implicitly_unwrapped_optional_type: $ => prec(TYPE_PREC.postfix, seq(
      field('wrapped', $._type),
      alias($._immediate_bang, '!'),
    )),

    // `Foo.Bar.Type`: after a simple type, `.` is shifted as for a member
    // type, so the simple-type form is listed separately.
    metatype_type: $ => prec(TYPE_PREC.postfix + 1, seq(
      field('base', choice($._simple_type, $._type)),
      '.',
      field('kind', choice('Type', 'Protocol')),
    )),

    array_type: $ => seq('[', field('element', $._type), ']'),

    dictionary_type: $ => seq(
      '[',
      field('key', $._type),
      ':',
      field('value', $._type),
      ']',
    ),

    tuple_type: $ => seq(
      '(',
      commaSep(field('element', $.tuple_type_element)),
      optional(','),
      ')',
    ),

    tuple_type_element: $ => seq(
      optional(seq(
        optional(field('external_name', $._parameter_name)),
        field('name', $._parameter_name),
        ':',
      )),
      field('type', $._type),
      optional('...'),
    ),

    function_type: $ => prec.right(TYPE_PREC.function, seq(
      field('parameters', $.tuple_type),
      optional($._effects),
      '->',
      field('return_type', $._type),
    )),

    composition_type: $ => prec.left(TYPE_PREC.composition, seq(
      field('left', $._type),
      '&',
      field('right', $._type),
    )),

    opaque_type: $ => prec.right(TYPE_PREC.opaque, seq('some', field('constraint', $._type))),

    existential_type: $ => prec.right(TYPE_PREC.opaque, seq('any', field('constraint', $._type))),

    attributed_type: $ => prec.right(TYPE_PREC.attributed, seq(
      repeat1(choice($.attribute, $.type_specifier)),
      field('type', $._type),
    )),

    type_specifier: $ => prec(1, choice(
      ...TYPE_SPECIFIERS,
      seq('nonisolated', alias($._immediate_lparen, '('), $._identifier, ')'),
    )),

    suppressed_type: $ => prec(TYPE_PREC.prefix, seq('~', field('type', $._type))),

    pack_expansion_type: $ => prec.right(TYPE_PREC.opaque, seq('repeat', field('type', $._type))),

    pack_element_type: $ => prec(TYPE_PREC.prefix, seq('each', field('type', $._type))),
  },
});
