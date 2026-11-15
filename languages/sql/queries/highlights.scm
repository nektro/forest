; Highlights for SQL.
;
; When several patterns match a node, the last one wins, so general patterns
; come first and more specific ones after them.

(identifier) @variable

; Names
; -----

; Tables, views and other relations.
(object_reference
  name: (identifier) @type)

(object_reference
  schema: (identifier) @module)

(object_reference
  database: (identifier) @module)

(column_reference
  name: (identifier) @property)

(column_reference
  schema: (identifier) @module)

(column_reference
  database: (identifier) @module)

(field_selection
  field: (identifier) @property)

(column_definition
  name: (identifier) @property)

(column_list
  (identifier) @property)

(assignment
  left: (identifier) @property)

(alter_column
  name: (identifier) @property)

(drop_column
  name: (identifier) @property)

(rename
  old: (identifier) @property)

(rename
  new: (identifier) @property)

(cte
  name: (identifier) @type)

(type
  name: (identifier) @type)

(type
  schema: (identifier) @module)

((type
  name: (identifier) @type.builtin)
  (#any-of? @type.builtin
    "bigint" "bigserial" "bit" "blob" "bool" "boolean" "box" "bytea" "char"
    "character" "cidr" "circle" "date" "datetime" "decimal" "double" "float"
    "float4" "float8" "inet" "int" "int2" "int4" "int8" "integer" "interval"
    "json" "jsonb" "line" "lseg" "macaddr" "money" "nchar" "numeric"
    "nvarchar" "oid" "path" "point" "polygon" "real" "record" "regclass"
    "serial" "smallint" "smallserial" "text" "time" "timestamp" "timestamptz"
    "timetz" "tinyint" "tsquery" "tsvector" "uuid" "varbinary" "varchar"
    "void" "xml" "BIGINT" "BIGSERIAL" "BIT" "BLOB" "BOOL" "BOOLEAN" "BYTEA"
    "CHAR" "CHARACTER" "DATE" "DATETIME" "DECIMAL" "DOUBLE" "FLOAT" "INT"
    "INTEGER" "INTERVAL" "JSON" "JSONB" "NCHAR" "NUMERIC" "NVARCHAR" "REAL"
    "SERIAL" "SMALLINT" "TEXT" "TIME" "TIMESTAMP" "TIMESTAMPTZ" "TINYINT"
    "UUID" "VARBINARY" "VARCHAR" "XML"))

(function_parameter
  name: (identifier) @variable.parameter)

(named_argument
  name: (identifier) @variable.parameter)

(parameter) @variable.parameter

; Functions
; ---------

(function_call
  name: (object_reference
    name: (identifier) @function.call))

(create_function_statement
  name: (object_reference
    name: (identifier) @function))

(create_trigger_statement
  name: (object_reference
    name: (identifier) @function))

(trigger_event
  (identifier) @property)

((identifier) @function.builtin
  (#any-of? @function.builtin
    "current_date" "current_time" "current_timestamp" "current_user"
    "current_role" "current_catalog" "current_schema" "session_user"
    "localtime" "localtimestamp" "CURRENT_DATE" "CURRENT_TIME"
    "CURRENT_TIMESTAMP" "CURRENT_USER" "CURRENT_ROLE" "CURRENT_CATALOG"
    "CURRENT_SCHEMA" "SESSION_USER" "LOCALTIME" "LOCALTIMESTAMP"))

; Literals
; --------

(comment) @comment

[
  (string)
  (dollar_quoted_string)
] @string

(copy_data) @string.special

(number) @number

; Shell commands
; --------------

[
  (meta_command)
  (dot_command)
] @keyword.directive

; Operators and punctuation
; -------------------------

; `*` is multiplication only in a binary expression; in `count(*)` and `t.*`
; it is `all_columns`.
(binary_expression
  operator: "*" @operator)

