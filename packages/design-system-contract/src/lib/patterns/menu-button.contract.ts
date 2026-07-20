import type { DsComponentContract } from '../contract.types';

/**
 * Contract of the `ff-menu-button` pattern.
 *
 * A trigger button that opens an accessible dropdown of actions, positioned
 * with a connected overlay strategy anchored to the trigger (falling back
 * above it when there is no room below). Composes `ff-button` and `ff-icon`
 * (pattern tier — primitives only).
 *
 * Trigger label: content projected into the default slot, or `triggerLabel`
 * when nothing is projected. `variant`/`color`/`size` are forwarded to the
 * underlying `ff-button` trigger.
 */
export const MenuButtonContract: DsComponentContract = {
  selector: 'ff-menu-button',
  category: 'pattern',
  composes: ['ff-button', 'ff-icon'],
  inputs: {
    items: {
      type: 'readonly { label: string; value: string; disabled?: boolean }[]',
      required: true,
    },
    triggerLabel: { type: 'string', required: false, default: "''" },
    disabled: { type: 'boolean', required: false, default: 'false' },
    variant: {
      type: "'solid' | 'outline' | 'ghost' | 'primary' | 'secondary'",
      required: false,
      default: "'solid'",
    },
    color: {
      type: "'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info' | 'neutral'",
      required: false,
      default: "'primary'",
    },
    size: { type: "'sm' | 'md' | 'lg'", required: false, default: "'md'" },
  },
  outputs: {
    selected: { type: '{ label: string; value: string; disabled?: boolean }' },
  },
  behavior: {
    hostAttributeOwnership: ['class'],
    keyboard: [
      'ArrowDown on the trigger opens the panel and activates the first enabled entry',
      'ArrowUp on the trigger opens the panel and activates the last enabled entry',
      'ArrowDown/ArrowUp inside the open panel move the active entry (wrapping, skipping disabled entries)',
      'Home/End inside the open panel jump to the first/last enabled entry',
      'Enter/Space inside the open panel activate the active entry',
      'Escape closes the panel and returns focus to the trigger',
      'an outside click closes the panel without moving focus',
    ],
    aria: [
      'trigger has aria-haspopup="menu" and aria-expanded reflecting the panel state',
      'panel has role="menu" with role="menuitem" entries',
      'disabled entries carry aria-disabled="true" and are skipped by keyboard navigation',
    ],
  },
};
