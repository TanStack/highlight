import { defineLanguage } from '../core.js'
import { collectPatternRanges } from '../internal/patterns.js'
import type { Pattern } from '../internal/patterns.js'

const lexical: Array<Pattern> = [
  [/\/\/[^\n]*|\/\*[\s\S]*?(?:\*\/|$)|"""(?:\\[\s\S]|[^\\])*?(?:"""|\\?$)|"(?:\\.|[^"\\\n])*\\?"?|'(?:\\.[^'\n]{0,5}|[^'\\\n])'/g, (match) => match[0].startsWith('/') ? 'comment' : 'string'],
]

const patterns: Array<Pattern> = [
  [/@[A-Za-z_]\w*(?:\.[A-Za-z_]\w*)*/g, (match) => match[0] === '@interface' ? 'keyword' : 'attr'],
  [/\b(?:abstract|assert|break|case|catch|class|const|continue|default|do|else|enum|extends|final|finally|for|goto|if|implements|import|instanceof|interface|native|new|non-sealed|package|permits|private|protected|public|return|sealed|static|strictfp|super|switch|synchronized|this|throws?|transient|try|volatile|while)\b|\b(?:record|var|when|yield)\b(?=[ \t]+[\w"'(!-])|^[ \t]*(?:(?:open[ \t]+)?module|requires(?:[ \t]+transitive)?|exports|opens|uses|provides)\b(?=[ \t]+[A-Za-z_])/gm, 'keyword'],
  [/\b(?:true|false|null)\b/g, 'literal'],
  [/\b(?:boolean|byte|char|double|float|int|long|short|void)\b/g, 'type'],
  [/(?<!\.)\b(?:class|interface|enum|record)\s+([A-Za-z_]\w*)/g, 'type', 1],
  [/\b[A-Z][A-Z\d_]*[a-z]\w*/g, 'type'],
  [/(?:^|[^\w.])((?:0[xX][\da-fA-F_]*(?:\.[\da-fA-F_]*)?(?:[pP][+-]?\d[\d_]*)?|0[bB][01_]+|(?:\d[\d_]*(?:\.[\d_]*)?|\.\d[\d_]*)(?:[eE][+-]?\d[\d_]*)?)[lLfFdD]?)(?![\w.])/g, 'number', 1],
  [/\b[A-Za-z_]\w*(?=\s*\()/g, 'function'],
  [/::\s*([A-Za-z_]\w*)/g, 'function', 1],
  [/(?<!\.)\.\s*([A-Za-z_]\w*)/g, 'property', 1],
  [/>>>=?|->|::|<<=?|>>=?|\+\+|--|&&|\|\||[+\-*/%&|^!<>=]=?|[~?:]/g, 'operator'],
]

export const java = defineLanguage({
  name: 'java',
  tokenize(code) {
    const occupied = new Uint8Array(code.length)
    const ranges = collectPatternRanges(code, lexical, [], occupied)
    // Leave package/import paths plain instead of colouring each segment as a property.
    for (const match of code.matchAll(/^([ \t]*(?:package|import)[ \t]+(?:static[ \t]+)?)[\w.*]+/gm)) {
      const start = match.index + match[1].length
      if (!occupied[match.index]) occupied.fill(1, start, match.index + match[0].length)
    }
    return collectPatternRanges(code, patterns, ranges, occupied)
  },
})
