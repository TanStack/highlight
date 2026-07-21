---
title: FAQ
---

# FAQ

## Is this a Shiki replacement?

Only for a narrower use case. TanStack Highlight is intended for blogs and docs with known languages. Shiki remains the better choice for TextMate accuracy, VS Code compatibility, or broad language coverage.

## Why not use Sugar High?

Sugar High is an excellent smaller option for JavaScript, TypeScript, and JSX. Use TanStack Highlight when you also need isolated non-JavaScript languages, class-based compact output, embedded markup regions, Markdown adapters, or character-range decorations.

## Can it run in the browser?

Yes. The core is synchronous and has no Node.js runtime dependency. Use selective language imports to keep the client bundle small.

## Should I highlight on the server or client?

Use SSR for the initial page so code is styled before hydration. Reuse the same highlighter client-side for navigations, live previews, or content loaded after hydration. See [SSR and Client Rendering](guides/ssr-and-client).

## Does it detect the language automatically?

No. Documentation pipelines already know the fence language, and detection would increase size, work, and ambiguity.

## Why are embedded script or style contents uncolored?

The delegated language is not registered. HTML does not import JavaScript or CSS automatically. See [Embedded Languages](guides/embedded-languages).

## Can I import a VS Code theme?

No. Themes are small semantic color objects. Create one directly or use a shipped isolated theme.

## Can CSS add font styles?

Yes. Token classes are stable, so bold, italic, opacity, backgrounds, and contrast adjustments belong in your stylesheet.

```css
.th-comment { font-style: italic; }
.th-keyword { font-weight: 600; }
```

## Does it sanitize arbitrary HTML?

It escapes code text and decoration values. It is not a general HTML sanitizer. Only inject HTML returned directly by the highlighter, and sanitize untrusted surrounding Markdown with your normal pipeline.

## Why is the API synchronous?

There is no grammar loading or WebAssembly initialization. Synchronous behavior keeps SSR, hydration, and Markdown transforms straightforward.

## Can I add a language?

Yes. Register a `LanguageDefinition` with a tokenizer that returns ordered semantic ranges. See [Custom Languages](guides/custom-languages).

## Are malformed programs guaranteed to highlight safely?

Source is escaped and preserved, but token quality targets valid documentation code. The project does not promise compiler recovery behavior or exhaustive malformed-input conformance.
