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
import { chunk, unique, groupBy, groupAndCount, sortByPriorityDesc } from '@fireflyframework/utils/array';
import { pick, omit, deepMerge } from '@fireflyframework/utils/object';
import { capitalize, slugify, truncate } from '@fireflyframework/utils/string';
import { isString, isNumber, isDefined } from '@fireflyframework/utils/type-guards';
import { formatCurrency, formatDate, formatElapsed, formatIBAN, formatNIF } from '@fireflyframework/utils/formatting';
import { tryParseJson, validateJson } from '@fireflyframework/utils/json';
import { parseVersion, bumpVersion, nextVersion } from '@fireflyframework/utils/version';
import { downloadBlob } from '@fireflyframework/utils/io';
import { readPath, applyTransformation } from '@fireflyframework/utils/transformations';
import { TIME_RANGE_OPTIONS, TIME_RANGE_OFFSETS_MS } from '@fireflyframework/utils/constants';
```

| Module | Key functions |
|--------|--------------|
| `array` | `chunk`, `unique`, `groupBy`, `groupAndCount`, `flatten`, `sortBy`, `sortByPriorityDesc` |
| `object` | `pick`, `omit`, `deepMerge`, `deepClone`, `isEqual` |
| `string` | `capitalize`, `slugify`, `truncate`, `camelToKebab`, `kebabToCamel` |
| `type-guards` | `isString`, `isNumber`, `isObject`, `isArray`, `isNullish`, `isDefined` |
| `formatting` | `formatCurrency`, `formatDate`, `formatElapsed`, `formatPercentage`, `formatIBAN`, `formatNIF` |
| `json` | `tryParseJson`, `validateJson` |
| `version` | `parseVersion`, `bumpVersion`, `nextVersion` (lenient 1–3 component parsing) |
| `io` | `downloadBlob` (browser-only — touches `document`) |
| `transformations` | `readPath`, `applyTransformation` (`UPPERCASE`/`LOWERCASE`/`TRIM`/`DATE_FORMAT`) |
| `constants` | `TIME_RANGE_OPTIONS`, `TIME_RANGE_OFFSETS_MS` (`24h/7d/30d/All` lexicon) |

## License

Private — Firefly Framework
