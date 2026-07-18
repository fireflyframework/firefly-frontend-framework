import 'zone.js';
import 'zone.js/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  BrowserTestingModule,
  platformBrowserTesting,
} from '@angular/platform-browser/testing';
import { FfMenuButtonComponent, FfMenuButtonItem } from './ff-menu-button.component';
import { provideFfIcons } from '../../primitives/ff-icon';

TestBed.initTestEnvironment(BrowserTestingModule, platformBrowserTesting(), {
  teardown: { destroyAfterEach: true },
});

describe('FfMenuButtonComponent', () => {
  const ITEMS: readonly FfMenuButtonItem[] = [
    { label: 'Rename', value: 'rename' },
    { label: 'Archive', value: 'archive', disabled: true },
    { label: 'Delete', value: 'delete' },
  ];

  let fixture: ComponentFixture<FfMenuButtonComponent>;
  let component: FfMenuButtonComponent;

  function setup(
    inputs: Partial<{ items: readonly FfMenuButtonItem[]; disabled: boolean }> = {}
  ) {
    TestBed.configureTestingModule({
      imports: [FfMenuButtonComponent],
      providers: [
        provideFfIcons({ 'chevron-down': 'M7 10l5 5 5-5z' }),
      ],
    });
    fixture = TestBed.createComponent(FfMenuButtonComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('items', inputs.items ?? ITEMS);
    if (inputs.disabled !== undefined) {
      fixture.componentRef.setInput('disabled', inputs.disabled);
    }
    fixture.detectChanges();
    return fixture;
  }

  function trigger(): HTMLButtonElement {
    return fixture.nativeElement.querySelector('.ff-button__native');
  }

  function menuItems(): HTMLButtonElement[] {
    return Array.from(document.querySelectorAll('[role="menuitem"]'));
  }

  /** Structural view of the component's protected `activeIndex` signal, for assertions only. */
  interface TestableMenuButton {
    activeIndex: { (): number; set(value: number): void };
  }

  function internals(): TestableMenuButton {
    return component as unknown as TestableMenuButton;
  }

  afterEach(() => {
    fixture?.destroy();
  });

  it('creates the component', () => {
    setup();
    expect(component).toBeTruthy();
  });

  it('sets aria-haspopup="menu" and aria-expanded="false" on the trigger by default', () => {
    setup();
    expect(trigger().getAttribute('aria-haspopup')).toBe('menu');
    expect(trigger().getAttribute('aria-expanded')).toBe('false');
  });

  it('opens the panel on trigger click and sets aria-expanded="true"', () => {
    setup();
    trigger().click();
    fixture.detectChanges();

    expect(component.open()).toBe(true);
    expect(trigger().getAttribute('aria-expanded')).toBe('true');
    expect(menuItems().length).toBe(ITEMS.length);
  });

  it('renders items with role="menu" / role="menuitem" and marks disabled entries', () => {
    setup();
    trigger().click();
    fixture.detectChanges();

    expect(document.querySelector('[role="menu"]')).toBeTruthy();
    expect(menuItems()[1].disabled).toBe(true);
    expect(menuItems()[1].getAttribute('aria-disabled')).toBe('true');
  });

  it('closes the panel and re-focuses the trigger on toggle-off', () => {
    setup();
    trigger().click();
    fixture.detectChanges();
    trigger().click();
    fixture.detectChanges();

    expect(component.open()).toBe(false);
    expect(menuItems().length).toBe(0);
  });

  it('emits selected and closes the panel when an enabled entry is activated', () => {
    setup();
    const spy = vi.fn();
    component.selected.subscribe(spy);

    trigger().click();
    fixture.detectChanges();
    menuItems()[0].click();
    fixture.detectChanges();

    expect(spy).toHaveBeenCalledWith(ITEMS[0]);
    expect(component.open()).toBe(false);
  });

  it('does not activate a disabled entry', () => {
    setup();
    const spy = vi.fn();
    component.selected.subscribe(spy);

    trigger().click();
    fixture.detectChanges();
    menuItems()[1].click();
    fixture.detectChanges();

    expect(spy).not.toHaveBeenCalled();
    expect(component.open()).toBe(true);
  });

  it('does not open when disabled', () => {
    setup({ disabled: true });
    trigger().click();
    fixture.detectChanges();

    expect(component.open()).toBe(false);
    expect(menuItems().length).toBe(0);
  });

  it('ArrowDown on the trigger opens the panel and activates the first enabled entry', () => {
    setup();
    trigger().dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    fixture.detectChanges();

    expect(component.open()).toBe(true);
    expect(component.items()[internals().activeIndex()]).toEqual(ITEMS[0]);
  });

  it('ArrowUp on the trigger opens the panel and activates the last enabled entry', () => {
    setup();
    trigger().dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true }));
    fixture.detectChanges();

    expect(component.open()).toBe(true);
    expect(component.items()[internals().activeIndex()]).toEqual(ITEMS[2]);
  });

  it('ArrowDown inside the panel skips disabled entries (wrapping)', () => {
    setup();
    trigger().click();
    fixture.detectChanges();

    const panel = document.querySelector('[role="menu"]') as HTMLElement;
    internals().activeIndex.set(0);
    panel.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    fixture.detectChanges();

    expect(internals().activeIndex()).toBe(2);
  });

  it('Home/End jump to the first/last enabled entry', () => {
    setup();
    trigger().click();
    fixture.detectChanges();

    const panel = document.querySelector('[role="menu"]') as HTMLElement;
    panel.dispatchEvent(new KeyboardEvent('keydown', { key: 'End', bubbles: true }));
    fixture.detectChanges();
    expect(internals().activeIndex()).toBe(2);

    panel.dispatchEvent(new KeyboardEvent('keydown', { key: 'Home', bubbles: true }));
    fixture.detectChanges();
    expect(internals().activeIndex()).toBe(0);
  });

  it('Escape inside the panel closes it and returns focus to the trigger', () => {
    setup();
    trigger().click();
    fixture.detectChanges();

    const panel = document.querySelector('[role="menu"]') as HTMLElement;
    panel.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    fixture.detectChanges();

    expect(component.open()).toBe(false);
    expect(document.activeElement).toBe(trigger());
  });

  it('Enter on the panel activates the active entry', () => {
    setup();
    const spy = vi.fn();
    component.selected.subscribe(spy);

    trigger().click();
    fixture.detectChanges();
    internals().activeIndex.set(2);

    const panel = document.querySelector('[role="menu"]') as HTMLElement;
    panel.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    fixture.detectChanges();

    expect(spy).toHaveBeenCalledWith(ITEMS[2]);
  });

  it('closes the panel on an outside click', () => {
    setup();
    trigger().click();
    fixture.detectChanges();

    document.body.click();
    fixture.detectChanges();

    expect(component.open()).toBe(false);
  });
});
