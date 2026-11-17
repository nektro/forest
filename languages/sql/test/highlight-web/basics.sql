-- A comment
-- <- comment
SELECT a.id, count(*) AS n
-- <- keyword
--     ^ variable
--       ^ property
--           ^ function.call
--                 ^ character.special
--                    ^ keyword
FROM public.accounts a
-- <- keyword
--   ^ module
--          ^ type
WHERE a.name LIKE 'x%' AND a.total >= 10.5 OR a.flag IS NOT NULL
--           ^ keyword.operator
--                ^ string
--                     ^ keyword.operator
--                                 ^ operator
--                                    ^ number
--                                         ^ keyword.operator
--                                                          ^ constant.builtin
GROUP BY 1
ORDER BY n DESC;

CREATE TABLE t (
-- <- keyword
--           ^ type
  id integer PRIMARY KEY,
  -- <- property
  -- ^ type.builtin
  --         ^ keyword
  ts timestamp with time zone DEFAULT now(),
  --           ^ keyword.type
  --                          ^ keyword
  done boolean DEFAULT false
  --                   ^ boolean
);

CREATE FUNCTION add_one(x int) RETURNS int
-- <- keyword
--     ^ keyword.function
--              ^ function
--                      ^ variable.parameter
--                               ^ keyword.function
LANGUAGE sql AS $$ SELECT x + 1 $$;
--              ^ string

SELECT CASE WHEN $1 THEN :'name' ELSE x::text END;
--     ^ keyword.conditional
--               ^ variable.parameter
--                       ^ variable.parameter
--                                     ^ operator
--                                       ^ type.builtin
--                                            ^ keyword.conditional

SELECT current_timestamp, a -> 'k' FROM t;
--     ^ function.builtin
--                          ^ operator

\set ON_ERROR_STOP on
-- <- keyword.directive

GRANT SELECT ON accounts TO reporting;
-- <- keyword
--    ^ keyword
--           ^ keyword
--              ^ variable
--                       ^ keyword
CREATE SEQUENCE ids START 100;
--     ^ keyword
--              ^ variable
--                  ^ keyword
--                        ^ number
CREATE FUNCTION one() RETURNS int IMMUTABLE RETURN 1;
--                                ^ keyword
ALTER TABLE t ALTER COLUMN level SET STORAGE plain;
--                         ^ property
--                                   ^ keyword
VACUUM FULL t;
-- <- keyword
--     ^ keyword
