#!/usr/bin/env python3
"""Extract justfiles from a casey/just checkout: the ```just and ```justfile
blocks of its README, and the justfiles its integration tests pass to
`.justfile(...)`.

usage: script/extract-just-examples.py <just-checkout> <out-dir>

Writes readme/NNN.just and tests/<file>-NNN.just, unindented the way the test
harness unindents them. A test justfile goes in tests/error/ instead when its
test expects `error:` on stderr: most of those are invalid on purpose.
"""
import os, re, sys

src, out = sys.argv[1], sys.argv[2]


def unindent(text):
    # As in just's src/unindent.rs.
    lines = text.splitlines(keepends=True)
    blank = lambda l: l.strip(' \t\r\n') == ''
    indents = [re.match(r'[ \t]*', l).group(0) for l in lines if not blank(l)]
    common = os.path.commonprefix(indents) if indents else ''
    outl = []
    for i, l in enumerate(lines):
        if blank(l):
            outl.append('' if i in (0, len(lines) - 1) else ('\r\n' if l.endswith('\r\n') else '\n'))
        else:
            outl.append(l[len(common):])
    return ''.join(outl)


ESC = {'n': '\n', 'r': '\r', 't': '\t', '\\': '\\', '"': '"', "'": "'", '0': '\0'}


def rust_string(s, i):
    """The Rust string literal at s[i:], or None, and the index after it."""
    m = re.compile(r'r(#*)"').match(s, i)
    if m:
        end = s.index('"' + m.group(1), m.end())
        return s[m.end():end], end + 1 + len(m.group(1))
    if s[i] != '"':
        return None, i
    i += 1
    buf = []
    while s[i] != '"':
        if s[i] == '\\':
            c = s[i + 1]
            if c == '\n':
                # A backslash before a line break skips it and the
                # indentation after it.
                i += 2
                while s[i] in ' \t\n\r':
                    i += 1
                continue
            if c == 'u':
                end = s.index('}', i)
                buf.append(chr(int(s[i + 3:end], 16)))
                i = end + 1
                continue
            if c == 'x':
                buf.append(chr(int(s[i + 2:i + 4], 16)))
                i += 4
                continue
            buf.append(ESC[c])
            i += 2
        else:
            buf.append(s[i])
            i += 1
    return ''.join(buf), i + 1


def write(path, text):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, 'w', newline='') as f:
        f.write(text)


# README code blocks
readme = open(os.path.join(src, 'README.md'), encoding='utf-8').read()
n = 0
for m in re.finditer(r'^```(just|justfile)\n(.*?)^```', readme, re.M | re.S):
    n += 1
    write(os.path.join(out, 'readme', f'{n:03d}.just'), m.group(2))
print(f'readme: {n}')

# Test justfiles
counts = {'ok': 0, 'error': 0}
tests = os.path.join(src, 'tests')
for name in sorted(os.listdir(tests)):
    if not name.endswith('.rs'):
        continue
    text = open(os.path.join(tests, name), encoding='utf-8').read()
    # Split into tests at `#[test]` so each justfile knows its test's stderr.
    bounds = [m.start() for m in re.finditer(r'^#\[test\]', text, re.M)] + [len(text)]
    k = 0
    for a, b in zip([0] + bounds, bounds):
        chunk = text[a:b]
        kind = 'error' if re.search(r'\berror(\[E\d+\])?:', chunk) else 'ok'
        for m in re.finditer(r'\.justfile\(\s*', chunk):
            lit, _ = rust_string(chunk, m.end())
            if lit is None:
                continue
            k += 1
            sub = 'tests' if kind == 'ok' else os.path.join('tests', 'error')
            write(os.path.join(out, sub, f'{name[:-3]}-{k:03d}.just'), unindent(lit))
            counts[kind] += 1
print(f'tests: {counts}')
