#!/usr/bin/env python3
"""Rewrite the generated keyword lists in queries/highlights.scm.

Two lists are generated:

- Between `; keywords: begin` and `; keywords: end`: every keyword token in
  src/grammar.json. Keywords are case-insensitive regexes aliased to their
  upper-case spelling, so they are anonymous nodes like "SELECT". A query
  that names a node the grammar does not have fails to load, so the list is
  read from the grammar, minus the keywords captured earlier in the file.

- Between `; soft keywords: begin` and `; soft keywords: end`: SQL keywords
  that are lexed as plain names. Most keywords that only matter in a rarely
  used statement are not keyword tokens (each token widens the parse table),
  so in runs of plain tokens (`GRANT ...`, `CREATE SEQUENCE ...`,
  `VACUUM ...`) they are `identifier`s. This list marks them as keywords
  there, and only there: an `identifier` that is a direct child of one of
  the nodes in SOFT_PARENTS.

Run it after `tree-sitter generate` whenever keywords change.
"""
import json, os, re

here = os.path.join(os.path.dirname(__file__), '..')
grammar = json.load(open(os.path.join(here, 'src', 'grammar.json')))
query_path = os.path.join(here, 'queries', 'highlights.scm')
query = open(query_path).read()

# Nodes whose direct `identifier` children are words of a run of plain tokens.
SOFT_PARENTS = [
    'create_statement', 'alter_statement', 'drop_statement', 'other_statement',
    'transaction_statement', 'set_statement', 'alter_table_action', 'alter_column',
    'comment_statement', 'token_group', 'json_clauses',
]

# SQL keywords, lower case, as PostgreSQL, SQLite and MySQL use them. Words
# that are more often names than keywords (`data`, `text`, `name`) are left
# out.
SOFT_KEYWORDS = """
abort absent absolute access action add admin after aggregate all also alter
always analyse analyze and any apply array as asc asensitive assignment
asymmetric at atomic attach attribute authorization auto_increment
autoincrement backward before begin between bigint binary both breadth btree
buffers by bypassrls cache call called cascade cascaded case cast catalog chain
change character characteristics charset check checkpoint class close cluster
collate collation column columns comment comments commit committed compression
concurrently conditional configuration conflict connect connection constraint
constraints content continue conversion copy cost costs create createdb
createrole cross csv cube current cursor cycle database databases deallocate
declare default defaults deferrable deferred definer delayed delete delimiter
delimiters depends depth desc describe detach dictionary disable discard
distinct div do document domain drop duplicate each else empty enable encoding
encrypted end enforced engine enum error escape event except exclude excluding
exclusive exec execute exists explain expression extension external fail false
family fetch filter finalize first flush following for force force_not_null
force_null force_quote foreign format forward freeze from full fulltext
function functions generated generic_plan glob global grant granted grants
group grouping groups handler hash having header high_priority hold identity
if ignore ilike immediate immutable implicit import in include including
increment indent index indexed inherit inherits initially inline inner inout
input insensitive insert instead intersect into invisible invoker is isnull
isolation join json keep keys kill label language large last lateral leading
leakproof left level like limit listen load local location lock locked logged
login low_priority main mapping match matched materialized maxvalue merge
method minus minvalue mod mode modify move names natural new next nfc nfd nfkc
nfkd no nologin none normalized not nothing notify notnull nowait null nulls
object of off offset oids old omit on only operator optimize option options or
order ordinality others out outer over overlaps overriding owned owner parallel
parser partial partition passing password period permissive persist placing
plain plan plans policy pragma preceding precision prepare prepared preserve
primary prior privileges procedural procedure procedures processlist program
provider public publication qualify query quick quotes range read reassign
recursive ref references referencing refresh regexp reindex relative release
rename repack repair repeatable replace replica replication reset respect
restart restrict restrictive return returning returns revoke right rlike role
rollback rollup routine routines row rows rule savepoint scalar schema schemas
scroll search security select separator sequence sequences serializable server
session set setof sets settings share show similar simple skip snapshot some
source spatial stable start statement statistics status stdin stdout storage
stored straight_join strict subscription summary superuser support symmetric
sysid system table tables tablesample tablespace temp template temporary then
ties timing to trailing transaction transform trigger true truncate trusted
try_cast type types uescape unbounded uncommitted unconditional union unique
unlisten unlock unlogged unsigned until update usage use user using vacuum
valid validate validator values variables variadic varying verbose version
view views virtual visible volatile wal when where window with within without
work wrapper write xml xor yaml zerofill
""".split()

names = set()

def walk(node):
    if isinstance(node, dict):
        if node.get('type') == 'ALIAS' and not node.get('named') and re.fullmatch(r'[A-Z_%][A-Z_ %]*', node['value']):
            names.add(node['value'])
        for v in node.values():
            walk(v)
    elif isinstance(node, list):
        for v in node:
            walk(v)

walk(grammar['rules'])

def wrap(items, indent, width=78):
    lines, line = [], indent
    for item in items:
        if len(line) + len(item) + 1 > width and line.strip():
            lines.append(line)
            line = indent
        line += ('' if line == indent else ' ') + item
    lines.append(line)
    return '\n'.join(lines)

def replace_between(text, begin_marker, end_marker, body):
    begin = text.index(begin_marker + '\n') + len(begin_marker) + 1
    end = text.index(end_marker)
    return text[:begin] + body + text[end:]

# Hard keywords.
begin = query.index('; keywords: begin\n')
rest = re.sub(r'\(#[^)]*\)', '', query[:begin])  # not the predicates' strings
taken = set(re.findall(r'"([A-Z_%][A-Z_ %]*)"', rest))
plain = sorted(names - taken)
body = '[\n' + wrap([f'"{n}"' for n in plain], '  ') + '\n] @keyword\n\n'
query = replace_between(query, '; keywords: begin', '; keywords: end', body)

# Soft keywords.
words = sorted(set(SOFT_KEYWORDS))
parents = '\n'.join(f'  ({p}\n    (identifier) @keyword)' for p in SOFT_PARENTS)
values = wrap([f'"{w}"' for w in words] + [f'"{w.upper()}"' for w in words], '    ')
body = f'([\n{parents}\n]\n  (#any-of? @keyword\n{values}))\n\n'
query = replace_between(query, '; soft keywords: begin', '; soft keywords: end', body)

open(query_path, 'w').write(query)
print(f'{len(plain)} keywords ({len(names & taken)} captured elsewhere), {len(words)} soft keywords')
