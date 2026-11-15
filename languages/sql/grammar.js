/**
 * @file SQL grammar for tree-sitter
 * @license MIT
 *
 * One grammar for the SQL that PostgreSQL, SQLite and MySQL accept, plus the
 * psql and sqlite3 shell commands that appear in `.sql` files.
 *
 * There is no external scanner. The parts of SQL's lexical syntax that are not
 * regular are handled like this:
 *
 * - Dollar-quoted strings (`$tag$ ... $tag$`) end at the first copy of the
 *   opening tag. For `$$` and every tag in DOLLAR_TAGS, the body is one token
 *   whose regex is "text in which `$tag$` does not occur" (see `dollarBody`).
 *   Any other tag is read leniently: the string ends at the next `$word$`.
 * - Block comments nest in PostgreSQL and the SQL standard. Nesting up to
 *   COMMENT_DEPTH is spelled out as a regex. A comment that only closes when
 *   read without nesting (as SQLite and MySQL read it) is also accepted; the
 *   longest reading wins.
 * - `COPY ... FROM stdin;` in a psql script is followed by data lines up to a
 *   line `\.`. That is one regular token, valid only after such a statement.
 *
 * Keywords are case-insensitive regexes aliased to their upper-case spelling,
 * so they appear as anonymous nodes like `"SELECT"`. Tree-sitter only lexes a
 * word as a keyword where the keyword is valid, so most keywords can still be
 * used as names elsewhere (`SELECT type, key, value FROM t`).
 */

/// <reference types="tree-sitter-cli/dsl" />
// @ts-check

// The deepest nesting of block comments read exactly: `/* /* /* */ */ */`.
const COMMENT_DEPTH = 5;

// Dollar-quote tags read exactly. `$$` is always included.
const DOLLAR_TAGS = [
  'body', 'BODY', 'func', 'FUNC', 'function', 'FUNCTION', 'fn', 'proc',
  'procedure', 'sql', 'SQL', 'plpgsql', 'code', 'do', 'DO', 'doblock',
  'block', 'outer', 'inner', 'q', 'Q', 'x', 'y', 'z', 'a', 'b', 'c', 'd',
  'e', 'f', 'p', 's', 't', 're', 'pl', 'ex', 'cmd', 'query', 'trigger',
  'tag', 'EOF', 'eof', 'js', 'json', 'python', 'py', 'perl', 'tcl', 'main',
  'test', 'str', 'string', 'text', 'def', 'migration', '_',
];

const PREC = {
  or: 10,
  and: 20,
  not: 30,
  is: 40,
  comparison: 50,
  pattern: 60,
  default_value: 65,
  other: 70,
  additive: 80,
  multiplicative: 90,
  exponent: 100,
  at_time_zone: 110,
  collate: 120,
  unary: 130,
  subscript: 140,
  cast: 150,
  member: 160,
};

/**
 * A case-insensitive keyword, shown in the tree as its upper-case spelling.
 * Several words make a sequence of keywords.
 *
 * @param {string[]} words
 */
function kw(...words) {
  const one = w => {
    KEYWORDS.add(w);
    return keyword(w);
  };
  return words.length === 1 ? one(words[0]) : seq(...words.map(one));
}

// Every keyword used in the grammar, so that a run of plain tokens can
// contain any of them.
const KEYWORDS = new Set();

/** @param {string} w */
const keyword = w => alias(new RegExp(w, 'i'), w.toUpperCase());

const commaSep1 = rule => seq(rule, repeat(seq(',', rule)));
const commaSep = rule => optional(commaSep1(rule));
const parens = rule => seq('(', rule, ')');

/**
 * Regex source for the body of a dollar-quoted string with tag `tag`: text in
 * which `$tag$` does not occur, even once the closing `$tag$` is appended.
 *
 * Split the body at each `$`: a first piece with no `$`, then pieces that
 * each start with `$`. `$tag$` occurs exactly where a piece is `$tag`
 * followed by another `$` (the next piece or the closing tag). So every piece
 * after the first must be `$` and then anything with no `$` that is not
 * `tag`: a proper prefix of it, something longer that starts with it, or
 * something that differs from it at some character.
 *
 * The lexer takes the longest match, so the body must also not be able to
 * run into the closing tag: in ` x $body$`, ` x $bod` is a valid body and
 * longer than ` x `. So the last piece may not be a proper prefix of the
 * tag. Pieces that really end the body that way (`$f$ x$$f$`, `$a$$$$a$`)
 * belong to the closing token instead (`dollarClose`).
 *
 * @param {string} tag
 */
function dollarBody(tag) {
  const last = [];
  if (tag === '') {
    last.push('[^$]+');
  } else {
    last.push(`${tag}[^$]+`);
    for (let i = 0; i < tag.length; i++) {
      last.push(`${tag.slice(0, i)}[^$${tag[i]}][^$]*`);
    }
  }
  const any = `\\$(${[...properPrefixes(tag), ...last].join('|')})`;
  const end = `\\$(${last.join('|')})`;
  return `[^$]+((${any})*${end})?|(${any})*${end}`;
}

/**
 * Regex source for the closing tag of a dollar-quoted string, with any
 * pieces before it that are `$` and a proper prefix of the tag. It ends at
 * the first `$tag$`: the closing tag itself cannot be read as such pieces,
 * since `$tag` is not a proper prefix and `$ta` is not followed by `$`.
 *
 * @param {string} tag
 */
function dollarClose(tag) {
  const prefixes = properPrefixes(tag).join('|');
  return tag === '' ? '\\$\\$' : `(\\$(${prefixes}))*\\$${tag}\\$`;
}

/** @param {string} tag */
function properPrefixes(tag) {
  return Array.from({ length: tag.length }, (_, i) => tag.slice(0, i));
}

/** Regex source for a block comment nested at most `depth` deep. */
function nestedComment(depth) {
  // Text with no `/*` or `*/` in it, one segment at a time.
  const text = '[^*/]|\\*+[^*/]|\\/+[^*/]';
  let comment = `\\/\\*(${text})*\\*+\\/`;
  // A nested comment may follow a run of `/` (`/* //* */ */`).
  for (let d = 1; d <= depth; d++) {
    comment = `\\/\\*(${text}|\\/*${comment})*\\*+\\/`;
  }
  return comment;
}

