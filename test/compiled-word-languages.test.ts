import { readFileSync, readdirSync } from 'node:fs'
import ts from 'typescript'
import { expect, test } from 'vitest'
import { canCombineWords } from '../src/internal/word-language.js'
import type { SimpleLanguageOptions } from '../src/internal/simple-language.js'

test('compiled word definitions satisfy the category non-overlap proof', () => {
  let checked = 0
  for (const file of readdirSync(new URL('../src/languages/', import.meta.url))) {
    if (!file.endsWith('.ts')) continue
    const source = ts.createSourceFile(file, readFileSync(new URL(`../src/languages/${file}`, import.meta.url), 'utf8'), ts.ScriptTarget.Latest, true)
    const constructors = new Set<string>()
    const nativeConstructors = new Set<string>()
    for (const statement of source.statements) {
      if (!ts.isImportDeclaration(statement) || !ts.isStringLiteral(statement.moduleSpecifier) || !statement.moduleSpecifier.text.endsWith('/word-language.js')) continue
      const bindings = statement.importClause?.namedBindings
      if (bindings && ts.isNamedImports(bindings)) for (const entry of bindings.elements) {
        const name = (entry.propertyName || entry.name).text
        if (name === 'compiledWordLanguage' || name === 'nativeCompiledWordLanguage') constructors.add(entry.name.text)
        if (name === 'nativeCompiledWordLanguage') nativeConstructors.add(entry.name.text)
      }
    }
    let calls = 0
    function visit(node: ts.Node) {
      if (ts.isCallExpression(node) && ts.isIdentifier(node.expression) && constructors.has(node.expression.text)) {
        calls++
        const argument = node.arguments[0]
        if (!argument || !ts.isObjectLiteralExpression(argument)) throw new Error(`${file}: expected literal options`)
        const options: SimpleLanguageOptions = { name: file, comments: /\b\B/, strings: /\b\B/ }
        for (const property of argument.properties) {
          if (ts.isSpreadAssignment(property)) throw new Error(`${file}: spread options need a new proof`)
          if (!property.name || !ts.isIdentifier(property.name)) throw new Error(`${file}: unsupported option name`)
          const key = property.name.text
          if (!ts.isPropertyAssignment(property)) throw new Error(`${file}: dynamic ${key}`)
          if (key === 'nestedComments') {
            const pairs = property.initializer
            if (!ts.isArrayLiteralExpression(pairs)) throw new Error(`${file}: nested comments need owned literal pairs`)
            for (const pair of pairs.elements) {
              if (!ts.isArrayLiteralExpression(pair) || pair.elements.length !== 2 || !pair.elements.every(part => ts.isStringLiteral(part) && part.text.length > 0)) throw new Error(`${file}: dynamic nested pair`)
            }
          }
          if (!['name', 'keywords', 'literals', 'types', 'wordCharacters', 'insensitive'].includes(key)) continue
          const value = property.initializer
          if (key === 'insensitive') {
            if (value.kind !== ts.SyntaxKind.TrueKeyword && value.kind !== ts.SyntaxKind.FalseKeyword) throw new Error(`${file}: dynamic insensitive`)
            options.insensitive = value.kind === ts.SyntaxKind.TrueKeyword
          } else {
            if (!ts.isStringLiteral(value) && !ts.isNoSubstitutionTemplateLiteral(value)) throw new Error(`${file}: dynamic ${key}`)
            Object.assign(options, { [key]: value.text })
          }
        }
        expect(canCombineWords(options), file).toBe(true)
        expect(Boolean(options.insensitive), file).toBe(nativeConstructors.has(node.expression.text))
        checked++
      }
      ts.forEachChild(node, visit)
    }
    visit(source)
    if (constructors.size) expect(calls, file).toBeGreaterThan(0)
  }
  expect(checked).toBe(23)
})
