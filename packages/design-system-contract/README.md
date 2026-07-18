# @fireflyframework/design-system-contract

The **decoupling contract** of the Firefly Design System: a pure-TypeScript, framework-agnostic declaration of what any compatible DS implementation must provide — selectors, typed inputs/outputs, composition tier, behavior clauses and required design tokens.

Products and tooling program against this contract (selectors `ff-*`, tokens `--ff-*`), never against a concrete implementation. Swapping the implementation is then an npm-alias change in the consumer:

```jsonc
// package.json of a product — zero source changes
"dependencies": {
  "@fireflyframework/design-system": "npm:@acme/own-design-system@^1.0.0"
}
```

## Install

```bash
npm install @fireflyframework/design-system-contract
```

Pure TS — no Angular imports; usable from CI checks, generators, docs tooling or third-party DS implementations.

## What's inside

- **`DsComponentContract`** model (`contract.types.ts`): selector, `category` (`primitive | pattern | layout`), `composes`, typed `inputs`/`outputs`, and **behavior clauses** (`DsBehaviorContract`): content-projection slots, required providers, host-attribute ownership, keyboard and ARIA guarantees.
- **24 contracts**: 23 primitives + the `ff-tab-bar` pattern — extracted from the reference implementation's real API.
- **`REQUIRED_DESIGN_TOKENS`**: the 135 `--ff-*` CSS custom properties every implementation must define.
- **`verifyDsContracts()`**: structural verifier enforcing the composition hierarchy — primitives compose nothing, patterns compose only primitives, layouts never compose layouts — plus selector prefix/uniqueness rules.
- **`ALL_CONTRACTS`**: the aggregate, ready for verification pipelines.

## Usage

```ts
import {
  ALL_CONTRACTS,
  ButtonContract,
  REQUIRED_DESIGN_TOKENS,
  verifyDsContracts,
} from '@fireflyframework/design-system-contract';

// CI gate: the contract set must be structurally coherent
const violations = verifyDsContracts(ALL_CONTRACTS);
if (violations.length > 0) {
  console.error(violations);
  process.exit(1);
}

// Tooling: introspect a component's public API
ButtonContract.inputs.variant; // { type: "'primary' | 'secondary' | 'outline' | 'ghost'", required: false, default: "'primary'" }
```

## Scope and roadmap

This version covers the **static half** of the contract (API + structural rules + token names). On the roadmap (see the initiative backlog): a CLI that verifies an *installed* implementation against these contracts, and an executable behavior test-kit any implementation must pass.

## Further reading

- Reference implementation: `@fireflyframework/design-system`.
- Architecture and migration strategy: [`docs/firefly-design-system-catalog-and-flydocs-migration.md`](../../docs/firefly-design-system-catalog-and-flydocs-migration.md).
- Changelog: [CHANGELOG.md](./CHANGELOG.md).
