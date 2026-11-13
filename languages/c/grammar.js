/**
 * @file C grammar for tree-sitter
 * @license MIT
 *
 * C23 (ISO/IEC 9899:2024, Annex A), plus the GNU, Clang and MSVC extensions
 * that system headers and real code depend on. There is no external scanner.
 *
 * Two things in C are not context-free, and both are handled here without one:
 *
 * - Typedef names. Whether `a * b;` declares `b` or multiplies depends on
 *   whether `a` names a type. The grammar keeps both readings (GLR) and picks
 *   one with dynamic precedence: declarations over expression statements,
 *   casts over parenthesized expressions, calls over declarations of a
 *   parenthesized name (`f(x);`).
 *
 * - The preprocessor. Directives are line-based and may appear anywhere, so
 *   each directive is an extra: one node per line (`#if X`, `#else`,
 *   `#endif`, `#define ...`), and the code between them is parsed as if the
 *   directives were not there. Every branch of an `#if` is parsed in
 *   sequence, which works as long as the branches together form valid C
 *   (the common case: whole items or statements in each branch).
 *
 * The newline that ends a directive is an ordinary token that is also listed
 * as an extra: where the parser expects it (at the end of a directive) it is
 * shifted, and everywhere else it is skipped like other whitespace.
 *
 * Code that uses macros parses without errors when the macros are used in
 * the usual places. An identifier (or `NAME(args)`) is also accepted:
 *
 * - among declaration specifiers and after `*`: `SQLITE_API int f(void);`,
 *   `char *CONST p;`, `(__force u32)x`,
 * - after a declarator: `int f(void) __THROW __nonnull((1));`,
 * - as a type: `ElfW(Addr) a;`,
 * - as a statement or member without a semicolon or type:
 *   `SWAP(a, b)`, `static DEFINE_MUTEX(lock);`, `DECLARE_BITMAP(bits, N);`.
 *
 * Each of these readings has negative dynamic precedence, so it is only
 * chosen when nothing else parses.
 */

/// <reference types="tree-sitter-cli/dsl" />
// @ts-check

const PREC = {
  PAREN_DECLARATOR: -10,
  ASSIGNMENT: -2,
  CONDITIONAL: -1,
  DEFAULT: 0,
  LOGICAL_OR: 1,
  LOGICAL_AND: 2,
  INCLUSIVE_OR: 3,
  EXCLUSIVE_OR: 4,
  BITWISE_AND: 5,
  EQUAL: 6,
  RELATIONAL: 7,
  SHIFT: 8,
  ADD: 9,
  MULTIPLY: 10,
  CAST: 11,
  UNARY: 12,
  SIZEOF: 13,
  POSTFIX: 14,
};

const BINARY_OPERATORS = [
  ['||', PREC.LOGICAL_OR],
  ['&&', PREC.LOGICAL_AND],
  ['|', PREC.INCLUSIVE_OR],
  ['^', PREC.EXCLUSIVE_OR],
  ['&', PREC.BITWISE_AND],
  ['==', PREC.EQUAL],
  ['!=', PREC.EQUAL],
  ['<', PREC.RELATIONAL],
  ['>', PREC.RELATIONAL],
  ['<=', PREC.RELATIONAL],
  ['>=', PREC.RELATIONAL],
  ['<<', PREC.SHIFT],
  ['>>', PREC.SHIFT],
  ['+', PREC.ADD],
  ['-', PREC.ADD],
  ['*', PREC.MULTIPLY],
  ['/', PREC.MULTIPLY],
  ['%', PREC.MULTIPLY],
];

const ASSIGNMENT_OPERATORS = ['=', '*=', '/=', '%=', '+=', '-=', '<<=', '>>=', '&=', '^=', '|='];

// Type keywords that name a whole type on their own.
const PRIMITIVE_TYPES = [
  'void', 'char', 'int', 'float', 'double', 'bool', '_Bool',
  '__int128', '__int8', '__int16', '__int32', '__int64',
  '_Float16', '_Float32', '_Float64', '_Float128', '_Float32x', '_Float64x', '_Float128x',
  '__float80', '__float128', '__ibm128', '__fp16', '__bf16',
  '_Decimal32', '_Decimal64', '_Decimal128',
];

// Type keywords that modify another (`unsigned long int`, `double _Complex`).
const SIZE_MODIFIERS = [
  'signed', 'unsigned', 'short', 'long', '__signed', '__signed__',
  '_Complex', '__complex', '__complex__', '_Imaginary',
];

const STORAGE_CLASSES = [
  'extern', 'static', 'auto', 'register', 'thread_local', '_Thread_local', '__thread',
  'constexpr', 'inline', '__inline', '__inline__', '__forceinline', '_Noreturn',
];

const TYPE_QUALIFIERS = [
  'const', 'volatile', 'restrict', '_Atomic',
  '__const', '__volatile', '__volatile__', '__restrict', '__restrict__',
  '_Nonnull', '_Nullable', '_Null_unspecified', '__unaligned',
];

const MS_CALL_MODIFIERS = [
  '__cdecl', '__clrcall', '__stdcall', '__fastcall', '__thiscall', '__vectorcall',
];

const MS_POINTER_MODIFIERS = ['__ptr32', '__ptr64', '__sptr', '__uptr'];

const ASM_KEYWORDS = ['asm', '__asm', '__asm__'];

// Keywords that C23 added and that older code commonly defines itself
// (`typedef int bool;`, `enum { false, true };`, `#define alignof ...`).
// They are accepted as names where a new name is being declared.
const C23_KEYWORDS = [
  'bool', 'true', 'false', 'nullptr', 'alignas', 'alignof', 'static_assert',
  'thread_local', 'typeof', 'typeof_unqual', 'constexpr',
];

