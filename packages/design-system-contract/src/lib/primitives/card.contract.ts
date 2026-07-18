import type { DsComponentContract } from '../contract.types';

/**
 * Contract of the `ff-card` primitive.
 *
 * Composable container with optional header and footer zones plus a default
 * body slot, and four shadow elevation levels.
 */
export const CardContract: DsComponentContract = {
  selector: 'ff-card',
  category: 'primitive',
  inputs: {
    shadow: {
      type: "'none' | 'sm' | 'md' | 'lg'",
      required: false,
      default: "'sm'",
    },
  },
  outputs: {},
  behavior: {
    contentSlots: ['[ff-card-header]', 'default', '[ff-card-footer]'],
    hostAttributeOwnership: ['class'],
  },
};
