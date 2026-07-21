import fs from 'node:fs'
import path from 'node:path'

export const supportedLanguages = [
  'apache',
  'css',
  'diff',
  'dockerfile',
  'ejs',
  'env',
  'html',
  'http',
  'js',
  'json',
  'jsx',
  'markdown',
  'mermaid',
  'nginx',
  'plaintext',
  'python',
  'scheme',
  'shell',
  'sql',
  'svelte',
  'toml',
  'ts',
  'tsx',
  'vue',
  'yaml',
]

const aliases = {
  '-->': 'plaintext',
  'angular-html': 'html',
  'angular-ts': 'ts',
  bash: 'shell',
  cjs: 'js',
  cmd: 'shell',
  console: 'shell',
  dotenv: 'env',
  htm: 'html',
  javascript: 'js',
  'js-vue': 'js',
  json5: 'json',
  jsonc: 'json',
  markdown: 'markdown',
  md: 'markdown',
  mjs: 'js',
  sh: 'shell',
  shell: 'shell',
  text: 'plaintext',
  ts: 'ts',
  typescript: 'ts',
  txt: 'plaintext',
  xml: 'html',
  yml: 'yaml',
  zsh: 'shell',
}

export const defaultExclude = new Set(['.git', '.next', 'build', 'coverage', 'dist', 'node_modules'])

export function normalizeLanguage(lang) {
  const normalized = (lang || 'plaintext').trim().toLowerCase()
  if (supportedLanguages.includes(normalized)) return normalized
  return aliases[normalized] || 'plaintext'
}

export function collectScanRoots(root) {
  const scanRoots = []

  for (const name of fs.readdirSync(root)) {
    if (name === 'highlight') continue

    const full = path.join(root, name)
    if (!fs.existsSync(full) || !fs.statSync(full).isDirectory()) continue

    const docs = path.join(full, 'docs')
    if (fs.existsSync(docs) && fs.statSync(docs).isDirectory()) scanRoots.push(docs)
  }

  const tanstackCom = path.join(root, 'tanstack.com')
  if (fs.existsSync(tanstackCom)) scanRoots.push(tanstackCom)

  return scanRoots
}

export function* walkMarkdownFiles(dir, exclude = defaultExclude) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith('.')) continue
    if (exclude.has(entry.name)) continue

    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) yield* walkMarkdownFiles(full, exclude)
    else if (/\.mdx?$/.test(entry.name)) yield full
  }
}