const KEYWORDS = [
  ...PRIMITIVE_TYPES, ...SIZE_MODIFIERS, ...STORAGE_CLASSES, ...TYPE_QUALIFIERS,
  ...MS_CALL_MODIFIERS, ...MS_POINTER_MODIFIERS, ...ASM_KEYWORDS,
  'typedef', 'struct', 'union', 'enum',
  'if', 'else', 'switch', 'case', 'default', 'while', 'do', 'for',
  'goto', 'continue', 'break', 'return',
  'sizeof', 'alignof', '_Alignof', '__alignof', '__alignof__', 'alignas', '_Alignas',
  'typeof', 'typeof_unqual', '__typeof', '__typeof__', '__typeof_unqual', '__typeof_unqual__',
  '_Generic', 'static_assert', '_Static_assert', '_BitInt',
  '__attribute', '__attribute__', '__declspec', '__based', '__extension__',
  '__real', '__real__', '__imag', '__imag__',
  'true', 'false', 'nullptr', 'NULL',
];

// One character of a directive's unparsed text: anything but a newline, a
// backslash-escaped character or line continuation, a `/` that does not start
// a comment, or a quoted literal (which may contain `//`). A lone quote is
// allowed too, for apostrophes in `#error don't`.
const PP_QUOTED = String.raw`"([^"\\\r\n]|\\[^\r\n])*"|'([^'\\\r\n]|\\[^\r\n])*'`;
const PP_ARG_CHAR = String.raw`[^\\/\r\n]|\\\r?\n|\\[^\r\n]|/[^/*\r\n]|${PP_QUOTED}`;
const PP_ARG_START = String.raw`[^\s\\/]|\\\r?\n|\\[^\r\n]|/[^/*\s]|${PP_QUOTED}`;

