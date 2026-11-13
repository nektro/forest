/**
 * @file Rust grammar for tree-sitter
 * @license MIT
 *
 * Rust 2024, following the Rust Reference. There is no external scanner. The
 * parts of Rust's lexical grammar that are not regular are handled like this:
 *
 * - A block comment is a rule, not a token, so comments can nest. The rule is
 *   an extra, and its contents are a run of immediate tokens, so nothing
 *   inside the comment is skipped or lexed as something else.
 * - Raw strings (`r#"..."#`) are one token per number of `#`s, from 0 to
 *   MAX_RAW_HASHES. Each is a regular expression that ends at the first `"`
 *   followed by that many `#`s.
 * - A float that ends in a dot (`1.`) is a decimal followed by a `.` token,
 *   so the parser rather than the lexer decides between `1.`, `1..2` and
 *   `1.max(2)`.
 * - Lifetimes and character literals are separate tokens; the longest match
 *   picks `'a'` over `'a`.
 *
 * Expressions that need a block after them (`if x {}`, `match x {}`) do not
 * exclude struct literals. Both readings are kept until one fails, which
 * happens as soon as the block is missing.
 */

/// <reference types="tree-sitter-cli/dsl" />
// @ts-check

const PREC = {
  closure: -1,
  assign: 1,
  range: 2,
  or: 3,
  and: 4,
  comparative: 5,
  bitor: 6,
  bitxor: 7,
  bitand: 8,
  shift: 9,
  additive: 10,
  multiplicative: 11,
  cast: 12,
  unary: 13,
  call: 14,
  // An expression statement that ends in a block (`if x {} -1`) ends there,
  // except before `.` and `?` (`match x {}.len()`).
  block_statement: 15,
  field: 16,
  try: 16,
};

const MAX_RAW_HASHES = 16;

const INTEGER_SUFFIX = /[iu](8|16|32|64|128|size)/;
const FLOAT_SUFFIX = /f(16|32|64|128)/;

const DEC = /[0-9][0-9_]*/;
const EXPONENT = /[eE][+-]?[0-9_]*[0-9][0-9_]*/;

// Keywords in the sense of the Rust Reference (strict and reserved), plus the
// weak keywords this grammar lexes as keywords. Token trees accept all of them.
const KEYWORDS = [
  'as', 'async', 'await', 'break', 'const', 'continue', 'crate', 'dyn', 'else',
  'enum', 'extern', 'false', 'fn', 'for', 'if', 'impl', 'in', 'let', 'loop',
  'match', 'mod', 'move', 'mut', 'pub', 'ref', 'return', 'self', 'static',
  'struct', 'super', 'trait', 'true', 'type', 'unsafe', 'use', 'where',
  'while', 'abstract', 'become', 'box', 'do', 'final', 'gen', 'macro',
  'override', 'priv', 'try', 'typeof', 'unsized', 'virtual', 'yield',
  'macro_rules', 'union', 'default', 'auto', 'raw', 'safe',
];

// Weak keywords: keywords in one position, names everywhere else.
// `_identifier` accepts them where both readings are possible.
const WEAK_KEYWORDS = ['union', 'default', 'auto', 'raw', 'safe', 'macro_rules'];

const PUNCTUATION = [
  '+', '-', '*', '/', '%', '^', '!', '&', '|', '&&', '||', '<<', '>>',
  '+=', '-=', '*=', '/=', '%=', '^=', '&=', '|=', '<<=', '>>=', '=', '==',
  '!=', '>', '<', '>=', '<=', '@', '_', '.', '..', '...', '..=', ',', ';',
  ':', '::', '->', '=>', '<-', '#', '$', '?', '~',
];

/**
 * A raw string with `n` hashes: it ends at the first `"` followed by `n`
 * `#`s, so its body has no `"` followed by `n` `#`s.
 *
 * @param {number} n
 */
function rawString(n) {
  const hashes = '#'.repeat(n);
  if (n === 0) {
    return new RegExp('[bc]?r"[^"]*"');
  }
  // A quote and fewer than n hashes.
  const q = n === 1 ? '"' : `"#{0,${n - 1}}`;
  return new RegExp(`[bc]?r${hashes}"([^"]|(${q})+[^"#])*(${q})*"${hashes}`);
}

/**
 * @param {RuleOrLiteral} sep
 * @param {RuleOrLiteral} rule
 */
function sepBy1(sep, rule) {
  return seq(rule, repeat(seq(sep, rule)));
}

/**
 * @param {RuleOrLiteral} sep
 * @param {RuleOrLiteral} rule
 */
function sepBy(sep, rule) {
  return optional(sepBy1(sep, rule));
}

/**
 * Comma separated, with an optional trailing comma.
 *
 * @param {RuleOrLiteral} rule
 */
function commaSep(rule) {
  return optional(seq(sepBy1(',', rule), optional(',')));
}

/**
 * @param {RuleOrLiteral} rule
 */
function commaSep1(rule) {
  return seq(sepBy1(',', rule), optional(','));
}

/**
 * A sequence of optional rules, at least one of which is present.
 *
 * @param {...RuleOrLiteral} rules
 */
function nonEmptySeq(...rules) {
  return choice(...rules.map((rule, i) => seq(rule, ...rules.slice(i + 1).map(r => optional(r)))));
}

