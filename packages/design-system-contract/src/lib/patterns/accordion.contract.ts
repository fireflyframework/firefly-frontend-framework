import type { DsComponentContract } from '../contract.types';

/**
 * How many `ff-accordion` sections may be expanded at once: `'single'`
 * expanding a section collapses whichever other section was open;
 * `'multiple'` lets any number of sections stay expanded independently.
 */
export type FfAccordionMode = 'single' | 'multiple';

/**
 * Typed description of one `ff-accordion` section. `id` matches the section
 * against its `[ffAccordionSection]` content template and against the
 * `expandedIds` list that drives (and reports) expansion.
 */
export interface FfAccordionSection {
  /** Stable section identifier, matched against `[ffAccordionSection]="id"` templates and `expandedIds`. */
  readonly id: string;
  /** Disclosure header text. */
  readonly heading: string;
  /** Disables the section's toggle: it cannot be expanded or collapsed by click or keyboard. */
  readonly disabled?: boolean;
}

/**
 * Contract of the `ff-accordion` pattern.
 *
 * Stacked disclosure sections, each rendered as an `ff-panel` whose header
 * zone hosts the accessible toggle `<button>` and whose body zone hosts an
 * animated `role="region"` wrapper around the section's projected content.
 * `mode` governs whether one (`'single'`) or several (`'multiple'`) sections
 * may be expanded at once; the component never owns which sections start
 * expanded — that is the `expandedIds` input, updated by the consumer from
 * `expandedIdsChange`. Composes `ff-panel` and `ff-icon` — primitives only
 * (pattern tier).
 */
export const AccordionContract: DsComponentContract = {
  selector: 'ff-accordion',
  category: 'pattern',
  composes: ['ff-panel', 'ff-icon'],
  inputs: {
    sections: {
      type: 'readonly { id: string; heading: string; disabled?: boolean }[]',
      required: true,
    },
    mode: {
      type: "'single' | 'multiple'",
      required: false,
      default: "'single'",
    },
    expandedIds: { type: 'readonly string[]', required: false, default: '[]' },
  },
  outputs: {
    expandedIdsChange: { type: 'readonly string[]' },
  },
  behavior: {
    contentSlots: ['[ffAccordionSection]'],
    hostAttributeOwnership: ['class'],
    keyboard: [
      'ArrowDown moves focus to the next enabled section header (wrapping)',
      'ArrowUp moves focus to the previous enabled section header (wrapping)',
      'Home moves focus to the first enabled section header',
      'End moves focus to the last enabled section header',
      'Enter/Space toggle the focused section (native button semantics)',
    ],
    aria: [
      'each section header is a native <button> with aria-expanded reflecting its expansion state and aria-controls pointing to its region',
      'each section body is role="region" with aria-labelledby pointing to its header',
      'a collapsed section region is inert: its content is unreachable by pointer, keyboard and assistive technology until expanded',
      'disabled sections are excluded from activation and roving focus',
    ],
  },
};
