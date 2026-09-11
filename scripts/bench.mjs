import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import { build } from 'esbuild'
import { measureRuntime } from './benchmark-utils.mjs'

const fixtureFile = 'test/generated/tanstack-doc-fixtures.json'
const args = process.argv.slice(2)
if (args.length && (args.length !== 2 || args[0] !== '--bundle')) {
  throw new Error('Usage: node scripts/bench.mjs [--bundle path/to/snapshot.mjs]')
}
const temporaryDirectory = args.length
  ? undefined
  : fs.mkdtempSync(path.join(os.tmpdir(), 'tanstack-highlight-bench-'))
const bundleFile = args[1] || path.join(temporaryDirectory, 'index.mjs')

try {
  if (temporaryDirectory) {
    await build({
      stdin: {
        contents: `
          export * from './src/index.ts'
          export { codeFenceToHast, createTanStackMarkdownHighlighter } from './src/markdown.ts'
        `,
        resolveDir: process.cwd(),
      },
      bundle: true,
      minify: true,
      format: 'esm',
      platform: 'browser',
      target: 'es2022',
      outfile: bundleFile,
      logLevel: 'silent',
    })
  }

  const { defaultHighlighter, highlight, tokenize, codeFenceToHast, createTanStackMarkdownHighlighter } =
    await import(pathToFileURL(path.resolve(bundleFile)).href)
  const fixtures = JSON.parse(fs.readFileSync(fixtureFile, 'utf8')).fixtures
  const markdownHighlight = createTanStackMarkdownHighlighter(defaultHighlighter)
  const longCode = Array.from(
    { length: 1_000 },
    (_, index) => `const value${index} = "value ${index}";`,
  ).join('\n')
  const rangeDecorations = Array.from({ length: 50 }, (_, index) => ({
    className: 'is-highlighted',
    range: [index * 500, index * 500 + 100],
  }))
  const htmlBytes = (result) => Buffer.byteLength(result.html)
  const profiles = {
    highlight: {
      fixtures,
      run: (fixture) => highlight(fixture.code, { lang: fixture.rawLang }),
      observe: (result) => result.html.length,
      outputBytes: htmlBytes,
      targetBlocks: 10_000,
    },
    cpp: {
      fixtures: [{ rawLang: 'cpp', code: '#include <vector>\nconstexpr auto text = R"tag(// raw text)tag";\nint main() { std::vector<int> values{1, 2, 3}; return values.size(); }' }],
      run: (fixture) => highlight(fixture.code, { lang: fixture.rawLang }),
      observe: (result) => result.html.length,
      targetBlocks: 10_000,
    },
    cmake: {
      fixtures: [{ rawLang: 'cmake', code: 'cmake_minimum_required(VERSION 3.20)\n#[=[ comment ]=]\nproject(Hello)\nset(TEXT [=[# text]=])\nadd_subdirectory(${SOURCE_DIR})\nmessage($<IF:$<CONFIG:Debug>,debug,release>)' }],
      run: (fixture) => highlight(fixture.code, { lang: fixture.rawLang }),
      observe: (result) => result.html.length,
      targetBlocks: 10_000,
    },
    tokenize: {
      fixtures,
      run: (fixture) => tokenize(fixture.code, { lang: fixture.rawLang }),
      observe: (result) => result.tokens.length,
      targetBlocks: 10_000,
    },
    markdown: {
      fixtures,
      run: (fixture) => markdownHighlight(fixture.code, fixture.rawLang),
      outputBytes: (html) => Buffer.byteLength(html),
      targetBlocks: 10_000,
    },
    hast: {
      fixtures,
      run: (fixture) => codeFenceToHast({ code: fixture.code, lang: fixture.rawLang }, defaultHighlighter),
      observe: (result) => result.children[0].children.length,
      targetBlocks: 5_000,
    },
    php: {
      fixtures: [{ rawLang: 'php', code: '<p><?= $name ?></p><?php #[Route("/hello")] function greet(string $name): string { return "Hi {$name}"; }\n$text = <<<END\nraw ?> # text\nEND;' }],
      run: (fixture) => highlight(fixture.code, { lang: fixture.rawLang }),
      observe: (result) => result.html.length,
      targetBlocks: 10_000,
    },
    lineNumbers: {
      fixtures,
      run: (fixture) => highlight(fixture.code, { lang: fixture.rawLang, lineNumbers: true }),
      observe: (result) => result.html.length,
      outputBytes: htmlBytes,
      targetBlocks: 5_000,
    },
    longLineNumbers: {
      fixtures: [longCode],
      run: (code) => highlight(code, { lang: 'ts', lineNumbers: true }),
      observe: (result) => result.html.length,
      outputBytes: htmlBytes,
      targetBlocks: 50,
    },
    longDecorated: {
      fixtures: [longCode],
      run: (code) => highlight(code, {
        lang: 'ts',
        lineNumbers: true,
        decorations: [
          { lines: [20, 80], className: 'is-focused' },
          ...rangeDecorations,
        ],
      }),
      observe: (result) => result.html.length,
      outputBytes: htmlBytes,
      targetBlocks: 50,
    },
  }
  const results = Object.fromEntries(Object.entries(profiles).map(([name, profile]) => [
    name,
    measureRuntime({ ...profile, maxElapsedMs: 1_200 }),
  ]))

  console.log(JSON.stringify({
    node: process.version,
    platform: `${process.platform}/${process.arch}`,
    timing: 'Median of three samples after two warmup passes',
    profiles: results,
  }, null, 2))

  if (Object.values(results).some((result) => !result.passed)) process.exitCode = 1
} finally {
  if (temporaryDirectory) fs.rmSync(temporaryDirectory, { recursive: true, force: true })
}
