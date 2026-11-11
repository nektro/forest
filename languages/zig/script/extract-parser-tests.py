#!/usr/bin/env python3
"""Extract the Zig sources embedded in lib/std/zig/parser_test.zig.

testCanonical/testTransform inputs go to <out>/ok, testError inputs to
<out>/err, one file per test.
"""
import os, re, sys

src = open(sys.argv[1]).read()
out = sys.argv[2]
pattern = re.compile(r'try (testCanonical|testTransform|testError)\(\s*\n((?:\s*\\\\[^\n]*\n)+)')
counts = {'ok': 0, 'err': 0}
for d in counts:
    os.makedirs(os.path.join(out, d), exist_ok=True)
for m in pattern.finditer(src):
    kind = 'err' if m.group(1) == 'testError' else 'ok'
    lines = [re.sub(r'^\s*\\\\', '', l) for l in m.group(2).rstrip('\n').split('\n')]
    counts[kind] += 1
    with open(os.path.join(out, kind, f'{counts[kind]:04d}.zig'), 'w') as f:
        f.write('\n'.join(lines) + '\n')
