import 'zone.js';
import 'zone.js/testing';
import { TestBed } from '@angular/core/testing';
import {
  BrowserTestingModule,
  platformBrowserTesting,
} from '@angular/platform-browser/testing';
import { FfTabBarComponent, FfTab } from './ff-tab-bar.component';
import { provideFfIcons } from '../../primitives/ff-icon';

TestBed.initTestEnvironment(BrowserTestingModule, platformBrowserTesting(), {
  teardown: { destroyAfterEach: true },
});

describe('FfTabBarComponent', () => {
  const TABS: readonly FfTab[] = [
    { id: 'one', label: 'One', icon: 'check' },
    { id: 'two', label: 'Two', badge: 4 },
    { id: 'three', label: 'Three', disabled: true },
    { id: 'four', label: 'Four' },
  ];

  function setup(inputs: Partial<{ tabs: readonly FfTab[]; activeId: string; variant: 'underline' | 'pills' }> = {}) {
    TestBed.configureTestingModule({
      imports: [FfTabBarComponent],
      providers: [provideFfIcons({ check: 'M9 16.2 4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4z' })],
    });
    const fixture = TestBed.createComponent(FfTabBarComponent);
    fixture.componentRef.setInput('tabs', inputs.tabs ?? TABS);
    if (inputs.activeId) fixture.componentRef.setInput('activeId', inputs.activeId);
    if (inputs.variant) fixture.componentRef.setInput('variant', inputs.variant);
    fixture.detectChanges();
    return fixture;
  }

  function tabButtons(fixture: ReturnType<typeof setup>): HTMLButtonElement[] {
    return Array.from(fixture.nativeElement.querySelectorAll('.ff-tab-bar__tab'));
  }

  it('renders one role=tab button per tab inside a tablist', () => {
    const fixture = setup();
    expect(fixture.nativeElement.querySelector('[role="tablist"]')).toBeTruthy();
    const buttons = tabButtons(fixture);
    expect(buttons.length).toBe(4);
    expect(buttons.every((b) => b.getAttribute('role') === 'tab')).toBe(true);
  });

  it('marks the active tab with aria-selected, active class and tabindex 0', () => {
    const fixture = setup({ activeId: 'two' });
    const buttons = tabButtons(fixture);
    expect(buttons[1].classList.contains('ff-tab-bar__tab--active')).toBe(true);
    expect(buttons[1].getAttribute('aria-selected')).toBe('true');
    expect(buttons[1].tabIndex).toBe(0);
    expect(buttons[0].getAttribute('aria-selected')).toBe('false');
    expect(buttons[0].tabIndex).toBe(-1);
  });

  it('emits activeIdChange on click and not for the already-active or disabled tab', () => {
    const fixture = setup({ activeId: 'one' });
    const emitted: string[] = [];
    fixture.componentInstance.activeIdChange.subscribe((id) => emitted.push(id));
    const buttons = tabButtons(fixture);

    buttons[1].click();
    expect(emitted).toEqual(['two']);

    buttons[0].click(); // already active
    expect(emitted).toEqual(['two']);

    buttons[2].click(); // disabled — native disabled button swallows the click
    expect(emitted).toEqual(['two']);
  });

  it('renders projected icon and badge content', () => {
    const fixture = setup();
    const buttons = tabButtons(fixture);
    expect(buttons[0].querySelector('ff-icon')).toBeTruthy();
    expect(buttons[1].querySelector('ff-badge')?.textContent).toContain('4');
    expect(buttons[3].querySelector('ff-icon')).toBeNull();
    expect(buttons[3].querySelector('ff-badge')).toBeNull();
  });

  it('applies the variant class on the host', () => {
    const underline = setup();
    expect(underline.nativeElement.classList.contains('ff-tab-bar--underline')).toBe(true);

    TestBed.resetTestingModule();
    const pills = setup({ variant: 'pills' });
    expect(pills.nativeElement.classList.contains('ff-tab-bar--pills')).toBe(true);
  });

  it('moves focus with arrow keys skipping disabled tabs and wrapping', () => {
    const fixture = setup({ activeId: 'one' });
    const buttons = tabButtons(fixture);
    buttons[0].focus();

    buttons[0].dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    expect(document.activeElement).toBe(buttons[1]);

    // next enabled after 'two' is 'four' (three is disabled and excluded)
    buttons[1].dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    expect(document.activeElement).toBe(buttons[3]);

    // wraps to the first enabled
    buttons[3].dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    expect(document.activeElement).toBe(buttons[0]);

    buttons[0].dispatchEvent(new KeyboardEvent('keydown', { key: 'End', bubbles: true }));
    expect(document.activeElement).toBe(buttons[3]);

    buttons[3].dispatchEvent(new KeyboardEvent('keydown', { key: 'Home', bubbles: true }));
    expect(document.activeElement).toBe(buttons[0]);
  });
});
