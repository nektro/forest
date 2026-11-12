/**
 * @file Verilog grammar for tree-sitter
 * @license MIT
 *
 * Verilog as defined by IEEE 1364-2005, with no external scanner. Section
 * numbers in comments refer to that standard (Annex A has the formal syntax).
 *
 * Compiler directives (`define, `ifdef, `timescale, ...) are `extras`, so they
 * may appear anywhere, including in the middle of a port list or expression.
 * Uses of text macros (`FOO, `FOO(a, b)) are expressions, module items or
 * statements.
 */

/// <reference types="tree-sitter-cli/dsl" />
// @ts-check

// Table 5-4 (11.8 in 1364-2005 numbering: 5.1.2), highest last.
const PREC = {
  conditional: 1,
  logical_or: 2,
  logical_and: 3,
  bitwise_or: 4,
  bitwise_xor: 5,
  bitwise_and: 6,
  equality: 7,
  relational: 8,
  shift: 9,
  additive: 10,
  multiplicative: 11,
  power: 12,
  unary: 13,
  postfix: 14,
};

const NET_TYPES = [
  'supply0', 'supply1', 'tri', 'triand', 'trior', 'tri0', 'tri1', 'trireg',
  'uwire', 'wire', 'wand', 'wor',
];

// 7.1, gate_instantiation
const GATE_TYPES = [
  'and', 'nand', 'or', 'nor', 'xor', 'xnor',
  'buf', 'not',
  'bufif0', 'bufif1', 'notif0', 'notif1',
  'nmos', 'pmos', 'rnmos', 'rpmos',
  'cmos', 'rcmos',
  'tran', 'rtran', 'tranif0', 'tranif1', 'rtranif0', 'rtranif1',
  'pullup', 'pulldown',
];

const STRENGTHS = [
  'supply0', 'strong0', 'pull0', 'weak0', 'highz0',
  'supply1', 'strong1', 'pull1', 'weak1', 'highz1',
  'small', 'medium', 'large',
];

const DIRECTIONS = ['input', 'output', 'inout'];

// Types that may follow a port direction or `parameter`.
const VARIABLE_TYPES = ['integer', 'real', 'realtime', 'time'];

