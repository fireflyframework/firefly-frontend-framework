import type { DsComponentContract } from '../contract.types';

/**
 * Contract of the `ff-banner` primitive.
 *
 * Full-width notification bar with an optional action button (rendered when
 * `actionLabel` is non-empty) and a dismiss button (when `dismissible`).
 * The consumer positions the banner and manages its lifecycle.
 */
export const BannerContract: DsComponentContract = {
  selector: 'ff-banner',
  category: 'primitive',
  inputs: {
    message: { type: 'string', required: false, default: "''" },
    type: {
      type: "'success' | 'error' | 'warning' | 'info'",
      required: false,
      default: "'info'",
    },
    icon: { type: 'string', required: false, default: "''" },
    actionLabel: { type: 'string', required: false, default: "''" },
    dismissible: { type: 'boolean', required: false, default: 'true' },
  },
  outputs: {
    dismissed: { type: 'void' },
    actionClicked: { type: 'void' },
  },
  behavior: {
    hostAttributeOwnership: ['class', 'role'],
    aria: ['host has role="alert"'],
  },
};
