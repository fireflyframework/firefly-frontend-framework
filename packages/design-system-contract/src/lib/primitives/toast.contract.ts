import type { DsComponentContract } from '../contract.types';

/**
 * Contract of the `ff-toast` primitive.
 *
 * Compact inline notification. The consumer positions the toast and manages
 * its lifecycle; `dismissed` is emitted when the user clicks the dismiss
 * button (rendered only when `dismissible` is `true`).
 */
export const ToastContract: DsComponentContract = {
  selector: 'ff-toast',
  category: 'primitive',
  inputs: {
    message: { type: 'string', required: false, default: "''" },
    type: {
      type: "'success' | 'error' | 'warning' | 'info'",
      required: false,
      default: "'info'",
    },
    icon: { type: 'string', required: false, default: "''" },
    dismissible: { type: 'boolean', required: false, default: 'true' },
  },
  outputs: {
    dismissed: { type: 'void' },
  },
  behavior: {
    hostAttributeOwnership: ['class', 'role'],
    aria: ['host has role="status"'],
  },
};
