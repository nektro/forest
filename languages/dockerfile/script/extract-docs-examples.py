#!/usr/bin/env python3
"""Extract code blocks from the Dockerfile reference HTML.

usage: script/extract-docs-examples.py <html> <out-dir>

Save the page first, for example with
  curl -o reference.html https://docs.docker.com/reference/dockerfile/
Chroma keeps each line's newline in the text.
Writes NNN.Dockerfile for blocks whose language is dockerfile, and index.tsv.
"""
import html, os, re, sys
from html.parser import HTMLParser

src, out = sys.argv[1], sys.argv[2]
os.makedirs(out, exist_ok=True)
doc = open(src, encoding='utf-8').read()

class P(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.blocks, self.cur, self.depth, self.lang = [], None, 0, None
        self.recent_lang = None
    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if tag == 'pre':
            self.cur, self.lang = [], None
        elif tag == 'code' and self.cur is not None and self.lang is None:
            self.lang = a.get('data-lang')
    def handle_endtag(self, tag):
        if tag == 'pre' and self.cur is not None:
            self.blocks.append((self.lang, ''.join(self.cur)))
            self.cur = None
    def handle_data(self, d):
        if self.cur is not None: self.cur.append(d)

p = P(); p.feed(doc)
langs = {}
k = 0
with open(os.path.join(out, 'index.tsv'), 'w') as idx:
    for lang, text in p.blocks:
        langs[lang] = langs.get(lang, 0) + 1
        if lang not in ('dockerfile', 'Dockerfile'): continue
        text = text.rstrip('\n') + '\n'
        k += 1
        name = f'{k:03d}.Dockerfile'
        open(os.path.join(out, name), 'w').write(text)
        idx.write(f'{name}\t{text.splitlines()[0][:70]}\n')
print(langs, k)
