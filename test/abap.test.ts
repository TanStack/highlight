import { describe, expect, it } from 'vitest'
import { createHighlighter } from '../src/core'
import { abap } from '../src/languages/abap'

const highlighter = createHighlighter({ languages: [abap] })

function classes(code: string, text: string, occurrence = 0) {
  const result = highlighter.tokenize(code, { lang: 'abap' })
  expect(result.tokens.map((token) => token.value).join('')).toBe(code)
  let start = -1
  for (let count = 0; count <= occurrence; count++) start = code.indexOf(text, start + 1)
  expect(start).toBeGreaterThanOrEqual(0)
  let offset = 0
  return result.tokens.flatMap((token) => {
    const from = offset
    offset += token.value.length
    return from < start + text.length && offset > start ? [token.className] : []
  })
}

describe('ABAP documentation syntax', () => {
  it('distinguishes first-column star comments from multiplication', () => {
    const code = '* full-line comment with "quote\nlv_area = lv_width * lv_height. " trailing comment\n  * not a comment'
    expect(classes(code, '* full-line comment with "quote')).toEqual(['comment'])
    expect(classes(code, '" trailing comment')).toEqual(['comment'])
    expect(classes(code, '*', 1)).toEqual(['operator'])
    expect(classes(code, '*', 2)).not.toContain('comment')
  })

  it('isolates quoted literals with doubled delimiters', () => {
    const code = `lv_text = 'it''s " not a comment'.\nlv_chars = \`back\`\`tick\`.\nlv_next = 1.`
    expect(classes(code, `'it''s " not a comment'`)).toEqual(['string'])
    expect(classes(code, '`back``tick`')).toEqual(['string'])
    expect(classes(code, '1.')).toContain('number')
  })

  it('keeps string template text as strings and tokenizes embedded expressions', () => {
    const code = "lv_msg = |Total: { lv_count } items \\| { to_upper( 'x' ) }|."
    expect(classes(code, '|Total: {')).toEqual(['string'])
    expect(classes(code, 'lv_count')).toEqual([undefined])
    expect(classes(code, '} items \\| {')).toEqual(['string'])
    expect(classes(code, 'to_upper')).toEqual(['function'])
    expect(classes(code, "'x'")).toEqual(['string'])
    expect(classes(code, '}|')).toEqual(['string'])
  })

  it('scans deeply nested templates without recursion', () => {
    const deep = `${'|{ '.repeat(50_000)}x\nDATA lv TYPE i.`
    const started = performance.now()
    expect(classes(deep, 'DATA')).toEqual(['keyword'])
    expect(performance.now() - started).toBeLessThan(1_000)
  })

  it('ends unterminated literals at the line end', () => {
    const code = "lv_a = 'open\nlv_b = |open { lv_c\nDATA lv_d TYPE i."
    expect(classes(code, 'DATA')).toEqual(['keyword'])
    expect(classes(code, 'lv_d')).toEqual([undefined])
  })

  it('matches keywords case-insensitively, including hyphenated statements', () => {
    const code = 'CLASS-METHODS create.\nclass-data gv_count TYPE i.\nStart-Of-Selection.\nLOOP AT lt_items ASSIGNING FIELD-SYMBOL(<ls_item>).\nENDLOOP.'
    for (const keyword of ['CLASS-METHODS', 'class-data', 'Start-Of-Selection', 'LOOP', 'AT', 'ASSIGNING', 'FIELD-SYMBOL', 'ENDLOOP']) {
      expect(classes(code, keyword), keyword).toEqual(['keyword'])
    }
    expect(classes(code, '<ls_item>')).toEqual(['variable'])
    expect(classes(code, 'create')).toEqual(['function'])
  })

  it('prefers calls and inline declaration names over keywords next to parentheses', () => {
    const code = "update( abap_true ).\nDATA(message) = |{ text }|.\nmethods( ).\nMETHODS get RETURNING VALUE(result) TYPE string."
    expect(classes(code, 'update')).toEqual(['function'])
    expect(classes(code, 'DATA')).toEqual(['keyword'])
    expect(classes(code, 'message')).toEqual([undefined])
    expect(classes(code, 'methods')).toEqual(['function'])
    expect(classes(code, 'VALUE')).toEqual(['keyword'])
    expect(classes(code, 'result')).toEqual([undefined])
  })

  it('keeps keyword-like component names plain after selectors', () => {
    const code = 'lv_type = ls_entry-type.\nlv_value = lo_object->value.\nlv_index = zcl_util=>index.\nlo_obj->if_api~data = 1.'
    expect(classes(code, 'type', 1)).toEqual(['property'])
    expect(classes(code, 'value', 1)).toEqual(['property'])
    expect(classes(code, 'index', 1)).toEqual(['property'])
    expect(classes(code, 'data')).toEqual(['property'])
    expect(classes(code, 'zcl_util')).toEqual(['type'])
    expect(classes(code, '->')).toEqual(['operator'])
  })

  it('recognizes declared types, class names, and method calls', () => {
    const code = 'DATA lt_rows TYPE STANDARD TABLE OF ty_row WITH EMPTY KEY.\nDATA lo_ref TYPE REF TO zcl_parser.\nCLASS lcl_app DEFINITION INHERITING FROM /bobf/cl_base.\nlo_ref = NEW zcl_parser( ).\nlo_ref->parse( iv_text = lv_text ).'
    expect(classes(code, 'ty_row')).toEqual(['type'])
    expect(classes(code, 'zcl_parser')).toEqual(['type'])
    expect(classes(code, 'zcl_parser', 1)).toEqual(['type'])
    expect(classes(code, 'lcl_app')).toEqual(['type'])
    expect(classes(code, '/bobf/cl_base')).toEqual(['type'])
    expect(classes(code, 'parse', 2)).toEqual(['function'])
    expect(classes(code, ' = ', 1)).toContain('operator')
  })

  it('keeps namespace slashes and component dashes out of operators', () => {
    const code = 'lv_x = /bobf/cl_lib=>get( ).\nlv_y = sy-subrc - 1.\nlv_z = lv_a / 2.'
    expect(classes(code, '/bobf/cl_lib')).toEqual(['type'])
    expect(classes(code, 'subrc')).toEqual(['property'])
    expect(classes(code, ' - ')).toContain('operator')
    expect(classes(code, ' / ')).toContain('operator')
  })

  it('recognizes pragmas, literals, and numbers', () => {
    const code = 'DATA lv_unused TYPE abap_bool ##NEEDED.\nlv_flag = abap_true.\nIF lv_text IS INITIAL OR lv_char = space.\nENDIF.\nlv_part = lv_text+2(3).'
    expect(classes(code, '##NEEDED')).toEqual(['meta'])
    expect(classes(code, 'abap_true')).toEqual(['literal'])
    expect(classes(code, 'space')).toEqual(['literal'])
    expect(classes(code, 'abap_bool')).toEqual(['type'])
    expect(classes(code, '2')).toEqual(['number'])
    expect(classes(code, '3')).toEqual(['number'])
  })

  it('registers only its own name', () => {
    expect(highlighter.normalizeLanguage('ABAP')).toBe('abap')
    expect(createHighlighter({ languages: [] }).normalizeLanguage('abap')).toBe('plaintext')
  })
})
