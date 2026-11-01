import { defineLanguage } from '../core.js'
import { patternTokenizer } from '../internal/patterns.js'

export const mermaid = defineLanguage({
  name: 'mermaid',
  tokenize: patternTokenizer([
    [/^\s*%%.*$/gm, 'comment'],
    [/^\s*(?:classDiagram|erDiagram|flowchart|gantt|gitGraph|graph|journey|mindmap|pie|quadrantChart|requirementDiagram|sequenceDiagram|stateDiagram-v2|timeline)\b/gm, 'keyword'],
    [/-->>?|---|==>|-.->|<--?>|:::|\|/g, 'operator'],
    [/"(?:\\.|[^"\\])*"/g, 'string'],
  ]),
})
