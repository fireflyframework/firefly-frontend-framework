import type { DsComponentContract } from '../contract.types';

/**
 * Contract of the `ff-skeleton` primitive.
 *
 * Loading placeholder in `text` (multi-line capable, last line shortened to
 * 60%), `rect` and `circle` shapes. The shimmer animation is CSS-only and
 * disabled automatically under `prefers-reduced-motion: reduce`. Height
 * defaults per variant: text `1em`, rect `80px`, circle `40px`; width
 * defaults to `100%` (circles default to their height).
 */
export const SkeletonContract: DsComponentContract = {
  selector: 'ff-skeleton',
  category: 'primitive',
  inputs: {
    variant: {
      type: "'text' | 'rect' | 'circle'",
      required: false,
      default: "'text'",
    },
    width: {
      type: 'string | undefined',
      required: false,
      default: 'undefined',
    },
    height: {
      type: 'string | undefined',
      required: false,
      default: 'undefined',
    },
    lines: { type: 'number', required: false, default: '1' },
    animated: { type: 'boolean', required: false, default: 'true' },
  },
  outputs: {},
  behavior: {
    hostAttributeOwnership: ['class', 'aria-hidden'],
    aria: [
      'host has aria-hidden="true" — skeletons are purely decorative; announce loading elsewhere (e.g. an aria-busy region)',
    ],
  },
};
