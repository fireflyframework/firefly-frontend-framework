import type { DsComponentContract } from '../contract.types';

/**
 * Contract of the `ff-bottom-sheet` primitive.
 *
 * Modal panel anchored to the bottom of the viewport with a backdrop.
 * Body content is projected through the default slot and an actions zone
 * through `[ff-bottom-sheet-actions]`. When `dismissible` is `true`,
 * backdrop click, Escape and the close button all emit `dismissed`.
 */
export const BottomSheetContract: DsComponentContract = {
  selector: 'ff-bottom-sheet',
  category: 'primitive',
  inputs: {
    open: { type: 'boolean', required: false, default: 'false' },
    title: { type: 'string', required: false, default: "''" },
    message: { type: 'string', required: false, default: "''" },
    type: {
      type: "'success' | 'error' | 'warning' | 'info'",
      required: false,
      default: "'info'",
    },
    dismissible: { type: 'boolean', required: false, default: 'true' },
  },
  outputs: {
    dismissed: { type: 'void' },
  },
  behavior: {
    contentSlots: ['default', '[ff-bottom-sheet-actions]'],
    hostAttributeOwnership: ['class'],
    keyboard: ['Escape emits dismissed when dismissible'],
    aria: [
      'sheet surface has role="dialog" and aria-modal="true"',
      'aria-label is derived from the title input',
      'close button has aria-label="Close"',
    ],
  },
};
