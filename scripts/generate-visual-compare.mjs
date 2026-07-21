import fs from 'node:fs'
import path from 'node:path'
import * as shiki from 'shiki'
import { highlight } from '../dist/index.js'
import { createThemeCss } from '../dist/theme.js'
import { auroraXTheme } from '../dist/themes/aurora-x.js'
import { githubLightTheme } from '../dist/themes/github-light.js'

const fixtureFile = 'test/generated/tanstack-doc-fixtures.json'
const outFile = process.argv[2] || 'artifacts/shiki-comparison.html'
const fixtureData = JSON.parse(fs.readFileSync(fixtureFile, 'utf8'))
const fixtures = selectFixtures(fixtureData.fixtures)
const shikiHighlighter = await shiki.createHighlighter({
  themes: ['github-light', 'aurora-x'],
  langs: ['plaintext'],
})

const rows = []
for (const fixture of fixtures) {
  const ours = highlight(fixture.code, { lang: fixture.rawLang }).html
  const shikiHtml = await renderShiki(
    shikiHighlighter,
    fixture.code,
    fixture.rawLang,
  )

  rows.push(`
    <section class="sample">
      <header>
        <div><strong>${escapeHtml(fixture.lang)}</strong> <span>${escapeHtml(fixture.rawLang)}</span></div>
        <code>${escapeHtml(fixture.file)}:${fixture.line}</code>
      </header>
      <div class="grid">
        <div>
          <h2>TanStack Highlight</h2>
          ${ours}
        </div>
        <div>
          <h2>Shiki Reference</h2>
          ${shikiHtml}
        </div>
      </div>
    </section>`)
}

fs.mkdirSync(path.dirname(outFile), { recursive: true })
fs.writeFileSync(outFile, buildHtml(rows.join('\n')))
console.log(`Wrote ${outFile}`)

async function renderShiki(highlighter, code, rawLang) {
  const lang = normalizeShikiLanguage(rawLang)

  try {
    if (!highlighter.getLoadedLanguages().includes(lang)) {
      await highlighter.loadLanguage(lang)
    }

    return highlighter.codeToHtml(code, {
      lang,
      themes: {
        light: 'github-light',
        dark: 'aurora-x',
      },
    })
  } catch {
    return highlighter.codeToHtml(code, {
      lang: 'plaintext',
      themes: {
        light: 'github-light',
        dark: 'aurora-x',
      },
    })
  }
}

function normalizeShikiLanguage(lang) {
  const value = (lang || 'plaintext').toLowerCase()
  const aliases = {
    '-->': 'plaintext',
    'angular-html': 'html',
    'angular-ts': 'ts',
    dotenv: 'env',
    js: 'javascript',
    'js-vue': 'javascript',
    jsonc: 'json',
    md: 'markdown',
    sh: 'bash',
    shell: 'bash',
    text: 'plaintext',
    txt: 'plaintext',
    typescript: 'ts',
    xml: 'html',
  }

  return aliases[value] || value
}

function selectFixtures(fixtures) {
  const selected = []
  const seen = new Set()

  for (const fixture of fixtures) {
    if (seen.has(fixture.lang)) continue
    seen.add(fixture.lang)
    selected.push(fixture)
  }

  return selected
}

function buildHtml(samples) {
  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>TanStack Highlight / Shiki Comparison</title>
  <style>
    ${createThemeCss({ light: githubLightTheme, dark: auroraXTheme })}

    :root {
      color-scheme: light dark;
      --page-bg: #f6f8fa;
      --page-fg: #1f2328;
      --panel-bg: #ffffff;
      --panel-border: #d0d7de;
      --muted: #57606a;
    }

    .dark {
      --page-bg: #0d1117;
      --page-fg: #e6edf3;
      --panel-bg: #161b22;
      --panel-border: #30363d;
      --muted: #8b949e;
    }

    * { box-sizing: border-box; }
    body {
      margin: 0;
      background: var(--page-bg);
      color: var(--page-fg);
      font: 14px/1.5 ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    }
    main {
      width: min(1440px, calc(100vw - 32px));
      margin: 0 auto;
      padding: 24px 0 48px;
    }
    .topbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      margin-bottom: 24px;
    }
    h1 { margin: 0; font-size: 22px; line-height: 1.2; }
    h2 { margin: 0 0 8px; font-size: 13px; color: var(--muted); }
    button {
      border: 1px solid var(--panel-border);
      background: var(--panel-bg);
      color: var(--page-fg);
      border-radius: 6px;
      padding: 6px 10px;
      cursor: pointer;
    }
    .note { color: var(--muted); margin: 0 0 18px; }
    .sample {
      border: 1px solid var(--panel-border);
      border-radius: 8px;
      background: var(--panel-bg);
      margin: 0 0 18px;
      overflow: hidden;
    }
    .sample > header {
      display: flex;
      justify-content: space-between;
      gap: 16px;
      border-bottom: 1px solid var(--panel-border);
      padding: 10px 12px;
      color: var(--muted);
    }
    .sample > header strong { color: var(--page-fg); }
    .sample > header span { margin-left: 8px; }
    .grid {
      display: grid;
      grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
      gap: 1px;
      background: var(--panel-border);
    }
    .grid > div {
      min-width: 0;
      background: var(--panel-bg);
      padding: 12px;
    }
    pre {
      overflow: auto;
      margin: 0;
      border-radius: 6px;
      padding: 14px;
      font: 13px/1.55 ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace;
    }
    .th-code {
      background: #f6f8fa;
      color: #1f2328;
    }
    .dark .th-code {
      background: #0d1117;
      color: #e6edf3;
    }
    .missing-shiki {
      border: 1px dashed var(--panel-border);
      color: var(--muted);
    }
    @media (max-width: 900px) {
      .grid { grid-template-columns: 1fr; }
      .sample > header { flex-direction: column; }
    }
  </style>
</head>
<body>
  <main>
    <div class="topbar">
      <h1>TanStack Highlight / Shiki Comparison</h1>
      <button type="button" onclick="document.documentElement.classList.toggle('dark')">Toggle Theme</button>
    </div>
    <p class="note">Shiki reference rendered from this package's pinned development dependency.</p>
    ${samples}
  </main>
</body>
</html>
`
}

function escapeHtml(value) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}
