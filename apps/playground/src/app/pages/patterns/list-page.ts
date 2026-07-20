import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import {
  FfBadgeComponent,
  FfExpandChangeEvent,
  FfListComponent,
  FfListExpansionTemplateDirective,
  FfListItemTemplateDirective,
  FfPageChangeEvent,
  FfPaginationState,
  FfRowEvent,
  FfSelectionChangeEvent,
} from '@fireflyframework/design-system';

import { DemoSection } from '../../shared/demo-section';

/** Item shape used by the `ff-list` demo. */
interface Notification {
  id: number;
  title: string;
  body: string;
  unread: boolean;
}

/** In-memory mock "server" dataset — never rendered directly, only through `fetchPage`. */
const ALL_NOTIFICATIONS: readonly Notification[] = Array.from({ length: 18 }, (_, i) => {
  const id = i + 1;
  return {
    id,
    title: `Notification ${id}`,
    body: `Details for notification ${id} — generated for the ff-list pagination demo.`,
    unread: id % 3 === 0,
  };
});

/**
 * Pattern page for `ff-list`. `ff-list` is a pattern of its own (not a mode
 * of `ff-data-table`): no columns, one `[ffListItem]` template per entry,
 * sharing the same selection/pagination/empty-state model demonstrated on
 * the Data Table page.
 */
@Component({
  selector: 'app-list-page',
  imports: [
    DemoSection,
    FfListComponent,
    FfListItemTemplateDirective,
    FfListExpansionTemplateDirective,
    FfBadgeComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="page">
      <h2 class="page__title">List</h2>
      <p class="page__lead">
        <code>&lt;ff-list&gt;</code> — item-per-template collection sharing
        <code>ff-data-table</code>'s selection, pagination, expansion and empty-state model,
        without columns. This demo fetches from an in-memory mock "server" with a simulated
        350ms latency.
      </p>

      <app-demo-section
        heading="Selection, expansion and server-side pagination"
        description="Select items, expand one for details. role adapts to selectionMode: listbox/option here."
        [code]="snippet"
      >
        <div class="demo-stack" style="max-width: 100%">
          <ff-list
            [items]="items()"
            [loading]="loading()"
            selectionMode="multi"
            [selectedItems]="selected()"
            (selectionChange)="onSelectionChange($event)"
            [expandable]="true"
            [expandedItems]="expanded()"
            (expandedChange)="onExpandedChange($event)"
            (itemClick)="onItemClick($event)"
            [pagination]="pagination()"
            (pageChange)="onPageChange($event)"
          >
            <ng-template ffListItem let-item>
              <strong>{{ item.title }}</strong>
              @if (item.unread) {
                <ff-badge variant="info" size="sm">Unread</ff-badge>
              }
            </ng-template>
            <ng-template ffListExpansion let-item>
              <p style="margin: 0">{{ item.body }}</p>
            </ng-template>
          </ff-list>
          <span class="demo-label">selected = {{ selected().length }} · last item click = {{ lastItemClick() }}</span>
        </div>
      </app-demo-section>

      <app-demo-section
        heading="Loading and empty states"
        description="Same shared no-results text as ff-data-table, configured once via provideFfNoResultsConfig."
        [code]="snippets.empty"
      >
        <div class="demo-stack" style="max-width: 100%">
          <span class="demo-label">Global provideFfNoResultsConfig default</span>
          <ff-list [items]="[]">
            <ng-template ffListItem let-item>{{ item.title }}</ng-template>
          </ff-list>

          <span class="demo-label">Loading skeleton</span>
          <ff-list [items]="[]" [loading]="true" [skeletonItemCount]="3">
            <ng-template ffListItem let-item>{{ item.title }}</ng-template>
          </ff-list>
        </div>
      </app-demo-section>
    </div>
  `,
})
export class ListPage {
  protected readonly page = signal(1);
  protected readonly pageSize = 5;
  protected readonly loading = signal(false);
  protected readonly items = signal<readonly Notification[]>([]);
  protected readonly selected = signal<readonly Notification[]>([]);
  protected readonly expanded = signal<readonly Notification[]>([]);
  protected readonly lastItemClick = signal('none');

  protected readonly pagination = signal<FfPaginationState>({
    page: 1,
    pageSize: this.pageSize,
    total: 0,
  });

  protected readonly snippet = `<ff-list
  [items]="items()"
  [loading]="loading()"
  selectionMode="multi"
  [selectedItems]="selected()"
  (selectionChange)="selected.set($event.selected)"
  [pagination]="pagination()"
  (pageChange)="onPageChange($event)"
>
  <ng-template ffListItem let-item>{{ item.title }}</ng-template>
</ff-list>`;

  protected readonly snippets = {
    empty: `provideFfNoResultsConfig({ title: 'No records found', description: '…' }); // app.config.ts, shared with ff-data-table

<ff-list [items]="[]"><ng-template ffListItem let-item>{{ item.title }}</ng-template></ff-list>`,
  };

  constructor() {
    this.fetchPage();
  }

  protected onSelectionChange(event: FfSelectionChangeEvent<Notification>): void {
    this.selected.set(event.selected);
  }

  protected onExpandedChange(event: FfExpandChangeEvent<Notification>): void {
    const current = this.expanded();
    this.expanded.set(
      event.expanded ? [...current, event.item] : current.filter((i) => i !== event.item)
    );
  }

  protected onItemClick(event: FfRowEvent<Notification>): void {
    this.lastItemClick.set(event.item.title);
  }

  protected onPageChange(event: FfPageChangeEvent): void {
    this.page.set(event.page);
    this.fetchPage();
  }

  /** Simulates a server-side fetch: paginates the mock dataset with a 350ms latency. */
  private fetchPage(): void {
    this.loading.set(true);
    const start = (this.page() - 1) * this.pageSize;
    const pageItems = ALL_NOTIFICATIONS.slice(start, start + this.pageSize);

    setTimeout(() => {
      this.items.set(pageItems);
      this.loading.set(false);
      this.pagination.set({
        page: this.page(),
        pageSize: this.pageSize,
        total: ALL_NOTIFICATIONS.length,
      });
    }, 350);
  }
}
