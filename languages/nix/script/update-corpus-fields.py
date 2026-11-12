#!/usr/bin/env python3
"""Rewrite the expected trees in test/corpus/*.txt to include field names.

`tree-sitter test --update` writes trees without fields. This script
re-parses each test's input with `tree-sitter parse` (which prints fields)
and replaces the expected output, so corpus tests also check fields.

Review the resulting diff by hand: this records what the parser does now,
not what it should do.
"""
import glob, os, re, subprocess, sys, tempfile

HEADER = re.compile(r'^(={3,})\n(.*?)\n\1\n', re.M | re.S)
SEP = re.compile(r'^-{3,}\n', re.M)
POS = re.compile(r' \[\d+, \d+\] - \[\d+, \d+\]')

def parse(src):
    with tempfile.NamedTemporaryFile('w', suffix='.nix', delete=False) as f:
        f.write(src)
        path = f.name
    try:
        out = subprocess.run(['tree-sitter', 'parse', path], capture_output=True, text=True).stdout
    finally:
        os.unlink(path)
    out = POS.sub('', out)
    return '\n'.join(l for l in out.splitlines() if l.strip()) + '\n'

for corpus in sorted(glob.glob(os.path.join(os.path.dirname(__file__), '..', 'test', 'corpus', '*.txt'))):
    text = open(corpus).read()
    heads = list(HEADER.finditer(text))
    out = []
    for i, h in enumerate(heads):
        body = text[h.end():heads[i + 1].start() if i + 1 < len(heads) else len(text)]
        sep = SEP.search(body)
        src = body[:sep.start()]
        # The input is everything up to the separator, minus the blank line
        # tree-sitter test strips before it.
        src = src[1:] if src.startswith('\n') else src
        src = src[:-1] if src.endswith('\n\n') else src
        out.append(h.group(0) + '\n' + src + '\n' + sep.group(0) + '\n' + parse(src))
    open(corpus, 'w').write('\n'.join(out))
    print('updated', os.path.relpath(corpus))
