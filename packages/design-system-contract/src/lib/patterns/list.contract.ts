import type { DsComponentContract } from '../contract.types';

/**
 * Contract of the `ff-list` pattern.
 *
 * `ff-list` is deliberately its own pattern, not a mode of `ff-data-table`:
 * it renders one item-level template per entry instead of typed columns, but
 * shares the exact selection (`FfSelectionMode`, `FfSelectionChangeEvent`),
 * pagination (`FfPaginationState`, `FfPageChangeEvent`), expansion
 * (`FfExpandChangeEvent`) and row-interaction (`FfRowEvent`) model with
 * `ff-data-table` — see `data-table.contract.ts`, which is where those
 * shared types are defined. The empty-state fallback text is likewise the
 * same `provideFfNoResultsConfig` global configured for the table. Composes
 * `ff-checkbox`, `ff-skeleton`, `ff-empty-state`, `ff-icon`, `ff-button` and
 * `ff-select`.
 */
export const ListContract: DsComponentContract = {
  selector: 'ff-list',
  category: 'pattern',
  composes: ['ff-checkbox', 'ff-skeleton', 'ff-empty-state', 'ff-icon', 'ff-button', 'ff-select'],
  inputs: {
    items: { type: 'readonly unknown[]', required: true },
    loading: { type: 'boolean', required: false, default: 'false' },
    selectionMode: {
      type: "'none' | 'single' | 'multi'",
      required: false,
      default: "'none'",
    },
    selectedItems: { type: 'readonly unknown[]', required: false, default: '[]' },
    compareWith: {
      type: '((a: unknown, b: unknown) => boolean) | undefined',
      required: false,
      default: '(a, b) => a === b',
    },
    expandable: { type: 'boolean', required: false, default: 'false' },
    expandedItems: { type: 'readonly unknown[]', required: false, default: '[]' },
    pagination: {
      type: '{ page: number; pageSize: number; total: number; pageSizeOptions?: readonly number[] } | undefined',
      required: false,
      default: 'undefined',
    },
    emptyTitle: { type: 'string | undefined', required: false, default: 'undefined' },
    emptyDescription: { type: 'string | undefined', required: false, default: 'undefined' },
    skeletonItemCount: { type: 'number', required: false, default: '5' },
    trackBy: {
      type: '((item: unknown, index: number) => unknown) | undefined',
      required: false,
      default: 'undefined',
    },
  },
  outputs: {
    selectionChange: { type: '{ selected: readonly unknown[] }' },
    itemClick: { type: '{ item: unknown; index: number }' },
    expandedChange: { type: '{ item: unknown; expanded: boolean }' },
    pageChange: { type: '{ page: number; pageSize: number }' },
  },
  behavior: {
    contentSlots: ['[ffListItem]', '[ffListExpansion]'],
    requiredProviders: ['provideFfNoResultsConfig (optional — falls back to a built-in default)'],
    hostAttributeOwnership: ['class'],
    keyboard: [
      'selectionMode "none": items are not keyboard-operable (plain role="list"/"listitem", no tabindex on the container or the items)',
      'selectionMode "single"/"multi": the items container is a single Tab stop (tabindex="0"); focusing it for the first time activates the first selected option, or the first option otherwise',
      'selectionMode "single"/"multi": ArrowDown/ArrowUp move the active option one position at a time, clamped at the first/last rendered item (no wraparound, matching ff-select\'s listbox navigation)',
      'selectionMode "single"/"multi": Home/End move the active option to the first/last rendered item',
      'selectionMode "single"/"multi": Space toggles the selection of the active option',
      'selectionMode "single"/"multi": Enter emits itemClick for the active option',
      'Enter/Space on an expand toggle expands/collapses its item (native button semantics, independent of selectionMode)',
    ],
    aria: [
      'selectionMode "none" renders role="list" with role="listitem" entries',
      'selectionMode "single"/"multi" renders role="listbox" on the container (tabindex="0", aria-activedescendant tracking the active option) with role="option" entries exposing aria-selected',
      'selectionMode "multi" additionally exposes aria-multiselectable="true" on the root',
      'while the listbox is active, each option\'s selection checkbox is purely visual (aria-hidden, not focusable): selection is conveyed by aria-selected on the option, driven by clicking the option or pressing Space, never by a focusable control nested inside it',
      'the expand toggle is rendered as a sibling of the option, never inside it, so its own interactive semantics never nest inside role="option"',
      'expandable items expose aria-expanded on their toggle control',
      'the items container exposes aria-busy="true" while loading',
      'selection and expansion membership (isSelected, isAllSelected/isSomeSelected, toggleAll, isExpanded) are decided by compareWith, defaulting to reference equality (a === b) — pass compareWith (e.g. (a, b) => a.id === b.id) to keep selection/expansion stable across a re-fetch that returns equivalent but non-identical item objects; trackBy governs only the @for item-rendering loop and has no effect on selection or expansion membership',
    ],
  },
};
