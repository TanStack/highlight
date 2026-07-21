---
title: API Reference
---

# API Reference

TanStack Highlight is split into explicit entry points. Importing an entry point does not register languages or themes unless that entry point says it does.

| Entry point | Purpose |
| --- | --- |
| [`@tanstack/highlight`](default-entry) | Ready-to-use highlighter with every bundled language |
| [`@tanstack/highlight/core`](core) | Highlighter factory, renderers, and public types with no languages |
| [`@tanstack/highlight/markdown`](markdown) | Code fence metadata and HAST helpers |
| [`@tanstack/highlight/remark`](remark) | Remark/MDAST integration |
| [`@tanstack/highlight/rehype`](rehype) | Rehype/HAST integration |
| [`@tanstack/highlight/react`](react) | Framework-neutral data adapter for React components |
| [`@tanstack/highlight/theme`](theme) | Theme types and CSS generation |
| [`@tanstack/highlight/languages`](languages) | Aggregate exports for every bundled language |
| [`@tanstack/highlight/languages/*`](languages) | Individually importable language definitions |
| [`@tanstack/highlight/themes/*`](themes) | Individually importable themes |

Use the [default entry](default-entry) for convenience. Use [`core`](core) plus individual language modules when client bundle size matters.
