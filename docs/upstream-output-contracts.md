# Upstream Output Contracts

These are the borrowed ideas that shape the local tests. The goal is not to copy implementation details or exact tokenization. It is to preserve the useful output properties that make mature highlighters practical in docs.

Inspected package tarballs:

| Package | Version | Borrowed Contract |
| --- | ---: | --- |
| `prismjs` | `1.30.0` | CSS-addressable token spans and explicit `language-*` targeting. |
| `highlight.js` | `11.11.1` | Stable semantic class names such as keyword, string, comment, tag, property, type, and literal. |
| `sugar-high` | `1.2.1` | Tiny JS/JSX-first scanner model and CSS-variable-driven token color hooks. |
| `@speed-highlight/core` | `1.2.17` | Small explicit language modules, fast class-based output, and cheap client-side execution. |

Local choices:

- Use `th-*` class names instead of adopting another library's class namespace.
- Emit no inline `style` attributes.
- Emit one HTML tree for light and dark themes.
- Theme through CSS variables from `createThemeCss()`.
- Use real TanStack docs fixtures for language coverage.
- Keep the browser bundle budget enforced by `pnpm run size`.
- Keep throughput enforced by `pnpm run bench`.
