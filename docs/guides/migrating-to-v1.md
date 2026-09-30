---
title: Migrating to v1
---

# Migrating to v1

Install `@tanstack/highlight@^1.0.0`. Existing 0.x version ranges do not select 1.x automatically. Update your lockfile and use the same Highlight version and language registrations for server and client rendering.

The 1.0 release preserves the 0.1 public entry points and synchronous APIs. No import or option changes are required. JavaScript and TypeScript property names that are also keywords now receive property styling. This can change token snapshots and colors without changing the source text.

If upgrading from an older 0.0 release, review the changelog for parser corrections, additional languages and adapters. Check rendered code blocks, copy text, line annotations and your theme selectors. `highlight()` preserves input; the view helpers `renderCodeBlockData()` and `renderCodeFence()` intentionally trim trailing whitespace before rendering and copying.

## Compatibility policy

Within 1.x, exported entry points, documented argument and return shapes, the meaning of existing `th-*` classes, and documented HTML/HAST wrapper structure remain compatible. Removal or incompatible changes require a major release. This includes language aliases and fallback behavior, UTF-16 decoration offsets, and the structured Markdown adapters.

Parser corrections are patch releases. They may change which existing semantic class is assigned to a token, or split and join adjacent token spans. Exact token boundaries, complete HTML snapshots and syntax coloring are not frozen. Source preservation and escaped output remain required.

New languages, themes and optional settings are minor releases. `HighlightTokenClass` is a closed public union, so adding or removing a token class requires a major release to preserve exhaustive TypeScript consumers. Changing an existing class's meaning also requires a major release.

Custom language definitions and theme selectors are trusted application configuration. The renderer escapes code and decoration attributes; it does not sanitize arbitrary CSS supplied to theme helpers. Synchronous highlighting is intended for documentation-sized blocks. Applications accepting unbounded input should enforce their own size limit or isolate work off the UI thread.

## Runtime support

The published ESM package supports Node.js 18 and newer and modern browsers. Build tooling can require a newer Node version than the published runtime package. CI imports every installed public entry point and runs representative and bounded malformed inputs on Node 18, 20, 22, 24 and 26. Browser and SSR users should share a registry and avoid re-highlighting server-rendered blocks during hydration.

Highlight is a documentation highlighter, not an incremental editor parser or a compiler grammar. These remain outside the 1.0 contract.
