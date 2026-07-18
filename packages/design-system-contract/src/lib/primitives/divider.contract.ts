import type { DsComponentContract } from '../contract.types';

/**
 * Contract of the `ff-divider` primitive.
 *
 * Purely decorative horizontal or vertical separator line. No outputs and
 * no content projection.
 */
export const DividerContract: DsComponentContract = {
  selector: 'ff-divider',
  category: 'primitive',
  inputs: {
    orientation: {
      type: "'horizontal' | 'vertical'",
      required: false,
      default: "'horizontal'",
    },
    thickness: {
      type: "'thin' | 'medium'",
      required: false,
      default: "'thin'",
    },
  },
  outputs: {},
  behavior: {
    hostAttributeOwnership: ['class', 'role', 'aria-orientation'],
    aria: [
      'host has role="separator"',
      'host aria-orientation mirrors the orientation input',
    ],
  },
};
