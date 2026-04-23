/**
 * Map of feature actions to the roles allowed to perform them.
 *
 * Keys are action names (e.g. `create`, `approve`, `export`),
 * values are arrays of role identifiers.
 *
 * @example
 * ```yaml
 * permissions:
 *   create:  [agent, manager]
 *   approve: [manager, risk-analyst]
 *   view:    [agent, manager, risk-analyst, auditor]
 *   edit:    [manager]
 *   export:  [manager, auditor]
 * ```
 */
export type PermissionMap = Record<string, string[]>;
