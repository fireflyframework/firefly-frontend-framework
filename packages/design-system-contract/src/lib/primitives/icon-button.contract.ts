import type { DsComponentContract } from '../contract.types';

/**
 * Contract of the `ff-icon-button` primitive.
 *
 * Compact square button for icon-only actions. The icon is projected through
 * the default slot; `tooltip` renders as a native `title` attribute.
 * `clicked` is only emitted when the button is not disabled.
 */
export const IconButtonContract: DsComponentContract = {
  selector: 'ff-icon-button',
  category: 'primitive',
  inputs: {
    icon: { type: 'string', required: false, default: "''" },
    tooltip: { type: 'string', required: false, default: "''" },
    disabled: { type: 'boolean', required: false, default: 'false' },
    size: { type: "'sm' | 'md' | 'lg'", required: false, default: "'md'" },
  },
  outputs: {
    clicked: { type: 'void' },
  },
  behavior: {
    contentSlots: ['default'],
    hostAttributeOwnership: ['class'],
  },
};
