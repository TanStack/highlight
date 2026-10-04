import { defineLanguage, type TokenRange } from '../core.js'
import { patternTokenizer } from '../internal/patterns.js'

export const powershell = defineLanguage({
  name: 'powershell',
  aliases: ['pwsh', 'ps1'],
  tokenize: patternTokenizer([
    { collect: collectPowerShellLexicalRanges },
    { className: 'literal', regex: /\$(?:true|false|null)\b/gi },
    { className: 'variable', regex: /\$\{(?:`[\s\S]|[^}`])*\}|[$@](?:[\p{L}\p{N}_?]+:)?[\p{L}\p{N}_?]+|\$[$^]/gu },
    { className: 'type', regex: /\[(?:[A-Za-z_]\w*\.)*[A-Za-z_]\w*(?:\[\])?\]/g },
    { className: 'keyword', regex: /(?<![\w-])(?:begin|break|catch|class|clean|continue|data|do|dynamicparam|else|elseif|end|enum|exit|filter|finally|for|foreach|function|if|in|param|process|return|switch|throw|trap|try|until|using|while|workflow|parallel|sequence|inlinescript)(?![\w-])/gi },
    { className: 'function', regex: /\b(?:function|filter|class|enum)\s+([A-Za-z_][\w-]*)/gi, group: 1 },
    { className: 'command', regex: /(?<![\w-])[A-Za-z]+-[A-Za-z][\w-]*\b/g },
    { className: 'operator', regex: /-(?:(?:[ci])?(?:eq|ne|gt|ge|lt|le|like|notlike|match|notmatch|contains|notcontains|in|notin|replace|split)|and|or|xor|not|band|bor|bxor|bnot|shl|shr|join|isnot|is|as|f)\b/gi },
    { className: 'property', regex: /(?<![\w-])-[A-Za-z][\w-]*\b/g },
    { className: 'number', regex: /(?:(?<![\w.])|(?<=\.\.))(?:0[xX][\da-fA-F]+|0[bB][01]+|(?:\d+(?:\.(?!\.)\d*)?|\.\d+)(?:e[+-]?\d+)?)(?:u?[ylsn]|ul|us|uy|d)?(?:kb|mb|gb|tb|pb)?(?!\w)(?!\.(?!\.))/gi },
    { className: 'function', regex: /\b[A-Za-z_]\w*(?=\s*\()/g },
    { className: 'property', regex: /\.([A-Za-z_]\w*)/g, group: 1 },
    { className: 'operator', regex: /\?\?=?|\?\.|::|\.\.|\+\+|--|&&|\|\||[+\-*/%=!<>|&]=?/g },
  ]),
})

function collectPowerShellLexicalRanges(code: string) {
  const ranges: Array<TokenRange> = []
  for (let index = 0; index < code.length;) {
    const start = index
    let end = index
    let className: TokenRange['className'] = 'string'
    if (code[index] === '`') { index += 2; continue }
    if (code.startsWith('${', index)) {
      end = index + 2
      while (end < code.length && code[end] !== '}') {
        end += code[end] === '`' ? 2 : 1
      }
      end = Math.min(end + 1, code.length)
      className = 'variable'
    } else if (code.startsWith('<#', index)) {
      const close = code.indexOf('#>', index + 2)
      end = close < 0 ? code.length : close + 2
      className = 'comment'
    } else if (code[index] === '#' && (index === 0 || /[\s(){}\[\];'"|&]/.test(code[index - 1]))) {
      end = index + 1
      while (end < code.length && !/[\r\n]/.test(code[end])) end++
      className = 'comment'
    } else if (code[index] === '@' && /['"]/.test(code[index + 1] || '') && /^[ \t]*(?:\r\n|\r|\n)/.test(code.slice(index + 2))) {
      const quote = code[index + 1]
      const close = new RegExp(`^${quote}@`, 'gm')
      close.lastIndex = index + 2
      const match = close.exec(code)
      end = match ? match.index + 2 : code.length
    } else if (code[index] === '"' || code[index] === "'") {
      end = quotedEnd(code, index)
    }
    if (end > start) {
      ranges.push({ start, end, className })
      index = end
    } else index++
  }
  return ranges
}

// Keep nested quoted strings in expandable-string subexpressions protected.
function quotedEnd(code: string, start: number, depth = 0): number {
  const quote = code[start]
  let index = start + 1
  while (index < code.length) {
    if (quote === '"' && code[index] === '`') index += 2
    else if (code[index] === quote) {
      index++
      if (code[index] === quote) index++
      else return index
    } else if (quote === '"' && code.startsWith('$(', index) && depth < 24) {
      let balance = 1
      index += 2
      while (index < code.length && balance) {
        if (code.startsWith('<#', index)) {
          const close = code.indexOf('#>', index + 2)
          index = close < 0 ? code.length : close + 2
        } else if (code[index] === '#' && /[\s(){}\[\];'"|&]/.test(code[index - 1])) {
          while (index < code.length && !/[\r\n]/.test(code[index])) index++
        } else if (code[index] === '`') index += 2
        else if (code[index] === '"' || code[index] === "'") index = quotedEnd(code, index, depth + 1)
        else {
          if (code[index] === '(') balance++
          if (code[index] === ')') balance--
          index++
        }
      }
    } else index++
  }
  return Math.min(index, code.length)
}
