# @fireflyframework/utils

Framework-agnostic utility functions for the Firefly Frontend Framework.

## Installation

```bash
npm install @fireflyframework/utils
```

No peer dependencies required. Works with any JavaScript/TypeScript project.

## Modules

Each module is a separate entry point (tree-shakeable):

```typescript
import { chunk, unique, groupBy } from '@fireflyframework/utils/array';
import { pick, omit, deepMerge } from '@fireflyframework/utils/object';
import { capitalize, slugify, truncate } from '@fireflyframework/utils/string';
import { isString, isNumber, isDefined } from '@fireflyframework/utils/type-guards';
import { formatCurrency, formatDate, formatIBAN, formatNIF } from '@fireflyframework/utils/formatting';
```

| Module | Key functions |
|--------|--------------|
| `array` | `chunk`, `unique`, `groupBy`, `flatten`, `sortBy` |
| `object` | `pick`, `omit`, `deepMerge`, `deepClone`, `isEqual` |
| `string` | `capitalize`, `slugify`, `truncate`, `camelToKebab`, `kebabToCamel` |
| `type-guards` | `isString`, `isNumber`, `isObject`, `isArray`, `isNullish`, `isDefined` |
| `formatting` | `formatCurrency`, `formatDate`, `formatPercentage`, `formatIBAN`, `formatNIF` |

## License

Private — Firefly Framework
