import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  Directive,
  TemplateRef,
  ViewEncapsulation,
  computed,
  contentChild,
  contentChildren,
  inject,
  input,
  output,
} from '@angular/core';
import type {
  FfDataTableHeader,
  FfExpandChangeEvent,
  FfPageChangeEvent,
  FfPaginationState,
  FfRowEvent,
  FfSelectionChangeEvent,
  FfSelectionMode,
  FfSortChangeEvent,
  FfSortDirection,
} from '@fireflyframework/design-system-contract';

import { FfButtonComponent } from '../../primitives/ff-button';
import { FfCheckboxComponent } from '../../primitives/ff-checkbox';
import { FfEmptyStateComponent } from '../../primitives/ff-empty-state';
import { FfIconComponent } from '../../primitives/ff-icon';
import { FfSkeletonComponent } from '../../primitives/ff-skeleton';
import { FF_NO_RESULTS_CONFIG } from './no-results-config';

export type {
  FfDataTableHeader,
  FfExpandChangeEvent,
  FfPageChangeEvent,
  FfPaginationState,
  FfRowEvent,
  FfSelectionChangeEvent,
  FfSelectionMode,
  FfSortChangeEvent,
  FfSortDirection,
} from '@fireflyframework/design-system-contract';

/**
 * Template context handed to `[ffDataTableCell]`, `[ffDataTableRow]` and
 * `[ffDataTableExpansion]` `<ng-template>`s: `$implicit` is the row object,
 * `index` its zero-based position within the currently rendered page.
 */
export interface FfDataTableTemplateContext {
  $implicit: Record<string, unknown>;
  index: number;
}

/**
 * Marks an `<ng-template>` projected into `ff-data-table` as the custom cell
 * renderer for the column whose {@link FfDataTableHeader.key} matches this
 * directive's value, replacing the default `item[key]` text rendering.
 *
 * @example
 * ```html
 * <ff-data-table [headers]="headers" [items]="rows">
 *   <ng-template ffDataTableCell="status" let-row>
 *     <ff-badge [variant]="row.status === 'active' ? 'success' : 'neutral'">
 *       {{ row.status }}
 *     </ff-badge>
 *   </ng-template>
 * </ff-data-table>
 * ```
 */
@Directive({ selector: '[ffDataTableCell]', standalone: true })
export class FfDataTableCellTemplateDirective {
  /** Column key this template renders, matched against `FfDataTableHeader.key`. */
  readonly ffDataTableCell = input.required<string>();

  /** Template reference captured by `ff-data-table` and rendered per matching cell via `NgTemplateOutlet`. */
  readonly templateRef = inject<TemplateRef<FfDataTableTemplateContext>>(TemplateRef);
}

/**
 * Marks an `<ng-template>` projected into `ff-data-table` as a full custom
 * renderer for each row, replacing the default per-column cell rendering
 * entirely. Mutually exclusive in effect with `[ffDataTableCell]` templates,
 * which are ignored while a row template is present.
 */
@Directive({ selector: '[ffDataTableRow]', standalone: true })
export class FfDataTableRowTemplateDirective {
  /** Template reference captured by `ff-data-table` and rendered once per row via `NgTemplateOutlet`. */
  readonly templateRef = inject<TemplateRef<FfDataTableTemplateContext>>(TemplateRef);
}

/**
 * Marks an `<ng-template>` projected into `ff-data-table` as the renderer of
 * the expansion panel shown below an expanded row (requires `expandable`).
 */
@Directive({ selector: '[ffDataTableExpansion]', standalone: true })
export class FfDataTableExpansionTemplateDirective {
  /** Template reference captured by `ff-data-table` and rendered below an expanded row via `NgTemplateOutlet`. */
  readonly templateRef = inject<TemplateRef<FfDataTableTemplateContext>>(TemplateRef);
}

/**
 * Firefly data table pattern.
 *
 * Typed headers (`FfDataTableHeader[]`) driving a native `<table>`, with
 * per-column cell templates (`[ffDataTableCell]`), a full-row template
 * override (`[ffDataTableRow]`) and an expansion-panel template
 * (`[ffDataTableExpansion]`). Server-side sorting, single/multi selection
 * (with a "select all" checkbox for the currently rendered page) and
 * server-side pagination are all event-driven — this component never sorts,
 * filters or slices `items` itself, since `items` is expected to already be
 * the current page fetched from the server. Loading and empty states
 * compose `ff-skeleton` and `ff-empty-state`; the empty-state text falls
 * back to the value configured globally via `provideFfNoResultsConfig`
 * (pattern tier — primitives only: `ff-checkbox`, `ff-skeleton`,
 * `ff-empty-state`, `ff-icon`, `ff-button`).
 *
 * Does not implement drag-and-drop row reordering or virtual scrolling.
 *
 * @example
 * ```html
 * <ff-data-table
 *   [headers]="[
 *     { key: 'name', label: 'Name', sortable: true },
 *     { key: 'status', label: 'Status' },
 *   ]"
 *   [items]="rows()"
 *   [loading]="loading()"
 *   selectionMode="multi"
 *   [selectedItems]="selected()"
 *   (selectionChange)="selected.set($event.selected)"
 *   [sortKey]="sortKey()"
 *   [sortDirection]="sortDirection()"
 *   (sortChange)="onSortChange($event)"
 *   [pagination]="pagination()"
 *   (pageChange)="onPageChange($event)"
 * >
 *   <ng-template ffDataTableCell="status" let-row>{{ row.status | titlecase }}</ng-template>
 * </ff-data-table>
 * ```
 */
