/**
 * @file Windows batch (cmd.exe) grammar for tree-sitter
 * @license MIT
 *
 * Follows the way cmd.exe reads `.bat` and `.cmd` files, with no external
 * scanner:
 *
 * - Each line is blank, a label (`:name`), a comment (`rem ...` or `::...`)
 *   or a statement. Statements are joined by `&`, `&&`, `||` and `|`, and a
 *   `^` at the end of a line continues it.
 * - `if`, `for` and `set` have their own nodes. Every other command is a
 *   `command` with a name and arguments; `echo`, `goto` and `call` are
 *   commands too. `if` and `for` bodies run to the end of the line, so
 *   `if x a & b` runs both commands only when `x` holds.
 * - Parenthesized blocks span lines. Inside a block a `)` ends the block
 *   unless escaped as `^)`; outside one it is ordinary text, so
 *   `echo Usage (see docs)` is one command at the top level. The two cases
 *   are separate rules (with `_block` suffixes) aliased to the same nodes.
 * - Words are concatenations of pieces: text, `"strings"`, `%variables%`
 *   (with `:~start,length` and `:old=new` edits), `!delayed!` variables,
 *   parameters (`%1`, `%~dp0`, `%*`), `for` variables (`%%i`, `%%~nxi`) and
 *   escapes (`^&`, `%%`). A piece that directly follows another is an
 *   immediate token, so `a "b"` is two words and `a"b"` is one.
 * - Keywords are case-insensitive.
 */

/// <reference types="tree-sitter-cli/dsl" />
// @ts-check

// A case-insensitive regex for a keyword.
const ci = word => new RegExp(word.split('').map(c =>
  /[a-z]/i.test(c) ? `[${c.toLowerCase()}${c.toUpperCase()}]` : c.replace(/[/.]/g, '\\$&'),
).join(''));
const kw = word => alias(token(prec(1, ci(word))), word);

// Pieces that directly follow another piece outrank a new word.
const IMM = 1;
const imm = re => token.immediate(prec(IMM, re));
// Pieces inside a string outrank both.
const STR = 2;

const MODIFIERS = '[fdpnxsatzFDPNXSATZ]*(\\$[^:%\\r\\n]+:)?';

const PIECE = {
  // `%name%`, `%name:~0,4%`, `%name:old=new%`. A name does not start with a
  // digit, `~` or `*` (those are parameters) and has no blanks.
  variable: /%[^%\s:~0-9*][^%\s:]*(:[^%\r\n]*)?%/,
  // `!name!`, with the same edits as `%name%`.
  delayed_variable: /![^!\s:]+(:[^!\r\n]*)?!/,
  // `%0`-`%9`, `%*`, `%~1`, `%~dp0`, `%~$PATH:1`.
  parameter: new RegExp(`%(\\*|[0-9]|~${MODIFIERS}[0-9])`),
  // `%%i`, `%%~nxi`, `%%~$PATH:i`. Scripts also use digits and symbols such
  // as `%%#` and `%%$`.
  for_variable: new RegExp(`%%(~${MODIFIERS})?[A-Za-z0-9#$@?_\\[\\]{}'+\\-*]`),
  // `^&` and friends; `%%` is a literal percent sign.
  _caret_escape: /\^[^\r\n]/,
  _percent_escape: '%%',
};

