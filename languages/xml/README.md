# tree-sitter-xml

A [tree-sitter](https://tree-sitter.github.io) grammar for
[XML 1.0 (Fifth Edition)](https://www.w3.org/TR/xml/), with no external
scanner.

It covers the XML declaration, processing instructions, comments, elements,
attributes, character and entity references, CDATA sections, and document
type declarations with an internal subset (element, attribute list, entity
and notation declarations). Markup declarations, parameter entity references
and conditional sections are also accepted at the top level, so external DTD
files (`.dtd`) parse too.

## Leniency and limits

Without an external scanner, a few things are looser than the spec:

- **End tags are not matched to start tags.** `<a></b>` parses without
  error. Checking it needs the parser to remember the open tag's name, which
  only a scanner can do.
- **Comments end at the first `-->`**, even if they contain `--`, which the
  spec forbids. Plenty of real files do it.
- **A document can hold any number of root elements**, and the prolog's
  parts (comments, processing instructions, the DOCTYPE) may come in any
  order. This lets fragments parse.
- **DTDs are parsed with external-subset rules everywhere.** Parameter entity
  references are accepted inside declarations in the internal subset too,
  and the body of an `IGNORE` section is parsed as declarations rather than
  skipped.
- The XML declaration's pseudo-attributes are parsed as ordinary attributes,
  so their names and order are not checked.
- In a CDATA section that ends with `]`, as in `<![CDATA[a]]]>`, the last `]`
  is lexed as part of the closing delimiter rather than the content.

Otherwise tokens follow the spec: a bare `&` or `<` in text, an unquoted
attribute value, a space after `<` or `</`, and an unterminated comment or
CDATA section are errors. Names accept the spec's full set of Unicode
characters.

## Tree shape

- `document` holds an optional `xml_declaration`, then `element`s,
  `comment`s, `processing_instruction`s and a `doctype`.
- An `element` is a `start_tag` (field `start`), its content and an
  `end_tag` (field `end`), or a single `self_closing_tag`. Each tag has a
  `name` field (`tag_name`).
- Content is `element`, `text`, `entity_reference`, `character_reference`,
  `cdata_section`, `processing_instruction` and `comment`. `text` leaves out
  the whitespace at its start and end; whitespace between tags is not in the
  tree.
- An `attribute` has `name` (`attribute_name`) and `value` fields. An
  `attribute_value` includes its quotes and contains `attribute_text` and
  references.
- A `processing_instruction` has `target` (`pi_target`) and optional
  `content` (`pi_content`) fields. A `cdata_section` contains one `cdata`
  node unless it is empty.
- A `doctype` has `name`, `id` (an `external_id`) and `subset` (an
  `internal_subset`) fields. `_markup_declaration` is a supertype covering
  `element_declaration`, `attlist_declaration`, `entity_declaration`,
  `notation_declaration` and `parameter_entity_reference`.
- In an `element_declaration`, the `content` is `empty`, `any`,
  `mixed_content`, a `content_sequence`, a `content_choice` or a lone
  `name`. A `?`, `*` or `+` follows its particle as an anonymous sibling.

## Validation

`script/check-xml-files.sh <dir>...` parses every XML file (by extension:
`.xml`, `.xsd`, `.xsl`, `.svg`, `.plist`, `.dtd` and others) under the given
directories and lists those with errors. Binary property lists are skipped.
Results from 2026-11-12:

| Input | Files | Result |
| --- | --- | --- |
| `/System/Library` and `/Library` on macOS 13 | 17,994 | all XML parses; the 27 failures are OpenStep and `.strings`-format files named `.plist` |
| OpenJDK | 2,011 | 2,000 parse; the 11 failures are below |
| Linux, Swift, CMake, nixpkgs | 204 | 203 parse; the failure is below |

The 12 failures are all invalid XML:

- 6 are deliberately broken test inputs (`invalidxml/`, `bad_cat.xml`,
  `invalid.xsl`, a backslash-escaped DOCTYPE, a malformed
  `xsi:schemaLocation`)
- 3 are not XML at all, only plain text
- 1 is a template with `{{placeholders}}` as tag names
- 1 is `html32.dtd`, an SGML DTD with `--` comments inside declarations
- 1 is nixpkgs' expected output for a test of *unescaped* plist strings

Parsing runs at about 15 MB/s on a 16 MB file.

## Queries

`queries/highlights.scm` captures tag names as `@tag`, attribute names as
`@tag.attribute`, references as `@string.escape` and DTD keywords as
`@keyword`. `queries/folds.scm` folds elements, comments, CDATA sections and
DTD subsets.

## Development

```bash
tree-sitter generate --js-runtime bun
```

```bash
tree-sitter test
```

```bash
script/check-xml-files.sh /System/Library ~/src/openjdk
```

`tree-sitter test --update` writes corpus trees without field names. To record
them with fields, run `script/update-corpus-fields.py` instead, then review the
diff: it records what the parser does now, not what it should do.