@Component({
  selector: 'ff-data-table',
  standalone: true,
  imports: [
    NgTemplateOutlet,
    FfCheckboxComponent,
    FfSkeletonComponent,
    FfEmptyStateComponent,
    FfIconComponent,
    FfButtonComponent,
  ],
  templateUrl: './ff-data-table.component.html',
  styleUrl: './ff-data-table.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    class: 'ff-data-table',
  },
})
export class FfDataTableComponent<T extends Record<string, unknown> = Record<string, unknown>> {
  /** @internal Sequence used to build unique expansion-row ids per instance. */
  private static instanceCount = 0;

  /** @internal Optional application-wide empty-state text, registered via `provideFfNoResultsConfig`. */
  private readonly noResultsConfig = inject(FF_NO_RESULTS_CONFIG, { optional: true });

  /** @internal Unique id prefix for this instance's expansion rows. */
  private readonly instanceId = `ff-data-table-${FfDataTableComponent.instanceCount++}`;

  /** Typed column definitions, in display order. */
  readonly headers = input.required<readonly FfDataTableHeader[]>();

  /** Rows for the currently rendered page. */
  readonly items = input.required<readonly T[]>();

  /** Shows skeleton placeholder rows instead of `items`. */
  readonly loading = input(false);

  /** Number of skeleton rows rendered while `loading`. */
  readonly skeletonRowCount = input(5);

  /** Selection mode: `'none'` | `'single'` | `'multi'`. Defaults to `'none'`. */
  readonly selectionMode = input<FfSelectionMode>('none');

  /** Currently selected rows. */
  readonly selectedItems = input<readonly T[]>([]);

  /** Key of the column currently driving the sort, if any. */
  readonly sortKey = input<string>();

  /** Direction of the current sort. */
  readonly sortDirection = input<FfSortDirection>(null);

  /** Enables the expand/collapse toggle column and expansion-panel rows. */
  readonly expandable = input(false);

  /** Currently expanded rows. */
  readonly expandedItems = input<readonly T[]>([]);

  /** Server-side pagination state; omit to render without a pagination footer. */
  readonly pagination = input<FfPaginationState>();

  /** Overrides the global no-results title for this instance. */
  readonly emptyTitle = input<string>();

  /** Overrides the global no-results description for this instance. */
  readonly emptyDescription = input<string>();

  /**
   * Resolves a stable identity for a row, used for `@for` tracking. Defaults
   * to positional tracking (`index`) when omitted — pass a function reading
   * a domain id (e.g. `(row) => row.id`) for correct behavior across pages
   * that reuse row objects.
   */
  readonly trackBy = input<(item: T, index: number) => unknown>();

  /** Emits the requested sort when a sortable header is activated. */
  readonly sortChange = output<FfSortChangeEvent>();

  /** Emits the full selection after it changes. */
  readonly selectionChange = output<FfSelectionChangeEvent<T>>();

  /** Emits when a row is clicked (outside the selection checkbox and expand toggle). */
  readonly rowClick = output<FfRowEvent<T>>();

  /** Emits when a row is expanded or collapsed. */
  readonly expandedChange = output<FfExpandChangeEvent<T>>();

  /** Emits the requested page/page size from the pagination footer. */
  readonly pageChange = output<FfPageChangeEvent>();

  /** Custom per-column cell renderers, keyed by `FfDataTableHeader.key`. */
  protected readonly cellTemplates = contentChildren(FfDataTableCellTemplateDirective);

  /** Custom full-row renderer, if projected. */
  protected readonly rowTemplate = contentChild(FfDataTableRowTemplateDirective);

  /** Custom expansion-panel renderer, if projected. */
  protected readonly expansionTemplate = contentChild(FfDataTableExpansionTemplateDirective);

  /** @internal Cell templates indexed by column key for O(1) lookup while rendering. */
  protected readonly cellTemplateMap = computed(() => {
    const map = new Map<string, TemplateRef<FfDataTableTemplateContext>>();
    for (const directive of this.cellTemplates()) {
      map.set(directive.ffDataTableCell(), directive.templateRef);
    }
    return map;
  });

  /** @internal Indices used to render `skeletonRowCount` placeholder rows. */
  protected readonly skeletonRows = computed(() =>
    Array.from({ length: Math.max(0, this.skeletonRowCount()) }, (_, i) => i)
  );

  /** @internal Total `<td>`/`<th>` count per row, including the selection and expand columns. */
  protected readonly totalColumnCount = computed(
    () =>
      this.headers().length +
      (this.selectionMode() !== 'none' ? 1 : 0) +
      (this.expandable() ? 1 : 0)
  );

