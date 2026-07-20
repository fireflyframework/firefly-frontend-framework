# Changelog

All notable changes to `@fireflyframework/design-system-contract` will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- `DataTableContract` and `ListContract`: contracts for the `ff-data-table` and `ff-list` patterns, including their `keyboard`/`aria` behavior clauses (`ff-list`'s full listbox keyboard model, page-size control, `compareWith`-driven selection/expansion)
- 10 public types shared by `ff-data-table` and `ff-list`: `FfSortDirection`, `FfSelectionMode`, `FfDataTableHeader`, `FfRowEvent`, `FfSortChangeEvent`, `FfSelectionChangeEvent`, `FfExpandChangeEvent`, `FfPaginationState`, `FfPageChangeEvent`, `FfNoResultsConfig`
- `ariaLabel` input added to `CheckboxContract`

### Changed
- Package version bumped to `0.2.0` (minor) for the two new pattern contracts and public types above

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
