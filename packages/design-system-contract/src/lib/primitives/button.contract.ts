import type { DsComponentContract } from '../contract.types';

/**
 * Contract of the `ff-button` primitive.
 *
 * Action button with two independent styling axes — `variant` (style: solid
 * / outline / ghost) and `color` (semantic palette: primary / secondary /
 * success / warning / error / info / neutral) — three sizes, and
 * disabled/loading states. Label is projected through the default slot;
 * optional prefix/suffix content (e.g. icons) through attribute slots.
 * `clicked` is only emitted when the button is neither disabled nor loading.
 *
 * Backward compatibility: `variant` also accepts the pre-dual-axis legacy
 * values `'primary'` / `'secondary'` (soft-deprecated), mapped internally to
 * `variant: 'solid'` plus the matching `color` when `color` is left unset.
 */
export const ButtonContract: DsComponentContract = {
  selector: 'ff-button',
  category: 'primitive',
  inputs: {
    variant: {
      type: "'solid' | 'outline' | 'ghost' | 'primary' | 'secondary'",
      required: false,
      default: "'solid'",
    },
    color: {
      type: "'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info' | 'neutral' | undefined",
      required: false,
      default: 'undefined',
    },
    size: { type: "'sm' | 'md' | 'lg'", required: false, default: "'md'" },
    disabled: { type: 'boolean', required: false, default: 'false' },
    loading: { type: 'boolean', required: false, default: 'false' },
  },
  outputs: {
    clicked: { type: 'void' },
  },
  behavior: {
    contentSlots: ['default', '[ffButtonPrefix]', '[ffButtonSuffix]'],
    hostAttributeOwnership: ['class'],
  },
};
