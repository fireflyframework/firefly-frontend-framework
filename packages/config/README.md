# @fireflyframework/config

Shared configuration package for Firefly framework tooling.

## Current status

This package is still scaffold-level. The current public API exports a placeholder `config()` function from `src/lib/config.ts`.

Do not treat this package as a stable consumer-facing API until its purpose and contract are finalized.

## Expected documentation before stabilization

- What configuration is centralized here.
- Which packages or products consume it.
- Whether it is runtime configuration, build configuration, lint/test configuration, or generator configuration.
- Migration path for consumers once the real API replaces the placeholder.

## Commands

```bash
nx build config
```
