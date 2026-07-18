import type { DsComponentContract } from '../contract.types';

/**
 * Contract of the `ff-icon` primitive.
 *
 * Renders an SVG icon resolved by name from the registry configured via
 * `provideFfIcons`. Icons are single-path SVGs on a `0 0 24 24` viewBox
 * filled with `currentColor`. Unknown names render an empty SVG (and warn
 * once per name in dev mode).
 */
export const IconContract: DsComponentContract = {
  selector: 'ff-icon',
  category: 'primitive',
  inputs: {
    name: { type: 'string', required: true },
    size: { type: "'sm' | 'md' | 'lg'", required: false, default: "'md'" },
    label: {
      type: 'string | undefined',
      required: false,
      default: 'undefined',
    },
  },
  outputs: {},
  behavior: {
    requiredProviders: ['provideFfIcons'],
    hostAttributeOwnership: ['class'],
    aria: [
      'with label: SVG has role="img" and aria-label',
      'without label: SVG is decorative (aria-hidden="true")',
    ],
  },
};
