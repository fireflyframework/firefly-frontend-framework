/**
 * @fileoverview Global CSS custom properties every contract-compliant
 * implementation of the Firefly design system must define on `:root`.
 *
 * Extracted verbatim from the reference implementation's token stylesheets
 * (`packages/design-system/src/lib/tokens/`): `_colors.scss` (palettes and
 * semantic aliases), `_spacing.scss`, `_radius.scss`, `_typography.scss`
 * and `_shadows.scss`. Values are implementation-defined (theming); the
 * NAMES are the contract.
 */

/**
 * Names of the global `--ff-*` CSS custom properties an implementation must
 * declare on `:root`.
 */
export const REQUIRED_DESIGN_TOKENS = [
  // ---- Colors: primary palette ----
  '--ff-color-primary-50',
  '--ff-color-primary-100',
  '--ff-color-primary-200',
  '--ff-color-primary-300',
  '--ff-color-primary-400',
  '--ff-color-primary-500',
  '--ff-color-primary-600',
  '--ff-color-primary-700',
  '--ff-color-primary-800',
  '--ff-color-primary-900',
  // ---- Colors: secondary palette ----
  '--ff-color-secondary-50',
  '--ff-color-secondary-100',
  '--ff-color-secondary-200',
  '--ff-color-secondary-300',
  '--ff-color-secondary-400',
  '--ff-color-secondary-500',
  '--ff-color-secondary-600',
  '--ff-color-secondary-700',
  '--ff-color-secondary-800',
  '--ff-color-secondary-900',
  // ---- Colors: tertiary palette ----
  '--ff-color-tertiary-50',
  '--ff-color-tertiary-100',
  '--ff-color-tertiary-200',
  '--ff-color-tertiary-300',
  '--ff-color-tertiary-400',
  '--ff-color-tertiary-500',
  '--ff-color-tertiary-600',
  '--ff-color-tertiary-700',
  '--ff-color-tertiary-800',
  '--ff-color-tertiary-900',
  // ---- Colors: neutral palette ----
  '--ff-color-neutral-50',
  '--ff-color-neutral-100',
  '--ff-color-neutral-200',
  '--ff-color-neutral-300',
  '--ff-color-neutral-400',
  '--ff-color-neutral-500',
  '--ff-color-neutral-600',
  '--ff-color-neutral-700',
  '--ff-color-neutral-800',
  '--ff-color-neutral-900',
  // ---- Colors: error palette ----
  '--ff-color-error-100',
  '--ff-color-error-200',
  '--ff-color-error-300',
  '--ff-color-error-400',
  '--ff-color-error-500',
  '--ff-color-error-600',
  '--ff-color-error-700',
  '--ff-color-error-800',
  '--ff-color-error-900',
  // ---- Colors: success palette ----
  '--ff-color-success-100',
  '--ff-color-success-200',
  '--ff-color-success-300',
  '--ff-color-success-400',
  '--ff-color-success-500',
  '--ff-color-success-600',
  '--ff-color-success-700',
  '--ff-color-success-800',
  '--ff-color-success-900',
  // ---- Colors: warning palette ----
  '--ff-color-warning-100',
  '--ff-color-warning-200',
  '--ff-color-warning-300',
  '--ff-color-warning-400',
  '--ff-color-warning-500',
  '--ff-color-warning-600',
  '--ff-color-warning-700',
  '--ff-color-warning-800',
  '--ff-color-warning-900',
  // ---- Colors: info palette ----
  '--ff-color-info-100',
  '--ff-color-info-200',
  '--ff-color-info-300',
  '--ff-color-info-400',
  '--ff-color-info-500',
  '--ff-color-info-600',
  '--ff-color-info-700',
  '--ff-color-info-800',
  '--ff-color-info-900',
  // ---- Colors: semantic base aliases ----
  '--ff-color-success',
  '--ff-color-success-light',
  '--ff-color-warning',
  '--ff-color-warning-light',
  '--ff-color-error',
  '--ff-color-error-light',
  '--ff-color-info',
  '--ff-color-info-light',
  // ---- Colors: surface & background ----
  '--ff-color-surface',
  '--ff-color-background',
  '--ff-color-on-primary',
  '--ff-color-on-surface',
  '--ff-color-on-surface-variant',
  // ---- Colors: border ----
  '--ff-color-border',
  '--ff-color-border-focus',
  // ---- Colors: overlay ----
  '--ff-color-overlay',
  // ---- Colors: semantic text ----
  '--ff-text-primary',
  '--ff-text-secondary',
  '--ff-text-muted',
  '--ff-text-disabled',
  // ---- Colors: semantic backgrounds ----
  '--ff-bg-primary',
  '--ff-bg-secondary',
  '--ff-bg-tertiary',
  // ---- Spacing ----
  '--ff-spacing-xs',
  '--ff-spacing-sm',
  '--ff-spacing-md',
  '--ff-spacing-lg',
  '--ff-spacing-xl',
  // ---- Border radius ----
  '--ff-radius-sm',
  '--ff-radius-md',
  '--ff-radius-lg',
  '--ff-radius-full',
  // ---- Typography: font families ----
  '--ff-font-family',
  '--ff-font-family-mono',
  // ---- Typography: font sizes ----
  '--ff-font-size-2xs',
  '--ff-font-size-xs',
  '--ff-font-size-sm',
  '--ff-font-size-md',
  '--ff-font-size-lg',
  '--ff-font-size-xl',
  '--ff-font-size-2xl',
  '--ff-font-size-3xl',
  '--ff-font-size-4xl',
  '--ff-font-size-5xl',
  // ---- Typography: font weights ----
  '--ff-font-weight-normal',
  '--ff-font-weight-medium',
  '--ff-font-weight-semibold',
  '--ff-font-weight-bold',
  // ---- Typography: line heights ----
  '--ff-line-height-tight',
  '--ff-line-height-snug',
  '--ff-line-height-normal',
  '--ff-line-height-relaxed',
  // ---- Typography: letter spacing ----
  '--ff-letter-spacing-tight',
  '--ff-letter-spacing-normal',
  '--ff-letter-spacing-wide',
  '--ff-letter-spacing-wider',
  // ---- Shadows / elevation ----
  '--ff-elevation-sm',
  '--ff-elevation-md',
  '--ff-elevation-lg',
] as const;

/** One of the required global design-token names. */
export type RequiredDesignToken = (typeof REQUIRED_DESIGN_TOKENS)[number];
