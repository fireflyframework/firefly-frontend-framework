import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import {
  FfBadgeComponent,
  FfDataTableCellTemplateDirective,
  FfDataTableComponent,
  FfDataTableExpansionTemplateDirective,
  FfDataTableHeader,
  FfExpandChangeEvent,
  FfPageChangeEvent,
  FfPaginationState,
  FfRowEvent,
  FfSelectionChangeEvent,
  FfSortChangeEvent,
  FfSortDirection,
} from '@fireflyframework/design-system';

import { DemoSection } from '../../shared/demo-section';

/** Row shape used by the `ff-data-table` demo. */
interface Invoice extends Record<string, unknown> {
  id: number;
  customer: string;
  amount: number;
  status: 'paid' | 'pending' | 'overdue';
  notes: string;
}

/** In-memory mock "server" dataset — never rendered directly, only through `fetchPage`. */
const ALL_INVOICES: readonly Invoice[] = Array.from({ length: 23 }, (_, i) => {
  const id = i + 1;
  const status: Invoice['status'] = id % 5 === 0 ? 'overdue' : id % 2 === 0 ? 'pending' : 'paid';
  return {
    id,
    customer: `Customer ${String.fromCharCode(65 + (id % 12))}`,
    amount: 100 + id * 17.5,
    status,
    notes: `Invoice #${id} issued for professional services rendered in the current billing cycle.`,
  };
});

const HEADERS: readonly FfDataTableHeader[] = [
  { key: 'customer', label: 'Customer', sortable: true },
  { key: 'amount', label: 'Amount', sortable: true, align: 'end' },
  { key: 'status', label: 'Status' },
];

const STATUS_VARIANT: Record<Invoice['status'], 'success' | 'warning' | 'error'> = {
  paid: 'success',
  pending: 'warning',
  overdue: 'error',
};

