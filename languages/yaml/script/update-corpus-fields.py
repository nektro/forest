#!/usr/bin/env python3
"""Rewrite the expected trees in test/corpus/*.txt to include field names.

`tree-sitter test --update` writes trees without fields. This script
re-parses each test's input with `tree-sitter parse` (which prints fields)
and replaces the expected output, so corpus tests also check fields.

The corpus uses `|||` after its `===` and `---` lines, because YAML has
`---` lines of its own. Each input starts on the line after its header, with
no blank line between: `tree-sitter test` keeps such a blank line as part of
the input, and the start of the input matters to YAML (`---` and `%YAML` at
the very start, or an indented first line).

Review the resulting diff by hand: this records what the parser does now,
not what it should do.
"""
import glob, os, re, subprocess, tempfile

HEADER = re.compile(r'^(={3,}\|\|\|)\n(.*?)\n\1\n', re.M | re.S)
SEP = re.compile(r'^-{3,}\|\|\|\n', re.M)
POS = re.compile(r' \[\d+, \d+\] - \[\d+, \d+\]')
HERE = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')


def parse(src):
    with tempfile.NamedTemporaryFile('w', suffix='.yaml', delete=False, newline='') as f:
        f.write(src)
        path = f.name
    try:
        out = subprocess.run(['tree-sitter', 'parse', path], capture_output=True, text=True, cwd=HERE).stdout
    finally:
        os.unlink(path)
    out = POS.sub('', out)
    # Drop blank lines and the summary line printed for a tree with errors.
    return '\n'.join(l for l in out.splitlines() if l.strip() and not l.startswith(path)) + '\n'


for corpus in sorted(glob.glob(os.path.join(HERE, 'test', 'corpus', '*.txt'))):
    text = open(corpus, newline='').read()  # keep the CRLF test's line endings
    heads = list(HEADER.finditer(text))
    out = []
    for i, h in enumerate(heads):
        body = text[h.end():heads[i + 1].start() if i + 1 < len(heads) else len(text)]
        sep = SEP.search(body)
        raw = body[:sep.start()]
        # tree-sitter test drops the blank line before the separator.
        src = raw[:-1] if raw.endswith('\n\n') else raw
        out.append(h.group(0) + raw + sep.group(0) + '\n' + parse(src))
    open(corpus, 'w', newline='').write('\n'.join(out))
    print('updated', os.path.relpath(corpus))
