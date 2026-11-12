/**
 * @file Java grammar for tree-sitter
 * @license MIT
 *
 * Java SE 25, following the Java Language Specification (chapters 3 and
 * 7-15). Every
 * token is regular, so there is no external scanner: text blocks are a run of
 * immediate tokens, which keeps comments and whitespace from being lexed
 * inside them.
 *
 * Java's syntax is not LR(1), mainly because a name can start either a type
 * or an expression (`Foo<Bar> x;` against `a < b`, `a[] x` against `a[i]`,
 * `(T) x` against `(a) - b`). Those spots are declared conflicts and the GLR
 * parser keeps both readings until one fails. When both succeed, dynamic
 * precedence picks the one the JLS picks: a declaration over an expression
 * statement, `(a) - b` as a subtraction, `yield (x);` as a yield statement.
 *
 * Contextual keywords (`record`, `yield`, `sealed`, `module`, ...) are lexed
 * as keywords wherever that reading is possible, so `_identifier` also
 * accepts them, aliased to `identifier`: `record.get()` and
 * `import module.Foo;` parse. `var` is not a keyword at all: it is a
 * `type_identifier`, recognized by the highlight query.
 */

/// <reference types="tree-sitter-cli/dsl" />
// @ts-check

const PREC = {
  lambda: 0,
  assignment: 1,
  ternary: 2,
  or: 3,
  and: 4,
  bit_or: 5,
  bit_xor: 6,
  bit_and: 7,
  equality: 8,
  relational: 9,
  shift: 10,
  additive: 11,
  multiplicative: 12,
  cast: 13,
  unary: 14,
  postfix: 15,
  primary: 16,
};

const ASSIGNMENT_OPERATORS = [
  '=', '+=', '-=', '*=', '/=', '%=', '&=', '|=', '^=', '<<=', '>>=', '>>>=',
];

const BINARY_OPERATORS = [
  [PREC.or, '||'],
  [PREC.and, '&&'],
  [PREC.bit_or, '|'],
  [PREC.bit_xor, '^'],
  [PREC.bit_and, '&'],
  [PREC.equality, choice('==', '!=')],
  [PREC.relational, choice('<', '<=', '>', '>=')],
  [PREC.shift, choice('<<', '>>', '>>>')],
  [PREC.additive, choice('+', '-')],
  [PREC.multiplicative, choice('*', '/', '%')],
];

const MODIFIERS = [
  'public', 'protected', 'private', 'abstract', 'static', 'final', 'sealed',
  'non-sealed', 'strictfp', 'transient', 'volatile', 'synchronized', 'native',
  'default',
  // Value classes (JEP 401, a preview feature): `value class`, `value record`.
  'value',
];

// Digits with the underscores Java allows between them (JLS 3.10.1).
const dec = /[0-9]([0-9_]*[0-9])?/;
const hex = /[0-9a-fA-F]([0-9a-fA-F_]*[0-9a-fA-F])?/;

