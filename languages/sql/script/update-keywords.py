#!/usr/bin/env python3
"""Rewrite the keyword list in queries/highlights.scm from src/grammar.json.

Keywords are case-insensitive regexes aliased to their upper-case spelling,
so they show up as anonymous nodes like "SELECT". A query that names a node
the grammar does not have fails to load, so the list is generated: every
anonymous alias in the grammar, minus the ones highlights.scm captures
earlier in the file. The list goes between the `; keywords: begin` and
`; keywords: end` markers.

Run it after `tree-sitter generate` whenever keywords change.
"""
import json, os, re

here = os.path.join(os.path.dirname(__file__), '..')
grammar = json.load(open(os.path.join(here, 'src', 'grammar.json')))
query_path = os.path.join(here, 'queries', 'highlights.scm')
query = open(query_path).read()

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

begin = query.index('; keywords: begin\n') + len('; keywords: begin\n')
end = query.index('; keywords: end')
# Keywords captured by a more specific pattern before the list. (Patterns
# after it override the plain capture for some uses, like CASE ... END.)
rest = re.sub(r'\(#[^)]*\)', '', query[:begin])  # not the predicates' strings
taken = set(re.findall(r'"([A-Z_%][A-Z_ %]*)"', rest))
plain = sorted(names - taken)

lines = ['[']
line = ' '
for name in plain:
    item = f' "{name}"'
    if len(line) + len(item) > 78:
        lines.append(line)
        line = ' '
    line += item
lines.append(line)
lines.append('] @keyword\n')
query = query[:begin] + '\n'.join(lines) + '\n' + query[end:]
open(query_path, 'w').write(query)
print(f'{len(plain)} keywords, {len(names & taken)} captured elsewhere')
