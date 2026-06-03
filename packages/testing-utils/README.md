# @fireflyframework/testing-utils

Testing utilities package for Firefly projects.

## Current status

This package is still scaffold-level. The current public API exports a placeholder Angular component, `TestingUtils`, with selector `lib-testing-utils`.

Do not treat this package as a stable testing API until actual helpers are implemented and documented.

## Expected documentation before stabilization

- Test helpers for Angular components, providers, guards, interceptors, and transport adapters.
- Mock builders for `@fireflyframework/core` services.
- Recommended Vitest and Angular TestBed setup.
- MSW or API mocking conventions if owned here.

## Commands

```bash
nx build testing-utils
nx lint testing-utils
```
