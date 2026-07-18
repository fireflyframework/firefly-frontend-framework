import type { DsComponentContract } from '../contract.types';

/**
 * Contract of the `ff-empty-state` primitive.
 *
 * Centered placeholder for empty lists, empty search results or first-run
 * screens. Renders an optional projected icon above the required `title`,
 * an optional `description` below it, and a default slot underneath for
 * actions (e.g. a call-to-action button). Icons and actions are projected —
 * this primitive composes nothing.
 */
export const EmptyStateContract: DsComponentContract = {
  selector: 'ff-empty-state',
  category: 'primitive',
  inputs: {
    title: { type: 'string', required: true },
    description: {
      type: 'string | undefined',
      required: false,
      default: 'undefined',
    },
  },
  outputs: {},
  behavior: {
    contentSlots: ['[ff-empty-state-icon]', 'default'],
    hostAttributeOwnership: ['class'],
  },
};
