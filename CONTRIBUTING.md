# Contributing

TanStack Highlight is intentionally narrow: small, synchronous highlighting for valid code in blogs and documentation.

Before adding behavior, confirm that it solves a real docs example without requiring a general grammar runtime. Parser fixes should include a focused regression test and must preserve the size and throughput budgets.

```sh
pnpm install
pnpm run verify
```

Language definitions live in `src/languages`. Shared context-aware scanners live in `src/internal`. Keep imports one-way so individual language entry points stay isolated.

Use GitHub Discussions for implementation questions and open an issue for confirmed bugs or scoped feature proposals.

## Releases

Include a changeset for package changes by running `pnpm changeset`. Use a patch for compatible fixes and performance improvements, a minor for new public APIs, and a major for breaking changes. Check the planned release with `pnpm run changeset:status`.

After a change reaches `main` and CI passes, the Release workflow opens or updates a version PR. That PR updates the package version, changelog, and bundled skill versions. The workflow dispatches CI on the generated branch. Merge the version PR after its checks pass to publish through GitHub Actions and npm trusted publishing.

The npm trusted publisher for `@tanstack/highlight` must allow publishing from GitHub repository `TanStack/highlight`, workflow `release.yml`, with no environment name. No npm token is stored in the repository. GitHub Actions must be allowed to create pull requests.

`release:version` and `release:publish` are automation commands. Release publishing runs after successful CI on `main`.
