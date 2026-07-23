import type { DsComponentContract } from '../contract.types';

/**
 * Contract of the `ff-avatar` primitive.
 *
 * Circular (or square, via `round`) avatar displaying an image, falling back
 * automatically to initials when `src` is empty or the image fails to load.
 * Initials come from the explicit `initials` input when set, otherwise they
 * are derived from `name` (first + last word, max 2 characters, uppercased).
 * `size` accepts the predefined tokens or a literal pixel number, and `tone`
 * applies a decorative background palette independent of the content.
 */
export const AvatarContract: DsComponentContract = {
  selector: 'ff-avatar',
  category: 'primitive',
  inputs: {
    src: { type: 'string', required: false, default: "''" },
    initials: { type: 'string', required: false, default: "''" },
    name: { type: 'string', required: false, default: "''" },
    alt: { type: 'string', required: false, default: "''" },
    size: { type: "'sm' | 'md' | 'lg' | number", required: false, default: "'md'" },
    round: { type: 'boolean', required: false, default: 'true' },
    cornerRadius: { type: 'string | undefined', required: false, default: 'undefined' },
    tone: {
      type: "'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info' | 'neutral' | undefined",
      required: false,
      default: 'undefined',
    },
  },
  outputs: {},
  behavior: {
    hostAttributeOwnership: ['class', 'role', 'aria-label'],
    aria: [
      'host has role="img"',
      'host aria-label is derived from alt (falling back to the resolved initials — explicit `initials` or derived from `name`)',
    ],
  },
};
