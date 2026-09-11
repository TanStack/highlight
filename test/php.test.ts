import { describe, expect, it } from 'vitest'
import { createHighlighter } from '../src/core'
import { php } from '../src/languages/php'
import { html } from '../src/languages/html'

const highlighter = createHighlighter({ languages: [php, html] })

function classes(code: string, text: string) {
  const result = highlighter.tokenize(code, { lang: 'php' })
  expect(result.tokens.map((token) => token.value).join('')).toBe(code)
  const start = code.indexOf(text)
  expect(start).toBeGreaterThanOrEqual(0)
  let offset = 0
  return result.tokens.flatMap((token) => {
    const from = offset
    offset += token.value.length
    return from < start + text.length && offset > start ? [token.className] : []
  })
}

describe('PHP documentation syntax', () => {
  it('highlights ordinary PHP excerpts without tags', () => {
    const code = '$answer = 42; function greet(string $name): string { return "Hi " . $name; }'
    expect(classes(code, '$answer')).toEqual(['variable'])
    expect(classes(code, '42')).toEqual(['number'])
    expect(classes(code, 'greet')).toEqual(['function'])
    expect(classes(code, 'string')).toEqual(['type'])
  })

  it('delegates HTML only when it is registered', () => {
    const code = '<p><?= $name ?></p><b><?php echo 1; ?></b>'
    expect(classes(code, '$name')).toEqual(['variable'])
    expect(classes(code, '<?=')).toEqual(['meta'])
    expect(classes(code, '<?php')).toEqual(['meta'])
    expect(classes(code, 'echo')).toEqual(['keyword'])
    const alone = createHighlighter({ languages: [php] }).highlight(code, { lang: 'php' })
    const together = highlighter.highlight(code, { lang: 'php' })
    expect(alone.html).not.toContain('th-tag')
    expect(together.html).toContain('th-tag')
    expect(alone.html).toContain('&lt;p&gt;')
    expect(alone.tokens.map((token) => token.value).join('')).toBe(code)
  })

  it('keeps closing tags inside quoted strings and block comments', () => {
    const code = '<?php $url = "https://example.com/?>"; /* ?> */ echo true; ?>'
    expect(classes(code, '"https://example.com/?>"')).toEqual(['string'])
    expect(classes(code, '/* ?> */')).toEqual(['comment'])
    expect(classes(code, 'echo')).toEqual(['keyword'])
    expect(classes(code, 'true')).toEqual(['literal'])
  })

  it('ends line comments at a closing tag', () => {
    for (const comment of ['// comment', '# comment']) {
      const code = `<?php ${comment} ?><p>Visible</p>`
      expect(classes(code, comment)).toEqual(['comment'])
      expect(classes(code, '?>')).toEqual(['meta'])
      expect(classes(code, 'Visible')).not.toContain('comment')
      expect(highlighter.highlight(code, { lang: 'php' }).html).toContain('th-tag')
    }
  })

  it('distinguishes attributes from hash comments', () => {
    const code = '<?php #[Route("/home")] class Home {} # done'
    expect(classes(code, 'Route')).toEqual(['attr'])
    expect(classes(code, '"/home"')).toEqual(['string'])
    expect(classes(code, 'Home')).toEqual(['type'])
    expect(classes(code, '# done')).toEqual(['comment'])
  })

  it('protects interpolation with quoted keys and escaped dollar signs', () => {
    const strings = ['"Hello {$user["name"]}!"', '"Hello {$user[\'name\']}!"', '"escaped \\${value} and $name"', '"nested {$values[0][\'key\']}"']
    for (const string of strings) {
      const code = `<?php $text = ${string}; echo 42;`
      expect(classes(code, string), string).toEqual(['string'])
      expect(classes(code, 'echo'), string).toEqual(['keyword'])
      expect(classes(code, '42'), string).toEqual(['number'])
    }
  })

  it('keeps indented heredoc and nowdoc bodies together with exact delimiters', () => {
    for (const header of ['<<<END', '<<<"END"', "<<<'END'"]) {
      const string = `${header}\r\n  ENDING\r\n  \"quotes\" ?> # text $name\r\n  END`
      const code = `<?php $text = ${string};\r\necho 42;`
      expect(classes(code, string), header).toEqual(['string'])
      expect(classes(code, 'echo'), header).toEqual(['keyword'])
      expect(classes(code, '42'), header).toEqual(['number'])
    }
  })

  it('handles heredoc terminators inside an expression', () => {
    const code = '<?php $texts = [<<<END\ntext\nEND, 42];'
    expect(classes(code, '<<<END\ntext\nEND')).toEqual(['string'])
    expect(classes(code, '42')).toEqual(['number'])
  })

  it('supports numeric forms, nullsafe access, and case-insensitive keywords', () => {
    for (const number of ['1_000', '0xFF', '0b1010', '0o755', '.5', '1.5e-2', '1.']) {
      expect(classes(`$n = ${number};`, number)).toEqual(['number'])
    }
    const code = '$value = $user?->name ?? NULL; RETURN $value;'
    expect(classes(code, '?->')).toEqual(['operator'])
    expect(classes(code, 'name')).toEqual(['property'])
    expect(classes(code, 'NULL')).toEqual(['literal'])
    expect(classes(code, 'RETURN')).toEqual(['keyword'])
  })

  it('keeps keyword-named members out of keyword matching', () => {
    const code = '$object->match(); $object->readonly; Service::list();'
    expect(classes(code, 'match')).toEqual(['function'])
    expect(classes(code, 'readonly')).toEqual(['property'])
    expect(classes(code, 'list')).toEqual(['function'])
  })

  it('does not need a closing tag and leaves an unclosed string intact', () => {
    expect(classes('<?php echo "text', '"text')).toEqual(['string'])
    expect(classes('<?php echo 42;', '42')).toEqual(['number'])
  })
})
