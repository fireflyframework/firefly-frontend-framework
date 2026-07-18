import type { DsComponentContract } from '../contract.types';

/**
 * Contract of the `ff-loader` primitive.
 *
 * Indeterminate loading indicator with a circular `spinner` mode and a
 * rectangular `skeleton` shimmer mode. Animations are CSS-only.
 */
export const LoaderContract: DsComponentContract = {
  selector: 'ff-loader',
  category: 'primitive',
  inputs: {
    variant: {
      type: "'spinner' | 'skeleton'",
      required: false,
      default: "'spinner'",
    },
    size: { type: "'sm' | 'md' | 'lg'", required: false, default: "'md'" },
  },
  outputs: {},
  behavior: {
    hostAttributeOwnership: ['class', 'role', 'aria-label'],
    aria: ['host has role="status"', 'host has aria-label="Loading"'],
  },
};
