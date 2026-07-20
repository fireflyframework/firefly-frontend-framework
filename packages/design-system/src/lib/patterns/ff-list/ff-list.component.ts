import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  Directive,
  TemplateRef,
  ViewEncapsulation,
  computed,
  contentChild,
  inject,
  input,
  output,
} from '@angular/core';
import type {
  FfExpandChangeEvent,
  FfPageChangeEvent,
  FfPaginationState,
  FfRowEvent,
  FfSelectionChangeEvent,
  FfSelectionMode,
} from '@fireflyframework/design-system-contract';

import { FF_NO_RESULTS_CONFIG } from '../ff-data-table/no-results-config';
import { FfButtonComponent } from '../../primitives/ff-button';
import { FfCheckboxComponent } from '../../primitives/ff-checkbox';
import { FfEmptyStateComponent } from '../../primitives/ff-empty-state';
import { FfIconComponent } from '../../primitives/ff-icon';
import { FfSkeletonComponent } from '../../primitives/ff-skeleton';

export type {
  FfExpandChangeEvent,
  FfPageChangeEvent,
  FfPaginationState,
  FfRowEvent,
  FfSelectionChangeEvent,
  FfSelectionMode,
} from '@fireflyframework/design-system-contract';

/**
 * Template context handed to `[ffListItem]` and `[ffListExpansion]`
 * `<ng-template>`s: `$implicit` is the item, `index` its zero-based position
 * within the currently rendered page.
 */
export interface FfListTemplateContext<T> {
  $implicit: T;
  index: number;
}

/**
 * Marks an `<ng-template>` projected into `ff-list` as the renderer for each
 * item. Required — `ff-list` has no columns, so there is no default
 * rendering to fall back to.
 *
 * @example
 * ```html
 * <ff-list [items]="notifications()">
 *   <ng-template ffListItem let-item>
 *     <strong>{{ item.title }}</strong> — {{ item.body }}
 *   </ng-template>
 * </ff-list>
 * ```
 */
@Directive({ selector: '[ffListItem]', standalone: true })
export class FfListItemTemplateDirective<T = unknown> {
  /** Template reference captured by `ff-list` and rendered once per item via `NgTemplateOutlet`. */
  readonly templateRef = inject<TemplateRef<FfListTemplateContext<T>>>(TemplateRef);
}

/**
 * Marks an `<ng-template>` projected into `ff-list` as the renderer of the
 * expansion panel shown below an expanded item (requires `expandable`).
 */
@Directive({ selector: '[ffListExpansion]', standalone: true })
export class FfListExpansionTemplateDirective<T = unknown> {
  /** Template reference captured by `ff-list` and rendered below an expanded item via `NgTemplateOutlet`. */
  readonly templateRef = inject<TemplateRef<FfListTemplateContext<T>>>(TemplateRef);
}

/**
 * Firefly list pattern.
 *
 * A deliberately separate pattern from `ff-data-table` — no columns, each
 * entry renders through the required `[ffListItem]` template — but sharing
 * the exact same selection, pagination, expansion and empty-state model:
 * single/multi selection with a "select all" checkbox, an optional
 * `[ffListExpansion]` panel per item, server-side pagination, and a
 * loading/empty state composing `ff-skeleton` / `ff-empty-state` (falling
 * back to the value configured globally via `provideFfNoResultsConfig`,
 * shared with `ff-data-table`). Root semantics adapt to `selectionMode`:
 * plain `role="list"` when selection is off, `role="listbox"` with
 * `role="option"` entries when it is on (pattern tier — primitives only:
 * `ff-checkbox`, `ff-skeleton`, `ff-empty-state`, `ff-icon`, `ff-button`).
 *
 * Does not implement drag-and-drop item reordering or virtual scrolling.
 *
 * @example
 * ```html
 * <ff-list
 *   [items]="notifications()"
 *   [loading]="loading()"
 *   selectionMode="multi"
 *   [selectedItems]="selected()"
 *   (selectionChange)="selected.set($event.selected)"
 *   [pagination]="pagination()"
 *   (pageChange)="onPageChange($event)"
 * >
 *   <ng-template ffListItem let-item>
 *     <strong>{{ item.title }}</strong>
 *   </ng-template>
 * </ff-list>
 * ```
 */
@Component({
  selector: 'ff-list',
  standalone: true,
  imports: [
    NgTemplateOutlet,
    FfCheckboxComponent,
    FfSkeletonComponent,
    FfEmptyStateComponent,
    FfIconComponent,
    FfButtonComponent,
  ],
  templateUrl: './ff-list.component.html',
  styleUrl: './ff-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    class: 'ff-list',
  },
})
export class FfListComponent<T = unknown> {
  /** @internal Sequence used to build unique expansion-panel ids per instance. */
  private static instanceCount = 0;

