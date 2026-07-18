import type { DsComponentContract } from '../contract.types';

/**
 * Contract of the `ff-dialog` primitive.
 *
 * Modal overlay with backdrop and projected zones for body (default slot)
 * and actions. When `dismissible` is `true`, Escape, backdrop click and the
 * close button all emit `closed`; the consumer owns the `open` state.
 */
export const DialogContract: DsComponentContract = {
  selector: 'ff-dialog',
  category: 'primitive',
  inputs: {
    open: { type: 'boolean', required: false, default: 'false' },
    title: { type: 'string', required: false, default: "''" },
    type: {
      type: "'success' | 'error' | 'warning' | 'info' | undefined",
      required: false,
      default: 'undefined',
    },
    dismissible: { type: 'boolean', required: false, default: 'true' },
  },
  outputs: {
    closed: { type: 'void' },
  },
  behavior: {
    contentSlots: ['default', '[ff-dialog-actions]'],
    hostAttributeOwnership: ['class'],
    keyboard: ['Escape emits closed when dismissible'],
    aria: [
      'dialog surface has role="dialog" and aria-modal="true"',
      'aria-label is derived from the title input',
      'close button has aria-label="Close"',
    ],
  },
};
