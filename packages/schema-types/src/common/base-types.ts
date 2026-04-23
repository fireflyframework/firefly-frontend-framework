/**
 * Product archetype mode.
 *
 * - `platform` — standalone app with shell, routing and full layout.
 * - `embedded` — micro-frontend injectable into an external host.
 *
 * @example
 * ```yaml
 * archetype:
 *   mode: platform
 * ```
 */
export type Mode = 'platform' | 'embedded';

/**
 * UI pattern that determines the screen layout strategy.
 *
 * - `flow`  — multi-step wizard / guided flow.
 * - `panel` — single-panel detail or dashboard view.
 * - `form`  — data-entry form with validation.
 *
 * @example
 * ```yaml
 * archetype:
 *   mode: platform
 *   pattern: flow
 * ```
 */
export type Pattern = 'flow' | 'panel' | 'form';

/**
 * Top-level archetype configuration for a Firefly product.
 *
 * Combines the product {@link Mode} with an optional UI {@link Pattern}
 * to drive scaffold generation and module selection.
 *
 * @example
 * ```yaml
 * archetype:
 *   mode: embedded
 *   pattern: panel
 * ```
 */
export interface ArchetypeConfig {
  /** Product deployment mode. */
  mode: Mode;

  /** Default UI pattern applied to generated screens. */
  pattern?: Pattern;
}
