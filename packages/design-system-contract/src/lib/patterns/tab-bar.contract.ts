import type { DsComponentContract } from '../contract.types';

/**
 * Contract of the `ff-tab-bar` pattern.
 *
 * Horizontal tab strip with `underline` and `pills` visualizations,
 * roving-tabindex keyboard navigation and WAI-ARIA tablist semantics.
 * Composes the `ff-icon` and `ff-badge` primitives (pattern tier —
 * primitives only). Activation is manual (click, Enter or Space); the
 * component does not own panel content — consumers switch views from
 * `activeIdChange`.
 */
export const TabBarContract: DsComponentContract = {
  selector: 'ff-tab-bar',
  category: 'pattern',
  composes: ['ff-icon', 'ff-badge'],
  inputs: {
    tabs: {
      type: 'readonly { id: string; label: string; icon?: string; badge?: string | number; disabled?: boolean }[]',
      required: true,
    },
    activeId: {
      type: 'string | undefined',
      required: false,
      default: 'undefined',
    },
    variant: {
      type: "'underline' | 'pills'",
      required: false,
      default: "'underline'",
    },
  },
  outputs: {
    activeIdChange: { type: 'string' },
  },
  behavior: {
    hostAttributeOwnership: ['class'],
    keyboard: [
      'ArrowRight moves focus to the next enabled tab (wrapping)',
      'ArrowLeft moves focus to the previous enabled tab (wrapping)',
      'Home moves focus to the first enabled tab',
      'End moves focus to the last enabled tab',
      'Enter/Space activate the focused tab (native button semantics)',
    ],
    aria: [
      'tab strip has role="tablist"',
      'each tab has role="tab" with aria-selected reflecting the active tab',
      'disabled tabs are excluded from activation and roving focus',
    ],
  },
};
