/**
 * Target definition for a navigation action.
 *
 * @example
 * ```yaml
 * rowClick: { goto: detail, params: { id: ':entityId' } }
 * ```
 */
export interface NavigationTarget {
  /** Screen identifier to navigate to. */
  goto: string;

  /** Route parameters — values prefixed with `:` are resolved at runtime. */
  params?: Record<string, string>;
}

/**
 * Named navigation action with a UI label and target.
 *
 * @example
 * ```yaml
 * actions:
 *   - { label: 'Simulate', goto: apply, params: { productId: ':productId' } }
 * ```
 */
export interface NavigationAction {
  /** Display label for the action button/link. */
  label: string;

  /** Screen identifier to navigate to. */
  goto: string;

  /** Route parameters — values prefixed with `:` are resolved at runtime. */
  params?: Record<string, string>;
}

/**
 * Navigation configuration for a feature.
 *
 * Defines how users move between screens: list → detail, detail → sub-screens,
 * and the breadcrumb trail.
 *
 * @example
 * ```yaml
 * navigation:
 *   fromList:
 *     rowClick: { goto: detail, params: { id: ':entityId' } }
 *   fromDetail:
 *     actions:
 *       - { label: 'Simulate', goto: apply, params: { productId: ':productId' } }
 *   breadcrumb: [list, detail]
 * ```
 */
export interface NavigationConfig {
  /** Navigation triggers from the list screen. */
  fromList?: {
    /** Action when a table row is clicked. */
    rowClick?: NavigationTarget;
  };

  /** Navigation triggers from the detail screen. */
  fromDetail?: {
    /** Available navigation actions on the detail view. */
    actions?: NavigationAction[];
  };

  /** Ordered breadcrumb trail of screen identifiers. */
  breadcrumb?: string[];
}