module.exports = grammar({
  name: 'java',

  extras: $ => [/\s/, $.line_comment, $.block_comment],

  word: $ => $.identifier,

  supertypes: $ => [
    $._expression,
    $._primary_expression,
    $._statement,
    $._literal,
    $._type,
    $._simple_type,
    $._unannotated_type,
    $._pattern,
  ],

  inline: $ => [
    $._type_identifier,
    $._identifier,
    $._name,
    $._class_body_declaration,
  ],

  conflicts: $ => [
    // A name at the start of a statement or operand: a type (declaration,
    // cast, method reference) or an expression.
    [$._simple_type, $._primary_expression],
    [$._simple_type, $.scoped_type_identifier],
    [$._simple_type, $.scoped_type_identifier, $._primary_expression],
    [$._simple_type, $.generic_type],
    [$.generic_type, $._primary_expression],
    [$._primary_expression, $.lambda_expression],
    [$._primary_expression, $.inferred_parameters],
    [$._simple_type, $._primary_expression, $.inferred_parameters],
    // `@A @interface B {}`: whether `@` starts another annotation.
    [$.modifiers],
    [$.modifiers, $.annotated_type],
    [$.modifiers, $.annotated_type, $.receiver_parameter],
    // `new @A T @B []`: annotations on the element type or the dimensions.
    [$.annotated_type, $.array_type],
    // `case R()`: a record pattern or a call.
    [$.record_pattern, $.argument_list],
    // `int value();` in an annotation type: an element or an abstract method.
    [$.annotation_type_element_declaration, $.formal_parameters],
    // `switch (x) {};`: a switch statement, then an empty statement.
    [$.switch_statement, $.switch_expression],
    [$.dimensions], // auto: _unannotated_type  dimensions_repeat1  •  '@'  …
  ],

  rules: {
    // *** Compilation units (JLS 7.3) ***
    //
    // Ordinary, modular and compact compilation units share one rule. The
    // order of package, imports and declarations is not enforced, and the
    // top level also takes methods and fields, as compact source files do.

    program: $ => repeat($._top_level_declaration),

    _top_level_declaration: $ => choice(
      $.package_declaration,
      $.import_declaration,
      $.module_declaration,
      $._class_body_declaration,
    ),

    package_declaration: $ => seq(
      optional($.modifiers),
      'package',
      field('name', $._name),
      ';',
    ),

    import_declaration: $ => seq(
      'import',
      choice(
        seq('module', field('module', $._name)),
        seq(
          optional('static'),
          field('name', $._name),
          optional(seq('.', $.asterisk)),
        ),
      ),
      ';',
    ),

    asterisk: _ => '*',

    // *** Modules (JLS 7.7) ***

    module_declaration: $ => seq(
      optional($.modifiers),
      optional('open'),
      'module',
      field('name', $._name),
      field('body', $.module_body),
    ),

    module_body: $ => seq('{', repeat($._module_directive), '}'),

    _module_directive: $ => choice(
      $.requires_directive,
      $.exports_directive,
      $.opens_directive,
      $.uses_directive,
      $.provides_directive,
    ),

    requires_directive: $ => seq(
      'requires',
      repeat(field('modifier', alias(choice('transitive', 'static'), $.requires_modifier))),
      field('module', $._name),
      ';',
    ),

    exports_directive: $ => seq(
      'exports',
      field('package', $._name),
      optional(seq('to', commaSep1(field('module', $._name)))),
      ';',
    ),

    opens_directive: $ => seq(
      'opens',
      field('package', $._name),
      optional(seq('to', commaSep1(field('module', $._name)))),
      ';',
    ),

    uses_directive: $ => seq('uses', field('type', $._name), ';'),

    provides_directive: $ => seq(
      'provides',
      field('service', $._name),
      'with',
      commaSep1(field('provider', $._name)),
      ';',
    ),

    // *** Class and interface declarations (JLS 8, 9) ***

    class_declaration: $ => seq(
      optional($.modifiers),
      'class',
      field('name', $.identifier),
      optional(field('type_parameters', $.type_parameters)),
      optional(field('superclass', $.superclass)),
      optional(field('interfaces', $.super_interfaces)),
      optional(field('permits', $.permits)),
      field('body', $.class_body),
    ),

    record_declaration: $ => seq(
      optional($.modifiers),
      'record',
      field('name', $.identifier),
      optional(field('type_parameters', $.type_parameters)),
      field('parameters', $.formal_parameters),
      optional(field('interfaces', $.super_interfaces)),
      field('body', $.class_body),
    ),

    enum_declaration: $ => seq(
      optional($.modifiers),
      'enum',
      field('name', $.identifier),
      optional(field('interfaces', $.super_interfaces)),
      field('body', $.enum_body),
    ),

    interface_declaration: $ => seq(
      optional($.modifiers),
      'interface',
      field('name', $.identifier),
      optional(field('type_parameters', $.type_parameters)),
      optional(field('interfaces', $.extends_interfaces)),
      optional(field('permits', $.permits)),
      field('body', $.interface_body),
    ),

    annotation_type_declaration: $ => seq(
      optional($.modifiers),
      '@',
      'interface',
      field('name', $.identifier),
      field('body', $.annotation_type_body),
    ),

    superclass: $ => seq('extends', $._type),
    super_interfaces: $ => seq('implements', $.type_list),
    extends_interfaces: $ => seq('extends', $.type_list),
    permits: $ => seq('permits', $.type_list),
    type_list: $ => commaSep1($._type),

    modifiers: $ => repeat1(choice($.annotation, ...MODIFIERS)),

    class_body: $ => seq('{', repeat($._class_body_declaration), '}'),

    interface_body: $ => seq('{', repeat($._class_body_declaration), '}'),

    annotation_type_body: $ => seq('{', repeat(choice(
      $.annotation_type_element_declaration,
      $._class_body_declaration,
    )), '}'),

    enum_body: $ => seq(
      '{',
      commaSep($.enum_constant),
      optional(','),
      optional($.enum_body_declarations),
      '}',
    ),

    enum_body_declarations: $ => seq(';', repeat($._class_body_declaration)),

    enum_constant: $ => seq(
      optional($.modifiers),
      field('name', $._identifier),
      optional(field('arguments', $.argument_list)),
      optional(field('body', $.class_body)),
    ),

    _class_body_declaration: $ => choice(
      $._declaration,
      $.field_declaration,
      $.method_declaration,
      $.constructor_declaration,
      $.compact_constructor_declaration,
      $.static_initializer,
      $.block,
      ';',
    ),

    _declaration: $ => choice(
      $.class_declaration,
      $.record_declaration,
      $.enum_declaration,
      $.interface_declaration,
      $.annotation_type_declaration,
    ),

    field_declaration: $ => seq(
      optional($.modifiers),
      field('type', $._unannotated_type),
      commaSep1(field('declarator', $.variable_declarator)),
      ';',
    ),

    method_declaration: $ => seq(
      optional($.modifiers),
      optional(seq(
        field('type_parameters', $.type_parameters),
        repeat($.annotation),
      )),
      field('type', choice($._unannotated_type, $.void_type)),
      field('name', $._identifier),
      field('parameters', $.formal_parameters),
      optional(field('dimensions', $.dimensions)),
      optional($.throws),
      choice(field('body', $.block), ';'),
    ),

    constructor_declaration: $ => seq(
      optional($.modifiers),
      optional(field('type_parameters', $.type_parameters)),
      field('name', $.identifier),
      field('parameters', $.formal_parameters),
      optional($.throws),
      field('body', $.block),
    ),

    // A record's canonical constructor without a parameter list.
    compact_constructor_declaration: $ => seq(
      optional($.modifiers),
      field('name', $.identifier),
      field('body', $.block),
    ),

    static_initializer: $ => seq('static', $.block),

    annotation_type_element_declaration: $ => prec.dynamic(1, seq(
      optional($.modifiers),
      field('type', $._unannotated_type),
      field('name', $._identifier),
      '(', ')',
      optional(field('dimensions', $.dimensions)),
      optional(seq('default', field('value', $._element_value))),
      ';',
    )),

    formal_parameters: $ => seq(
      '(',
      optional(choice(
        seq($.receiver_parameter, optional(seq(',', commaSep1($._formal_parameter)))),
        commaSep1($._formal_parameter),
      )),
      ')',
    ),

    _formal_parameter: $ => choice($.formal_parameter, $.spread_parameter),

    formal_parameter: $ => seq(
      optional($.modifiers),
      field('type', $._unannotated_type),
      $._variable_declarator_id,
    ),

    spread_parameter: $ => seq(
      optional($.modifiers),
      field('type', $._unannotated_type),
      repeat($.annotation),
      '...',
      $._variable_declarator_id,
    ),

    // `void f(Foo this)` or, in an inner class constructor, `A.B A.B.this`.
    receiver_parameter: $ => seq(
      repeat($.annotation),
      field('type', $._unannotated_type),
      repeat(seq($.identifier, '.')),
      $.this,
    ),

    throws: $ => seq('throws', commaSep1($._type)),

    variable_declarator: $ => seq(
      $._variable_declarator_id,
      optional(seq('=', field('value', $._variable_initializer))),
    ),

    _variable_declarator_id: $ => seq(
      field('name', $._identifier),
      optional(field('dimensions', $.dimensions)),
    ),

    _variable_initializer: $ => choice($._expression, $.array_initializer),

    array_initializer: $ => seq(
      '{',
      commaSep($._variable_initializer),
      optional(','),
      '}',
    ),

    // *** Annotations (JLS 9.7) ***

    annotation: $ => prec.right(seq(
      '@',
      field('name', $._name),
      optional(field('arguments', $.annotation_argument_list)),
    )),

    annotation_argument_list: $ => seq(
      '(',
      optional(choice($._element_value, commaSep1($.element_value_pair))),
      ')',
    ),

    element_value_pair: $ => seq(
      field('key', $._identifier),
      '=',
      field('value', $._element_value),
    ),

    _element_value: $ => choice(
      $._expression,
      $.element_value_array_initializer,
      $.annotation,
    ),

    element_value_array_initializer: $ => seq(
      '{',
      commaSep($._element_value),
      optional(','),
      '}',
    ),

    // *** Types (JLS 4, 8.1.2) ***

    _type: $ => choice($._unannotated_type, $.annotated_type),

    _unannotated_type: $ => choice($._simple_type, $.array_type),

    _simple_type: $ => choice(
      $.primitive_type,
      $._type_identifier,
      $.scoped_type_identifier,
      $.generic_type,
    ),

    annotated_type: $ => seq(repeat1($.annotation), $._unannotated_type),

    primitive_type: _ => choice(
      'byte', 'short', 'int', 'long', 'char', 'float', 'double', 'boolean',
    ),

    void_type: _ => 'void',

    _type_identifier: $ => alias($.identifier, $.type_identifier),

    scoped_type_identifier: $ => seq(
      field('scope', choice($._type_identifier, $.scoped_type_identifier, $.generic_type)),
      '.',
      repeat($.annotation),
      field('name', $._type_identifier),
    ),

    generic_type: $ => prec.dynamic(1, seq(
      field('type', choice($._type_identifier, $.scoped_type_identifier)),
      field('arguments', $.type_arguments),
    )),

    array_type: $ => seq(
      field('element', $._unannotated_type),
      field('dimensions', $.dimensions),
    ),

    // `String[] @A ... args`: an annotation after `[]` belongs to the next
    // dimension or to the varargs `...`.
    dimensions: $ => repeat1($._dimension),

    _dimension: $ => seq(repeat($.annotation), '[', ']'),

    type_arguments: $ => seq(
      '<',
      commaSep(choice($._type, $.wildcard)),
      '>',
    ),

    wildcard: $ => seq(
      repeat($.annotation),
      '?',
      optional(seq(choice('extends', 'super'), field('bound', $._type))),
    ),

    type_parameters: $ => seq('<', commaSep1($.type_parameter), '>'),

    type_parameter: $ => seq(
      repeat($.annotation),
      field('name', $._type_identifier),
      optional(field('bound', $.type_bound)),
    ),

    type_bound: $ => seq('extends', $._type, repeat(seq('&', $._type))),

    // *** Blocks and statements (JLS 14) ***

    block: $ => seq('{', repeat($._block_statement), '}'),

    _block_statement: $ => choice(
      $.local_variable_declaration,
      $._declaration,
      $._statement,
    ),

    local_variable_declaration: $ => prec.dynamic(1, seq(
      optional($.modifiers),
      field('type', $._unannotated_type),
      commaSep1(field('declarator', $.variable_declarator)),
      ';',
    )),

    _statement: $ => choice(
      $.block,
      $.empty_statement,
      $.expression_statement,
      $.labeled_statement,
      $.if_statement,
      $.while_statement,
      $.do_statement,
      $.for_statement,
      $.enhanced_for_statement,
      $.assert_statement,
      $.switch_statement,
      $.break_statement,
      $.continue_statement,
      $.return_statement,
      $.yield_statement,
      $.throw_statement,
      $.synchronized_statement,
      $.try_statement,
      $.try_with_resources_statement,
      $.explicit_constructor_invocation,
    ),

    empty_statement: _ => ';',

    // The JLS only allows assignments, increments, calls and instance
    // creation here. Any expression is accepted, which keeps half-written
    // code in one piece; declarations win when both readings parse.
    expression_statement: $ => seq($._expression, ';'),

    labeled_statement: $ => seq(field('label', $._identifier), ':', $._statement),

    if_statement: $ => prec.right(seq(
      'if',
      field('condition', $.parenthesized_expression),
      field('consequence', $._statement),
      optional(seq('else', field('alternative', $._statement))),
    )),

    while_statement: $ => seq(
      'while',
      field('condition', $.parenthesized_expression),
      field('body', $._statement),
    ),

    do_statement: $ => seq(
      'do',
      field('body', $._statement),
      'while',
      field('condition', $.parenthesized_expression),
      ';',
    ),

    for_statement: $ => seq(
      'for',
      '(',
      choice(
        field('init', $.local_variable_declaration),
        seq(commaSep(field('init', $._expression)), ';'),
      ),
      optional(field('condition', $._expression)),
      ';',
      commaSep(field('update', $._expression)),
      ')',
      field('body', $._statement),
    ),

    enhanced_for_statement: $ => seq(
      'for',
      '(',
      optional($.modifiers),
      field('type', $._unannotated_type),
      $._variable_declarator_id,
      ':',
      field('value', $._expression),
      ')',
      field('body', $._statement),
    ),

    assert_statement: $ => seq(
      'assert',
      field('condition', $._expression),
      optional(seq(':', field('message', $._expression))),
      ';',
    ),

    // A statement-level `switch` is a statement, never the start of an
    // expression statement.
    switch_statement: $ => prec.dynamic(1, seq(
      'switch',
      field('condition', $.parenthesized_expression),
      field('body', $.switch_block),
    )),

    break_statement: $ => seq('break', optional(field('label', $._identifier)), ';'),

    continue_statement: $ => seq('continue', optional(field('label', $._identifier)), ';'),

    return_statement: $ => seq('return', optional($._expression), ';'),

    // `yield` followed by anything that can start an expression is a yield
    // statement, as in the JLS: `yield (x);` is not a call.
    yield_statement: $ => prec(1, seq('yield', $._expression, ';')),

    throw_statement: $ => seq('throw', $._expression, ';'),

    synchronized_statement: $ => seq(
      'synchronized',
      field('lock', $.parenthesized_expression),
      field('body', $.block),
    ),

    try_statement: $ => seq(
      'try',
      field('body', $.block),
      choice(
        seq(repeat1($.catch_clause), optional($.finally_clause)),
        $.finally_clause,
      ),
    ),

    try_with_resources_statement: $ => seq(
      'try',
      field('resources', $.resource_specification),
      field('body', $.block),
      repeat($.catch_clause),
      optional($.finally_clause),
    ),

    resource_specification: $ => seq(
      '(',
      $.resource,
      repeat(seq(';', $.resource)),
      optional(';'),
      ')',
    ),

    resource: $ => choice(
      seq(
        optional($.modifiers),
        field('type', $._unannotated_type),
        $._variable_declarator_id,
        '=',
        field('value', $._expression),
      ),
      $._identifier,
      $.field_access,
    ),

    catch_clause: $ => seq(
      'catch',
      '(',
      $.catch_formal_parameter,
      ')',
      field('body', $.block),
    ),

    catch_formal_parameter: $ => seq(
      optional($.modifiers),
      field('type', $.catch_type),
      $._variable_declarator_id,
    ),

    // Annotations on the first alternative are read as modifiers.
    catch_type: $ => seq(
      $._unannotated_type,
      repeat(seq('|', $._type)),
    ),

    finally_clause: $ => seq('finally', field('body', $.block)),

    // `this(...)`, `super(...)` and `outer.super(...)` at the start of a
    // constructor body.
    explicit_constructor_invocation: $ => seq(
      optional(seq(field('object', $._primary_expression), '.')),
      optional(field('type_arguments', $.type_arguments)),
      field('constructor', choice($.this, $.super)),
      field('arguments', $.argument_list),
      ';',
    ),

    // *** Switch (JLS 14.11, 15.28) ***

    switch_block: $ => seq(
      '{',
      choice(
        repeat($.switch_block_statement_group),
        repeat1($.switch_rule),
      ),
      '}',
    ),

    switch_block_statement_group: $ => prec.left(seq(
      repeat1(seq($.switch_label, ':')),
      repeat($._block_statement),
    )),

    switch_rule: $ => seq(
      $.switch_label,
      '->',
      choice($.expression_statement, $.throw_statement, $.block),
    ),

    switch_label: $ => choice(
      seq(
        'case',
        commaSep1(choice($._pattern, $._expression, 'default')),
        optional($.guard),
      ),
      'default',
    ),

    guard: $ => seq('when', $._expression),

    // *** Patterns (JLS 14.30) ***

    _pattern: $ => choice($.type_pattern, $.record_pattern),

    type_pattern: $ => seq(
      optional($.modifiers),
      field('type', $._unannotated_type),
      field('name', $._identifier),
    ),

    record_pattern: $ => prec.dynamic(1, seq(
      field('type', choice($._type_identifier, $.scoped_type_identifier, $.generic_type)),
      '(',
      commaSep(choice($._pattern, $.underscore_pattern)),
      ')',
    )),

    // `_` alone, inside a record pattern.
    underscore_pattern: _ => '_',

    // *** Expressions (JLS 15) ***

    _expression: $ => choice(
      $.assignment_expression,
      $.binary_expression,
      $.instanceof_expression,
      $.lambda_expression,
      $.ternary_expression,
      $.update_expression,
      $.unary_expression,
      $.cast_expression,
      $.switch_expression,
      $._primary_expression,
    ),

    assignment_expression: $ => prec.right(PREC.assignment, seq(
      field('left', choice($._identifier, $.field_access, $.array_access, $.parenthesized_expression)),
      field('operator', choice(...ASSIGNMENT_OPERATORS)),
      field('right', $._expression),
    )),

    binary_expression: $ => choice(...BINARY_OPERATORS.map(([precedence, operator]) =>
      prec.left(precedence, seq(
        field('left', $._expression),
        // @ts-ignore
        field('operator', operator),
        field('right', $._expression),
      )),
    )),

    // Left-associative so that in `case … instanceof T when`, `when` starts
    // the guard rather than naming a binding.
    instanceof_expression: $ => prec.left(PREC.relational, seq(
      field('left', $._expression),
      'instanceof',
      choice(
        seq(
          optional('final'),
          field('right', $._type),
          optional(field('name', $._identifier)),
        ),
        field('pattern', $.record_pattern),
      ),
    )),

    lambda_expression: $ => prec.right(PREC.lambda, seq(
      field('parameters', choice(
        $._identifier,
        $.formal_parameters,
        $.inferred_parameters,
      )),
      '->',
      field('body', choice($._expression, $.block)),
    )),

    inferred_parameters: $ => seq('(', commaSep1($._identifier), ')'),

    ternary_expression: $ => prec.right(PREC.ternary, seq(
      field('condition', $._expression),
      '?',
      field('consequence', $._expression),
      ':',
      field('alternative', $._expression),
    )),

    unary_expression: $ => prec(PREC.unary, seq(
      field('operator', choice('+', '-', '!', '~')),
      field('operand', $._expression),
    )),

    update_expression: $ => choice(
      prec.left(PREC.postfix, seq(
        field('argument', $._expression),
        field('operator', choice('++', '--')),
      )),
      prec(PREC.unary, seq(
        field('operator', choice('++', '--')),
        field('argument', $._expression),
      )),
    ),

    // `(a) - b` also parses as a cast of `-b`; the JLS only allows that
    // after a primitive type, so the parenthesized reading wins.
    cast_expression: $ => prec.dynamic(-1, prec(PREC.cast, seq(
      '(',
      field('type', $._type),
      repeat(seq('&', field('type', $._type))),
      ')',
      field('value', $._expression),
    ))),

    switch_expression: $ => seq(
      'switch',
      field('condition', $.parenthesized_expression),
      field('body', $.switch_block),
    ),

    _primary_expression: $ => choice(
      $._literal,
      $.class_literal,
      $.this,
      $._identifier,
      $.parenthesized_expression,
      $.object_creation_expression,
      $.field_access,
      $.array_access,
      $.method_invocation,
      $.method_reference,
      $.array_creation_expression,
    ),

    parenthesized_expression: $ => seq('(', $._expression, ')'),

    class_literal: $ => prec(PREC.primary, seq(
      field('type', choice($._unannotated_type, $.void_type)),
      '.',
      'class',
    )),

    field_access: $ => prec(PREC.primary, seq(
      field('object', choice($._primary_expression, $.super)),
      '.',
      field('field', choice($._identifier, $.this, $.super)),
    )),

    array_access: $ => prec(PREC.primary, seq(
      field('array', $._primary_expression),
      '[',
      field('index', $._expression),
      ']',
    )),

    method_invocation: $ => prec(PREC.primary, seq(
      optional(seq(
        field('object', choice($._primary_expression, $.super)),
        '.',
        optional(field('type_arguments', $.type_arguments)),
      )),
      field('name', $._identifier),
      field('arguments', $.argument_list),
    )),

    argument_list: $ => seq('(', commaSep($._expression), ')'),

    // `a.b::c` reads `a.b` as an expression, like any other dotted name in
    // an expression. Only what cannot be an expression (`List<T>`, `int[]`)
    // is a type.
    method_reference: $ => choice(
      prec.dynamic(-1, prec(PREC.primary, seq(
        field('object', $._type),
        $._method_reference_tail,
      ))),
      prec(PREC.primary, seq(
        field('object', choice($._primary_expression, $.super)),
        $._method_reference_tail,
      )),
    ),

    _method_reference_tail: $ => seq(
      '::',
      optional(field('type_arguments', $.type_arguments)),
      field('name', choice($._identifier, 'new')),
    ),

    object_creation_expression: $ => prec.right(PREC.primary, seq(
      optional(seq(field('object', $._primary_expression), '.')),
      'new',
      optional(field('type_arguments', $.type_arguments)),
      field('type', choice($._simple_type, $.annotated_type)),
      field('arguments', $.argument_list),
      optional(field('body', $.class_body)),
    )),

    array_creation_expression: $ => prec.right(PREC.primary, seq(
      'new',
      field('type', choice($._simple_type, $.annotated_type)),
      choice(
        seq(
          repeat1(field('dimensions', $.dimensions_expr)),
          optional(field('dimensions', $.dimensions)),
        ),
        seq(
          field('dimensions', $.dimensions),
          field('value', $.array_initializer),
        ),
      ),
    )),

    dimensions_expr: $ => seq(repeat($.annotation), '[', $._expression, ']'),

    this: _ => 'this',
    super: _ => 'super',

    // *** Names ***

    _name: $ => choice($._identifier, $.scoped_identifier),

    scoped_identifier: $ => seq(
      field('scope', $._name),
      '.',
      field('name', $._identifier),
    ),

    _identifier: $ => choice(
      $.identifier,
      alias($._contextual_keyword, $.identifier),
    ),

    // JLS 3.9: words that are keywords only in some places. Where one is
    // lexed as a keyword but means a name (`record.get()`,
    // `import module.Foo;`), it is aliased back to an identifier.
    _contextual_keyword: _ => choice(
      'exports', 'module', 'open', 'opens', 'permits', 'provides', 'record',
      'requires', 'sealed', 'to', 'transitive', 'uses', 'value', 'when', 'with',
      'yield',
    ),

    // *** Lexical structure (JLS 3) ***

    _literal: $ => choice(
      $.integer_literal,
      $.floating_point_literal,
      $.true,
      $.false,
      $.null_literal,
      $.character_literal,
      $.string_literal,
      $.text_block,
    ),

    integer_literal: _ => token(seq(
      choice(
        dec,
        seq(/0[xX]/, hex),
        /0[bB][01]([01_]*[01])?/,
      ),
      optional(/[lL]/),
    )),

    floating_point_literal: _ => {
      const exponent = seq(/[eE][+-]?/, dec);
      const suffix = /[fFdD]/;
      return token(choice(
        seq(dec, '.', optional(dec), optional(exponent), optional(suffix)),
        seq('.', dec, optional(exponent), optional(suffix)),
        seq(dec, exponent, optional(suffix)),
        seq(dec, suffix),
        seq(
          /0[xX]/,
          choice(seq(hex, optional('.')), seq(optional(hex), '.', hex)),
          /[pP][+-]?/, dec,
          optional(suffix),
        ),
      ));
    },

    true: _ => 'true',
    false: _ => 'false',
    null_literal: _ => 'null',

    character_literal: _ => token(seq(
      '\'',
      choice(
        /[^'\\\r\n]/,
        /\\(u+[0-9a-fA-F]{4}|[0-7]{1,3}|[^\r\n])/,
      ),
      '\'',
    )),

    string_literal: $ => seq(
      '"',
      repeat(choice($.string_fragment, $.escape_sequence)),
      token.immediate('"'),
    ),

    string_fragment: _ => token.immediate(prec(1, /[^"\\\r\n]+/)),

    // A text block opens with `"""` and the rest of its line, and closes at
    // the first `"""` that is not escaped. Every token inside is immediate,
    // so no comments or whitespace are skipped between them.
    text_block: $ => seq(
      /"""[ \t\f]*\r?\n/,
      repeat(choice(
        alias($._text_block_fragment, $.string_fragment),
        $.escape_sequence,
      )),
      // Above the fragments' precedence, which would otherwise take `""`.
      token.immediate(prec(2, '"""')),
    ),

    // Anything but a backslash or three quotes. One or two quotes on their
    // own are content too, as long as they are not where `"""` starts.
    _text_block_fragment: _ => token.immediate(prec(1, choice(
      /([^"\\]|"[^"\\]|""[^"\\])+/,
      /""?/,
    ))),

    // JLS 3.10.7, plus the `\uXXXX` escapes that the JLS translates before
    // lexing, and `\` before a line break (text blocks only).
    escape_sequence: _ => token.immediate(seq(
      '\\',
      choice(
        /[btnfrs"'\\]/,
        /[0-7]{1,3}/,
        /u+[0-9a-fA-F]{4}/,
        /\r?\n/,
      ),
    )),

    identifier: _ => /[\p{L}\p{Nl}\p{Sc}\p{Pc}][\p{L}\p{Nl}\p{Sc}\p{Pc}\p{Mn}\p{Mc}\p{Nd}\p{Cf}]*/,

    line_comment: _ => token(seq('//', /[^\r\n]*/)),

    block_comment: _ => token(seq('/*', /[^*]*\*+([^/*][^*]*\*+)*/, '/')),
  },
});

/**
 * One or more `rule`s separated by `separator`.
 * @param {RuleOrLiteral} rule
 * @param {RuleOrLiteral} separator
 */
function sep1(rule, separator) {
  return seq(rule, repeat(seq(separator, rule)));
}

/**
 * One or more `rule`s separated by commas.
 * @param {RuleOrLiteral} rule
 */
function commaSep1(rule) {
  return sep1(rule, ',');
}

/**
 * Zero or more `rule`s separated by commas.
 * @param {RuleOrLiteral} rule
 */
function commaSep(rule) {
  return optional(commaSep1(rule));
}
