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

import { ada } from './languages/ada.js'
import { applescript } from './languages/applescript.js'
import { awk } from './languages/awk.js'
import { batch } from './languages/batch.js'
import { c } from './languages/c.js'
import { clojure } from './languages/clojure.js'
import { coffeescript } from './languages/coffeescript.js'
import { crystal } from './languages/crystal.js'
import { d } from './languages/d.js'
import { elixir } from './languages/elixir.js'
import { elm } from './languages/elm.js'
import { erlang } from './languages/erlang.js'
import { fortran } from './languages/fortran.js'
import { fsharp } from './languages/fsharp.js'
import { glsl } from './languages/glsl.js'
import { graphql } from './languages/graphql.js'
import { groovy } from './languages/groovy.js'
import { haskell } from './languages/haskell.js'
import { ini } from './languages/ini.js'
import { julia } from './languages/julia.js'
import { latex } from './languages/latex.js'
import { less } from './languages/less.js'
import { lisp } from './languages/lisp.js'
import { makefile } from './languages/makefile.js'
import { matlab } from './languages/matlab.js'
import { nix } from './languages/nix.js'
import { objectivec } from './languages/objectivec.js'
import { ocaml } from './languages/ocaml.js'
import { pascal } from './languages/pascal.js'
import { powershell } from './languages/powershell.js'
import { properties } from './languages/properties.js'
import { protobuf } from './languages/protobuf.js'
import { r } from './languages/r.js'
import { scala } from './languages/scala.js'
import { scss } from './languages/scss.js'
import { vbnet } from './languages/vbnet.js'
import { verilog } from './languages/verilog.js'
import { vhdl } from './languages/vhdl.js'
import { wat } from './languages/wat.js'
import { x86asm } from './languages/x86asm.js'

export type HighlightLanguage = (typeof allLanguages)[number]['name']

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
  ada,
  apache,
  applescript,
  awk,
  batch,
  c,
  clojure,
  cmake,
  coffeescript,
  cpp,
  crystal,
  csharp,
  css,
  d,
  dart,
  diff,
  dockerfile,
  ejs,
  elixir,
  elm,
  env,
  erlang,
  fortran,
  fsharp,
  glsl,
  go,
  graphql,
  groovy,
  haskell,
  html,
  http,
  ini,
  java,
  js,
  json,
  jsx,
  julia,
  kotlin,
  latex,
  less,
  lisp,
  lua,
  makefile,
  markdown,
  matlab,
  mermaid,
  nginx,
  nix,
  objectivec,
  ocaml,
  pascal,
  perl,
  php,
  plaintext,
  powershell,
  properties,
  protobuf,
  python,
  r,
  ruby,
  rust,
  scala,
  scheme,
  scss,
  shell,
  sql,
  svelte,
  swift,
  toml,
  ts,
  tsrx,
  tsx,
  vbnet,
  verilog,
  vhdl,
  vue,
  wat,
  x86asm,
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
