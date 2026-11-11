/**
 * @file Zig grammar for tree-sitter
 * @license MIT
 *
 * A translation of the official Zig PEG grammar (doc/langref/grammar.peg in
 * the Zig repository; comments quote its rules). Zig's syntax is context-free
 * and every token is regular, so this grammar has no external scanner.
 *
 * Binary operators use classic precedence levels. Current Zig rejects mixing
 * some operators without parentheses (`a & b << c`, `a orelse b == c`) and
 * requires symmetric whitespace around them; code that obeys those rules gets
 * the same tree either way, and older code that mixes them still parses.
 *
 * Structure mirrors the PEG stratification:
 *
 *   _expression          Expr: binary operators (or, and, compare, ...)
 *   _prefix_expression   PrefixExpr: !x -x ~x -%x &x try x
 *   _primary_expression  PrimaryExpr: if/loops/return/break/blocks, T{...}
 *   _type_expression     TypeExpr: ?T *T []T [N]T E!T
 *   _suffix_expression   SuffixExpr: calls, field access, indexing, x.*, x.?
 *   _primary_type_expression  PrimaryTypeExpr: literals, identifiers, ...
 *
 * `_type` is used wherever the PEG grammar asks for TypeExpr outside of an
 * expression (return types, annotations, field types, ...). It additionally
 * admits the IfTypeExpr / LoopTypeExpr forms, whose branches are types, so
 * that e.g. `fn f() if (c) A else B { ... }` parses as Zig does.
 */

/// <reference types="tree-sitter-cli/dsl" />
// @ts-check

const PREC = {
  // Prefix-ish keyword expressions that greedily take a whole Expr
  // (return, break, if/else, ...). Lower than every binary operator so the
  // operand is always extended as far as possible, matching PEG greediness.
  keyword_expression: -1,
  or: 1,
  and: 2,
  compare: 3,
  bitwise: 4,
  shift: 5,
  additive: 6,
  multiplicative: 7,
  // Statement-level forms win over the equivalent expression statements,
  // since the PEG grammar tries them first.
  statement: 10,
  // A trailing type (e.g. a return type) extends as far as it can:
  // `fn () A!B` is `fn () (A!B)`, `fn () a.B` is `fn () (a.B)`.
  error_union: 20,
  suffix: 21,
};

const ASSIGNMENT_OPERATORS = [
  '=', '*=', '*%=', '*|=', '/=', '%=', '+=', '+%=', '+|=', '-=', '-%=', '-|=',
  '<<=', '<<|=', '>>=', '&=', '^=', '|=',
];

const BINARY_OPERATORS = [
  [PREC.or, 'or'],
  [PREC.and, 'and'],
  [PREC.compare, choice('==', '!=', '<', '>', '<=', '>=')],
  [PREC.bitwise, choice('&', '^', '|', 'orelse')],
  [PREC.shift, choice('<<', '>>', '<<|')],
  [PREC.additive, choice('+', '-', '++', '+%', '-%', '+|', '-|')],
  [PREC.multiplicative, choice('||', '*', '/', '%', '*%', '*|')],
];

const bin = /[01]/;
const oct = /[0-7]/;
const dec = /[0-9]/;
const hex = /[0-9a-fA-F]/;
const digits = (d) => seq(d, repeat(seq(optional('_'), d)));

