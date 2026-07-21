import type { TokenRange } from '../core.js'
import { collectPatternRanges, offsetRanges } from './patterns.js'

const keywords =
  'abstract|as|asserts|async|await|break|case|catch|class|const|continue|debugger|declare|default|delete|do|else|enum|export|extends|finally|for|from|function|get|if|implements|import|in|infer|instanceof|interface|is|keyof|let|module|namespace|new|of|override|package|private|protected|public|readonly|return|satisfies|set|static|super|switch|this|throw|try|type|typeof|using|var|while|with|yield'

const semanticPatterns = [
  { className: 'function' as const, regex: /@[A-Za-z_$][\w$]*/g },
  {
    className: 'keyword' as const,
    regex: new RegExp(`\\b(?:${keywords})\\b`, 'g'),
  },
  {
    className: 'literal' as const,
    regex: /\b(?:false|null|true|undefined|NaN|Infinity)\b/g,
  },
  {
    className: 'number' as const,
    regex:
      /\b(?:0x[\da-f](?:_?[\da-f])*n?|0b[01](?:_?[01])*n?|0o[0-7](?:_?[0-7])*n?|\d(?:_?\d)*(?:\.\d(?:_?\d)*)?(?:e[+-]?\d(?:_?\d)*)?n?)\b/gi,
  },
  {
    className: 'function' as const,
    regex: /\bfunction\s*\*?\s*([A-Za-z_$][\w$]*)/g,
    group: 1,
  },
  {
    className: 'function' as const,
    regex: /(^|[^.A-Za-z0-9_$])([A-Za-z_$][\w$]*)\s*(?=\()/g,
    group: 2,
  },
  {
    className: 'type' as const,
    regex:
      /\b(?:Array|Record|Promise|Readonly|Set|Map|WeakMap|WeakSet|string|number|boolean|bigint|symbol|object|unknown|never|void|any|[A-Z][A-Za-z0-9_$]*)\b/g,
  },
  {
    className: 'property' as const,
    regex: /(?:\.|\?\.)([A-Za-z_$][\w$]*)/g,
    group: 1,
  },
] as const

export function collectScriptRanges(code: string, jsx = false) {
  const lexical = collectScriptLexicalRanges(code, jsx)
  const markup = jsx ? collectJsxRanges(code) : []
  return collectPatternRanges(code, semanticPatterns, [...lexical, ...markup])
}

function collectScriptLexicalRanges(code: string, jsx: boolean) {
  const ranges: Array<TokenRange> = []
  let index = 0

  while (index < code.length) {
    const character = code[index]
    const next = code[index + 1]

    if (character === '/' && next === '/') {
      const end = findLineEnd(code, index + 2)
      ranges.push({ start: index, end, className: 'comment' })
      index = end
      continue
    }

    if (character === '/' && next === '*') {
      const close = code.indexOf('*/', index + 2)
      const end = close < 0 ? code.length : close + 2
      ranges.push({ start: index, end, className: 'comment' })
      index = end
      continue
    }

    if (character === "'" || character === '"') {
      const end = findQuotedEnd(code, index, character)
      ranges.push({ start: index, end, className: 'string' })
      index = end
      continue
    }

    if (character === '`') {
      index = collectTemplateRanges(code, index, ranges, jsx)
      continue
    }

    if (
      character === '/' &&
      !(jsx && code[index - 1] === '<') &&
      isRegexStart(code, index)
    ) {
      const end = findRegexEnd(code, index)
      if (end > index + 1) {
        ranges.push({ start: index, end, className: 'literal' })
        index = end
        continue
      }
    }

    index++
  }

  return ranges
}

function collectTemplateRanges(
  code: string,
  start: number,
  ranges: Array<TokenRange>,
  jsx: boolean,
) {
  let segmentStart = start
  let index = start + 1

  while (index < code.length) {
    if (code[index] === '\\') {
      index += 2
      continue
    }

    if (code[index] === '`') {
      ranges.push({ start: segmentStart, end: index + 1, className: 'string' })
      return index + 1
    }

    if (code[index] === '$' && code[index + 1] === '{') {
      if (segmentStart < index) {
        ranges.push({ start: segmentStart, end: index, className: 'string' })
      }
      ranges.push({ start: index, end: index + 2, className: 'operator' })

      const end = findInterpolationEnd(code, index + 2)
      const expressionEnd = end < 0 ? code.length : end
      const expression = code.slice(index + 2, expressionEnd)
      ranges.push(...offsetRanges(collectScriptRanges(expression, jsx), index + 2))

      if (end < 0) return code.length
      ranges.push({ start: end, end: end + 1, className: 'operator' })
      index = end + 1
      segmentStart = index
      continue
    }

    index++
  }

  if (segmentStart < code.length) {
    ranges.push({ start: segmentStart, end: code.length, className: 'string' })
  }
  return code.length
}

function findInterpolationEnd(code: string, start: number) {
  let depth = 1
  let index = start

  while (index < code.length) {
    const character = code[index]
    const next = code[index + 1]

    if (character === "'" || character === '"') {
      index = findQuotedEnd(code, index, character)
      continue
    }
    if (character === '`') {
      index = skipTemplate(code, index)
      continue
    }
    if (character === '/' && next === '/') {
      index = findLineEnd(code, index + 2)
      continue
    }
    if (character === '/' && next === '*') {
      const close = code.indexOf('*/', index + 2)
      index = close < 0 ? code.length : close + 2
      continue
    }
    if (character === '{') depth++
    if (character === '}' && --depth === 0) return index
    index++
  }

  return -1
}

function skipTemplate(code: string, start: number) {
  let index = start + 1
  while (index < code.length) {
    if (code[index] === '\\') index += 2
    else if (code[index] === '`') return index + 1
    else if (code[index] === '$' && code[index + 1] === '{') {
      const end = findInterpolationEnd(code, index + 2)
      index = end < 0 ? code.length : end + 1
    } else index++
  }
  return code.length
}

function collectJsxRanges(code: string) {
  const ranges: Array<TokenRange> = []
  let index = 0
  let jsxDepth = 0
  let expressionDepth = 0

  while (index < code.length) {
    if (jsxDepth && (code[index] === '"' || code[index] === "'" || code[index] === '`')) {
      index = code[index] === '`'
        ? skipTemplate(code, index)
        : findQuotedEnd(code, index, code[index])
      continue
    }

    if (jsxDepth && code[index] === '{') {
      expressionDepth++
      index++
      continue
    }
    if (jsxDepth && code[index] === '}') {
      expressionDepth = Math.max(0, expressionDepth - 1)
      index++
      continue
    }

    if (code[index] !== '<') {
      index++
      continue
    }

    if (code.startsWith('</>', index)) {
      jsxDepth = Math.max(0, jsxDepth - 1)
      index += 3
      continue
    }
    if (code.startsWith('<>', index) && (jsxDepth > 0 || isJsxStart(code, index))) {
      jsxDepth++
      index += 2
      continue
    }

    const closing = code[index + 1] === '/'
    const nameStart = index + (closing ? 2 : 1)
    const nameMatch = /^[A-Za-z][\w:.-]*/.exec(code.slice(nameStart))
    const inJsxText = jsxDepth > 0 && expressionDepth === 0
    if (!nameMatch || (!closing && !inJsxText && !isJsxStart(code, index))) {
      index++
      continue
    }

    const end = findTagEnd(code, nameStart + nameMatch[0].length)
    if (end < 0 || isTypeParameter(code, index, end, closing)) {
      index++
      continue
    }

    ranges.push({
      start: nameStart,
      end: nameStart + nameMatch[0].length,
      className: 'tag',
    })

    if (!closing) collectJsxAttributes(code, nameStart + nameMatch[0].length, end, ranges)
    const selfClosing = /\/\s*$/.test(code.slice(nameStart, end))
    if (closing) jsxDepth = Math.max(0, jsxDepth - 1)
    else if (!selfClosing) jsxDepth++
    index = end + 1
  }

  return ranges
}

function collectJsxAttributes(
  code: string,
  start: number,
  end: number,
  ranges: Array<TokenRange>,
) {
  const source = code.slice(start, end)
  const regex = /\s([:@A-Za-z_$][\w$:.-]*)(?=\s*(?:=|\/?>))/g
  let match: RegExpExecArray | null
  while ((match = regex.exec(source))) {
    const offset = match[0].indexOf(match[1])
    const attributeStart = start + match.index + offset
    ranges.push({
      start: attributeStart,
      end: attributeStart + match[1].length,
      className: 'attr',
    })
  }
}

function isJsxStart(code: string, index: number) {
  const before = code.slice(0, index).trimEnd()
  if (!before) return true
  if (/\b(?:return|case|yield)$/.test(before)) return true
  return /(?:[=([{,:;!&|?]|>)$/.test(before)
}

function isTypeParameter(
  code: string,
  start: number,
  end: number,
  closing: boolean,
) {
  if (closing) return false
  const inside = code.slice(start + 1, end)
  const after = code.slice(end + 1).trimStart()
  return (
    /\s+extends\s+/.test(inside) ||
    (after[0] === '(' && !inside.trimEnd().endsWith('/'))
  )
}

function isRegexStart(code: string, index: number) {
  const before = code.slice(0, index).trimEnd()
  if (!before) return true
  if (/\b(?:case|delete|in|instanceof|of|return|throw|typeof|void|yield)$/.test(before)) {
    return true
  }
  return /[=([{,:;!&|?~+*%^<>-]$/.test(before)
}

function findRegexEnd(code: string, start: number) {
  let inClass = false
  let index = start + 1
  while (index < code.length && code[index] !== '\n') {
    if (code[index] === '\\') index += 2
    else if (code[index] === '[') {
      inClass = true
      index++
    } else if (code[index] === ']') {
      inClass = false
      index++
    } else if (code[index] === '/' && !inClass) {
      index++
      while (/[a-z]/i.test(code[index] || '')) index++
      return index
    } else index++
  }
  return start + 1
}

function findTagEnd(code: string, start: number) {
  let braceDepth = 0
  let index = start
  while (index < code.length) {
    const character = code[index]
    if (character === "'" || character === '"') {
      index = findQuotedEnd(code, index, character)
      continue
    }
    if (character === '{') braceDepth++
    else if (character === '}') braceDepth = Math.max(0, braceDepth - 1)
    else if (character === '>' && braceDepth === 0) return index
    else if (character === '\n' && braceDepth === 0) return -1
    index++
  }
  return -1
}

function findQuotedEnd(code: string, start: number, quote: string) {
  let index = start + 1
  while (index < code.length) {
    if (code[index] === '\\') index += 2
    else if (code[index] === quote) return index + 1
    else if (code[index] === '\n' && quote !== '`') return index
    else index++
  }
  return code.length
}

function findLineEnd(code: string, start: number) {
  const end = code.indexOf('\n', start)
  return end < 0 ? code.length : end
}
