import type { DsComponentContract } from '../contract.types';

/**
 * Sort direction applied to a sortable `ff-data-table` column. `null` means
 * the column is not currently driving the sort.
 */
export type FfSortDirection = 'asc' | 'desc' | null;

/**
 * Selection mode shared by `ff-data-table` and `ff-list`: `'none'` disables
 * selection entirely, `'single'` keeps at most one selected item, `'multi'`
 * allows any number of selected items (with a "select all" affordance for
 * the currently rendered page).
 */
export type FfSelectionMode = 'none' | 'single' | 'multi';

/**
 * Typed description of one `ff-data-table` column, replacing the untyped
 * `PaginableTableHeader` shape products used to hand-roll. `key` matches the
 * column against its `[ffDataTableCell]` template (and, when no template is
 * projected for it, against the property read from each row object for the
 * default text rendering).
 */
export interface FfDataTableHeader {
  /** Stable column identifier, matched against `[ffDataTableCell]="key"` templates. */
  readonly key: string;
  /** Column header text. */
  readonly label: string;
  /** Enables the click-to-sort affordance and `aria-sort` on this column's header cell. */
  readonly sortable?: boolean;
  /** CSS width applied to the column (e.g. `'20%'`, `'120px'`). */
  readonly width?: string;
  /** Horizontal text alignment of the column. Defaults to `'start'`. */
  readonly align?: 'start' | 'center' | 'end';
}

/**
 * Payload of a row-level interaction, replacing the untyped `TableRowEvent`
 * shape. Shared verbatim by `ff-data-table` (row click) and `ff-list` (item
 * click) — both patterns identify a row/item by its data plus its position
 * within the currently rendered page.
 */
export interface FfRowEvent<T> {
  /** The row/item data. */
  readonly item: T;
  /** Zero-based index of the row/item within the currently rendered page. */
  readonly index: number;
}

/**
 * Payload emitted when a sortable `ff-data-table` header is activated.
 */
export interface FfSortChangeEvent {
  /** Key of the {@link FfDataTableHeader} that was activated. */
  readonly key: string;
  /** Next sort direction to apply (the component only reports intent; it does not sort locally). */
  readonly direction: FfSortDirection;
}

/**
 * Payload emitted when the selection changes, shared by `ff-data-table` and
 * `ff-list`.
 *
 * `selected` is compared against a page's `items` by reference (`===`)
 * unless the component instance was given a `compareWith` function, in which
 * case membership is decided by that function instead — see the
 * `compareWith` input and its `behavior.aria` clause on each pattern's
 * contract.
 */
export interface FfSelectionChangeEvent<T> {
  /** Full set of selected items after the change. */
  readonly selected: readonly T[];
}

/**
 * Payload emitted when a row/item is expanded or collapsed, shared by
 * `ff-data-table` and `ff-list`.
 *
 * Like `FfSelectionChangeEvent`, expansion membership is decided by
 * reference equality unless a `compareWith` function is supplied.
 */
export interface FfExpandChangeEvent<T> {
  /** The row/item whose expansion state changed. */
  readonly item: T;
  /** `true` when the row/item is now expanded. */
  readonly expanded: boolean;
}

/**
 * Server-side pagination state rendered by `ff-data-table` / `ff-list`'s
 * pagination footer. The component is a pure display + event emitter — it
 * never slices `items` itself, since `items` is expected to already be the
 * current page fetched from the server.
 */
export interface FfPaginationState {
  /** Current page, 1-based. */
  readonly page: number;
  /** Number of items per page. */
  readonly pageSize: number;
  /** Total number of items across all pages. */
  readonly total: number;
  /** Selectable page sizes; when provided, a page-size control is rendered. */
  readonly pageSizeOptions?: readonly number[];
}

/**
 * Payload emitted when the user requests a different page or page size.
 */
export interface FfPageChangeEvent {
  /** Requested page, 1-based. */
  readonly page: number;
  /**
   * Requested page size — the size to fetch next.
   *
   * Equal to the current `FfPaginationState.pageSize` when only the page
   * number changed (previous/next navigation). When the page-size control
   * (rendered when `pagination.pageSizeOptions` is set) is used to request a
   * different size, `pageSize` carries that new value and `page` is reset to
   * `1`, since the previous page number is meaningless against a different
   * page size.
   */
  readonly pageSize: number;
}

