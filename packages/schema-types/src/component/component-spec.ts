/**
 * Input property definition for a Design System component.
 *
 * @example
 * ```yaml
 * inputs:
 *   - { name: label, type: string, required: true }
 *   - { name: disabled, type: boolean, default: false }
 * ```
 */
export interface ComponentInput {
  /** Input property name. */
  name: string;

  /** TypeScript type as a string (e.g. `'string'`, `'boolean'`, `'MyEnum'`). */
  type: string;

  /** Whether the input is mandatory. */
  required?: boolean;

  /** Default value when the input is not provided. */
  default?: unknown;
}

/**
 * Output event definition for a Design System component.
 *
 * @example
 * ```yaml
 * outputs:
 *   - { name: clicked, type: MouseEvent }
 *   - { name: valueChange, type: string }
 * ```
 */
export interface ComponentOutput {
  /** Output event name. */
  name: string;

  /** TypeScript type of the emitted event payload. */
  type: string;
}

/**
 * Accessibility requirements for a Design System component.
 *
 * @example
 * ```yaml
 * a11y:
 *   role: button
 *   ariaLabels: [aria-label, aria-describedby]
 *   keyboardNav: true
 * ```
 */
export interface A11yRequirements {
  /** WAI-ARIA role attribute. */
  role?: string;

  /** Required ARIA label attributes. */
  ariaLabels?: string[];

  /** Whether the component must support keyboard navigation. */
  keyboardNav?: boolean;
}

/**
 * Specification of a Design System component.
 *
 * Defines the public API, composition model, theming tokens,
 * and accessibility contract of a reusable UI component.
 *
 * @example
 * ```yaml
 * name: FfButton
 * selector: ff-button
 * category: primitive
 * inputs:
 *   - { name: label, type: string, required: true }
 *   - { name: variant, type: "'primary' | 'secondary'", default: primary }
 * outputs:
 *   - { name: clicked, type: MouseEvent }
 * a11y:
 *   role: button
 *   keyboardNav: true
 * ```
 */
export interface ComponentSpec {
  /** Component class name (PascalCase, e.g. `FfButton`). */
  name: string;

  /** Angular selector (kebab-case, e.g. `ff-button`). */
  selector: string;

  /** Design System hierarchy level. */
  category: 'primitive' | 'pattern' | 'layout';

  /** Input properties. */
  inputs: ComponentInput[];

  /** Output events. */
  outputs: ComponentOutput[];

  /** Named content projection slots. */
  slots?: string[];

  /** CSS custom property tokens consumed by this component. */
  cssTokens?: string[];

  /** Other components this one composes internally. */
  composes?: string[];

  /** Accessibility requirements. */
  a11y?: A11yRequirements;
}
