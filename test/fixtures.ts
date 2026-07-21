import type { HighlightLanguage } from '../src/index'

export type LanguageFixture = {
  lang: string
  normalized: HighlightLanguage
  code: string
  expectedClasses: Array<string>
}

export const languageFixtures: Array<LanguageFixture> = [
  {
    lang: 'tsx',
    normalized: 'tsx',
    code: `import { useState } from 'react'\n\ntype Props = { name: string }\n\nexport function Greeting({ name }: Props) {\n  const [count, setCount] = useState(0)\n  return <button className=\"primary\" onClick={() => setCount(count + 1)}>{name}</button>\n}`,
    expectedClasses: ['th-keyword', 'th-string', 'th-type', 'th-function', 'th-tag', 'th-attr'],
  },
  {
    lang: 'typescript',
    normalized: 'ts',
    code: `export type User = { id: string; active?: boolean }\nfunction getUser(users: Array<User>) {\n  return users.map((user) => user.id)\n}`,
    expectedClasses: ['th-keyword', 'th-type', 'th-function', 'th-property'],
  },
  {
    lang: 'angular-ts',
    normalized: 'ts',
    code: `@Component({ selector: 'app-root' })\nexport class AppComponent {\n  title = 'TanStack'\n}`,
    expectedClasses: ['th-keyword', 'th-type', 'th-string', 'th-function'],
  },
  {
    lang: 'jsx',
    normalized: 'jsx',
    code: `export function View() {\n  return <div data-state=\"open\">Hello</div>\n}`,
    expectedClasses: ['th-keyword', 'th-function', 'th-tag', 'th-attr', 'th-string'],
  },
  {
    lang: 'js',
    normalized: 'js',
    code: `const value = await fetch('/api')\nconsole.log(value)`,
    expectedClasses: ['th-keyword', 'th-string', 'th-function', 'th-property'],
  },
  {
    lang: 'bash',
    normalized: 'shell',
    code: `#!/usr/bin/env bash\npnpm install\nexport NODE_ENV=production\n# deploy`,
    expectedClasses: ['th-comment', 'th-keyword', 'th-variable', 'th-command'],
  },
  {
    lang: 'jsonc',
    normalized: 'json',
    code: `{\n  // comment\n  \"name\": \"tanstack\",\n  \"private\": true\n}`,
    expectedClasses: ['th-comment', 'th-property', 'th-string', 'th-literal'],
  },
  {
    lang: 'plaintext',
    normalized: 'plaintext',
    code: `No highlighting <script>alert('x')</script>`,
    expectedClasses: [],
  },
  {
    lang: 'vue',
    normalized: 'vue',
    code: `<script setup lang=\"ts\">\nconst count = ref(0)\n</script>\n<template><button @click=\"count++\">{{ count }}</button></template>`,
    expectedClasses: ['th-tag', 'th-attr', 'th-string', 'th-keyword', 'th-function'],
  },
  {
    lang: 'svelte',
    normalized: 'svelte',
    code: `<script lang=\"ts\">\n  export let name: string\n</script>\n<h1>{name}</h1>`,
    expectedClasses: ['th-tag', 'th-attr', 'th-string', 'th-keyword', 'th-type'],
  },
  {
    lang: 'html',
    normalized: 'html',
    code: `<section aria-label=\"Docs\"><h1>Title</h1></section>`,
    expectedClasses: ['th-tag', 'th-attr', 'th-string'],
  },
  {
    lang: 'markdown',
    normalized: 'markdown',
    code: `# Title\n\nUse \`queryClient\` and [read more](/docs).`,
    expectedClasses: ['th-heading', 'th-code-inline', 'th-link'],
  },
  {
    lang: 'yaml',
    normalized: 'yaml',
    code: `name: CI\non:\n  push:\n    branches: [main]`,
    expectedClasses: ['th-property', 'th-string'],
  },
  {
    lang: 'css',
    normalized: 'css',
    code: `.button:hover {\n  color: var(--accent);\n}`,
    expectedClasses: ['th-selector', 'th-property', 'th-function', 'th-variable'],
  },
  {
    lang: 'diff',
    normalized: 'diff',
    code: `@@ -1,2 +1,2 @@\n- old\n+ new`,
    expectedClasses: ['th-meta', 'th-deleted', 'th-inserted'],
  },
  {
    lang: 'mermaid',
    normalized: 'mermaid',
    code: `graph TD\n  A[Docs] --> B[Code]`,
    expectedClasses: ['th-keyword', 'th-operator'],
  },
  {
    lang: 'toml',
    normalized: 'toml',
    code: `[package]\nname = \"highlight\"\nprivate = true`,
    expectedClasses: ['th-heading', 'th-property', 'th-string', 'th-literal'],
  },
  {
    lang: 'sql',
    normalized: 'sql',
    code: `select id, name from users where active = true`,
    expectedClasses: ['th-keyword', 'th-literal'],
  },
  {
    lang: 'http',
    normalized: 'http',
    code: `POST /api/chat HTTP/1.1\nContent-Type: application/json`,
    expectedClasses: ['th-keyword', 'th-property', 'th-string'],
  },
  {
    lang: 'env',
    normalized: 'env',
    code: `DATABASE_URL=postgres://localhost\n# local only`,
    expectedClasses: ['th-property', 'th-string', 'th-comment'],
  },
  {
    lang: 'dockerfile',
    normalized: 'dockerfile',
    code: `FROM node:22\nWORKDIR /app\nRUN pnpm install`,
    expectedClasses: ['th-keyword', 'th-string', 'th-command'],
  },
  {
    lang: 'nginx',
    normalized: 'nginx',
    code: `server {\n  listen 80;\n  location / { proxy_pass http://app; }\n}`,
    expectedClasses: ['th-keyword', 'th-number', 'th-string'],
  },
  {
    lang: 'python',
    normalized: 'python',
    code: `def greet(name: str):\n    return f\"hi {name}\"`,
    expectedClasses: ['th-keyword', 'th-function', 'th-type', 'th-string'],
  },
  {
    lang: 'apache',
    normalized: 'apache',
    code: `<VirtualHost *:80>\n  ServerName example.com\n</VirtualHost>`,
    expectedClasses: ['th-tag', 'th-keyword', 'th-string'],
  },
  {
    lang: 'ejs',
    normalized: 'ejs',
    code: `<% if (user) { %>\n  <h1><%= user.name %></h1>\n<% } %>`,
    expectedClasses: ['th-tag', 'th-keyword', 'th-property'],
  },
  {
    lang: 'scheme',
    normalized: 'scheme',
    code: `(define (square x)\n  (* x x))`,
    expectedClasses: ['th-keyword', 'th-function'],
  },
]