// Text in each kind of word. None of them holds blanks, quotes, `%`, `!`,
// `^`, `&`, `|`, `<` or `>`.
const TEXT = {
  // Arguments at the top level, where parentheses are text.
  arg: /[^\s"%!^&|<>]+/,
  // Arguments inside a block, where `)` ends the block.
  arg_block: /[^\s"%!^&|<>)]+/,
  // Command names, `if` operands, `set` names and `for` options, which stop
  // at `(`, `)` and `=`.
  name: /[^\s"%!^&|<>()=]+/,
  // Items in a `for` set, separated by blanks, `,`, `;` and `=`.
  item: /[^\s"%!^&|<>(),;=]+/,
};

// Each statement rule exists twice: once for the top level and once for
// inside a block (`_block` suffix), where `)` ends the block.
const CONTEXTS = ['', '_block'];

module.exports = grammar({
  name: 'batch',

  extras: $ => [/[ \t\r\f\v\x1a]/, $._line_continuation],

  word: $ => $._word,

  rules: {
    source_file: $ => seq(
      repeat(choice(seq($._line, $._newline), $._newline)),
      optional($._line),
    ),

    _line: $ => choice($._statement, $.label, alias($._stray_paren, $.comment)),

    // cmd ignores a `)` that starts a line outside any block, and the rest of
    // that line.
    _stray_paren: _ => token(prec(1, /\)[^\r\n]*/)),
    _line_block: $ => choice($._statement_block, $.label),

    _block_body: $ => seq(
      '(',
      repeat(choice(seq($._line_block, $._newline), $._newline)),
      optional($._line_block),
      ')',
    ),

    _newline: _ => '\n',

    // `@` hides a command's echo. cmd accepts several.
    _at: _ => alias(/@+/, '@'),

    _line_continuation: _ => token(/\^\r?\n/),

    // `:name`. cmd ignores the rest of the line.
    label: $ => seq(
      token(prec(1, /:[^\s:]\S*/)),
      optional($._comment_text),
    ),

    // `rem ...` or `::...`.
    comment: $ => choice(
      token(prec(2, /::[^\r\n]*/)),
      seq(optional($._at), kw('rem'), optional($._comment_text)),
    ),

    _comment_text: _ => /[^\r\n]+/,

    // A command name, `if` operand, `set` name or `for` option. Keywords
    // are taken from it. It does not start with `@`, which hides a command.
    _word: _ => /[^\s"%!^&|<>()=@][^\s"%!^&|<>()=]*/,

    ...statementRules(),
    ...wordRules(),

    command_name: $ => seq(
      choice($._word, ...pieces($, '')),
      repeat(choice($._imm_name_text, ...pieces($, '_imm'))),
    ),

    // `if` conditions.

    comparison: $ => seq(
      field('left', $._name),
      field('operator', choice('==', ...['equ', 'neq', 'lss', 'leq', 'gtr', 'geq'].map(kw))),
      field('right', $._name),
    ),

    exist_condition: $ => seq(kw('exist'), field('path', $._name)),

    defined_condition: $ => seq(kw('defined'), field('variable', $._name)),

    errorlevel_condition: $ => seq(kw('errorlevel'), field('level', $._name)),

    cmdextversion_condition: $ => seq(kw('cmdextversion'), field('version', $._name)),

    // `for` sets.

    // `('command')`, or `` (`command`) `` with `usebackq`.
    command_string: _ => token(choice(/'[^'\r\n]*'/, /`[^`\r\n]*`/)),

    // A string runs to the closing quote or, as in cmd, the end of the line.
    // Its pieces outrank the pieces of a following word, so an unclosed
    // string still holds the rest of the line.
    string: $ => prec.right(seq('"', repeat($._string_content), optional($._close_quote))),
    _imm_string: $ => prec.right(seq(alias(imm('"'), '"'), repeat($._string_content), optional($._close_quote))),
    _close_quote: _ => alias(token(prec(STR, '"')), '"'),

    _string_content: $ => choice(
      $._string_text,
      alias($._str_variable, $.variable),
      alias($._str_delayed_variable, $.delayed_variable),
      alias($._str_parameter, $.parameter),
      alias($._str_for_variable, $.for_variable),
      alias($._str_percent_escape, $.escape_sequence),
      $._str_lone,
    ),

    // Inside quotes `^`, `&`, `|`, `<`, `>` and parentheses are text.
    _string_text: _ => token(prec(STR, /[^"\r\n%!]+/)),
    _str_lone: _ => token(prec(STR, /[%!]/)),
    _str_variable: _ => token(prec(STR, PIECE.variable)),
    _str_delayed_variable: _ => token(prec(STR, PIECE.delayed_variable)),
    _str_parameter: _ => token(prec(STR, PIECE.parameter)),
    _str_for_variable: _ => token(prec(STR, PIECE.for_variable)),
    _str_percent_escape: _ => token(prec(STR, PIECE._percent_escape)),

    // A `%` or `!` that does not start a variable is text.
    _lone: _ => token(prec(-1, /[%!]/)),
    _imm_lone: _ => token.immediate(prec(0, /[%!]/)),

    ...Object.fromEntries(Object.entries(PIECE).flatMap(([name, re]) => [
      [name, _ => token(re)],
      [`_imm${name.startsWith('_') ? '' : '_'}${name}`, _ => imm(re)],
    ])),

    // Inside `set "name=value"`.
    _quoted_variable_name: $ => repeat1(choice(
      /[^"\r\n%!=]+/,
      $.variable,
      $.delayed_variable,
      $.parameter,
      $.for_variable,
      alias($._percent_escape, $.escape_sequence),
      $._lone,
    )),
    _quoted_value: $ => repeat1($._string_content),
  },
});

// The non-text pieces of a word, plain or immediate.
function pieces($, pre) {
  const p = name => $[`${pre}${pre && !name.startsWith('_') ? '_' : ''}${name}`];
  return [
    pre ? alias($._imm_string, $.string) : $.string,
    pre ? alias(p('variable'), $.variable) : $.variable,
    pre ? alias(p('delayed_variable'), $.delayed_variable) : $.delayed_variable,
    pre ? alias(p('parameter'), $.parameter) : $.parameter,
    pre ? alias(p('for_variable'), $.for_variable) : $.for_variable,
    alias(p('_caret_escape'), $.escape_sequence),
    alias(p('_percent_escape'), $.escape_sequence),
    alias(pre ? $._imm_lone : $._lone, $.word),
  ];
}

// `_arg`, `_arg_block`, `_name` and `_item`: one piece, or a concatenation.
function wordRules() {
  const rules = {};
  for (const [kind, re] of Object.entries(TEXT)) {
    const text = kind === 'name' ? '_word' : `_${kind}_text`;
    if (kind !== 'name') rules[text] = _ => re;
    rules[`_imm_${kind}_text`] = _ => imm(re);
    rules[`_${kind}_piece`] = $ => choice(alias($[text], $.word), ...pieces($, ''));
    rules[`_${kind}_concatenation`] = $ => prec.left(1, seq(
      $[`_${kind}_piece`],
      repeat1(choice(alias($[`_imm_${kind}_text`], $.word), ...pieces($, '_imm'))),
    ));
    rules[`_${kind}`] = $ => choice(
      $[`_${kind}_piece`],
      alias($[`_${kind}_concatenation`], $.concatenation),
    );
  }
  return rules;
}

function statementRules() {
  const rules = {};
  for (const ctx of CONTEXTS) {
    // Rule names in this context, aliased to the top-level node names.
    const r = ($, name) => ctx ? alias($[`_${name}${ctx}`], $[name]) : $[name];
    const def = (name, fn) => { rules[ctx ? `_${name}${ctx}` : name] = fn; };
    const arg = $ => $[`_arg${ctx}`];
    const stmt = $ => $[`_statement${ctx}`];

    rules[`_statement${ctx}`] = $ => choice(
      r($, 'list'),
      r($, 'pipeline'),
      r($, 'command'),
      r($, 'set_statement'),
      r($, 'if_statement'),
      r($, 'for_statement'),
      r($, 'block'),
      $.comment,
    );

    // `a & b` runs both, `a && b` runs b if a succeeds, `a || b` if it
    // fails. `&&` and `||` bind tighter than `&`.
    def('list', $ => choice(
      prec.left(1, seq(field('left', stmt($)), field('operator', '&'), field('right', stmt($)))),
      prec.left(2, seq(field('left', stmt($)), field('operator', choice('&&', '||')), field('right', stmt($)))),
    ));

    def('pipeline', $ => prec.left(3, seq(stmt($), '|', stmt($))));

    def('command', $ => seq(
      optional($._at),
      field('name', $.command_name),
      repeat(choice(field('argument', arg($)), field('redirect', r($, 'redirect')))),
    ));

    // `>file`, `>>file`, `<file`, `2>file`, `2>&1`.
    def('redirect', $ => choice(
      seq(
        field('operator', choice(
          alias(/[0-9]?>/, '>'),
          alias(/[0-9]?>>/, '>>'),
          alias(/[0-9]?</, '<'),
        )),
        field('destination', arg($)),
      ),
      field('operator', choice(
        alias(/[0-9]?>&[0-9]/, '>&'),
        alias(/[0-9]?<&[0-9]/, '<&'),
      )),
    ));

    def('block', $ => seq(
      optional($._at),
      $._block_body,
      repeat(field('redirect', r($, 'redirect'))),
    ));

    // `set`, `set name=value`, `set "name=value"`, `set /a expr`,
    // `set /p name=prompt`.
    def('set_statement', $ => seq(
      optional($._at),
      kw('set'),
      optional(choice(
        seq(field('option', kw('/a')), optional(field('value', r($, 'value')))),
        seq(optional(field('option', kw('/p'))), choice(
          seq(
            field('name', r($, 'variable_name')),
            optional(seq('=', optional(field('value', r($, 'value'))))),
          ),
          seq(
            '"',
            field('name', alias($._quoted_variable_name, $.variable_name)),
            optional(seq('=', optional(field('value', alias($._quoted_value, $.value))))),
            $._close_quote,
            // cmd ends the assignment at the last quote on the line, so
            // the rest is part of it.
            repeat(choice(alias($[`_imm_arg${ctx}_text`], $.word), ...pieces($, '_imm'), arg($))),
          ),
        )),
      )),
      repeat(field('redirect', r($, 'redirect'))),
    ));

    // An unquoted name runs to the `=`, blanks included, as cmd reads it:
    // `set a b=c` sets `a b`. One that starts with a quote is
    // `set "name=value"`.
    def('variable_name', $ => repeat1(choice(
      $[`_variable_name${ctx}_text`],
      $.variable,
      $.delayed_variable,
      $.parameter,
      $.for_variable,
      alias($._caret_escape, $.escape_sequence),
      alias($._percent_escape, $.escape_sequence),
      $._lone,
    )));
    rules[`_variable_name${ctx}_text`] = _ => ctx ? /[^\s"%!^&|<>=)][^\r\n"%!^&|<>=)]*/ : /[^\s"%!^&|<>=][^\r\n"%!^&|<>=]*/;

    // An unquoted value runs to the end of the command, blanks included.
    def('value', $ => repeat1(choice(
      $[`_value${ctx}_text`],
      $.string,
      $.variable,
      $.delayed_variable,
      $.parameter,
      $.for_variable,
      alias($._caret_escape, $.escape_sequence),
      alias($._percent_escape, $.escape_sequence),
      $._lone,
    )));
    rules[`_value${ctx}_text`] = _ => ctx ? /[^\s"%!^&|<>)][^\r\n"%!^&|<>)]*/ : /[^\s"%!^&|<>][^\r\n"%!^&|<>]*/;

    // `if [/i] [not] condition command [else command]`. `else` follows a
    // block on the same line.
    def('if_statement', $ => prec.right(seq(
      optional($._at),
      kw('if'),
      optional(kw('/i')),
      optional(kw('not')),
      field('condition', choice(
        $.comparison,
        $.exist_condition,
        $.defined_condition,
        $.errorlevel_condition,
        $.cmdextversion_condition,
      )),
      choice(
        field('consequence', stmt($)),
        seq(
          field('consequence', r($, 'block')),
          kw('else'),
          field('alternative', stmt($)),
        ),
      ),
    )));

    // `for [/d | /r [root] | /l | /f ["options"]] %%i in (set) do command`.
    def('for_statement', $ => prec.right(seq(
      optional($._at),
      kw('for'),
      repeat(field('option', choice(kw('/d'), kw('/r'), kw('/l'), kw('/f'), $._name))),
      field('variable', $.for_variable),
      kw('in'),
      '(',
      repeat(choice(field('item', choice($._item, $.command_string)), ',', ';', '=', $._newline)),
      ')',
      kw('do'),
      field('body', stmt($)),
    )));
  }

  return rules;
}
