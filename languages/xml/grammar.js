/**
 * @file XML grammar for tree-sitter
 * @license MIT
 *
 * XML 1.0 (Fifth Edition), with no external scanner. Covers the prolog (XML
 * declaration, processing instructions, comments, DOCTYPE with an internal
 * subset), elements, attributes, character and entity references, and CDATA
 * sections. Markup declarations, parameter entity references and conditional
 * sections are also accepted at the top level, so external DTD files parse.
 *
 * Without a scanner the parser cannot compare an end tag's name with its start
 * tag's, so `<a></b>` parses without error. See the README.
 */

/// <reference types="tree-sitter-cli/dsl" />
// @ts-check

// Productions [4] and [4a] of the spec.
const NAME_START_CHAR =
  ':A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D' +
  '\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF' +
  '\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD\\u{10000}-\\u{EFFFF}';
const NAME_CHAR = NAME_START_CHAR + '\\-.0-9\\u00B7\\u0300-\\u036F\\u203F-\\u2040';

const NAME = new RegExp(`[${NAME_START_CHAR}][${NAME_CHAR}]*`, "u");
const NMTOKEN = new RegExp(`[${NAME_CHAR}]+`, "u");

// XML whitespace is exactly these four characters.
const S = ' \\t\\r\\n';

module.exports = grammar({
  name: 'xml',

  extras: _ => [new RegExp(`[${S}]`)],

  supertypes: $ => [$._markup_declaration],

  conflicts: $ => [
    // In an external DTD, `%a;` in an attribute list is either a whole list
    // of definitions or the name of one: `<!ATTLIST e %a; %b; #IMPLIED>`.
    [$.attlist_declaration, $.attribute_definition],
  ],

  rules: {
    document: $ => seq(
      optional($.xml_declaration),
      repeat(choice(
        $._misc,
        $.doctype,
        $.element,
        // External subset (a .dtd file).
        $._markup_declaration,
        $.conditional_section,
      )),
    ),

    _misc: $ => choice($.comment, $.processing_instruction),

    // [23] XMLDecl. Its pseudo-attributes are parsed as ordinary attributes.
    xml_declaration: $ => seq(
      '<?',
      token.immediate('xml'),
      repeat($.attribute),
      '?>',
    ),

    // [16] PI. The target is a name other than `xml`.
    processing_instruction: $ => seq(
      '<?',
      field('target', alias(token.immediate(NAME), $.pi_target)),
      optional(field('content', $.pi_content)),
      '?>',
    ),

    // Anything up to `?>`. Leading whitespace is skipped as an extra.
    pi_content: _ => token(/([^?\s]|\?+[^?>])([^?]|\?+[^?>])*/),

    // [15] Comment. The spec forbids `--` inside a comment, but real files
    // have it often enough that a comment simply ends at the first `-->`.
    comment: _ => token(seq('<!--', /([^-]|-[^-]|--+[^->])*/, /-*-->/)),

    // ── Elements ────────────────────────────────────────────────────────────

    // [39] element
    element: $ => choice(
      seq(
        field('start', $.start_tag),
        repeat($._content),
        field('end', $.end_tag),
      ),
      $.self_closing_tag,
    ),

    start_tag: $ => seq(
      '<',
      field('name', $.tag_name),
      repeat($.attribute),
      '>',
    ),

    self_closing_tag: $ => seq(
      '<',
      field('name', $.tag_name),
      repeat($.attribute),
      '/>',
    ),

    end_tag: $ => seq(
      '</',
      field('name', $.tag_name),
      '>',
    ),

    // No whitespace may follow `<` or `</`.
    tag_name: _ => token.immediate(NAME),

    // [43] content
    _content: $ => choice(
      $.element,
      $.text,
      $.entity_reference,
      $.character_reference,
      $.cdata_section,
      $.processing_instruction,
      $.comment,
    ),

    // [14] CharData. Leading and trailing whitespace is left out of the token
    // (it is skipped as an extra); whitespace inside a run of text is kept.
    text: _ => new RegExp(`[^<&${S}]([^<&]*[^<&${S}])?`),

    // [41] Attribute
    attribute: $ => seq(
      field('name', alias($.name, $.attribute_name)),
      '=',
      field('value', $.attribute_value),
    ),

    // [10] AttValue
    attribute_value: $ => choice(
      seq(
        '"',
        repeat(choice(
          alias(token.immediate(/[^<&"]+/), $.attribute_text),
          $.entity_reference,
          $.character_reference,
        )),
        '"',
      ),
      seq(
        '\'',
        repeat(choice(
          alias(token.immediate(/[^<&']+/), $.attribute_text),
          $.entity_reference,
          $.character_reference,
        )),
        '\'',
      ),
    ),

    // [18]–[21] CDSect. A `]` right before the closing `]]>` is lexed as part
    // of the delimiter, since the content token cannot look ahead.
    cdata_section: $ => seq(
      '<![CDATA[',
      optional(alias(
        token.immediate(/([^\]]|\][^\]]|\]\]+[^\]>])+/),
        $.cdata,
      )),
      alias(token.immediate(/\]\]+>/), ']]>'),
    ),

    // [66]–[68] References.
    entity_reference: _ => token(seq('&', NAME, ';')),

    character_reference: _ => token(choice(
      /&#[0-9]+;/,
      /&#x[0-9a-fA-F]+;/,
    )),

    parameter_entity_reference: _ => token(seq('%', NAME, ';')),

    // ── Document type declaration ───────────────────────────────────────────

    // [28] doctypedecl
    doctype: $ => seq(
      '<!DOCTYPE',
      field('name', $.name),
      optional(field('id', $.external_id)),
      optional(field('subset', $.internal_subset)),
      '>',
    ),

    internal_subset: $ => seq(
      '[',
      repeat(choice($._markup_declaration, $._misc)),
      ']',
    ),

    // [29] markupdecl and [28a] DeclSep, less the comments and processing
    // instructions, which are in `_misc`.
    _markup_declaration: $ => choice(
      $.element_declaration,
      $.attlist_declaration,
      $.entity_declaration,
      $.notation_declaration,
      $.parameter_entity_reference,
    ),

    // [75] ExternalID
    external_id: $ => choice(
      seq('SYSTEM', field('system', $.system_literal)),
      seq(
        'PUBLIC',
        field('public', $.pubid_literal),
        field('system', $.system_literal),
      ),
    ),

    // [83] PublicID, only in notation declarations.
    public_id: $ => seq('PUBLIC', field('public', $.pubid_literal)),

    system_literal: $ => $._literal,
    pubid_literal: $ => $._literal,
    _literal: _ => token(choice(/"[^"]*"/, /'[^']*'/)),

    // [45] elementdecl
    element_declaration: $ => seq(
      '<!ELEMENT',
      field('name', choice($.name, $.parameter_entity_reference)),
      field('content', choice(
        alias('EMPTY', $.empty),
        alias('ANY', $.any),
        $.mixed_content,
        $._content_particle,
      )),
      '>',
    ),

    // [51] Mixed
    mixed_content: $ => seq(
      '(',
      '#PCDATA',
      repeat(seq('|', choice($.name, $.parameter_entity_reference))),
      ')',
      optional(token.immediate('*')),
    ),

    // [48] cp. A quantifier follows its particle as an anonymous sibling.
    _content_particle: $ => seq(
      choice(
        $.name,
        $.content_choice,
        $.content_sequence,
        $.parameter_entity_reference,
      ),
      optional(choice(
        token.immediate('?'),
        token.immediate('*'),
        token.immediate('+'),
      )),
    ),

    // [49] choice
    content_choice: $ => seq(
      '(',
      $._content_particle,
      repeat1(seq('|', $._content_particle)),
      ')',
    ),

    // [50] seq
    content_sequence: $ => seq(
      '(',
      $._content_particle,
      repeat(seq(',', $._content_particle)),
      ')',
    ),

    // [52] AttlistDecl
    attlist_declaration: $ => seq(
      '<!ATTLIST',
      field('name', choice($.name, $.parameter_entity_reference)),
      repeat(choice($.attribute_definition, $.parameter_entity_reference)),
      '>',
    ),

    // [53] AttDef
    attribute_definition: $ => seq(
      field('name', choice($.name, $.parameter_entity_reference)),
      field('type', choice(
        $.attribute_type,
        $.notation_type,
        $.enumeration,
        $.parameter_entity_reference,
      )),
      field('default', choice(
        $.default_declaration,
        $.parameter_entity_reference,
      )),
    ),

    // [55] StringType, [56] TokenizedType
    attribute_type: _ => choice(
      'CDATA',
      'ID',
      'IDREF',
      'IDREFS',
      'ENTITY',
      'ENTITIES',
      'NMTOKEN',
      'NMTOKENS',
    ),

    // [58] NotationType
    notation_type: $ => seq(
      'NOTATION',
      '(',
      $.name,
      repeat(seq('|', $.name)),
      ')',
    ),

    // [59] Enumeration
    enumeration: $ => seq(
      '(',
      $.nmtoken,
      repeat(seq('|', $.nmtoken)),
      ')',
    ),

    // [60] DefaultDecl
    default_declaration: $ => choice(
      '#REQUIRED',
      '#IMPLIED',
      seq(optional('#FIXED'), field('value', $.attribute_value)),
    ),

    // [70] EntityDecl
    entity_declaration: $ => seq(
      '<!ENTITY',
      optional(field('parameter', '%')),
      field('name', $.name),
      choice(
        field('value', $.entity_value),
        seq(
          field('id', $.external_id),
          optional(seq('NDATA', field('notation', $.name))),
        ),
      ),
      '>',
    ),

    // [9] EntityValue
    entity_value: $ => choice(
      seq(
        '"',
        repeat(choice(
          alias(token.immediate(/[^%&"]+/), $.entity_text),
          $.parameter_entity_reference,
          $.entity_reference,
          $.character_reference,
        )),
        '"',
      ),
      seq(
        '\'',
        repeat(choice(
          alias(token.immediate(/[^%&']+/), $.entity_text),
          $.parameter_entity_reference,
          $.entity_reference,
          $.character_reference,
        )),
        '\'',
      ),
    ),

    // [82] NotationDecl
    notation_declaration: $ => seq(
      '<!NOTATION',
      field('name', $.name),
      field('id', choice($.external_id, $.public_id)),
      '>',
    ),

    // [61]–[65] conditionalSect, external subset only. The body of an IGNORE
    // section is parsed as declarations too.
    conditional_section: $ => seq(
      '<![',
      field('keyword', choice('INCLUDE', 'IGNORE', $.parameter_entity_reference)),
      '[',
      repeat(choice($._markup_declaration, $._misc, $.conditional_section)),
      ']]>',
    ),

    name: _ => NAME,
    nmtoken: _ => NMTOKEN,
  },
});