module.exports = grammar({
  name: 'sql',

  extras: $ => [/\s/, $.comment],

  word: $ => $._identifier_token,

  supertypes: $ => [$._expression],

  inline: $ => [$._select_item, $._name],

  conflicts: $ => [
    [$.subquery, $.parenthesized_query],
    [$._token_before_is, $.object_reference],
    [$._column_name, $.table_constraint],
    [$.group_by_clause],
    [$.object_reference, $.parameter],
    [$._argument, $._expression],
    [$.create_type_statement, $._create_kind],
    [$.drop_statement, $._keyword],
    [$._if_exists, $._keyword],
  ],

  rules: {
    source_file: $ => seq(
      repeat($._item),
      optional($._statement),
    ),

    _item: $ => choice(
      seq($._statement, choice(';', $.meta_command)),
      seq(alias($._copy_from_stdin, $.copy_statement), ';', $.copy_data),
      seq(alias($._psql_copy_from_stdin, $.meta_command), $.copy_data),
      ';',
      $.meta_command,
      $.dot_command,
    ),

    // psql's backslash commands (`\set x 1`, `\d t`, `\gset`) run to the end
    // of the line. After a statement, they also end it.
    meta_command: _ => token(seq('\\', /[^\n]*/)),

    // `\copy t FROM STDIN`, which reads the lines after it as data.
    _psql_copy_from_stdin: _ => token(prec(1, seq(
      '\\',
      /[cC][oO][pP][yY][^\n]*[fF][rR][oO][mM]\s+[sS][tT][dD][iI][nN][^\n]*/,
    ))),

    // sqlite3's dot commands (`.mode csv`), only where a statement can start.
    dot_command: _ => token(seq('.', /[A-Za-z][^\n]*/)),

    _statement: $ => choice(
      $.select_statement,
      $.insert_statement,
      $.update_statement,
      $.delete_statement,
      $.merge_statement,
      $.create_table_statement,
      $.create_view_statement,
      $.create_index_statement,
      $.create_function_statement,
      $.create_trigger_statement,
      $.create_schema_statement,
      $.create_type_statement,
      $.create_statement,
      $.alter_table_statement,
      $.alter_statement,
      $.drop_statement,
      $.truncate_statement,
      $.transaction_statement,
      $.set_statement,
      $.reset_statement,
      $.show_statement,
      $.explain_statement,
      $.copy_statement,
      $.comment_statement,
      $.grant_statement,
      $.pragma_statement,
      $.attach_statement,
      $.detach_statement,
      $.use_statement,
      $.do_statement,
      $.call_statement,
      $.prepare_statement,
      $.execute_statement,
      $.deallocate_statement,
      $.declare_statement,
      $.cursor_statement,
      $.listen_statement,
      $.notify_statement,
      $.lock_statement,
      $.refresh_statement,
      $.describe_statement,
      $.maintenance_statement,
      // psql: a variable holding a statement (`:query;`).
      $.parameter,
    ),

    // Statements inside `BEGIN ... END` and trigger bodies.
    _block_statement: $ => choice(
      $.select_statement,
      $.insert_statement,
      $.update_statement,
      $.delete_statement,
      $.merge_statement,
      $.set_statement,
      $.call_statement,
    ),

    // Queries
    // -------

    select_statement: $ => prec.right(seq(
      optional($.with_clause),
      $._query_body,
      optional($.order_by_clause),
      repeat(choice(
        $.limit_clause,
        $.offset_clause,
        $.fetch_clause,
        $.locking_clause,
      )),
    )),

    _query_body: $ => choice(
      $.select,
      $.set_operation,
      $.parenthesized_query,
      $.values,
      $.table_statement,
    ),

    parenthesized_query: $ => parens($.select_statement),

    set_operation: $ => choice(
      prec.left(1, seq(
        field('left', $._query_body),
        field('operator', choice(kw('union'), kw('except'), kw('minus'))),
        optional($.set_quantifier),
        field('right', $._query_body),
      )),
      prec.left(2, seq(
        field('left', $._query_body),
        field('operator', kw('intersect')),
        optional($.set_quantifier),
        field('right', $._query_body),
      )),
    ),

    set_quantifier: $ => prec.right(choice(
      kw('all'),
      seq(kw('distinct'), optional(seq(kw('on'), $.tuple_or_parenthesized))),
    )),

    // `DISTINCT ON (a, b)`: a list of expressions in parentheses.
    tuple_or_parenthesized: $ => parens(commaSep1($._expression)),

    table_statement: $ => seq(kw('table'), optional(kw('only')), field('name', $.object_reference)),

    select: $ => prec.right(seq(
      kw('select'),
      optional($.set_quantifier),
      optional($.select_list),
      optional($.into_clause),
      optional($.from_clause),
      optional($.where_clause),
      optional($.group_by_clause),
      optional($.having_clause),
      optional($.window_clause),
      optional($.qualify_clause),
    )),

    select_list: $ => commaSep1($._select_item),

    _select_item: $ => choice($._expression, $.aliased_expression, $.all_columns),

    all_columns: _ => '*',

    aliased_expression: $ => choice(
      seq(
        field('value', $._expression),
        kw('as'),
        field('alias', choice($.identifier, $.string)),
      ),
      // Without AS, `[x]` would be a subscript, as in `a[1]`.
      seq(
        field('value', $._expression),
        field('alias', alias($._identifier_token, $.identifier)),
      ),
    ),

    into_clause: $ => seq(
      kw('into'),
      optional(choice(kw('temporary'), kw('temp'), kw('unlogged'))),
      optional(kw('table')),
      commaSep1($.object_reference),
    ),

    from_clause: $ => seq(kw('from'), commaSep1($._table_expression)),

    _table_expression: $ => choice(
      $.table_reference,
      $.join,
      $.derived_table,
      $.table_function,
      $.parenthesized_join,
    ),

    table_reference: $ => prec.right(seq(
      optional(kw('only')),
      field('name', choice($.object_reference, alias($._rows_name, $.object_reference))),
      optional('*'),
      optional($.alias),
      optional($.tablesample_clause),
      repeat($.index_hint),
    )),

    // `rows` is a keyword where `ROWS FROM (...)` can start.
    _rows_name: $ => field('name', alias(kw('rows'), $.identifier)),

    alias: $ => prec.right(seq(
      optional(kw('as')),
      field('name', $.identifier),
      optional($.column_aliases),
    )),

    column_aliases: $ => parens(commaSep1(seq(
      field('name', $.identifier),
      optional(field('type', $.type)),
    ))),

    tablesample_clause: $ => seq(
      kw('tablesample'),
      field('method', $.identifier),
      $.argument_list,
      optional(seq(kw('repeatable'), parens($._expression))),
    ),

    // MySQL's `USE INDEX (i)`, `FORCE INDEX (i)`, `IGNORE INDEX (i)`, and
    // SQLite's `INDEXED BY i` / `NOT INDEXED`.
    index_hint: $ => choice(
      seq(
        choice(kw('use'), kw('force'), kw('ignore')),
        choice(kw('index'), kw('key')),
        optional(seq(kw('for'), choice(kw('join'), kw('order', 'by'), kw('group', 'by')))),
        parens(commaSep($.identifier)),
      ),
      seq(kw('indexed', 'by'), $.identifier),
      kw('not', 'indexed'),
    ),

    derived_table: $ => prec.right(seq(
      optional(kw('lateral')),
      $.subquery,
      optional($.alias),
      optional($.tablesample_clause),
    )),

    table_function: $ => prec.right(seq(
      optional(kw('lateral')),
      choice(
        $.function_call,
        seq(kw('rows', 'from'), parens(commaSep1(seq(
          $.function_call,
          optional(seq(kw('as'), $.column_aliases)),
        )))),
      ),
      optional(kw('with', 'ordinality')),
      optional($.alias),
    )),

    parenthesized_join: $ => prec.right(seq(parens($._table_expression), optional($.alias))),

    join: $ => choice(
      prec.left(1, seq(
        field('left', $._table_expression),
        $._join_keyword,
        field('right', $._table_expression),
      )),
      prec.right(2, seq(
        field('left', $._table_expression),
        $._join_keyword,
        field('right', $._table_expression),
        choice(
          seq(kw('on'), field('condition', $._expression)),
          seq(kw('using'), field('using', $.column_list), optional(seq(kw('as'), $.identifier))),
        ),
      )),
      prec.left(1, seq(
        field('left', $._table_expression),
        choice(kw('cross', 'apply'), kw('outer', 'apply')),
        field('right', $._table_expression),
      )),
    ),

    _join_keyword: $ => choice(
      seq(optional(kw('natural')), optional($.join_type), kw('join')),
      kw('straight_join'),
    ),

    join_type: _ => choice(
      kw('inner'),
      kw('cross'),
      seq(choice(kw('left'), kw('right'), kw('full')), optional(kw('outer'))),
    ),

    column_list: $ => parens(commaSep1(seq(optional(kw('period')), $.identifier))),

    where_clause: $ => seq(
      kw('where'),
      choice(
        $._expression,
        seq(kw('current', 'of'), $.identifier),
      ),
    ),

    group_by_clause: $ => seq(
      kw('group', 'by'),
      optional(choice(kw('all'), kw('distinct'))),
      commaSep1($._grouping_element),
      optional(kw('with', 'rollup')),
    ),

    _grouping_element: $ => choice(
      $._expression,
      $.grouping_sets,
    ),

    grouping_sets: $ => seq(
      kw('grouping', 'sets'),
      parens(commaSep1($._grouping_element)),
    ),

    having_clause: $ => seq(kw('having'), $._expression),

    window_clause: $ => seq(
      kw('window'),
      commaSep1(seq(
        field('name', $.identifier),
        kw('as'),
        $.window_definition,
      )),
    ),

    qualify_clause: $ => seq(kw('qualify'), $._expression),

    order_by_clause: $ => seq(kw('order', 'by'), commaSep1($.order_by_item)),

    order_by_item: $ => seq(
      $._expression,
      optional(choice(
        kw('asc'),
        kw('desc'),
        seq(kw('using'), choice($._operator, $.operator_call)),
      )),
      optional(seq(kw('nulls'), choice(kw('first'), kw('last')))),
    ),

    limit_clause: $ => seq(
      kw('limit'),
      choice(kw('all'), $._expression),
      optional(seq(',', $._expression)),
    ),

    offset_clause: $ => prec.right(seq(
      kw('offset'),
      $._expression,
      optional(choice(kw('row'), kw('rows'))),
    )),

    fetch_clause: $ => seq(
      kw('fetch'),
      choice(kw('first'), kw('next')),
      optional($._expression),
      choice(kw('row'), kw('rows')),
      choice(kw('only'), kw('with', 'ties')),
    ),

    locking_clause: $ => prec.right(seq(
      kw('for'),
      choice(
        kw('update'),
        kw('no', 'key', 'update'),
        kw('share'),
        kw('key', 'share'),
      ),
      optional(seq(kw('of'), commaSep1($.object_reference))),
      optional(choice(kw('nowait'), kw('skip', 'locked'))),
    )),

    values: $ => seq(
      kw('values'),
      commaSep1(choice(
        alias($._values_row, $.tuple),
        seq(kw('row'), alias($._values_row, $.tuple)),
      )),
    ),

    _values_row: $ => parens(commaSep($._expression)),

    with_clause: $ => seq(
      kw('with'),
      optional(kw('recursive')),
      commaSep1($.cte),
    ),

    cte: $ => seq(
      field('name', $.identifier),
      optional($.column_list),
      kw('as'),
      optional(seq(optional(kw('not')), kw('materialized'))),
      '(',
      field('query', choice(
        $.select_statement,
        $.insert_statement,
        $.update_statement,
        $.delete_statement,
        $.merge_statement,
      )),
      ')',
      optional($.search_clause),
      optional($.cycle_clause),
    ),

    search_clause: $ => seq(
      kw('search'),
      choice(kw('depth'), kw('breadth')),
      kw('first', 'by'),
      commaSep1($.identifier),
      kw('set'),
      $.identifier,
    ),

    cycle_clause: $ => seq(
      kw('cycle'),
      commaSep1($.identifier),
      kw('set'),
      $.identifier,
      optional(seq(kw('to'), $._expression, kw('default'), $._expression)),
      kw('using'),
      $.identifier,
    ),

    // Data changes
    // ------------

    insert_statement: $ => seq(
      optional($.with_clause),
      choice(kw('insert'), kw('replace')),
      optional($.conflict_resolution),
      optional(choice(kw('ignore'), kw('low_priority'), kw('delayed'), kw('high_priority'))),
      optional(kw('into')),
      field('table', $.object_reference),
      optional(seq(kw('as'), field('alias', $.identifier))),
      optional(alias($.target_columns, $.column_list)),
      optional(seq(kw('overriding'), choice(kw('system'), kw('user')), kw('value'))),
      choice(
        $.select_statement,
        kw('default', 'values'),
        seq(kw('set'), commaSep1($.assignment)),
      ),
      repeat($.on_conflict_clause),
      optional($.on_duplicate_key_clause),
      optional($.returning_clause),
    ),

    // SQLite's `INSERT OR REPLACE`, `UPDATE OR IGNORE`.
    conflict_resolution: _ => seq(
      kw('or'),
      choice(kw('abort'), kw('fail'), kw('ignore'), kw('replace'), kw('rollback')),
    ),

    on_conflict_clause: $ => seq(
      kw('on', 'conflict'),
      optional(choice(
        seq(parens(commaSep1($.index_column)), optional($.where_clause)),
        seq(kw('on', 'constraint'), $.identifier),
      )),
      kw('do'),
      choice(
        kw('nothing'),
        seq(kw('update', 'set'), commaSep1($.assignment), optional($.where_clause)),
        seq(kw('select'), optional($.locking_clause), optional($.where_clause)),
      ),
    ),

    on_duplicate_key_clause: $ => seq(
      kw('on', 'duplicate', 'key', 'update'),
      commaSep1($.assignment),
    ),

    returning_clause: $ => seq(
      kw('returning'),
      optional(seq(kw('with'), parens(commaSep1(seq(choice(kw('old'), kw('new')), kw('as'), $.identifier))))),
      $.select_list,
      optional($.into_clause),
    ),

    assignment: $ => seq(
      field('left', choice($._assignment_target, $.column_list)),
      '=',
      field('right', $._expression),
    ),

    _assignment_target: $ => choice(
      $.identifier,
      $.column_reference,
      alias($._target_indirection, $.subscript_expression),
    ),

    // `a[1:2]`, `f4[1].if2[1]`: a column with subscripts and fields, as the
    // target of an assignment or an INSERT.
    _target_indirection: $ => seq(
      field('value', choice($.identifier, $.column_reference)),
      $._subscript,
      repeat(choice($._subscript, seq('.', $.identifier))),
    ),

    _subscript: $ => seq(
      '[',
      choice(
        field('index', $._expression),
        seq(optional(field('lower', $._expression)), ':', optional(field('upper', $._expression))),
      ),
      ']',
    ),

    target_columns: $ => parens(commaSep1($._assignment_target)),

    update_statement: $ => seq(
      optional($.with_clause),
      kw('update'),
      optional($.conflict_resolution),
      optional(kw('low_priority')),
      optional(kw('ignore')),
      field('table', $._table_expression),
      kw('set'),
      commaSep1($.assignment),
      optional($.from_clause),
      optional($.where_clause),
      optional($.returning_clause),
      optional($.order_by_clause),
      repeat(choice($.limit_clause, $.offset_clause)),
    ),

    delete_statement: $ => seq(
      optional($.with_clause),
      kw('delete'),
      optional(kw('low_priority')),
      optional(kw('quick')),
      optional(kw('ignore')),
      kw('from'),
      field('table', $.table_reference),
      optional(seq(kw('using'), commaSep1($._table_expression))),
      optional($.where_clause),
      optional($.returning_clause),
      optional($.order_by_clause),
      repeat(choice($.limit_clause, $.offset_clause)),
    ),

    merge_statement: $ => seq(
      optional($.with_clause),
      kw('merge'),
      optional(kw('into')),
      field('target', $.table_reference),
      kw('using'),
      field('source', $._table_expression),
      kw('on'),
      field('condition', $._expression),
      repeat1($.merge_when_clause),
      optional($.returning_clause),
    ),

    merge_when_clause: $ => seq(
      kw('when'),
      optional(kw('not')),
      kw('matched'),
      optional(seq(kw('by'), choice(kw('source'), kw('target')))),
      optional(seq(kw('and'), field('condition', $._expression))),
      kw('then'),
      choice(
        seq(kw('update', 'set'), commaSep1($.assignment)),
        kw('delete'),
        seq(
          kw('insert'),
          optional(alias($.target_columns, $.column_list)),
          optional(seq(kw('overriding'), choice(kw('system'), kw('user')), kw('value'))),
          choice($.values, kw('default', 'values')),
        ),
        kw('do', 'nothing'),
      ),
    ),

    // Definitions
    // -----------

    _or_replace: _ => kw('or', 'replace'),
    _if_not_exists: _ => kw('if', 'not', 'exists'),
    _if_exists: _ => kw('if', 'exists'),

    _temporary: _ => choice(
      kw('temp'),
      kw('temporary'),
      seq(choice(kw('global'), kw('local')), choice(kw('temp'), kw('temporary'))),
      kw('unlogged'),
    ),

    create_table_statement: $ => seq(
      kw('create'),
      optional($._or_replace),
      optional($._temporary),
      optional(choice(kw('foreign'), kw('virtual'))),
      kw('table'),
      optional($._if_not_exists),
      field('name', $.object_reference),
      choice(
        seq(
          kw('partition', 'of'),
          field('parent', $.object_reference),
          optional($.table_elements),
          $.partition_bound,
          repeat($.table_option),
        ),
        seq(
          optional(seq(kw('of'), field('type', $.object_reference))),
          optional($.table_elements),
          repeat($.table_option),
          optional(seq(kw('as'), choice($.select_statement, $.execute_statement), optional($.with_data))),
        ),
      ),
    ),

    table_elements: $ => parens(commaSep(choice(
      $.column_definition,
      $.table_constraint,
      $.like_clause,
    ))),

    like_clause: $ => seq(
      kw('like'),
      $.object_reference,
      repeat(seq(choice(kw('including'), kw('excluding')), $.identifier)),
    ),

    partition_bound: $ => choice(
      seq(kw('for', 'values'), choice(
        seq(kw('in'), parens(commaSep1($._expression))),
        seq(kw('from'), parens(commaSep1($._expression)), kw('to'), parens(commaSep1($._expression))),
        seq(kw('with'), parens(commaSep1(seq($.identifier, $._expression)))),
      )),
      prec(1, kw('default')),
    ),

    with_data: _ => seq(kw('with'), optional(kw('no')), kw('data')),

    table_option: $ => choice(
      seq(kw('inherits'), parens(commaSep1($.object_reference))),
      seq(kw('partition', 'by'), $.identifier, parens(commaSep1($.index_column))),
      seq(kw('using'), field('module', $.identifier), optional($.token_group)),
      seq(kw('with'), choice($.storage_parameters, $.identifier)),
      seq(kw('without'), $.identifier),
      seq(kw('on', 'commit'), choice(kw('preserve', 'rows'), kw('delete', 'rows'), kw('drop'))),
      seq(kw('tablespace'), $.identifier),
      seq(kw('server'), $.identifier),
      seq(kw('options'), $.storage_parameters),
      kw('strict'),
      ',',
      // MySQL: `ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='...'`.
      seq(
        optional(kw('default')),
        choice($.identifier, kw('character', 'set')),
        optional('='),
        choice($.identifier, $.string, $.number, kw('default')),
      ),
      seq(kw('comment'), optional('='), $.string),
      seq(kw('collate'), optional('='), $.identifier),
      seq(kw('auto_increment'), optional('='), $.number),
    ),

    storage_parameters: $ => parens(commaSep1(seq(
      field('name', $._dotted_name),
      optional(seq(optional('='), field('value', $._option_value))),
    ))),

    _dotted_name: $ => seq($.identifier, repeat(seq('.', $.identifier))),

    _option_value: $ => choice(
      $.identifier,
      $.string,
      $.number,
      $.unary_expression,
      kw('true'),
      kw('false'),
      kw('null'),
      kw('default'),
      kw('on'),
      kw('off'),
    ),

    column_definition: $ => seq(
      field('name', $._column_name),
      optional(field('type', alias($._column_type, $.type))),
      repeat($.column_constraint),
    ),

    // Words that are keywords somewhere a column can be named.
    _column_name: $ => choice(
      $.identifier,
      alias(choice(
        kw('key'),
        kw('index'),
        kw('fulltext'),
        kw('spatial'),
        kw('period'),
      ), $.identifier),
    ),

    // A column's type may run over several words (`unsigned big int`,
    // `int unsigned zerofill`, `varchar(10) character set utf8`).
    _column_type: $ => prec.right(seq(
      $._type_name,
      repeat(choice(
        $.identifier,
        kw('precision'),
        kw('varying'),
        $.type_arguments,
        $.time_zone,
      )),
      repeat($.array_size),
    )),

    column_constraint: $ => prec.right(seq(
      optional(seq(kw('constraint'), field('name', $.identifier))),
      choice(
        seq(optional(kw('not')), kw('null'), optional($.on_conflict_resolution)),
        prec(PREC.default_value, seq(kw('default'), field('default', $._expression))),
        seq(kw('primary', 'key'), optional(choice(kw('asc'), kw('desc'))), repeat($._index_parameter), optional($.on_conflict_resolution), optional(kw('autoincrement'))),
        seq(kw('unique'), optional(kw('key')), optional($.nulls_distinct), repeat($._index_parameter), optional($.on_conflict_resolution)),
        seq(kw('check'), parens($._expression)),
        $.references_clause,
        seq(
          optional(seq(kw('generated'), choice(kw('always'), kw('by', 'default')))),
          kw('as'),
          choice(
            seq(parens($._expression), optional(choice(kw('stored'), kw('virtual')))),
            seq(kw('identity'), optional($.token_group)),
          ),
        ),
        kw('auto_increment'),
        kw('autoincrement'),
        seq(kw('comment'), $.string),
        seq(kw('on', 'update'), $._expression),
        seq(kw('collate'), $.object_reference),
        $._deferrable,
        seq(kw('compression'), $.identifier),
        seq(kw('storage'), $.identifier),
        kw('invisible'),
        kw('visible'),
      ),
    )),

    nulls_distinct: _ => seq(kw('nulls'), optional(kw('not')), kw('distinct')),

    on_conflict_resolution: _ => seq(
      kw('on', 'conflict'),
      choice(kw('rollback'), kw('abort'), kw('fail'), kw('ignore'), kw('replace')),
    ),

    _deferrable: _ => choice(
      seq(optional(kw('not')), kw('deferrable')),
      seq(kw('initially'), choice(kw('deferred'), kw('immediate'))),
      seq(kw('not'), kw('enforced')),
      kw('enforced'),
      kw('not', 'valid'),
      kw('no', 'inherit'),
    ),

    references_clause: $ => prec.right(seq(
      kw('references'),
      field('table', $.object_reference),
      optional($.column_list),
      repeat(choice(
        seq(kw('match'), choice(kw('full'), kw('partial'), kw('simple'))),
        seq(kw('on'), choice(kw('delete'), kw('update')), $.referential_action),
        $._deferrable,
      )),
    )),

    referential_action: $ => choice(
      kw('cascade'),
      kw('restrict'),
      kw('no', 'action'),
      seq(kw('set'), choice(kw('null'), kw('default')), optional($.column_list)),
    ),

    table_constraint: $ => prec.right(seq(
      optional(seq(kw('constraint'), field('name', $.identifier))),
      choice(
        seq(
          kw('primary', 'key'),
          parens(commaSep1($.index_column)),
          repeat($._index_parameter),
          optional($.on_conflict_resolution),
        ),
        seq(
          kw('unique'),
          optional(choice(kw('key'), kw('index'))),
          optional(field('index', $.identifier)),
          optional($.nulls_distinct),
          parens(commaSep1($.index_column)),
          repeat($._index_parameter),
          optional($.on_conflict_resolution),
        ),
        seq(kw('check'), parens($._expression)),
        seq(kw('not', 'null'), field('column', $._column_name)),
        seq(choice(kw('primary', 'key'), kw('unique')), kw('using', 'index'), field('index', $.identifier)),
        seq(
          kw('foreign', 'key'),
          optional(field('index', $.identifier)),
          $.column_list,
          $.references_clause,
        ),
        seq(
          kw('exclude'),
          optional(seq(kw('using'), $.identifier)),
          parens(commaSep1(seq($.index_column, kw('with'), $._operator))),
          repeat($._index_parameter),
          optional(seq(kw('where'), parens($._expression))),
        ),
        seq(
          optional(choice(kw('fulltext'), kw('spatial'))),
          choice(kw('key'), kw('index')),
          optional(field('index', $.identifier)),
          parens(commaSep1($.index_column)),
        ),
      ),
      repeat($._deferrable),
    )),

    _index_parameter: $ => choice(
      seq(kw('include'), parens(commaSep1($._expression))),
      seq(kw('with'), $.storage_parameters),
      seq(kw('using', 'index', 'tablespace'), $.identifier),
      seq(kw('using'), choice(kw('btree'), kw('hash'))),
    ),

    index_column: $ => prec.right(seq(
      $._expression,
      optional(seq(kw('collate'), $.object_reference)),
      optional(seq(field('operator_class', $.object_reference), optional($.storage_parameters))),
      optional(choice(kw('asc'), kw('desc'))),
      optional(seq(kw('nulls'), choice(kw('first'), kw('last')))),
      optional(kw('without', 'overlaps')),
    )),

    create_view_statement: $ => seq(
      kw('create'),
      optional($._or_replace),
      optional($._temporary),
      optional(kw('recursive')),
      optional(kw('materialized')),
      kw('view'),
      optional($._if_not_exists),
      field('name', $.object_reference),
      optional(alias($._view_columns, $.column_list)),
      optional(seq(kw('using'), $.identifier)),
      optional(seq(kw('with'), $.storage_parameters)),
      optional(seq(kw('tablespace'), $.identifier)),
      kw('as'),
      $.select_statement,
      optional(choice(
        seq(kw('with'), optional(choice(kw('cascaded'), kw('local'))), kw('check', 'option')),
        $.with_data,
      )),
    ),

    _view_columns: $ => parens(commaSep1(seq($.identifier, optional(seq(kw('collate'), $.identifier))))),

    create_index_statement: $ => seq(
      kw('create'),
      optional(choice(kw('unique'), kw('fulltext'), kw('spatial'))),
      kw('index'),
      optional(kw('concurrently')),
      optional($._if_not_exists),
      optional(field('name', $.object_reference)),
      kw('on'),
      optional(kw('only')),
      field('table', $.object_reference),
      optional(seq(kw('using'), field('method', $.identifier))),
      parens(commaSep1($.index_column)),
      repeat(choice($._index_parameter, $.nulls_distinct, seq(kw('tablespace'), $.identifier))),
      optional($.where_clause),
    ),

    create_function_statement: $ => seq(
      kw('create'),
      optional($._or_replace),
      optional(seq(kw('definer'), '=', $._expression)),
      choice(kw('function'), kw('procedure')),
      optional($._if_not_exists),
      field('name', $.object_reference),
      field('parameters', $.function_parameters),
      repeat($._function_option),
    ),

    _parameter_mode: _ => choice(kw('in'), kw('out'), kw('inout'), kw('variadic')),

    function_parameters: $ => parens(commaSep($.function_parameter)),

    function_parameter: $ => seq(
      optional($._parameter_mode),
      optional(field('name', $.identifier)),
      optional($._parameter_mode),
      field('type', $.type),
      optional(seq(choice(kw('default'), '='), field('default', $._expression))),
    ),

    _function_option: $ => choice(
      seq(kw('returns'), field('return_type', choice(
        $.type,
        seq(kw('setof'), $.type),
        seq(kw('table'), parens(commaSep1(seq($.identifier, $.type)))),
        kw('trigger'),
      ))),
      seq(kw('language'), field('language', choice($.identifier, $.string))),
      seq(kw('as'), field('body', choice($._string_literal, $.parameter)), optional(seq(',', $._string_literal))),
      kw('immutable'),
      kw('stable'),
      kw('volatile'),
      seq(optional(kw('not')), kw('leakproof')),
      kw('called', 'on', 'null', 'input'),
      kw('returns', 'null', 'on', 'null', 'input'),
      kw('strict'),
      seq(optional(kw('external')), kw('security'), choice(kw('definer'), kw('invoker'))),
      seq(kw('parallel'), $.identifier),
      seq(kw('cost'), $.number),
      seq(kw('rows'), $.number),
      seq(kw('support'), $.object_reference),
      seq(kw('set'), $.identifier, choice(seq(choice(kw('to'), '='), commaSep1($._option_value)), kw('from', 'current'))),
      kw('window'),
      seq(kw('transform'), commaSep1(seq(kw('for', 'type'), $.type))),
      seq(optional(kw('not')), kw('deterministic')),
      seq(kw('return'), field('body', $._expression)),
      field('body', $.atomic_block),
    ),

    // `BEGIN ATOMIC ... END` (PostgreSQL) and the statement list of a SQLite
    // trigger.
    atomic_block: $ => seq(
      kw('begin'),
      optional(kw('atomic')),
      repeat(seq(optional($._block_statement), ';')),
      kw('end'),
    ),

    create_trigger_statement: $ => seq(
      kw('create'),
      optional($._or_replace),
      optional($._temporary),
      optional(kw('constraint')),
      kw('trigger'),
      optional($._if_not_exists),
      field('name', $.object_reference),
      optional(choice(kw('before'), kw('after'), kw('instead', 'of'))),
      $.trigger_event,
      repeat(seq(kw('or'), $.trigger_event)),
      kw('on'),
      field('table', $.object_reference),
      repeat(choice(
        seq(kw('from'), $.object_reference),
        $._deferrable,
        seq(kw('referencing'), repeat1(seq(
          choice(kw('old'), kw('new')),
          choice(kw('table'), kw('row')),
          optional(kw('as')),
          $.identifier,
        ))),
        seq(kw('for'), optional(kw('each')), choice(kw('row'), kw('statement'))),
        seq(kw('when'), field('condition', $._expression)),
      )),
      choice(
        seq(kw('execute'), choice(kw('function'), kw('procedure')), $.function_call),
        $.atomic_block,
        $.insert_statement,
        $.update_statement,
        $.delete_statement,
        $.set_statement,
        $.call_statement,
      ),
    ),

    trigger_event: $ => choice(
      kw('insert'),
      seq(kw('update'), optional(seq(kw('of'), commaSep1($.identifier)))),
      kw('delete'),
      kw('truncate'),
    ),

    create_schema_statement: $ => prec.right(seq(
      kw('create'),
      choice(kw('schema'), kw('database')),
      optional($._if_not_exists),
      choice(
        field('name', $.object_reference),
        seq(kw('authorization'), $.identifier),
      ),
      repeat(choice(
        seq(kw('authorization'), $.identifier),
        seq(optional(kw('default')), choice(kw('character', 'set'), kw('charset'), kw('collate')), optional('='), choice($.identifier, $.string)),
        kw('with'),
        seq($.identifier, optional('='), $._option_value),
      )),
      repeat(choice(
        $.create_table_statement,
        $.create_view_statement,
        $.create_index_statement,
        $.create_trigger_statement,
        $.create_statement,
        $.grant_statement,
      )),
    )),

    create_type_statement: $ => seq(
      kw('create'),
      kw('type'),
      field('name', $.object_reference),
      kw('as'),
      choice(
        seq(kw('enum'), parens(commaSep($.string))),
        parens(commaSep(seq(
          field('attribute', $.identifier),
          $.type,
          optional(seq(kw('collate'), $.object_reference)),
        ))),
        seq(kw('range'), $.token_group),
      ),
    ),

    // Every other CREATE: the object kind, then the rest as plain tokens.
    create_statement: $ => seq(
      kw('create'),
      optional($._or_replace),
      repeat(choice(kw('trusted'), kw('procedural'), kw('default'), kw('unique'))),
      field('kind', alias($._create_kind, $.object_kind)),
      repeat($._token),
    ),

    object_kind: $ => choice(
      $._create_kind,
      kw('database'),
      kw('schema'),
      seq(kw('materialized'), kw('view')),
      kw('view'),
      kw('table'),
      seq(kw('foreign'), kw('table')),
      kw('index'),
      kw('trigger'),
      kw('function'),
      kw('procedure'),
    ),

    _create_kind: _ => choice(
      kw('aggregate'),
      kw('operator'),
      prec(1, seq(kw('operator'), choice(kw('class'), kw('family')))),
      kw('collation'),
      kw('conversion'),
      seq(kw('text', 'search'), choice(kw('configuration'), kw('dictionary'), kw('parser'), kw('template'))),
      kw('foreign', 'data', 'wrapper'),
      kw('server'),
      prec(1, kw('user', 'mapping')),
      kw('publication'),
      kw('subscription'),
      kw('policy'),
      kw('rule'),
      kw('statistics'),
      kw('access', 'method'),
      prec(1, kw('event', 'trigger')),
      kw('event'),
      kw('transform'),
      kw('cast'),
      kw('language'),
      kw('tablespace'),
      kw('role'),
      kw('user'),
      kw('group'),
      kw('sequence'),
      seq(choice(kw('temp'), kw('temporary'), kw('unlogged')), kw('sequence')),
      kw('type'),
      kw('domain'),
      kw('extension'),
      kw('routine'),
      kw('owned'),
      kw('large', 'object'),
      kw('system'),
      prec(1, kw('default', 'privileges')),
    ),

    alter_table_statement: $ => seq(
      kw('alter'),
      optional(kw('foreign')),
      kw('table'),
      optional($._if_exists),
      optional(kw('only')),
      field('name', $.object_reference),
      optional('*'),
      commaSep1($._alter_table_action),
    ),

    _alter_table_action: $ => choice(
      $.add_column,
      $.add_constraint,
      $.drop_column,
      $.drop_constraint,
      $.alter_column,
      $.rename,
      $.alter_table_action,
    ),

    add_column: $ => seq(
      kw('add'),
      optional(kw('column')),
      optional($._if_not_exists),
      $.column_definition,
      optional(choice(kw('first'), seq(kw('after'), $.identifier))),
    ),

    add_constraint: $ => seq(kw('add'), $.table_constraint),

    drop_column: $ => seq(
      kw('drop'),
      optional(kw('column')),
      optional($._if_exists),
      field('name', $._column_name),
      optional(choice(kw('cascade'), kw('restrict'))),
    ),

    drop_constraint: $ => seq(
      kw('drop', 'constraint'),
      optional($._if_exists),
      field('name', $.identifier),
      optional(choice(kw('cascade'), kw('restrict'))),
    ),

    alter_column: $ => seq(
      kw('alter'),
      optional(kw('column')),
      field('name', $._column_name),
      repeat1($._token_no_comma),
    ),

    rename: $ => seq(
      kw('rename'),
      optional(choice(kw('column'), kw('constraint'))),
      optional(field('old', $._column_name)),
      kw('to'),
      field('new', $._column_name),
    ),

    // Any other action, as plain tokens.
    alter_table_action: $ => seq(
      choice(
        kw('set'), kw('owner'),
        kw('enable'), kw('disable'), kw('reset'), kw('cluster'), kw('inherit'),
        kw('no'), kw('replica'), kw('force'), kw('attach'), kw('detach'),
        kw('validate'), kw('of'), kw('not'), kw('modify'), kw('change'),
        kw('engine'), kw('options'),
      ),
      repeat($._token_no_comma),
    ),

    alter_statement: $ => seq(
      kw('alter'),
      field('kind', alias(choice(
        $._create_kind,
        kw('database'),
        kw('schema'),
        seq(kw('materialized'), kw('view')),
        kw('view'),
        kw('index'),
        kw('trigger'),
        kw('function'),
        kw('procedure'),
      ), $.object_kind)),
      repeat($._token),
    ),

    drop_statement: $ => seq(
      kw('drop'),
      field('kind', $.object_kind),
      choice(
        seq(
          optional(kw('concurrently')),
          optional($._if_exists),
          commaSep1(seq($.object_reference, optional($.function_parameters))),
          optional(seq(kw('on'), field('table', $.object_reference))),
          optional(choice(kw('cascade'), kw('restrict'))),
        ),
        prec.dynamic(-1, repeat1($._token)),
      ),
    ),

    truncate_statement: $ => seq(
      kw('truncate'),
      optional(kw('table')),
      commaSep1(seq(optional(kw('only')), $.object_reference, optional('*'))),
      optional(seq(choice(kw('restart'), kw('continue')), kw('identity'))),
      optional(choice(kw('cascade'), kw('restrict'))),
    ),

    // Other statements
    // ----------------

    transaction_statement: $ => prec.right(choice(
      seq(
        choice(kw('begin'), kw('start')),
        optional(choice(kw('deferred'), kw('immediate'), kw('exclusive'))),
        optional(choice(kw('work'), kw('transaction'))),
        commaSep($.transaction_mode),
      ),
      seq(
        choice(kw('commit'), kw('end'), kw('abort'), kw('rollback')),
        optional(choice(kw('work'), kw('transaction'))),
        optional(seq(kw('and'), optional(kw('no')), kw('chain'))),
        optional(seq(kw('to'), optional(kw('savepoint')), $.identifier)),
      ),
      seq(choice(kw('commit'), kw('rollback')), kw('prepared'), $.string),
      seq(kw('prepare', 'transaction'), $.string),
      seq(kw('savepoint'), $.identifier),
      seq(kw('release'), optional(kw('savepoint')), $.identifier),
    )),

    transaction_mode: $ => choice(
      seq(kw('isolation', 'level'), choice(
        kw('serializable'),
        kw('repeatable', 'read'),
        kw('read', 'committed'),
        kw('read', 'uncommitted'),
      )),
      kw('read', 'write'),
      kw('read', 'only'),
      seq(kw('snapshot'), $.string),
      seq(optional(kw('not')), kw('deferrable')),
    ),

    set_statement: $ => seq(
      kw('set'),
      repeat(choice(kw('session'), kw('local'), kw('global'), kw('persist'))),
      choice(
        seq(
          field('name', choice($._dotted_name, $.parameter)),
          choice(kw('to'), '=', ':='),
          commaSep1(choice(
            $._expression,
            kw('on'),
            kw('off'),
            // MySQL: `SET @a = 1, @b := 2`
            alias(seq(field('left', $.parameter), ':=', field('right', $._expression)), $.assignment),
          )),
        ),
        seq(field('name', $._dotted_name), kw('from', 'current')),
        seq(kw('time', 'zone'), choice($._expression, kw('local'))),
        seq(kw('transaction'), commaSep1($.transaction_mode)),
        seq(kw('session', 'characteristics', 'as', 'transaction'), commaSep1($.transaction_mode)),
        seq(kw('constraints'), choice(kw('all'), commaSep1($.object_reference)), choice(kw('deferred'), kw('immediate'))),
        prec.dynamic(-1, seq(
          choice(kw('role'), kw('authorization'), kw('names'), kw('schema'), kw('character', 'set'), kw('xml', 'option')),
          repeat1($._token),
        )),
      ),
    ),

    reset_statement: $ => seq(kw('reset'), repeat1($._token)),

    show_statement: $ => seq(kw('show'), repeat1($._token)),

    explain_statement: $ => seq(
      kw('explain'),
      optional(choice(
        kw('query', 'plan'),
        $.storage_parameters,
        repeat1(choice(kw('analyze'), kw('analyse'), kw('verbose'))),
      )),
      choice(
        $.select_statement,
        $.insert_statement,
        $.update_statement,
        $.delete_statement,
        $.merge_statement,
        $.create_table_statement,
        $.create_view_statement,
        $.execute_statement,
        $.declare_statement,
        $.refresh_statement,
        $.pragma_statement,
      ),
    ),

    copy_statement: $ => seq(
      $._copy_head,
      choice(
        seq(kw('to'), choice($.string, $.parameter, kw('stdout'), seq(kw('program'), $.string))),
        seq(kw('from'), choice($.string, $.parameter, seq(kw('program'), $.string))),
      ),
      optional($._copy_options),
      optional($.where_clause),
    ),

    _copy_from_stdin: $ => seq(
      $._copy_head,
      kw('from'),
      kw('stdin'),
      optional($._copy_options),
      optional($.where_clause),
    ),

    _copy_head: $ => seq(
      kw('copy'),
      optional(kw('binary')),
      choice(
        seq(field('table', $.object_reference), optional($.column_list)),
        $.subquery,
        alias(parens(choice($.insert_statement, $.update_statement, $.delete_statement, $.merge_statement)), $.subquery),
      ),
    ),

    _copy_options: $ => seq(
      optional(kw('with')),
      choice(
        $.token_group,
        repeat1(choice(
          $.identifier,
          $.string,
          kw('null'),
          kw('not'),
          kw('as'),
          kw('delimiter'),
          kw('escape'),
          kw('binary'),
          kw('force'),
          '*',
          ',',
        )),
      ),
    ),

    // The data after `COPY ... FROM stdin;`, up to and including the line
    // `\.`: any text in which `\.` does not occur alone on a line, then a
    // newline and `\.`. The longest match ends at the first line that is
    // just `\.` (the token cannot extend past it), or failing that at the
    // last line that starts with `\.`.
    copy_data: _ => token.immediate(
      /([^\n]|\n(\n|\\\n)*([^\n\\]|\\[^\n.]|\\\.[^\n]))*(\n(\n|\\\n)*\\?)?\n\\\./,
    ),

    comment_statement: $ => seq(
      kw('comment', 'on'),
      choice(
        seq(kw('column'), $.column_reference),
        seq(field('kind', $.object_kind), repeat1($._token_before_is)),
        seq(kw('constraint'), $.identifier, kw('on'), optional(kw('domain')), $.object_reference),
      ),
      kw('is'),
      choice($._string_literal, $.parameter, kw('null')),
    ),

    grant_statement: $ => seq(
      choice(kw('grant'), kw('revoke')),
      repeat1($._token),
    ),

    pragma_statement: $ => seq(
      kw('pragma'),
      field('name', $._dotted_name),
      optional(choice(
        seq('=', field('value', $._pragma_value)),
        parens(field('value', $._pragma_value)),
      )),
    ),

    _pragma_value: $ => choice($.identifier, $.string, $.number, $.unary_expression, kw('on'), kw('off'), kw('true'), kw('false'), kw('null'), kw('full')),

    attach_statement: $ => seq(
      kw('attach'),
      optional(kw('database')),
      $._expression,
      kw('as'),
      field('name', $.identifier),
      optional(seq(kw('key'), $._expression)),
    ),

    detach_statement: $ => seq(
      kw('detach'),
      optional(kw('database')),
      field('name', $.identifier),
    ),

    use_statement: $ => seq(kw('use'), field('name', $.identifier)),

    do_statement: $ => seq(
      kw('do'),
      optional(seq(kw('language'), field('language', $.identifier))),
      field('body', choice($._string_literal, $.parameter)),
      optional(seq(kw('language'), field('language', $.identifier))),
    ),

    call_statement: $ => seq(kw('call'), $.function_call),

    prepare_statement: $ => seq(
      kw('prepare'),
      field('name', $.identifier),
      optional(parens(commaSep1($.type))),
      choice(kw('as'), kw('from')),
      choice($._statement, $.string),
    ),

    execute_statement: $ => seq(
      choice(kw('execute'), kw('exec')),
      field('name', $.identifier),
      optional($.argument_list),
      optional(seq(kw('using'), commaSep1($._expression))),
    ),

    deallocate_statement: $ => seq(
      kw('deallocate'),
      optional(kw('prepare')),
      choice(kw('all'), field('name', $.identifier)),
    ),

    declare_statement: $ => seq(
      kw('declare'),
      field('name', $.identifier),
      repeat(choice(kw('binary'), kw('asensitive'), kw('insensitive'), kw('no'), kw('scroll'))),
      kw('cursor'),
      optional(seq(choice(kw('with'), kw('without')), kw('hold'))),
      kw('for'),
      $.select_statement,
    ),

    cursor_statement: $ => seq(
      choice(kw('fetch'), kw('move'), kw('close')),
      repeat1($._token),
    ),

    listen_statement: $ => seq(
      choice(kw('listen'), kw('unlisten')),
      choice($.identifier, '*'),
    ),

    notify_statement: $ => seq(
      kw('notify'),
      field('channel', $.identifier),
      optional(seq(',', $.string)),
    ),

    lock_statement: $ => seq(
      kw('lock'),
      repeat1($._token),
    ),

    refresh_statement: $ => seq(
      kw('refresh', 'materialized', 'view'),
      optional(kw('concurrently')),
      field('name', $.object_reference),
      optional($.with_data),
    ),

    describe_statement: $ => seq(
      choice(kw('describe'), kw('desc')),
      field('name', $.object_reference),
      optional($.identifier),
    ),

    // VACUUM, ANALYZE, REINDEX, CLUSTER, CHECKPOINT and the like, as plain
    // tokens.
    maintenance_statement: $ => prec.right(seq(
      choice(
        kw('vacuum'), kw('analyze'), kw('analyse'), kw('reindex'), kw('cluster'),
        kw('checkpoint'), kw('discard'), kw('load'), kw('security', 'label'),
        kw('import', 'foreign', 'schema'), kw('reassign', 'owned'), kw('optimize'),
        kw('flush'), kw('unlock'), kw('kill'), kw('rename'), kw('repack'),
      ),
      repeat($._token),
    )),

    // Plain tokens
    // ------------
    //
    // Statements that are not parsed in detail are read as a run of tokens,
    // with parentheses matched.

    _token: $ => choice($._token_no_comma, ','),

    _token_no_comma: $ => choice(
      $._token_before_is,
      kw('is'),
    ),

    _token_before_is: $ => choice(
      $.identifier,
      $._keyword,
      $.string,
      $.dollar_quoted_string,
      $.number,
      $.parameter,
      $.operator,
      alias($._symbol, $.operator),
      $.token_group,
    ),

    _symbol: _ => choice('=', '<', '>', '<=', '>=', '<>', '!=', '+', '-', '*', '/', '%', '^', '||', '.', ':', '::', '[', ']', '=>', ':='),

    token_group: $ => parens(repeat(choice($._token, ';'))),

    // Expressions
    // -----------

    _expression: $ => choice(
      $.identifier,
      $.column_reference,
      $.parameter,
      $._literal,
      $.function_call,
      $.cast_call,
      $.parenthesized_expression,
      $.tuple,
      $.subquery,
      $.exists_expression,
      $.case_expression,
      $.array_expression,
      $.quantified_expression,
      $.typed_literal,
      $.field_selection,
      $.subscript_expression,
      $.cast_expression,
      $.unary_expression,
      $.binary_expression,
      $.is_expression,
      $.between_expression,
      $.in_expression,
      $.collate_expression,
      $.at_time_zone_expression,
      $.default,
      $.collation_for_expression,
    ),

    collation_for_expression: $ => seq(kw('collation', 'for'), parens($._expression)),

    _literal: $ => choice(
      $.number,
      $._string_literal,
      $.boolean,
      $.null,
    ),

    _string_literal: $ => choice($.string, $.dollar_quoted_string),

    boolean: _ => choice(kw('true'), kw('false')),
    null: _ => kw('null'),
    default: _ => kw('default'),

    column_reference: $ => choice(
      seq(field('table', $.identifier), '.', field('name', $._column_part)),
      seq(field('schema', $.identifier), '.', field('table', $.identifier), '.', field('name', $._column_part)),
      seq(field('database', $.identifier), '.', field('schema', $.identifier), '.', field('table', $.identifier), '.', field('name', $._column_part)),
    ),

    _column_part: $ => choice($.identifier, $.all_columns),

    object_reference: $ => choice(
      field('name', $.identifier),
      field('name', alias($._parameter, $.parameter)),
      seq(field('schema', $.identifier), '.', field('name', choice($.identifier, alias($._parameter, $.parameter)))),
      seq(field('database', $.identifier), '.', field('schema', $.identifier), '.', field('name', $.identifier)),
    ),

    parenthesized_expression: $ => parens($._expression),

    // `()` or two or more expressions: a row value, or the list after `IN`.
    tuple: $ => choice(
      seq('(', ')'),
      seq('(', $._expression, ',', commaSep1($._expression), ')'),
    ),

    subquery: $ => parens($.select_statement),

    exists_expression: $ => seq(kw('exists'), $.subquery),

    quantified_expression: $ => prec(1, seq(
      field('quantifier', choice(kw('any'), kw('some'), kw('all'))),
      choice($.subquery, parens($._expression)),
    )),

    case_expression: $ => seq(
      kw('case'),
      optional(field('value', $._expression)),
      repeat1($.when_clause),
      optional(seq(kw('else'), field('else', $._expression))),
      kw('end'),
    ),

    when_clause: $ => seq(
      kw('when'),
      field('condition', $._expression),
      kw('then'),
      field('result', $._expression),
    ),

    array_expression: $ => seq(
      kw('array'),
      choice($.array_elements, $.subquery),
    ),

    array_elements: $ => seq('[', commaSep(choice($._expression, $.array_elements)), ']'),

    // `date '2024-01-01'`, `interval '1 day'`, `pg_catalog.int4 '1'`. Types
    // of more than one word (`timestamp with time zone '...'`) and interval
    // fields after the string (`interval '1' day`) are left out: keywords
    // that can follow any expression's first name would cost every context
    // that ends an expression its own parser states.
    typed_literal: $ => seq(
      field('type', alias($._type_name, $.type)),
      field('value', choice($.string, alias($._psql_quoted_variable, $.parameter))),
    ),

    field_selection: $ => prec(PREC.member, seq(
      field('value', choice($.parenthesized_expression, $.subscript_expression, $.field_selection)),
      '.',
      field('field', $._column_part),
    )),

    subscript_expression: $ => prec(PREC.subscript, seq(
      field('value', $._expression),
      $._subscript,
    )),

    cast_expression: $ => prec.left(PREC.cast, seq(
      field('value', $._expression),
      '::',
      field('type', $.type),
    )),

    cast_call: $ => seq(
      choice(kw('cast'), kw('try_cast')),
      '(',
      field('value', $._expression),
      kw('as'),
      field('type', $.type),
      optional(seq(kw('collate'), $.object_reference)),
      optional($.json_format),
      ')',
    ),

    unary_expression: $ => choice(
      prec(PREC.unary, seq(
        field('operator', choice('-', '+', '~', $.operator)),
        field('operand', $._expression),
      )),
      prec(PREC.not, seq(field('operator', kw('not')), field('operand', $._expression))),
    ),

    binary_expression: $ => {
      const table = [
        [PREC.or, choice(kw('or'), kw('xor'))],
        [PREC.and, choice(kw('and'), '&&')],
        [PREC.comparison, choice('=', '<', '>', '<=', '>=', '<>', '!=', '==', '<=>', kw('overlaps'))],
        [PREC.other, choice('||', $.operator, $.operator_call)],
        [PREC.additive, choice('+', '-')],
        [PREC.multiplicative, choice('*', '/', '%', kw('div'), kw('mod'))],
        [PREC.exponent, '^'],
      ];
      return choice(
        ...table.map(([p, operator]) => prec.left(p, seq(
          field('left', $._expression),
          field('operator', operator),
          field('right', $._expression),
        ))),
        prec.left(PREC.pattern, seq(
          field('left', $._expression),
          field('operator', seq(
            optional(kw('not')),
            choice(kw('like'), kw('ilike'), kw('glob'), kw('regexp'), kw('rlike'), kw('match'), kw('similar', 'to')),
          )),
          field('right', $._expression),
          optional(seq(kw('escape'), field('escape', $._expression))),
        )),
      );
    },

    // `OPERATOR(pg_catalog.+)`
    operator_call: $ => seq(
      kw('operator'),
      '(',
      repeat(seq($.identifier, '.')),
      $._operator,
      ')',
    ),

    _operator: $ => choice(
      $.operator,
      alias(choice('=', '<', '>', '<=', '>=', '<>', '!=', '+', '-', '*', '/', '%', '^', '||', '~'), $.operator),
    ),

    is_expression: $ => choice(
      prec.left(PREC.is, seq(
        field('left', $._expression),
        kw('is'),
        optional(kw('not')),
        optional(kw('distinct', 'from')),
        field('right', $._expression),
      )),
      prec.left(PREC.is, seq(
        field('left', $._expression),
        choice(kw('isnull'), kw('notnull')),
      )),
      // SQLite's `x NOT NULL`, which binds like `NOT LIKE`.
      prec.left(PREC.pattern, seq(
        field('left', $._expression),
        kw('not', 'null'),
      )),
      prec.right(PREC.is, seq(
        field('left', $._expression),
        kw('is'),
        optional(kw('not')),
        kw('json'),
        optional(choice(kw('value'), kw('array'), kw('object'), kw('scalar'))),
        optional(seq(choice(kw('with'), kw('without')), kw('unique'), optional(kw('keys')))),
      )),
    ),

    between_expression: $ => prec.left(PREC.pattern, seq(
      field('value', $._expression),
      optional(kw('not')),
      kw('between'),
      optional(choice(kw('symmetric'), kw('asymmetric'))),
      field('low', $._expression),
      kw('and'),
      field('high', $._expression),
    )),

    in_expression: $ => prec.left(PREC.pattern, seq(
      field('value', $._expression),
      optional(kw('not')),
      kw('in'),
      field('list', $._expression),
    )),

    collate_expression: $ => prec.left(PREC.collate, seq(
      field('value', $._expression),
      kw('collate'),
      field('collation', $.object_reference),
    )),

    at_time_zone_expression: $ => prec.left(PREC.at_time_zone, seq(
      field('value', $._expression),
      kw('at'),
      choice(
        seq(kw('time', 'zone'), field('zone', $._expression)),
        kw('local'),
      ),
    )),

    function_call: $ => prec.right(seq(
      field('name', $.object_reference),
      field('arguments', $.argument_list),
      optional($.within_group_clause),
      optional(seq(choice(kw('ignore'), kw('respect')), kw('nulls'))),
      optional($.filter_clause),
      optional($.over_clause),
    )),

    argument_list: $ => seq(
      '(',
      optional(choice(
        seq(
          optional(choice(kw('distinct'), kw('all'))),
          commaSep1($._argument),
          optional($.order_by_clause),
          optional(seq(kw('separator'), $.string)),
          optional($.json_clauses),
        ),
        $.select_statement,
        // `extract(year FROM d)`, `substring(s FROM 2 FOR 3)`,
        // `trim(BOTH 'x' FROM s)`, `overlay(s PLACING t FROM 2)`.
        seq(
          choice(kw('both'), kw('leading'), kw('trailing')),
          optional($._expression),
          repeat($._special_argument),
        ),
        seq(optional($._expression), repeat1($._special_argument)),
        // `convert(x USING utf8)`
        seq($._expression, kw('using'), $.identifier),
      )),
      ')',
    ),

    _special_argument: $ => seq(
      choice(kw('from'), kw('for'), kw('placing'), kw('similar'), kw('escape')),
      $._expression,
    ),

    _argument: $ => choice(
      $._expression,
      $.all_columns,
      $.named_argument,
      seq(kw('variadic'), $._expression),
      $.json_key_value,
      seq($._expression, $.json_format),
      // `xmlattributes(1 AS one)`, `xmlserialize(content x AS text)`
      seq($._expression, kw('as'), $.type),
      // `xmlelement(name foo)`, `xmlserialize(content x AS text)`
      seq($.identifier, $.identifier, optional(seq(kw('as'), $.type))),
      // `xmlserialize(document NULL AS text)`
      seq($.identifier, $.null, kw('as'), $.type),
      // `xmlroot(x, version no value)`
      seq($.identifier, kw('no'), optional(kw('value'))),
    ),

    // SQL/JSON: `JSON_OBJECT('a': 1)`, `JSON_OBJECT(KEY 'a' VALUE 1)`.
    json_key_value: $ => prec(PREC.or - 1, seq(
      optional(kw('key')),
      field('key', $._expression),
      choice(':', kw('value')),
      field('value', $._expression),
      optional($.json_format),
    )),

    json_format: $ => prec.right(seq(kw('format', 'json'), optional(seq(kw('encoding'), $.identifier)))),

    // The clauses that end an SQL/JSON or SQL/XML call (`RETURNING jsonb`,
    // `ABSENT ON NULL`, `PASSING x AS y`, `COLUMNS (...)`), read as plain
    // tokens. The first word is lexed as a name: a keyword that can follow
    // any expression in an argument list would give every such expression
    // its own copy of the parser states. A clause that starts with a word
    // that can start an expression (`NULL ON NULL`, `DEFAULT 0 ON EMPTY`)
    // must come after one that does not.
    json_clauses: $ => seq(
      field('clause', $.identifier),
      repeat($._token),
    ),

    named_argument: $ => seq(
      field('name', $.identifier),
      choice('=>', ':='),
      field('value', $._expression),
    ),

    within_group_clause: $ => seq(kw('within', 'group'), parens($.order_by_clause)),

    filter_clause: $ => seq(kw('filter'), parens($.where_clause)),

    over_clause: $ => seq(kw('over'), choice($.identifier, $.window_definition)),

    window_definition: $ => parens(seq(
      optional(field('base', $.identifier)),
      optional(seq(kw('partition', 'by'), commaSep1($._expression))),
      optional($.order_by_clause),
      optional($.frame_clause),
    )),

    frame_clause: $ => seq(
      choice(kw('rows'), kw('range'), kw('groups')),
      choice(
        $.frame_bound,
        seq(kw('between'), $.frame_bound, kw('and'), $.frame_bound),
      ),
      optional(seq(kw('exclude'), choice(
        kw('current', 'row'),
        kw('group'),
        kw('ties'),
        kw('no', 'others'),
      ))),
    ),

    frame_bound: $ => choice(
      seq(kw('unbounded'), choice(kw('preceding'), kw('following'))),
      kw('current', 'row'),
      seq($._expression, choice(kw('preceding'), kw('following'))),
    ),

    // Types
    // -----

    type: $ => prec.right(seq(
      $._type_name,
      optional(choice(kw('precision'), kw('varying'))),
      optional($.type_arguments),
      optional($.time_zone),
      repeat($.array_size),
      optional(choice(
        alias(token.immediate(/%[tT][yY][pP][eE]/), '%TYPE'),
        alias(token.immediate(/%[rR][oO][wW][tT][yY][pP][eE]/), '%ROWTYPE'),
      )),
    )),

    _type_name: $ => choice(
      field('name', $.identifier),
      seq(field('schema', $.identifier), '.', field('name', $.identifier)),
      seq(field('database', $.identifier), '.', field('schema', $.identifier), '.', field('name', $.identifier)),
    ),

    type_arguments: $ => parens(commaSep1($._expression)),

    time_zone: _ => choice(
      alias(token(/[wW][iI][tT][hH]\s+[tT][iI][mM][eE]\s+[zZ][oO][nN][eE]/), 'WITH TIME ZONE'),
      alias(token(/[wW][iI][tT][hH][oO][uU][tT]\s+[tT][iI][mM][eE]\s+[zZ][oO][nN][eE]/), 'WITHOUT TIME ZONE'),
    ),

    array_size: $ => choice(
      seq('[', optional($.number), ']'),
      kw('array'),
    ),

    // Names
    // -----

    _name: $ => $.identifier,

    // A plain name, a quoted name ("..." or `...`), a Unicode-escaped name
    // (U&"..."), or a placeholder in a PostgreSQL extension script
    // (`@extschema@`).
    identifier: $ => choice($._identifier_token, $._bracket_identifier),

    // `[name]`, as SQLite and SQL Server quote names. It may not start with a
    // digit, a sign, a quote or a bracket, or contain a comma, so that it is
    // never an array (`ARRAY[[1, 2]]`, `ARRAY[-1]`).
    _bracket_identifier: _ => token(/\[[A-Za-z_\u00C0-\uFFFF ][^\]\[,\n]*\]/),

    _identifier_token: _ => token(choice(
      /[A-Za-z_\u00C0-\uFFFF][A-Za-z0-9_$\u00C0-\uFFFF]*/,
      /"([^"]|"")*"/,
      /`([^`]|``)*`/,
      /[uU]&"([^"]|"")*"/,
      /@extschema(:[A-Za-z0-9_]+)?@/,
    )),

    // `$1`, `?`, `?1`, `:name`, psql's `:'var'` and `:"var"`, and MySQL's
    // `@var` and `@@var`.
    parameter: $ => choice($._parameter, $._psql_quoted_variable),

    _psql_quoted_variable: _ => token(choice(
      /:'[A-Za-z_][A-Za-z0-9_]*'/,
      /:"[A-Za-z_][A-Za-z0-9_]*"/,
    )),

    _parameter: _ => token(choice(
      /\$\d+/,
      /\$(::)?[A-Za-z_][A-Za-z0-9_]*(::[A-Za-z0-9_]+)*(\([^)\s]*\))?/,
      /\?\d*/,
      /:[A-Za-z_][A-Za-z0-9_]*/,
      /:\{\?[A-Za-z_][A-Za-z0-9_]*\}/,
      /@@?[A-Za-z_][A-Za-z0-9_$.]*/,
      /@'[^']*'/,
    )),

    // Any operator not spelled out elsewhere, as PostgreSQL lexes them: a run
    // of operator characters that does not end in `+` or `-` unless it also
    // contains one of `~ ! @ # % ^ & | \` ?`. So that `a=?` is a comparison
    // with a parameter, `?` only appears in operators that start with `?` or
    // `@`.
    operator: _ => token(choice(
      /[+\-*/<>=]*[*/<>=]/,
      /[+\-*/<>=]*[~!#%^&|`][+\-*/<>=~!@#%^&|`]*/,
      /[?@][+\-*/<>=~!@#%^&|`?]*/,
    )),

    // Literals
    // --------

    number: _ => token(choice(
      /\d[\d_]*(\.[\d_]*)?([eE][+-]?\d+)?/,
      /\.\d[\d_]*([eE][+-]?\d+)?/,
      /0[xX][0-9a-fA-F_]+/,
      /0[bB][01_]+/,
      /0[oO][0-7_]+/,
    )),

    // Adjacent strings are one string (`'a' 'b'`), as in the SQL standard.
    string: $ => prec.right(seq(
      repeat1($._string_part),
      optional(seq(kw('uescape'), $._string_part)),
    )),

    _string_part: _ => token(choice(
      /'([^']|'')*'/,
      /[eE]'([^'\\]|\\(.|\n)|'')*'/,
      /[nN]'([^']|'')*'/,
      /[bB]'[01]*'/,
      /[xX]'[0-9a-fA-F]*'/,
      /[uU]&'([^']|'')*'/,
      /_[A-Za-z0-9]+'([^']|'')*'/,
    )),

    dollar_quoted_string: $ => choice(
      ...['', ...DOLLAR_TAGS].map(tag => seq(
        `$${tag}$`,
        optional(alias(token.immediate(new RegExp(dollarBody(tag))), $.string_content)),
        alias(token.immediate(new RegExp(dollarClose(tag))), `$${tag}$`),
      )),
      seq(
        $._dollar_tag,
        repeat(alias(token.immediate(prec(-1, choice(/[^$]+/, '$'))), $.string_content)),
        $._dollar_tag_immediate,
      ),
    ),

    _dollar_tag: _ => token(/\$[A-Za-z_\u00C0-\uFFFF][A-Za-z0-9_\u00C0-\uFFFF]*\$/),
    _dollar_tag_immediate: _ => token.immediate(/\$[A-Za-z_\u00C0-\uFFFF][A-Za-z0-9_\u00C0-\uFFFF]*\$/),

    comment: _ => token(choice(
      /--[^\n]*/,
      new RegExp(nestedComment(COMMENT_DEPTH)),
      /\/\*[^*]*\*+([^/*][^*]*\*+)*\//,
    )),

    // Any keyword, inside a run of plain tokens. This rule is last, so that
    // every other rule has registered its keywords by the time it is built.
    _keyword: _ => choice(...[...KEYWORDS].filter(w => !['is', 'create', 'grant', 'revoke'].includes(w)).sort().map(keyword)),
  },
});
