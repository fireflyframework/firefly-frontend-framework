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
import { provideFfNoResultsConfig } from '../no-results-config';
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
      [compareWith]="compareWith"
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
  compareWith: (a: Notification, b: Notification) => boolean = (a, b) => a === b;
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

  it('renders role="list" and listitem entries, with no tabindex, when selection is disabled', () => {
    const fixture = setup();
    const container = fixture.nativeElement.querySelector('.ff-list__items');
    expect(container.getAttribute('role')).toBe('list');
    expect(container.hasAttribute('tabindex')).toBe(false);
    expect(container.hasAttribute('aria-activedescendant')).toBe(false);

    const options: HTMLElement[] = Array.from(
      fixture.nativeElement.querySelectorAll('.ff-list__item-option')
    );
    expect(options.every((el) => el.getAttribute('role') === 'listitem')).toBe(true);
    expect(options.every((el) => !el.hasAttribute('tabindex'))).toBe(true);
  });

  it('renders role="listbox" with option entries and aria-selected when selectable', () => {
    const fixture = setup({ selectionMode: 'multi' });

    const container = fixture.nativeElement.querySelector('.ff-list__items');
    expect(container.getAttribute('role')).toBe('listbox');
    expect(container.getAttribute('tabindex')).toBe('0');
    expect(container.getAttribute('aria-multiselectable')).toBe('true');

    const options: HTMLElement[] = Array.from(
      fixture.nativeElement.querySelectorAll('.ff-list__item-option')
    );
    expect(options[0].getAttribute('role')).toBe('option');
    expect(options[0].getAttribute('tabindex')).toBe('-1');
    expect(options[0].getAttribute('aria-selected')).toBe('false');
  });

  it('renders the item selection checkbox as purely visual (aria-hidden, inert) while the listbox is active', () => {
    const fixture = setup({ selectionMode: 'multi' });
    const wrapper: HTMLElement = fixture.nativeElement.querySelector('.ff-list__item-checkbox');
    expect(wrapper.getAttribute('aria-hidden')).toBe('true');
    expect(wrapper.hasAttribute('inert')).toBe(true);
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

    it('toggles a single item in/out of a multi selection by clicking its option', () => {
      const fixture = setup({ selectionMode: 'multi' });

      const options: HTMLElement[] = Array.from(
        fixture.nativeElement.querySelectorAll('.ff-list__item-option')
      );
      options[0].click();
      expect(fixture.componentInstance.selectionEvents[0].selected).toEqual([ITEMS[0]]);
    });

    it('replaces the selection in single mode', () => {
      const fixture = setup({ selectionMode: 'single' });

      const options: HTMLElement[] = Array.from(
        fixture.nativeElement.querySelectorAll('.ff-list__item-option')
      );
      options[1].click();
      expect(fixture.componentInstance.selectionEvents[0].selected).toEqual([ITEMS[1]]);
    });

    it('toggles selection instead of emitting itemClick when clicking an option in selection mode', () => {
      const fixture = setup({ selectionMode: 'multi' });

      const options: HTMLElement[] = Array.from(
        fixture.nativeElement.querySelectorAll('.ff-list__item-option')
      );
      options[0].click();
      expect(fixture.componentInstance.selectionEvents.length).toBe(1);
      expect(fixture.componentInstance.itemClickEvents.length).toBe(0);
    });
  });

  it('emits itemClick with the item and index on a plain item click', () => {
    const fixture = setup();
    const options: HTMLElement[] = Array.from(
      fixture.nativeElement.querySelectorAll('.ff-list__item-option')
    );
    options[2].click();
    expect(fixture.componentInstance.itemClickEvents[0]).toEqual({ item: ITEMS[2], index: 2 });
  });

  describe('listbox keyboard model', () => {
    function containerOf(fixture: ReturnType<typeof setup>): HTMLElement {
      return fixture.nativeElement.querySelector('.ff-list__items');
    }

    function press(container: HTMLElement, key: string): void {
      container.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }));
    }

    it('activates the first item on first focus, exposed via aria-activedescendant', () => {
      const fixture = setup({ selectionMode: 'multi' });
      const container = containerOf(fixture);
      container.dispatchEvent(new Event('focus'));
      fixture.detectChanges();

      const options: HTMLElement[] = Array.from(
        fixture.nativeElement.querySelectorAll('.ff-list__item-option')
      );
      expect(container.getAttribute('aria-activedescendant')).toBe(options[0].id);
    });

    it('activates the first selected item on first focus when a selection already exists', () => {
      const fixture = setup({ selectionMode: 'multi', selectedItems: [ITEMS[1]] });
      const container = containerOf(fixture);
      container.dispatchEvent(new Event('focus'));
      fixture.detectChanges();

      const options: HTMLElement[] = Array.from(
        fixture.nativeElement.querySelectorAll('.ff-list__item-option')
      );
      expect(container.getAttribute('aria-activedescendant')).toBe(options[1].id);
    });

    it('moves the active option with ArrowDown/ArrowUp, clamped at the edges', () => {
      const fixture = setup({ selectionMode: 'multi' });
      const container = containerOf(fixture);
      container.dispatchEvent(new Event('focus'));
      fixture.detectChanges();

      const options: HTMLElement[] = Array.from(
        fixture.nativeElement.querySelectorAll('.ff-list__item-option')
      );

      press(container, 'ArrowDown');
      fixture.detectChanges();
      expect(container.getAttribute('aria-activedescendant')).toBe(options[1].id);

      press(container, 'ArrowDown');
      press(container, 'ArrowDown');
      fixture.detectChanges();
      expect(container.getAttribute('aria-activedescendant')).toBe(options[2].id);

      press(container, 'ArrowUp');
      fixture.detectChanges();
      expect(container.getAttribute('aria-activedescendant')).toBe(options[1].id);
    });

    it('moves the active option to the first/last item with Home/End', () => {
      const fixture = setup({ selectionMode: 'multi' });
      const container = containerOf(fixture);
      container.dispatchEvent(new Event('focus'));
      fixture.detectChanges();

      const options: HTMLElement[] = Array.from(
        fixture.nativeElement.querySelectorAll('.ff-list__item-option')
      );

      press(container, 'End');
      fixture.detectChanges();
      expect(container.getAttribute('aria-activedescendant')).toBe(options[2].id);

      press(container, 'Home');
      fixture.detectChanges();
      expect(container.getAttribute('aria-activedescendant')).toBe(options[0].id);
    });

    it('toggles the active option selection with Space', () => {
      const fixture = setup({ selectionMode: 'multi' });
      const container = containerOf(fixture);
      container.dispatchEvent(new Event('focus'));
      fixture.detectChanges();

      press(container, ' ');
      expect(fixture.componentInstance.selectionEvents[0].selected).toEqual([ITEMS[0]]);
    });

    it('emits itemClick for the active option with Enter', () => {
      const fixture = setup({ selectionMode: 'multi' });
      const container = containerOf(fixture);
      container.dispatchEvent(new Event('focus'));
      fixture.detectChanges();

      press(container, 'ArrowDown');
      press(container, 'Enter');
      expect(fixture.componentInstance.itemClickEvents[0]).toEqual({ item: ITEMS[1], index: 1 });
      expect(fixture.componentInstance.selectionEvents.length).toBe(0);
    });

    it('is a no-op in selectionMode "none"', () => {
      const fixture = setup();
      const container = containerOf(fixture);
      container.dispatchEvent(new Event('focus'));
      press(container, 'ArrowDown');
      fixture.detectChanges();

      expect(container.hasAttribute('aria-activedescendant')).toBe(false);
      expect(fixture.componentInstance.itemClickEvents.length).toBe(0);
    });
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

    it('exposes aria-busy="true" on the items container while loading, and null otherwise', () => {
      const loading = setup({ loading: true });
      expect(loading.nativeElement.querySelector('.ff-list__items').getAttribute('aria-busy')).toBe('true');

      TestBed.resetTestingModule();
      const idle = setup();
      expect(idle.nativeElement.querySelector('.ff-list__items').hasAttribute('aria-busy')).toBe(false);
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

    it('does not render a page-size control when pageSizeOptions is omitted', () => {
      const fixture = setup({ pagination: { page: 1, pageSize: 10, total: 25 } });
      expect(fixture.nativeElement.querySelector('.ff-list__page-size')).toBeNull();
    });

    it('renders a page-size control when pageSizeOptions is set, requesting the new size with page reset to 1', () => {
      const fixture = setup({
        pagination: { page: 2, pageSize: 10, total: 25, pageSizeOptions: [10, 20, 50] },
      });

      const trigger: HTMLButtonElement = fixture.nativeElement.querySelector(
        '.ff-list__page-size .ff-select__trigger'
      );
      expect(trigger).toBeTruthy();
      trigger.click();
      fixture.detectChanges();

      const options: HTMLElement[] = Array.from(document.querySelectorAll('.ff-select__option'));
      const target = options.find((option) => option.textContent?.trim() === '20');
      target?.click();
      fixture.detectChanges();

      expect(fixture.componentInstance.pageEvents[0]).toEqual({ page: 1, pageSize: 20 });
    });
  });

  describe('compareWith', () => {
    it('keeps the selection when items is re-fetched with equivalent but non-identical item objects, given compareWith', () => {
      const fixture = setup({
        selectionMode: 'multi',
        compareWith: (a: Notification, b: Notification) => a.id === b.id,
        selectedItems: [{ id: 1, title: 'Alpha' }],
      });

      fixture.componentInstance.items = ITEMS.map((item) => ({ ...item }));
      fixture.componentInstance.selectedItems = [{ id: 1, title: 'Alpha' }];
      fixture.detectChanges();

      const firstOption: HTMLElement = fixture.nativeElement.querySelector('.ff-list__item-option');
      expect(firstOption.getAttribute('aria-selected')).toBe('true');
    });

    it('loses the selection across an equivalent-but-not-identical re-fetch without compareWith (default reference equality)', () => {
      const fixture = setup({
        selectionMode: 'multi',
        selectedItems: [{ id: 1, title: 'Alpha' }],
      });

      fixture.componentInstance.items = ITEMS.map((item) => ({ ...item }));
      fixture.componentInstance.selectedItems = [{ id: 1, title: 'Alpha' }];
      fixture.detectChanges();

      const firstOption: HTMLElement = fixture.nativeElement.querySelector('.ff-list__item-option');
      expect(firstOption.getAttribute('aria-selected')).toBe('false');
    });
  });
});
