import fs from 'node:fs'
import { build } from 'esbuild'

const publicEntries = [
  '@tanstack/highlight',
  '@tanstack/highlight/core',
  '@tanstack/highlight/languages',
  '@tanstack/highlight/theme',
  '@tanstack/highlight/octane',
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
const octane = modules[4]
const markdown = modules[5]
const rehype = modules[6]
const remark = modules[7]
const react = modules[8]

if (typeof core.highlight !== 'function') {
  throw new Error('The root entry does not export highlight()')
}

if (typeof modularCore.createHighlighter !== 'function') {
  throw new Error('The core entry does not export createHighlighter()')
}

if (!languages.tsrx || !languages.tsx || !languages.shell) {
  throw new Error('The languages entry does not export language definitions')
}

if ('createThemeCss' in core) {
  throw new Error('The root entry must not load or export theme helpers')
}

if (typeof theme.createThemeCss !== 'function') {
  throw new Error('The theme entry does not export createThemeCss()')
}

if (
  typeof octane.createHighlightedCodeBlockProps !== 'function' ||
  typeof octane.createOctaneMdxHighlight !== 'function'
) {
  throw new Error('The Octane entry does not export both adapter helpers')
}

if (typeof markdown.createTanStackMarkdownHighlighter !== 'function') {
  throw new Error(
    'The Markdown entry does not export createTanStackMarkdownHighlighter()',
  )
}

for (const [name, implementation] of [
  ['rehypeHighlightCodeBlocks', rehype.rehypeHighlightCodeBlocks],
  ['remarkHighlightCodeBlocks', remark.remarkHighlightCodeBlocks],
  ['createHighlightedCodeBlockProps', react.createHighlightedCodeBlockProps],
]) {
  if (typeof implementation !== 'function') {
    throw new Error(`The adapter entry does not export ${name}()`)
  }
}

const isolatedBundles = [
  {
    name: 'root helper',
    source: `export { escapeHtml } from '@tanstack/highlight'`,
  },
  ...['@tanstack/highlight', '@tanstack/highlight/core'].map((entry) => ({
    name: `${entry} core`,
    source: `import { createHighlighter } from '${entry}'; globalThis.highlighter = createHighlighter({ languages: [] })`,
  })),
  ...['@tanstack/highlight/languages/tsx', '@tanstack/highlight/languages'].map((entry) => ({
    name: `${entry} TSX`,
    source: `import { createHighlighter } from '@tanstack/highlight/core'; import { tsx } from '${entry}'; globalThis.highlighter = createHighlighter({ languages: [tsx] })`,
    languages: ['tsx'],
  })),
  ...['react', 'markdown', 'remark', 'rehype', 'octane'].map((entry) => ({
    name: `${entry} adapter`,
    source: `export * from '@tanstack/highlight/${entry}'`,
  })),
]

for (const profile of isolatedBundles) {
  const result = await build({
    stdin: { contents: profile.source, resolveDir: process.cwd() },
    bundle: true,
    minify: true,
    format: 'esm',
    platform: 'browser',
    target: 'es2022',
    write: false,
    metafile: true,
    logLevel: 'silent',
  })
  for (const output of Object.values(result.metafile.outputs)) {
    for (const [input, { bytesInOutput }] of Object.entries(output.inputs)) {
      if (!bytesInOutput) continue
      const language = /^dist\/languages\/([^/]+)\.js$/.exec(input)?.[1]
      if (language && !(profile.languages || []).includes(language)) {
        throw new Error(`${profile.name} retains an unexpected language: ${language}`)
      }
      if (input === 'dist/theme.js' || input.startsWith('dist/themes/')) {
        throw new Error(`${profile.name} retains unexpected theme code: ${input}`)
      }
    }
  }
}

console.log(`Imported ${publicEntries.length} public ESM entries`)
console.log(`Verified tree shaking for ${isolatedBundles.length} public import bundles`)