[
  "=" "<" ">" "<=" ">=" "<>" "!=" "==" "<=>" "+" "-" "/" "%" "^" "||"
  "~" "&&" "::" ":=" "=>"
  (operator)
] @operator

[
  "(" ")" "[" "]"
] @punctuation.bracket

[
  "," "." ";" ":"
] @punctuation.delimiter

[
  "AND" "OR" "NOT" "XOR" "IN" "IS" "LIKE" "ILIKE" "GLOB" "REGEXP" "RLIKE"
  "MATCH" "SIMILAR" "BETWEEN" "SYMMETRIC" "ASYMMETRIC" "ESCAPE" "ISNULL"
  "NOTNULL" "EXISTS" "ANY" "SOME" "DIV" "MOD" "OVERLAPS"
] @keyword.operator

[
  "CASE" "WHEN" "THEN" "ELSE"
] @keyword.conditional

[
  "FUNCTION" "PROCEDURE" "RETURNS" "RETURN"
] @keyword.function

[
  "WITH TIME ZONE" "WITHOUT TIME ZONE" "%TYPE" "%ROWTYPE"
] @keyword.type

; keywords: begin
[
  "ABORT" "ACCESS" "ACTION" "ADD" "AFTER" "AGGREGATE" "ALL" "ALTER" "ALWAYS"
  "ANALYSE" "ANALYZE" "APPLY" "ARRAY" "AS" "ASC" "ASENSITIVE" "AT" "ATOMIC"
  "ATTACH" "AUTHORIZATION" "AUTOINCREMENT" "AUTO_INCREMENT" "BEFORE" "BEGIN"
  "BINARY" "BOTH" "BREADTH" "BTREE" "BY" "CALL" "CALLED" "CASCADE" "CASCADED"
  "CAST" "CHAIN" "CHANGE" "CHARACTER" "CHARACTERISTICS" "CHARSET" "CHECK"
  "CHECKPOINT" "CLASS" "CLOSE" "CLUSTER" "COLLATE" "COLLATION" "COLUMN"
  "COMMENT" "COMMIT" "COMMITTED" "COMPRESSION" "CONCURRENTLY" "CONFIGURATION"
  "CONFLICT" "CONSTRAINT" "CONSTRAINTS" "CONTINUE" "CONVERSION" "COPY" "COST"
  "CREATE" "CROSS" "CURRENT" "CURSOR" "CYCLE" "DATA" "DATABASE" "DEALLOCATE"
  "DECLARE" "DEFAULT" "DEFERRABLE" "DEFERRED" "DEFINER" "DELAYED" "DELETE"
  "DELIMITER" "DEPTH" "DESC" "DESCRIBE" "DETACH" "DETERMINISTIC" "DICTIONARY"
  "DISABLE" "DISCARD" "DISTINCT" "DO" "DOMAIN" "DROP" "DUPLICATE" "EACH"
  "ENABLE" "ENCODING" "END" "ENFORCED" "ENGINE" "ENUM" "EVENT" "EXCEPT"
  "EXCLUDE" "EXCLUDING" "EXCLUSIVE" "EXEC" "EXECUTE" "EXPLAIN" "EXTENSION"
  "EXTERNAL" "FAIL" "FALSE" "FAMILY" "FETCH" "FILTER" "FIRST" "FLUSH"
  "FOLLOWING" "FOR" "FORCE" "FOREIGN" "FORMAT" "FROM" "FULL" "FULLTEXT"
  "GENERATED" "GLOBAL" "GRANT" "GROUP" "GROUPING" "GROUPS" "HASH" "HAVING"
  "HIGH_PRIORITY" "HOLD" "IDENTITY" "IF" "IGNORE" "IMMEDIATE" "IMMUTABLE"
  "IMPORT" "INCLUDE" "INCLUDING" "INDEX" "INDEXED" "INHERIT" "INHERITS"
  "INITIALLY" "INNER" "INOUT" "INPUT" "INSENSITIVE" "INSERT" "INSTEAD"
  "INTERSECT" "INTO" "INVISIBLE" "INVOKER" "ISOLATION" "JOIN" "JSON" "KEY"
  "KEYS" "KILL" "LABEL" "LANGUAGE" "LARGE" "LAST" "LATERAL" "LEADING"
  "LEAKPROOF" "LEFT" "LEVEL" "LIMIT" "LISTEN" "LOAD" "LOCAL" "LOCK" "LOCKED"
  "LOW_PRIORITY" "MAPPING" "MATCHED" "MATERIALIZED" "MERGE" "METHOD" "MINUS"
  "MODIFY" "MOVE" "NAMES" "NATURAL" "NEW" "NEXT" "NO" "NOTHING" "NOTIFY"
  "NOWAIT" "NULL" "NULLS" "OBJECT" "OF" "OFF" "OFFSET" "OLD" "ON" "ONLY"
  "OPERATOR" "OPTIMIZE" "OPTION" "OPTIONS" "ORDER" "ORDINALITY" "OTHERS" "OUT"
  "OUTER" "OVER" "OVERRIDING" "OWNED" "OWNER" "PARALLEL" "PARSER" "PARTIAL"
  "PARTITION" "PERIOD" "PERSIST" "PLACING" "PLAN" "POLICY" "PRAGMA"
  "PRECEDING" "PRECISION" "PREPARE" "PREPARED" "PRESERVE" "PRIMARY"
  "PRIVILEGES" "PROCEDURAL" "PROGRAM" "PUBLICATION" "QUALIFY" "QUERY" "QUICK"
  "RANGE" "READ" "REASSIGN" "RECURSIVE" "REFERENCES" "REFERENCING" "REFRESH"
  "REINDEX" "RELEASE" "RENAME" "REPACK" "REPEATABLE" "REPLACE" "REPLICA"
  "RESET" "RESPECT" "RESTART" "RESTRICT" "RETURNING" "REVOKE" "RIGHT" "ROLE"
  "ROLLBACK" "ROLLUP" "ROUTINE" "ROW" "ROWS" "RULE" "SAVEPOINT" "SCALAR"
  "SCHEMA" "SCROLL" "SEARCH" "SECURITY" "SELECT" "SEPARATOR" "SEQUENCE"
  "SERIALIZABLE" "SERVER" "SESSION" "SET" "SETOF" "SETS" "SHARE" "SHOW"
  "SIMPLE" "SKIP" "SNAPSHOT" "SOURCE" "SPATIAL" "STABLE" "START" "STATEMENT"
  "STATISTICS" "STDIN" "STDOUT" "STORAGE" "STORED" "STRAIGHT_JOIN" "STRICT"
  "SUBSCRIPTION" "SUPPORT" "SYSTEM" "TABLE" "TABLESAMPLE" "TABLESPACE"
  "TARGET" "TEMP" "TEMPLATE" "TEMPORARY" "TEXT" "TIES" "TIME" "TO" "TRAILING"
  "TRANSACTION" "TRANSFORM" "TRIGGER" "TRUE" "TRUNCATE" "TRUSTED" "TRY_CAST"
  "TYPE" "UESCAPE" "UNBOUNDED" "UNCOMMITTED" "UNION" "UNIQUE" "UNLISTEN"
  "UNLOCK" "UNLOGGED" "UPDATE" "USE" "USER" "USING" "VACUUM" "VALID"
  "VALIDATE" "VALUE" "VALUES" "VARIADIC" "VARYING" "VERBOSE" "VIEW" "VIRTUAL"
  "VISIBLE" "VOLATILE" "WHERE" "WINDOW" "WITH" "WITHIN" "WITHOUT" "WORK"
  "WRAPPER" "WRITE" "XML" "ZONE"
] @keyword

; keywords: end

; Overrides
; ---------

; `END` closes a CASE as well as a block or a transaction.
(case_expression
  "END" @keyword.conditional)

; Literals that are single keywords.
(boolean) @boolean

(null) @constant.builtin

(all_columns) @character.special
