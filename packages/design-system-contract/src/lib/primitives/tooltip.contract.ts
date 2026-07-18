import type { DsComponentContract } from '../contract.types';

/**
 * Contract of the `ff-tooltip` primitive.
 *
 * Informational overlay shown on hover and keyboard focus over a projected
 * trigger element. No tooltip is rendered when `text` is empty.
 */
export const TooltipContract: DsComponentContract = {
  selector: 'ff-tooltip',
  category: 'primitive',
  inputs: {
    text: { type: 'string', required: false, default: "''" },
    position: {
      type: "'top' | 'bottom' | 'left' | 'right'",
      required: false,
      default: "'top'",
    },
  },
  outputs: {},
  behavior: {
    contentSlots: ['default'],
    hostAttributeOwnership: ['class', 'aria-describedby'],
    keyboard: [
      'focusin on the trigger shows the tooltip',
      'focusout on the trigger hides the tooltip',
    ],
    aria: [
      'tooltip surface has role="tooltip"',
      'host aria-describedby references the tooltip id when text is set',
    ],
  },
};
