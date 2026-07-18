import type { DsComponentContract } from '../contract.types';

/**
 * Contract of the `ff-progress` primitive.
 *
 * Determinate horizontal progress bar. `value` is clamped to the 0–100
 * range; `showValue` renders the rounded percentage next to the track.
 */
export const ProgressContract: DsComponentContract = {
  selector: 'ff-progress',
  category: 'primitive',
  inputs: {
    value: { type: 'number', required: true },
    variant: {
      type: "'primary' | 'success' | 'warning' | 'error'",
      required: false,
      default: "'primary'",
    },
    size: { type: "'sm' | 'md'", required: false, default: "'md'" },
    showValue: { type: 'boolean', required: false, default: 'false' },
    label: {
      type: 'string | undefined',
      required: false,
      default: 'undefined',
    },
  },
  outputs: {},
  behavior: {
    hostAttributeOwnership: ['class'],
    aria: [
      'track has role="progressbar" with aria-valuemin="0" and aria-valuemax="100"',
      'aria-valuenow reflects the clamped value',
      'aria-label is derived from the label input',
    ],
  },
};