module.exports = grammar({
  name: 'rust',

  // Rust's whitespace (Pattern_White_Space) includes NEL, LRM, RLM and the
  // line and paragraph separators.
  extras: $ => [/[\s\u0085\u200e\u200f\u2028\u2029]/, $.line_comment, $.doc_comment, $.block_comment],

  word: $ => $.identifier,

  supertypes: $ => [
    $._expression,
    $._type,
    $._literal,
    $._pattern,
    $._declaration_statement,
  ],

  inline: $ => [
    $._path,
    $._type_identifier,
    $._field_identifier,
    $._identifier,
    $._expression_ending_with_block,
  ],

  conflicts: $ => [
    // `1.` against `1.max(2)` and `1..2`: after a decimal, a `.` may finish
    // a float or start a method call.
    [$.integer_literal, $.float_literal],
    // `if x {}`: `x {` may start a struct literal. That reading fails when
    // the block after it is missing.
    [$._expression, $.struct_expression],
    // `pub (u8, u8)` in a tuple struct: a visibility or a type.
    [$.visibility_modifier],
    // `Fn(u8)` against `Fn`: a name may start a function-like trait type.
    [$._type, $.function_type],
    // `a::b::<T>` in a type: a path, or a generic type with a turbofish.
    [$.scoped_identifier, $.scoped_type_identifier],
  ],

  rules: {
    source_file: $ => seq(
      optional($.shebang),
      repeat($._statement),
    ),

    shebang: _ => token(/#![ \t]*[^\[\s][^\n]*/),

    // *** Comments ***

    // `///` and `//!` but not `////`.
    doc_comment: _ => token(choice(
      /\/\/\/([^\/\n][^\n]*)?/,
      /\/\/![^\n]*/,
    )),

    // After `doc_comment`, so that `/// x` is a doc comment: when two tokens
    // match the same text, the one defined first wins.
    line_comment: _ => token(/\/\/[^\n]*/),

    // Inside the comment, the delimiters outrank the text, and the text
    // outranks `//`, so `/* http://x */` is one comment.
    // Precedences, from low to high: `//`; a comment's opening token; the
    // text inside a comment, which can start with whitespace; a nested
    // comment's opening token and the closing tokens. Inside a comment, the
    // text must win over skipping whitespace and lexing `/*` or `//`.
    block_comment: $ => choice(
      token(prec(1, '/**/')),
      seq(
        token(prec(1, choice('/*', '/**', '/*!'))),
        repeat($._block_comment_part),
        token.immediate(prec(3, '*/')),
      ),
    ),

    // A comment inside a comment starts with an immediate token, so it is part
    // of the outer comment and not an extra of its own. It also ends with a
    // token of its own: when the outer comment ends, the next token can be
    // anything, but when a nested one ends, it can only be more comment.
    _nested_block_comment: $ => choice(
      token.immediate(prec(3, '/**/')),
      seq(
        token.immediate(prec(3, choice('/*', '/**', '/*!'))),
        repeat($._block_comment_part),
        token.immediate(prec(4, '*/')),
      ),
    ),

    _block_comment_part: $ => choice(
      alias($._nested_block_comment, $.block_comment),
      token.immediate(prec(2, /[^*\/]+/)),
      token.immediate(prec(2, /[*\/]/)),
    ),

    // *** Statements ***

    _statement: $ => choice(
      $.expression_statement,
      $._declaration_statement,
    ),

    empty_statement: _ => ';',

    // A macro invocation does not need a `;` either. Rust only allows that
    // for `foo! {}`, but which delimiter was used is not in the tree.
    expression_statement: $ => choice(
      seq($._expression, ';'),
      prec(PREC.block_statement, $._expression_ending_with_block),
      prec(PREC.block_statement, $.macro_invocation),
    ),

    _declaration_statement: $ => choice(
      $.const_item,
      $.macro_definition,
      $.empty_statement,
      $.attribute_item,
      $.inner_attribute_item,
      $.mod_item,
      $.foreign_mod_item,
      $.struct_item,
      $.union_item,
      $.enum_item,
      $.type_item,
      $.function_item,
      $.impl_item,
      $.trait_item,
      $.trait_alias_item,
      $.let_declaration,
      $.use_declaration,
      $.extern_crate_declaration,
      $.static_item,
    ),

    // *** Macros ***

    macro_definition: $ => choice(
      seq(
        'macro_rules',
        '!',
        field('name', $.identifier),
        choice(
          seq('(', sepBy(';', $.macro_rule), optional(';'), ')', ';'),
          seq('[', sepBy(';', $.macro_rule), optional(';'), ']', ';'),
          seq('{', sepBy(';', $.macro_rule), optional(';'), '}'),
        ),
      ),
      // Declarative macros 2.0: `macro m($x:expr) { ... }`.
      seq(
        optional($.visibility_modifier),
        'macro',
        field('name', $.identifier),
        choice(
          seq(field('parameters', alias($._paren_token_tree, $.token_tree)), field('body', alias($._brace_token_tree, $.token_tree))),
          seq('{', sepBy(',', $.macro_rule), optional(','), '}'),
        ),
      ),
    ),

    macro_rule: $ => seq(
      // `attr(..)` and `derive()` rules (unstable).
      optional(seq(field('kind', $.identifier), field('arguments', $.token_tree))),
      field('left', $.token_tree),
      '=>',
      field('right', $.token_tree),
    ),

    macro_invocation: $ => seq(
      field('macro', choice(
        $.scoped_identifier,
        $._identifier,
        // `try!` from Rust 2015.
        alias('try', $.identifier),
      )),
      '!',
      $.token_tree,
    ),

    token_tree: $ => choice(
      $._paren_token_tree,
      $._bracket_token_tree,
      $._brace_token_tree,
    ),

    _paren_token_tree: $ => seq('(', repeat($._token), ')'),
    _bracket_token_tree: $ => seq('[', repeat($._token), ']'),
    _brace_token_tree: $ => seq('{', repeat($._token), '}'),

    _token: $ => choice(
      $.token_tree,
      $.metavariable,
      $.string_literal,
      $.raw_string_literal,
      $.char_literal,
      $.integer_literal,
      alias($._float, $.float_literal),
      $.lifetime,
      $.identifier,
      ...KEYWORDS,
      ...PUNCTUATION,
    ),

    metavariable: _ => /\$[_\p{XID_Start}][_\p{XID_Continue}]*/,

    // *** Attributes ***

    attribute_item: $ => seq('#', '[', $.attribute, ']'),

    inner_attribute_item: $ => seq('#', '!', '[', $.attribute, ']'),

    attribute: $ => choice(
      seq(
        $._path,
        optional(choice(
          seq('=', field('value', $._expression)),
          field('arguments', alias($._delim_token_tree, $.token_tree)),
        )),
      ),
      // `#[unsafe(no_mangle)]`
      seq('unsafe', '(', $.attribute, ')'),
    ),

    _delim_token_tree: $ => choice(
      $._paren_token_tree,
      $._bracket_token_tree,
      $._brace_token_tree,
    ),

    // *** Items ***

    mod_item: $ => seq(
      optional($.visibility_modifier),
      optional('unsafe'),
      'mod',
      field('name', $._identifier),
      choice(';', field('body', $.declaration_list)),
    ),

    foreign_mod_item: $ => seq(
      optional($.visibility_modifier),
      optional('unsafe'),
      $.extern_modifier,
      choice(';', field('body', $.declaration_list)),
    ),

    declaration_list: $ => seq(
      '{',
      repeat(choice(
        $._declaration_statement,
        seq($.macro_invocation, optional(';')),
      )),
      '}',
    ),

    struct_item: $ => seq(
      optional($.visibility_modifier),
      'struct',
      field('name', $._type_identifier),
      field('type_parameters', optional($.type_parameters)),
      choice(
        seq(optional($.where_clause), field('body', $.field_declaration_list)),
        seq(
          field('body', $.ordered_field_declaration_list),
          optional($.where_clause),
          ';',
        ),
        seq(optional($.where_clause), ';'),
      ),
    ),

    union_item: $ => seq(
      optional($.visibility_modifier),
      'union',
      field('name', $._type_identifier),
      field('type_parameters', optional($.type_parameters)),
      optional($.where_clause),
      field('body', $.field_declaration_list),
    ),

    enum_item: $ => seq(
      optional($.visibility_modifier),
      'enum',
      field('name', $._type_identifier),
      field('type_parameters', optional($.type_parameters)),
      optional($.where_clause),
      field('body', $.enum_variant_list),
    ),

    enum_variant_list: $ => seq(
      '{',
      commaSep(seq(repeat($.attribute_item), $.enum_variant)),
      '}',
    ),

    enum_variant: $ => seq(
      optional($.visibility_modifier),
      field('name', $._identifier),
      field('body', optional(choice(
        $.field_declaration_list,
        $.ordered_field_declaration_list,
      ))),
      optional(seq('=', field('value', $._expression))),
    ),

    field_declaration_list: $ => seq(
      '{',
      commaSep(seq(repeat($.attribute_item), $.field_declaration)),
      '}',
    ),

    field_declaration: $ => seq(
      optional($.visibility_modifier),
      optional('unsafe'),
      field('name', $._field_identifier),
      ':',
      field('type', $._type),
      // Default field values (unstable).
      optional(seq('=', field('default', $._expression))),
    ),

    ordered_field_declaration_list: $ => seq(
      '(',
      commaSep(seq(
        repeat($.attribute_item),
        optional($.visibility_modifier),
        field('type', $._type),
      )),
      ')',
    ),

    extern_crate_declaration: $ => seq(
      optional($.visibility_modifier),
      'extern',
      $.crate,
      field('name', choice($._identifier, $.self)),
      optional(seq('as', field('alias', choice($._identifier, '_')))),
      ';',
    ),

    const_item: $ => seq(
      optional($.visibility_modifier),
      optional('default'),
      'const',
      field('name', choice($._identifier, '_')),
      field('type_parameters', optional($.type_parameters)),
      optional(seq(':', field('type', $._type))),
      optional(seq('=', field('value', $._expression))),
      optional($.where_clause),
      ';',
    ),

    static_item: $ => seq(
      optional($.visibility_modifier),
      optional(choice('unsafe', 'safe')),
      'static',
      optional($.mutable_specifier),
      field('name', $._identifier),
      ':',
      field('type', $._type),
      optional(seq('=', field('value', $._expression))),
      ';',
    ),

    type_item: $ => seq(
      optional($.visibility_modifier),
      optional('default'),
      'type',
      field('name', $._type_identifier),
      field('type_parameters', optional($.type_parameters)),
      optional(seq(':', field('bounds', optional($.trait_bounds)))),
      optional($.where_clause),
      optional(seq('=', field('type', $._type))),
      optional($.where_clause),
      ';',
    ),

    function_item: $ => seq(
      optional($.visibility_modifier),
      optional($.function_modifiers),
      'fn',
      field('name', $._identifier),
      field('type_parameters', optional($.type_parameters)),
      field('parameters', $.parameters),
      optional(seq('->', field('return_type', $._type))),
      optional($.where_clause),
      choice(field('body', $.block), ';'),
    ),

    // In the order Rust requires.
    function_modifiers: $ => nonEmptySeq(
      choice('default', 'final'),
      'const',
      'async',
      choice('unsafe', 'safe'),
      $.extern_modifier,
    ),

    extern_modifier: $ => seq(
      'extern',
      optional(field('abi', choice($.string_literal, $.raw_string_literal))),
    ),

    where_clause: $ => prec.right(seq(
      'where',
      optional(seq(
        sepBy1(',', seq(repeat($.attribute_item), $.where_predicate)),
        optional(','),
      )),
    )),

    where_predicate: $ => prec.right(seq(
      field('left', choice(
        $.lifetime,
        $._type,
        $.higher_ranked_trait_bound,
      )),
      ':',
      field('bounds', optional($.trait_bounds)),
    )),

    impl_item: $ => seq(
      optional('default'),
      optional('const'),
      optional('unsafe'),
      'impl',
      field('type_parameters', optional($.type_parameters)),
      optional(seq(
        optional('!'),
        field('trait', choice(
          $._type_identifier,
          $.scoped_type_identifier,
          $.generic_type,
          $.function_type,
        )),
        'for',
      )),
      field('type', $._type),
      optional($.where_clause),
      choice(field('body', $.declaration_list), ';'),
    ),

    trait_item: $ => seq(
      optional($.visibility_modifier),
      optional($.impl_restriction),
      optional('const'),
      optional('unsafe'),
      optional('auto'),
      'trait',
      field('name', $._type_identifier),
      field('type_parameters', optional($.type_parameters)),
      optional(seq(':', field('bounds', optional($.trait_bounds)))),
      optional($.where_clause),
      field('body', $.declaration_list),
    ),

    // `pub impl(crate) trait T {}` (unstable).
    impl_restriction: $ => seq(
      'impl',
      '(',
      choice($.self, $.super, $.crate, seq('in', $._path)),
      ')',
    ),

    trait_alias_item: $ => seq(
      optional($.visibility_modifier),
      'trait',
      field('name', $._type_identifier),
      field('type_parameters', optional($.type_parameters)),
      '=',
      field('bounds', optional($.trait_bounds)),
      optional($.where_clause),
      ';',
    ),

    type_parameters: $ => seq(
      '<',
      commaSep(seq(
        repeat($.attribute_item),
        choice(
          $.lifetime_parameter,
          $.type_parameter,
          $.const_parameter,
        ),
      )),
      '>',
    ),

    lifetime_parameter: $ => seq(
      field('name', $.lifetime),
      optional(seq(':', field('bounds', optional($.trait_bounds)))),
    ),

    // `impl<T>` has type parameters, not a qualified path (`impl <T>::A`).
    type_parameter: $ => prec(1, seq(
      field('name', $._type_identifier),
      optional(seq(':', field('bounds', optional($.trait_bounds)))),
      optional(seq('=', field('default_type', $._type))),
    )),

    const_parameter: $ => seq(
      'const',
      field('name', $._identifier),
      ':',
      field('type', $._type),
      optional(seq('=', field('value', choice(
        $.block,
        $._identifier,
        $._literal,
        $.negative_literal,
        $.const_block,
      )))),
    ),

    use_declaration: $ => seq(
      optional($.visibility_modifier),
      'use',
      field('argument', $._use_clause),
      ';',
    ),

    _use_clause: $ => choice(
      $._path,
      $.use_as_clause,
      $.use_list,
      $.scoped_use_list,
      $.use_wildcard,
    ),

    scoped_use_list: $ => seq(
      field('path', optional($._path)),
      '::',
      field('list', $.use_list),
    ),

    use_list: $ => seq('{', commaSep($._use_clause), '}'),

    use_as_clause: $ => seq(
      field('path', $._path),
      'as',
      field('alias', choice($._identifier, '_')),
    ),

    use_wildcard: $ => seq(
      optional(seq(optional($._path), '::')),
      '*',
    ),

    parameters: $ => seq(
      '(',
      commaSep(seq(
        repeat($.attribute_item),
        choice(
          $.parameter,
          $.self_parameter,
          $.variadic_parameter,
        ),
      )),
      ')',
    ),

    self_parameter: $ => seq(
      optional(seq(choice('&', '&&'), optional($.lifetime))),
      optional($.mutable_specifier),
      $.self,
      optional(seq(':', field('type', $._type))),
    ),

    variadic_parameter: $ => seq(
      optional(seq(field('pattern', $._pattern), ':')),
      '...',
    ),

    parameter: $ => seq(
      field('pattern', $._pattern),
      ':',
      field('type', $._type),
    ),

    visibility_modifier: $ => seq(
      'pub',
      optional(seq(
        '(',
        choice(
          $.self,
          $.super,
          $.crate,
          seq('in', $._path),
        ),
        ')',
      )),
    ),

    // *** Types ***

    _type: $ => choice(
      $.abstract_type,
      $.reference_type,
      $.pointer_type,
      $.generic_type,
      $.scoped_type_identifier,
      $.tuple_type,
      $.unit_type,
      $.array_type,
      $.function_type,
      $._type_identifier,
      $.macro_invocation,
      $.never_type,
      $.dynamic_type,
      $.bounded_type,
      $.inferred_type,
      $.parenthesized_type,
    ),

    bracketed_type: $ => seq(
      '<',
      choice($._type, $.qualified_type),
      '>',
    ),

    qualified_type: $ => seq(
      field('type', $._type),
      'as',
      field('alias', $._type),
    ),

    lifetime: _ => token(seq("'", /(r#)?[_\p{XID_Start}][_\p{XID_Continue}]*/)),

    array_type: $ => seq(
      '[',
      field('element', $._type),
      optional(seq(';', field('length', $._expression))),
      ']',
    ),

    for_lifetimes: $ => seq(
      'for',
      '<',
      commaSep($.lifetime),
      '>',
    ),

    function_type: $ => {
      const rest = [
        choice(
          field('trait', choice(
            $._type_identifier,
            $.scoped_type_identifier,
          )),
          seq(
            optional(choice('unsafe', 'safe')),
            optional($.extern_modifier),
            'fn',
          ),
        ),
        field('parameters', alias($.function_type_parameters, $.parameters)),
        optional(seq('->', field('return_type', $._type))),
      ];
      return choice(
        prec(1, seq($.for_lifetimes, ...rest)),
        seq(...rest),
      );
    },

    // Parameters of `fn(..)` types and `Fn(..)` bounds: types, optionally
    // named.
    function_type_parameters: $ => seq(
      '(',
      commaSep(seq(
        repeat($.attribute_item),
        choice(
          $._type,
          alias($.function_type_parameter, $.parameter),
          alias($.function_type_variadic, $.variadic_parameter),
        ),
      )),
      ')',
    ),

    function_type_variadic: $ => seq(
      optional(seq(field('pattern', choice($._identifier, '_')), ':')),
      '...',
    ),

    function_type_parameter: $ => seq(
      field('pattern', choice($._identifier, '_')),
      ':',
      field('type', $._type),
    ),

    tuple_type: $ => seq('(', $._type, ',', commaSep($._type), ')'),

    parenthesized_type: $ => seq('(', $._type, ')'),

    unit_type: _ => seq('(', ')'),

    // `Vec<T>`, or `Vec::<T>`, which types also accept.
    generic_type: $ => prec(1, seq(
      field('type', choice(
        $._type_identifier,
        $.scoped_type_identifier,
      )),
      optional('::'),
      field('type_arguments', $.type_arguments),
    )),

    generic_type_with_turbofish: $ => seq(
      field('type', choice(
        $._type_identifier,
        $.scoped_identifier,
      )),
      '::',
      field('type_arguments', $.type_arguments),
    ),

    bounded_type: $ => prec.left(-1, seq(
      choice($.lifetime, $._type, $.use_bounds),
      '+',
      choice($.lifetime, $._type, $.use_bounds),
    )),

    // Precise capturing: `impl Trait + use<'a, T>`.
    use_bounds: $ => seq(
      'use',
      '<',
      commaSep(choice($.lifetime, $._type_identifier, $.self)),
      '>',
    ),

    type_arguments: $ => seq(
      '<',
      commaSep(choice(
        $._type,
        $.type_binding,
        $.lifetime,
        $._literal,
        $.negative_literal,
        $.block,
      )),
      '>',
    ),

    type_binding: $ => seq(
      field('name', $._type_identifier),
      field('type_arguments', optional($.type_arguments)),
      choice(
        seq('=', field('type', $._type)),
        // Associated constants (unstable): `Trait<N = 3>`.
        seq('=', field('value', choice($._literal, $.negative_literal, $.block, $.const_block))),
        seq(':', field('bounds', optional($.trait_bounds))),
      ),
    ),

    reference_type: $ => seq(
      choice('&', '&&'),
      optional($.lifetime),
      optional($.mutable_specifier),
      field('type', $._type),
    ),

    pointer_type: $ => seq(
      '*',
      choice('const', $.mutable_specifier),
      field('type', $._type),
    ),

    never_type: _ => '!',

    inferred_type: _ => '_',

    abstract_type: $ => prec.right(seq(
      'impl',
      field('trait', $.trait_bounds),
    )),

    dynamic_type: $ => prec.right(seq(
      'dyn',
      field('trait', $.trait_bounds),
    )),

    mutable_specifier: _ => 'mut',

    trait_bounds: $ => prec.right(seq(
      sepBy1('+', $._bound),
      optional('+'),
    )),

    _bound: $ => choice(
      $._type,
      $.lifetime,
      $.higher_ranked_trait_bound,
      $.removed_trait_bound,
      $.use_bounds,
      $.modified_trait_bound,
    ),

    // `const Trait`, `[const] Trait`, `~const Trait`, `async Fn()`.
    modified_trait_bound: $ => seq(
      field('modifier', $.bound_modifier),
      field('type', $._type),
    ),

    bound_modifier: _ => choice(
      'const',
      'async',
      seq('[', 'const', ']'),
      seq('~', 'const'),
    ),

    higher_ranked_trait_bound: $ => seq(
      $.for_lifetimes,
      optional(field('modifier', $.bound_modifier)),
      field('type', $._type),
    ),

    removed_trait_bound: $ => seq('?', $._type),

    // *** Expressions ***

    _expression: $ => choice(
      $.unary_expression,
      $.reference_expression,
      $.try_expression,
      $.binary_expression,
      $.assignment_expression,
      $.compound_assignment_expr,
      $.type_cast_expression,
      $.call_expression,
      $.return_expression,
      $.yield_expression,
      $.become_expression,
      $.yeet_expression,
      $._literal,
      prec.left($._identifier),
      $.self,
      $.scoped_identifier,
      $.generic_function,
      $.await_expression,
      $.field_expression,
      $.array_expression,
      $.tuple_expression,
      prec(1, $.macro_invocation),
      $.unit_expression,
      $.break_expression,
      $.continue_expression,
      $.index_expression,
      $.metavariable,
      $.closure_expression,
      $.parenthesized_expression,
      $.struct_expression,
      $.range_expression,
      $.underscore_expression,
      $._expression_ending_with_block,
    ),

    _expression_ending_with_block: $ => choice(
      $.unsafe_block,
      $.async_block,
      $.gen_block,
      $.try_block,
      $.block,
      $.if_expression,
      $.match_expression,
      $.while_expression,
      $.loop_expression,
      $.for_expression,
      $.const_block,
    ),

    underscore_expression: _ => '_',

    scoped_identifier: $ => seq(
      field('path', optional(choice(
        $._path,
        $.bracketed_type,
        alias($.generic_type_with_turbofish, $.generic_type),
      ))),
      '::',
      field('name', choice($._identifier, $.super)),
    ),

    scoped_type_identifier: $ => seq(
      field('path', optional(choice(
        $._path,
        alias($.generic_type_with_turbofish, $.generic_type),
        $.bracketed_type,
        $.generic_type,
      ))),
      '::',
      field('name', $._type_identifier),
    ),

    _path: $ => choice(
      $.self,
      $.super,
      $.crate,
      $._identifier,
      $.scoped_identifier,
      $.metavariable,
    ),

    range_expression: $ => prec.left(PREC.range, choice(
      seq($._expression, choice('..', '...', '..='), $._expression),
      seq($._expression, '..'),
      seq(choice('..', '..='), $._expression),
      '..',
    )),

    unary_expression: $ => prec(PREC.unary, seq(
      choice('-', '*', '!'),
      $._expression,
    )),

    try_expression: $ => prec(PREC.try, seq($._expression, '?')),

    reference_expression: $ => prec(PREC.unary, seq(
      choice('&', '&&'),
      choice(
        seq('raw', choice('const', $.mutable_specifier)),
        optional($.mutable_specifier),
      ),
      field('value', $._expression),
    )),

    binary_expression: $ => {
      const table = [
        [PREC.and, '&&'],
        [PREC.or, '||'],
        [PREC.bitand, '&'],
        [PREC.bitor, '|'],
        [PREC.bitxor, '^'],
        [PREC.comparative, choice('==', '!=', '<', '<=', '>', '>=')],
        [PREC.shift, choice('<<', '>>')],
        [PREC.additive, choice('+', '-')],
        [PREC.multiplicative, choice('*', '/', '%')],
      ];

      // @ts-ignore
      return choice(...table.map(([precedence, operator]) => prec.left(precedence, seq(
        field('left', $._expression),
        // @ts-ignore
        field('operator', operator),
        field('right', $._expression),
      ))));
    },

    assignment_expression: $ => prec.right(PREC.assign, seq(
      field('left', $._expression),
      '=',
      field('right', $._expression),
    )),

    compound_assignment_expr: $ => prec.right(PREC.assign, seq(
      field('left', $._expression),
      field('operator', choice('+=', '-=', '*=', '/=', '%=', '&=', '|=', '^=', '<<=', '>>=')),
      field('right', $._expression),
    )),

    type_cast_expression: $ => prec.left(PREC.cast, seq(
      field('value', $._expression),
      'as',
      field('type', $._type),
    )),

    return_expression: $ => choice(
      prec.left(seq('return', $._expression)),
      prec(-1, 'return'),
    ),

    yield_expression: $ => choice(
      prec.left(seq('yield', $._expression)),
      prec(-1, 'yield'),
    ),

    // `do yeet x` (unstable).
    yeet_expression: $ => prec.left(seq('do', 'yeet', optional($._expression))),

    become_expression: $ => prec.left(seq('become', $._expression)),

    call_expression: $ => prec(PREC.call, seq(
      field('function', $._expression),
      field('arguments', $.arguments),
    )),

    arguments: $ => seq(
      '(',
      commaSep(seq(repeat($.attribute_item), $._expression)),
      ')',
    ),

    array_expression: $ => seq(
      '[',
      choice(
        seq(
          repeat($.attribute_item),
          $._expression,
          ';',
          field('length', $._expression),
        ),
        commaSep(seq(repeat($.attribute_item), $._expression)),
      ),
      ']',
    ),

    parenthesized_expression: $ => seq(
      '(',
      repeat($.attribute_item),
      $._expression,
      ')',
    ),

    tuple_expression: $ => seq(
      '(',
      repeat($.attribute_item),
      seq($._expression, ','),
      repeat(seq(repeat($.attribute_item), $._expression, ',')),
      optional(seq(repeat($.attribute_item), $._expression)),
      ')',
    ),

    unit_expression: _ => seq('(', ')'),

    struct_expression: $ => seq(
      field('name', choice(
        $._type_identifier,
        alias($.scoped_identifier, $.scoped_type_identifier),
        $.generic_type_with_turbofish,
        $.metavariable,
      )),
      field('body', $.field_initializer_list),
    ),

    field_initializer_list: $ => seq(
      '{',
      commaSep(choice(
        $.shorthand_field_initializer,
        $.field_initializer,
        $.base_field_initializer,
      )),
      '}',
    ),

    shorthand_field_initializer: $ => seq(
      repeat($.attribute_item),
      $._identifier,
    ),

    field_initializer: $ => seq(
      repeat($.attribute_item),
      field('field', choice($._field_identifier, $.integer_literal)),
      ':',
      field('value', $._expression),
    ),

    base_field_initializer: $ => seq(
      '..',
      optional($._expression),
    ),

    if_expression: $ => prec.right(seq(
      'if',
      field('condition', $._condition),
      field('consequence', $.block),
      optional(field('alternative', $.else_clause)),
    )),

    let_condition: $ => seq(
      'let',
      optional('|'),
      field('pattern', $._pattern),
      '=',
      field('value', prec.left(PREC.and, $._expression)),
    ),

    _let_chain: $ => prec.left(PREC.and, choice(
      seq($._let_chain, '&&', $.let_condition),
      seq($._let_chain, '&&', $._expression),
      seq($.let_condition, '&&', $._expression),
      seq($.let_condition, '&&', $.let_condition),
      seq($._expression, '&&', $.let_condition),
    )),

    let_chain: $ => $._let_chain,

    _condition: $ => choice(
      $._expression,
      $.let_condition,
      $.let_chain,
    ),

    else_clause: $ => seq(
      'else',
      choice($.block, $.if_expression),
    ),

    match_expression: $ => seq(
      'match',
      field('value', $._expression),
      field('body', $.match_block),
    ),

    match_block: $ => seq(
      '{',
      repeat($.inner_attribute_item),
      optional(seq(
        repeat($.match_arm),
        alias($.last_match_arm, $.match_arm),
      )),
      '}',
    ),

    match_arm: $ => prec.right(seq(
      repeat($.attribute_item),
      field('pattern', $.match_pattern),
      '=>',
      choice(
        seq(field('value', $._expression), ','),
        field('value', prec(1, $._expression_ending_with_block)),
      ),
    )),

    last_match_arm: $ => seq(
      repeat($.attribute_item),
      field('pattern', $.match_pattern),
      '=>',
      field('value', $._expression),
      optional(','),
    ),

    match_pattern: $ => seq(
      optional('|'),
      $._pattern,
      optional(seq('if', field('condition', $._condition))),
    ),

    while_expression: $ => seq(
      optional(seq(alias($.lifetime, $.label), ':')),
      'while',
      field('condition', $._condition),
      field('body', $.block),
    ),

    loop_expression: $ => seq(
      optional(seq(alias($.lifetime, $.label), ':')),
      'loop',
      field('body', $.block),
    ),

    for_expression: $ => seq(
      optional(seq(alias($.lifetime, $.label), ':')),
      'for',
      field('pattern', $._pattern),
      'in',
      field('value', $._expression),
      field('body', $.block),
    ),

    const_block: $ => seq(
      'const',
      field('body', $.block),
    ),

    closure_expression: $ => prec(PREC.closure, seq(
      optional($.for_lifetimes),
      optional('const'),
      optional('static'),
      optional('async'),
      optional('move'),
      field('parameters', $.closure_parameters),
      choice(
        seq(
          optional(seq('->', field('return_type', $._type))),
          field('body', $.block),
        ),
        field('body', choice($._expression, '_')),
      ),
    )),

    closure_parameters: $ => choice(
      '||',
      seq(
        '|',
        commaSep(seq(
          repeat($.attribute_item),
          choice(
            $._pattern_no_top_alt,
            alias($.closure_parameter, $.parameter),
          ),
        )),
        '|',
      ),
    ),

    closure_parameter: $ => seq(
      field('pattern', $._pattern_no_top_alt),
      ':',
      field('type', $._type),
    ),

    // Without a value, `break` and `return` have the lowest precedence, so
    // `break [1]` breaks with an array instead of indexing `break`.
    break_expression: $ => choice(
      prec.left(seq('break', optional(alias($.lifetime, $.label)), $._expression)),
      prec(-1, seq('break', optional(alias($.lifetime, $.label)))),
    ),

    continue_expression: $ => prec.left(seq(
      'continue',
      optional(alias($.lifetime, $.label)),
    )),

    index_expression: $ => prec(PREC.call, seq($._expression, '[', $._expression, ']')),

    await_expression: $ => prec(PREC.field, seq(
      $._expression,
      '.',
      'await',
    )),

    field_expression: $ => prec(PREC.field, seq(
      field('value', $._expression),
      '.',
      field('field', choice(
        $._field_identifier,
        $.integer_literal,
      )),
    )),

    generic_function: $ => prec(1, seq(
      field('function', choice(
        $._identifier,
        $.scoped_identifier,
        $.field_expression,
      )),
      '::',
      field('type_arguments', $.type_arguments),
    )),

    unsafe_block: $ => seq('unsafe', $.block),

    async_block: $ => seq('async', optional('move'), $.block),

    gen_block: $ => seq('gen', optional('move'), $.block),

    try_block: $ => seq('try', $.block),

    block: $ => seq(
      optional(seq(alias($.lifetime, $.label), ':')),
      '{',
      repeat($._statement),
      optional($._expression),
      '}',
    ),

    let_declaration: $ => seq(
      // `super let` (unstable).
      optional('super'),
      'let',
      field('pattern', $._pattern),
      optional(seq(':', field('type', $._type))),
      optional(seq(
        '=',
        repeat($.attribute_item),
        field('value', $._expression),
        optional(seq('else', field('alternative', $.block))),
      )),
      ';',
    ),

    // *** Patterns ***

    _pattern: $ => choice(
      $._pattern_no_top_alt,
      $.or_pattern,
    ),

    or_pattern: $ => prec.left(-2, seq(
      $._pattern,
      '|',
      $._pattern,
    )),

    _pattern_no_top_alt: $ => choice(
      $._literal_pattern,
      $._identifier,
      $.scoped_identifier,
      alias($.generic_type_with_turbofish, $.generic_pattern),
      $.tuple_pattern,
      $.tuple_struct_pattern,
      $.struct_pattern,
      $.ref_pattern,
      $.slice_pattern,
      $.captured_pattern,
      $.reference_pattern,
      $.remaining_field_pattern,
      $.mut_pattern,
      $.range_pattern,
      $.box_pattern,
      $.const_block,
      $.macro_invocation,
      $.metavariable,
      '_',
    ),

    tuple_pattern: $ => seq('(', commaSep($._pattern), ')'),

    slice_pattern: $ => seq('[', commaSep($._pattern), ']'),

    tuple_struct_pattern: $ => seq(
      field('type', choice(
        $._identifier,
        $.scoped_identifier,
        alias($.generic_type_with_turbofish, $.generic_type),
      )),
      '(',
      commaSep($._pattern),
      ')',
    ),

    struct_pattern: $ => seq(
      field('type', choice(
        $._type_identifier,
        alias($.scoped_identifier, $.scoped_type_identifier),
        alias($.generic_type_with_turbofish, $.generic_type),
      )),
      '{',
      commaSep(choice($.field_pattern, $.remaining_field_pattern)),
      '}',
    ),

    field_pattern: $ => seq(
      repeat($.attribute_item),
      optional('box'),
      optional($.ref_specifier),
      optional($.mutable_specifier),
      choice(
        field('name', alias($._identifier, $.shorthand_field_identifier)),
        seq(
          field('name', choice($._field_identifier, $.integer_literal)),
          ':',
          field('pattern', $._pattern),
        ),
      ),
    ),

    remaining_field_pattern: _ => '..',

    mut_pattern: $ => prec(-1, seq(
      $.mutable_specifier,
      $._pattern_no_top_alt,
    )),

    ref_specifier: _ => 'ref',

    ref_pattern: $ => seq(
      $.ref_specifier,
      optional($.mutable_specifier),
      $._pattern_no_top_alt,
    ),

    box_pattern: $ => seq('box', $._pattern_no_top_alt),

    captured_pattern: $ => prec.right(1, seq(
      $._pattern_no_top_alt,
      '@',
      $._pattern_no_top_alt,
    )),

    reference_pattern: $ => seq(
      choice('&', '&&'),
      optional($.mutable_specifier),
      $._pattern_no_top_alt,
    ),

    range_pattern: $ => choice(
      seq(
        field('left', $._range_pattern_bound),
        choice('...', '..=', '..'),
        field('right', $._range_pattern_bound),
      ),
      prec(-1, seq(field('left', $._range_pattern_bound), '..')),
      seq(choice('..=', '..'), field('right', $._range_pattern_bound)),
    ),

    _range_pattern_bound: $ => choice(
      $._literal_pattern,
      $._path,
    ),

    _literal_pattern: $ => choice(
      $.string_literal,
      $.raw_string_literal,
      $.char_literal,
      $.boolean_literal,
      $.integer_literal,
      $.float_literal,
      $.negative_literal,
    ),

    negative_literal: $ => seq('-', choice($.integer_literal, $.float_literal)),

    // *** Literals ***

    _literal: $ => choice(
      $.string_literal,
      $.raw_string_literal,
      $.char_literal,
      $.boolean_literal,
      $.integer_literal,
      $.float_literal,
    ),

    _decimal: _ => DEC,

    integer_literal: $ => choice(
      $._decimal,
      token(choice(
        seq(DEC, INTEGER_SUFFIX),
        seq(/0x[0-9a-fA-F_]*[0-9a-fA-F][0-9a-fA-F_]*/, optional(INTEGER_SUFFIX)),
        seq(/0o[0-7_]*[0-7][0-7_]*/, optional(INTEGER_SUFFIX)),
        seq(/0b[01_]*[01][01_]*/, optional(INTEGER_SUFFIX)),
      )),
    ),

    _float: _ => token(choice(
      seq(DEC, '.', DEC, optional(EXPONENT), optional(FLOAT_SUFFIX)),
      seq(DEC, EXPONENT, optional(FLOAT_SUFFIX)),
      seq(DEC, FLOAT_SUFFIX),
    )),

    float_literal: $ => choice(
      $._float,
      seq($._decimal, '.'),
    ),

    string_literal: $ => seq(
      choice('"', 'b"', 'c"'),
      repeat(choice(
        $.escape_sequence,
        $.string_content,
      )),
      token.immediate('"'),
    ),

    string_content: _ => token.immediate(prec(2, /[^"\\]+/)),

    escape_sequence: _ => token.immediate(seq(
      '\\',
      choice(
        /[^xu]/,
        /x[0-9a-fA-F]{2}/,
        /u\{[0-9a-fA-F_]*\}/,
      ),
    )),

    raw_string_literal: _ => token(choice(
      ...Array.from({ length: MAX_RAW_HASHES + 1 }, (_, n) => rawString(n)),
    )),

    char_literal: _ => token(seq(
      optional('b'),
      "'",
      choice(
        seq('\\', choice(
          /[^xu]/,
          /x[0-9a-fA-F]{2}/,
          /u\{[0-9a-fA-F_]*\}/,
        )),
        /[^\\']/,
      ),
      "'",
    )),

    boolean_literal: _ => choice('true', 'false'),

    identifier: _ => /(r#)?[_\p{XID_Start}][_\p{XID_Continue}]*/,

    _identifier: $ => choice(
      $.identifier,
      alias(choice(...WEAK_KEYWORDS), $.identifier),
    ),

    _type_identifier: $ => alias($._identifier, $.type_identifier),
    _field_identifier: $ => alias($._identifier, $.field_identifier),

    self: _ => 'self',
    super: _ => 'super',
    crate: _ => 'crate',
  },
});
