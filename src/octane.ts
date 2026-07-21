import type {
  Highlighter,
  HighlightDecoration,
  RenderedCodeBlockData,
} from './core.js'
import {
  rehypeHighlightCodeBlocks,
  type RehypeHighlightOptions,
} from './rehype.js'

export type HighlightedCodeBlockProps = RenderedCodeBlockData & {
  className?: string
  dangerouslySetInnerHTML: { __html: string }
}

export type CreateHighlightedCodeBlockPropsOptions = {
  className?: string
  code: string
  decorations?: ReadonlyArray<HighlightDecoration>
  highlighter: Highlighter
  lang?: string
  lineNumbers?: boolean
  title?: string
}

export type OctaneMdxHighlightOptions = RehypeHighlightOptions

export type OctaneMdxHighlightPlugin = [
  plugin: typeof rehypeHighlightCodeBlocks,
  options: OctaneMdxHighlightOptions,
]

export function createHighlightedCodeBlockProps({
  className,
  code,
  decorations,
  highlighter,
  lang,
  lineNumbers,
  title,
}: CreateHighlightedCodeBlockPropsOptions): HighlightedCodeBlockProps {
  const rendered = highlighter.renderCodeBlockData({
    code,
    decorations,
    lang,
    lineNumbers,
    title,
  })

  return {
    ...rendered,
    className,
    dangerouslySetInnerHTML: { __html: rendered.htmlMarkup },
  }
}

export function createOctaneMdxHighlight(
  options: OctaneMdxHighlightOptions,
): OctaneMdxHighlightPlugin {
  return [rehypeHighlightCodeBlocks, options]
}
