#!/usr/bin/env python3
"""Extract Go raw string literals that look like Dockerfiles.

usage: script/extract-go-dockerfiles.py <go-tree> <out-dir>
Writes <out-dir>/NNNNN.Dockerfile and <out-dir>/index.tsv (file, line).
"""
import os, re, sys

root, out = sys.argv[1], sys.argv[2]
os.makedirs(out, exist_ok=True)
KW = re.compile(r'^\s*(FROM|ARG|RUN|COPY|ADD|ENV|LABEL|WORKDIR|CMD|ENTRYPOINT|USER|EXPOSE|VOLUME|SHELL|HEALTHCHECK|ONBUILD|STOPSIGNAL|MAINTAINER)\s', re.I)
DIRECTIVE = re.compile(r'^#\s*(syntax|escape|check)\s*=', re.I)

def raw_strings(src):
    i, n, line = 0, len(src), 1
    while i < n:
        c = src[i]
        if src.startswith('//', i):
            j = src.find('\n', i); i = n if j < 0 else j
        elif src.startswith('/*', i):
            j = src.find('*/', i + 2); j = n if j < 0 else j + 2
            line += src.count('\n', i, j); i = j
        elif c == '"' or c == "'":
            j = i + 1
            while j < n and src[j] != c and src[j] != '\n':
                j += 2 if src[j] == '\\' else 1
            i = j + 1
        elif c == '`':
            j = src.find('`', i + 1); j = n if j < 0 else j
            yield line, src[i + 1:j]
            line += src.count('\n', i, j); i = j + 1
        else:
            if c == '\n': line += 1
            i += 1

def looks_like_dockerfile(s):
    lines = [l for l in s.split('\n') if l.strip()]
    if not lines: return False
    first = next((l for l in lines if not l.lstrip().startswith('#')), None)
    if DIRECTIVE.match(lines[0].lstrip()) and first is None: return False
    # Must start with an instruction and contain FROM somewhere.
    return first is not None and KW.match(first) and re.search(r'^\s*FROM\s', s, re.M | re.I)

k = 0
with open(os.path.join(out, 'index.tsv'), 'w') as idx:
    for d, dirs, files in os.walk(root):
        dirs[:] = [x for x in dirs if x not in ('vendor', '.git')]
        for f in sorted(files):
            if not f.endswith('.go'): continue
            p = os.path.join(d, f)
            src = open(p, encoding='utf-8', errors='replace').read()
            for line, s in raw_strings(src):
                if looks_like_dockerfile(s):
                    k += 1
                    name = f'{k:05d}.Dockerfile'
                    open(os.path.join(out, name), 'w').write(s)
                    idx.write(f'{name}\t{os.path.relpath(p, root)}:{line}\n')
print(k, 'dockerfiles')
