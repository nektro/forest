#!/usr/bin/env python3
"""Check that every heredoc body ends at its own delimiter.

Parses the given Ruby files and, for each `heredoc_body`, compares its last
line with the delimiter of the last `heredoc_beginning` on the line where the
body starts. Prints the bodies that end elsewhere.

    script/check-heredocs.py $(find ~/src/ruby -name '*.rb')
"""
import re, subprocess, sys

NODE = re.compile(r'\((heredoc_beginning|heredoc_body) \[(\d+), (\d+)\] - \[(\d+), (\d+)\]')

def check(path):
    tree = subprocess.run(['tree-sitter', 'parse', path], capture_output=True, text=True).stdout
    data = open(path, 'rb').read()
    lines = data.split(b'\n')
    def text(r1, c1, r2, c2):
        if r1 == r2:
            return lines[r1][c1:c2]
        return b'\n'.join([lines[r1][c1:]] + lines[r1 + 1:r2] + [lines[r2][:c2]])
    starts = {}
    bodies = []
    for m in NODE.finditer(tree):
        kind, r1, c1, r2, c2 = m.group(1), *map(int, m.groups()[1:])
        if kind == 'heredoc_beginning':
            word = re.sub(rb'^<<[~-]?', b'', text(r1, c1, r2, c2)).strip(b'\'"`')
            starts.setdefault(r1, []).append((c1, word))
        else:
            bodies.append((r1, r2, c2))
    ok = bad = 0
    for r1, r2, c2 in bodies:
        # The body ends with the newline after its delimiter line.
        last = lines[r2 - 1] if c2 == 0 else lines[r2]
        words = [w for _, w in sorted(starts.get(r1, []))]
        if words and last.strip() == words[-1]:
            ok += 1
        else:
            bad += 1
            print(f'{path}:{r1 + 1}: expected {words[-1:] or "?"}, ends at {last.strip()[:60]!r} (line {r2 if c2 == 0 else r2 + 1})')
    return ok, bad

total_ok = total_bad = 0
for path in sys.argv[1:]:
    ok, bad = check(path)
    total_ok += ok
    total_bad += bad
print(f'{total_ok} bodies end at their delimiter, {total_bad} do not', file=sys.stderr)
