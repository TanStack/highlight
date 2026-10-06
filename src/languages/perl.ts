import { defineLanguage, type HighlightTokenClass, type TokenRange } from '../core.js'
import { collectPatternRanges } from '../internal/patterns.js'

const patterns = [
  { className: 'property', regex: /\b[A-Za-z_]\w*(?=\s*=>)|(?<=[$+\w\]}]\{|->\{)-?[A-Za-z_]\w*(?=\})/g },
  { className: 'function', regex: /(?<=->|\bsub\s+)[A-Za-z_][\w:]*/g },
  { className: 'type', regex: /(?<=\b(?:package|use|no|require)\s+)(?!v\d)[A-Za-z_]\w*(?:::\w+)*|\b[A-Z]\w*(?:::\w+)*(?=\s*->)/g },
  { className: 'keyword', regex: /\b(?:my|our|local|state|sub|package|use|no|require|if|elsif|else|unless|while|until|for(?:each)?|do|last|next|redo|return|and|or|not|xor|cmp|eq|ne|lt|gt|le|ge|x|eval|try|catch|finally|BEGIN|END)\b/g },
  { className: 'literal', regex: /\b(?:undef|__PACKAGE__|__FILE__|__LINE__|__SUB__)\b/g },
  { className: 'function', regex: /\b(?:print|say|die|bless)\b|\b[A-Za-z_]\w*(?=\s*\()/g },
  { className: 'number', regex: /(?<![\w$]|(?<!\.)\.)(?:0[xXbBoO][\da-fA-F_]+|v\d+(?:\.\d+)+|(?:\d[\d_]*(?:\.\d[\d_]*)?|(?<!\.)\.\d[\d_]*)(?:[eE][+-]?\d+)?)(?!\w|\.\d)/g },
  { className: 'operator', regex: /<=>|->|=>|::|\.\.\.|[=!]~|([-+*/%.&|^<>])\1?=?|[!=]=?|[~?:\\]/g },
] satisfies Parameters<typeof collectPatternRanges>[1]

export const perl = defineLanguage({
  name: 'perl',
  aliases: ['pl'],
  tokenize: (code) => collectPatternRanges(code, patterns, scanPerl(code)),
})

