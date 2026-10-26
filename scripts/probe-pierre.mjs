import fs from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import { tokenize, highlight, defaultHighlighter } from '../dist/index.js'
import { build } from 'esbuild'
import { gzipSync, brotliCompressSync } from 'node:zlib'

const root = process.argv[2]
if (!root) throw new Error('Pass the installed @pierre/highlights package directory')
const pierre = await import(pathToFileURL(path.resolve(root, 'dist/default.js')))
const syntax = Object.fromEntries(pierre.tokenNames.map((name, i) => [name, `#${(0x100000 + i).toString(16)}`]))
const colorNames = Object.fromEntries(Object.entries(syntax).map(([k, v]) => [v, k]))
const theme = { name: 'Distinct token kinds', appearance: 'dark', style: { 'editor.background': '#000000', 'editor.foreground': '#ffffff', syntax } }
// These are diagnostic examples, not a representative accuracy score.
// Each assertion concerns a specific lexeme, independent of the chosen palette.
const probes = [
  { name: 'object property named like a keyword', lang: 'ts', code: 'const obj = { return: 1 }; obj.return;', text: 'return', occurrence: 1, expected: ['property'] },
  { name: 'object property named like a literal', lang: 'ts', code: 'const obj = { true: 1 }; obj.true;', text: 'true', occurrence: 1, expected: ['property'] },
  { name: 'regex after return', lang: 'js', code: 'function f() { return /a+b/g; }', text: 'a+b', expected: ['literal', 'string.regex'] },
  { name: 'division', lang: 'js', code: 'const value = left / right / scale;', text: 'right', expected: ['none', 'variable'] },
  { name: 'template expression boolean after regex brace', lang: 'js', code: 'const message = `match ${/}/.test(value) ? true : false} done`', text: 'true', expected: ['literal', 'boolean'] },
  { name: 'nested Rust block comment', lang: 'rust', code: '/* outer /* inner */ still comment */ let x = 1;', text: 'still comment', expected: ['comment'] },
  { name: 'Rust raw string', lang: 'rust', code: 'let text = r##"quote " // text"##;', text: '// text', expected: ['string'] },
  { name: 'Python f-string expression', lang: 'python', code: 'message = f"Hello {user.name.upper()}"', text: 'upper', expected: ['function', 'function.method'] },
  { name: 'C++ raw string', lang: 'cpp', code: 'auto text = R"tag(// not a comment)tag";', text: '// not a comment', expected: ['string'] },
  { name: 'shell quoted heredoc', lang: 'bash', code: "cat <<'EOF'\n# literal text\nEOF\necho done", text: '# literal text', expected: ['string'] },
  { name: 'embedded HTML script', lang: 'html', code: '<script>const value = true;</script>', text: 'true', expected: ['literal', 'boolean'] },
  { name: 'HTML script closing boundary', lang: 'html', code: '<script>// comment</script><p>after</p>', text: 'p', occurrence: 2, expected: ['tag'] },
  { name: 'TypeScript generic type parameter', lang: 'ts', code: 'function identity<T>(value: T): T { return value }', text: 'T', expected: ['type'] },
  { name: 'JSX component name', lang: 'tsx', code: 'const view = <MyComponent enabled={true} />;', text: 'MyComponent', expected: ['tag', 'tag.component.jsx', 'tag.jsx', 'type'] },
]
const results = probes.map((p) => {
  let start = -1
  for (let i = 0; i <= (p.occurrence || 0); i++) start = p.code.indexOf(p.text, start + 1)
  if (start < 0) throw new Error(`Missing probe text: ${p.name}`)
  let offset = 0
  const ours = tokenize(p.code, { lang: p.lang }).tokens.map((t) => { const run = { start: offset, end: offset + t.value.length, kind: t.className || 'none' }; offset = run.end; return run })
  const theirs = pierre.codeToTokens(p.code, { lang: p.lang, theme }).tokens.flat().map((t) => ({ start: t.offset, end: t.offset + t.content.length, kind: colorNames[t.color] || 'none' }))
  const inspect = (runs) => {
    const kinds = [...new Set(runs.filter((r) => r.start < start + p.text.length && r.end > start).map((r) => r.kind))]
    return { kinds, passed: kinds.length > 0 && kinds.every((k) => p.expected.includes(k)) }
  }
  return { ...p, start, tanstack: inspect(ours), pierre: inspect(theirs) }
})
const docs = JSON.parse(fs.readFileSync(new URL('../test/generated/tanstack-doc-fixtures.json', import.meta.url), 'utf8')).fixtures
if (process.argv[3]) {
  const directory = path.join(process.argv[3], 'packages/highlights/benchmark/fixtures')
  for (const file of fs.readdirSync(directory).filter((name) => name.endsWith('.txt'))) {
    const code = fs.readFileSync(path.join(directory, file), 'utf8')
    if (code.startsWith('version https://git-lfs')) throw new Error(`Missing LFS fixture: ${file}`)
    docs.push({ file, lang: file.split('.')[1], code })
  }
}
docs.push({ file: 'unicode-crlf', lang: 'ts', code: 'const café = "🌈 & <你好>";\r\n// İ é 日本語\r\n' })
const decoder = new TextDecoder()
const decodeHtml = (html) => html.replace(/<[^>]*>/g, '').replace(/&#x([0-9a-f]+);|&#([0-9]+);|&(amp|lt|gt|quot|apos|#39);/gi, (_, hex, dec, name) => hex ? String.fromCodePoint(parseInt(hex, 16)) : dec ? String.fromCodePoint(Number(dec)) : ({ amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", '#39': "'" })[name])
const preservation = { tested: 0, failures: [] }
for (const f of docs) {
  if (!pierre.isSupportedLanguage(f.lang)) continue
  preservation.tested++
  for (const [name, html] of [['tanstack', highlight(f.code, { lang: f.lang }).html], ['pierre', decoder.decode(pierre.codeToHtml(f.code, { lang: f.lang, theme }))]]) {
    if (decodeHtml(html) !== f.code) preservation.failures.push({ name, lang: f.lang, file: f.file, line: f.line })
  }
}
const { default: languageIds } = await import(pathToFileURL(path.resolve(root, 'dist/languages.js')))
const canonical = [...new Map(Object.entries(languageIds).map(([name, id]) => [id, name])).keys()]
const tanstackLanguages = defaultHighlighter.listLanguages()
const bundles = {}
for (const [name, contents] of Object.entries({
  tanstackAll: "export { highlight } from './src/index.ts'",
  tanstackTsx: "import { createHighlighter } from './src/core.ts'; import { tsx } from './src/languages/tsx.ts'; export const highlighter = createHighlighter({ languages: [tsx] })",
  pierreHtml: `export { codeToHtml } from ${JSON.stringify(path.resolve(root, 'dist/default.js'))}; export { githubDark } from ${JSON.stringify(path.resolve(root, 'dist/themes.js'))}`,
})) {
  const result = await build({ stdin: { contents, resolveDir: process.cwd() }, bundle: true, minify: true, format: 'esm', platform: 'browser', target: 'es2022', write: false })
  const bytes = result.outputFiles[0].contents
  bundles[name] = { minifiedBytes: bytes.length, gzipBytes: gzipSync(bytes).length, brotliBytes: brotliCompressSync(bytes).length }
}
console.log(JSON.stringify({ caveat: 'Small hand-selected diagnostic probes, not an accuracy ranking. Token categories differ; accepted categories are explicit.', results, preservation,
  languages: { pierreIncludingPlain: canonical.length, tanstackIncludingPlain: tanstackLanguages.length, tanstackUnsupportedByPierre: tanstackLanguages.filter((l) => !pierre.isSupportedLanguage(l)) },
  bundles: { note: 'Browser ESM, esbuild minification, gzip defaults. Pierre includes embedded Wasm and GitHub Dark theme; TanStack emits classes and excludes external CSS.', ...bundles },
}, null, 2))
