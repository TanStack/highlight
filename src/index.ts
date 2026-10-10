import {
  createHighlighter,
  type HighlightOptions,
  type HighlightResult as CoreHighlightResult,
  type HighlightTokenResult as CoreHighlightTokenResult,
  type RenderedCodeBlockData as CoreRenderedCodeBlockData,
} from './core.js'
import { apache } from './languages/apache.js'
import { cmake } from './languages/cmake.js'
import { cpp } from './languages/cpp.js'
import { csharp } from './languages/csharp.js'
import { css } from './languages/css.js'
import { dart } from './languages/dart.js'
import { diff } from './languages/diff.js'
import { dockerfile } from './languages/dockerfile.js'
import { ejs } from './languages/ejs.js'
import { env } from './languages/env.js'
import { go } from './languages/go.js'
import { html } from './languages/html.js'
import { http } from './languages/http.js'
import { java } from './languages/java.js'
import { js } from './languages/js.js'
import { json } from './languages/json.js'
import { jsx } from './languages/jsx.js'
import { kotlin } from './languages/kotlin.js'
import { lua } from './languages/lua.js'
import { markdown } from './languages/markdown.js'
import { mermaid } from './languages/mermaid.js'
import { nginx } from './languages/nginx.js'
import { perl } from './languages/perl.js'
import { php } from './languages/php.js'
import { plaintext } from './languages/plaintext.js'
import { powershell } from './languages/powershell.js'
import { python } from './languages/python.js'
import { ruby } from './languages/ruby.js'
import { rust } from './languages/rust.js'
import { scheme } from './languages/scheme.js'
import { shell } from './languages/shell.js'
import { sql } from './languages/sql.js'
import { svelte } from './languages/svelte.js'
import { swift } from './languages/swift.js'
import { toml } from './languages/toml.js'
import { ts } from './languages/ts.js'
import { tsrx } from './languages/tsrx.js'
import { tsx } from './languages/tsx.js'
import { vue } from './languages/vue.js'
import { yaml } from './languages/yaml.js'

export type HighlightLanguage =
  | 'apache'
  | 'cmake'
  | 'cpp'
  | 'csharp'
  | 'css'
  | 'dart'
  | 'diff'
  | 'dockerfile'
  | 'ejs'
  | 'env'
  | 'go'
  | 'html'
  | 'http'
  | 'java'
  | 'js'
  | 'json'
  | 'jsx'
  | 'kotlin'
  | 'lua'
  | 'markdown'
  | 'mermaid'
  | 'nginx'
  | 'perl'
  | 'php'
  | 'plaintext'
  | 'powershell'
  | 'python'
  | 'ruby'
  | 'rust'
  | 'scheme'
  | 'shell'
  | 'sql'
  | 'svelte'
  | 'swift'
  | 'toml'
  | 'ts'
  | 'tsrx'
  | 'tsx'
  | 'vue'
  | 'yaml'

export type HighlightResult = Omit<CoreHighlightResult, 'lang'> & {
  lang: HighlightLanguage
}

export type HighlightTokenResult = Omit<CoreHighlightTokenResult, 'lang'> & {
  lang: HighlightLanguage
}

export type RenderedCodeBlockData = Omit<CoreRenderedCodeBlockData, 'lang'> & {
  lang: HighlightLanguage
}

export type RenderCodeBlockOptions = HighlightOptions & {
  title?: string
}

export type {
  Highlighter,
  HighlightDecoration,
  HighlightDecorationData,
  HighlightElementNode,
  HighlightLineDecoration,
  HighlightOptions,
  HighlightRangeDecoration,
  HighlightRenderNode,
  HighlightTextNode,
  HighlightToken,
  HighlightTokenClass,
  LanguageDefinition,
  TokenRange,
  TokenizerContext,
} from './core.js'
export {
  createHighlighter,
  defineLanguage,
  escapeHtml,
  renderNodesToHtml,
  renderTokens,
} from './core.js'

export const allLanguages = [
  apache,
  cmake,
  cpp,
  csharp,
  css,
  dart,
  diff,
  dockerfile,
  ejs,
  env,
  go,
  html,
  http,
  java,
  js,
  json,
  jsx,
  kotlin,
  lua,
  markdown,
  mermaid,
  nginx,
  perl,
  php,
  plaintext,
  powershell,
  python,
  ruby,
  rust,
  scheme,
  shell,
  sql,
  svelte,
  swift,
  toml,
  ts,
  tsrx,
  tsx,
  vue,
  yaml,
] as const

export const defaultHighlighter = /* @__PURE__ */ createHighlighter({ languages: allLanguages })

export function normalizeLanguage(lang?: string): HighlightLanguage {
  return defaultHighlighter.normalizeLanguage(lang) as HighlightLanguage
}

export function listLanguages(): Array<HighlightLanguage> {
  return defaultHighlighter.listLanguages() as Array<HighlightLanguage>
}

export function tokenize(
  code: string,
  options: HighlightOptions = {},
): HighlightTokenResult {
  return defaultHighlighter.tokenize(code, options) as HighlightTokenResult
}

export function highlight(
  code: string,
  options: HighlightOptions = {},
): HighlightResult {
  return defaultHighlighter.highlight(code, options) as HighlightResult
}

export function highlightToHtml(
  code: string,
  options: HighlightOptions = {},
) {
  return defaultHighlighter.highlightToHtml(code, options)
}

export function renderCodeBlockData({
  code,
  decorations,
  lang,
  lineNumbers,
  title,
}: {
  code: string
  decorations?: HighlightOptions['decorations']
  lang?: string
  lineNumbers?: boolean
  title?: string
}): RenderedCodeBlockData {
  return defaultHighlighter.renderCodeBlockData({
    code,
    decorations,
    lang,
    lineNumbers,
    title,
  }) as RenderedCodeBlockData
}