  /** @internal `true` when every row of the current page is selected. */
  protected readonly isAllSelected = computed(() => {
    const current = this.items();
    return current.length > 0 && current.every((item) => this.selectedItems().includes(item));
  });

  /** @internal `true` when some, but not all, rows of the current page are selected. */
  protected readonly isSomeSelected = computed(
    () => !this.isAllSelected() && this.items().some((item) => this.selectedItems().includes(item))
  );

  /** @internal Resolved empty-state title: instance override, then global config, then a built-in default. */
  protected readonly resolvedEmptyTitle = computed(
    () => this.emptyTitle() ?? this.noResultsConfig?.title ?? 'No results found'
  );

  /** @internal Resolved empty-state description: instance override, then global config. */
  protected readonly resolvedEmptyDescription = computed(
    () => this.emptyDescription() ?? this.noResultsConfig?.description
  );

  /** @internal Resolves a row's `@for` tracking key via `trackBy`, defaulting to its index. */
  protected itemKey(item: T, index: number): unknown {
    const resolve = this.trackBy();
    return resolve ? resolve(item, index) : index;
  }

  /** @internal Reads `item[key]` for the default (template-less) cell rendering. */
  protected cellValue(item: T, key: string): unknown {
    return item[key];
  }

  /** @internal `aria-sort` value for a header cell, or `null` for non-sortable columns. */
  protected ariaSortFor(header: FfDataTableHeader): 'ascending' | 'descending' | 'none' | null {
    if (!header.sortable) {
      return null;
    }
    if (this.sortKey() !== header.key) {
      return 'none';
    }
    return this.sortDirection() === 'asc'
      ? 'ascending'
      : this.sortDirection() === 'desc'
        ? 'descending'
        : 'none';
  }

  /** @internal Cycles a sortable column through asc → desc → unsorted and emits `sortChange`. */
  protected toggleSort(header: FfDataTableHeader): void {
    if (!header.sortable) {
      return;
    }
    let direction: FfSortDirection;
    if (this.sortKey() !== header.key) {
      direction = 'asc';
    } else if (this.sortDirection() === 'asc') {
      direction = 'desc';
    } else if (this.sortDirection() === 'desc') {
      direction = null;
    } else {
      direction = 'asc';
    }
    this.sortChange.emit({ key: header.key, direction });
  }

  /** @internal Whether `item` is part of the current selection. */
  protected isSelected(item: T): boolean {
    return this.selectedItems().includes(item);
  }

  /** @internal Toggles the whole current page in/out of the selection (multi mode only). */
  protected toggleAll(): void {
    const current = this.items();
    if (this.isAllSelected()) {
      this.selectionChange.emit({
        selected: this.selectedItems().filter((item) => !current.includes(item)),
      });
      return;
    }
    const merged = [...this.selectedItems()];
    for (const item of current) {
      if (!merged.includes(item)) {
        merged.push(item);
      }
    }
    this.selectionChange.emit({ selected: merged });
  }

  /** @internal Toggles a single row's selection, respecting single/multi mode. */
  protected toggleRow(item: T): void {
    if (this.selectionMode() === 'single') {
      this.selectionChange.emit({ selected: this.isSelected(item) ? [] : [item] });
      return;
    }
    const current = this.selectedItems();
    this.selectionChange.emit({
      selected: this.isSelected(item) ? current.filter((i) => i !== item) : [...current, item],
    });
  }

  /** @internal Emits `rowClick` for a whole-row interaction (outside checkbox/expand controls). */
  protected onRowClick(item: T, index: number): void {
    this.rowClick.emit({ item, index });
  }

  /** @internal Whether `item`'s expansion panel is currently shown. */
  protected isExpanded(item: T): boolean {
    return this.expandedItems().includes(item);
  }

  /** @internal Toggles a row's expansion state and emits `expandedChange`. */
  protected toggleExpand(item: T): void {
    this.expandedChange.emit({ item, expanded: !this.isExpanded(item) });
  }

  /** @internal Id of an expansion row, referenced by its toggle's `aria-controls`. */
  protected expansionRowId(index: number): string {
    return `${this.instanceId}-expansion-${index}`;
  }

  /** @internal Total number of pages for the current pagination state (at least 1). */
  protected totalPages(pagination: FfPaginationState): number {
    return Math.max(1, Math.ceil(pagination.total / pagination.pageSize));
  }

  /** @internal Human-readable "start–end of total" range for the pagination footer. */
  protected paginationInfoText(pagination: FfPaginationState): string {
    if (pagination.total === 0) {
      return '0 of 0';
    }
    const start = (pagination.page - 1) * pagination.pageSize + 1;
    const end = Math.min(pagination.page * pagination.pageSize, pagination.total);
    return `${start}–${end} of ${pagination.total}`;
  }

  /** @internal Requests a page change, clamped to the valid range, emitting `pageChange` only on an actual change. */
  protected goToPage(page: number, pagination: FfPaginationState): void {
    const clamped = Math.min(Math.max(page, 1), this.totalPages(pagination));
    if (clamped === pagination.page) {
      return;
    }
    this.pageChange.emit({ page: clamped, pageSize: pagination.pageSize });
  }
}
