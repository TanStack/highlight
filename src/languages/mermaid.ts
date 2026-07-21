import { defineLanguage } from '../core.js'
import { patternTokenizer } from '../internal/patterns.js'

export const mermaid = defineLanguage({
  name: 'mermaid',
  tokenize: patternTokenizer([
    { className: 'comment', regex: /^\s*%%.*$/gm },
    {
      className: 'keyword',
      regex:
        /^\s*(?:classDiagram|erDiagram|flowchart|gantt|gitGraph|graph|journey|mindmap|pie|quadrantChart|requirementDiagram|sequenceDiagram|stateDiagram-v2|timeline)\b/gm,
    },
    { className: 'operator', regex: /-->>?|---|==>|-.->|<--?>|:::|\|/g },
    { className: 'string', regex: /"(?:\\.|[^"\\])*"/g },
  ]),
})