  /** @internal Optional application-wide empty-state text, registered via `provideFfNoResultsConfig`. */
  private readonly noResultsConfig = inject(FF_NO_RESULTS_CONFIG, { optional: true });

  /** @internal Unique id prefix for this instance's expansion panels. */
  private readonly instanceId = `ff-list-${FfListComponent.instanceCount++}`;

  /** Items for the currently rendered page. */
  readonly items = input.required<readonly T[]>();

  /** Shows skeleton placeholder items instead of `items`. */
  readonly loading = input(false);

  /** Number of skeleton items rendered while `loading`. */
  readonly skeletonItemCount = input(5);

  /** Selection mode: `'none'` | `'single'` | `'multi'`. Defaults to `'none'`. */
  readonly selectionMode = input<FfSelectionMode>('none');

  /** Currently selected items. */
  readonly selectedItems = input<readonly T[]>([]);

  /** Enables the expand/collapse toggle and expansion-panel content per item. */
  readonly expandable = input(false);

  /** Currently expanded items. */
  readonly expandedItems = input<readonly T[]>([]);

  /** Server-side pagination state; omit to render without a pagination footer. */
  readonly pagination = input<FfPaginationState>();

  /** Overrides the global no-results title for this instance. */
  readonly emptyTitle = input<string>();

  /** Overrides the global no-results description for this instance. */
  readonly emptyDescription = input<string>();

  /**
   * Resolves a stable identity for an item, used for `@for` tracking.
   * Defaults to positional tracking (`index`) when omitted.
   */
  readonly trackBy = input<(item: T, index: number) => unknown>();

  /** Emits the full selection after it changes. */
  readonly selectionChange = output<FfSelectionChangeEvent<T>>();

  /** Emits when an item is clicked (outside the selection checkbox and expand toggle). */
  readonly itemClick = output<FfRowEvent<T>>();

  /** Emits when an item is expanded or collapsed. */
  readonly expandedChange = output<FfExpandChangeEvent<T>>();

  /** Emits the requested page/page size from the pagination footer. */
  readonly pageChange = output<FfPageChangeEvent>();

  /** Required per-item renderer. */
  protected readonly itemTemplate = contentChild.required(FfListItemTemplateDirective);

  /** Custom expansion-panel renderer, if projected. */
  protected readonly expansionTemplate = contentChild(FfListExpansionTemplateDirective);

  /** @internal `role` of the list root: `listbox` when selectable, `list` otherwise. */
  protected readonly rootRole = computed(() => (this.selectionMode() === 'none' ? 'list' : 'listbox'));

  /** @internal Indices used to render `skeletonItemCount` placeholder entries. */
  protected readonly skeletonItems = computed(() =>
    Array.from({ length: Math.max(0, this.skeletonItemCount()) }, (_, i) => i)
  );

  /** @internal `true` when every item of the current page is selected. */
  protected readonly isAllSelected = computed(() => {
    const current = this.items();
    return current.length > 0 && current.every((item) => this.selectedItems().includes(item));
  });

  /** @internal `true` when some, but not all, items of the current page are selected. */
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

  /** @internal Resolves an item's `@for` tracking key via `trackBy`, defaulting to its index. */
  protected itemKey(item: T, index: number): unknown {
    const resolve = this.trackBy();
    return resolve ? resolve(item, index) : index;
  }

  /** @internal `role` applied to each rendered entry, matching the root's selection semantics. */
  protected itemRole(): 'listitem' | 'option' {
    return this.selectionMode() === 'none' ? 'listitem' : 'option';
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

  /** @internal Toggles a single item's selection, respecting single/multi mode. */
  protected toggleItem(item: T): void {
    if (this.selectionMode() === 'single') {
      this.selectionChange.emit({ selected: this.isSelected(item) ? [] : [item] });
      return;
    }
    const current = this.selectedItems();
    this.selectionChange.emit({
      selected: this.isSelected(item) ? current.filter((i) => i !== item) : [...current, item],
    });
  }

  /** @internal Emits `itemClick` for a whole-item interaction (outside checkbox/expand controls). */
  protected onItemClick(item: T, index: number): void {
    this.itemClick.emit({ item, index });
  }

  /** @internal Whether `item`'s expansion panel is currently shown. */
  protected isExpanded(item: T): boolean {
    return this.expandedItems().includes(item);
  }

  /** @internal Toggles an item's expansion state and emits `expandedChange`. */
  protected toggleExpand(item: T): void {
    this.expandedChange.emit({ item, expanded: !this.isExpanded(item) });
  }

  /** @internal Id of an expansion panel, referenced by its toggle's `aria-controls`. */
  protected expansionPanelId(index: number): string {
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
