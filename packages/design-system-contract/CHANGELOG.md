# Changelog

All notable changes to `@fireflyframework/design-system-contract` will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.2.0] - 2026-07-21

### Added
- `DataTableContract` and `ListContract`: contracts for the `ff-data-table` and `ff-list` patterns, including their `keyboard`/`aria` behavior clauses (`ff-list`'s full listbox keyboard model, page-size control, `compareWith`-driven selection/expansion)
- 10 public types shared by `ff-data-table` and `ff-list`: `FfSortDirection`, `FfSelectionMode`, `FfDataTableHeader`, `FfRowEvent`, `FfSortChangeEvent`, `FfSelectionChangeEvent`, `FfExpandChangeEvent`, `FfPaginationState`, `FfPageChangeEvent`, `FfNoResultsConfig`
- `DialogContainerContract`, `MenuButtonContract` and `ToastContainerContract`: pattern contracts added to `ALL_CONTRACTS` (the aggregate now covers 23 primitives + 6 patterns)
- `ariaLabel` input added to `CheckboxContract`

### Changed
- `ButtonContract`: new `color` input for the semantic palette; `variant` narrowed to the style axis (`solid`/`outline`/`ghost`, with legacy `primary`/`secondary` still accepted) and its default changed from `primary` to `solid`
- `BadgeContract`: new `color`, `dot`, `shape` and `maxWidth` inputs; `size` gains `xs`; host-attribute ownership gains `title` (the automatic overflow tooltip)
- `InputContract`: `type` gains `search`; new `debounceTime`, `labelType` and `search` clauses; content slots declared for the prefix/suffix affixes
- `SelectContract`: reshaped for the portaled-overlay implementation — multi-select (`multiple`, `values`), `bindLabel`/`bindValue`, option and label template slots
- `ToastContract`: reshaped as a presentational container; the required-provider clause is dropped

## [0.1.0] - 2026-07-18

### Added
- First real release of the design-system decoupling contract (replaces the scaffold stub)
- Contract model: `DsComponentContract`, `DsInputContract`, `DsOutputContract`, `DsBehaviorContract`, `DsTier`
- 24 typed component contracts (23 primitives + the `ff-tab-bar` pattern) with behavior clauses: projection slots, required providers, host-attribute ownership, keyboard and ARIA guarantees
- `REQUIRED_DESIGN_TOKENS`: the 135 `--ff-*` CSS custom properties every implementation must define
- `verifyDsContracts()` structural verifier enforcing the composition hierarchy (primitives compose nothing; patterns compose only primitives; layouts never compose layouts) plus selector rules
- `ALL_CONTRACTS` aggregate export

### Notes
- Pure TypeScript — no Angular imports; usable from any tooling (CI checks, generators, third-party DS implementations)
