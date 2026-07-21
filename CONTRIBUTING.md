# Contributing

TanStack Highlight is intentionally narrow: small, synchronous highlighting for valid code in blogs and documentation.

Before adding behavior, confirm that it solves a real docs example without requiring a general grammar runtime. Parser fixes should include a focused regression test and must preserve the size and throughput budgets.

```sh
pnpm install
pnpm run verify
```

Language definitions live in `src/languages`. Shared context-aware scanners live in `src/internal`. Keep imports one-way so individual language entry points stay isolated.

Use GitHub Discussions for implementation questions and open an issue for confirmed bugs or scoped feature proposals.
