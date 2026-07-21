import fs from 'node:fs'

const publicEntries = [
  '@tanstack/highlight',
  '@tanstack/highlight/core',
  '@tanstack/highlight/languages',
  '@tanstack/highlight/theme',
  '@tanstack/highlight/markdown',
  '@tanstack/highlight/rehype',
  '@tanstack/highlight/remark',
  '@tanstack/highlight/react',
  ...fs
    .readdirSync('dist/languages')
    .filter((file) => file.endsWith('.js') && file !== 'index.js')
    .map(
      (file) =>
        `@tanstack/highlight/languages/${file.slice(0, -'.js'.length)}`,
    ),
  ...fs
    .readdirSync('dist/themes')
    .filter((file) => file.endsWith('.js'))
    .map(
      (file) =>
        `@tanstack/highlight/themes/${file.slice(0, -'.js'.length)}`,
    ),
]

const modules = await Promise.all(publicEntries.map((entry) => import(entry)))
const core = modules[0]
const modularCore = modules[1]
const languages = modules[2]
const theme = modules[3]

if (typeof core.highlight !== 'function') {
  throw new Error('The root entry does not export highlight()')
}

if (typeof modularCore.createHighlighter !== 'function') {
  throw new Error('The core entry does not export createHighlighter()')
}

if (!languages.tsx || !languages.shell) {
  throw new Error('The languages entry does not export language definitions')
}

if ('createThemeCss' in core) {
  throw new Error('The root entry must not load or export theme helpers')
}

if (typeof theme.createThemeCss !== 'function') {
  throw new Error('The theme entry does not export createThemeCss()')
}

console.log(`Imported ${publicEntries.length} public ESM entries`)
