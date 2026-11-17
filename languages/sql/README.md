# tree-sitter-sql

A [tree-sitter](https://tree-sitter.github.io) grammar for SQL as PostgreSQL,
SQLite and MySQL write it, including the psql and sqlite3 shell commands that
`.sql` files contain.

- **No external scanner.** The parts of SQL's lexical syntax that are not
  regular are handled in `grammar.js`:
  - **Dollar-quoted strings** (`$tag$ ... $tag$`) end at the first copy of
    the opening tag. For `$$` and every tag in `DOLLAR_TAGS` (`$body$`,
    `$func$`, `$q$`, `$outer$`, a few letters, ...), the body is one token whose regex
    is "text in which `$tag$` does not occur", built by `dollarBody`. Because
    the lexer takes the longest match, the body may not end partway through
    the tag (` x $bod` before `$body$`); pieces that really end it that way
    (`$f$ x$$f$`) are part of the closing token instead. Any other tag is
    read leniently: the string ends at the next `$word$`.
  - **Nested block comments**, as PostgreSQL and the SQL standard nest them,
    are spelled out up to `COMMENT_DEPTH` (5) as one regex. A comment that
    only closes when read without nesting, as SQLite and MySQL read it
    (`/* /* */`), is also accepted. The longest reading wins.
  - **`COPY ... FROM stdin;` and psql's `\copy ... from stdin`** are followed
    by data lines up to a line `\.`. That is one regular token, valid only
    after such a statement: text in which `\.` does not occur alone on a line.
- **Keywords are case-insensitive** and appear in the tree as anonymous nodes
  spelled in upper case (`"SELECT"`). Tree-sitter only lexes a word as a
  keyword where the keyword is valid, so most keywords still work as names
  (`SELECT type, key, value FROM t`). Keywords that only appear in one
  rarely used place (`IMMUTABLE`, `BEFORE`, `MATCHED`, `STORED`, `VACUUM`)
  are lexed as names instead, and appear as `keyword`, `command` or
  `object_kind` nodes, or as `identifier`s in a run of plain tokens; see
  [Size](#size).
- **Statements are parsed in detail where it pays**: queries (`WITH`,
  `SELECT`, set operations, joins, window functions, `VALUES`, `TABLE`),
  `INSERT` (with `ON CONFLICT`, `ON DUPLICATE KEY UPDATE`, `OR REPLACE`),
  `UPDATE`, `DELETE`, `MERGE`, `CREATE TABLE` / `VIEW` / `INDEX` / `FUNCTION`
  / `PROCEDURE` / `TRIGGER` / `SCHEMA` / `TYPE`, `ALTER TABLE`, `DROP`,
  `TRUNCATE`, `SET`, `EXPLAIN`, `COPY`, `COMMENT ON`, `PRAGMA`, `ATTACH`,
  `DO`, `CALL`, `PREPARE`, `EXECUTE`, `DECLARE ... CURSOR`.
- **Everything else is read as a run of tokens** with parentheses matched:
  the long tail of `CREATE`/`ALTER`/`DROP` objects (sequences, roles,
  aggregates, operators, publications, policies, ...), the options of
  transactions (`BEGIN ISOLATION LEVEL ...`), `ALTER TABLE` actions other
  than adding, dropping, altering and renaming, the clauses of SQL/JSON and
  SQL/XML calls, and every statement that starts with a word the grammar
  does not know (`GRANT`, `SHOW`, `VACUUM`, `FETCH`, `LISTEN`, `START
  TRANSACTION`, `SAVEPOINT`, ...), which is an `other_statement`.

## Validation

`script/check-sql-files.sh <dir>...` parses every `.sql` file under the
given directories and lists those with errors.

| Input | Files | With errors |
| --- | --- | --- |
| PostgreSQL regression tests (`src/test/regress/sql`, postgres `81b2179`) | 245 | 27 |
| PostgreSQL `contrib` tests and extension scripts | 400 | 6 |
| SQL from SQLite's Tcl tests (`do_execsql_test` and `execsql` blocks, sqlite `test/`) | 1,018 | 68 |

Most of the PostgreSQL errors are in forms left out to keep the parser
small (see [Size](#size)): typed literals of more than one word
(`timestamp with time zone '...'`, most of the errors in `horology.sql`,
`timestamp.sql`, `timestamptz.sql` and `timetz.sql`), interval fields
(`interval.sql`), `IS NFC NORMALIZED` and SQL/JSON clauses after a query
argument or starting with `NULL`. Most of the rest test syntax errors
(`errors.sql`, `psql.sql`, `strings.sql`). Most SQLite
errors are Tcl left in the extracted SQL or tests of invalid SQL; the rest
are keywords used as column names (`SELECT current, exclude, filter ...`)
and SQLite's `FROM a, b ON ...`.

The lexical regexes were checked by brute force, emulating tree-sitter's
longest-match lexer:

- Dollar-quoted strings, against PostgreSQL's rule (the string ends at the
  first copy of its tag): every text of up to 8 characters over `$`, `x` and
  the tag's letters, for the tags `''`, `a`, `ab`, `abc`, `aab` and `aba`
  (4,972 strings that contain the closing tag).
- Block comments: every text of up to 12 characters over `/`, `*` and `x`
  that starts with `/*` (88,573 strings) ends where PostgreSQL's nested
  reading closes, or failing that at the first `*/`.

Parsing runs at about 12 MB/s on the 5 MB of PostgreSQL regression tests.

## Dialects

Where dialects disagree, the grammar takes PostgreSQL's reading unless
another one is unambiguous:

- `'...'` strings have no backslash escapes (`E'...'` strings do), so
  MySQL's `'it\'s'` is not read as MySQL reads it.
- `"..."` is a quoted name, not a MySQL string.
- `a=@b` is one PostgreSQL operator `=@`, as psql lexes it. `a=?` is a
  comparison with a parameter: `?` only appears in operators that start
  with `?` or `@` (`?|`, `@?`).
- `[name]` quotes a name (SQLite, SQL Server) except right after an
  expression, where `[` starts a subscript, so an alias in brackets needs
  `AS`.
- A join's `ON` belongs to the nearest join without one, so
  `a JOIN b JOIN c ON x ON y` nests to the right as in PostgreSQL, and a join
  with no condition is allowed (SQLite, MySQL).
- Parameters: `$1`, `?`, `?1`, `:name`, `@name`, `@@name`, `$name`, and
  psql's `:'var'`, `:"var"` and `:{?var}`.

## Known limitations

- MySQL's `DELIMITER` changes the statement terminator, which a grammar
  cannot follow; procedure bodies written between `DELIMITER` lines are
  errors.
- Dollar-quote tags outside `DOLLAR_TAGS` are lenient: `$tag$ ... $$ ...
  $$ ... $tag$` ends at the first `$$`. Adding a tag makes its strings exact,
  at the cost of three tokens.
- Block comments nested deeper than five levels fall back to the flat
  reading.
- Typed literals take a one-word type (`date '...'`, `pg_catalog.int4 '1'`):
  `timestamp with time zone '...'`, `double precision '1'`, `interval(2)
  '...'` and interval fields after the string (`interval '1' day`) are
  errors. Casts (`'...'::timestamp with time zone`) and column types take
  them all.
- `SQL/JSON` clauses must start with a word that cannot start an expression:
  `JSON_OBJECT(k: v RETURNING jsonb)` works, `JSON_OBJECT(k: v NULL ON NULL)`
  does not, and neither does a call whose arguments are only clauses
  (`JSON_OBJECT(RETURNING text)`), or a query argument followed by clauses
  (`JSON_ARRAY(SELECT ... RETURNING jsonb)`).
- `IS [NOT] NFC NORMALIZED` is not supported.
- Keywords that can follow an expression are not available as bare aliases
  (`SELECT x day FROM t` needs `AS`), and keywords that start an expression
  (`CASE`, `EXISTS`, `ARRAY`, `NULL`, ...) are not column names.
- SQL Server's T-SQL (`TOP`, `GO`, `DECLARE @x`, `BEGIN ... END` blocks) is
  not covered.
- PL/pgSQL bodies are strings; `injections.scm` highlights them as SQL,
  which gets most of a body right.

## Size

The wasm file is 10.9 MB (28,000 parse states, 6,300 of them in the dense
table, 599 symbols). Generating takes about a minute and building the wasm
about a minute and a half.

Most of the file is the dense part of the parse table: one row for each
state with more than 64 valid symbols, and a column for every symbol in the
grammar. Two things keep it in check, both measured by generating with and
without each feature:

- **Few symbols.** Every keyword is a token, and every token is a column in
  every dense row. Keywords that only matter in one rarely used place are
  lexed as names: option words in parsed statements are `keyword` nodes
  (`IMMUTABLE`, `BEFORE`, `MATCHED`, `STORED`, `RESTART IDENTITY`), the
  first word of an unknown statement is a `command`, the kind of a generic
  `CREATE`/`ALTER`/`DROP` is an `object_kind`, and in runs of plain tokens
  they are `identifier`s. `highlights.scm` marks all of these as keywords.
  This took the grammar from 607 tokens to 323. `DOLLAR_TAGS` is short for
  the same reason: each tag is three tokens.
- **Few contexts that end an expression.** SQL has a large expression
  grammar, ended by different keywords in different places (`FROM`, `THEN`,
  `PRECEDING`, ...). Tree-sitter does not merge parse states where a keyword
  valid in one would change how a word is lexed in the other, so each set of
  words that can follow an expression gets its own copy of the expression
  states, and most of those states are dense. So:
  - SQL/JSON and SQL/XML clauses (`RETURNING`, `PASSING`, `COLUMNS`, ...)
    are a token run whose first word is lexed as a name, which merges with
    the states for an alias. Spelling them out took 2,000 more dense states.
  - Typed literals take a one-word type and no interval fields; the longer
    forms cost 730 dense states, and interval fields after a cast's type
    1,300 more.
  - A name never follows an expression where it could not before: an
    optional word after `x IS JSON` cost 5,000 dense states, and the
    condition of a trigger comes after its other options for this reason.

## Tree shape

- `source_file` holds statements separated by `;`, psql `meta_command`s
  (`\set`, `\gset`, which also end a statement), sqlite3 `dot_command`s
  (`.mode csv`) and `copy_data`.
- Each statement kind is its own node (`select_statement`,
  `create_table_statement`, ...); the generic ones are `create_statement`,
  `alter_statement` and `drop_statement` with a `kind` field
  (`object_kind`), `other_statement` with a `command` field, and
  `alter_table_action`. `transaction_statement` is `BEGIN`, `COMMIT`, `END`,
  `ROLLBACK` or `ABORT` and plain tokens.
- `keyword` is a word in a place that only takes certain words, lexed as a
  name (see [Size](#size)).
- A query is `select_statement`: an optional `with_clause`, a body (`select`,
  `set_operation`, `parenthesized_query`, `values` or `table_statement`), then
  `order_by_clause`, `limit_clause`, `offset_clause`, `fetch_clause` and
  `locking_clause`. `select` holds `select_list`, `from_clause`,
  `where_clause`, `group_by_clause`, `having_clause` and `window_clause`.
- `_expression` is a supertype. Names of tables, functions and types are
  `object_reference` (`database`, `schema`, `name` fields); qualified columns
  are `column_reference` (`table`, `name`, ...); a bare name is `identifier`.
- `(1, 2)` and `()` are `tuple`; `(1)` is `parenthesized_expression`; the
  list after `IN` is whichever of these it is.
- Types are `type`, with `name`, `type_arguments`, `time_zone` and
  `array_size` children.

## Queries

`queries/` contains `highlights.scm`, `injections.scm`, `tags.scm` and
`folds.scm`. In `highlights.scm` the last matching pattern wins, so general
patterns come first. `script/update-keywords.py` generates two lists in it;
run it after `tree-sitter generate`:

- every keyword token in the grammar, which is checked against
  `src/grammar.json` because a query that names a missing node fails to
  load;
- SQL keywords that are lexed as names, as `#any-of?` for the `identifier`
  children of runs of plain tokens (`GRANT SELECT ON t TO r`,
  `CREATE SEQUENCE s START 1`). Patterns later in the file override it, so
  `ALTER COLUMN level` is still a column.

The highlight tests are in `test/highlight-web/` rather than
`test/highlight/`, and `script/check-highlights.ts` runs them the way
`web/forest.js` highlights. `tree-sitter test` lets a keyword pattern such
as `"NULL"` win over `(null)` wherever the two come in the file, so the
`NULL` literal, booleans and the `*` of `count(*)` cannot be tested there as
forest.js shows them.

`injections.scm` highlights the bodies of functions and `DO` blocks written
in SQL or PL/pgSQL as SQL, and PL/Python bodies as Python.

## Development

```bash
tree-sitter generate --js-runtime bun
```

```bash
script/update-keywords.py
```

```bash
tree-sitter test
```

```bash
bun script/check-highlights.ts
```

```bash
script/check-sql-files.sh ~/src/postgres/src/test/regress/sql
```

`tree-sitter test --update` writes corpus trees without field names. To record
them with fields, run `script/update-corpus-fields.py` instead, then review the
diff: it records what the parser does now, not what it should do.
