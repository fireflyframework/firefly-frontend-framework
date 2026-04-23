/**
 * Role-based visibility configuration for UI sections.
 *
 * Top-level keys are section groups (e.g. `tabs`, `panels`),
 * each containing a map of item names to the roles that can see them.
 *
 * @example
 * ```yaml
 * visibility:
 *   tabs:
 *     leasing:    [agent, manager]
 *     operations: [agent, manager, auditor]
 *     regions:    [admin, region-admin]
 *     users:      [admin]
 *     catalogs:   [admin]
 *     branding:   [admin]
 * ```
 */
export type VisibilityConfig = Record<string, Record<string, string[]>>;
