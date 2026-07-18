import type { DsComponentContract } from '../contract.types';

/**
 * Contract of the `ff-badge` primitive.
 *
 * Inline status label with semantic color variants, an independent `color`
 * palette axis (which takes precedence over `variant` when set), an optional
 * status dot, pill/square shapes and an automatic overflow tooltip. Text
 * content is projected through the default slot.
 *
 * The component OWNS the host `title` attribute: when `maxWidth` is set and
 * the label is really truncated (`scrollWidth > clientWidth`) it writes the
 * full label text into `title` (native tooltip) and removes it otherwise.
 * Consumers must not set `title` on the host themselves.
 */
export const BadgeContract: DsComponentContract = {
  selector: 'ff-badge',
  category: 'primitive',
  inputs: {
    variant: {
      type: "'success' | 'warning' | 'error' | 'info' | 'neutral'",
      required: false,
      default: "'neutral'",
    },
    color: {
      type: "'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info' | 'neutral' | undefined",
      required: false,
      default: 'undefined',
    },
    dot: { type: 'boolean', required: false, default: 'false' },
    shape: { type: "'pill' | 'square'", required: false, default: "'pill'" },
    size: { type: "'xs' | 'sm' | 'md'", required: false, default: "'md'" },
    maxWidth: {
      type: 'string | undefined',
      required: false,
      default: 'undefined',
    },
  },
  outputs: {},
  behavior: {
    contentSlots: ['default'],
    hostAttributeOwnership: ['class', 'title'],
  },
};
