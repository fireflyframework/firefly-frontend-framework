import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  Directive,
  TemplateRef,
  ViewEncapsulation,
  computed,
  contentChild,
  effect,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import type {
  FfExpandChangeEvent,
  FfPageChangeEvent,
  FfPaginationState,
  FfRowEvent,
  FfSelectionChangeEvent,
  FfSelectionMode,
} from '@fireflyframework/design-system-contract';

import { FF_NO_RESULTS_CONFIG } from '../no-results-config';
import { FfButtonComponent } from '../../primitives/ff-button';
import { FfCheckboxComponent } from '../../primitives/ff-checkbox';
import { FfEmptyStateComponent } from '../../primitives/ff-empty-state';
import { FfIconComponent } from '../../primitives/ff-icon';
import type { FfSelectOption } from '../../primitives/ff-select';
import { FfSelectComponent } from '../../primitives/ff-select';
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
 * `[ffListExpansion]` panel per item, server-side pagination (including an
 * optional page-size control, composing `ff-select`), and a loading/empty
 * state composing `ff-skeleton` / `ff-empty-state` (falling back to the
 * value configured globally via `provideFfNoResultsConfig`, shared with
 * `ff-data-table`).
 *
 * Root semantics adapt to `selectionMode`: plain `role="list"` with
 * `role="listitem"` entries, no keyboard model, when selection is off; a
 * real `role="listbox"` with `role="option"` entries and a full keyboard
 * contract (arrow keys, Home/End, Space, Enter — see `list.contract.ts`)
 * when it is on. While the listbox is active, the per-item selection
 * checkbox is purely visual (`aria-hidden`, `inert`): a focusable/clickable
 * control is not permitted inside `role="option"`, so selection is instead
 * conveyed by `aria-selected` and driven by clicking the option or pressing
 * Space. The expansion toggle is rendered as a sibling of the option for the
 * same reason — its own interactive semantics must not nest inside it.
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
    FfSelectComponent,
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
  /** @internal Sequence used to build unique option/expansion-panel ids per instance. */
  private static instanceCount = 0;

  /** @internal Optional application-wide empty-state text, registered via `provideFfNoResultsConfig`. */
  private readonly noResultsConfig = inject(FF_NO_RESULTS_CONFIG, { optional: true });

  /** @internal Unique id prefix for this instance's options and expansion panels. */
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

  /**
   * Decides whether two items are "the same" for selection and expansion
   * membership (`isSelected`, the select-all indeterminate/checked state,
   * `isExpanded`, …). Defaults to reference equality (`a === b`).
   *
   * Pass a domain-id comparison (e.g. `(a, b) => a.id === b.id`) so
   * selection and expansion survive a re-fetch that returns equivalent but
   * non-identical item objects — without it, refreshing `items` from a new
   * server response silently drops the selection even though the same
   * logical items are still present.
   *
   * Unrelated to `trackBy`, which only drives the `@for` rendering loop.
   */
  readonly compareWith = input<(a: T, b: T) => boolean>((a, b) => a === b);

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
   * Resolves a stable identity for an item, used for `@for` tracking only —
   * it has no effect on selection or expansion membership (see
   * `compareWith` for that). Defaults to positional tracking (`index`) when
   * omitted.
   */
  readonly trackBy = input<(item: T, index: number) => unknown>();

  /** Emits the full selection after it changes. */
  readonly selectionChange = output<FfSelectionChangeEvent<T>>();

  /** Emits when an item is clicked (outside the selection control and expand toggle). */
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

  /**
   * @internal Index of the keyboard-active option within `items()`, or `-1`
   * before the listbox has ever been focused (or right after `items`
   * changes to a new page, so the next focus/keydown re-resolves it).
   */
  private readonly activeIndexState = signal(-1);

  /** @internal Resets the active option whenever the rendered page changes. */
  private readonly resetActiveIndexOnPageChange = effect(() => {
    this.items();
    this.activeIndexState.set(-1);
  });

  /** @internal Clamped active index, or `-1` when out of range (e.g. an empty page). */
  protected readonly activeIndex = computed(() => {
    const idx = this.activeIndexState();
    return idx >= 0 && idx < this.items().length ? idx : -1;
  });

  /** @internal `id` of the active option, or `null`; drives `aria-activedescendant`. */
  protected readonly activeOptionId = computed(() => {
    const idx = this.activeIndex();
    return idx >= 0 ? this.optionId(idx) : null;
  });

  /** @internal `true` when every item of the current page is selected. */
  protected readonly isAllSelected = computed(() => {
    const current = this.items();
    const compare = this.compareWith();
    const selected = this.selectedItems();
    return current.length > 0 && current.every((item) => selected.some((s) => compare(s, item)));
  });

  /** @internal `true` when some, but not all, items of the current page are selected. */
  protected readonly isSomeSelected = computed(() => {
    const compare = this.compareWith();
    const selected = this.selectedItems();
    return !this.isAllSelected() && this.items().some((item) => selected.some((s) => compare(s, item)));
  });

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

  /** @internal DOM id of the option at `index`, unique within this instance. */
  protected optionId(index: number): string {
    return `${this.instanceId}-option-${index}`;
  }

  /** @internal Whether `item` is part of the current selection, per `compareWith`. */
  protected isSelected(item: T): boolean {
    const compare = this.compareWith();
    return this.selectedItems().some((selected) => compare(selected, item));
  }

  /** @internal Toggles the whole current page in/out of the selection (multi mode only). */
  protected toggleAll(): void {
    const compare = this.compareWith();
    const current = this.items();
    if (this.isAllSelected()) {
      this.selectionChange.emit({
        selected: this.selectedItems().filter(
          (selected) => !current.some((item) => compare(selected, item))
        ),
      });
      return;
    }
    const merged = [...this.selectedItems()];
    for (const item of current) {
      if (!merged.some((selected) => compare(selected, item))) {
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
    const compare = this.compareWith();
    const current = this.selectedItems();
    this.selectionChange.emit({
      selected: this.isSelected(item)
        ? current.filter((selectedItem) => !compare(selectedItem, item))
        : [...current, item],
    });
  }

  /**
   * @internal Handles a click on an item's `role="option"`/`role="listitem"`
   * row. In selection mode, the click toggles selection — mirroring a
   * native listbox, where clicking an option selects it. Outside selection
   * mode (plain list), the click emits `itemClick` instead.
   */
  protected onOptionClick(item: T, index: number): void {
    if (this.selectionMode() !== 'none') {
      this.toggleItem(item);
      return;
    }
    this.itemClick.emit({ item, index });
  }

  /** @internal Whether `item`'s expansion panel is currently shown, per `compareWith`. */
  protected isExpanded(item: T): boolean {
    const compare = this.compareWith();
    return this.expandedItems().some((expanded) => compare(expanded, item));
  }

  /** @internal Toggles an item's expansion state and emits `expandedChange`. */
  protected toggleExpand(item: T): void {
    this.expandedChange.emit({ item, expanded: !this.isExpanded(item) });
  }

  /** @internal Id of an expansion panel, referenced by its toggle's `aria-controls`. */
  protected expansionPanelId(index: number): string {
    return `${this.instanceId}-expansion-${index}`;
  }

  /**
   * @internal Activates the initial option on the listbox container's first
   * focus: the first selected item if there is one, otherwise the first
   * item. No-ops once an active option is already set (e.g. by keyboard
   * navigation) or when there is nothing to activate.
   */
  protected onContainerFocus(): void {
    if (this.selectionMode() === 'none' || this.activeIndexState() !== -1) {
      return;
    }
    const current = this.items();
    if (current.length === 0) {
      return;
    }
    const compare = this.compareWith();
    const selected = this.selectedItems();
    const firstSelectedIndex = current.findIndex((item) => selected.some((s) => compare(s, item)));
    this.activeIndexState.set(firstSelectedIndex >= 0 ? firstSelectedIndex : 0);
  }

  /**
   * @internal Full listbox keyboard contract for the container: ArrowUp/Down
   * move the active option one position at a time (clamped, no
   * wraparound — consistent with `ff-select`'s own listbox navigation),
   * Home/End jump to the first/last item, Space toggles the active option's
   * selection, and Enter emits `itemClick` for it. A no-op outside
   * selection mode.
   */
  protected onContainerKeydown(event: KeyboardEvent): void {
    if (this.selectionMode() === 'none') {
      return;
    }
    const current = this.items();
    if (current.length === 0) {
      return;
    }
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this.moveActive(1, current.length);
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.moveActive(-1, current.length);
        break;
      case 'Home':
        event.preventDefault();
        this.activeIndexState.set(0);
        break;
      case 'End':
        event.preventDefault();
        this.activeIndexState.set(current.length - 1);
        break;
      case ' ': {
        event.preventDefault();
        const idx = this.activeIndex();
        if (idx >= 0) {
          this.toggleItem(current[idx]);
        }
        break;
      }
      case 'Enter': {
        const idx = this.activeIndex();
        if (idx >= 0) {
          this.itemClick.emit({ item: current[idx], index: idx });
        }
        break;
      }
      default:
        break;
    }
  }

  /** @internal Moves the active index by `delta`, clamped to `[0, length - 1]` (no wraparound). */
  private moveActive(delta: number, length: number): void {
    const current = this.activeIndexState();
    const base = current === -1 ? 0 : current;
    const next = Math.min(Math.max(base + delta, 0), length - 1);
    this.activeIndexState.set(next);
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

  /** @internal Maps `pageSizeOptions` to `ff-select` options, string-valued since `ff-select` works with string values. */
  protected pageSizeSelectOptions(options: readonly number[]): FfSelectOption[] {
    return options.map((size) => ({ label: String(size), value: String(size) }));
  }

  /** @internal Current page size as the string value `ff-select` expects. */
  protected pageSizeValue(pagination: FfPaginationState): string {
    return String(pagination.pageSize);
  }

  /**
   * @internal Requests a different page size, resetting `page` to `1` since
   * the previous page number is meaningless against a different page size.
   * No-ops when the requested size matches the current one.
   */
  protected onPageSizeChange(value: string, pagination: FfPaginationState): void {
    const pageSize = Number(value);
    if (!Number.isFinite(pageSize) || pageSize === pagination.pageSize) {
      return;
    }
    this.pageChange.emit({ page: 1, pageSize });
  }
}
