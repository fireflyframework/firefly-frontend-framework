# @fireflyframework/generators

Generator package for Firefly code generation.

## Current status

This package is still scaffold-level. The current public API exports a placeholder `generators()` function from `src/lib/generators.ts`.

Do not treat this package as a stable generator API until actual generator entry points are implemented and documented.

## Expected documentation before stabilization

- Available generators and command names.
- Input schema, probably based on `@fireflyframework/schema-types`.
- Generated file layout.
- Idempotency and overwrite rules.
- Relationship with the agentic skills repository.

## Commands

```bash
nx build generators
```