module.exports = grammar({
  name: 'c',

  word: $ => $.identifier,

  extras: $ => [
    /[ \t\f\v\r]|\\\r?\n/,
    $._preproc_newline,
    $.comment,
    $.preproc_include,
    $.preproc_def,
    $.preproc_function_def,
    $.preproc_call,
    $.preproc_if,
    $.preproc_ifdef,
    $.preproc_elif,
    $.preproc_elifdef,
    $.preproc_else,
    $.preproc_endif,
  ],

  reserved: {
    global: _ => KEYWORDS,
    // Macro names and preprocessor conditions: `#define bool _Bool`,
    // `#ifdef inline`, `__has_attribute(const)`.
    preproc: _ => [],
    // Names being declared, where pre-C23 code uses C23 keywords.
    declared_name: _ => KEYWORDS.filter((k) => !C23_KEYWORDS.includes(k)),
  },

  supertypes: $ => [
    $._expression,
    $._statement,
    $._type_specifier,
    $._declarator,
    $._field_declarator,
    $._type_declarator,
    $._abstract_declarator,
  ],

  inline: $ => [
    $._top_level_item,
    $._block_item,
    $._field_declaration_list_item,
    $._string,
    $._full_expression,
  ],

  // Nearly every conflict comes from one fact: an identifier can be a
  // variable, a typedef name, the name being declared, or a macro standing in
  // for a specifier, an attribute, a type or a whole statement. Each is kept
  // as a GLR fork and resolved by dynamic precedence; see the top of the file.
  conflicts: $ => [
    [$._field_declarator_inner, $._field_attributed_declarator], // AUTO: 'struct'  '{'  _declaration_specifiers  _field_function_declarator  •  '__attribute__'  …
    [$._type_declarator_inner, $._type_attributed_declarator], // AUTO: 'typedef'  _declaration_specifiers  _type_function_declarator  •  '__attribute__'  …
    [$._declarator_inner, $.attributed_declarator], // AUTO: function_declarator  •  '__attribute__'  …
    [$._type_identifier, $._expression],
    [$._type_identifier, $._declarator_inner],
    [$._type_identifier, $._macro_statement],
    [$._declarator, $.attributed_declarator],
    [$._declarator_inner, $._expression],
    [$._declarator_inner, $._macro_statement],
    [$._declarator_inner, $._macro_call],
    [$.macro_type_specifier, $._type_identifier],
    [$.macro_type_specifier, $._argument],
    [$._macro_modifier, $._type_identifier],
    [$._macro_modifier, $._expression],
    [$._macro_modifier, $._declarator_inner],
    [$._macro_modifier, $._type_declarator_inner],
    [$._macro_modifier, $._field_identifier],
    [$._macro_attribute, $._type_identifier],
    [$._macro_attribute, $._declarator_inner],
    [$._macro_attribute, $._macro_statement],
    [$._trailing_macro_attribute, $._macro_call],
    [$._macro_statement, $._expression],
    [$._macro_statement, $.concatenated_string],
    [$._macro_call, $._expression],
    [$._type_identifier, $._declarator_inner, $._expression],
    [$._type_identifier, $._macro_statement, $._expression],
    [$.macro_type_specifier, $._type_identifier, $._expression],
    [$.macro_type_specifier, $._type_identifier, $._macro_call],
    [$._macro_modifier, $._type_identifier, $._expression],
    [$._macro_modifier, $._declarator_inner, $._expression],
    [$._macro_modifier, $._macro_attribute, $._type_identifier],
    [$._macro_attribute, $._type_identifier, $._expression],
    [$._macro_attribute, $._type_identifier, $._declarator_inner],
    [$._macro_attribute, $._type_identifier, $._macro_statement],
    [$._macro_attribute, $._declarator_inner, $._macro_statement],
    [$._macro_statement, $._macro_call, $._expression],
    [$.macro_type_specifier, $._type_identifier, $._declarator_inner, $._macro_call],
    [$.macro_type_specifier, $._type_identifier, $._macro_call, $._expression],
    [$._macro_attribute, $._type_identifier, $._declarator_inner, $._macro_statement],
    [$._macro_attribute, $._type_identifier, $._macro_statement, $._expression],
    [$.macro_type_specifier, $._type_identifier, $._macro_statement, $._macro_call, $._expression],
    [$._macro_modifier, $.macro_type_specifier, $._type_identifier, $._declarator_inner, $._expression],
    [$._macro_modifier, $.macro_type_specifier, $._type_identifier, $._declarator_inner, $._macro_call],
    [$._macro_attribute, $._type_identifier, $._declarator_inner, $._macro_statement, $._expression],
    [$.macro_type_specifier, $._type_identifier, $._declarator_inner, $._macro_statement, $._macro_call, $._expression],

    // A type followed by an identifier: the declarator, or a macro modifier
    // with the declarator still to come (`void NOINLINE f(void)`).
    [$._declaration_specifiers],
    // `static const x = 1;` (implicit int) or a declaration still waiting
    // for its type.
    [$.declaration, $._declaration_modifier],
    // `[[x]]` at the start of a block item: a declaration or a statement.
    [$._declaration_modifier, $.attributed_statement],

    // Modifiers that can start a parenthesized declarator, a parameter list,
    // a cast, or an abstract declarator: `(__cdecl *f)(void)`,
    // `(__attribute__((x)) T)`, `(T *CONST)`.
    [$.type_descriptor, $._paren_declarator_modifier],
    [$.abstract_pointer_declarator, $._pointer_modifier],
    [$.abstract_parenthesized_declarator, $._paren_declarator_modifier],
    [$._declaration_modifier, $._abstract_paren_declarator_modifier],
    [$._descriptor_modifier, $._abstract_paren_declarator_modifier],
  ],

  rules: {
    translation_unit: $ => repeat($._top_level_item),

    _top_level_item: $ => choice(
      $.function_definition,
      $.declaration,
      $.type_definition,
      $.static_assert_declaration,
      $.linkage_specification,
      $.asm_statement,
      // Macro invocations such as `EXPORT_SYMBOL(f);` at file scope.
      $.expression_statement,
      alias($._macro_statement, $.expression_statement),
    ),

    // ------------------------------------------------------------------
    // Declarations
    // ------------------------------------------------------------------

    function_definition: $ => seq(
      // Missing in K&R-style `main() { ... }` (implicit int).
      optional($._declaration_specifiers),
      field('declarator', $._declarator),
      // K&R parameter declarations: `int f(a, b) int a; char *b; { ... }`.
      repeat(field('parameter_declaration', alias($._old_style_parameter_declaration, $.declaration))),
      field('body', $.compound_statement),
    ),

    _old_style_parameter_declaration: $ => seq(
      repeat(choice($.storage_class_specifier, $.type_qualifier)),
      field('type', $._type_specifier),
      repeat($.type_qualifier),
      commaSep1(field('declarator', $._declarator)),
      ';',
    ),

    declaration: $ => choice(
      prec.dynamic(1, seq(
        $._declaration_specifiers,
        optional(commaSep1(field('declarator', choice($._declarator, $.init_declarator)))),
        ';',
      )),
      // No type: C89 implicit int, C23 `auto x = 1;`, and macros that
      // declare something, as in `static DEFINE_MUTEX(lock);`.
      seq(
        $.storage_class_specifier,
        repeat(choice($.storage_class_specifier, $.type_qualifier, $.attribute_specifier)),
        choice(
          commaSep1(field('declarator', choice($._declarator, $.init_declarator))),
          // `static DEFINE_SEMAPHORE(sem, 1);`, whose arguments are not
          // parameters.
          prec.dynamic(1, seq(
            field('declarator', alias($._macro_call, $.call_expression)),
            optional(seq('=', field('value', choice($.initializer_list, $._expression)))),
          )),
        ),
        ';',
      ),
    ),

    type_definition: $ => seq(
      optional('__extension__'),
      'typedef',
      $._declaration_specifiers,
      commaSep1(field('declarator', $._type_declarator)),
      ';',
    ),

    linkage_specification: $ => seq(
      'extern',
      field('value', $.string_literal),
      field('body', choice(
        $.function_definition,
        $.declaration,
        $.declaration_list,
      )),
    ),

    declaration_list: $ => seq('{', repeat($._top_level_item), '}'),

    static_assert_declaration: $ => seq(
      choice('static_assert', '_Static_assert'),
      '(',
      field('condition', $._expression),
      optional(seq(',', field('message', $._string))),
      ')',
      ';',
    ),

    _declaration_specifiers: $ => seq(
      repeat(choice($._declaration_modifier, $._macro_attribute)),
      field('type', $._type_specifier),
      repeat(choice($._declaration_modifier, $._trailing_macro_attribute)),
    ),

    // An identifier where a specifier or qualifier would go, almost always a
    // macro that expands to one: `SQLITE_API int f(void);`,
    // `static void NOINLINE g(void)`, `char *CONST p;`. A reading without it
    // wins when there is one.
    _macro_modifier: $ => prec.dynamic(-1, alias($.identifier, $.macro_modifier)),

    // Before the type and after a declarator, the macro may take arguments:
    // `static ATTRIBUTE((noinline)) int f(void);`,
    // `char *gettext(const char *) __fa(1);`, `int f(int) __THROW;`.
    _macro_attribute: $ => prec.dynamic(-1, choice(
      alias($.identifier, $.macro_modifier),
      alias($._macro_call, $.macro_modifier),
    )),

    // After a declarator that is not a function, a lone macro is less likely
    // than one between the type and a function's name, and a macro call is
    // least likely: `int x __read_mostly;` but `void __init f(void);`.
    _object_macro_attribute: $ => choice(
      prec.dynamic(-2, alias($.identifier, $.macro_modifier)),
      prec.dynamic(-4, alias($._macro_call, $.macro_modifier)),
    ),

    // Between the type and the declarator: `static void NOINLINE f(void)`.
    _trailing_macro_attribute: $ => prec.dynamic(-3, choice(
      alias($.identifier, $.macro_modifier),
      alias($._macro_call, $.macro_modifier),
    )),

    // In a type name, `(__force u32)x` has the type last.
    _trailing_macro_modifier: $ => prec.dynamic(-2, alias($.identifier, $.macro_modifier)),

    // A macro that expands to a type: `ElfW(Addr) a;`.
    macro_type_specifier: $ => prec.dynamic(-1, seq(
      field('name', $.identifier),
      '(',
      field('type', $.type_descriptor),
      ')',
    )),

    _declaration_modifier: $ => choice(
      $.storage_class_specifier,
      $.type_qualifier,
      $.attribute_specifier,
      $.attribute_declaration,
      $.ms_declspec_modifier,
      $.ms_call_modifier,
      $.alignas_specifier,
      '__extension__',
    ),

    storage_class_specifier: _ => choice(...STORAGE_CLASSES),

    type_qualifier: _ => choice(...TYPE_QUALIFIERS),

    ms_call_modifier: _ => choice(...MS_CALL_MODIFIERS),

    ms_pointer_modifier: _ => choice(...MS_POINTER_MODIFIERS),

    ms_based_modifier: $ => seq('__based', $.argument_list),

    ms_declspec_modifier: $ => seq('__declspec', '(', repeat($.attribute), ')'),

    alignas_specifier: $ => seq(
      choice('alignas', '_Alignas'),
      '(',
      choice($._expression, $.type_descriptor),
      ')',
    ),

    // __attribute__((a, b(1)))
    attribute_specifier: $ => seq(
      choice('__attribute__', '__attribute'),
      '(', '(',
      commaSep(optional($.attribute)),
      ')', ')',
    ),

    // [[a, gnu::b(1)]]
    attribute_declaration: $ => seq(
      '[', '[',
      commaSep(optional($.attribute)),
      ']', ']',
    ),

    attribute: $ => seq(
      optional(seq(field('prefix', $._attribute_name), '::')),
      field('name', $._attribute_name),
      optional(field('arguments', $.argument_list)),
    ),

    _attribute_name: $ => reserved('preproc', $.identifier),

    init_declarator: $ => seq(
      field('declarator', $._declarator),
      '=',
      field('value', choice($.initializer_list, $._expression)),
    ),

    // ------------------------------------------------------------------
    // Types
    // ------------------------------------------------------------------

    _type_specifier: $ => choice(
      $.struct_specifier,
      $.union_specifier,
      $.enum_specifier,
      $.sized_type_specifier,
      $.primitive_type,
      $.bitint_type,
      $.atomic_type,
      $.typeof_specifier,
      $.macro_type_specifier,
      $._type_identifier,
    ),

    primitive_type: _ => choice(...PRIMITIVE_TYPES),

    // `unsigned`, `long double`, `unsigned long long int`, `int unsigned`.
    sized_type_specifier: $ => prec.right(choice(
      seq(
        repeat1($._size_modifier),
        optional(seq(field('type', choice($.primitive_type, $.bitint_type)), repeat($._size_modifier))),
      ),
      seq(field('type', $.primitive_type), repeat1($._size_modifier)),
    )),

    _size_modifier: _ => choice(...SIZE_MODIFIERS),

    bitint_type: $ => seq('_BitInt', '(', field('width', $._expression), ')'),

    atomic_type: $ => prec(1, seq('_Atomic', '(', field('type', $.type_descriptor), ')')),

    typeof_specifier: $ => seq(
      choice('typeof', 'typeof_unqual', '__typeof', '__typeof__', '__typeof_unqual', '__typeof_unqual__'),
      '(',
      choice(
        field('value', $._full_expression),
        prec.dynamic(-1, field('type', $.type_descriptor)),
      ),
      ')',
    ),

    struct_specifier: $ => prec.right(seq(
      'struct',
      repeat($._type_attribute),
      $._struct_body,
    )),

    union_specifier: $ => prec.right(seq(
      'union',
      repeat($._type_attribute),
      $._struct_body,
    )),

    _struct_body: $ => choice(
      seq(field('name', $._type_identifier), optional(field('body', $.field_declaration_list))),
      field('body', $.field_declaration_list),
    ),

    _type_attribute: $ => choice(
      $.attribute_specifier,
      $.attribute_declaration,
      $.ms_declspec_modifier,
      $.alignas_specifier,
      $._macro_modifier,
    ),

    enum_specifier: $ => prec.right(seq(
      'enum',
      repeat($._type_attribute),
      choice(
        seq(
          field('name', $._type_identifier),
          optional(seq(
            optional($._enum_base),
            field('body', $.enumerator_list),
          )),
        ),
        seq(
          optional($._enum_base),
          field('body', $.enumerator_list),
        ),
      ),
    )),

    // C23 fixed underlying type: `enum e : unsigned char { ... }`.
    _enum_base: $ => seq(':', field('underlying_type', choice(
      $.primitive_type,
      $.sized_type_specifier,
      $.typeof_specifier,
      $._type_identifier,
    ))),

    field_declaration_list: $ => seq('{', repeat($._field_declaration_list_item), '}'),

    _field_declaration_list_item: $ => choice(
      $.field_declaration,
      $.static_assert_declaration,
      // A macro that declares members: `DECLARE_BITMAP(bits, N);`.
      alias($._macro_call_statement, $.expression_statement),
      ';',
    ),

    _macro_call_statement: $ => seq(alias($._macro_call, $.call_expression), ';'),

    field_declaration: $ => seq(
      $._declaration_specifiers,
      optional(commaSep1(choice(
        seq(field('declarator', $._field_declarator), optional($.bitfield_clause)),
        $.bitfield_clause,
      ))),
      ';',
    ),

    bitfield_clause: $ => seq(':', $._expression),

    enumerator_list: $ => seq(
      '{',
      optional(seq(commaSep1($.enumerator), optional(','))),
      '}',
    ),

    enumerator: $ => seq(
      field('name', reserved('declared_name', $.identifier)),
      repeat(choice($.attribute_specifier, $.attribute_declaration)),
      optional(seq('=', field('value', $._expression))),
    ),

    type_descriptor: $ => prec.right(seq(
      repeat(choice($._descriptor_modifier, $._macro_modifier)),
      field('type', $._type_specifier),
      repeat(choice($._descriptor_modifier, $._trailing_macro_modifier)),
      optional(field('declarator', $._abstract_declarator)),
    )),

    _descriptor_modifier: $ => choice($.type_qualifier, $.attribute_specifier),

    _type_identifier: $ => alias($.identifier, $.type_identifier),
    _field_identifier: $ => alias($.identifier, $.field_identifier),
    _statement_identifier: $ => alias($.identifier, $.statement_identifier),

    // ------------------------------------------------------------------
    // Declarators
    // ------------------------------------------------------------------

    ...declarators('', $ => $.identifier),
    ...declarators('field', $ => $._field_identifier),
    ...declarators('type', $ => alias(reserved('declared_name', $.identifier), $.type_identifier)),

    _abstract_declarator: $ => choice(
      $.abstract_pointer_declarator,
      $.abstract_function_declarator,
      $.abstract_array_declarator,
      $.abstract_parenthesized_declarator,
    ),

    abstract_pointer_declarator: $ => prec.dynamic(1, prec.right(seq(
      optional($.ms_based_modifier),
      '*',
      repeat($._abstract_pointer_modifier),
      optional(field('declarator', $._abstract_declarator)),
    ))),

    abstract_function_declarator: $ => prec.right(1, seq(
      optional(field('declarator', $._abstract_declarator)),
      field('parameters', $.parameter_list),
    )),

    abstract_array_declarator: $ => prec.right(1, seq(
      optional(field('declarator', $._abstract_declarator)),
      $._array_suffix,
    )),

    abstract_parenthesized_declarator: $ => prec(1, seq(
      '(',
      repeat($._abstract_paren_declarator_modifier),
      $._abstract_declarator,
      ')',
    )),

    _abstract_pointer_modifier: $ => choice(
      $.type_qualifier,
      $.ms_pointer_modifier,
      $.attribute_specifier,
      $.attribute_declaration,
    ),

    _pointer_modifier: $ => choice($._abstract_pointer_modifier, $.ms_call_modifier, $._macro_modifier),

    _abstract_paren_declarator_modifier: $ => choice($.ms_call_modifier, $.attribute_specifier),

    _paren_declarator_modifier: $ => choice($._abstract_paren_declarator_modifier, $._macro_modifier),

    _array_suffix: $ => seq(
      '[',
      repeat(choice($.type_qualifier, 'static')),
      optional(field('size', choice($._expression, '*'))),
      ']',
    ),

    parameter_list: $ => seq(
      '(',
      commaSep(choice($.parameter_declaration, $.variadic_parameter)),
      ')',
    ),

    parameter_declaration: $ => seq(
      $._declaration_specifiers,
      optional(field('declarator', choice($._declarator, $._abstract_declarator))),
    ),

    variadic_parameter: _ => '...',

    // ------------------------------------------------------------------
    // Statements
    // ------------------------------------------------------------------

    _block_item: $ => choice(
      $.declaration,
      $.type_definition,
      $.static_assert_declaration,
      $._statement,
    ),

    _statement: $ => choice(
      $.case_statement,
      $._non_case_statement,
    ),

    _non_case_statement: $ => choice(
      $.attributed_statement,
      $.labeled_statement,
      $.compound_statement,
      $.expression_statement,
      $.if_statement,
      $.switch_statement,
      $.do_statement,
      $.while_statement,
      $.for_statement,
      $.return_statement,
      $.break_statement,
      $.continue_statement,
      $.goto_statement,
      $.asm_statement,
      alias($._macro_statement, $.expression_statement),
    ),

    // A macro used as a statement without a semicolon:
    // `SWAP(a, b)`, `deliberate_fall_through`. Any reading that has the
    // semicolon wins.
    _macro_statement: $ => prec.dynamic(-1, choice(
      $.identifier,
      alias($._macro_call, $.call_expression),
    )),

    _macro_call: $ => seq(field('function', $.identifier), field('arguments', $.argument_list)),

    compound_statement: $ => seq('{', repeat($._block_item), '}'),

    // [[fallthrough]];  __attribute__((fallthrough));
    attributed_statement: $ => choice(
      seq($.attribute_declaration, $._statement),
      seq($.attribute_specifier, ';'),
    ),

    labeled_statement: $ => seq(
      field('label', $._statement_identifier),
      ':',
      choice($._statement, $.declaration),
    ),

    // A case label owns the statements that follow it, up to the next label.
    case_statement: $ => prec.right(seq(
      choice(
        seq(
          'case',
          field('value', $._expression),
          optional(seq('...', field('end', $._expression))),
        ),
        'default',
      ),
      ':',
      repeat(choice(
        $._non_case_statement,
        $.declaration,
        $.type_definition,
        $.static_assert_declaration,
      )),
    )),

    expression_statement: $ => seq(optional($._full_expression), ';'),

    if_statement: $ => prec.right(seq(
      'if',
      field('condition', $.parenthesized_expression),
      field('consequence', $._statement),
      optional(field('alternative', $.else_clause)),
    )),

    else_clause: $ => seq('else', $._statement),

    switch_statement: $ => seq(
      'switch',
      field('condition', $.parenthesized_expression),
      field('body', $._statement),
    ),

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
        field('initializer', $.declaration),
        seq(optional(field('initializer', $._full_expression)), ';'),
      ),
      optional(field('condition', $._full_expression)),
      ';',
      optional(field('update', $._full_expression)),
      ')',
      field('body', $._statement),
    ),

    return_statement: $ => seq('return', optional($._full_expression), ';'),

    break_statement: _ => seq('break', ';'),

    continue_statement: _ => seq('continue', ';'),

    goto_statement: $ => seq(
      'goto',
      choice(
        field('label', $._statement_identifier),
        // GNU computed goto: `goto *table[i];`
        seq('*', field('target', $._expression)),
      ),
      ';',
    ),

    asm_statement: $ => seq($.asm_expression, ';'),

    // GNU extended asm. Also used for `int x asm("name");`.
    asm_expression: $ => seq(
      choice(...ASM_KEYWORDS),
      repeat(field('qualifier', choice('volatile', '__volatile__', '__volatile', 'inline', '__inline__', 'goto'))),
      '(',
      field('template', choice($._string, $.identifier)),
      optional($._asm_operands),
      ')',
    ),

    // `::` is one token (for `[[gnu::x]]`), so `asm("" :: "r"(x))` and
    // `asm("" ::: "memory")` are spelled out here.
    _asm_operands: $ => choice(
      seq(':', optional(field('output_operands', $.asm_operand_list)), optional($._asm_inputs)),
      seq('::', optional($._asm_input_list), optional($._asm_clobbers)),
    ),

    _asm_inputs: $ => choice(
      seq(':', optional($._asm_input_list), optional($._asm_clobbers)),
      seq('::', optional($._asm_clobber_list), optional($._asm_labels)),
    ),

    _asm_input_list: $ => field('input_operands', $.asm_operand_list),

    _asm_clobbers: $ => choice(
      seq(':', optional($._asm_clobber_list), optional($._asm_labels)),
      seq('::', optional($._asm_goto_list)),
    ),

    _asm_clobber_list: $ => field('clobbers', $.asm_clobber_list),

    _asm_labels: $ => seq(':', optional($._asm_goto_list)),

    _asm_goto_list: $ => field('goto_labels', $.asm_goto_list),

    asm_operand_list: $ => commaSep1($.asm_operand),

    asm_operand: $ => choice(
      seq(
        optional(seq('[', field('symbol', $.identifier), ']')),
        field('constraint', $._string),
        '(',
        field('value', $._full_expression),
        ')',
      ),
      // A macro that expands to an operand.
      alias($._macro_call, $.call_expression),
    ),

    asm_clobber_list: $ => commaSep1(choice($._string, $.identifier)),

    asm_goto_list: $ => commaSep1($._statement_identifier),

    // ------------------------------------------------------------------
    // Expressions
    // ------------------------------------------------------------------

    _expression: $ => choice(
      $.conditional_expression,
      $.assignment_expression,
      $.binary_expression,
      $.unary_expression,
      $.update_expression,
      $.pointer_expression,
      $.cast_expression,
      $.sizeof_expression,
      $.alignof_expression,
      $.generic_expression,
      $.call_expression,
      $.subscript_expression,
      $.field_expression,
      $.compound_literal_expression,
      $.parenthesized_expression,
      $.statement_expression,
      $.label_address_expression,
      $.identifier,
      $.number_literal,
      $.char_literal,
      $.string_literal,
      $.concatenated_string,
      $.true,
      $.false,
      $.null,
    ),

    _full_expression: $ => choice($._expression, $.comma_expression),

    comma_expression: $ => seq(
      field('left', $._expression),
      ',',
      field('right', choice($._expression, $.comma_expression)),
    ),

    conditional_expression: $ => prec.right(PREC.CONDITIONAL, seq(
      field('condition', $._expression),
      '?',
      // Omitted in the GNU `a ?: b`.
      optional(field('consequence', $._full_expression)),
      ':',
      field('alternative', $._expression),
    )),

    assignment_expression: $ => prec.right(PREC.ASSIGNMENT, seq(
      field('left', $._expression),
      field('operator', choice(...ASSIGNMENT_OPERATORS)),
      field('right', choice($._expression, $.initializer_list)),
    )),

    binary_expression: $ => choice(...BINARY_OPERATORS.map(([operator, precedence]) =>
      prec.left(precedence, seq(
        field('left', $._expression),
        field('operator', operator),
        field('right', $._expression),
      )),
    )),

    unary_expression: $ => prec.left(PREC.UNARY, seq(
      field('operator', choice('!', '~', '-', '+', '__real', '__real__', '__imag', '__imag__', '__extension__')),
      field('argument', $._expression),
    )),

    update_expression: $ => choice(
      prec.right(PREC.UNARY, seq(
        field('operator', choice('++', '--')),
        field('argument', $._expression),
      )),
      prec.left(PREC.POSTFIX, seq(
        field('argument', $._expression),
        field('operator', choice('++', '--')),
      )),
    ),

    pointer_expression: $ => prec.left(PREC.UNARY, seq(
      field('operator', choice('*', '&')),
      field('argument', $._expression),
    )),

    // GNU labels as values: `&&label`.
    label_address_expression: $ => seq('&&', field('label', $._statement_identifier)),

    cast_expression: $ => prec.dynamic(1, prec(PREC.CAST, seq(
      '(',
      field('type', $.type_descriptor),
      ')',
      field('value', $._expression),
    ))),

    sizeof_expression: $ => prec(PREC.SIZEOF, seq(
      'sizeof',
      choice(
        field('value', $._expression),
        prec.dynamic(-1, seq('(', field('type', $.type_descriptor), ')')),
      ),
    )),

    alignof_expression: $ => prec(PREC.SIZEOF, seq(
      choice('alignof', '_Alignof', '__alignof', '__alignof__'),
      choice(
        seq('(', field('type', $.type_descriptor), ')'),
        // GNU also takes an expression.
        prec.dynamic(-1, field('value', $._expression)),
      ),
    )),

    generic_expression: $ => seq(
      '_Generic',
      '(',
      field('value', $._expression),
      repeat1(seq(',', $.generic_association)),
      ')',
    ),

    generic_association: $ => seq(
      choice(field('type', $.type_descriptor), 'default'),
      ':',
      field('value', $._expression),
    ),

    call_expression: $ => prec(PREC.POSTFIX, seq(
      field('function', $._expression),
      field('arguments', $.argument_list),
    )),

    // Macros take types too: `va_arg(ap, int)`, `offsetof(struct s, f)`,
    // `container_of(p, struct s, f)`. An argument that could be either is
    // an expression.
    argument_list: $ => seq('(', commaSep($._argument), ')'),

    _argument: $ => choice(
      $._expression,
      prec.dynamic(-1, $.type_descriptor),
      // Linux's `DEFINE_FREE(kfree, void *, if (_T) kfree(_T))`.
      alias($._if_argument, $.if_statement),
    ),

    _if_argument: $ => seq(
      'if',
      field('condition', $.parenthesized_expression),
      field('consequence', $._expression),
    ),

    subscript_expression: $ => prec(PREC.POSTFIX, seq(
      field('argument', $._expression),
      '[',
      field('index', $._full_expression),
      ']',
    )),

    field_expression: $ => prec(PREC.POSTFIX, seq(
      field('argument', $._expression),
      field('operator', choice('.', '->')),
      field('field', $._field_identifier),
    )),

    compound_literal_expression: $ => seq(
      '(',
      repeat($.storage_class_specifier),
      field('type', $.type_descriptor),
      ')',
      field('value', $.initializer_list),
    ),

    parenthesized_expression: $ => seq('(', $._full_expression, ')'),

    // GNU statement expression: `({ int x = f(); x * 2; })`.
    statement_expression: $ => seq('(', $.compound_statement, ')'),

    initializer_list: $ => seq(
      '{',
      optional(seq(
        commaSep1(choice($.initializer_pair, $._initializer)),
        optional(','),
      )),
      '}',
    ),

    _initializer: $ => choice($._expression, $.initializer_list),

    initializer_pair: $ => choice(
      seq(
        field('designator', repeat1(choice(
          $.subscript_designator,
          $.subscript_range_designator,
          $.field_designator,
        ))),
        '=',
        field('value', $._initializer),
      ),
      // Obsolete GNU form: `{ x: 1 }`.
      seq(field('designator', $._field_identifier), ':', field('value', $._initializer)),
    ),

    subscript_designator: $ => seq('[', $._expression, ']'),

    // GNU: `[0 ... 9] = x`.
    subscript_range_designator: $ => seq(
      '[',
      field('start', $._expression),
      '...',
      field('end', $._expression),
      ']',
    ),

    field_designator: $ => seq('.', $._field_identifier),

    // ------------------------------------------------------------------
    // Literals
    // ------------------------------------------------------------------

    // A preprocessing number: digits, letters, `.`, `'` separators, and
    // exponent signs. Covers every integer and floating form and suffix.
    number_literal: _ => token(/\.?[0-9]([0-9a-zA-Z_.]|'[0-9a-zA-Z_]|[eEpP][+-])*/),

    char_literal: $ => seq(
      choice('\'', 'L\'', 'u\'', 'U\'', 'u8\''),
      repeat1(choice(
        $.escape_sequence,
        alias(token.immediate(/[^\\'\r\n]/), $.character),
      )),
      token.immediate('\''),
    ),

    string_literal: $ => seq(
      choice('"', 'L"', 'u"', 'U"', 'u8"'),
      repeat(choice(
        alias(token.immediate(prec(1, /[^\\"\r\n]+/)), $.string_content),
        $.escape_sequence,
      )),
      token.immediate('"'),
    ),

    escape_sequence: _ => token.immediate(prec(1, seq(
      '\\',
      choice(
        /[^xuU0-7\r\n]/,
        /[0-7]{1,3}/,
        /x[0-9a-fA-F]+/,
        /u[0-9a-fA-F]{4}/,
        /U[0-9a-fA-F]{8}/,
        // A line continuation inside a literal.
        /\r?\n/,
      ),
    ))),

    // Adjacent literals, possibly with macros between them:
    // `"%" PRIu64 "\n"`.
    concatenated_string: $ => prec.right(choice(
      seq($.string_literal, repeat1(choice($.string_literal, $.identifier))),
      seq($.identifier, $.string_literal, repeat(choice($.string_literal, $.identifier))),
    )),

    _string: $ => choice($.string_literal, $.concatenated_string),

    system_lib_string: _ => token(seq('<', repeat(choice(/[^>\r\n]/, '\\>')), '>')),

    true: _ => choice('true', 'TRUE'),
    false: _ => choice('false', 'FALSE'),
    null: _ => choice('nullptr', 'NULL'),

    identifier: _ => /(\p{XID_Start}|[_$]|\\u[0-9A-Fa-f]{4}|\\U[0-9A-Fa-f]{8})(\p{XID_Continue}|\$|\\u[0-9A-Fa-f]{4}|\\U[0-9A-Fa-f]{8})*/,

    comment: _ => token(choice(
      seq('//', /(\\+(.|\r?\n)|[^\\\n])*/),
      seq('/*', /[^*]*\*+([^/*][^*]*\*+)*/, '/'),
    )),

    // ------------------------------------------------------------------
    // Preprocessor
    // ------------------------------------------------------------------

    preproc_include: $ => seq(
      directive(/include(_next)?|import/, '#include'),
      field('path', choice(
        $.string_literal,
        $.system_lib_string,
        $._preproc_identifier,
        alias($.preproc_call_expression, $.call_expression),
      )),
      $._preproc_newline,
    ),

    preproc_def: $ => seq(
      directive('define'),
      field('name', $._preproc_identifier),
      optional(field('value', $._preproc_args)),
      $._preproc_newline,
    ),

    preproc_function_def: $ => seq(
      directive('define'),
      field('name', $._preproc_identifier),
      field('parameters', $.preproc_params),
      optional(field('value', $._preproc_args)),
      $._preproc_newline,
    ),

    preproc_params: $ => seq(
      token.immediate(prec(1, '(')),
      commaSep(choice(
        $._preproc_identifier,
        '...',
        // GNU named variadic parameter: `args...`.
        seq($._preproc_identifier, '...'),
      )),
      ')',
    ),

    // Every other directive: #undef, #pragma, #error, #warning, #line,
    // #embed, #ident, line markers (`# 1 "file"`) and the null directive.
    preproc_call: $ => seq(
      field('directive', $.preproc_directive),
      optional(field('argument', $._preproc_args)),
      $._preproc_newline,
    ),

    preproc_directive: _ => token(prec(-1, /#[ \t]*[a-zA-Z0-9_]*/)),

    preproc_if: $ => seq(
      directive('if'),
      field('condition', $._preproc_expression),
      $._preproc_newline,
    ),

    preproc_ifdef: $ => seq(
      choice(directive('ifdef'), directive('ifndef')),
      field('name', $._preproc_identifier),
      $._preproc_newline,
    ),

    preproc_elif: $ => seq(
      directive('elif'),
      field('condition', $._preproc_expression),
      $._preproc_newline,
    ),

    preproc_elifdef: $ => seq(
      choice(directive('elifdef'), directive('elifndef')),
      field('name', $._preproc_identifier),
      $._preproc_newline,
    ),

    // `#else` and `#endif` are whole-line tokens, up to a comment or the end
    // of the line, so a file can end in `#endif` without a newline. Some code
    // repeats the condition after them without a comment.
    preproc_else: _ => directiveLine('else'),

    preproc_endif: _ => directiveLine('endif'),

    // The rest of a directive line, unparsed: a macro body, #pragma or #error
    // text. It stops at a comment, which is parsed as one, but not at `//`
    // or `/*` inside quotes.
    preproc_arg: _ => token(prec(-1, new RegExp(
      `(${PP_ARG_START})(${PP_ARG_CHAR})*`,
    ))),

    // Comments split the text into several pieces.
    _preproc_args: $ => repeat1($.preproc_arg),

    // Ends a directive. It is also an extra, so outside directives it is
    // skipped like any whitespace (see the top of the file).
    _preproc_newline: _ => /\n/,

    _preproc_identifier: $ => reserved('preproc', $.identifier),

    _preproc_expression: $ => choice(
      $._preproc_identifier,
      alias($.preproc_call_expression, $.call_expression),
      $.number_literal,
      $.char_literal,
      $.string_literal,
      $.preproc_defined,
      alias($.preproc_unary_expression, $.unary_expression),
      alias($.preproc_binary_expression, $.binary_expression),
      alias($.preproc_conditional_expression, $.conditional_expression),
      alias($.preproc_parenthesized_expression, $.parenthesized_expression),
    ),

    preproc_defined: $ => choice(
      prec(PREC.POSTFIX, seq('defined', '(', field('name', $._preproc_identifier), ')')),
      seq('defined', field('name', $._preproc_identifier)),
    ),

    preproc_call_expression: $ => prec(PREC.POSTFIX, seq(
      field('function', $._preproc_identifier),
      field('arguments', alias($.preproc_argument_list, $.argument_list)),
    )),

    // `__has_include(<stdio.h>)`, `__has_cpp_attribute(gnu::x)`.
    preproc_argument_list: $ => seq(
      '(',
      commaSep(choice(
        $._preproc_expression,
        $.system_lib_string,
        seq($._preproc_identifier, '::', $._preproc_identifier),
      )),
      ')',
    ),

    preproc_unary_expression: $ => prec.left(PREC.UNARY, seq(
      field('operator', choice('!', '~', '-', '+')),
      field('argument', $._preproc_expression),
    )),

    preproc_binary_expression: $ => choice(...BINARY_OPERATORS.map(([operator, precedence]) =>
      prec.left(precedence, seq(
        field('left', $._preproc_expression),
        field('operator', operator),
        field('right', $._preproc_expression),
      )),
    )),

    preproc_conditional_expression: $ => prec.right(PREC.CONDITIONAL, seq(
      field('condition', $._preproc_expression),
      '?',
      field('consequence', $._preproc_expression),
      ':',
      field('alternative', $._preproc_expression),
    )),

    preproc_parenthesized_expression: $ => seq('(', $._preproc_expression, ')'),
  },
});

/**
 * The declarator rules for one kind of name: plain declarators (`identifier`),
 * struct fields (`field_identifier`) and typedefs (`type_identifier`). The
 * field and typedef variants are aliased to the plain node names.
 *
 * @param {string} kind
 * @param {($: GrammarSymbols<string>) => RuleOrLiteral} leaf
 */
function declarators(kind, leaf) {
  const prefix = kind ? `_${kind}_` : '';
  const name = (/** @type {string} */ base) => `${prefix}${base}`;
  const D = kind ? `_${kind}_declarator` : '_declarator';
  // Attributes only go on the outermost declarator; inside one, a macro
  // after a name would be ambiguous with a macro before it
  // (`void NOINLINE f(void)`).
  const inner = `${D}_inner`;
  /** @param {any} $ @param {string} base */
  const node = ($, base) => kind ? alias($[name(base)], $[base]) : $[base];

  return {
    [D]: $ => choice(
      $[inner],
      node($, 'attributed_declarator'),
    ),

    [inner]: $ => choice(
      node($, 'pointer_declarator'),
      node($, 'function_declarator'),
      node($, 'array_declarator'),
      node($, 'parenthesized_declarator'),
      leaf($),
    ),

    [name('pointer_declarator')]: $ => prec.dynamic(1, prec.right(seq(
      optional($.ms_based_modifier),
      '*',
      repeat($._pointer_modifier),
      field('declarator', $[inner]),
    ))),

    [name('function_declarator')]: $ => prec(1, seq(
      field('declarator', $[inner]),
      field('parameters', $.parameter_list),
    )),

    [name('array_declarator')]: $ => prec(1, seq(
      field('declarator', $[inner]),
      $._array_suffix,
    )),

    [name('parenthesized_declarator')]: $ => prec.dynamic(PREC.PAREN_DECLARATOR, seq(
      '(',
      repeat($._paren_declarator_modifier),
      $[inner],
      ')',
    )),

    // `int x __attribute__((unused))`, `int f(void) [[deprecated]]`,
    // `int x asm("y")`, `int f(void) __THROW`.
    [name('attributed_declarator')]: $ => prec.right(choice(
      seq(
        field('declarator', node($, 'function_declarator')),
        repeat1(choice($.attribute_specifier, $.attribute_declaration, $.asm_expression, $._macro_attribute)),
      ),
      seq(
        field('declarator', $[inner]),
        repeat1(choice($.attribute_specifier, $.attribute_declaration, $.asm_expression, $._object_macro_attribute)),
      ),
    )),
  };
}

/**
 * A preprocessor directive keyword, allowing space after the `#`.
 *
 * @param {string | RegExp} name
 * @param {string} [display]
 */
function directive(name, display) {
  const source = typeof name === 'string' ? name : name.source;
  return alias(token(prec(1, new RegExp(`#[ \\t]*(${source})`))), display ?? `#${source}`);
}

/**
 * A directive with nothing to parse after it, as one token: the keyword and
 * any trailing text up to a comment or the end of the line.
 *
 * @param {string} name
 */
function directiveLine(name) {
  return token(prec(1, new RegExp(`#[ \\t]*${name}([^/\\r\\n]|/[^/*\\r\\n])*`)));
}

/** @param {RuleOrLiteral} rule */
function commaSep(rule) {
  return optional(commaSep1(rule));
}

/** @param {RuleOrLiteral} rule */
function commaSep1(rule) {
  return seq(rule, repeat(seq(',', rule)));
}
