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
import { provideFfNoResultsConfig } from '../ff-data-table/no-results-config';
import {
  FfListComponent,
  FfListExpansionTemplateDirective,
  FfListItemTemplateDirective,
} from './ff-list.component';

TestBed.initTestEnvironment(BrowserTestingModule, platformBrowserTesting(), {
  teardown: { destroyAfterEach: true },
});

interface Notification {
  id: number;
  title: string;
}

const ITEMS: readonly Notification[] = [
  { id: 1, title: 'Alpha' },
  { id: 2, title: 'Beta' },
  { id: 3, title: 'Gamma' },
];

const ICON_PROVIDER = provideFfIcons({
  'chevron-right': 'M0 0',
  'chevron-left': 'M0 0',
});

@Component({
  standalone: true,
  imports: [FfListComponent, FfListItemTemplateDirective, FfListExpansionTemplateDirective],
  template: `
    <ff-list
      [items]="items"
      [loading]="loading"
      [selectionMode]="selectionMode"
      [selectedItems]="selectedItems"
      [expandable]="expandable"
      [expandedItems]="expandedItems"
      [pagination]="pagination"
      [emptyTitle]="emptyTitle"
      (selectionChange)="selectionEvents.push($event)"
      (itemClick)="itemClickEvents.push($event)"
      (expandedChange)="expandedEvents.push($event)"
      (pageChange)="pageEvents.push($event)"
    >
      <ng-template ffListItem let-item>
        <span class="item-title">{{ item.title }}</span>
      </ng-template>
      @if (withExpansion) {
        <ng-template ffListExpansion let-item>
          <span class="item-detail">Details for {{ item.title }}</span>
        </ng-template>
      }
    </ff-list>
  `,
})
class TestHostComponent {
  items: readonly Notification[] = ITEMS;
  loading = false;
  selectionMode: 'none' | 'single' | 'multi' = 'none';
  selectedItems: readonly Notification[] = [];
  expandable = false;
  expandedItems: readonly Notification[] = [];
  pagination: FfPaginationState | undefined;
  emptyTitle: string | undefined;
  withExpansion = false;

  readonly selectionEvents: { selected: readonly Notification[] }[] = [];
  readonly itemClickEvents: { item: Notification; index: number }[] = [];
  readonly expandedEvents: { item: Notification; expanded: boolean }[] = [];
  readonly pageEvents: { page: number; pageSize: number }[] = [];
}

