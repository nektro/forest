/**
 * @file Go grammar for tree-sitter
 * @license MIT
 *
 * Follows The Go Programming Language Specification (https://go.dev/ref/spec);
 * comments quote its productions. There is no external scanner.
 *
 * Semicolons
 * ----------
 * Go's lexer inserts a semicolon at a newline that follows an identifier, a
 * literal, `)`, `]`, `}`, `++`, `--` or one of `break continue fallthrough
 * return`. Here a newline is a terminator token (`_terminator`) that is valid
 * wherever a statement, declaration, spec or field may end, and otherwise is
 * plain whitespace. tree-sitter only lexes tokens the parse state accepts, so
 * a newline after `a +` or `f(a,` is skipped while one after `a` ends the
 * statement, which is what Go's rule gives for well-formed code. The one
 * difference is leniency: a newline where Go would insert a semicolon that is
 * then a syntax error (`f(a\n)`) is accepted.
 *
 * Types in expressions
 * --------------------
 * Composite literals, conversions and the arguments of `make`/`new` put types
 * in expression position. Type literals that cannot be mistaken for an
 * expression (`[]T`, `[N]T`, `map[K]V`, `chan T`, `func(...)`, `struct{...}`,
 * `interface{...}`) are expressions here, as they are in Go's own parser. A
 * pointer type `*T` parses as a unary `*`, `pkg.T` as a selector and
 * `F[T]` as an index expression, except as the type of a composite literal.
 *
 * Since Go 1.27 a composite literal's type may be omitted (`f({X: 1})`), so
 * `{` can start an expression. Where a statement may start, it is a block.
 */

/// <reference types="tree-sitter-cli/dsl" />
// @ts-check

const PREC = {
  // `T{` inside an if/for/switch header is a block, not a composite literal
  // (spec: "Composite literals", the parsing ambiguity paragraph).
  composite_literal: -1,
  or: 1,
  and: 2,
  comparative: 3,
  additive: 4,
  multiplicative: 5,
  unary: 6,
  primary: 7,
  // A type literal followed by `{` starts a composite literal and a function
  // signature followed by `{` starts a function literal.
  literal: 8,
};

// Spec: "Operator precedence".
const BINARY_OPERATORS = [
  [PREC.multiplicative, choice('*', '/', '%', '<<', '>>', '&', '&^')],
  [PREC.additive, choice('+', '-', '|', '^')],
  [PREC.comparative, choice('==', '!=', '<', '<=', '>', '>=')],
  [PREC.and, '&&'],
  [PREC.or, '||'],
];

const ASSIGNMENT_OPERATORS = [
  '=', '+=', '-=', '|=', '^=', '*=', '/=', '%=', '<<=', '>>=', '&=', '&^=',
];

// Spec: "Integer literals", "Floating-point literals".
const decimalDigits = /[0-9](_?[0-9])*/.source;
const hexDigits = /[0-9a-fA-F](_?[0-9a-fA-F])*/.source;
const decimalExponent = `[eE][+-]?${decimalDigits}`;
const intLiteral = [
  `0[bB]_?[01](_?[01])*`,
  `0[oO]?_?[0-7](_?[0-7])*`,
  `0[xX]_?${hexDigits}`,
  `0|[1-9](_?[0-9])*`,
].join('|');
const floatLiteral = [
  `${decimalDigits}\\.(${decimalDigits})?(${decimalExponent})?`,
  `${decimalDigits}${decimalExponent}`,
  `\\.${decimalDigits}(${decimalExponent})?`,
  `0[xX](_?${hexDigits}(\\.(${hexDigits})?)?|\\.${hexDigits})[pP][+-]?${decimalDigits}`,
].join('|');