const variable = /\$\$(?![\w{$:])|[$@%&]\$*#?(?:\{\^?\w+\}|\^\w|(?:::)?\w+(?:::\w+)*|[*+-]|(?=[{$]))|\$[!@&`'"+/\\,;.<>|?~^-]?/y
const word = /[A-Za-z_]\w*(?:::\w+)*/y
const space = /\s*/y
const flags = /[a-z]*/y
const heredoc = /<<(~?)(["']?)([A-Za-z_]\w*)\2/y
const brackets = /[{(<[]/

function scanPerl(code: string) {
  const ranges: Array<TokenRange> = []
  const pending: Array<RegExp> = []
  // `value`: the previous token ends an operand, so `/` divides and `%`/`&` are operators.
  // `last`: text of the previous word or operator (`->`, `sub`, a list operator before `%h`).
  let value = false
  let last = ''
  // Keeps unclosed single-line scans linear: once one fails, every later start with the same
  // delimiter fails before that newline (`>>> 0` turns "no newline" into end of input).
  const failed: Record<string, number> = {}
  const line = (start: number) => {
    if (start < failed[code[start]]) return -1
    const end = quoted(code, start, true)
    if (end < 0) failed[code[start]] = code.indexOf('\n', start) >>> 0
    return end
  }
  let i = 0
  while (i < code.length) {
    const char = code[i]
    const start = i
    const lineStart = (code[i - 1] || '\n') === '\n'
    let className: HighlightTokenClass | undefined = 'string'
    let match: RegExpExecArray | null
    variable.lastIndex = word.lastIndex = heredoc.lastIndex = i
    if (char === '\n' && pending.length) {
      for (const terminator of pending.splice(0)) {
        terminator.lastIndex = i + 1
        ranges.push({ start: i + 1, end: (i = terminator.exec(code) ? terminator.lastIndex : code.length), className })
      }
      continue
    }
    if (/\s/.test(char)) {
      i++
      continue
    }
    if (char === '=' && lineStart && /[A-Za-z]/.test(code[i + 1])) {
      i = skip(/[^]*?^=cut\b.*|[^]*/my, code, i)
      className = 'comment'
    } else if (char === '#') {
      i = code.indexOf('\n', i)
      if (i < 0) i = code.length
      className = start || code[1] !== '!' ? 'comment' : 'meta'
    } else if (/["'`]/.test(char)) {
      i = quoted(code, i)
    } else if (
      /[$@%&]/.test(char) && variable.test(code) &&
      // After an operand `%`/`&` are operators, unless it is a list-operator word or block (`keys %h`, `map {...} %h`).
      (!value || /[\w}]/.test(last) || /[$@]/.test(char))
    ) {
      i = variable.lastIndex
      className = 'variable'
    } else if ((match = word.exec(code))) {
      const name = match[0]
      const after = skip(space, code, (i = word.lastIndex))
      const open = code[after] || ''
      className = undefined
      if (lineStart && /^__(?:END|DATA)__$/.test(name)) {
        i = code.length
        className = 'comment'
      } else if (
        // Not a method/sub name; unspaced, the next char must not end a bareword key or label (`y => 1`, `$h{s}`);
        // spaced, only a bracket or `/` opens.
        /^(?:q[qwrx]?|m|s|tr|y)$/.test(name) && last !== '->' && last !== 'sub' &&
        (after > i ? /[{(<[/]/.test(open) : !/[\w\s=,;)}\]>:.-]/.test(open))
      ) {
        let end = !brackets.test(open) && name[0] !== 'q' ? line(after) : quoted(code, after)
        if (end > 0 && end < code.length && /^(?:s|tr|y)$/.test(name)) {
          // Non-bracket: the middle delimiter closes the pattern and opens the replacement.
          const next = skip(space, code, end)
          end = !brackets.test(open) ? line(end - 1) : brackets.test(code[next]) ? quoted(code, next) : -1
        }
        if (end > 0) {
          i = skip(flags, code, end)
          className = 'string'
        }
      }
      last = name
      value = !/^(?:split|if|unless|elsif|while|until|and|or|not|return|grep|map|x|eq|ne|lt|gt|le|ge|cmp)$/.test(name)
    } else if (/\d/.test(char)) {
      i = skip(/\d\w*(?:\.\d\w*)*/y, code, i)
      className = undefined
      last = ''
      value = true
    } else if ((match = heredoc.exec(code))) {
      i = heredoc.lastIndex
      pending.push(new RegExp(`^${match[1] && '[ \\t]*'}${match[3]}$`, 'gm'))
    } else if (char !== '/' || value || (i = line(i)) < 0) {
      // Consume `->`, `&&`, `//` whole so their second char is not read as a sigil or regex opener.
      i = start + (/->|&&|\/\//.test(code.slice(start, start + 2)) ? 2 : 1)
      className = undefined
      value = /[)\]}]/.test(char)
      last = code.slice(start, i)
      continue
    } else i = skip(flags, code, i)
    if (className) {
      ranges.push({ start, end: i, className })
      if (className === 'comment') continue
      last = ''
      value = true
    }
  }
  return ranges
}

function skip(regex: RegExp, code: string, index: number) {
  regex.lastIndex = index
  regex.exec(code)
  return regex.lastIndex
}

// Returns the index after the closing delimiter, or -1 when `single` and the line ends first.
function quoted(code: string, start: number, single = false) {
  const open = code[start]
  const close = ')]}>'['([{<'.indexOf(open)] || open
  let depth = 0
  for (let index = start + 1; index < code.length; index++) {
    const char = code[index]
    if (single && char === '\n') return -1
    if (char === '\\') index++
    else if (char === close && !depth--) return index + 1
    else if (char === open && open !== close) depth++
  }
  return single ? -1 : code.length
}
