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
 * `ff-checkbox`, `ff-skeleton`, `ff-empty-state`, `ff-icon` and `ff-button`
 * (pattern tier — primitives only).
 */
export const ListContract: DsComponentContract = {
  selector: 'ff-list',
  category: 'pattern',
  composes: ['ff-checkbox', 'ff-skeleton', 'ff-empty-state', 'ff-icon', 'ff-button'],
  inputs: {
    items: { type: 'readonly unknown[]', required: true },
    loading: { type: 'boolean', required: false, default: 'false' },
    selectionMode: {
      type: "'none' | 'single' | 'multi'",
      required: false,
      default: "'none'",
    },
    selectedItems: { type: 'readonly unknown[]', required: false, default: '[]' },
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
      'Enter/Space on an expand toggle expands/collapses its item (native button semantics)',
      'native checkbox semantics drive item and select-all selection',
    ],
    aria: [
      'selectionMode "none" renders role="list" with role="listitem" entries',
      'selectionMode "single"/"multi" renders role="listbox" with role="option" entries exposing aria-selected',
      'selectionMode "multi" additionally exposes aria-multiselectable="true" on the root',
      'expandable items expose aria-expanded on their toggle control',
    ],
  },
};