/** Pattern page for `ff-data-table`, backed by a mock server simulating latency. */
@Component({
  selector: 'app-data-table-page',
  imports: [
    DemoSection,
    FfDataTableComponent,
    FfDataTableCellTemplateDirective,
    FfDataTableExpansionTemplateDirective,
    FfBadgeComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="page">
      <h2 class="page__title">Data Table</h2>
      <p class="page__lead">
        <code>&lt;ff-data-table&gt;</code> — typed headers with cell/row/expansion templates,
        server-side sorting, single/multi selection and server-side pagination. This demo fetches
        from an in-memory mock "server" with a simulated 400ms latency, so loading skeletons are
        genuinely driven by <code>[loading]</code> between requests.
      </p>

      <app-demo-section
        heading="Sorting, selection, custom cell and expansion templates"
        description="Click a sortable header to cycle asc → desc → unsorted. Select rows, expand one to see its notes.
          Change the page size from the footer control."
        [code]="snippet"
      >
        <div class="demo-stack" style="max-width: 100%">
          <ff-data-table
            caption="Invoices"
            [headers]="headers"
            [items]="items()"
            [loading]="loading()"
            selectionMode="multi"
            [selectedItems]="selected()"
            (selectionChange)="onSelectionChange($event)"
            [sortKey]="sortKey()"
            [sortDirection]="sortDirection()"
            (sortChange)="onSortChange($event)"
            [expandable]="true"
            [expandedItems]="expanded()"
            (expandedChange)="onExpandedChange($event)"
            (rowClick)="onRowClick($event)"
            [pagination]="pagination()"
            (pageChange)="onPageChange($event)"
          >
            <ng-template ffDataTableCell="amount" let-row>
              {{ '$' + row.amount.toFixed(2) }}
            </ng-template>
            <ng-template ffDataTableCell="status" let-row>
              <ff-badge [variant]="statusVariant(row.status)" size="sm">{{ row.status }}</ff-badge>
            </ng-template>
            <ng-template ffDataTableExpansion let-row>
              <p style="margin: 0">{{ row.notes }}</p>
            </ng-template>
          </ff-data-table>
          <span class="demo-label">selected = {{ selected().length }} · last row click = {{ lastRowClick() }}</span>
        </div>
      </app-demo-section>

      <app-demo-section
        heading="Loading, empty and no-results states"
        description="Loading composes ff-skeleton; empty composes ff-empty-state. The first table falls back to the
          application-wide text registered via provideFfNoResultsConfig; the second overrides it per instance."
        [code]="snippets.empty"
      >
        <div class="demo-stack" style="max-width: 100%">
          <span class="demo-label">Global provideFfNoResultsConfig default</span>
          <ff-data-table [headers]="headers" [items]="[]" />

          <span class="demo-label">Per-instance override</span>
          <ff-data-table
            [headers]="headers"
            [items]="[]"
            emptyTitle="No invoices yet"
            emptyDescription="Invoices you issue will show up here."
          />

          <span class="demo-label">Loading skeleton</span>
          <ff-data-table [headers]="headers" [items]="[]" [loading]="true" [skeletonRowCount]="3" />
        </div>
      </app-demo-section>
    </div>
  `,
})
export class DataTablePage {
  protected readonly headers = HEADERS;

  protected readonly page = signal(1);
  protected readonly pageSize = signal(5);
  protected readonly sortKey = signal<string | undefined>(undefined);
  protected readonly sortDirection = signal<FfSortDirection>(null);
  protected readonly loading = signal(false);
  protected readonly items = signal<readonly Invoice[]>([]);
  protected readonly total = signal(0);
  protected readonly selected = signal<readonly Invoice[]>([]);
  protected readonly expanded = signal<readonly Invoice[]>([]);
  protected readonly lastRowClick = signal('none');

  protected readonly pagination = signal<FfPaginationState>({
    page: 1,
    pageSize: this.pageSize(),
    total: 0,
    pageSizeOptions: [5, 10, 20],
  });

  protected readonly snippet = `<ff-data-table
  caption="Invoices"
  [headers]="headers"
  [items]="items()"
  [loading]="loading()"
  selectionMode="multi"
  [selectedItems]="selected()"
  (selectionChange)="selected.set($event.selected)"
  [sortKey]="sortKey()"
  [sortDirection]="sortDirection()"
  (sortChange)="onSortChange($event)"
  [pagination]="pagination()"
  (pageChange)="onPageChange($event)"
>
  <ng-template ffDataTableCell="status" let-row>
    <ff-badge [variant]="statusVariant(row.status)">{{ row.status }}</ff-badge>
  </ng-template>
</ff-data-table>

// pagination() includes pageSizeOptions: [5, 10, 20] — renders a page-size <ff-select>
// in the footer; changing it emits pageChange with the new pageSize and page reset to 1.`;

  protected readonly snippets = {
    empty: `provideFfNoResultsConfig({ title: 'No records found', description: '…' }); // app.config.ts

<ff-data-table [headers]="headers" [items]="[]" />
<ff-data-table [headers]="headers" [items]="[]" emptyTitle="No invoices yet" />`,
  };

  constructor() {
    this.fetchPage();
  }

  protected statusVariant(status: Invoice['status']): 'success' | 'warning' | 'error' {
    return STATUS_VARIANT[status];
  }

  protected onSortChange(event: FfSortChangeEvent): void {
    this.sortKey.set(event.direction ? event.key : undefined);
    this.sortDirection.set(event.direction);
    this.page.set(1);
    this.fetchPage();
  }

  protected onSelectionChange(event: FfSelectionChangeEvent<Invoice>): void {
    this.selected.set(event.selected);
  }

  protected onExpandedChange(event: FfExpandChangeEvent<Invoice>): void {
    const current = this.expanded();
    this.expanded.set(
      event.expanded
        ? [...current, event.item]
        : current.filter((selectedItem) => selectedItem !== event.item)
    );
  }

  protected onRowClick(event: FfRowEvent<Invoice>): void {
    this.lastRowClick.set(event.item.customer);
  }

  protected onPageChange(event: FfPageChangeEvent): void {
    this.page.set(event.page);
    this.pageSize.set(event.pageSize);
    this.fetchPage();
  }

  /** Simulates a server-side fetch: sorts, paginates and applies a 400ms latency. */
  private fetchPage(): void {
    this.loading.set(true);
    const key = this.sortKey();
    const direction = this.sortDirection();
    const sorted = key && direction ? sortInvoices(ALL_INVOICES, key, direction) : ALL_INVOICES;
    const pageSize = this.pageSize();
    const start = (this.page() - 1) * pageSize;
    const pageItems = sorted.slice(start, start + pageSize);

    setTimeout(() => {
      this.items.set(pageItems);
      this.total.set(sorted.length);
      this.loading.set(false);
      this.pagination.set({
        page: this.page(),
        pageSize,
        total: sorted.length,
        pageSizeOptions: [5, 10, 20],
      });
    }, 400);
  }
}

/** Sorts the mock dataset by a column key, ascending or descending. */
function sortInvoices(
  rows: readonly Invoice[],
  key: string,
  direction: NonNullable<FfSortDirection>
): readonly Invoice[] {
  const factor = direction === 'asc' ? 1 : -1;
  return [...rows].sort((a, b) => {
    const leftValue = a[key as keyof Invoice];
    const rightValue = b[key as keyof Invoice];
    if (typeof leftValue === 'number' && typeof rightValue === 'number') {
      return (leftValue - rightValue) * factor;
    }
    return String(leftValue).localeCompare(String(rightValue)) * factor;
  });
}
