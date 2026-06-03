# @fireflyframework/utils

Framework-agnostic utility functions for Firefly projects.

The package has no Angular dependency and is split into subpath entry points for tree-shakeable imports.

## Installation

```bash
npm install @fireflyframework/utils
```

## Import style

There is no root barrel export. Import from subpaths:

```typescript
import { chunk, unique, groupBy } from '@fireflyframework/utils/array';
import { pick, omit, deepMerge } from '@fireflyframework/utils/object';
import { toKebabCase, toCamelCase, slugify } from '@fireflyframework/utils/string';
import { isString, isNumber, isDefined } from '@fireflyframework/utils/type-guards';
import { formatCurrency, formatDate } from '@fireflyframework/utils/formatting';
```

## Modules

| Entry point | Functions |
|---|---|
| `@fireflyframework/utils/array` | `groupBy`, `uniqueBy`, `unique`, `chunk`, `flatten`, `sortBy`, `partition`, `keyBy` |
| `@fireflyframework/utils/object` | `deepMerge`, `pick`, `omit`, `deepClone`, `diff`, `isEmpty` |
| `@fireflyframework/utils/string` | `toKebabCase`, `toCamelCase`, `toPascalCase`, `slugify`, `truncate`, `capitalize`, `escapeHtml` |
| `@fireflyframework/utils/type-guards` | `isNullOrUndefined`, `isString`, `isNumber`, `isObject`, `isNonEmpty`, `isDefined`, `isHttpError` |
| `@fireflyframework/utils/formatting` | `formatCurrency`, `formatDate`, `formatPercentage`, `formatIBAN`, `formatNIF` |

## Examples

```typescript
import { groupBy } from '@fireflyframework/utils/array';
import { toKebabCase } from '@fireflyframework/utils/string';
import { isDefined } from '@fireflyframework/utils/type-guards';

const byRole = groupBy(users, 'role');
const routeName = toKebabCase('LoanApplications');
const cleanValues = values.filter(isDefined);
```

```typescript
import { formatCurrency, formatDate } from '@fireflyframework/utils/formatting';

formatCurrency(1234.5, 'EUR', 'es');
formatDate('2026-05-27', 'short', 'es');
```

## Commands

```bash
nx build utils
nx test utils
```

## Notes

- `deepClone` uses native `structuredClone`.
- `formatPercentage` expects a fraction, so `0.15` renders as `15%`.
- `isObject` checks for plain object shape and excludes arrays.
