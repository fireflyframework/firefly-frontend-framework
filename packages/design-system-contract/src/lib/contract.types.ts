/**
 * @fileoverview Type model of the Firefly design-system contract.
 *
 * The contract describes the STABLE public API of every design-system
 * component (selector, typed inputs/outputs, compositional tier, composition
 * edges, and behavioral clauses) independently of any implementation.
 * Products program against these contracts; implementations (Angular today,
 * anything tomorrow) must satisfy them. This package is pure TypeScript and
 * has no dependency on Angular or on the reference implementation.
 */

/**
 * Compositional tier of a design-system component.
 *
 * - `'primitive'` — an atom. Never composes other design-system components.
 * - `'pattern'` — a molecule. Composes primitives ONLY.
 * - `'layout'` — a page-level composition. May compose primitives and
 *   patterns, but never other layouts.
 */
export type DsTier = 'primitive' | 'pattern' | 'layout';

/**
 * Contract of a single component input.
 *
 * The `type` is expressed as a self-contained TypeScript type string
 * (literal unions and structural object types are spelled out inline, e.g.
 * `"'sm' | 'md' | 'lg'"` or
 * `"{ label: string; value: string; disabled?: boolean }[]"`) so the contract
 * is readable without resolving implementation type aliases.
 */
export interface DsInputContract {
  /** TypeScript type of the input, as a self-contained type expression string. */
  readonly type: string;
  /** `true` when the implementation declares the input as required (no default). */
  readonly required: boolean;
  /**
   * Default value as a TypeScript expression string (e.g. `"'primary'"`,
   * `'false'`, `'3'`, `'[]'`, `"'undefined'"`). Omitted for required inputs.
   */
  readonly default?: string;
}

/**
 * Contract of a single component output (event emitter).
 */
export interface DsOutputContract {
  /** TypeScript type of the emitted payload (e.g. `'void'`, `'string'`, `'boolean'`). */
  readonly type: string;
}

/**
 * Behavioral clauses guaranteed by a component beyond its inputs/outputs.
 *
 * Every listed clause is a promise the implementation must keep; products may
 * rely on them without inspecting implementation code.
 */
export interface DsBehaviorContract {
  /**
   * Content-projection selectors the component supports, e.g.
   * `'[ff-panel-heading]'`. `'default'` denotes the unselected
   * `<ng-content>`-style default slot.
   */
  readonly contentSlots?: readonly string[];
  /**
   * Providers the consuming application must configure for the component to
   * work, e.g. `'provideFfIcons'`.
   */
  readonly requiredProviders?: readonly string[];
  /**
   * Host-element attributes the component OWNS (sets and controls itself).
   * Consumers must not override them, e.g. `'role'`, `'class'`.
   */
  readonly hostAttributeOwnership?: readonly string[];
  /**
   * Keyboard-interaction guarantees, e.g. `'ArrowRight moves focus to the
   * next enabled tab (wrapping)'`.
   */
  readonly keyboard?: readonly string[];
  /**
   * ARIA roles/attributes the component guarantees, e.g.
   * `'role="progressbar" with aria-valuemin/aria-valuemax/aria-valuenow'`.
   */
  readonly aria?: readonly string[];
}

/**
 * Public contract of one design-system component.
 *
 * This is the unit products program against: an implementation is
 * contract-compliant when, for the given `selector`, it exposes exactly these
 * inputs/outputs and honors the behavioral clauses.
 */
export interface DsComponentContract {
  /** Element selector, e.g. `'ff-button'`. Must start with the `ff-` prefix. */
  readonly selector: string;
  /** Compositional tier of the component. */
  readonly category: DsTier;
  /**
   * Selectors of the design-system components this component composes.
   * REQUIRED (non-empty) for `pattern`/`layout` tiers; FORBIDDEN for
   * `primitive`. Patterns may only compose primitives; layouts may compose
   * primitives and patterns but never other layouts.
   */
  readonly composes?: readonly string[];
  /** Typed inputs keyed by input name. */
  readonly inputs: Readonly<Record<string, DsInputContract>>;
  /** Typed outputs keyed by output name. */
  readonly outputs: Readonly<Record<string, DsOutputContract>>;
  /** Optional behavioral clauses guaranteed by the component. */
  readonly behavior?: DsBehaviorContract;
}
