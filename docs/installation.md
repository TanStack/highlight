---
title: Installation
---

# Installation

Install the package with your package manager:

```sh
pnpm add @tanstack/highlight
```

```sh
npm install @tanstack/highlight
```

```sh
yarn add @tanstack/highlight
```

```sh
bun add @tanstack/highlight
```

## Requirements

- Node.js 18 or newer for server-side rendering and build tooling
- An ESM-capable runtime or bundler
- No framework peer dependency

The package is ESM-only and has no runtime dependencies.

## Entry points

| Import | Purpose | Pulls all languages? |
| --- | --- | --- |
| `@tanstack/highlight` | Convenient preconfigured API | Yes |
| `@tanstack/highlight/core` | Registry and renderer primitives | No |
| `@tanstack/highlight/languages/<name>` | One language definition | No |
| `@tanstack/highlight/languages` | Aggregate language exports | Relies on tree shaking |
| `@tanstack/highlight/theme` | Theme CSS helpers | No |
| `@tanstack/highlight/themes/<name>` | One theme object | No |
| `@tanstack/highlight/markdown` | Fence metadata and HAST helpers | No |
| `@tanstack/highlight/remark` | Remark adapter | No |
| `@tanstack/highlight/rehype` | Rehype adapter | No |
| `@tanstack/highlight/react` | React-oriented data helper | No React dependency |
| `@tanstack/highlight/octane` | Octane component and MDX helpers | No Octane dependency |

## Recommended import style

Documentation sites should normally use the selective core:

```ts
import { createHighlighter } from '@tanstack/highlight/core'
import { css } from '@tanstack/highlight/languages/css'
import { tsx } from '@tanstack/highlight/languages/tsx'

export const highlighter = createHighlighter({
  languages: [css, tsx],
})
```

The root entry is useful for prototypes, server-only scripts, or sites where the roughly 8 KB gzip all-language build is acceptable:

```ts
import { highlight } from '@tanstack/highlight'
```

## TypeScript

Declarations ship with every public entry. No `@types` package is required.

## Content Security Policy

The renderer does not inject scripts or inline color styles. Theme CSS can be generated at build time and placed in your normal stylesheet. Code text and decoration attribute values are escaped before rendering.