module.exports = grammar({
  name: 'verilog',

  word: $ => $.identifier,

  // Compiler directives are listed one by one: an extra cannot be a hidden
  // choice of non-terminals.
  extras: $ => [
    /\s/,
    $.comment,
    $.define_directive,
    $.undef_directive,
    $.ifdef_directive,
    $.elsif_directive,
    $.else_directive,
    $.endif_directive,
    $.include_directive,
    $.timescale_directive,
    $.directive,
  ],

  supertypes: $ => [
    $._expression,
    $._module_item,
    $._statement,
  ],

  inline: $ => [
    $._identifier,
    $._lvalue,
  ],

  conflicts: $ => [
    // In macro arguments, `a <= b` may be an expression or the start of a
    // statement; the `;` decides.
    [$._expression, $.nonblocking_assignment],
  ],

  rules: {
    // Module items are accepted at the top level too, for files that are
    // only ever `include-d into a module body.
    source_file: $ => repeat(choice($._description, $._module_item)),

    _description: $ => choice(
      $.module_declaration,
      $.udp_declaration,
      $.config_declaration,
    ),

    // =======================================================================
    // A.1.3 Module and primitive source text
    // =======================================================================

    module_declaration: $ => seq(
      repeat($.attribute_instance),
      choice('module', 'macromodule'),
      field('name', $._identifier),
      optional(field('parameters', $.parameter_port_list)),
      optional(field('ports', $.port_list)),
      ';',
      repeat($._module_item),
      'endmodule',
    ),

    // `#(parameter A = 1, B = 2)`. Each `parameter_declaration` holds one
    // assignment; the ones after it that repeat no keyword are bare
    // `parameter_assignment`s. The keyword may be left out entirely.
    parameter_port_list: $ => seq(
      '#',
      '(',
      commaSep1(choice(
        alias($._parameter_port_declaration, $.parameter_declaration),
        $.parameter_assignment,
      )),
      ')',
    ),

    _parameter_port_declaration: $ => seq(
      choice('parameter', 'localparam'),
      optional($._parameter_type),
      $.parameter_assignment,
    ),

    // `(a, b, c)` or `(input wire [7:0] a, b, output reg c)`. As with
    // parameters, names after the first in an ANSI declaration are bare
    // identifiers.
    port_list: $ => seq(
      '(',
      // Non-ANSI ports may be empty: `(a, , b)`.
      commaSep1Optional(choice(
        alias($._ansi_port_declaration, $.port_declaration),
        $._identifier,
        $.port,
      )),
      ')',
    ),

    // A.1.3 port: a non-ANSI port that is more than a name.
    port: $ => choice(
      seq(
        '.',
        field('name', $._identifier),
        '(',
        optional(field('expression', $._port_expression)),
        ')',
      ),
      field('expression', choice($.bit_select, $.part_select, $.concatenation)),
    ),

    _port_expression: $ => choice(
      $._identifier,
      $.bit_select,
      $.part_select,
      $.concatenation,
    ),

    _ansi_port_declaration: $ => seq(
      repeat($.attribute_instance),
      field('direction', choice(...DIRECTIONS)),
      optional($._port_type),
      field('name', $._identifier),
      optional(seq('=', field('value', $._expression))),
    ),

    _port_type: $ => choice(
      seq(
        optional(field('type', choice(...NET_TYPES, 'reg'))),
        optional('signed'),
        field('range', $.range),
      ),
      seq(field('type', choice(...NET_TYPES, 'reg')), optional('signed')),
      'signed',
      field('type', choice(...VARIABLE_TYPES)),
    ),

    // =======================================================================
    // A.1.4 Module items
    // =======================================================================

    _module_item: $ => choice(
      $.port_declaration,
      $.net_declaration,
      $.variable_declaration,
      $.event_declaration,
      $.genvar_declaration,
      $.parameter_declaration,
      $.local_parameter_declaration,
      $.specparam_declaration,
      $.defparam_declaration,
      $.continuous_assign,
      $.gate_instantiation,
      $.module_instantiation,
      $.initial_construct,
      $.always_construct,
      $.function_declaration,
      $.task_declaration,
      $.generate_region,
      $.loop_generate_construct,
      $.if_generate_construct,
      $.case_generate_construct,
      $.generate_block,
      $.specify_block,
      $.macro_usage,
      // Not in the standard, but tools accept a stray `;`.
      $.empty_item,
    ),

    empty_item: _ => ';',

    // =======================================================================
    // A.2 Declarations
    // =======================================================================

    // `input [7:0] a, b;` in a module, task or function body.
    port_declaration: $ => seq(
      repeat($.attribute_instance),
      field('direction', choice(...DIRECTIONS)),
      optional($._port_type),
      commaSep1(field('declarator', $._declarator)),
      ';',
    ),

    net_declaration: $ => seq(
      repeat($.attribute_instance),
      field('type', choice(...NET_TYPES)),
      optional(field('strength', $.strength)),
      optional(choice('vectored', 'scalared')),
      optional('signed'),
      optional(field('range', $.range)),
      optional(field('delay', $.delay)),
      commaSep1(field('declarator', $._declarator)),
      ';',
    ),

    // `reg`, `integer`, `real`, `realtime` and `time` declarations.
    variable_declaration: $ => seq(
      repeat($.attribute_instance),
      choice(
        seq(
          field('type', 'reg'),
          optional('signed'),
          optional(field('range', $.range)),
        ),
        field('type', choice(...VARIABLE_TYPES)),
      ),
      commaSep1(field('declarator', $._declarator)),
      ';',
    ),

    event_declaration: $ => seq(
      repeat($.attribute_instance),
      'event',
      commaSep1(field('declarator', $._declarator)),
      ';',
    ),

    genvar_declaration: $ => seq(
      repeat($.attribute_instance),
      'genvar',
      commaSep1(field('name', $._identifier)),
      ';',
    ),

    _declarator: $ => choice($._identifier, $.declarator),

    // A name with array dimensions or an initial value.
    declarator: $ => seq(
      field('name', $._identifier),
      choice(
        seq(
          repeat1(field('dimension', $.range)),
          optional(seq('=', field('value', $._expression))),
        ),
        seq('=', field('value', $._expression)),
      ),
    ),

    parameter_declaration: $ => seq(
      repeat($.attribute_instance),
      'parameter',
      optional($._parameter_type),
      commaSep1($.parameter_assignment),
      ';',
    ),

    local_parameter_declaration: $ => seq(
      repeat($.attribute_instance),
      'localparam',
      optional($._parameter_type),
      commaSep1($.parameter_assignment),
      ';',
    ),

    _parameter_type: $ => choice(
      seq(optional('signed'), field('range', $.range)),
      'signed',
      field('type', choice(...VARIABLE_TYPES)),
    ),

    parameter_assignment: $ => seq(
      field('name', $._identifier),
      '=',
      field('value', $._mintypmax_expression),
    ),

    specparam_declaration: $ => seq(
      repeat($.attribute_instance),
      'specparam',
      optional(field('range', $.range)),
      commaSep1($.specparam_assignment),
      ';',
    ),

    // `PATHPULSE$` names are ordinary identifiers.
    specparam_assignment: $ => seq(
      field('name', $._identifier),
      '=',
      field('value', choice(
        $._mintypmax_expression,
        $.pulse_control,
      )),
    ),

    // `PATHPULSE$ = (reject, error)`
    pulse_control: $ => seq(
      '(',
      field('reject', $._mintypmax_expression),
      ',',
      field('error', $._mintypmax_expression),
      ')',
    ),

    defparam_declaration: $ => seq(
      repeat($.attribute_instance),
      'defparam',
      commaSep1($.defparam_assignment),
      ';',
    ),

    defparam_assignment: $ => seq(
      field('name', choice($._identifier, $.hierarchical_identifier)),
      '=',
      field('value', $._mintypmax_expression),
    ),

    range: $ => seq(
      '[',
      field('msb', $._expression),
      ':',
      field('lsb', $._expression),
      ']',
    ),

    // A.2.1.3 drive_strength, charge_strength and pull strengths, merged:
    // `(strong0, weak1)`, `(pull1)`, `(small)`.
    strength: _ => seq('(', commaSep1(choice(...STRENGTHS)), ')'),

    // A.2.2.3 delay3, delay2 and delay_control: `#5`, `#(1:2:3, 4)`.
    delay: $ => seq(
      '#',
      choice(
        $._delay_value,
        seq('(', commaSep1($._mintypmax_expression), ')'),
      ),
    ),

    // Only an unsigned number, as in A.2.2.3: in `#1 'h5` the delay is `1`.
    _delay_value: $ => choice(
      alias($._decimal_number, $.number),
      $.real_number,
      $._identifier,
      $.macro_usage,
    ),

    // =======================================================================
    // A.2.6 Function and A.2.7 task declarations
    // =======================================================================

    function_declaration: $ => seq(
      repeat($.attribute_instance),
      'function',
      optional('automatic'),
      optional($._function_type),
      field('name', $._identifier),
      optional(field('ports', $.task_port_list)),
      ';',
      repeat($._block_item),
      'endfunction',
    ),

    _function_type: $ => choice(
      seq(optional('signed'), field('range', $.range)),
      'signed',
      field('type', choice(...VARIABLE_TYPES)),
    ),

    task_declaration: $ => seq(
      repeat($.attribute_instance),
      'task',
      optional('automatic'),
      field('name', $._identifier),
      optional(field('ports', $.task_port_list)),
      ';',
      repeat($._block_item),
      'endtask',
    ),

    task_port_list: $ => seq(
      '(',
      optional(commaSep1(choice(
        alias($._ansi_port_declaration, $.port_declaration),
        $._identifier,
      ))),
      ')',
    ),

    // Declarations and statements in a task or function body, or in a
    // begin-end or fork-join block. The standard puts all declarations
    // first and allows exactly one statement in a function or task; this
    // accepts any mix.
    _block_item: $ => choice(
      $.port_declaration,
      $.variable_declaration,
      $.event_declaration,
      $.parameter_declaration,
      $.local_parameter_declaration,
      $._statement_or_null,
    ),

    // =======================================================================
    // A.3 Primitive instances and A.4 module instantiation
    // =======================================================================

    gate_instantiation: $ => seq(
      repeat($.attribute_instance),
      field('type', choice(...GATE_TYPES)),
      optional(field('strength', $.strength)),
      optional(field('delay', $.delay)),
      commaSep1($.instance),
      ';',
    ),

    // Module and UDP instances look the same. The `#` part is a module's
    // parameter values or a UDP's delays.
    module_instantiation: $ => seq(
      repeat($.attribute_instance),
      field('type', $._identifier),
      optional(field('strength', $.strength)),
      optional(field('parameters', $.parameter_value_assignment)),
      commaSep1($.instance),
      ';',
    ),

    parameter_value_assignment: $ => seq(
      '#',
      choice(
        seq(
          '(',
          choice(
            // Empty values are not standard; Icarus accepts them.
            commaSep1Optional($._mintypmax_expression),
            commaSep1($.named_parameter_assignment),
          ),
          ')',
        ),
        $._delay_value,
      ),
    ),

    named_parameter_assignment: $ => seq(
      '.',
      field('name', $._identifier),
      '(',
      optional(field('value', $._mintypmax_expression)),
      ')',
    ),

    // Gate and UDP instances may be unnamed.
    instance: $ => seq(
      optional(seq(
        field('name', $._identifier),
        optional(field('range', $.range)),
      )),
      field('ports', $.port_connection_list),
    ),

    port_connection_list: $ => seq(
      '(',
      choice(
        commaSep1Optional($._ordered_port_connection),
        // A trailing comma is an error, but common and accepted by tools.
        seq(commaSep1($.named_port_connection), optional(',')),
      ),
      ')',
    ),

    _ordered_port_connection: $ => seq(
      repeat($.attribute_instance),
      $._expression,
    ),

    named_port_connection: $ => seq(
      repeat($.attribute_instance),
      '.',
      field('name', $._identifier),
      '(',
      optional(field('value', $._expression)),
      ')',
    ),

    // =======================================================================
    // A.4.2 Generate constructs
    // =======================================================================

    generate_region: $ => seq('generate', repeat($._module_item), 'endgenerate'),

    loop_generate_construct: $ => seq(
      repeat($.attribute_instance),
      'for',
      '(',
      field('initializer', $.genvar_initialization),
      ';',
      field('condition', $._expression),
      ';',
      field('update', $.genvar_iteration),
      ')',
      field('body', $._module_item),
    ),

    // `genvar` here is SystemVerilog, accepted because it is common.
    genvar_initialization: $ => seq(
      optional('genvar'),
      field('name', $._identifier),
      '=',
      field('value', $._expression),
    ),

    genvar_iteration: $ => seq(
      field('name', $._identifier),
      '=',
      field('value', $._expression),
    ),

    if_generate_construct: $ => prec.right(seq(
      repeat($.attribute_instance),
      'if',
      '(',
      field('condition', $._expression),
      ')',
      field('consequence', $._module_item),
      optional(seq('else', field('alternative', $._module_item))),
    )),

    case_generate_construct: $ => seq(
      repeat($.attribute_instance),
      'case',
      '(',
      field('value', $._expression),
      ')',
      repeat1($.case_generate_item),
      'endcase',
    ),

    case_generate_item: $ => seq(
      choice(
        seq(commaSep1(field('match', $._expression)), ':'),
        seq('default', optional(':')),
      ),
      field('body', $._module_item),
    ),

    generate_block: $ => seq(
      repeat($.attribute_instance),
      'begin',
      optional(seq(':', field('name', $._identifier))),
      repeat($._module_item),
      'end',
    ),

    // =======================================================================
    // A.5 UDP declaration and instantiation
    // =======================================================================

    udp_declaration: $ => seq(
      repeat($.attribute_instance),
      'primitive',
      field('name', $._identifier),
      field('ports', $.port_list),
      ';',
      repeat(choice($.port_declaration, $.variable_declaration)),
      optional($.udp_initial_statement),
      $.udp_table,
      'endprimitive',
    ),

    udp_initial_statement: $ => seq(
      'initial',
      field('name', $._identifier),
      '=',
      field('value', $.number),
      ';',
    ),

    udp_table: $ => seq('table', repeat($.table_entry), 'endtable'),

    // Combinational `0 1 : 1 ;` or sequential `(01) 0 : ? : - ;`. The
    // symbols are single characters, so `01:1;` works too.
    table_entry: $ => seq(
      field('inputs', $.table_inputs),
      ':',
      choice(
        field('output', $._table_symbol),
        seq(
          field('current_state', $._table_symbol),
          ':',
          field('next_state', $._table_symbol),
        ),
      ),
      ';',
    ),

    table_inputs: $ => repeat1($._table_symbol),

    _table_symbol: $ => choice(
      $.level_symbol,
      $.edge_symbol,
      $.edge_indicator,
      $.no_change,
    ),

    level_symbol: _ => token(prec(2, /[01xX?bB]/)),
    edge_symbol: _ => token(prec(2, /[rRfFpPnN*]/)),
    no_change: _ => '-',
    edge_indicator: $ => seq('(', $.level_symbol, $.level_symbol, ')'),

    // =======================================================================
    // A.6 Behavioral statements
    // =======================================================================

    continuous_assign: $ => seq(
      repeat($.attribute_instance),
      'assign',
      optional(field('strength', $.strength)),
      optional(field('delay', $.delay)),
      commaSep1($.assignment),
      ';',
    ),

    initial_construct: $ => seq(
      repeat($.attribute_instance),
      'initial',
      field('body', $._statement_or_null),
    ),

    always_construct: $ => seq(
      repeat($.attribute_instance),
      'always',
      field('body', $._statement_or_null),
    ),

    // `a = b` with no timing control: continuous assignments, `for` loop
    // headers, `assign` and `force` statements.
    assignment: $ => seq(
      field('left', $._lvalue),
      '=',
      field('right', $._expression),
    ),

    _lvalue: $ => choice(
      $._reference,
      $.concatenation,
      $.macro_usage,
    ),

    _statement_or_null: $ => choice(
      $._statement,
      $.null_statement,
    ),

    null_statement: $ => seq(repeat($.attribute_instance), ';'),

    _statement: $ => choice(
      $.blocking_assignment,
      $.nonblocking_assignment,
      $.procedural_continuous_assignment,
      $.if_statement,
      $.case_statement,
      $.forever_statement,
      $.repeat_statement,
      $.while_statement,
      $.for_statement,
      $.seq_block,
      $.par_block,
      $.timing_control_statement,
      $.wait_statement,
      $.disable_statement,
      $.event_trigger,
      $.task_enable,
      $.system_task_enable,
      $.macro_statement,
    ),

    blocking_assignment: $ => seq(
      repeat($.attribute_instance),
      field('left', $._lvalue),
      '=',
      optional(field('control', $._intra_assignment_control)),
      field('right', $._expression),
      ';',
    ),

    nonblocking_assignment: $ => seq(
      repeat($.attribute_instance),
      field('left', $._lvalue),
      '<=',
      optional(field('control', $._intra_assignment_control)),
      field('right', $._expression),
      ';',
    ),

    _intra_assignment_control: $ => choice(
      $.delay,
      $.event_control,
      $.repeat_event_control,
    ),

    repeat_event_control: $ => seq(
      'repeat',
      '(',
      field('count', $._expression),
      ')',
      field('event', $.event_control),
    ),

    procedural_continuous_assignment: $ => seq(
      repeat($.attribute_instance),
      choice(
        seq(choice('assign', 'force'), $.assignment),
        seq(choice('deassign', 'release'), field('left', $._lvalue)),
      ),
      ';',
    ),

    if_statement: $ => prec.right(seq(
      repeat($.attribute_instance),
      'if',
      '(',
      field('condition', $._expression),
      ')',
      field('consequence', $._statement_or_null),
      optional(seq('else', field('alternative', $._statement_or_null))),
    )),

    case_statement: $ => seq(
      repeat($.attribute_instance),
      choice('case', 'casez', 'casex'),
      '(',
      field('value', $._expression),
      ')',
      repeat1($.case_item),
      'endcase',
    ),

    case_item: $ => seq(
      choice(
        seq(commaSep1(field('match', $._expression)), ':'),
        seq('default', optional(':')),
      ),
      field('body', $._statement_or_null),
    ),

    forever_statement: $ => seq(
      repeat($.attribute_instance),
      'forever',
      field('body', $._statement_or_null),
    ),

    repeat_statement: $ => seq(
      repeat($.attribute_instance),
      'repeat',
      '(',
      field('count', $._expression),
      ')',
      field('body', $._statement_or_null),
    ),

    while_statement: $ => seq(
      repeat($.attribute_instance),
      'while',
      '(',
      field('condition', $._expression),
      ')',
      field('body', $._statement_or_null),
    ),

    for_statement: $ => seq(
      repeat($.attribute_instance),
      'for',
      '(',
      field('initializer', $.assignment),
      ';',
      field('condition', $._expression),
      ';',
      field('update', $.assignment),
      ')',
      field('body', $._statement_or_null),
    ),

    seq_block: $ => seq(
      repeat($.attribute_instance),
      'begin',
      optional(seq(':', field('name', $._identifier))),
      repeat($._block_item),
      'end',
    ),

    par_block: $ => seq(
      repeat($.attribute_instance),
      'fork',
      optional(seq(':', field('name', $._identifier))),
      repeat($._block_item),
      'join',
    ),

    // `#10 a = b;`, `@(posedge clk) q <= d;`, `@(e);`
    timing_control_statement: $ => seq(
      repeat($.attribute_instance),
      field('control', choice($.delay, $.event_control)),
      field('body', $._statement_or_null),
    ),

    event_control: $ => seq(
      '@',
      choice(
        $._identifier,
        $.hierarchical_identifier,
        seq('(', $._event_expression, ')'),
        '*',
        // `@(*)`, one token so that `(*` is not read as an attribute.
        alias(token(/\(\s*\*\s*\)/), '(*)'),
      ),
    ),

    _event_expression: $ => choice(
      $._expression,
      $.edge_event,
      $.event_or,
    ),

    edge_event: $ => seq(
      field('edge', choice('posedge', 'negedge')),
      field('signal', $._expression),
    ),

    // `a or b` and `a, b`
    event_or: $ => prec.left(seq(
      field('left', $._event_expression),
      choice('or', ','),
      field('right', $._event_expression),
    )),

    wait_statement: $ => seq(
      repeat($.attribute_instance),
      'wait',
      '(',
      field('condition', $._expression),
      ')',
      field('body', $._statement_or_null),
    ),

    disable_statement: $ => seq(
      repeat($.attribute_instance),
      'disable',
      field('name', choice($._identifier, $.hierarchical_identifier)),
      ';',
    ),

    event_trigger: $ => seq(
      repeat($.attribute_instance),
      '->',
      field('name', choice($._identifier, $.hierarchical_identifier, $.bit_select)),
      ';',
    ),

    task_enable: $ => seq(
      repeat($.attribute_instance),
      field('name', choice($._identifier, $.hierarchical_identifier)),
      optional(field('arguments', $.argument_list)),
      ';',
    ),

    system_task_enable: $ => seq(
      repeat($.attribute_instance),
      field('name', $.system_identifier),
      optional(field('arguments', $.argument_list)),
      ';',
    ),

    // A macro used as a statement, with or without a `;` after it.
    macro_statement: $ => prec.right(-1, seq(
      $.macro_usage,
      optional(';'),
    )),

    // =======================================================================
    // A.7 Specify section
    // =======================================================================

    specify_block: $ => seq('specify', repeat($._specify_item), 'endspecify'),

    _specify_item: $ => choice(
      $.specparam_declaration,
      $.pulsestyle_declaration,
      $.showcancelled_declaration,
      $.path_declaration,
      $.system_timing_check,
    ),

    pulsestyle_declaration: $ => seq(
      choice('pulsestyle_onevent', 'pulsestyle_ondetect'),
      commaSep1($._path_terminal),
      ';',
    ),

    showcancelled_declaration: $ => seq(
      choice('showcancelled', 'noshowcancelled'),
      commaSep1($._path_terminal),
      ';',
    ),

    // `(a => b) = 1;`, `if (en) (posedge clk *> (q +: d)) = (1, 2);`
    path_declaration: $ => seq(
      optional(choice(
        seq('if', '(', field('condition', $._expression), ')'),
        'ifnone',
      )),
      '(',
      optional(field('edge', choice('posedge', 'negedge'))),
      commaSep1(field('source', $._path_terminal)),
      // The polarity is part of the operator token: `+=>`, `- *>`.
      field('operator', choice(
        '=>',
        '*>',
        alias(token(/\+[ \t]*=>/), '+=>'),
        alias(token(/-[ \t]*=>/), '-=>'),
        alias(token(/\+[ \t]*\*>/), '+*>'),
        alias(token(/-[ \t]*\*>/), '-*>'),
      )),
      choice(
        commaSep1(field('destination', $._path_terminal)),
        seq(
          '(',
          commaSep1(field('destination', $._path_terminal)),
          field('polarity', choice(':', '+:', '-:')),
          field('data_source', $._expression),
          ')',
        ),
      ),
      ')',
      '=',
      field('delay', $.path_delay_value),
      ';',
    ),

    // `10`, `t_rise, t_fall` or `(1:2:3, 4:5:6)`. Unparenthesized delays are
    // simple values; anything more needs the parentheses. (Allowing any
    // expression makes `(a)` ambiguous and multiplies the parse table.)
    path_delay_value: $ => choice(
      commaSep1($._delay_value),
      seq('(', commaSep1($._mintypmax_expression), ')'),
    ),

    _path_terminal: $ => choice(
      $._identifier,
      $.hierarchical_identifier,
      $.bit_select,
      $.part_select,
    ),

    // `$setup(d, posedge clk &&& en, 10, notifier);` and the other checks.
    system_timing_check: $ => seq(
      field('name', $.system_identifier),
      '(',
      commaSep1Optional($._timing_check_argument),
      ')',
      ';',
    ),

    _timing_check_argument: $ => choice(
      $._mintypmax_expression,
      $.timing_check_event,
    ),

    timing_check_event: $ => choice(
      seq(
        field('edge', choice('posedge', 'negedge', $.edge_control_specifier)),
        field('signal', $._path_terminal),
        optional(seq('&&&', field('condition', $._expression))),
      ),
      seq(
        field('signal', $._path_terminal),
        '&&&',
        field('condition', $._expression),
      ),
    ),

    edge_control_specifier: $ => seq(
      'edge',
      '[',
      commaSep1($.edge_descriptor),
      ']',
    ),

    edge_descriptor: _ => token(prec(2, /[01xXzZ][01xXzZ]/)),

    // =======================================================================
    // A.8 Expressions
    // =======================================================================

    _expression: $ => choice(
      $._reference,
      $.number,
      $.real_number,
      $.string,
      $.concatenation,
      $.replication,
      $.function_call,
      $.system_function_call,
      $.parenthesized_expression,
      $.unary_expression,
      $.binary_expression,
      $.conditional_expression,
      $.macro_usage,
    ),

    // Names and selects: what may be assigned to.
    _reference: $ => choice(
      $._identifier,
      $.hierarchical_identifier,
      $.bit_select,
      $.part_select,
    ),

    // `top.u1.sig`, `gen[2].inst.sig`
    hierarchical_identifier: $ => prec.left(PREC.postfix, seq(
      field('scope', choice($._identifier, $.hierarchical_identifier, $.bit_select)),
      '.',
      field('name', $._identifier),
    )),

    // `a[3]`, `mem[i][j]`
    bit_select: $ => prec(PREC.postfix, seq(
      field('value', $._reference),
      '[',
      field('index', $._expression),
      ']',
    )),

    // `a[7:0]`, `a[i +: 4]`, `a[i -: 4]`
    part_select: $ => prec(PREC.postfix, seq(
      field('value', $._reference),
      '[',
      choice(
        seq(field('msb', $._expression), ':', field('lsb', $._expression)),
        seq(
          field('base', $._expression),
          field('operator', choice('+:', '-:')),
          field('width', $._expression),
        ),
      ),
      ']',
    )),

    concatenation: $ => seq('{', commaSep1($._expression), '}'),

    // `{4{a}}`
    replication: $ => seq(
      '{',
      field('count', $._expression),
      field('value', $.concatenation),
      '}',
    ),

    function_call: $ => prec(PREC.postfix, seq(
      field('function', choice($._identifier, $.hierarchical_identifier)),
      repeat($.attribute_instance),
      field('arguments', $.argument_list),
    )),

    system_function_call: $ => prec.right(PREC.postfix, seq(
      field('function', $.system_identifier),
      optional(field('arguments', $.argument_list)),
    )),

    // Arguments may be empty: `$display(a, , b)`.
    argument_list: $ => seq('(', commaSep1Optional($._expression), ')'),

    parenthesized_expression: $ => seq('(', $._mintypmax_expression, ')'),

    _mintypmax_expression: $ => choice($._expression, $.mintypmax_expression),

    mintypmax_expression: $ => seq(
      field('min', $._expression),
      ':',
      field('typ', $._expression),
      ':',
      field('max', $._expression),
    ),

    unary_expression: $ => prec(PREC.unary, seq(
      field('operator', choice('+', '-', '!', '~', '&', '~&', '|', '~|', '^', '~^', '^~')),
      repeat($.attribute_instance),
      field('operand', $._expression),
    )),

    binary_expression: $ => {
      /** @type {[number, string[]][]} */
      const table = [
        [PREC.power, ['**']],
        [PREC.multiplicative, ['*', '/', '%']],
        [PREC.additive, ['+', '-']],
        [PREC.shift, ['<<', '>>', '<<<', '>>>']],
        [PREC.relational, ['<', '<=', '>', '>=']],
        [PREC.equality, ['==', '!=', '===', '!==']],
        [PREC.bitwise_and, ['&']],
        [PREC.bitwise_xor, ['^', '^~', '~^']],
        [PREC.bitwise_or, ['|']],
        [PREC.logical_and, ['&&']],
        [PREC.logical_or, ['||']],
      ];
      return choice(...table.map(([precedence, operators]) => prec.left(precedence, seq(
        field('left', $._expression),
        field('operator', operators.length === 1 ? operators[0] : choice(...operators)),
        repeat($.attribute_instance),
        field('right', $._expression),
      ))));
    },

    conditional_expression: $ => prec.right(PREC.conditional, seq(
      field('condition', $._expression),
      '?',
      repeat($.attribute_instance),
      field('consequence', $._expression),
      ':',
      field('alternative', $._expression),
    )),

    // =======================================================================
    // A.8.7 Numbers, A.8.8 strings
    // =======================================================================

    // Decimal integers and based numbers: `42`, `8'hFF`, `4'sb1x0z`, `'d 10`,
    // `8 'h FF`. The size is a separate token, so that in `#1 'h5` the delay
    // ends before the `'`. A macro may be the size: `` `W'b0 ``.
    number: $ => choice(
      $._decimal_number,
      seq(optional(choice($._decimal_number, $.macro_usage)), $._based_number),
    ),

    _decimal_number: _ => /[0-9][0-9_]*/,

    _based_number: _ => token(seq(
      /'[sS]?[bBoOdDhH]/,
      /[ \t]*/,
      /[0-9a-fA-FxXzZ?][0-9a-fA-FxXzZ?_]*/,
    )),

    real_number: _ => {
      const digits = /[0-9][0-9_]*/;
      const exponent = /[eE][+-]?[0-9][0-9_]*/;
      return token(choice(
        seq(digits, '.', digits, optional(exponent)),
        seq(digits, exponent),
      ));
    },

    string: $ => seq(
      '"',
      repeat(choice($.string_content, $.escape_sequence)),
      token.immediate('"'),
    ),

    string_content: _ => token.immediate(prec(1, /[^"\\\r\n]+/)),

    escape_sequence: _ => token.immediate(seq(
      '\\',
      choice(/[0-7]{1,3}/, /[^0-7\r\n]/, /\r?\n/),
    )),

    // =======================================================================
    // A.9 General
    // =======================================================================

    // (* full_case, parallel_case *)
    attribute_instance: $ => seq('(*', commaSep1($.attribute_spec), '*)'),

    attribute_spec: $ => seq(
      field('name', $._identifier),
      optional(seq('=', field('value', $._expression))),
    ),

    comment: _ => token(choice(
      seq('//', /[^\r\n]*/),
      seq('/*', /[^*]*\*+([^/*][^*]*\*+)*/, '/'),
    )),

    _identifier: $ => choice($.identifier, $.escaped_identifier),

    identifier: _ => /[a-zA-Z_][a-zA-Z0-9_$]*/,

    // `\bus+index ` ends at whitespace.
    escaped_identifier: _ => /\\[^\s]+/,

    system_identifier: _ => /\$[a-zA-Z0-9_$]+/,

    // =======================================================================
    // A.1.5 Configuration source text
    // =======================================================================

    config_declaration: $ => seq(
      'config',
      field('name', $._identifier),
      ';',
      $.design_statement,
      repeat($._config_rule),
      'endconfig',
    ),

    design_statement: $ => seq('design', repeat($.cell_reference), ';'),

    // `lib.cell` or `cell`
    cell_reference: $ => seq(
      optional(seq(field('library', $._identifier), '.')),
      field('cell', $._identifier),
    ),

    _config_rule: $ => choice(
      $.default_clause,
      $.instance_clause,
      $.cell_clause,
    ),

    default_clause: $ => seq('default', $.liblist_clause, ';'),

    instance_clause: $ => seq(
      'instance',
      field('name', choice($._identifier, $.hierarchical_identifier)),
      choice($.liblist_clause, $.use_clause),
      ';',
    ),

    cell_clause: $ => seq(
      'cell',
      field('name', $.cell_reference),
      choice($.liblist_clause, $.use_clause),
      ';',
    ),

    liblist_clause: $ => seq('liblist', repeat($._identifier)),

    use_clause: $ => seq(
      'use',
      $.cell_reference,
      optional(seq(':', 'config')),
    ),

    // =======================================================================
    // 19 Compiler directives
    // =======================================================================

    // The value runs to the end of the line, including lines joined with a
    // backslash.
    define_directive: $ => seq(
      directive('define'),
      field('name', $._identifier),
      optional(field('parameters', $.macro_parameters)),
      optional(field('value', $.macro_text)),
      $._end_of_line,
    ),

    macro_parameters: $ => seq(
      token.immediate('('),
      commaSep1($.macro_parameter),
      ')',
    ),

    // `define M(a, b = 1) is SystemVerilog, accepted because it is harmless.
    macro_parameter: $ => seq(
      field('name', $._identifier),
      optional(seq('=', field('default', alias(/[^,)\r\n]+/, $.macro_text)))),
    ),

    // A `//` comment ends the text unless it ends in a backslash, which
    // continues the macro onto the next line.
    macro_text: _ => token(prec(-1, seq(
      /[^\s\/\\]|\/[^*\/\r\n]|\\\r?\n|\\[^\r\n]/,
      repeat(/[^/\r\n\\]|\/[^*\/\r\n]|\/\/[^\r\n]*\\\r?\n|\\\r?\n|\\[^\r\n]/),
    ))),

    _end_of_line: _ => /\r?\n/,

    undef_directive: $ => seq(directive('undef'), field('name', $._identifier)),

    ifdef_directive: $ => seq(
      choice(directive('ifdef'), directive('ifndef')),
      field('name', $._identifier),
    ),

    elsif_directive: $ => seq(directive('elsif'), field('name', $._identifier)),

    else_directive: _ => directive('else'),

    endif_directive: _ => directive('endif'),

    include_directive: $ => seq(
      directive('include'),
      field('path', choice($.string, $.system_lib_string, $.macro_identifier)),
    ),

    system_lib_string: _ => /<[^>\r\n]*>/,

    // `timescale 1ns / 1ps
    timescale_directive: $ => seq(
      directive('timescale'),
      field('unit', $.time_literal),
      '/',
      field('precision', $.time_literal),
    ),

    time_literal: _ => /[0-9][0-9_]*(\.[0-9][0-9_]*)?[ \t]*[munpf]?s/,

    // The remaining directives, with their arguments up to the end of the
    // line: `` `default_nettype none ``, `` `resetall ``, `` `line 3 "a.v" 0 ``.
    // Every token that may start an extra costs table space in every parse
    // state, so the rarely used ones share one token.
    directive: _ => token(seq(
      '`',
      choice(
        'begin_keywords',
        'celldefine',
        'default_nettype',
        'end_keywords',
        'endcelldefine',
        'line',
        'nounconnected_drive',
        'pragma',
        'resetall',
        'unconnected_drive',
      ),
      // Not a macro whose name merely starts with one of these.
      optional(/[^a-zA-Z0-9_$\r\n][^\r\n]*/),
    )),

    // `FOO and `FOO(a, b)
    macro_usage: $ => prec.right(seq(
      field('name', $.macro_identifier),
      optional(field('arguments', alias($._macro_arguments, $.argument_list))),
    )),

    // After `directive`: on a tie, the rule defined first wins.
    macro_identifier: _ => /`[a-zA-Z_][a-zA-Z0-9_$]*/,

    // Macro arguments can be any text. Expressions and statements are
    // accepted, as in `` `debug($display("x");) ``.
    _macro_arguments: $ => seq(
      token.immediate('('),
      commaSep1Optional(choice($._expression, repeat1($._statement))),
      ')',
    ),
  },
});

/**
 * A compiler directive keyword such as `` `define ``. `macro_identifier`
 * matches it too; a string token wins over a regex of the same length, and a
 * longer macro name such as `` `define_width `` wins by length.
 * @param {string} name
 */
function directive(name) {
  return '`' + name;
}

/**
 * One or more `rule`s separated by commas.
 * @param {RuleOrLiteral} rule
 */
function commaSep1(rule) {
  return seq(rule, repeat(seq(',', rule)));
}

/**
 * Comma-separated `rule`s where any of them may be left out, as in
 * `$display(a, , b)`. Matches nothing at all too.
 * @param {RuleOrLiteral} rule
 */
function commaSep1Optional(rule) {
  return optional(choice(
    rule,
    seq(optional(rule), repeat1(seq(',', optional(rule)))),
  ));
}
