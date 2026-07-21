import type {
  Highlighter,
  HighlightDecoration,
  RenderedCodeBlockData,
} from './core.js'

export type HighlightedCodeBlockProps = RenderedCodeBlockData & {
  className?: string
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

export function createHighlightedCodeBlockProps({
  className,
  code,
  decorations,
  highlighter,
  lang,
  lineNumbers,
  title,
}: CreateHighlightedCodeBlockPropsOptions): HighlightedCodeBlockProps {
  return {
    ...highlighter.renderCodeBlockData({
      code,
      decorations,
      lang,
      lineNumbers,
      title,
    }),
    className,
  }
}
