import type { DsComponentContract } from '../contract.types';

/**
 * Contract of the `ff-avatar` primitive.
 *
 * Circular avatar displaying an image, falling back automatically to
 * `initials` (max 2 characters, uppercased) when `src` is empty or the
 * image fails to load.
 */
export const AvatarContract: DsComponentContract = {
  selector: 'ff-avatar',
  category: 'primitive',
  inputs: {
    src: { type: 'string', required: false, default: "''" },
    initials: { type: 'string', required: false, default: "''" },
    alt: { type: 'string', required: false, default: "''" },
    size: { type: "'sm' | 'md' | 'lg'", required: false, default: "'md'" },
  },
  outputs: {},
  behavior: {
    hostAttributeOwnership: ['class', 'role', 'aria-label'],
    aria: [
      'host has role="img"',
      'host aria-label is derived from alt (falling back to initials)',
    ],
  },
};