const escapeSequence = /\\([abfnrtv\\'"]|[0-7]{3}|x[0-9a-fA-F]{2}|u[0-9a-fA-F]{4}|U[0-9a-fA-F]{8})/;

module.exports = grammar({
  name: 'go',

  extras: $ => [/\s/, $.comment],

  word: $ => $.identifier,

  // Spec: "Keywords". These can never be identifiers.
  reserved: {
    global: _ => [
      'break', 'case', 'chan', 'const', 'continue', 'default', 'defer', 'else',
      'fallthrough', 'for', 'func', 'go', 'goto', 'if', 'import', 'interface',
      'map', 'package', 'range', 'return', 'select', 'struct', 'switch', 'type',
      'var',
    ],
  },

  supertypes: $ => [
    $._expression,
    $._type,
    $._statement,
    $._simple_statement,
  ],

  inline: $ => [
    $._type_identifier,
    $._field_identifier,
    $._package_identifier,
    $._label_name,
    $._string_literal,
    $._interface_element,
  ],

  conflicts: $ => [
    // `a.` / `a[` may continue an expression (selector, index) or a type name
    // (`pkg.T`, `T[int]`) in the type of a composite literal.
    [$._expression, $.qualified_type],
    [$._expression, $.generic_type],
    // `(a, b int)` names two parameters; `(a, b)` lists two parameter types.
    [$.parameter_declaration, $._simple_type],
    // `type A[N]int` is an array type; `type A[N any] int` has a type
    // parameter. Likewise `func f[A, B any]` versus a generic type.
    [$.type_parameter_declaration, $._expression],
    [$.type_parameter_declaration, $._expression, $.generic_type],
    [$.type_parameter_declaration, $._simple_type],
    // A type literal used as an expression (`chan T`, `[]T`) may be followed
    // by a selector or an index; the type wins (`chan pkg.T`, `[]G[int]`).
    [$._simple_type, $.qualified_type],
    [$._simple_type, $.generic_type],
    // `{` where a statement may start, or after `switch`: a block (or switch
    // body) or an untyped composite literal (Go 1.27). Blocks win by dynamic
    // precedence, as they do in Go's parser.
    [$.block, $.literal_value],
    [$._expression, $.labeled_statement, $.empty_labeled_statement],
    [$.expression_statement, $.literal_value],
    [$.expression_switch_statement, $.literal_value],
    [$.expression_list, $.literal_value],
    // `a [[N]T]…` in a parameter or field: an array length or a type argument.
    [$._simple_type, $._expression],
  ],

  rules: {
    // SourceFile = PackageClause ";" { ImportDecl ";" } { TopLevelDecl ";" } .
    //
    // Statements are accepted at the top level too, so that snippets
    // highlight, and the clauses are not required in order.
    source_file: $ => optional(seq(
      $._top_level_item,
      repeat(seq($._terminator, $._top_level_item)),
      optional($._terminator),
    )),

    _top_level_item: $ => choice(
      $.package_clause,
      $.import_declaration,
      $.function_declaration,
      $.method_declaration,
      $._statement,
    ),

    // A semicolon, or a newline where a semicolon would be inserted. Further
    // semicolons separate empty statements (`x\n;`, `x;;`).
    _terminator: _ => seq(choice(';', '\n'), repeat(';')),

    // PackageClause = "package" PackageName .
    package_clause: $ => seq('package', field('name', $._package_identifier)),

    // ImportDecl = "import" ( ImportSpec | "(" { ImportSpec ";" } ")" ) .
    import_declaration: $ => seq(
      'import',
      choice($.import_spec, $.import_spec_list),
    ),

    import_spec_list: $ => seq('(', optional(terminated($, $.import_spec)), ')'),

    // ImportSpec = [ "." | PackageName ] ImportPath .
    import_spec: $ => seq(
      optional(field('name', choice($.dot, $._package_identifier))),
      field('path', $._string_literal),
    ),

    dot: _ => '.',

    // ---------------------------------------------------------------------
    // Declarations
    // ---------------------------------------------------------------------

    // ConstDecl = "const" ( ConstSpec | "(" { ConstSpec ";" } ")" ) .
    const_declaration: $ => seq(
      'const',
      choice($.const_spec, seq('(', optional(terminated($, $.const_spec)), ')')),
    ),

    // ConstSpec = IdentifierList [ [ Type ] "=" ExpressionList ] .
    const_spec: $ => seq(
      commaSep1(field('name', $.identifier)),
      optional(seq(
        optional(field('type', $._type)),
        '=',
        field('value', $.expression_list),
      )),
    ),

    // VarDecl = "var" ( VarSpec | "(" { VarSpec ";" } ")" ) .
    var_declaration: $ => seq(
      'var',
      choice($.var_spec, $.var_spec_list),
    ),

    var_spec_list: $ => seq('(', optional(terminated($, $.var_spec)), ')'),

    // VarSpec = IdentifierList ( Type [ "=" ExpressionList ] | "=" ExpressionList ) .
    var_spec: $ => seq(
      commaSep1(field('name', $.identifier)),
      choice(
        seq(field('type', $._type), optional(seq('=', field('value', $.expression_list)))),
        seq('=', field('value', $.expression_list)),
      ),
    ),

    // TypeDecl = "type" ( TypeSpec | "(" { TypeSpec ";" } ")" ) .
    type_declaration: $ => seq(
      'type',
      choice(
        $.type_spec,
        $.type_alias,
        seq('(', optional(terminated($, choice($.type_spec, $.type_alias))), ')'),
      ),
    ),

    // TypeDef = identifier [ TypeParameters ] Type .
    type_spec: $ => seq(
      field('name', $._type_identifier),
      optional(field('type_parameters', $.type_parameter_list)),
      field('type', $._type),
    ),

    // AliasDecl = identifier [ TypeParameters ] "=" Type .
    type_alias: $ => seq(
      field('name', $._type_identifier),
      optional(field('type_parameters', $.type_parameter_list)),
      '=',
      field('type', $._type),
    ),

    // FunctionDecl = "func" FunctionName [ TypeParameters ] Signature [ FunctionBody ] .
    function_declaration: $ => prec.right(seq(
      'func',
      field('name', $.identifier),
      optional(field('type_parameters', $.type_parameter_list)),
      $._signature,
      optional(field('body', $.block)),
    )),

    // MethodDecl = "func" Receiver MethodName [ TypeParameters ] Signature [ FunctionBody ] .
    //
    // At the top level `func (r T) m(` could also start a conversion to a
    // function type; it is a method.
    method_declaration: $ => prec.right(1, seq(
      'func',
      field('receiver', $.parameter_list),
      field('name', $._field_identifier),
      optional(field('type_parameters', $.type_parameter_list)),
      $._signature,
      optional(field('body', $.block)),
    )),

    // Signature = Parameters [ Result ] .
    // Result    = Parameters | Type .
    //
    // A parenthesized result is always a parameter list.
    _signature: $ => prec.right(seq(
      field('parameters', $.parameter_list),
      optional(field('result', choice($.parameter_list, $._simple_type))),
    )),

    // TypeParameters = "[" TypeParamList [ "," ] "]" .
    type_parameter_list: $ => seq(
      '[',
      commaSep1($.type_parameter_declaration),
      optional(','),
      ']',
    ),

    // TypeParamDecl = IdentifierList TypeConstraint .
    type_parameter_declaration: $ => seq(
      commaSep1(field('name', $.identifier)),
      field('type', alias($._type_union, $.type_constraint)),
    ),

    // Parameters = "(" [ ParameterList [ "," ] ] ")" .
    parameter_list: $ => seq(
      '(',
      optional(seq(
        commaSep1(choice($.parameter_declaration, $.variadic_parameter_declaration)),
        optional(','),
      )),
      ')',
    ),

    // ParameterDecl = [ IdentifierList ] [ "..." ] Type .
    parameter_declaration: $ => seq(
      commaSep(field('name', $.identifier)),
      field('type', $._type),
    ),

    variadic_parameter_declaration: $ => seq(
      optional(field('name', $.identifier)),
      '...',
      field('type', $._type),
    ),

    // ---------------------------------------------------------------------
    // Types
    // ---------------------------------------------------------------------

    _type: $ => choice($._simple_type, $.parenthesized_type),

    _simple_type: $ => choice(
      $._type_identifier,
      $.qualified_type,
      $.generic_type,
      $.pointer_type,
      $.array_type,
      $.slice_type,
      $.map_type,
      $.channel_type,
      $.function_type,
      $.struct_type,
      $.interface_type,
    ),

    parenthesized_type: $ => seq('(', $._type, ')'),

    // QualifiedIdent = PackageName "." identifier .
    qualified_type: $ => prec.dynamic(1, seq(
      field('package', $._package_identifier),
      '.',
      field('name', $._type_identifier),
    )),

    // TypeName [ TypeArgs ]
    generic_type: $ => prec.dynamic(1, seq(
      field('type', choice($._type_identifier, $.qualified_type)),
      field('type_arguments', $.type_arguments),
    )),

    // TypeArgs = "[" TypeList [ "," ] "]" .
    type_arguments: $ => seq('[', commaSep1($._type), optional(','), ']'),

    // PointerType = "*" BaseType .
    pointer_type: $ => prec(PREC.unary, seq('*', $._type)),

    // ArrayType = "[" ArrayLength "]" ElementType .
    array_type: $ => prec.right(seq(
      '[',
      field('length', $._expression),
      ']',
      field('element', $._type),
    )),

    // "[" "..." "]" ElementType, only in a composite literal.
    implicit_length_array_type: $ => seq('[', '...', ']', field('element', $._type)),

    // SliceType = "[" "]" ElementType .
    slice_type: $ => prec.right(seq('[', ']', field('element', $._type))),

    // MapType = "map" "[" KeyType "]" ElementType .
    map_type: $ => prec.right(seq(
      'map',
      '[',
      field('key', $._type),
      ']',
      field('value', $._type),
    )),

    // ChannelType = ( "chan" | "chan" "<-" | "<-" "chan" ) ElementType .
    channel_type: $ => choice(
      prec.right(seq('chan', field('value', $._type))),
      prec.right(seq('chan', '<-', field('value', $._type))),
      // Higher than a unary `<-` applied to `chan T`.
      prec.right(PREC.unary + 1, seq('<-', 'chan', field('value', $._type))),
    ),

    // FunctionType = "func" Signature .
    function_type: $ => prec.right(seq('func', $._signature)),

    // StructType = "struct" "{" { FieldDecl ";" } "}" .
    struct_type: $ => seq('struct', $.field_declaration_list),

    field_declaration_list: $ => seq('{', optional(terminated($, $.field_declaration)), '}'),

    // FieldDecl     = (IdentifierList Type | EmbeddedField) [ Tag ] .
    // EmbeddedField = [ "*" ] TypeName [ TypeArgs ] .
    field_declaration: $ => seq(
      choice(
        seq(
          commaSep1(field('name', $._field_identifier)),
          field('type', $._type),
        ),
        seq(
          optional('*'),
          field('type', choice($._type_identifier, $.qualified_type, $.generic_type)),
        ),
      ),
      optional(field('tag', $._string_literal)),
    ),

    // InterfaceType = "interface" "{" { InterfaceElem ";" } "}" .
    interface_type: $ => seq(
      'interface',
      '{',
      optional(terminated($, $._interface_element)),
      '}',
    ),

    // InterfaceElem = MethodElem | TypeElem .
    _interface_element: $ => choice($.method_elem, alias($._type_union, $.type_elem)),

    // MethodElem = MethodName Signature .
    method_elem: $ => seq(field('name', $._field_identifier), $._signature),

    // TypeElem = TypeTerm { "|" TypeTerm } .
    // TypeTerm = Type | UnderlyingType .
    _type_union: $ => seq($._type_term, repeat(seq('|', $._type_term))),

    _type_term: $ => choice($._type, $.negated_type),

    // UnderlyingType = "~" Type .
    negated_type: $ => seq('~', $._type),

    // ---------------------------------------------------------------------
    // Statements
    // ---------------------------------------------------------------------

    // Block = "{" StatementList "}" .
    //
    // Where a statement may start, `{` opens a block rather than an untyped
    // composite literal.
    block: $ => prec.dynamic(1, seq('{', optional($._statement_list), '}')),

    // StatementList = { Statement ";" } .
    //
    // A label may end a list without a statement after it (`L: }`).
    _statement_list: $ => choice(
      seq(
        $._statement,
        repeat(seq($._terminator, $._statement)),
        optional(seq(
          $._terminator,
          optional(alias($.empty_labeled_statement, $.labeled_statement)),
        )),
      ),
      alias($.empty_labeled_statement, $.labeled_statement),
    ),

    _statement: $ => choice(
      $._declaration,
      $._simple_statement,
      $.labeled_statement,
      $.go_statement,
      $.defer_statement,
      $.return_statement,
      $.break_statement,
      $.continue_statement,
      $.goto_statement,
      $.fallthrough_statement,
      $.block,
      $.if_statement,
      $.expression_switch_statement,
      $.type_switch_statement,
      $.select_statement,
      $.for_statement,
    ),

    _declaration: $ => choice(
      $.const_declaration,
      $.type_declaration,
      $.var_declaration,
    ),

    // SimpleStmt = EmptyStmt | ExpressionStmt | SendStmt | IncDecStmt | Assignment | ShortVarDecl .
    _simple_statement: $ => choice(
      $.expression_statement,
      $.send_statement,
      $.inc_statement,
      $.dec_statement,
      $.assignment_statement,
      $.short_var_declaration,
    ),

    expression_statement: $ => $._expression,

    // SendStmt = Channel "<-" Expression .
    send_statement: $ => seq(
      field('channel', $._expression),
      '<-',
      field('value', $._expression),
    ),

    // IncDecStmt = Expression ( "++" | "--" ) .
    inc_statement: $ => seq($._expression, '++'),

    dec_statement: $ => seq($._expression, '--'),

    // Assignment = ExpressionList assign_op ExpressionList .
    assignment_statement: $ => seq(
      field('left', $.expression_list),
      field('operator', choice(...ASSIGNMENT_OPERATORS)),
      field('right', $.expression_list),
    ),

    // ShortVarDecl = IdentifierList ":=" ExpressionList .
    //
    // The left side is parsed as an expression list, so that it does not
    // conflict with an assignment.
    short_var_declaration: $ => seq(
      field('left', $.expression_list),
      ':=',
      field('right', $.expression_list),
    ),

    // LabeledStmt = Label ":" Statement .
    //
    // A newline after `:` is not a terminator, so a label on an empty
    // statement needs an explicit `;` (`L: ;`), which is kept as an
    // empty_statement.
    labeled_statement: $ => seq(
      field('label', $._label_name),
      ':',
      choice($._statement, $.empty_statement),
    ),

    empty_statement: _ => ';',

    empty_labeled_statement: $ => seq(
      field('label', $._label_name),
      ':',
      optional(alias($.empty_labeled_statement, $.labeled_statement)),
    ),

    // GoStmt = "go" Expression .
    go_statement: $ => seq('go', $._expression),

    // DeferStmt = "defer" Expression .
    defer_statement: $ => seq('defer', $._expression),

    // ReturnStmt = "return" [ ExpressionList ] .
    return_statement: $ => seq('return', optional($.expression_list)),

    // BreakStmt = "break" [ Label ] .
    break_statement: $ => seq('break', optional(field('label', $._label_name))),

    // ContinueStmt = "continue" [ Label ] .
    continue_statement: $ => seq('continue', optional(field('label', $._label_name))),

    // GotoStmt = "goto" Label .
    goto_statement: $ => seq('goto', field('label', $._label_name)),

    // FallthroughStmt = "fallthrough" .
    fallthrough_statement: _ => 'fallthrough',

    // IfStmt = "if" [ SimpleStmt ";" ] Expression Block [ "else" ( IfStmt | Block ) ] .
    if_statement: $ => seq(
      'if',
      optional(seq(optional(field('initializer', $._simple_statement)), ';')),
      field('condition', $._expression),
      field('consequence', $.block),
      optional(seq('else', field('alternative', choice($.block, $.if_statement)))),
    ),

    // ForStmt = "for" [ Condition | ForClause | RangeClause ] Block .
    for_statement: $ => seq(
      'for',
      optional(choice(
        field('condition', $._expression),
        $.for_clause,
        $.range_clause,
      )),
      field('body', $.block),
    ),

    // ForClause = [ InitStmt ] ";" [ Condition ] ";" [ PostStmt ] .
    //
    // `{` after the second `;` is the body, not a post statement.
    for_clause: $ => prec.left(seq(
      optional(field('initializer', $._simple_statement)),
      ';',
      optional(field('condition', $._expression)),
      ';',
      optional(field('update', $._simple_statement)),
    )),

    // RangeClause = [ ExpressionList "=" | IdentifierList ":=" ] "range" Expression .
    range_clause: $ => seq(
      optional(seq(field('left', $.expression_list), choice('=', ':='))),
      'range',
      field('right', $._expression),
    ),

    // ExprSwitchStmt = "switch" [ SimpleStmt ";" ] [ Expression ] "{" { ExprCaseClause } "}" .
    expression_switch_statement: $ => seq(
      'switch',
      optional(seq(optional(field('initializer', $._simple_statement)), ';')),
      optional(field('value', $._expression)),
      '{',
      repeat(choice($.expression_case, $.default_case)),
      '}',
    ),

    // ExprCaseClause = ExprSwitchCase ":" StatementList .
    expression_case: $ => seq(
      'case',
      field('value', $.expression_list),
      ':',
      optional($._statement_list),
    ),

    default_case: $ => seq('default', ':', optional($._statement_list)),

    // TypeSwitchStmt  = "switch" [ SimpleStmt ";" ] TypeSwitchGuard "{" { TypeCaseClause } "}" .
    // TypeSwitchGuard = [ identifier ":=" ] PrimaryExpr "." "(" "type" ")" .
    type_switch_statement: $ => seq(
      'switch',
      optional(seq(optional(field('initializer', $._simple_statement)), ';')),
      optional(seq(field('alias', $.expression_list), ':=')),
      prec(PREC.primary, seq(field('value', $._expression), '.', '(', 'type', ')')),
      '{',
      repeat(choice($.type_case, $.default_case)),
      '}',
    ),

    // TypeCaseClause = TypeSwitchCase ":" StatementList .
    type_case: $ => seq(
      'case',
      commaSep1(field('type', $._type)),
      ':',
      optional($._statement_list),
    ),

    // SelectStmt = "select" "{" { CommClause } "}" .
    select_statement: $ => seq(
      'select',
      '{',
      repeat(choice($.communication_case, $.default_case)),
      '}',
    ),

    // CommClause = CommCase ":" StatementList .
    // CommCase   = "case" ( SendStmt | RecvStmt ) | "default" .
    communication_case: $ => seq(
      'case',
      field('communication', choice($.send_statement, $.receive_statement)),
      ':',
      optional($._statement_list),
    ),

    // RecvStmt = [ ExpressionList "=" | IdentifierList ":=" ] RecvExpr .
    receive_statement: $ => seq(
      optional(seq(field('left', $.expression_list), choice('=', ':='))),
      field('right', $._expression),
    ),

    // ---------------------------------------------------------------------
    // Expressions
    // ---------------------------------------------------------------------

    expression_list: $ => commaSep1($._expression),

    _expression: $ => choice(
      $.unary_expression,
      $.binary_expression,
      $.selector_expression,
      $.index_expression,
      $.slice_expression,
      $.call_expression,
      $.type_assertion_expression,
      $.composite_literal,
      $.literal_value,
      $.func_literal,
      $.parenthesized_expression,
      $.identifier,
      $.int_literal,
      $.float_literal,
      $.imaginary_literal,
      $.rune_literal,
      $.interpreted_string_literal,
      $.raw_string_literal,
      // Type literals, for conversions and `make`/`new` arguments.
      $.array_type,
      $.slice_type,
      $.map_type,
      $.channel_type,
      $.function_type,
      $.struct_type,
      $.interface_type,
    ),

    parenthesized_expression: $ => seq('(', $._expression, ')'),

    // unary_op = "+" | "-" | "!" | "^" | "*" | "&" | "<-" .
    unary_expression: $ => prec(PREC.unary, seq(
      field('operator', choice('+', '-', '!', '^', '*', '&', '<-')),
      field('operand', $._expression),
    )),

    binary_expression: $ => choice(...BINARY_OPERATORS.map(([precedence, operator]) =>
      prec.left(precedence, seq(
        field('left', $._expression),
        // @ts-ignore
        field('operator', operator),
        field('right', $._expression),
      )),
    )),

    // Selector = "." identifier .
    selector_expression: $ => prec(PREC.primary, seq(
      field('operand', $._expression),
      '.',
      field('field', $._field_identifier),
    )),

    // Index = "[" Expression [ "," ] "]" .
    //
    // Several indices instantiate a generic function or type: `F[int, string]`.
    index_expression: $ => prec(PREC.primary, seq(
      field('operand', $._expression),
      '[',
      commaSep1(field('index', $._expression)),
      optional(','),
      ']',
    )),

    // Slice = "[" [ Expression ] ":" [ Expression ] "]" |
    //         "[" [ Expression ] ":" Expression ":" Expression "]" .
    slice_expression: $ => prec(PREC.primary, seq(
      field('operand', $._expression),
      '[',
      optional(field('start', $._expression)),
      ':',
      choice(
        optional(field('end', $._expression)),
        seq(
          optional(field('end', $._expression)),
          ':',
          field('capacity', $._expression),
        ),
      ),
      ']',
    )),

    // TypeAssertion = "." "(" Type ")" .
    type_assertion_expression: $ => prec(PREC.primary, seq(
      field('operand', $._expression),
      '.',
      '(',
      field('type', $._type),
      ')',
    )),

    // Arguments = "(" [ ( ExpressionList | Type [ "," ExpressionList ] ) [ "..." ] [ "," ] ] ")" .
    call_expression: $ => prec(PREC.primary, seq(
      field('function', $._expression),
      field('arguments', $.argument_list),
    )),

    argument_list: $ => seq(
      '(',
      optional(seq(
        commaSep1($._expression),
        optional('...'),
        optional(','),
      )),
      ')',
    ),

    // CompositeLit = [ LiteralType ] LiteralValue .
    //
    // Without a type (Go 1.27) it is just a literal_value, as are nested
    // elements in older Go.
    // LiteralType  = StructType | ArrayType | "[" "..." "]" ElementType |
    //                SliceType | MapType | TypeName [ TypeArgs ] .
    composite_literal: $ => choice(
      prec.dynamic(-1, prec(PREC.composite_literal, seq(
        field('type', choice($._type_identifier, $.qualified_type, $.generic_type)),
        field('body', $.literal_value),
      ))),
      prec(PREC.literal, seq(
        field('type', choice(
          $.array_type,
          $.implicit_length_array_type,
          $.slice_type,
          $.map_type,
          $.struct_type,
        )),
        field('body', $.literal_value),
      )),
    ),

    // LiteralValue = "{" [ ElementList [ "," ] ] "}" .
    literal_value: $ => seq(
      '{',
      optional(seq(
        commaSep1(choice($._expression, $.keyed_element)),
        optional(','),
      )),
      '}',
    ),

    // ElementList = [ Key ":" ] Element { "," [ Key ":" ] Element } .
    keyed_element: $ => seq(
      field('key', $._expression),
      ':',
      field('value', $._expression),
    ),

    // FunctionLit = "func" Signature FunctionBody .
    func_literal: $ => prec(PREC.literal, seq(
      'func',
      $._signature,
      field('body', $.block),
    )),

    // ---------------------------------------------------------------------
    // Lexical elements
    // ---------------------------------------------------------------------

    // identifier = letter { letter | unicode_digit } .
    identifier: _ => /[_\p{L}][_\p{L}\p{Nd}]*/u,

    _type_identifier: $ => alias($.identifier, $.type_identifier),
    _field_identifier: $ => alias($.identifier, $.field_identifier),
    _package_identifier: $ => alias($.identifier, $.package_identifier),
    _label_name: $ => alias($.identifier, $.label_name),

    int_literal: _ => token(new RegExp(intLiteral)),

    float_literal: _ => token(new RegExp(floatLiteral)),

    // imaginary_lit = (decimal_digits | int_lit | float_lit) "i" .
    imaginary_literal: _ => token(new RegExp(`(${decimalDigits}|${floatLiteral}|${intLiteral})i`)),

    // rune_lit = "'" ( unicode_value | byte_value ) "'" .
    rune_literal: _ => token(seq(
      '\'',
      choice(/[^'\\\n]/, escapeSequence),
      '\'',
    )),

    _string_literal: $ => choice($.interpreted_string_literal, $.raw_string_literal),

    // interpreted_string_lit = `"` { unicode_value | byte_value } `"` .
    interpreted_string_literal: $ => seq(
      '"',
      repeat(choice(
        alias(token.immediate(prec(1, /[^"\n\\]+/)), $.string_content),
        $.escape_sequence,
      )),
      token.immediate('"'),
    ),

    escape_sequence: _ => token.immediate(escapeSequence),

    // raw_string_lit = "`" { unicode_char | newline } "`" .
    raw_string_literal: $ => seq(
      '`',
      optional(alias(token.immediate(prec(1, /[^`]+/)), $.string_content)),
      token.immediate('`'),
    ),

    comment: _ => token(choice(
      seq('//', /[^\n]*/),
      seq('/*', /[^*]*\*+([^/*][^*]*\*+)*/, '/'),
    )),
  },
});

/**
 * One or more `rule`s, each followed by a terminator except that the last
 * one's is optional.
 *
 * @param {GrammarSymbols<string>} $
 * @param {RuleOrLiteral} rule
 * @returns {SeqRule}
 */
function terminated($, rule) {
  return seq(rule, repeat(seq($._terminator, rule)), optional($._terminator));
}

/**
 * @param {RuleOrLiteral} rule
 * @returns {SeqRule}
 */
function commaSep1(rule) {
  return seq(rule, repeat(seq(',', rule)));
}

/**
 * @param {RuleOrLiteral} rule
 * @returns {ChoiceRule}
 */
function commaSep(rule) {
  return optional(commaSep1(rule));
}
