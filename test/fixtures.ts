import { readFileSync } from 'node:fs'
import type { HighlightLanguage } from '../src/index'

export type LanguageFixture = {
  lang: string
  normalized: HighlightLanguage
  code: string
  expectedClasses: Array<string>
}

export const languageFixtures: Array<LanguageFixture> = [
  {
    lang: 'pwsh', normalized: 'powershell',
    code: readFileSync(new URL('./showcases/Get-StationReport.ps1', import.meta.url), 'utf8'),
    expectedClasses: ['th-keyword', 'th-type', 'th-variable', 'th-string', 'th-comment', 'th-literal', 'th-command', 'th-number', 'th-function', 'th-operator', 'th-property'],
  },
  {
    lang: 'php',
    normalized: 'php',
    code: '<?php\n#[Route("/hello")]\nfunction greet(string $name): string { return "Hello " . $name; }\n$count = 42; // count\n$ready = true;',
    expectedClasses: ['th-meta', 'th-attr', 'th-keyword', 'th-function', 'th-type', 'th-variable', 'th-string', 'th-operator', 'th-number', 'th-comment', 'th-literal'],
  },
  {
    lang: 'c++',
    normalized: 'cpp',
    code: '#include <iostream>\nstruct Point { int x = 42; };\nint main() { std::cout << "hello"; return 0; } // output',
    expectedClasses: ['th-meta', 'th-string', 'th-keyword', 'th-type', 'th-number', 'th-function', 'th-operator', 'th-comment'],
  },
  {
    lang: 'cmake',
    normalized: 'cmake',
    code: 'cmake_minimum_required(VERSION 3.20)\nproject(Hello)\nset(ENABLED ON)\nif(ENABLED)\n  message("hello")\n  add_subdirectory(${SOURCE_DIR})\nendif() # done',
    expectedClasses: ['th-command', 'th-number', 'th-literal', 'th-keyword', 'th-string', 'th-variable', 'th-comment'],
  },
  {
    lang: 'c#',
    normalized: 'csharp',
    code: 'using System;\n[Serializable]\npublic record Point(int X, int Y);\nvar name = "world"; // greet\nConsole.WriteLine($"Hello {name}", 42);',
    expectedClasses: ['th-keyword', 'th-type', 'th-string', 'th-comment', 'th-function', 'th-number', 'th-operator'],
  },
  {
    lang: 'dart',
    normalized: 'dart',
    code: `import 'package:flutter/material.dart';\n@override\nWidget build(BuildContext context) {\n  final count = 42; // total\n  return Text('Hello $name', key: null);\n}`,
    expectedClasses: ['th-keyword', 'th-string', 'th-type', 'th-function', 'th-number', 'th-operator', 'th-comment'],
  },
  {
    lang: 'java',
    normalized: 'java',
    code: 'import java.util.List;\n@Override\npublic String greet(String name) {\n  int count = 42; // total\n  return "Hello " + name;\n}',
    expectedClasses: ['th-keyword', 'th-type', 'th-function', 'th-number', 'th-operator', 'th-comment', 'th-string'],
  },
  {
    lang: 'kt',
    normalized: 'kotlin',
    code: 'import kotlin.math.max\n@JvmStatic\nfun greet(name: String): String {\n  val count = 42 // total\n  return "Hello ${name}"\n}',
    expectedClasses: ['th-keyword', 'th-function', 'th-type', 'th-number', 'th-operator', 'th-comment', 'th-string'],
  },
  {
    lang: 'lua',
    normalized: 'lua',
    code: 'local function greet(name)\n  -- say hello\n  local count = 42\n  return "Hello " .. name, nil\nend\nprint(greet("world"))',
    expectedClasses: ['th-keyword', 'th-function', 'th-comment', 'th-number', 'th-operator', 'th-string', 'th-literal'],
  },
  {
    lang: 'pl',
    normalized: 'perl',
    code: 'use strict;\nmy $name = "world";\nmy @items = (1, 2, 42); # list\nsub greet { return "Hello $_[0]"; }\nprint greet($name) if $name =~ /wor/;',
    expectedClasses: ['th-keyword', 'th-variable', 'th-operator', 'th-string', 'th-number', 'th-comment', 'th-function'],
  },
  {
    lang: 'rb',
    normalized: 'ruby',
    code: `require 'json'\nclass Greeter\n  def greet(name) # say hello\n    "Hello #{name}" * 42\n  end\nend`,
    expectedClasses: ['th-keyword', 'th-string', 'th-type', 'th-function', 'th-comment', 'th-operator', 'th-number'],
  },
  {
    lang: 'rs',
    normalized: 'rust',
    code: 'use std::fmt;\n#[derive(Debug)]\nstruct Point { x: i32 }\nfn main() {\n    let count = 42; // total\n    println!("Hello {}", count);\n}',
    expectedClasses: ['th-keyword', 'th-type', 'th-function', 'th-number', 'th-operator', 'th-comment', 'th-string'],
  },
  {
    lang: 'swift',
    normalized: 'swift',
    code: 'import Foundation\n@MainActor\nfunc greet(name: String) -> String {\n    let count = 42 // total\n    return "Hello \\(name)"\n}',
    expectedClasses: ['th-keyword', 'th-type', 'th-attr', 'th-function', 'th-number', 'th-operator', 'th-comment', 'th-string'],
  },
  {
    lang: 'octane',
    normalized: 'tsrx',
    code: `import { useState } from 'octane'

export function Counter() @{
  const [count, setCount] = useState(0)

  <button onClick={() => setCount(count + 1)}>
    {'Count: ' + count}
  </button>
}`,
    expectedClasses: [
      'th-keyword',
      'th-string',
      'th-function',
      'th-tag',
      'th-attr',
      'th-number',
    ],
  },
  {
    lang: 'golang',
    normalized: 'go',
    code: `package main

import "fmt"

type Greeter struct {
  Name string
}

func (g Greeter) Greet() {
  count := 2
  url := \`https://go.dev\`
  initial := 'G'
  fmt.Println(url, initial, g.Name, count, true) // greet
}`,
    expectedClasses: [
      'th-keyword',
      'th-string',
      'th-type',
      'th-function',
      'th-property',
      'th-number',
      'th-literal',
      'th-comment',
      'th-operator',
    ],
  },
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
