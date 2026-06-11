# Firefly Frontend Framework

Nx monorepo for the reusable frontend packages used by Firefly Angular products.

This repository publishes packages under `@fireflyframework/*` and contains the framework code consumed by `firefly-showcase`, `firefly-product-template`, and product repositories.

For ecosystem-level onboarding, see `../firefly-frontend-playbook`.

## Stack

- Angular 21
- Nx 22
- TypeScript 5.9
- Vitest / Analog test tooling
- Playwright for playground e2e
- GitHub Packages for published packages

## Packages

| Package | Role | Docs |
|---|---|---|
| `@fireflyframework/core` | Angular infrastructure: auth, session, transports, permissions, i18n, files, security, notifications, event bus, and more | `packages/core/README.md` |
| `@fireflyframework/design-system` | Standalone UI primitives and design tokens | `packages/design-system/README.md` |
| `@fireflyframework/schema-types` | TypeScript contracts for Firefly DSL schemas | `packages/schema-types/README.md` |
| `@fireflyframework/utils` | Framework-agnostic utility functions | `packages/utils/README.md` |
| `@fireflyframework/config` | Shared configuration package; status still being clarified | `packages/config/README.md` |
| `@fireflyframework/design-system-contract` | Design-system contract package; status still being clarified | `packages/design-system-contract/README.md` |
| `@fireflyframework/elements` | Elements package; status still being clarified | `packages/elements/README.md` |
| `@fireflyframework/generators` | Generator package; status still being clarified | `packages/generators/README.md` |
| `@fireflyframework/testing-utils` | Testing utilities package; status still being clarified | `packages/testing-utils/README.md` |

## Apps

| App | Role |
|---|---|
| `apps/playground` | Nx playground application |
| `apps/playground-e2e` | Playwright e2e tests for the playground |

`firefly-showcase` is a separate sibling repository and currently acts as the richer integration catalog for framework modules and design-system primitives.

## Install

```bash
pnpm install
```

If you consume published Firefly packages from another project, configure GitHub Packages:

```text
@fireflyframework:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${NODE_AUTH_TOKEN}
```

`NODE_AUTH_TOKEN` must have access to the Firefly packages.

## Common commands

```bash
pnpm nx graph
pnpm nx build core
pnpm nx build design-system
pnpm nx build schema-types
pnpm nx build utils
pnpm nx run-many -t build
pnpm nx run-many -t lint
```

Some packages contain `.spec.ts` files even when their `project.json` does not expose a standard `test` target yet. Check the package target before treating a test command as official.

## Release

`nx.json` configures independent releases for framework packages. The release pre-version command is:

```bash
pnpm dlx nx run-many -t build
```

Published package manifests are updated from `dist/{projectRoot}`.

## Documentation

Start with:

- `../firefly-frontend-playbook/getting-started/onboarding.md`
- `../firefly-frontend-playbook/architecture/project-map.md`
- `../firefly-frontend-playbook/reference/framework-packages.md`

When changing a public package API, update the package README in the same PR. When changing how projects relate to each other, update `firefly-frontend-playbook`.
