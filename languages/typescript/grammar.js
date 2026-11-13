/**
 * @file TypeScript grammar for tree-sitter
 * @license MIT
 *
 * TypeScript 5.x (and the JavaScript it contains), with JSX, with no
 * external scanner. One grammar covers .ts and .tsx files: `<T>x` type
 * assertions and JSX elements are both accepted, and the parser keeps both
 * readings of a `<` until one fails (a JSX element needs its closing tag).
 *
 * The parts of JavaScript's syntax that other grammars handle in a scanner:
 *
 * - Automatic semicolon insertion. A `;` that ends a statement, class member
 *   or type member is optional. Where the next token could either continue
 *   the expression or start a new statement, precedence makes the parser
 *   continue the expression. That is the rule JavaScript uses: a semicolon is
 *   only inserted before a token that cannot continue the statement. So
 *   `a⏎(b)` is a call and `a⏎.b()` a member access, as in JavaScript, and
 *   `a⏎b` is two statements.
 * - Regular expressions. `/` is the same token for division and the start of
 *   a regex; the parser decides, and only after a regex's opening `/` is the
 *   pattern lexed. `a⏎/b/g` is a division, as in JavaScript.
 * - Template strings. Their text is a run of immediate tokens that outrank
 *   comments, so `` `// ${x}` `` is a template with a substitution. A `$`
 *   right before `${` is a token of its own.
 * - Generics. `f<T>(x)` and `a < b > (c)` are both tried; type arguments win
 *   when both parse.
 */

/// <reference types="tree-sitter-cli/dsl" />
// @ts-check

// Where a statement may end without a `;`. See the file comment.
const SEMI = optional(';');

const PREC = {
  // A contextual keyword is a name only where it can not be a keyword.
  CONTEXTUAL: -2,
  COMMA: -1,
  // A statement that has no `;` ends only where its expression cannot go on.
  STATEMENT: 0,
  DECLARATION: 1,
  // Ties with `pattern`, so that in `(x = 1) =>` and `[x = 1] =` both the
  // assignment and the default value reading are kept until one fails.
  ASSIGNMENT: 0,
  ASSIGN: 1,
  TERNARY: 2,
  NULLISH: 3,
  OR: 4,
  AND: 5,
  BIT_OR: 6,
  BIT_XOR: 7,
  BIT_AND: 8,
  EQUALITY: 9,
  RELATIONAL: 10,
  SHIFT: 11,
  ADD: 12,
  MUL: 13,
  EXP: 14,
  UNARY: 15,
  UPDATE: 16,
  NEW: 17,
  CALL: 18,
  MEMBER: 19,

  // Types
  // Above every expression operator, so the type after `as` or `satisfies`
  // extends as far as it can (`x as A | B`).
  FUNCTION_TYPE: 21,
  CONDITIONAL_TYPE: 22,
  UNION: 23,
  INTERSECTION: 24,
  TYPE_OPERATOR: 25,
  ARRAY_TYPE: 26,
};

// Words that are never identifiers. (ECMAScript reserved words; `enum` is
// reserved too.) Property names, export names and labels after `.` accept
// them.
const RESERVED = [
  'break', 'case', 'catch', 'class', 'const', 'continue', 'debugger',
  'default', 'delete', 'do', 'else', 'enum', 'export', 'extends', 'false',
  'finally', 'for', 'function', 'if', 'import', 'in', 'instanceof', 'new',
  'null', 'return', 'super', 'switch', 'this', 'throw', 'true', 'try',
  'typeof', 'var', 'void', 'while', 'with',
];

// Words that are keywords in some positions and names in all others. Where
// both readings are possible (`type` at the start of a statement, `get` in a
// class body), the keyword is lexed and these rules accept it as a name.
const CONTEXTUAL = [
  'abstract', 'accessor', 'as', 'async', 'asserts', 'await', 'declare', 'get',
  'global', 'infer', 'is', 'keyof', 'module', 'namespace', 'of', 'out',
  'override', 'private', 'protected', 'public', 'readonly', 'require',
  'satisfies', 'set', 'static', 'type', 'unique', 'using', 'from', 'yield',
  'interface', 'implements', 'package', 'meta', 'target', 'defer', 'source',
  'assert',
];

const PREDEFINED_TYPES = [
  'any', 'number', 'boolean', 'string', 'symbol', 'void', 'unknown', 'never',
  'object', 'bigint', 'intrinsic',
];

