# Changelog

All notable changes to `@fireflyframework/utils` will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.2.0] - 2026-07-17

### Added
- New entry point `@fireflyframework/utils/json`: `tryParseJson()`, `validateJson()`, `stableStringify()`, `ParseJsonResult` type
- New entry point `@fireflyframework/utils/version`: `parseVersion()`, `bumpVersion()`, `nextVersion()`, `ParsedVersion` and `BumpLevel` types
- New entry point `@fireflyframework/utils/io`: `downloadBlob()`
- New entry point `@fireflyframework/utils/transformations`: `readPath()`, `applyTransformation()`, `FieldTransformation` type
- New entry point `@fireflyframework/utils/constants`: `TIME_RANGE_OPTIONS`, `TIME_RANGE_OFFSETS_MS`, `TimeRange` and `TimeRangeOption` types
- New entry point `@fireflyframework/utils/math`: `clampPercent()`, `ratioToPercent()`
- New entry point `@fireflyframework/utils/storage`: `readStorage()`, `writeStorage()`, `readLocalStorage()`, `writeLocalStorage()`, `StorageKind` type
- New entry point `@fireflyframework/utils/user-agent`: `parseUserAgent()`, `ParsedUserAgent` type
- Formatting module: `formatBytes()`, `formatDateTime()`, `formatElapsed()`
- String module: `humanizeLabel()`, `humanizeColumnName()`, `initialsFrom()` with `InitialsSource` type
- Object module: `pickNonEmpty()`
- Array module: `groupAndCount()` with `GroupedCount` and `GroupAndCountOptions` types, `sortByPriorityDesc()`

## [0.1.0] - 2026-05-08

### Added
- Formatting module: `formatCurrency()`, `formatDate()`, `formatPercentage()`, `formatIBAN()`, `formatNIF()`
- Barrel export at `@fireflyframework/utils/formatting`

## [0.0.1] - 2026-04-22

### Added
- Initial release of `@fireflyframework/utils`
- Array utilities: `chunk`, `unique`, `groupBy`, `flatten`, `sortBy`
- Object utilities: `pick`, `omit`, `deepMerge`, `deepClone`, `isEqual`
- String utilities: `capitalize`, `slugify`, `truncate`, `camelToKebab`, `kebabToCamel`
- Type guards: `isString`, `isNumber`, `isObject`, `isArray`, `isNullish`, `isDefined`

[Unreleased]: https://github.com/fireflyframework/firefly-frontend-framework/compare/utils@0.2.0...HEAD
[0.2.0]: https://github.com/fireflyframework/firefly-frontend-framework/compare/utils@0.1.0...utils@0.2.0
[0.1.0]: https://github.com/fireflyframework/firefly-frontend-framework/compare/utils@0.0.1...utils@0.1.0
[0.0.1]: https://github.com/fireflyframework/firefly-frontend-framework/releases/tag/utils@0.0.1