/**
 * Text shown by the shared empty/no-results placeholder of `ff-data-table`
 * and `ff-list` when `items` resolves to an empty page. Configurable
 * globally via `provideFfNoResultsConfig`, and overridable per instance
 * through each component's `emptyTitle` / `emptyDescription` inputs.
 */
export interface FfNoResultsConfig {
  /** Placeholder title (`ff-empty-state`'s required `title`). */
  readonly title: string;
  /** Optional supporting text (`ff-empty-state`'s `description`). */
  readonly description?: string;
}

/**
 * Contract of the `ff-data-table` pattern.
 *
 * Typed headers with cell/row/expansion templates, server-side sorting,
 * single/multi selection with a "select all" checkbox, expandable rows and
 * server-side pagination (including an optional page-size control). Loading
 * and empty states compose `ff-skeleton` and `ff-empty-state`; the
 * empty-state text falls back to the value configured globally via
 * `provideFfNoResultsConfig`. Composes `ff-checkbox`, `ff-skeleton`,
 * `ff-empty-state`, `ff-icon`, `ff-button` and `ff-select`.
 */
export const DataTableContract: DsComponentContract = {
  selector: 'ff-data-table',
  category: 'pattern',
  composes: ['ff-checkbox', 'ff-skeleton', 'ff-empty-state', 'ff-icon', 'ff-button', 'ff-select'],
  inputs: {
    headers: {
      type: "readonly { key: string; label: string; sortable?: boolean; width?: string; align?: 'start' | 'center' | 'end' }[]",
      required: true,
    },
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
    sortKey: { type: 'string | undefined', required: false, default: 'undefined' },
    sortDirection: {
      type: "'asc' | 'desc' | null",
      required: false,
      default: 'null',
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
    caption: { type: 'string', required: false, default: "''" },
    rowLabel: {
      type: '((item: unknown, index: number) => string) | undefined',
      required: false,
      default: 'undefined',
    },
    skeletonRowCount: { type: 'number', required: false, default: '5' },
    trackBy: {
      type: '((item: unknown, index: number) => unknown) | undefined',
      required: false,
      default: 'undefined',
    },
  },
  outputs: {
    sortChange: { type: "{ key: string; direction: 'asc' | 'desc' | null }" },
    selectionChange: { type: '{ selected: readonly unknown[] }' },
    rowClick: { type: '{ item: unknown; index: number }' },
    expandedChange: { type: '{ item: unknown; expanded: boolean }' },
    pageChange: { type: '{ page: number; pageSize: number }' },
  },
  behavior: {
    contentSlots: ['[ffDataTableCell]', '[ffDataTableRow]', '[ffDataTableExpansion]'],
    requiredProviders: ['provideFfNoResultsConfig (optional — falls back to a built-in default)'],
    hostAttributeOwnership: ['class'],
    keyboard: [
      'Enter/Space on a sortable header toggles its sort direction (native button semantics)',
      'Enter/Space on an expand toggle expands/collapses its row (native button semantics)',
      'native checkbox semantics drive row and select-all selection',
      'the page-size control (rendered when pagination.pageSizeOptions is set) follows ff-select\'s own keyboard contract',
    ],
    aria: [
      'root renders a native table (role is implicit) with <th scope="col"> headers',
      'caption, when provided, renders a native <caption> naming the table',
      'the table exposes aria-busy="true" while loading',
      'sortable header cells expose aria-sort reflecting the current sort state',
      'expandable rows expose aria-expanded on their toggle control, named via rowLabel (falls back to "Toggle details for row N")',
      'the select-all checkbox exposes indeterminate state when only some rendered rows are selected, and is named "Select all rows"',
      'each row checkbox is named via rowLabel (falls back to "Select row N")',
      'selection and expansion membership (isSelected, isAllSelected/isSomeSelected, toggleAll, isExpanded) are decided by compareWith, defaulting to reference equality (a === b) — pass compareWith (e.g. (a, b) => a.id === b.id) to keep selection/expansion stable across a re-fetch that returns equivalent but non-identical row objects; trackBy governs only the @for row-rendering loop and has no effect on selection or expansion membership',
    ],
  },
};