// Characters that can not start (first class) or continue (second) an
// identifier. Everything else, including non-ASCII letters, can.
const ID_START = /[^\x00-\x1F\s\p{Zs}0-9:;`"'@#.,|^&<=>+\-*/\\%?!~()\[\]{}\uFEFF\u2060\u200B\u2028\u2029]|\\u[0-9a-fA-F]{4}|\\u\{[0-9a-fA-F]+\}/;
const ID_CONTINUE = /[^\x00-\x1F\s\p{Zs}:;`"'@#.,|^&<=>+\-*/\\%?!~()\[\]{}\uFEFF\u2060\u200B\u2028\u2029]|\\u[0-9a-fA-F]{4}|\\u\{[0-9a-fA-F]+\}/;

module.exports = grammar({
    name: 'typescript',

    extras: $ => [$.comment, $.html_comment, /[\s\p{Zs}\uFEFF\u2028\u2029\u2060\u200B]/],

    word: $ => $.identifier,

    reserved: {
      global: _ => RESERVED,
      properties: _ => [],
    },

    supertypes: $ => [
      $.statement,
      $.declaration,
      $.expression,
      $.primary_expression,
      $.pattern,
      $.type,
      $.primary_type,
    ],

    inline: $ => [
      $._call_signature,
      $._formal_parameter,
      $._expressions,
      $._identifier,
      $._lhs_expression,
      $._type_identifier,
      $._from_clause,
      $._for_header,
      $._initializer,
      $._module_export_name,
      $._parameter_name,
      $._jsx_start_opening_element,
    ],

    conflicts: $ => [
      [$.array, $.array_pattern],
      [$.primary_expression, $.pattern],
      [$.primary_expression, $.rest_pattern],
      [$.computed_property_name, $.array],
      // `a < b`, `f<T>(x)` and `f<T>`.
      [$.call_expression, $.instantiation_expression, $.binary_expression],
      [$.call_expression, $.instantiation_expression, $.binary_expression, $.unary_expression],
      [$.call_expression, $.instantiation_expression, $.binary_expression, $.update_expression],
      [$.call_expression, $.instantiation_expression, $.binary_expression, $.await_expression],
      [$.call_expression, $.instantiation_expression, $.binary_expression, $.type_assertion],
      [$.generic_type, $._jsx_identifier],
      [$.primary_type, $.type_parameter, $._jsx_identifier],
      [$.nested_identifier, $.jsx_member_expression],
      [$.nested_type_identifier, $.jsx_member_expression],
      [$.type, $.array_type, $.lookup_type],
      [$.primary_expression, $.primary_type, $.generic_type],
      [$.primary_expression, $.type_query, $._type_query_call_expression],
      // `<T>(x) => x`, `<T>(x)` and `<T>…</T>`
      [$.primary_type, $.type_parameter],
      [$.object, $.object_pattern, $._property_name],
      [$.object_pattern, $._property_name],
      [$.object, $.object_pattern],
      [$.method_signature, $.construct_signature],
      [$.primary_expression, $.generic_type],
      [$.primary_type, $.generic_type],
      [$.method_signature, $.property_signature, $.construct_signature, $.index_signature, $._reserved_identifier],
      [$.primary_expression, $.import_type],
      [$.assignment_expression, $.required_parameter],
      [$.object_assignment_pattern, $.assignment_expression],
      [$.assignment_expression, $.rest_pattern],
      [$.assignment_expression, $.pattern],
      [$.primary_expression, $.nested_identifier, $.nested_type_identifier],
      [$.nested_identifier, $.primary_type, $.nested_type_identifier],
      [$.method_signature, $.ambient_declaration, $.property_signature, $.index_signature, $._reserved_identifier],
      [$.statement_block, $.object, $.object_type],
      [$.empty_statement, $.object_type],
      [$.asserts, $.type_predicate],
      [$.primary_expression, $.type_predicate],
      [$.primary_expression, $.rest_pattern, $.literal_type],
      [$.primary_expression, $.rest_pattern, $.primary_type],
      [$.nested_identifier, $.nested_type_identifier],
      [$.rest_pattern, $.literal_type],
      [$.rest_pattern, $.primary_type],
      [$.type_predicate, $.primary_type],
      [$.template_literal_type, $.template_string],
      [$.primary_expression, $.pattern, $.literal_type],
      [$.primary_expression, $.required_parameter, $.primary_type],
      [$.primary_expression, $._type_query_member_expression],
      [$.primary_expression, $._type_query_call_expression],
      [$.primary_expression, $.type_query],
      [$.primary_expression, $.optional_tuple_parameter],
      [$.pattern, $.literal_type],
      [$.primary_expression, $.primary_type, $.optional_tuple_parameter],
      [$.primary_expression, $.pattern, $.primary_type],
      [$.pattern, $.primary_type],
      [$.array, $.array_pattern, $.tuple_type],
      [$.array, $.tuple_type],
      [$.array_pattern, $.tuple_type],
      [$.primary_expression, $.primary_type],
      [$.primary_expression, $.literal_type],
      [$.primary_type, $.optional_tuple_parameter],
      [$.required_parameter, $.primary_type],
      [$.this, $.this_type],
      [$.for_in_statement, $.primary_expression],
      [$.primary_expression, $.optional_parameter],
      [$.primary_expression, $.required_parameter],
    ],

    rules: {
      program: $ => seq(
        optional($.hash_bang_line),
        repeat($.statement),
      ),

      hash_bang_line: _ => /#!.*/,

      // ------------------------------------------------------------------
      // Statements
      // ------------------------------------------------------------------

      statement: $ => choice(
        $.export_statement,
        $.import_statement,
        $.debugger_statement,
        $.expression_statement,
        $.declaration,
        $.statement_block,
        $.if_statement,
        $.switch_statement,
        $.for_statement,
        $.for_in_statement,
        $.while_statement,
        $.do_statement,
        $.try_statement,
        $.with_statement,
        $.break_statement,
        $.continue_statement,
        $.return_statement,
        $.throw_statement,
        $.empty_statement,
        $.labeled_statement,
      ),

      declaration: $ => choice(
        $.function_declaration,
        $.generator_function_declaration,
        $.class_declaration,
        $.abstract_class_declaration,
        $.lexical_declaration,
        $.variable_declaration,
        $.using_declaration,
        $.function_signature,
        $.module,
        $.internal_module,
        $.type_alias_declaration,
        $.enum_declaration,
        $.interface_declaration,
        $.import_alias,
        $.ambient_declaration,
      ),

      export_statement: $ => prec.right(choice(
        seq(
          repeat(field('decorator', $.decorator)),
          'export',
          choice(
            seq('*', $._from_clause),
            seq($.namespace_export, $._from_clause),
            seq($.export_clause, $._from_clause),
            $.export_clause,
          ),
          optional($.import_attribute),
          SEMI,
        ),
        seq(
          repeat(field('decorator', $.decorator)),
          'export',
          choice(
            field('declaration', $.declaration),
            seq(
              'default',
              choice(
                field('declaration', $.declaration),
                seq(field('value', $.expression), SEMI),
              ),
            ),
          ),
        ),
        seq('export', '=', field('value', $.expression), SEMI),
        seq('export', 'as', 'namespace', $.identifier, SEMI),
        seq(
          'export', 'type',
          choice(
            seq($.export_clause, optional($._from_clause)),
            seq('*', $._from_clause),
            seq($.namespace_export, $._from_clause),
          ),
          optional($.import_attribute),
          SEMI,
        ),
      )),

      namespace_export: $ => seq('*', 'as', $._module_export_name),

      export_clause: $ => seq(
        '{',
        commaSep($.export_specifier),
        optional(','),
        '}',
      ),

      export_specifier: $ => seq(
        optional('type'),
        field('name', $._module_export_name),
        optional(seq('as', field('alias', $._module_export_name))),
      ),

      _module_export_name: $ => choice(
        alias(reserved('properties', $.identifier), $.identifier),
        alias($._reserved_identifier, $.identifier),
        $.string,
      ),

      import_statement: $ => prec.right(seq(
        'import',
        optional(choice('type', 'typeof', 'defer', 'source')),
        choice(
          seq($.import_clause, $._from_clause),
          $.import_require_clause,
          field('source', $.string),
        ),
        optional($.import_attribute),
        SEMI,
      )),

      import_clause: $ => choice(
        $.namespace_import,
        $.named_imports,
        seq(
          alias($._import_identifier, $.identifier),
          optional(seq(',', choice($.namespace_import, $.named_imports))),
        ),
      ),

      import_require_clause: $ => seq(
        alias($._import_identifier, $.identifier), '=', 'require', '(', field('source', $.string), ')',
      ),

      _from_clause: $ => seq('from', field('source', $.string)),

      namespace_import: $ => seq('*', 'as', alias($._import_identifier, $.identifier)),

      named_imports: $ => seq(
        '{',
        commaSep($.import_specifier),
        optional(','),
        '}',
      ),

      import_specifier: $ => seq(
        optional(choice('type', 'typeof')),
        choice(
          field('name', alias(choice($.identifier, $._reserved_identifier), $.identifier)),
          seq(
            field('name', $._module_export_name),
            'as',
            field('alias', alias($._import_identifier, $.identifier)),
          ),
        ),
      ),

      // A name in an import clause. Contextual keywords are names here, except
      // `from`, so that `import defer from "a"` imports `defer`.
      _import_identifier: $ => prec(-1, choice(
        $.identifier,
        ...CONTEXTUAL.filter(k => k !== 'from'),
      )),

      import_attribute: $ => seq(choice('with', 'assert'), $.object),

      import_alias: $ => prec.right(seq(
        'import',
        optional('type'),
        field('name', alias($._import_identifier, $.identifier)),
        '=',
        field('value', choice($.identifier, $.nested_identifier)),
        SEMI,
      )),

      expression_statement: $ => prec.right(PREC.STATEMENT, seq(
        $._expressions,
        SEMI,
      )),

      variable_declaration: $ => prec.right(PREC.STATEMENT, seq(
        'var',
        commaSep1($.variable_declarator),
        SEMI,
      )),

      lexical_declaration: $ => prec.right(PREC.STATEMENT, seq(
        field('kind', choice('let', 'const')),
        commaSep1($.variable_declarator),
        SEMI,
      )),

      using_declaration: $ => prec.right(PREC.STATEMENT, seq(
        field('kind', choice('using', seq('await', 'using'))),
        commaSep1($.variable_declarator),
        SEMI,
      )),

      variable_declarator: $ => prec.right(choice(
        seq(
          field('name', choice($._identifier, $._destructuring_pattern)),
          optional(field('type', $.type_annotation)),
          optional($._initializer),
        ),
        seq(
          field('name', $._identifier),
          '!',
          field('type', $.type_annotation),
        ),
      )),

      statement_block: $ => prec.right(seq(
        '{',
        repeat($.statement),
        '}',
      )),

      else_clause: $ => seq('else', $.statement),

      if_statement: $ => prec.right(seq(
        'if',
        field('condition', $.parenthesized_expression),
        field('consequence', $.statement),
        optional(field('alternative', $.else_clause)),
      )),

      switch_statement: $ => seq(
        'switch',
        field('value', $.parenthesized_expression),
        field('body', $.switch_body),
      ),

      for_statement: $ => seq(
        'for',
        '(',
        choice(
          field('initializer', alias($._for_declaration, $.lexical_declaration)),
          field('initializer', alias($._for_var_declaration, $.variable_declaration)),
          seq(field('initializer', $._expressions), ';'),
          field('initializer', $.empty_statement),
        ),
        choice(
          seq(field('condition', $._expressions), ';'),
          field('condition', $.empty_statement),
        ),
        optional(field('increment', $._expressions)),
        ')',
        field('body', $.statement),
      ),

      _for_declaration: $ => seq(
        field('kind', choice('let', 'const', 'using', seq('await', 'using'))),
        commaSep1($.variable_declarator),
        ';',
      ),

      _for_var_declaration: $ => seq(
        'var',
        commaSep1($.variable_declarator),
        ';',
      ),

      for_in_statement: $ => seq(
        'for',
        optional('await'),
        $._for_header,
        field('body', $.statement),
      ),

      _for_header: $ => seq(
        '(',
        choice(
          field('left', choice($._lhs_expression, $.parenthesized_expression)),
          seq(
            field('kind', 'var'),
            field('left', choice($._identifier, $._destructuring_pattern)),
            optional($._initializer),
          ),
          seq(
            field('kind', choice('let', 'const', 'using', seq('await', 'using'))),
            field('left', choice($._identifier, $._destructuring_pattern)),
          ),
        ),
        field('operator', choice('in', 'of')),
        field('right', $._expressions),
        ')',
      ),

      while_statement: $ => seq(
        'while',
        field('condition', $.parenthesized_expression),
        field('body', $.statement),
      ),

      do_statement: $ => prec.right(seq(
        'do',
        field('body', $.statement),
        'while',
        field('condition', $.parenthesized_expression),
        SEMI,
      )),

      try_statement: $ => seq(
        'try',
        field('body', $.statement_block),
        optional(field('handler', $.catch_clause)),
        optional(field('finalizer', $.finally_clause)),
      ),

      with_statement: $ => seq(
        'with',
        field('object', $.parenthesized_expression),
        field('body', $.statement),
      ),

      break_statement: $ => prec.right(seq(
        'break',
        optional(field('label', alias(choice($.identifier, $._reserved_identifier), $.statement_identifier))),
        SEMI,
      )),

      continue_statement: $ => prec.right(seq(
        'continue',
        optional(field('label', alias(choice($.identifier, $._reserved_identifier), $.statement_identifier))),
        SEMI,
      )),

      debugger_statement: $ => prec.right(seq('debugger', SEMI)),

      return_statement: $ => prec.right(seq(
        'return',
        optional($._expressions),
        SEMI,
      )),

      throw_statement: $ => prec.right(seq(
        'throw',
        $._expressions,
        SEMI,
      )),

      empty_statement: _ => ';',

      labeled_statement: $ => prec.dynamic(1, seq(
        field('label', alias(choice($.identifier, $._reserved_identifier), $.statement_identifier)),
        ':',
        field('body', $.statement),
      )),


      switch_body: $ => seq(
        '{',
        repeat(choice($.switch_case, $.switch_default)),
        '}',
      ),

      switch_case: $ => seq(
        'case',
        field('value', $._expressions),
        ':',
        field('body', repeat($.statement)),
      ),

      switch_default: $ => seq(
        'default',
        ':',
        field('body', repeat($.statement)),
      ),

      catch_clause: $ => seq(
        'catch',
        optional(seq(
          '(',
          field('parameter', choice($._identifier, $._destructuring_pattern)),
          optional(field('type', $.type_annotation)),
          ')',
        )),
        field('body', $.statement_block),
      ),

      finally_clause: $ => seq('finally', field('body', $.statement_block)),

      parenthesized_expression: $ => seq(
        '(',
        $._expressions,
        ')',
      ),

      // ------------------------------------------------------------------
      // Expressions
      // ------------------------------------------------------------------

      _expressions: $ => choice($.expression, $.sequence_expression),

      expression: $ => choice(
        $.primary_expression,
        $.assignment_expression,
        $.augmented_assignment_expression,
        $.await_expression,
        $.unary_expression,
        $.binary_expression,
        $.ternary_expression,
        $.update_expression,
        $.new_expression,
        $.yield_expression,
        $.as_expression,
        $.satisfies_expression,
        $.instantiation_expression,
        $.jsx_element,
        $.jsx_self_closing_element,
        $.type_assertion,
      ),

      primary_expression: $ => choice(
        $.subscript_expression,
        $.member_expression,
        $.parenthesized_expression,
        $._identifier,
        alias($._reserved_identifier, $.identifier),
        $.this,
        $.super,
        $.number,
        $.string,
        $.template_string,
        $.regex,
        $.true,
        $.false,
        $.null,
        $.object,
        $.array,
        $.function_expression,
        $.arrow_function,
        $.generator_function,
        $.class,
        $.meta_property,
        $.call_expression,
        $.non_null_expression,
      ),

      yield_expression: $ => prec.right(PREC.ASSIGN, seq(
        'yield',
        optional(choice(seq('*', $.expression), $.expression)),
      )),

      object: $ => prec(PREC.STATEMENT - 1, seq(
        '{',
        commaSep(choice(
          $.pair,
          $.spread_element,
          alias($._object_method, $.method_definition),
          alias(choice($.identifier, $._reserved_identifier), $.shorthand_property_identifier),
        )),
        optional(','),
        '}',
      )),

      // Objects, object patterns and the names in object types have the same
      // precedence, so `{ a }` stays ambiguous until what follows decides.
      object_pattern: $ => prec.dynamic(-1, prec(PREC.STATEMENT - 1, seq(
        '{',
        commaSep(choice(
          $.pair_pattern,
          $.rest_pattern,
          $.object_assignment_pattern,
          alias(choice($.identifier, $._reserved_identifier), $.shorthand_property_identifier_pattern),
        )),
        optional(','),
        '}',
      ))),

      assignment_pattern: $ => seq(
        field('left', $.pattern),
        '=',
        field('right', $.expression),
      ),

      object_assignment_pattern: $ => seq(
        field('left', choice(
          alias(choice($.identifier, $._reserved_identifier), $.shorthand_property_identifier_pattern),
          $._destructuring_pattern,
        )),
        '=',
        field('right', $.expression),
      ),

      array: $ => seq(
        '[',
        commaSep(optional(choice($.expression, $.spread_element))),
        ']',
      ),

      array_pattern: $ => seq(
        '[',
        commaSep(optional(choice($.pattern, $.assignment_pattern))),
        ']',
      ),

      class: $ => prec(PREC.DECLARATION - 1, seq(
        repeat(field('decorator', $.decorator)),
        'class',
        optional(field('name', $._type_identifier)),
        optional(field('type_parameters', $.type_parameters)),
        optional($.class_heritage),
        field('body', $.class_body),
      )),

      class_declaration: $ => prec.right(PREC.DECLARATION, seq(
        repeat(field('decorator', $.decorator)),
        'class',
        field('name', $._type_identifier),
        optional(field('type_parameters', $.type_parameters)),
        optional($.class_heritage),
        field('body', $.class_body),
      )),

      abstract_class_declaration: $ => prec.right(PREC.DECLARATION, seq(
        repeat(field('decorator', $.decorator)),
        'abstract',
        'class',
        field('name', $._type_identifier),
        optional(field('type_parameters', $.type_parameters)),
        optional($.class_heritage),
        field('body', $.class_body),
      )),

      class_heritage: $ => choice(
        seq($.extends_clause, optional($.implements_clause)),
        $.implements_clause,
      ),

      // `extends Base<T>` is an instantiation expression.
      extends_clause: $ => seq(
        'extends',
        commaSep1(field('value', $.expression)),
      ),

      implements_clause: $ => seq('implements', commaSep1($.type)),

      function_expression: $ => prec(PREC.DECLARATION - 1, seq(
        optional('async'),
        'function',
        optional(field('name', $._identifier)),
        $._call_signature,
        field('body', $.statement_block),
      )),

      function_declaration: $ => prec.right(PREC.DECLARATION, seq(
        optional('async'),
        'function',
        field('name', $._identifier),
        $._call_signature,
        field('body', $.statement_block),
      )),

      generator_function: $ => prec(PREC.DECLARATION - 1, seq(
        optional('async'),
        'function',
        '*',
        optional(field('name', $._identifier)),
        $._call_signature,
        field('body', $.statement_block),
      )),

      generator_function_declaration: $ => prec.right(PREC.DECLARATION, seq(
        optional('async'),
        'function',
        '*',
        field('name', $._identifier),
        $._call_signature,
        field('body', $.statement_block),
      )),

      // An overload, or a declaration in a .d.ts file.
      function_signature: $ => prec.right(PREC.STATEMENT, seq(
        optional('async'),
        'function',
        optional('*'),
        field('name', $._identifier),
        $._call_signature,
        SEMI,
      )),

      arrow_function: $ => prec.right(PREC.ASSIGN, seq(
        optional('async'),
        choice(
          field('parameter', choice($._identifier, alias($._reserved_identifier, $.identifier))),
          $._call_signature,
        ),
        '=>',
        field('body', choice($.expression, $.statement_block)),
      )),

      _call_signature: $ => seq(
        optional(field('type_parameters', $.type_parameters)),
        field('parameters', $.formal_parameters),
        optional(field('return_type', choice(
          $.type_annotation,
          $.asserts_annotation,
          $.type_predicate_annotation,
        ))),
      ),

      call_expression: $ => choice(
        prec(PREC.CALL, seq(
          field('function', choice($.expression, $.import)),
          optional(field('type_arguments', $.type_arguments)),
          field('arguments', $.arguments),
        )),
        prec(PREC.MEMBER, seq(
          field('function', $.expression),
          optional(field('type_arguments', $.type_arguments)),
          field('arguments', $.template_string),
        )),
        prec(PREC.MEMBER, seq(
          field('function', $.primary_expression),
          field('optional_chain', $.optional_chain),
          optional(field('type_arguments', $.type_arguments)),
          field('arguments', $.arguments),
        )),
      ),

      new_expression: $ => prec.right(PREC.NEW, seq(
        'new',
        field('constructor', choice($.primary_expression, $.new_expression)),
        optional(field('type_arguments', $.type_arguments)),
        optional(field('arguments', $.arguments)),
      )),

      await_expression: $ => prec(PREC.UNARY, seq('await', $.expression)),

      member_expression: $ => prec(PREC.MEMBER, seq(
        field('object', choice($.expression, $.primary_expression)),
        choice('.', field('optional_chain', $.optional_chain)),
        field('property', choice(
          $.private_property_identifier,
          alias(reserved('properties', $.identifier), $.property_identifier),
        )),
      )),

      subscript_expression: $ => prec.right(PREC.MEMBER, seq(
        field('object', choice($.expression, $.primary_expression)),
        optional(field('optional_chain', $.optional_chain)),
        '[',
        field('index', $._expressions),
        ']',
      )),

      optional_chain: _ => '?.',

      non_null_expression: $ => prec.left(PREC.MEMBER, seq(
        $.expression,
        alias(token.immediate(prec(1, '!')), '!'),
      )),

      _lhs_expression: $ => choice(
        $.member_expression,
        $.subscript_expression,
        $._identifier,
        alias($._reserved_identifier, $.identifier),
        $._destructuring_pattern,
        $.non_null_expression,
      ),

      assignment_expression: $ => prec.right(PREC.ASSIGNMENT, seq(
        field('left', choice($.parenthesized_expression, $._lhs_expression)),
        '=',
        field('right', $.expression),
      )),

      _augmented_assignment_lhs: $ => choice(
        $.member_expression,
        $.subscript_expression,
        $._identifier,
        alias($._reserved_identifier, $.identifier),
        $.parenthesized_expression,
        $.non_null_expression,
      ),

      augmented_assignment_expression: $ => prec.right(PREC.ASSIGNMENT, seq(
        field('left', $._augmented_assignment_lhs),
        field('operator', choice(
          '+=', '-=', '*=', '/=', '%=', '^=', '&=', '|=', '>>=', '>>>=',
          '<<=', '**=', '&&=', '||=', '??=',
        )),
        field('right', $.expression),
      )),

      _initializer: $ => seq('=', field('value', $.expression)),

      _destructuring_pattern: $ => choice($.object_pattern, $.array_pattern),

      spread_element: $ => seq('...', $.expression),

      ternary_expression: $ => prec.right(PREC.TERNARY, seq(
        field('condition', $.expression),
        '?',
        field('consequence', $.expression),
        ':',
        field('alternative', $.expression),
      )),

      binary_expression: $ => choice(
        ...[
          ['&&', PREC.AND],
          ['||', PREC.OR],
          ['>>', PREC.SHIFT],
          ['>>>', PREC.SHIFT],
          ['<<', PREC.SHIFT],
          ['&', PREC.BIT_AND],
          ['^', PREC.BIT_XOR],
          ['|', PREC.BIT_OR],
          ['+', PREC.ADD],
          ['-', PREC.ADD],
          ['*', PREC.MUL],
          ['/', PREC.MUL],
          ['%', PREC.MUL],
          ['<', PREC.RELATIONAL],
          ['<=', PREC.RELATIONAL],
          ['==', PREC.EQUALITY],
          ['===', PREC.EQUALITY],
          ['!=', PREC.EQUALITY],
          ['!==', PREC.EQUALITY],
          ['>=', PREC.RELATIONAL],
          ['>', PREC.RELATIONAL],
          ['??', PREC.NULLISH],
          ['instanceof', PREC.RELATIONAL],
          ['in', PREC.RELATIONAL],
        ].map(([operator, precedence]) =>
          prec.left(precedence, seq(
            field('left', operator === 'in'
              ? choice($.expression, $.private_property_identifier)
              : $.expression),
            field('operator', operator),
            field('right', $.expression),
          )),
        ),
        prec.right(PREC.EXP, seq(
          field('left', $.expression),
          field('operator', '**'),
          field('right', $.expression),
        )),
      ),

      unary_expression: $ => prec.left(PREC.UNARY, seq(
        field('operator', choice('!', '~', '-', '+', 'typeof', 'void', 'delete')),
        field('argument', $.expression),
      )),

      update_expression: $ => prec.left(PREC.UPDATE, choice(
        seq(
          field('argument', $.expression),
          field('operator', choice('++', '--')),
        ),
        seq(
          field('operator', choice('++', '--')),
          field('argument', $.expression),
        ),
      )),

      sequence_expression: $ => prec.right(PREC.COMMA, seq(
        field('left', $.expression),
        ',',
        field('right', choice($.sequence_expression, $.expression)),
      )),

      as_expression: $ => prec.left(PREC.RELATIONAL, seq(
        $.expression,
        'as',
        choice(alias('const', $.type_identifier), $.type),
      )),

      satisfies_expression: $ => prec.left(PREC.RELATIONAL, seq(
        $.expression,
        'satisfies',
        $.type,
      )),

      // `f<T>` without a call.
      instantiation_expression: $ => prec.dynamic(-1, prec(PREC.NEW, seq(
        $.expression,
        field('type_arguments', $.type_arguments),
      ))),

      type_assertion: $ => prec.left(PREC.UNARY, seq(
        $.type_arguments,
        $.expression,
      )),

      arguments: $ => seq(
        '(',
        commaSep(optional(choice($.expression, $.spread_element))),
        ')',
      ),

      decorator: $ => seq(
        '@',
        choice(
          $._identifier,
          alias($.decorator_member_expression, $.member_expression),
          alias($.decorator_call_expression, $.call_expression),
          alias($.decorator_parenthesized_expression, $.parenthesized_expression),
        ),
      ),

      decorator_member_expression: $ => prec(PREC.MEMBER, seq(
        field('object', choice($._identifier, alias($.decorator_member_expression, $.member_expression))),
        '.',
        field('property', alias(reserved('properties', $.identifier), $.property_identifier)),
      )),

      decorator_call_expression: $ => prec(PREC.CALL, seq(
        field('function', choice($._identifier, alias($.decorator_member_expression, $.member_expression))),
        optional(field('type_arguments', $.type_arguments)),
        field('arguments', $.arguments),
      )),

      decorator_parenthesized_expression: $ => seq('(', $.expression, ')'),

      meta_property: _ => choice(
        seq('new', '.', 'target'),
        seq('import', '.', choice('meta', 'source', 'defer')),
      ),

      import: _ => token('import'),

      // ------------------------------------------------------------------
      // Functions and classes
      // ------------------------------------------------------------------

      formal_parameters: $ => seq(
        '(',
        optional(seq(commaSep1($._formal_parameter), optional(','))),
        ')',
      ),

      _formal_parameter: $ => choice($.required_parameter, $.optional_parameter),

      required_parameter: $ => seq(
        $._parameter_name,
        optional(field('type', $.type_annotation)),
        optional($._initializer),
      ),

      optional_parameter: $ => seq(
        $._parameter_name,
        '?',
        optional(field('type', $.type_annotation)),
        optional($._initializer),
      ),

      _parameter_name: $ => seq(
        repeat(field('decorator', $.decorator)),
        optional($.accessibility_modifier),
        optional($.override_modifier),
        optional('readonly'),
        field('pattern', choice(
          $.identifier,
          alias($._reserved_identifier, $.identifier),
          alias($._predefined_type_name, $.identifier),
          $._destructuring_pattern,
          alias($._rest_parameter, $.rest_pattern),
          $.this,
        )),
      ),

      _rest_parameter: $ => seq('...', choice(
        $.identifier,
        alias($._reserved_identifier, $.identifier),
        $._destructuring_pattern,
      )),

      pattern: $ => prec.dynamic(-1, choice($._lhs_expression, $.rest_pattern)),

      rest_pattern: $ => seq('...', $._lhs_expression),

      class_body: $ => seq(
        '{',
        repeat(choice(
          seq(field('member', $.method_definition), optional(';')),
          seq(field('member', $.method_signature), SEMI),
          field('member', $.class_static_block),
          seq(
            field('member', choice(
              $.index_signature,
              $.public_field_definition,
            )),
            SEMI,
          ),
          ';',
        )),
        '}',
      ),

      class_static_block: $ => seq('static', field('body', $.statement_block)),

      _member_modifiers: $ => repeat1(choice(
        $.accessibility_modifier,
        'static',
        $.override_modifier,
        'readonly',
        'declare',
        'accessor',
        'abstract',
      )),

      public_field_definition: $ => prec.right(PREC.STATEMENT, seq(
        repeat(field('decorator', $.decorator)),
        optional($._member_modifiers),
        field('name', $._property_name),
        optional(choice('?', '!')),
        optional(field('type', $.type_annotation)),
        optional($._initializer),
      )),

      method_definition: $ => prec.left(seq(
        repeat(field('decorator', $.decorator)),
        optional($._member_modifiers),
        optional('async'),
        optional(choice('get', 'set', '*')),
        field('name', $._property_name),
        optional('?'),
        $._call_signature,
        field('body', $.statement_block),
      )),

      _object_method: $ => seq(
        optional('async'),
        optional(choice('get', 'set', '*')),
        field('name', $._property_name),
        optional('?'),
        $._call_signature,
        field('body', $.statement_block),
      ),

      method_signature: $ => seq(
        repeat(field('decorator', $.decorator)),
        optional($._member_modifiers),
        optional('async'),
        optional(choice('get', 'set', '*')),
        field('name', choice($._property_name, alias('new', $.property_identifier))),
        optional('?'),
        $._call_signature,
      ),

      accessibility_modifier: _ => choice('public', 'private', 'protected'),

      override_modifier: _ => 'override',

      pair: $ => seq(
        field('key', $._property_name),
        ':',
        field('value', $.expression),
      ),

      pair_pattern: $ => seq(
        field('key', $._property_name),
        ':',
        field('value', choice($.pattern, $.assignment_pattern)),
      ),

      _property_name: $ => prec(PREC.STATEMENT - 1, choice(
        alias(
          choice(reserved('properties', $.identifier), $._reserved_identifier),
          $.property_identifier,
        ),
        $.private_property_identifier,
        $.string,
        $.number,
        $.computed_property_name,
      )),

      computed_property_name: $ => seq('[', $.expression, ']'),



      // ------------------------------------------------------------------
      // TypeScript declarations
      // ------------------------------------------------------------------

      module: $ => seq('module', $._module),

      internal_module: $ => seq('namespace', $._module),

      _module: $ => prec.right(seq(
        field('name', choice($.string, $.identifier, $.nested_identifier)),
        optional($.import_attribute),
        optional(field('body', $.statement_block)),
      )),

      ambient_declaration: $ => prec.right(seq(
        'declare',
        choice(
          $.declaration,
          seq('global', $.statement_block),
          seq('module', '.', alias($.identifier, $.property_identifier), ':', $.type, SEMI),
        ),
      )),

      type_alias_declaration: $ => prec.right(PREC.STATEMENT, seq(
        'type',
        field('name', $._type_identifier),
        optional(field('type_parameters', $.type_parameters)),
        '=',
        field('value', $.type),
        SEMI,
      )),

      enum_declaration: $ => seq(
        optional('const'),
        'enum',
        field('name', $._identifier),
        field('body', $.enum_body),
      ),

      enum_body: $ => seq(
        '{',
        commaSep(optional(choice(
          field('name', $._property_name),
          $.enum_assignment,
        ))),
        '}',
      ),

      enum_assignment: $ => seq(
        field('name', $._property_name),
        $._initializer,
      ),

      interface_declaration: $ => seq(
        'interface',
        field('name', $._type_identifier),
        optional(field('type_parameters', $.type_parameters)),
        optional($.extends_type_clause),
        field('body', alias($.object_type, $.interface_body)),
      ),

      extends_type_clause: $ => seq(
        'extends',
        commaSep1(field('type', choice(
          $._type_identifier,
          $.nested_type_identifier,
          $.generic_type,
        ))),
      ),

      nested_identifier: $ => seq(
        field('object', choice($.identifier, $.import_type, alias($.nested_identifier, $.member_expression))),
        '.',
        field('property', alias(reserved('properties', $.identifier), $.property_identifier)),
      ),

      // ------------------------------------------------------------------
      // Types
      // ------------------------------------------------------------------

      type_annotation: $ => seq(':', $.type),

      asserts: $ => seq('asserts', choice($.type_predicate, $.identifier, $.this)),

      asserts_annotation: $ => seq(':', $.asserts),

      type_predicate: $ => seq(
        field('name', choice($.identifier, $.this)),
        'is',
        field('type', $.type),
      ),

      type_predicate_annotation: $ => seq(':', $.type_predicate),

      // A type followed by `[` keeps both readings: `T[]` and `T[K]`, or the
      // end of a member before an index signature or computed name on the
      // next line (`a: T⏎[k: string]: U`), which TypeScript allows because a
      // type does not continue across a line break before `[`.
      type: $ => choice(
        prec(PREC.ARRAY_TYPE, $.primary_type),
        $.function_type,
        $.readonly_type,
        $.index_type_query,
        $.constructor_type,
        $.infer_type,
        $.union_type,
        $.intersection_type,
        $.conditional_type,
      ),

      primary_type: $ => choice(
        $.import_type,
        $.parenthesized_type,
        $.predefined_type,
        $._type_identifier,
        $.nested_type_identifier,
        $.generic_type,
        $.object_type,
        $.array_type,
        $.tuple_type,
        $.lookup_type,
        $.literal_type,
        $.type_query,
        $.this_type,
        $.template_literal_type,
      ),

      parenthesized_type: $ => seq('(', $.type, ')'),

      predefined_type: _ => choice(
        ...PREDEFINED_TYPES.filter(t => t !== 'symbol'),
        seq(optional('unique'), 'symbol'),
      ),

      this_type: _ => 'this',

      // `import("./a")`, optionally with attributes.
      import_type: $ => seq(
        $.import,
        '(',
        field('source', $.string),
        optional(seq(',', $.object)),
        optional(','),
        ')',
      ),

      nested_type_identifier: $ => seq(
        field('module', choice($.identifier, $.nested_identifier, $.import_type)),
        '.',
        field('name', $._type_identifier),
      ),

      generic_type: $ => prec.dynamic(1, seq(
        field('name', choice($._type_identifier, $.nested_type_identifier)),
        field('type_arguments', $.type_arguments),
      )),

      type_arguments: $ => seq(
        '<',
        commaSep1($.type),
        optional(','),
        '>',
      ),

      type_parameters: $ => seq(
        '<',
        commaSep1($.type_parameter),
        optional(','),
        '>',
      ),

      type_parameter: $ => seq(
        optional('const'),
        optional('in'),
        optional('out'),
        field('name', $._type_identifier),
        optional(field('constraint', $.constraint)),
        optional(field('value', $.default_type)),
      ),

      constraint: $ => seq('extends', $.type),

      default_type: $ => seq('=', $.type),

      object_type: $ => seq(
        '{',
        optional(choice(',', ';')),
        repeat(seq(
          choice(
            $.property_signature,
            $.call_signature,
            $.construct_signature,
            $.index_signature,
            $.method_signature,
          ),
          optional(choice(',', ';')),
        )),
        '}',
      ),

      property_signature: $ => prec.right(seq(
        optional($._member_modifiers),
        field('name', choice($._property_name, alias('new', $.property_identifier))),
        optional('?'),
        optional(field('type', $.type_annotation)),
      )),

      call_signature: $ => $._call_signature,

      construct_signature: $ => seq(
        optional('abstract'),
        'new',
        optional(field('type_parameters', $.type_parameters)),
        field('parameters', $.formal_parameters),
        optional(field('type', $.type_annotation)),
      ),

      index_signature: $ => seq(
        optional(choice(
          seq(field('sign', choice('-', '+')), 'readonly'),
          $._member_modifiers,
        )),
        '[',
        choice(
          seq(
            field('name', choice($.identifier, alias($._reserved_identifier, $.identifier))),
            ':',
            field('index_type', $.type),
          ),
          $.mapped_type_clause,
        ),
        ']',
        optional(field('type', choice(
          $.type_annotation,
          alias($._omitting_type_annotation, $.omitting_type_annotation),
          alias($._adding_type_annotation, $.adding_type_annotation),
          alias($._opting_type_annotation, $.opting_type_annotation),
        ))),
      ),

      _omitting_type_annotation: $ => seq('-?:', $.type),
      _adding_type_annotation: $ => seq('+?:', $.type),
      _opting_type_annotation: $ => seq('?:', $.type),

      mapped_type_clause: $ => prec(1, seq(
        field('name', $._type_identifier),
        'in',
        field('type', $.type),
        optional(seq('as', field('alias', $.type))),
      )),

      array_type: $ => prec(PREC.ARRAY_TYPE, seq($.primary_type, '[', ']')),

      lookup_type: $ => prec(PREC.ARRAY_TYPE, seq($.primary_type, '[', $.type, ']')),

      tuple_type: $ => seq(
        '[',
        optional(seq(commaSep1($._tuple_type_member), optional(','))),
        ']',
      ),

      _tuple_type_member: $ => choice(
        alias($.tuple_parameter, $.required_parameter),
        alias($.optional_tuple_parameter, $.optional_parameter),
        $.optional_type,
        $.rest_type,
        $.type,
      ),

      tuple_parameter: $ => seq(
        field('name', choice($.identifier, alias($._reserved_identifier, $.identifier), alias($._predefined_type_name, $.identifier), alias($._rest_parameter, $.rest_pattern))),
        field('type', $.type_annotation),
      ),

      optional_tuple_parameter: $ => seq(
        field('name', choice($.identifier, alias($._reserved_identifier, $.identifier), alias($._predefined_type_name, $.identifier))),
        '?',
        field('type', $.type_annotation),
      ),

      optional_type: $ => seq($.type, '?'),

      rest_type: $ => seq('...', $.type),

      union_type: $ => prec.left(PREC.UNION, seq(optional($.type), '|', $.type)),

      intersection_type: $ => prec.left(PREC.INTERSECTION, seq(optional($.type), '&', $.type)),

      conditional_type: $ => prec.right(PREC.CONDITIONAL_TYPE, seq(
        field('left', $.type),
        'extends',
        field('right', $.type),
        '?',
        field('consequence', $.type),
        ':',
        field('alternative', $.type),
      )),

      function_type: $ => prec.right(PREC.FUNCTION_TYPE, seq(
        optional(field('type_parameters', $.type_parameters)),
        field('parameters', $.formal_parameters),
        '=>',
        field('return_type', choice($.type, $.asserts, $.type_predicate)),
      )),

      constructor_type: $ => prec.right(PREC.FUNCTION_TYPE, seq(
        optional('abstract'),
        'new',
        optional(field('type_parameters', $.type_parameters)),
        field('parameters', $.formal_parameters),
        '=>',
        field('type', $.type),
      )),

      readonly_type: $ => prec(PREC.TYPE_OPERATOR, seq('readonly', $.type)),

      index_type_query: $ => prec(PREC.TYPE_OPERATOR, seq('keyof', $.type)),

      infer_type: $ => prec.right(seq(
        'infer',
        $._type_identifier,
        optional(seq('extends', $.type)),
      )),

      type_query: $ => prec.right(seq(
        'typeof',
        choice(
          $.import_type,
          alias($._type_query_member_expression, $.member_expression),
          alias($._type_query_call_expression, $.call_expression),
          $._identifier,
          $.this,
        ),
        optional(field('type_arguments', $.type_arguments)),
      )),

      _type_query_member_expression: $ => seq(
        field('object', choice(
          $._identifier,
          $.this,
          alias($._type_query_member_expression, $.member_expression),
          alias($._type_query_call_expression, $.call_expression),
        )),
        choice('.', $.optional_chain),
        field('property', choice(
          $.private_property_identifier,
          alias(reserved('properties', $.identifier), $.property_identifier),
        )),
      ),

      _type_query_call_expression: $ => seq(
        field('function', choice($.import, $._identifier)),
        field('arguments', $.arguments),
      ),

      literal_type: $ => choice(
        alias($._number, $.unary_expression),
        $.number,
        $.string,
        $.true,
        $.false,
        $.null,
        $.undefined,
      ),

      _number: $ => prec.left(1, seq(
        field('operator', choice('-', '+')),
        field('argument', $.number),
      )),

      template_literal_type: $ => seq(
        '`',
        repeat(choice(
          alias($._template_chars, $.string_fragment),
          alias($._template_dollar, $.string_fragment),
          alias($._template_slash, $.string_fragment),
          $.escape_sequence,
          $.template_type,
        )),
        '`',
      ),

      template_type: $ => seq('${', choice($.primary_type, $.infer_type, $.union_type, $.intersection_type, $.conditional_type), '}'),

      _type_identifier: $ => alias($.identifier, $.type_identifier),

      // ------------------------------------------------------------------
      // Literals and tokens
      // ------------------------------------------------------------------

      string: $ => choice(
        seq(
          '"',
          repeat(choice(
            alias($._unescaped_double_string_fragment, $.string_fragment),
            $.escape_sequence,
          )),
          '"',
        ),
        seq(
          '\'',
          repeat(choice(
            alias($._unescaped_single_string_fragment, $.string_fragment),
            $.escape_sequence,
          )),
          '\'',
        ),
      ),

      // These outrank comments, so `"//"` is a string.
      _unescaped_double_string_fragment: _ => token.immediate(prec(1, /[^"\\\r\n]+/)),
      _unescaped_single_string_fragment: _ => token.immediate(prec(1, /[^'\\\r\n]+/)),

      escape_sequence: _ => token.immediate(seq(
        '\\',
        choice(
          /[^xu0-7]/,
          /[0-7]{1,3}/,
          /x[0-9a-fA-F]{2}/,
          /u[0-9a-fA-F]{4}/,
          /u\{[0-9a-fA-F]+\}/,
          /[\r?][\n\u2028\u2029]/,
          // Invalid in strings, allowed in tagged templates.
          /[xu]/,
        ),
      )),

      // A comment is `//` to the end of the line, or `/* */`.
      comment: _ => token(choice(
        seq('//', /[^\r\n\u2028\u2029]*/),
        seq('/*', /[^*]*\*+([^/*][^*]*\*+)*/, '/'),
      )),

      // `<!--` and `-->` at the start of a line (Annex B) are line comments.
      // Only the opening form is supported.
      html_comment: _ => token(seq('<!--', /[^\r\n\u2028\u2029]*/)),

      template_string: $ => seq(
        '`',
        repeat(choice(
          alias($._template_chars, $.string_fragment),
          alias($._template_dollar, $.string_fragment),
          alias($._template_slash, $.string_fragment),
          $.escape_sequence,
          $.template_substitution,
        )),
        '`',
      ),

      // Template text up to the next `` ` ``, `\`, `${` or `/`. A `$` that
      // is right before one of those is `_template_dollar`. A `/` is a token
      // of its own that outranks comments, so `` `// ${x}` `` and
      // `` `/* ${x}` `` are templates with a substitution.
      _template_chars: _ => token.immediate(prec(1, /([^`$\\/]|\$+[^`${\\/])+/)),
      _template_dollar: _ => token.immediate('$'),
      _template_slash: _ => token.immediate(prec(1, '/')),

      template_substitution: $ => seq('${', $._expressions, '}'),

      regex: $ => seq(
        '/',
        field('pattern', $.regex_pattern),
        token.immediate(prec(1, '/')),
        optional(field('flags', $.regex_flags)),
      ),

      regex_pattern: _ => token.immediate(prec(-1,
        repeat1(choice(
          seq('[', repeat(choice(seq('\\', /./), /[^\]\n\\]/)), ']'),
          seq('\\', /./),
          /[^/\\\[\n]/,
        )),
      )),

      regex_flags: _ => token.immediate(/[a-z]+/),

      number: _ => {
        const hexLiteral = seq(choice('0x', '0X'), /[\da-fA-F](_?[\da-fA-F])*/);
        const decimalDigits = /\d(_?\d)*/;
        const signedInteger = seq(optional(choice('-', '+')), decimalDigits);
        const exponentPart = seq(choice('e', 'E'), signedInteger);
        const binaryLiteral = seq(choice('0b', '0B'), /[0-1](_?[0-1])*/);
        const octalLiteral = seq(choice('0o', '0O'), /[0-7](_?[0-7])*/);
        const bigintLiteral = seq(choice(hexLiteral, binaryLiteral, octalLiteral, decimalDigits), 'n');
        const decimalIntegerLiteral = choice(
          '0',
          seq(optional('0'), /[1-9]/, optional(seq(optional('_'), decimalDigits))),
        );
        const decimalLiteral = choice(
          seq(decimalIntegerLiteral, '.', optional(decimalDigits), optional(exponentPart)),
          seq('.', decimalDigits, optional(exponentPart)),
          seq(decimalIntegerLiteral, exponentPart),
          decimalDigits,
        );
        return token(choice(hexLiteral, decimalLiteral, binaryLiteral, octalLiteral, bigintLiteral));
      },

      identifier: _ => token(seq(ID_START, repeat(ID_CONTINUE))),

      private_property_identifier: _ => token(seq('#', ID_START, repeat(ID_CONTINUE))),

      _identifier: $ => choice($.undefined, $.identifier),

      // Contextual keywords where they are names. See CONTEXTUAL.
      _reserved_identifier: _ => prec(PREC.CONTEXTUAL, choice(...CONTEXTUAL)),

      // Predefined type names where they are parameter names: `(string: any) => T`.
      _predefined_type_name: _ => prec(PREC.CONTEXTUAL, choice(
        ...PREDEFINED_TYPES.filter(t => t !== 'void'),
      )),

      this: _ => 'this',
      super: _ => 'super',
      true: _ => 'true',
      false: _ => 'false',
      null: _ => 'null',
      undefined: _ => 'undefined',

      ...jsxRules(),
    },
});

/**
 * JSX.
 */
function jsxRules() {
  return {
    jsx_element: $ => seq(
      field('open_tag', $.jsx_opening_element),
      repeat($._jsx_child),
      field('close_tag', $.jsx_closing_element),
    ),

    _jsx_child: $ => choice(
      $.jsx_text,
      $.html_character_reference,
      $.jsx_element,
      $.jsx_self_closing_element,
      $.jsx_expression,
    ),

    // Text between tags, without the whitespace around it. It outranks
    // comments: `<p>// x</p>` is text.
    jsx_text: _ => token(prec(1, /[^{}<>&\s]([^{}<>&]*[^{}<>&\s])?/)),

    html_character_reference: _ => token(prec(1, /&(#([xX][0-9a-fA-F]{1,6}|[0-9]{1,7})|[A-Za-z][A-Za-z0-9]{0,31});/)),

    jsx_expression: $ => seq(
      '{',
      optional(choice($._expressions, $.spread_element)),
      '}',
    ),

    _jsx_start_opening_element: $ => seq(
      '<',
      field('name', $._jsx_element_name),
      optional(field('type_arguments', $.type_arguments)),
      repeat(field('attribute', $._jsx_attribute)),
    ),

    // `<>` opens a fragment.
    jsx_opening_element: $ => prec.dynamic(-1, choice(
      seq('<', '>'),
      seq($._jsx_start_opening_element, '>'),
    )),

    jsx_closing_element: $ => seq('<', '/', optional(field('name', $._jsx_element_name)), '>'),

    jsx_self_closing_element: $ => seq($._jsx_start_opening_element, '/', '>'),

    _jsx_element_name: $ => choice(
      $._jsx_identifier,
      alias($.jsx_member_expression, $.member_expression),
      $.jsx_namespace_name,
    ),

    // `Foo.Bar`, `this.tag`
    jsx_member_expression: $ => seq(
      field('object', choice($.identifier, $.this, alias($.jsx_member_expression, $.member_expression))),
      '.',
      field('property', alias(reserved('properties', $.identifier), $.property_identifier)),
    ),

    _jsx_identifier: $ => choice(
      alias($._jsx_dashed_identifier, $.identifier),
      $.identifier,
    ),

    // `data-x`, `my-element`: a name with at least one `-`.
    _jsx_dashed_identifier: _ => token(seq(ID_START, repeat(ID_CONTINUE), repeat1(seq('-', repeat(ID_CONTINUE))))),

    jsx_namespace_name: $ => seq($._jsx_identifier, ':', $._jsx_identifier),

    _jsx_attribute: $ => choice($.jsx_attribute, $.jsx_expression),

    jsx_attribute: $ => seq(
      choice(
        alias(choice(reserved('properties', $.identifier), $._jsx_dashed_identifier), $.property_identifier),
        $.jsx_namespace_name,
      ),
      optional(seq('=', $._jsx_attribute_value)),
    ),

    _jsx_attribute_value: $ => choice(
      alias($._jsx_string, $.string),
      $.jsx_expression,
      $.jsx_element,
      $.jsx_self_closing_element,
    ),

    // JSX attribute strings have no escapes; `\` is a plain character.
    _jsx_string: $ => choice(
      seq('"', repeat(choice(alias(token.immediate(prec(1, /[^"&]+/)), $.string_fragment), $.html_character_reference)), '"'),
      seq('\'', repeat(choice(alias(token.immediate(prec(1, /[^'&]+/)), $.string_fragment), $.html_character_reference)), '\''),
    ),
  };
}

/**
 * @param {RuleOrLiteral} rule
 */
function commaSep1(rule) {
  return seq(rule, repeat(seq(',', rule)));
}

/**
 * @param {RuleOrLiteral} rule
 */
function commaSep(rule) {
  return optional(commaSep1(rule));
}
