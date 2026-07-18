import type { DsComponentContract } from '../contract.types';

/**
 * Contract of the `ff-button` primitive.
 *
 * Action button with four visual variants, three sizes and
 * disabled/loading states. Label is projected through the default slot;
 * optional prefix/suffix content (e.g. icons) through attribute slots.
 * `clicked` is only emitted when the button is neither disabled nor loading.
 */
export const ButtonContract: DsComponentContract = {
  selector: 'ff-button',
  category: 'primitive',
  inputs: {
    variant: {
      type: "'primary' | 'secondary' | 'outline' | 'ghost'",
      required: false,
      default: "'primary'",
    },
    size: { type: "'sm' | 'md' | 'lg'", required: false, default: "'md'" },
    disabled: { type: 'boolean', required: false, default: 'false' },
    loading: { type: 'boolean', required: false, default: 'false' },
  },
  outputs: {
    clicked: { type: 'void' },
  },
  behavior: {
    contentSlots: ['default', '[ffButtonPrefix]', '[ffButtonSuffix]'],
    hostAttributeOwnership: ['class'],
  },
};
