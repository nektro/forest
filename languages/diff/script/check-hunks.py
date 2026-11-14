#!/usr/bin/env python3
"""Compare the grammar's hunk lines with a reader that uses the line counts.

The grammar cannot count, so it decides where a hunk ends by how lines start.
This reads each unified hunk the way `patch` does, taking as many lines as
the `@@ -a,b +c,d @@` header says, and reports every line the two disagree
on: a hunk line the grammar reads as something else, or a header line the
grammar reads as a hunk line.

    script/check-hunks.py <dir-or-file>...

Prints one line per disagreement and a count at the end. Exits 1 if there
were any.
"""
import os, re, subprocess, sys

HUNK = re.compile(rb'^@@ -\d+(?:,(\d+))? \+\d+(?:,(\d+))? @@')
NODE = re.compile(r'\((\w+) \[(\d+), \d+\] - \[(\d+), \d+\]')
KIND = {ord(' '): 'context', ord('+'): 'addition', ord('-'): 'deletion', ord('\\'): 'no_newline'}
LINE_NODES = {'context', 'addition', 'deletion', 'no_newline'}


def reference(data):
    """Row -> expected kind, for rows inside count-delimited hunks, and the
    set of rows that start a file (`--- `, `+++ `, `diff `, `@@ `)."""
    lines = data.split(b'\n')
    kinds, headers = {}, set()
    i = 0
    while i < len(lines):
        line = lines[i]
        m = HUNK.match(line)
        if line.startswith((b'--- ', b'+++ ', b'diff ', b'@@ ')):
            headers.add(i)
        if not m:
            i += 1
            continue
        old = int(m.group(1)) if m.group(1) is not None else 1
        new = int(m.group(2)) if m.group(2) is not None else 1
        i += 1
        while i < len(lines) and (old > 0 or new > 0 or lines[i][:1] == b'\\'):
            line = lines[i].rstrip(b'\r')
            c = line[0] if line else ord(' ')
            if c == ord('\\'):
                kinds[i] = 'no_newline'
            elif c == ord(' ') or not line:
                # An empty line is a context line whose space was stripped;
                # the grammar skips it.
                if line:
                    kinds[i] = 'context'
                old -= 1
                new -= 1
            elif c == ord('-'):
                kinds[i] = 'deletion'
                old -= 1
            elif c == ord('+'):
                kinds[i] = 'addition'
                new -= 1
            else:
                break  # A malformed hunk: stop trusting the counts.
            i += 1
    return kinds, headers


def parsed(path):
    out = subprocess.run(['tree-sitter', 'parse', path], capture_output=True, text=True,
                         cwd=os.path.join(os.path.dirname(__file__), '..')).stdout
    rows = {}
    for name, start, end in NODE.findall(out):
        if name in LINE_NODES and start == end:
            rows[int(start)] = name
        elif name in ('old_file', 'new_file', 'hunk_header', 'command'):
            rows.setdefault(int(start), name)
    return rows


def files(args):
    for arg in args:
        if os.path.isdir(arg):
            for root, dirs, names in os.walk(arg):
                dirs[:] = [d for d in dirs if d not in ('node_modules', '.git')]
                for n in names:
                    if n.endswith(('.diff', '.patch', '.debdiff')):
                        yield os.path.join(root, n)
        else:
            yield arg


def main():
    if len(sys.argv) < 2:
        sys.exit(__doc__)
    problems = checked = 0
    for path in files(sys.argv[1:]):
        with open(path, 'rb') as f:
            data = f.read()
        if b'\n@@ ' not in b'\n' + data:
            continue
        checked += 1
        kinds, headers = reference(data)
        rows = parsed(path)
        for row, kind in sorted(kinds.items()):
            if rows.get(row) != kind:
                print(f'{path}:{row + 1}: expected {kind}, got {rows.get(row)}')
                problems += 1
        for row in sorted(headers - kinds.keys()):
            if rows.get(row) in LINE_NODES:
                print(f'{path}:{row + 1}: expected a header, got {rows.get(row)}')
                problems += 1
    print(f'== {checked} files, {problems} disagreements')
    sys.exit(1 if problems else 0)


main()
