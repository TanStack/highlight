// Dense delimiter runs stay on the character path, native searches skip text.
export function blockCommentEnd(code: string, cursor: number) {
  let depth = 1
  let nextOpen = 0
  let nextClose = 0
  while (depth && cursor < code.length) {
    while (code.startsWith('/*', cursor)) {
      depth++
      cursor += 2
    }
    while (depth && code.startsWith('*/', cursor)) {
      depth--
      cursor += 2
    }
    if (!depth) break
    // One-based positions let Infinity cache an unsuccessful search.
    if (nextOpen <= cursor) nextOpen = code.indexOf('/*', cursor) + 1 || Infinity
    if (nextClose <= cursor) nextClose = code.indexOf('*/', cursor) + 1 || Infinity
    const opening = nextOpen <= nextClose
    depth += opening ? 1 : -1
    cursor = (opening ? nextOpen : nextClose) + 1
  }
  return Math.min(cursor, code.length)
}