module.exports = grammar({
  name: 'zig',

  extras: $ => [/\s/, $.comment, $.doc_comment, $.container_doc_comment],

  word: $ => $.identifier,

  supertypes: $ => [
    $._statement,
    $._container_declaration,
  ],

  inline: $ => [
    $._var_decl_proto,
    $._function_prototype,
    $._if_prefix,
    $._while_prefix,
    $._for_prefix,
    $._block_label,
    $._break_label,
    $._container_members,
  ],

  conflicts: $ => [
    // `x:` may start a block label (`blk: {`, `outer: while`) or be an
    // expression followed by a sentinel/continue colon (`[n:0]u8`). The PEG
    // grammar uses two tokens of lookahead here; GLR handles it the same way.
    [$._primary_type_expression, $._labeled_block, $.for_expression, $.while_expression, $.switch_expression],
    [$._primary_type_expression, $._labeled_block, $.for_type_expression, $.while_type_expression, $.switch_expression],
    [$.break_expression],
    [$.continue_expression],
  ],

  rules: {
    // Root <- ContainerMembers skip eof
    source_file: $ => optional($._container_members),

    // *** Top level ***

    // ContainerMembers <- container_doc_comment? ContainerDecl* ContainerMembersRest
    // ContainerMembersRest <- !ContainerDeclPrefix ContainerField (COMMA ContainerMembersRest)?
    //                       / ContainerDecl*
    // Fields and declarations are accepted in any order; Zig reports
    // declarations between fields as an error, which is left to the compiler.
    _container_members: $ => choice(
      seq(
        repeat1(choice(
          $._container_declaration,
          seq($.container_field, ','),
        )),
        optional($.container_field),
      ),
      $.container_field,
    ),

    _container_declaration: $ => choice(
      $.test_declaration,
      $.comptime_declaration,
      $.function_declaration,
      $.variable_declaration,
      $.usingnamespace_declaration,
    ),

    test_declaration: $ => seq(
      'test',
      optional(field('name', choice($.string, $.identifier))),
      field('body', $.block),
    ),

    comptime_declaration: $ => seq('comptime', field('body', $.block)),

    function_declaration: $ => seq(
      optional('pub'),
      optional(choice(
        'export',
        seq('extern', optional(field('library', $.string))),
        'inline',
        'noinline',
      )),
      $._function_prototype,
      choice(';', field('body', $.block)),
    ),

    variable_declaration: $ => seq(
      optional('pub'),
      optional(choice(
        'export',
        seq('extern', optional(field('library', $.string))),
      )),
      optional('threadlocal'),
      $._var_decl_proto,
      optional(seq('=', field('value', $._expression))),
      ';',
    ),

    // Removed from the language in 0.15; kept so older code still parses.
    usingnamespace_declaration: $ => seq(
      optional('pub'),
      'usingnamespace',
      $._expression,
      ';',
    ),

    // FnProto <- KEYWORD_fn IDENTIFIER? ParamDeclList ByteAlign? AddrSpace?
    //            LinkSection? CallConv? EXCLAMATIONMARK? TypeExpr
    _function_prototype: $ => seq(
      'fn',
      optional(field('name', $.identifier)),
      field('parameters', $.parameters),
      optional(field('alignment', $.byte_alignment)),
      optional(field('address_space', $.address_space)),
      optional(field('link_section', $.link_section)),
      optional(field('calling_convention', $.calling_convention)),
      field('return_type', choice(
        $._type,
        // EXCLAMATIONMARK TypeExpr: an inferred error set, `fn f() !T`.
        alias($._inferred_error_union_type, $.error_union_type),
      )),
    ),

    // VarDeclProto <- (KEYWORD_const / KEYWORD_var) IDENTIFIER
    //                 (COLON TypeExpr)? ByteAlign? AddrSpace? LinkSection?
    _var_decl_proto: $ => seq(
      choice('const', 'var'),
      field('name', $.identifier),
      optional(seq(':', field('type', $._type))),
      optional(field('alignment', $.byte_alignment)),
      optional(field('address_space', $.address_space)),
      optional(field('link_section', $.link_section)),
    ),

    // ContainerField <- doc_comment? KEYWORD_comptime? (IDENTIFIER COLON)? TypeExpr
    //                   ByteAlign? (EQUAL Expr)?
    //
    // As in the PEG grammar (and Zig's own AST), a bare identifier such as an
    // enum member `a` or `a = 1` is in the `type` field.
    container_field: $ => seq(
      optional('comptime'),
      optional(seq(field('name', $.identifier), ':')),
      field('type', $._type),
      optional(field('alignment', $.byte_alignment)),
      optional(seq('=', field('default_value', $._expression))),
    ),

    // *** Block level ***

    // BlockStatement
    //   <- Statement
    //    / KEYWORD_defer BlockExprStatement
    //    / KEYWORD_errdefer BlockExprStatement
    //    / !StatementPrefix KEYWORD_comptime? VarAssignStatement
    _statement: $ => choice(
      $._branch_statement,
      $.defer_statement,
      $.errdefer_statement,
      alias($._local_variable_declaration, $.variable_declaration),
      alias($._statement_destructure, $.destructuring_assignment),
    ),

    // Statement: what may follow `else` in an if/for/while statement.
    // Declarations and defers are only allowed directly inside a block.
    _branch_statement: $ => choice(
      $.comptime_statement,
      $.nosuspend_statement,
      $.suspend_statement,
      $.if_statement,
      $._labeled_statement,
      $.expression_statement,
    ),

    // KEYWORD_comptime BlockExpr / KEYWORD_comptime? (AssignExpr | VarAssignStatement)
    comptime_statement: $ => seq(
      'comptime',
      choice(
        $._block_expr,
        alias($._local_variable_declaration, $.variable_declaration),
        alias($._statement_destructure, $.destructuring_assignment),
        $.expression_statement,
      ),
    ),

    nosuspend_statement: $ => seq('nosuspend', $._block_expr_statement),
    suspend_statement: $ => seq('suspend', $._block_expr_statement),
    defer_statement: $ => seq('defer', $._block_expr_statement),
    errdefer_statement: $ => seq(
      'errdefer',
      // `errdefer |err|` was removed from the language; still accepted.
      optional(field('payload', $.payload)),
      $._block_expr_statement,
    ),

    // BlockExprStatement <- BlockExpr / AssignExpr SEMICOLON
    _block_expr_statement: $ => choice(
      prec(PREC.statement, $._block_expr),
      seq($._assign_expr, ';'),
    ),

    // IfStatement
    //   <- IfPrefix BlockExpr ( KEYWORD_else Payload? Statement )?
    //    / IfPrefix AssignExpr ( SEMICOLON / KEYWORD_else Payload? Statement )
    if_statement: $ => prec.right(seq(
      $._if_prefix,
      choice(
        seq(
          field('consequence', prec(PREC.statement, $._block_expr)),
          optional($._else_statement),
        ),
        seq(
          field('consequence', $._assign_expr),
          choice(';', $._else_statement),
        ),
      ),
    )),

    _else_statement: $ => seq(
      'else',
      optional(field('payload', $.payload)),
      field('alternative', $._branch_statement),
    ),

    // LabeledStatement <- BlockLabel? (Block / LoopStatement / SwitchExpr)
    _labeled_statement: $ => prec(PREC.statement, choice(
      $._block_expr,
      $.for_statement,
      $.while_statement,
      $.switch_expression,
    )),

    // ForStatement
    //   <- ForPrefix BlockExpr ( KEYWORD_else Statement )?
    //    / ForPrefix AssignExpr ( SEMICOLON / KEYWORD_else Statement )
    for_statement: $ => prec.right(seq(
      optional($._block_label),
      optional('inline'),
      $._for_prefix,
      choice(
        seq(
          field('body', prec(PREC.statement, $._block_expr)),
          optional(seq('else', field('alternative', $._branch_statement))),
        ),
        seq(
          field('body', $._assign_expr),
          choice(';', seq('else', field('alternative', $._branch_statement))),
        ),
      ),
    )),

    // WhileStatement
    //   <- WhilePrefix BlockExpr ( KEYWORD_else Payload? Statement )?
    //    / WhilePrefix AssignExpr ( SEMICOLON / KEYWORD_else Payload? Statement )
    while_statement: $ => prec.right(seq(
      optional($._block_label),
      optional('inline'),
      $._while_prefix,
      choice(
        seq(
          field('body', prec(PREC.statement, $._block_expr)),
          optional($._else_statement),
        ),
        seq(
          field('body', $._assign_expr),
          choice(';', $._else_statement),
        ),
      ),
    )),

    // VarAssignStatement <- (VarDeclProto / Expr) (COMMA (VarDeclProto / Expr))*
    //                       EQUAL Expr SEMICOLON
    _local_variable_declaration: $ => seq(
      $._var_decl_proto,
      '=',
      field('value', $._expression),
      ';',
    ),

    _statement_destructure: $ => seq(
      field('target', $._destructure_target),
      repeat1(seq(',', field('target', $._destructure_target))),
      '=',
      field('value', $._expression),
      ';',
    ),

    _destructure_target: $ => choice(
      alias($._var_decl_proto_node, $.variable_declaration),
      $._expression,
    ),

    _var_decl_proto_node: $ => $._var_decl_proto,

    expression_statement: $ => seq(
      choice($._expression, $.assignment),
      ';',
    ),

    // *** Expression level ***

    // AssignExpr <- Expr (AssignOp Expr / (COMMA Expr)+ EQUAL Expr)?
    _assign_expr: $ => choice(
      $._expression,
      $.assignment,
      alias($._expression_destructure, $.destructuring_assignment),
    ),

    // SingleAssignExpr <- Expr (AssignOp Expr)?
    _single_assign_expr: $ => choice($._expression, $.assignment),

    assignment: $ => seq(
      field('left', $._expression),
      field('operator', choice(...ASSIGNMENT_OPERATORS)),
      field('right', $._expression),
    ),

    _expression_destructure: $ => seq(
      field('target', $._expression),
      repeat1(seq(',', field('target', $._expression))),
      '=',
      field('value', $._expression),
    ),

    _expression: $ => choice(
      $.binary_expression,
      $._prefix_expression,
    ),

    binary_expression: $ => choice(
      ...BINARY_OPERATORS.map(([precedence, operator]) =>
        prec.left(precedence, seq(
          field('left', $._expression),
          field('operator', operator),
          field('right', $._expression),
        )),
      ),
      // KEYWORD_catch Payload?
      prec.left(PREC.bitwise, seq(
        field('left', $._expression),
        field('operator', 'catch'),
        optional(field('payload', $.payload)),
        field('right', $._expression),
      )),
    ),

    // PrefixExpr <- PrefixOp* PrimaryExpr
    _prefix_expression: $ => choice(
      $.unary_expression,
      $._primary_expression,
    ),

    unary_expression: $ => seq(
      field('operator', choice('!', '-', '~', '-%', '&', 'try')),
      field('operand', $._prefix_expression),
    ),

    _primary_expression: $ => choice(
      $.asm_expression,
      $.if_expression,
      $.break_expression,
      $.comptime_expression,
      $.nosuspend_expression,
      $.continue_expression,
      $.resume_expression,
      $.return_expression,
      $.for_expression,
      $.while_expression,
      $.block,
      $.init_expression,
      $._type_expression,
    ),

    // IfExpr <- IfPrefix Expr (KEYWORD_else Payload? Expr)?
    if_expression: $ => prec.right(PREC.keyword_expression, seq(
      $._if_prefix,
      field('consequence', $._expression),
      optional(seq(
        'else',
        optional(field('payload', $.payload)),
        field('alternative', $._expression),
      )),
    )),

    break_expression: $ => jump($, 'break'),

    continue_expression: $ => jump($, 'continue'),

    comptime_expression: $ => prec.right(PREC.keyword_expression, seq(
      'comptime',
      $._expression,
    )),

    nosuspend_expression: $ => prec.right(PREC.keyword_expression, seq(
      'nosuspend',
      $._expression,
    )),

    resume_expression: $ => prec.right(PREC.keyword_expression, seq(
      'resume',
      $._expression,
    )),

    return_expression: $ => prec.right(PREC.keyword_expression, seq(
      'return',
      optional(field('value', $._expression)),
    )),

    // BlockLabel? LoopExpr
    // ForExpr <- ForPrefix Expr (KEYWORD_else Expr)?
    for_expression: $ => inlinable($, seq(
      $._for_prefix,
      field('body', $._expression),
      optional(seq('else', field('alternative', $._expression))),
    )),

    // WhileExpr <- WhilePrefix Expr (KEYWORD_else Payload? Expr)?
    while_expression: $ => inlinable($, seq(
      $._while_prefix,
      field('body', $._expression),
      optional(seq(
        'else',
        optional(field('payload', $.payload)),
        field('alternative', $._expression),
      )),
    )),

    // Block <- LBRACE Statement* RBRACE
    block: $ => seq('{', repeat($._statement), '}'),

    // BlockLabel Block (LabeledTypeExpr); exposed as a `block` with a label.
    _labeled_block: $ => seq($._block_label, '{', repeat($._statement), '}'),

    // BlockExpr <- BlockLabel? Block
    // Only used in statement position, where it beats the equivalent
    // expression statement (the PEG grammar tries statements first).
    _block_expr: $ => choice(
      prec(PREC.statement, $.block),
      prec(PREC.statement, alias($._labeled_block, $.block)),
    ),

    // CurlySuffixExpr <- TypeExpr InitList?
    init_expression: $ => seq(
      field('type', $._type_expression),
      field('initializer', $.initializer_list),
    ),

    // InitList
    //   <- LBRACE FieldInit (COMMA FieldInit)* COMMA? RBRACE
    //    / LBRACE Expr (COMMA Expr)* COMMA? RBRACE
    //    / LBRACE RBRACE
    initializer_list: $ => seq(
      '{',
      optional(choice(
        commaSep1($.field_initializer),
        commaSep1($._expression),
      )),
      '}',
    ),

    // FieldInit <- DOT IDENTIFIER EQUAL Expr
    field_initializer: $ => seq(
      '.',
      field('name', $.identifier),
      '=',
      field('value', $._expression),
    ),

    // *** Types ***

    // TypeExpr in a position where only a type may appear.
    _type: $ => choice(
      $._type_expression,
      alias($.if_type_expression, $.if_expression),
      alias($.for_type_expression, $.for_expression),
      alias($.while_type_expression, $.while_expression),
      alias($.comptime_type_expression, $.comptime_expression),
    ),

    // KEYWORD_comptime TypeExpr. In `comptime comptime u32` (a field or
    // parameter), the first `comptime` is the modifier.
    comptime_type_expression: $ => prec.right(-1, seq('comptime', $._type)),

    // IfTypeExpr <- IfPrefix TypeExpr (KEYWORD_else Payload? TypeExpr)?
    if_type_expression: $ => prec.right(seq(
      $._if_prefix,
      field('consequence', $._type),
      optional(seq(
        'else',
        optional(field('payload', $.payload)),
        field('alternative', $._type),
      )),
    )),

    // ForTypeExpr <- ForPrefix TypeExpr (KEYWORD_else TypeExpr)?
    for_type_expression: $ => labeled(
      $,
      seq(
        optional('inline'),
        $._for_prefix,
        field('body', $._type),
        optional(seq('else', field('alternative', $._type))),
      ),
    ),

    // WhileTypeExpr <- WhilePrefix TypeExpr (KEYWORD_else Payload? TypeExpr)?
    while_type_expression: $ => labeled(
      $,
      seq(
        optional('inline'),
        $._while_prefix,
        field('body', $._type),
        optional(seq(
          'else',
          optional(field('payload', $.payload)),
          field('alternative', $._type),
        )),
      ),
    ),

    // TypeExpr <- PrefixTypeOp* ErrorUnionExpr
    _type_expression: $ => choice(
      $.optional_type,
      $.anyframe_type,
      $.slice_type,
      $.pointer_type,
      $.array_type,
      $.error_union_type,
      $._suffix_expression,
    ),

    optional_type: $ => seq('?', field('child', $._type)),

    anyframe_type: $ => seq('anyframe', '->', field('child', $._type)),

    // SliceTypeStart PtrMods
    // SliceTypeStart <- LBRACKET (COLON Expr)? RBRACKET
    slice_type: $ => seq(
      '[',
      optional(seq(':', field('sentinel', $._expression))),
      ']',
      repeat($._pointer_modifier),
      field('child', $._type),
    ),

    // ManyPtrTypeStart PtrMods / SinglePtrTypeStart SinglePtrMods
    pointer_type: $ => choice(
      seq(
        '*',
        repeat(choice($._pointer_modifier, $.bit_alignment)),
        field('child', $._type),
      ),
      // ManyPtrTypeStart <- LBRACKET ASTERISK (LETTERC / COLON Expr)? RBRACKET
      // `[*` always starts a many-item pointer (ArrayTypeStart is
      // LBRACKET !ASTERISK Expr ...), so it is lexed as one token.
      seq(
        alias(token(seq('[', /[ \t\r\n]*/, '*')), '[*'),
        optional(choice('c', seq(':', field('sentinel', $._expression)))),
        ']',
        repeat($._pointer_modifier),
        field('child', $._type),
      ),
    ),

    // PtrMod, ByteAlign and AddrSpace. Zig allows at most one align and one
    // addrspace; repeats are left to the compiler, as with const/volatile.
    _pointer_modifier: $ => choice(
      $.byte_alignment,
      $.address_space,
      'const',
      'volatile',
      'allowzero',
    ),

    // BitAlign <- KEYWORD_align LPAREN Expr (COLON Expr COLON Expr)? RPAREN
    // Only valid on single-item pointers.
    bit_alignment: $ => seq(
      'align',
      '(',
      $._expression,
      ':',
      field('bit_offset', $._expression),
      ':',
      field('host_size', $._expression),
      ')',
    ),

    // ArrayTypeStart <- LBRACKET Expr (COLON Expr)? RBRACKET
    array_type: $ => seq(
      '[',
      field('length', $._expression),
      optional(seq(':', field('sentinel', $._expression))),
      ']',
      field('child', $._type),
    ),

    // ErrorUnionExpr <- SuffixExpr (EXCLAMATIONMARK TypeExpr)?
    _inferred_error_union_type: $ => seq('!', field('value', $._type)),

    error_union_type: $ => prec(PREC.error_union, seq(
      field('error', $._suffix_expression),
      '!',
      field('value', $._type),
    )),

    // SuffixExpr <- PrimaryTypeExpr (SuffixOp / FnCallArguments)*
    _suffix_expression: $ => choice(
      $.call_expression,
      $.index_expression,
      $.slice_expression,
      $.field_expression,
      $.dereference_expression,
      $.unwrap_expression,
      $._primary_type_expression,
    ),

    call_expression: $ => prec(PREC.suffix, seq(
        field('function', $._suffix_expression),
        field('arguments', $.arguments),
    )),

    // FnCallArguments <- LPAREN ExprList RPAREN
    arguments: $ => seq('(', optional(commaSep1($._expression)), ')'),

    // LBRACKET Expr RBRACKET
    index_expression: $ => prec(PREC.suffix, seq(
        field('object', $._suffix_expression),
        '[',
        field('index', $._expression),
        ']',
    )),

    // LBRACKET Expr DOT2 (Expr? (COLON Expr)?)? RBRACKET
    slice_expression: $ => prec(PREC.suffix, seq(
        field('object', $._suffix_expression),
        '[',
        field('start', $._expression),
        '..',
        optional(field('end', $._expression)),
        optional(seq(':', field('sentinel', $._expression))),
        ']',
    )),

    field_expression: $ => prec(PREC.suffix, seq(
        field('object', $._suffix_expression),
        '.',
        field('member', $.identifier),
    )),

    dereference_expression: $ => prec(PREC.suffix, seq(
        field('operand', $._suffix_expression),
        '.*',
    )),

    unwrap_expression: $ => prec(PREC.suffix, seq(
        field('operand', $._suffix_expression),
        '.',
        '?',
    )),

    _primary_type_expression: $ => choice(
      $.builtin_call_expression,
      $.character,
      $._container_declaration_expression,
      $.enum_literal,
      alias($.anonymous_init_expression, $.init_expression),
      $.error_set_type,
      $.float,
      $.function_type,
      $.parenthesized_expression,
      alias($._labeled_block, $.block),
      $.switch_expression,
      $.identifier,
      $.integer,
      $.error_value,
      alias('anyframe', $.anyframe),
      $.unreachable,
      $.string,
      $.multiline_string,
    ),

    builtin_call_expression: $ => seq(
      field('function', $.builtin_identifier),
      field('arguments', $.arguments),
    ),

    // DOT IDENTIFIER
    enum_literal: $ => seq('.', field('name', $.identifier)),

    // DOT InitList
    anonymous_init_expression: $ => seq(
      '.',
      field('initializer', $.initializer_list),
    ),

    // ErrorSetDecl <- KEYWORD_error LBRACE IdentifierList RBRACE
    error_set_type: $ => seq(
      'error',
      '{',
      optional(commaSep1($.identifier)),
      '}',
    ),

    // KEYWORD_error DOT IDENTIFIER
    error_value: $ => seq('error', '.', field('name', $.identifier)),

    // FnProto used as an expression (a function type).
    function_type: $ => $._function_prototype,

    // GroupedExpr <- LPAREN Expr RPAREN
    parenthesized_expression: $ => seq('(', $._expression, ')'),

    unreachable: _ => 'unreachable',

    // SwitchExpr <- KEYWORD_switch LPAREN Expr RPAREN LBRACE SwitchProngList RBRACE
    switch_expression: $ => labeled($, seq(
      'switch',
      '(',
      field('condition', $._expression),
      ')',
      '{',
      optional(commaSep1($.switch_case)),
      '}',
    )),

    // SwitchProng <- KEYWORD_inline? SwitchCase EQUALRARROW PtrIndexPayload? SingleAssignExpr
    switch_case: $ => seq(
      optional('inline'),
      choice(
        commaSep1(field('pattern', choice($._expression, $.range_expression))),
        field('pattern', alias('else', $.else)),
      ),
      '=>',
      optional(field('payload', $.payload)),
      field('consequence', $._single_assign_expr),
    ),

    // SwitchItem <- Expr (DOT3 Expr)?
    // ForItem    <- Expr (DOT2 Expr?)?
    range_expression: $ => choice(
      seq(field('start', $._expression), '...', field('end', $._expression)),
      seq(field('start', $._expression), '..', optional(field('end', $._expression))),
    ),

    // *** Containers ***

    _container_declaration_expression: $ => choice(
      $.struct_declaration,
      $.enum_declaration,
      $.union_declaration,
      $.opaque_declaration,
    ),

    // `packed` was renamed to `bitpack`; both are accepted.
    container_layout: _ => choice('extern', 'bitpack', 'packed'),

    struct_declaration: $ => seq(
      optional(field('layout', $.container_layout)),
      'struct',
      optional(seq('(', field('backing_integer', $._expression), ')')),
      '{',
      optional($._container_members),
      '}',
    ),

    enum_declaration: $ => seq(
      optional(field('layout', $.container_layout)),
      'enum',
      optional(seq('(', field('tag_type', $._expression), ')')),
      '{',
      optional($._container_members),
      '}',
    ),

    union_declaration: $ => seq(
      optional(field('layout', $.container_layout)),
      'union',
      optional(seq(
        '(',
        choice(
          seq(
            alias('enum', $.tagged),
            optional(seq('(', field('tag_type', $._expression), ')')),
          ),
          field('tag_type', $._expression),
        ),
        ')',
      )),
      '{',
      optional($._container_members),
      '}',
    ),

    opaque_declaration: $ => seq(
      optional(field('layout', $.container_layout)),
      'opaque',
      '{',
      optional($._container_members),
      '}',
    ),

    // *** Assembly ***

    // AsmExpr <- KEYWORD_asm KEYWORD_volatile? LPAREN Expr AsmOutput? RPAREN
    asm_expression: $ => seq(
      'asm',
      optional('volatile'),
      '(',
      field('template', $._expression),
      optional(seq(
        ':',
        optional(field('outputs', $.asm_outputs)),
        optional(seq(
          ':',
          optional(field('inputs', $.asm_inputs)),
          optional(seq(
            ':',
            optional(field('clobbers', $.asm_clobbers)),
          )),
        )),
      )),
      ')',
    ),

    asm_outputs: $ => commaSep1($.asm_output_item),
    asm_inputs: $ => commaSep1($.asm_input_item),
    // AsmClobbers <- COLON Expr; older Zig used a list of strings.
    asm_clobbers: $ => commaSep1($._expression),

    // AsmOutputItem <- LBRACKET IDENTIFIER RBRACKET STRINGLITERAL
    //                  LPAREN (MINUSRARROW TypeExpr / IDENTIFIER) RPAREN
    asm_output_item: $ => seq(
      '[', field('name', $.identifier), ']',
      field('constraint', $._string_literal),
      '(',
      choice(seq('->', field('type', $._type)), field('variable', $.identifier)),
      ')',
    ),

    // AsmInputItem <- LBRACKET IDENTIFIER RBRACKET STRINGLITERAL LPAREN Expr RPAREN
    asm_input_item: $ => seq(
      '[', field('name', $.identifier), ']',
      field('constraint', $._string_literal),
      '(', field('value', $._expression), ')',
    ),

    // *** Helper grammar ***

    _block_label: $ => seq(field('label', $.identifier), ':'),
    _break_label: $ => seq(':', field('label', $.identifier)),

    // ByteAlign <- KEYWORD_align LPAREN Expr RPAREN
    byte_alignment: $ => seq('align', '(', $._expression, ')'),

    address_space: $ => seq('addrspace', '(', $._expression, ')'),
    link_section: $ => seq('linksection', '(', $._expression, ')'),
    calling_convention: $ => seq('callconv', '(', $._expression, ')'),

    // ParamDeclList <- LPAREN ParamDeclListRest
    // ParamDeclListRest <- RPAREN / DOT3 COMMA? RPAREN
    //                    / ParamDecl (COMMA ParamDeclListRest / RPAREN)
    parameters: $ => seq(
      '(',
      repeat(seq($.parameter, ',')),
      optional(choice($.parameter, seq($.variadic_parameter, optional(',')))),
      ')',
    ),

    // ParamDecl <- doc_comment? (KEYWORD_noalias / KEYWORD_comptime?)
    //              (IDENTIFIER COLON)? ParamType
    parameter: $ => seq(
      optional(choice('noalias', 'comptime')),
      optional(seq(field('name', $.identifier), ':')),
      field('type', choice($.anytype, $._type)),
    ),

    variadic_parameter: _ => '...',

    anytype: _ => 'anytype',

    // IfPrefix <- KEYWORD_if LPAREN Expr RPAREN PtrPayload?
    _if_prefix: $ => seq(
      'if', '(', field('condition', $._expression), ')',
      optional(field('payload', $.payload)),
    ),

    // WhilePrefix <- KEYWORD_while LPAREN Expr RPAREN PtrPayload? WhileContinueExpr?
    _while_prefix: $ => seq(
      'while', '(', field('condition', $._expression), ')',
      optional(field('payload', $.payload)),
      optional(seq(':', '(', field('continue', $._assign_expr), ')')),
    ),

    // ForPrefix <- KEYWORD_for LPAREN ForArgumentsList RPAREN PtrListPayload
    _for_prefix: $ => seq(
      'for',
      '(',
      commaSep1(field('input', choice($._expression, $.range_expression))),
      ')',
      field('payload', $.payload),
    ),

    // Payload, PtrPayload, PtrIndexPayload and PtrListPayload.
    payload: $ => seq(
      '|',
      commaSep1(choice($.identifier, $.pointer_capture)),
      '|',
    ),

    pointer_capture: $ => seq('*', $.identifier),

    // *** Tokens ***

    identifier: _ => token(choice(
      /[A-Za-z_][A-Za-z0-9_]*/,
      seq('@"', repeat(choice(/[^"\\\n]/, /\\[^\n]/)), '"'),
    )),

    builtin_identifier: _ => /@[A-Za-z_][A-Za-z0-9_]*/,

    integer: _ => token(choice(
      seq('0b', digits(bin)),
      seq('0o', digits(oct)),
      seq('0x', digits(hex)),
      digits(dec),
    )),

    float: _ => token(choice(
      seq('0x', digits(hex), '.', digits(hex), optional(seq(/[pP][-+]?/, digits(dec)))),
      seq(digits(dec), '.', digits(dec), optional(seq(/[eE][-+]?/, digits(dec)))),
      seq('0x', digits(hex), /[pP][-+]?/, digits(dec)),
      seq(digits(dec), /[eE][-+]?/, digits(dec)),
    )),

    character: _ => token(seq(
      '\'',
      choice(
        /[^'\\\n]/,
        /\\x[0-9a-fA-F]{2}/,
        /\\u\{[0-9a-fA-F]+\}/,
        /\\[nr\\t'"]/,
      ),
      '\'',
    )),

    _string_literal: $ => choice($.string, $.multiline_string),

    string: $ => seq(
      '"',
      repeat(choice(
        alias(token.immediate(prec(1, /[^"\\\n]+/)), $.string_content),
        $.escape_sequence,
      )),
      token.immediate('"'),
    ),

    escape_sequence: _ => token.immediate(seq(
      '\\',
      choice(
        /x[0-9a-fA-F]{2}/,
        /u\{[0-9a-fA-F]+\}/,
        /[nr\\t'"]/,
      ),
    )),

    // line_string <- ('\\\\' [^\n]* [ \n]*)+
    multiline_string: _ => prec.right(repeat1(token(seq('\\\\', /[^\n]*/)))),

    // line_comment <- '//' ![!/][^\n]* / '////' [^\n]*
    comment: _ => token(choice(
      /\/\/([^!\/\n][^\n]*)?/,
      /\/\/\/\/[^\n]*/,
    )),

    doc_comment: _ => token(/\/\/\/([^\/\n][^\n]*)?/),

    container_doc_comment: _ => token(/\/\/![^\n]*/),
  },
});

/**
 * KEYWORD_break BreakLabel? Expr? (and the same for continue).
 *
 * After a bare `break`, a `:` is a label only if an identifier follows, as in
 * `[if (c) n else break:0]u8`. The bare form has no associativity so that the
 * conflict stays unresolved and GLR looks one token further.
 * @param {GrammarSymbols<string>} $
 * @param {string} keyword
 */
function jump($, keyword) {
  return choice(
    prec(PREC.keyword_expression, keyword),
    prec.right(PREC.keyword_expression, seq(keyword, field('value', $._expression))),
    prec.right(PREC.keyword_expression, seq(
      keyword,
      $._break_label,
      optional(field('value', $._expression)),
    )),
  );
}

/**
 * BlockLabel? KEYWORD_inline? Loop, as an expression. A leading `inline`
 * in a switch prong belongs to the prong (`inline .a => while ...`), so the
 * variant without `inline` is preferred.
 * @param {GrammarSymbols<string>} $
 * @param {Rule} rule
 */
function inlinable($, rule) {
  return choice(
    prec.right(PREC.keyword_expression, seq(optional($._block_label), rule)),
    prec.right(PREC.keyword_expression - 1, seq(optional($._block_label), 'inline', rule)),
  );
}

/**
 * A loop type expression with an optional block label. In type position
 * (field types, parameter types), `name: while ...` is a field named `name`,
 * not a labeled loop, so the unlabeled reading is preferred.
 * @param {GrammarSymbols<string>} $
 * @param {Rule} rule
 */
function labeled($, rule) {
  return choice(
    prec.right(1, rule),
    prec.right(seq($._block_label, rule)),
  );
}

/**
 * One or more `rule`s separated by commas, with an optional trailing comma.
 * @param {RuleOrLiteral} rule
 */
function commaSep1(rule) {
  return seq(rule, repeat(seq(',', rule)), optional(','));
}
