import 'zone.js';
import 'zone.js/testing';
import { Component, EnvironmentProviders } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import {
  BrowserTestingModule,
  platformBrowserTesting,
} from '@angular/platform-browser/testing';
import type { FfPaginationState } from '@fireflyframework/design-system-contract';

import { provideFfIcons } from '../../primitives/ff-icon';
import {
  FfDataTableCellTemplateDirective,
  FfDataTableComponent,
  FfDataTableExpansionTemplateDirective,
  FfDataTableRowTemplateDirective,
} from './ff-data-table.component';
import { provideFfNoResultsConfig } from './no-results-config';

TestBed.initTestEnvironment(BrowserTestingModule, platformBrowserTesting(), {
  teardown: { destroyAfterEach: true },
});

interface Row extends Record<string, unknown> {
  id: number;
  name: string;
  status: string;
}

const ROWS: readonly Row[] = [
  { id: 1, name: 'Alpha', status: 'active' },
  { id: 2, name: 'Beta', status: 'inactive' },
  { id: 3, name: 'Gamma', status: 'active' },
];

const HEADERS = [
  { key: 'name', label: 'Name', sortable: true },
  { key: 'status', label: 'Status' },
] as const;

const ICON_PROVIDER = provideFfIcons({
  'chevron-down': 'M0 0',
  'chevron-right': 'M0 0',
  'chevron-left': 'M0 0',
});

