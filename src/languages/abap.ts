import { defineLanguage, type TokenRange } from '../core.js'
import { collectPatternRanges } from '../internal/patterns.js'

// Identifiers may contain `/` (namespaces) and follow `-`, `~`, `->`, or `=>` (component selectors), so words
// in those positions are never keywords. Expression parentheses need inner spaces, so a word touching one is a name.
const word = (source: string) => new RegExp(`(?<![\\w/!%$~>(-])(?:${source})(?![\\w/)-])`, 'gi')

const patterns = [
  { className: 'meta', regex: /##\w+(?:\[[^\]\n]*\])*/g },
  { className: 'variable', regex: /<[A-Za-z_][\w/]*>/g },
  // Method and form names may reuse keywords such as `create`; only inline declarations put a keyword before `(`.
  { className: 'function', regex: /(?<![\w/-]|\b(?:new|cast)\s+)(?!(?:data|final|field-symbol|value|reference)\()[A-Za-z_/][\w/~]*(?=\()/gi },
  { className: 'function', regex: /(?<![\w/-])(?:class-methods|methods|method|form|perform)\s+([A-Za-z_/][\w/~]*)/gi, group: 1 },
  {
    className: 'keyword',
    regex: word('abstract|alias|aliases|and|append|appending|as|ascending|assign|assigned|assigning|at|authority-check|base|begin|between|binary|bound|by|call|case|cast|catch|changing|check|class|class-data|class-events|class-methods|class-pool|cleanup|clear|cn|co|commit|component|concatenate|condense|constants|continue|cond|conv|corresponding|cp|create|cs|data|decimals|default|definition|delete|descending|describe|do|else|elseif|empty|end|end-of-selection|endat|endcase|endclass|enddo|endform|endfunction|endif|endinterface|endloop|endmethod|endselect|endtry|endwhile|eq|events|exact|exception|exceptions|exit|exporting|fields|field-symbol|field-symbols|filter|final|find|for|form|free|friends|from|function|ge|group|gt|handler|hashed|having|if|implementation|importing|in|include|index|inheriting|initial|initialization|inner|insert|instance|interface|interfaces|into|is|join|key|le|left|length|let|like|line|lines|load-of-program|local|loop|lt|me|message|method|methods|modify|move|move-corresponding|na|ne|new|next|non-unique|not|np|ns|object|of|optional|or|order|others|outer|parameters|perform|private|program|protected|public|raise|raising|range|read|read-only|receiving|redefinition|reduce|ref|reference|refresh|replace|report|return|returning|rollback|rows|section|select|select-options|selection-screen|set|shift|single|sort|sorted|split|standard|start-of-selection|statics|super|switch|table|tables|testing|then|times|to|transporting|try|type|type-pools|types|unique|unassign|up|update|using|value|when|where|while|with|work|write'),
  },
  { className: 'literal', regex: word('abap_true|abap_false|abap_undefined|space|null') },
  {
    className: 'type',
    regex: /(?<![\w/-])(?:type|like)(?:\s+(?:ref\s+to|(?:standard\s+|sorted\s+|hashed\s+|any\s+)?table\s+of|range\s+of|line\s+of))?\s+([A-Za-z_/][\w/]*)/gi,
    group: 1,
  },
  { className: 'type', regex: /(?<![\w/-])(?:class|interfaces?|inheriting\s+from|new|cast|catch)\s+([A-Za-z_/][\w/]*)/gi, group: 1 },
  { className: 'type', regex: /(?<![\w/~>-])[A-Za-z_/][\w/]*(?==>)/g },
  { className: 'number', regex: /(?<![\w/])\d+(?!\w)/g },
  { className: 'property', regex: /(?:->|=>|~|(?<=[\w>\])])-)([A-Za-z_][\w/]*)/g, group: 1 },
  // ABAP requires whitespace around arithmetic and comparison operators, which keeps `-` and `/` in names plain.
  { className: 'operator', regex: /->\*?|=>|(?<=\s)(?:\?=|\*\*|&&?|<>|<=|>=|[-+*/]=|[-+*/=<>])(?=\s)/g },
] satisfies Parameters<typeof collectPatternRanges>[1]

export const abap = defineLanguage({
  name: 'abap',
  tokenize(code) {
    return collectPatternRanges(code, patterns, scanLiterals(code))
  },
})

// `*` in the first column starts a line comment; `"` starts one anywhere outside a literal.
const codeStop = /^\*|["'`|\n}]/gm
const templateStop = /\\[^\n]|[|{\n]/g

// String templates keep their literal text as strings and leave `{ expression }` holes to the other patterns.
// `depth` counts the open holes; templates cannot span lines, so a line break closes all of them.
function scanLiterals(code: string) {
  const ranges: Array<TokenRange> = []
  let depth = 0
  let index = 0
  let template = -1
  while (index < code.length) {
    const stop = template < 0 ? codeStop : templateStop
    stop.lastIndex = index
    const match = stop.exec(code)
    const start = match ? match.index : code.length
    const char = match ? match[0] : '\n'
    index = start + char.length
    if (template >= 0) {
      if (char.length > 1) continue
      ranges.push({ start: template, end: char === '\n' ? start : index, className: 'string' })
      template = -1
      if (char === '{') depth++
      else if (char === '\n') depth = 0
    } else if (char === '\n') depth = 0
    else if (char === '}') {
      if (depth) {
        depth--
        template = start
      }
    } else if (char === '|') template = start
    else {
      const comment = char === '*' || char === '"'
      index = comment ? lineEnd(code, start) : quoteEnd(code, start, char)
      ranges.push({ start, end: index, className: comment ? 'comment' : 'string' })
    }
  }
  return ranges
}

// A doubled delimiter escapes it, and a line break ends an unterminated literal.
function quoteEnd(code: string, start: number, quote: string) {
  let index = start + 1
  while (index < code.length && code[index] !== '\n') {
    if (code[index] === quote) {
      if (code[index + 1] !== quote) return index + 1
      index++
    }
    index++
  }
  return index
}

function lineEnd(code: string, start: number) {
  const end = code.indexOf('\n', start)
  return end < 0 ? code.length : end
}
