import {
  createHighlighter,
  type HighlightOptions,
  type HighlightResult as CoreHighlightResult,
  type HighlightTokenResult as CoreHighlightTokenResult,
  type RenderedCodeBlockData as CoreRenderedCodeBlockData,
} from './core.js'
import { apache } from './languages/apache.js'
import { css } from './languages/css.js'
import { diff } from './languages/diff.js'
import { dockerfile } from './languages/dockerfile.js'
import { ejs } from './languages/ejs.js'
import { env } from './languages/env.js'
import { html } from './languages/html.js'
import { http } from './languages/http.js'
import { js } from './languages/js.js'
import { json } from './languages/json.js'
import { jsx } from './languages/jsx.js'
import { markdown } from './languages/markdown.js'
import { mermaid } from './languages/mermaid.js'
import { nginx } from './languages/nginx.js'
import { plaintext } from './languages/plaintext.js'
import { python } from './languages/python.js'
import { scheme } from './languages/scheme.js'
import { shell } from './languages/shell.js'
import { sql } from './languages/sql.js'
import { svelte } from './languages/svelte.js'
import { toml } from './languages/toml.js'
import { ts } from './languages/ts.js'
import { tsx } from './languages/tsx.js'
import { vue } from './languages/vue.js'
import { yaml } from './languages/yaml.js'

export type HighlightLanguage =
  | 'apache'
  | 'css'
  | 'diff'
  | 'dockerfile'
  | 'ejs'
  | 'env'
  | 'html'
  | 'http'
  | 'js'
  | 'json'
  | 'jsx'
  | 'markdown'
  | 'mermaid'
  | 'nginx'
  | 'plaintext'
  | 'python'
  | 'scheme'
  | 'shell'
  | 'sql'
  | 'svelte'
  | 'toml'
  | 'ts'
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
  css,
  diff,
  dockerfile,
  ejs,
  env,
  html,
  http,
  js,
  json,
  jsx,
  markdown,
  mermaid,
  nginx,
  plaintext,
  python,
  scheme,
  shell,
  sql,
  svelte,
  toml,
  ts,
  tsx,
  vue,
  yaml,
] as const

export const defaultHighlighter = createHighlighter({ languages: allLanguages })

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