describe('FfDataTableComponent', () => {
  function setup(
    inputs: Partial<{
      selectionMode: 'none' | 'single' | 'multi';
      selectedItems: readonly Row[];
      expandable: boolean;
      expandedItems: readonly Row[];
      loading: boolean;
      items: readonly Row[];
      pagination: FfPaginationState;
      emptyTitle: string;
    }> = {},
    providers: EnvironmentProviders[] = [ICON_PROVIDER]
  ) {
    TestBed.configureTestingModule({
      imports: [FfDataTableComponent],
      providers,
    });
    const fixture = TestBed.createComponent(FfDataTableComponent<Row>);
    fixture.componentRef.setInput('headers', HEADERS);
    fixture.componentRef.setInput('items', inputs.items ?? ROWS);
    if (inputs.selectionMode) fixture.componentRef.setInput('selectionMode', inputs.selectionMode);
    if (inputs.selectedItems) fixture.componentRef.setInput('selectedItems', inputs.selectedItems);
    if (inputs.expandable !== undefined) fixture.componentRef.setInput('expandable', inputs.expandable);
    if (inputs.expandedItems) fixture.componentRef.setInput('expandedItems', inputs.expandedItems);
    if (inputs.loading !== undefined) fixture.componentRef.setInput('loading', inputs.loading);
    if (inputs.pagination) fixture.componentRef.setInput('pagination', inputs.pagination);
    if (inputs.emptyTitle) fixture.componentRef.setInput('emptyTitle', inputs.emptyTitle);
    fixture.detectChanges();
    return fixture;
  }

  it('renders one <th> per header plus the label text', () => {
    const fixture = setup();
    const headCells = fixture.nativeElement.querySelectorAll('.ff-data-table__head-cell');
    expect(headCells.length).toBe(2);
    expect(headCells[0].textContent).toContain('Name');
    expect(headCells[1].textContent).toContain('Status');
  });

  it('renders one row per item with default item[key] cell rendering', () => {
    const fixture = setup();
    const rows = fixture.nativeElement.querySelectorAll('.ff-data-table__row');
    expect(rows.length).toBe(3);
    expect(rows[0].textContent).toContain('Alpha');
    expect(rows[0].textContent).toContain('active');
    expect(rows[1].textContent).toContain('Beta');
  });

  it('applies scope="col" to header cells and aria-sort only on sortable ones', () => {
    const fixture = setup();
    const headCells: HTMLElement[] = Array.from(
      fixture.nativeElement.querySelectorAll('.ff-data-table__head-cell')
    );
    expect(headCells[0].getAttribute('scope')).toBe('col');
    expect(headCells[0].getAttribute('aria-sort')).toBe('none');
    expect(headCells[1].hasAttribute('aria-sort')).toBe(false);
  });

  it('cycles sort direction asc -> desc -> none on repeated activation', () => {
    const fixture = setup();
    const events: { key: string; direction: string | null }[] = [];
    fixture.componentInstance.sortChange.subscribe((e) => events.push(e));
    const sortButton: HTMLButtonElement = fixture.nativeElement.querySelector(
      '.ff-data-table__sort-button'
    );

    sortButton.click();
    expect(events[0]).toEqual({ key: 'name', direction: 'asc' });

    fixture.componentRef.setInput('sortKey', 'name');
    fixture.componentRef.setInput('sortDirection', 'asc');
    fixture.detectChanges();
    sortButton.click();
    expect(events[1]).toEqual({ key: 'name', direction: 'desc' });

    fixture.componentRef.setInput('sortDirection', 'desc');
    fixture.detectChanges();
    sortButton.click();
    expect(events[2]).toEqual({ key: 'name', direction: null });
  });

  it('reflects the active sort with aria-sort ascending/descending', () => {
    const fixture = setup();
    fixture.componentRef.setInput('sortKey', 'name');
    fixture.componentRef.setInput('sortDirection', 'desc');
    fixture.detectChanges();
    const headCell = fixture.nativeElement.querySelector('.ff-data-table__head-cell--sortable');
    expect(headCell.getAttribute('aria-sort')).toBe('descending');
  });

  describe('selection', () => {
    it('renders a checkbox column and toggles a row on/off in multi mode', () => {
      const fixture = setup({ selectionMode: 'multi' });
      const events: { selected: readonly Row[] }[] = [];
      fixture.componentInstance.selectionChange.subscribe((e) => events.push(e));

      const checkbox: HTMLInputElement = fixture.nativeElement.querySelectorAll(
        '.ff-data-table__cell--checkbox input'
      )[0];
      checkbox.click();

      expect(events[0].selected).toEqual([ROWS[0]]);
    });

    it('marks the select-all checkbox indeterminate when some rows are selected, checked when all are', () => {
      const partial = setup({ selectionMode: 'multi', selectedItems: [ROWS[0]] });
      const headCheckbox = partial.nativeElement.querySelector(
        '.ff-data-table__head-cell--checkbox input'
      ) as HTMLInputElement;
      expect(headCheckbox.indeterminate).toBe(true);
      expect(headCheckbox.checked).toBe(false);

      TestBed.resetTestingModule();
      const all = setup({ selectionMode: 'multi', selectedItems: ROWS });
      const allHeadCheckbox = all.nativeElement.querySelector(
        '.ff-data-table__head-cell--checkbox input'
      ) as HTMLInputElement;
      expect(allHeadCheckbox.checked).toBe(true);
      expect(allHeadCheckbox.indeterminate).toBe(false);
    });

    it('selects every rendered row when select-all is toggled from empty, and clears them when toggled again', () => {
      const fixture = setup({ selectionMode: 'multi' });
      const events: { selected: readonly Row[] }[] = [];
      fixture.componentInstance.selectionChange.subscribe((e) => events.push(e));

      const headCheckbox: HTMLInputElement = fixture.nativeElement.querySelector(
        '.ff-data-table__head-cell--checkbox input'
      );
      headCheckbox.click();
      expect(events[0].selected).toEqual(ROWS);

      fixture.componentRef.setInput('selectedItems', ROWS);
      fixture.detectChanges();
      headCheckbox.click();
      expect(events[1].selected).toEqual([]);
    });

    it('replaces the selection with a single row in single mode', () => {
      const fixture = setup({ selectionMode: 'single' });
      const events: { selected: readonly Row[] }[] = [];
      fixture.componentInstance.selectionChange.subscribe((e) => events.push(e));

      const checkboxes: HTMLInputElement[] = Array.from(
        fixture.nativeElement.querySelectorAll('.ff-data-table__cell--checkbox input')
      );
      checkboxes[1].click();
      expect(events[0].selected).toEqual([ROWS[1]]);
    });

    it('does not emit rowClick when clicking the selection checkbox cell', () => {
      const fixture = setup({ selectionMode: 'multi' });
      const rowClicks: unknown[] = [];
      fixture.componentInstance.rowClick.subscribe((e) => rowClicks.push(e));

      const checkboxCell: HTMLElement = fixture.nativeElement.querySelector(
        '.ff-data-table__cell--checkbox'
      );
      checkboxCell.click();
      expect(rowClicks.length).toBe(0);
    });
  });

  it('emits rowClick with the item and index when a row is clicked', () => {
    const fixture = setup();
    const events: { item: Row; index: number }[] = [];
    fixture.componentInstance.rowClick.subscribe((e) => events.push(e));

    const rows: HTMLElement[] = Array.from(fixture.nativeElement.querySelectorAll('.ff-data-table__row'));
    rows[1].click();
    expect(events[0]).toEqual({ item: ROWS[1], index: 1 });
  });

  describe('expandable rows', () => {
    it('renders an expand toggle reflecting aria-expanded and emits expandedChange on click', () => {
      const fixture = setup({ expandable: true });
      const events: { item: Row; expanded: boolean }[] = [];
      fixture.componentInstance.expandedChange.subscribe((e) => events.push(e));

      const toggle: HTMLButtonElement = fixture.nativeElement.querySelector(
        '.ff-data-table__expand-toggle'
      );
      expect(toggle.getAttribute('aria-expanded')).toBe('false');

      toggle.click();
      expect(events[0]).toEqual({ item: ROWS[0], expanded: true });
    });

    it('renders the projected expansion template for expanded rows only', () => {
      @Component({
        standalone: true,
        imports: [FfDataTableComponent, FfDataTableExpansionTemplateDirective],
        template: `
          <ff-data-table [headers]="headers" [items]="items" [expandable]="true" [expandedItems]="expanded">
            <ng-template ffDataTableExpansion let-row>
              <span class="detail">Details for {{ row.name }}</span>
            </ng-template>
          </ff-data-table>
        `,
      })
      class HostComponent {
        readonly headers = HEADERS;
        readonly items = ROWS;
        readonly expanded = [ROWS[0]];
      }

      TestBed.configureTestingModule({
        imports: [HostComponent],
        providers: [ICON_PROVIDER],
      });
      const fixture = TestBed.createComponent(HostComponent);
      fixture.detectChanges();

      const details: HTMLElement[] = Array.from(fixture.nativeElement.querySelectorAll('.detail'));
      expect(details.length).toBe(1);
      expect(details[0].textContent).toContain('Alpha');
    });
  });

  describe('templates', () => {
    it('renders a projected cell template instead of the default item[key] text', () => {
      @Component({
        standalone: true,
        imports: [FfDataTableComponent, FfDataTableCellTemplateDirective],
        template: `
          <ff-data-table [headers]="headers" [items]="items">
            <ng-template ffDataTableCell="status" let-row>
              <strong class="custom-status">{{ row.status }}!</strong>
            </ng-template>
          </ff-data-table>
        `,
      })
      class HostComponent {
        readonly headers = HEADERS;
        readonly items = ROWS;
      }

      TestBed.configureTestingModule({ imports: [HostComponent], providers: [ICON_PROVIDER] });
      const fixture = TestBed.createComponent(HostComponent);
      fixture.detectChanges();

      const custom: HTMLElement[] = Array.from(fixture.nativeElement.querySelectorAll('.custom-status'));
      expect(custom.length).toBe(3);
      expect(custom[0].textContent).toContain('active!');
    });

    it('renders a projected row template instead of per-column cells', () => {
      @Component({
        standalone: true,
        imports: [FfDataTableComponent, FfDataTableRowTemplateDirective],
        template: `
          <ff-data-table [headers]="headers" [items]="items">
            <ng-template ffDataTableRow let-row let-i="index">
              <span class="custom-row">{{ i }}: {{ row.name }}</span>
            </ng-template>
          </ff-data-table>
        `,
      })
      class HostComponent {
        readonly headers = HEADERS;
        readonly items = ROWS;
      }

      TestBed.configureTestingModule({ imports: [HostComponent], providers: [ICON_PROVIDER] });
      const fixture = TestBed.createComponent(HostComponent);
      fixture.detectChanges();

      const custom: HTMLElement[] = Array.from(fixture.nativeElement.querySelectorAll('.custom-row'));
      expect(custom.length).toBe(3);
      expect(custom[1].textContent).toBe('1: Beta');
    });
  });

  describe('loading and empty states', () => {
    it('renders skeletonRowCount ff-skeleton rows while loading', () => {
      const fixture = setup({ loading: true });
      fixture.componentRef.setInput('skeletonRowCount', 3);
      fixture.detectChanges();
      const skeletonRows = fixture.nativeElement.querySelectorAll('.ff-data-table__row--skeleton');
      expect(skeletonRows.length).toBe(3);
      expect(fixture.nativeElement.querySelectorAll('ff-skeleton').length).toBe(6);
    });

    it('renders ff-empty-state with the default title when items is empty', () => {
      const fixture = setup({ items: [] });
      const emptyState = fixture.nativeElement.querySelector('ff-empty-state');
      expect(emptyState).toBeTruthy();
      expect(emptyState.textContent).toContain('No results found');
    });

    it('prefers the instance emptyTitle override over the built-in default', () => {
      const fixture = setup({ items: [], emptyTitle: 'Nothing here yet' });
      const emptyState = fixture.nativeElement.querySelector('ff-empty-state');
      expect(emptyState.textContent).toContain('Nothing here yet');
    });

    it('falls back to the globally provided no-results config', () => {
      const fixture = setup({ items: [] }, [
        ICON_PROVIDER,
        provideFfNoResultsConfig({ title: 'No matching records', description: 'Try another filter.' }),
      ]);
      const emptyState = fixture.nativeElement.querySelector('ff-empty-state');
      expect(emptyState.textContent).toContain('No matching records');
      expect(emptyState.textContent).toContain('Try another filter.');
    });
  });

  describe('pagination', () => {
    const PAGE: FfPaginationState = { page: 2, pageSize: 10, total: 25 };

    it('renders the current range and total, and emits pageChange on next/previous', () => {
      const fixture = setup({ pagination: PAGE });
      const info = fixture.nativeElement.querySelector('.ff-data-table__pagination-info');
      expect(info.textContent).toContain('11–20 of 25');

      const events: { page: number; pageSize: number }[] = [];
      fixture.componentInstance.pageChange.subscribe((e) => events.push(e));

      const buttons: HTMLButtonElement[] = Array.from(
        fixture.nativeElement.querySelectorAll('.ff-data-table__pagination-controls button')
      );
      buttons[1].click();
      expect(events[0]).toEqual({ page: 3, pageSize: 10 });

      buttons[0].click();
      expect(events[1]).toEqual({ page: 1, pageSize: 10 });
    });

    it('disables previous on the first page and next on the last page', () => {
      const fixture = setup({ pagination: { page: 1, pageSize: 10, total: 25 } });
      const buttons: HTMLButtonElement[] = Array.from(
        fixture.nativeElement.querySelectorAll('.ff-data-table__pagination-controls button')
      );
      expect(buttons[0].disabled).toBe(true);
      expect(buttons[1].disabled).toBe(false);

      TestBed.resetTestingModule();
      const last = setup({ pagination: { page: 3, pageSize: 10, total: 25 } });
      const lastButtons: HTMLButtonElement[] = Array.from(
        last.nativeElement.querySelectorAll('.ff-data-table__pagination-controls button')
      );
      expect(lastButtons[0].disabled).toBe(false);
      expect(lastButtons[1].disabled).toBe(true);
    });

    it('does not render a pagination footer when pagination is not provided', () => {
      const fixture = setup();
      expect(fixture.nativeElement.querySelector('.ff-data-table__pagination')).toBeNull();
    });
  });
});