describe('FfListComponent', () => {
  function setup(
    overrides: Partial<TestHostComponent> = {},
    providers: EnvironmentProviders[] = [ICON_PROVIDER]
  ) {
    TestBed.configureTestingModule({ imports: [TestHostComponent], providers });
    const fixture = TestBed.createComponent(TestHostComponent);
    Object.assign(fixture.componentInstance, overrides);
    fixture.detectChanges();
    return fixture;
  }

  it('renders one item per entry through the required ffListItem template', () => {
    const fixture = setup();
    const titles: HTMLElement[] = Array.from(fixture.nativeElement.querySelectorAll('.item-title'));
    expect(titles.length).toBe(3);
    expect(titles[0].textContent).toBe('Alpha');
  });

  it('renders role="list" and listitem entries when selection is disabled', () => {
    const fixture = setup();
    const container = fixture.nativeElement.querySelector('.ff-list__items');
    expect(container.getAttribute('role')).toBe('list');
    const items: HTMLElement[] = Array.from(fixture.nativeElement.querySelectorAll('.ff-list__item'));
    expect(items.every((el) => el.getAttribute('role') === 'listitem')).toBe(true);
  });

  it('renders role="listbox" with option entries and aria-selected when selectable', () => {
    const fixture = setup({ selectionMode: 'multi' });

    const container = fixture.nativeElement.querySelector('.ff-list__items');
    expect(container.getAttribute('role')).toBe('listbox');
    expect(container.getAttribute('aria-multiselectable')).toBe('true');

    const items: HTMLElement[] = Array.from(fixture.nativeElement.querySelectorAll('.ff-list__item'));
    expect(items[0].getAttribute('role')).toBe('option');
    expect(items[0].getAttribute('aria-selected')).toBe('false');
  });

  describe('selection', () => {
    it('renders a select-all checkbox in multi mode and toggles every rendered item', () => {
      const fixture = setup({ selectionMode: 'multi' });

      const selectAll: HTMLInputElement = fixture.nativeElement.querySelector(
        '.ff-list__select-all input'
      );
      selectAll.click();
      expect(fixture.componentInstance.selectionEvents[0].selected).toEqual(ITEMS);
    });

    it('toggles a single item in/out of a multi selection', () => {
      const fixture = setup({ selectionMode: 'multi' });

      const checkboxes: HTMLInputElement[] = Array.from(
        fixture.nativeElement.querySelectorAll('.ff-list__item-checkbox input')
      );
      checkboxes[0].click();
      expect(fixture.componentInstance.selectionEvents[0].selected).toEqual([ITEMS[0]]);
    });

    it('replaces the selection in single mode', () => {
      const fixture = setup({ selectionMode: 'single' });

      const checkboxes: HTMLInputElement[] = Array.from(
        fixture.nativeElement.querySelectorAll('.ff-list__item-checkbox input')
      );
      checkboxes[1].click();
      expect(fixture.componentInstance.selectionEvents[0].selected).toEqual([ITEMS[1]]);
    });

    it('does not emit itemClick when clicking the selection checkbox', () => {
      const fixture = setup({ selectionMode: 'multi' });

      const checkbox: HTMLInputElement = fixture.nativeElement.querySelector(
        '.ff-list__item-checkbox input'
      );
      checkbox.click();
      expect(fixture.componentInstance.itemClickEvents.length).toBe(0);
    });
  });

  it('emits itemClick with the item and index on a plain item click', () => {
    const fixture = setup();
    const items: HTMLElement[] = Array.from(fixture.nativeElement.querySelectorAll('.ff-list__item'));
    items[2].click();
    expect(fixture.componentInstance.itemClickEvents[0]).toEqual({ item: ITEMS[2], index: 2 });
  });

  describe('expandable items', () => {
    it('toggles aria-expanded and emits expandedChange', () => {
      const fixture = setup({ expandable: true });

      const toggle: HTMLButtonElement = fixture.nativeElement.querySelector('.ff-list__expand-toggle');
      expect(toggle.getAttribute('aria-expanded')).toBe('false');

      toggle.click();
      expect(fixture.componentInstance.expandedEvents[0]).toEqual({ item: ITEMS[0], expanded: true });
    });

    it('renders the projected expansion template only for expanded items', () => {
      const fixture = setup({
        expandable: true,
        withExpansion: true,
        expandedItems: [ITEMS[1]],
      });

      const details: HTMLElement[] = Array.from(fixture.nativeElement.querySelectorAll('.item-detail'));
      expect(details.length).toBe(1);
      expect(details[0].textContent).toContain('Beta');
    });
  });

  describe('loading and empty states', () => {
    it('renders skeletonItemCount ff-skeleton placeholders while loading', () => {
      const fixture = setup({ loading: true });
      expect(fixture.nativeElement.querySelectorAll('.ff-list__item--skeleton').length).toBe(5);
    });

    it('renders ff-empty-state with the default title when items is empty', () => {
      const fixture = setup({ items: [] });
      const emptyState = fixture.nativeElement.querySelector('ff-empty-state');
      expect(emptyState.textContent).toContain('No results found');
    });

    it('prefers the instance emptyTitle override over the built-in default', () => {
      const fixture = setup({ items: [], emptyTitle: 'No notifications yet' });
      const emptyState = fixture.nativeElement.querySelector('ff-empty-state');
      expect(emptyState.textContent).toContain('No notifications yet');
    });

    it('falls back to the globally provided no-results config, shared with ff-data-table', () => {
      const fixture = setup({ items: [] }, [
        ICON_PROVIDER,
        provideFfNoResultsConfig({ title: 'Nothing matches your search' }),
      ]);
      const emptyState = fixture.nativeElement.querySelector('ff-empty-state');
      expect(emptyState.textContent).toContain('Nothing matches your search');
    });
  });

  describe('pagination', () => {
    it('renders the current range and emits pageChange on next/previous', () => {
      const fixture = setup({ pagination: { page: 2, pageSize: 10, total: 25 } });

      const info = fixture.nativeElement.querySelector('.ff-list__pagination-info');
      expect(info.textContent).toContain('11–20 of 25');

      const buttons: HTMLButtonElement[] = Array.from(
        fixture.nativeElement.querySelectorAll('.ff-list__pagination-controls button')
      );
      buttons[1].click();
      expect(fixture.componentInstance.pageEvents[0]).toEqual({ page: 3, pageSize: 10 });
    });

    it('does not render a pagination footer when pagination is not provided', () => {
      const fixture = setup();
      expect(fixture.nativeElement.querySelector('.ff-list__pagination')).toBeNull();
    });
  });
});
