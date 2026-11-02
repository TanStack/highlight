import { expect, it } from 'vitest'
import { createHighlighter } from '../src/core'
import { swift } from '../src/languages/swift'
import { tokenClasses } from './token-classes'
const highlighter = createHighlighter({ languages: [swift] })
it('recognizes short macro declarations with spaced signatures', () => {
  for (const name of ['m ()', 'm <T>()']) {
    expect(tokenClasses(highlighter, `public macro ${name} = #externalMacro(module: "M", type: "T")`, 'macro', 'swift')).toEqual(['keyword'])
  }
})
