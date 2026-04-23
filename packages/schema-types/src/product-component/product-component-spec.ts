import type { ComponentInput, ComponentOutput } from '../component';

/**
 * Specification of a product-level component.
 *
 * Unlike a Design System `ComponentSpec`, a product component is
 * feature-specific and lives inside the generated product code.
 * It may consume framework services and is tied to a single feature.
 *
 * @example
 * ```yaml
 * # product-components/loan-summary-card.yaml
 * name: LoanSummaryCard
 * selector: app-loan-summary-card
 * feature: loan-applications
 * layer: ui
 * inputs:
 *   - { name: loan, type: LoanApplication, required: true }
 * outputs:
 *   - { name: selected, type: string }
 * usesServices: [LoanService, CurrencyPipe]
 * ```
 */
export interface ProductComponentSpec {
  /** Component class name (PascalCase). */
  name: string;

  /** Angular selector (kebab-case). */
  selector: string;

  /** Feature this component belongs to (kebab-case feature id). */
  feature: string;

  /** Architectural layer within the feature. */
  layer: 'ui' | 'services';

  /** Input properties (reuses the Design System input definition). */
  inputs?: ComponentInput[];

  /** Output events (reuses the Design System output definition). */
  outputs?: ComponentOutput[];

  /** Framework or feature services consumed by this component. */
  usesServices?: string[];
}
