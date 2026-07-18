import type { DsComponentContract } from '../contract.types';

/**
 * Contract of the `ff-badge` primitive.
 *
 * Inline status label with semantic color variants. Text content is
 * projected through the default slot.
 */
export const BadgeContract: DsComponentContract = {
  selector: 'ff-badge',
  category: 'primitive',
  inputs: {
    variant: {
      type: "'success' | 'warning' | 'error' | 'info' | 'neutral'",
      required: false,
      default: "'neutral'",
    },
    size: { type: "'sm' | 'md'", required: false, default: "'md'" },
  },
  outputs: {},
  behavior: {
    contentSlots: ['default'],
    hostAttributeOwnership: ['class'],
  },
};
