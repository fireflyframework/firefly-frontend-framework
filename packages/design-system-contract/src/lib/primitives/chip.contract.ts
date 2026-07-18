import type { DsComponentContract } from '../contract.types';

/**
 * Contract of the `ff-chip` primitive.
 *
 * Inline label/tag with `default` (static), `filter` (toggleable with a
 * selected state) and `removable` (with close button) variants. Text is
 * projected through the default slot. `clicked`/`removed` are only emitted
 * when the chip is not disabled.
 */
export const ChipContract: DsComponentContract = {
  selector: 'ff-chip',
  category: 'primitive',
  inputs: {
    variant: {
      type: "'default' | 'filter' | 'removable'",
      required: false,
      default: "'default'",
    },
    selected: { type: 'boolean', required: false, default: 'false' },
    disabled: { type: 'boolean', required: false, default: 'false' },
    size: { type: "'sm' | 'md'", required: false, default: "'md'" },
  },
  outputs: {
    clicked: { type: 'void' },
    removed: { type: 'void' },
  },
  behavior: {
    contentSlots: ['default'],
    hostAttributeOwnership: ['class'],
  },
};
