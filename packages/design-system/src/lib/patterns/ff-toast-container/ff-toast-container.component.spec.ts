import 'zone.js';
import 'zone.js/testing';
import { TestBed } from '@angular/core/testing';
import {
  BrowserTestingModule,
  platformBrowserTesting,
} from '@angular/platform-browser/testing';

import {
  FfToastContainerComponent,
  FfToastItem,
} from './ff-toast-container.component';

TestBed.initTestEnvironment(BrowserTestingModule, platformBrowserTesting(), {
  teardown: { destroyAfterEach: true },
});

const POSITIONS = [
  'top-left',
  'top-center',
  'top-right',
  'bottom-left',
  'bottom-center',
  'bottom-right',
] as const;

describe('FfToastContainerComponent', () => {
  function setup(toasts: readonly FfToastItem[] = []) {
    TestBed.configureTestingModule({
      imports: [FfToastContainerComponent],
    });
    const fixture = TestBed.createComponent(FfToastContainerComponent);
    fixture.componentRef.setInput('toasts', toasts);
    fixture.detectChanges();
    return fixture;
  }

  function region(
    fixture: ReturnType<typeof setup>,
    position: string
  ): HTMLElement {
    const element = fixture.nativeElement.querySelector(
      `.ff-toast-container__region--${position}`
    ) as HTMLElement | null;
    if (element === null) {
      throw new Error(`Missing region for position '${position}'`);
    }
    return element;
  }

  it('renders the six position regions upfront with aria-live="polite", even with no toasts', () => {
    const fixture = setup([]);
    const regions = fixture.nativeElement.querySelectorAll(
      '.ff-toast-container__region'
    );
    expect(regions.length).toBe(6);
    for (const position of POSITIONS) {
      const element = region(fixture, position);
      expect(element.getAttribute('aria-live')).toBe('polite');
    }
  });

  it('renders each toast in the region given by options.position', () => {
    const fixture = setup([
      { id: 'a', message: 'A', type: 'info', options: { position: 'bottom-left' } },
      { id: 'b', message: 'B', type: 'info', options: { position: 'top-center' } },
    ]);
    expect(region(fixture, 'bottom-left').querySelectorAll('ff-toast').length).toBe(1);
    expect(region(fixture, 'top-center').querySelectorAll('ff-toast').length).toBe(1);
    expect(region(fixture, 'top-right').querySelectorAll('ff-toast').length).toBe(0);
  });

  it('maps the structural type to the ff-toast variant (destructive→error, unknown→info)', () => {
    const fixture = setup([
      { id: 's', message: 'S', type: 'success' },
      { id: 'w', message: 'W', type: 'warning' },
      { id: 'd', message: 'D', type: 'destructive' },
      { id: 'c', message: 'C', type: 'custom' },
    ]);
    const toasts = fixture.nativeElement.querySelectorAll('ff-toast');
    expect(toasts[0].classList.contains('ff-toast--success')).toBe(true);
    expect(toasts[1].classList.contains('ff-toast--warning')).toBe(true);
    expect(toasts[2].classList.contains('ff-toast--error')).toBe(true);
    expect(toasts[3].classList.contains('ff-toast--info')).toBe(true);
  });

  it('wraps error (and destructive) toasts in role="alert" but not the rest', () => {
    const fixture = setup([
      { id: 'e', message: 'E', type: 'error' },
      { id: 'd', message: 'D', type: 'destructive' },
      { id: 's', message: 'S', type: 'success' },
    ]);
    const items = fixture.nativeElement.querySelectorAll(
      '.ff-toast-container__item'
    );
    expect(items[0].getAttribute('role')).toBe('alert');
    expect(items[1].getAttribute('role')).toBe('alert');
    expect(items[2].getAttribute('role')).toBeNull();
  });

  it('emits dismissed with the toast id when its dismiss button is clicked', () => {
    const fixture = setup([{ id: 'gone', message: 'Bye', type: 'info' }]);
    const emitted: string[] = [];
    fixture.componentInstance.dismissed.subscribe((id) => emitted.push(id));

    const close = fixture.nativeElement.querySelector(
      '.ff-toast__close'
    ) as HTMLButtonElement;
    close.click();

    expect(emitted).toEqual(['gone']);
  });

  it('emits hoverStarted/hoverEnded with the toast id on pointer enter/leave', () => {
    const fixture = setup([{ id: 'hov', message: 'Hover me', type: 'info' }]);
    const started: string[] = [];
    const ended: string[] = [];
    fixture.componentInstance.hoverStarted.subscribe((id) => started.push(id));
    fixture.componentInstance.hoverEnded.subscribe((id) => ended.push(id));

    const item = fixture.nativeElement.querySelector(
      '.ff-toast-container__item'
    ) as HTMLElement;
    item.dispatchEvent(new Event('mouseenter'));
    item.dispatchEvent(new Event('mouseleave'));

    expect(started).toEqual(['hov']);
    expect(ended).toEqual(['hov']);
  });

  it('renders the progress bar only when progressBar is set with a positive duration', () => {
    const fixture = setup([
      {
        id: 'p',
        message: 'P',
        type: 'info',
        options: { duration: 5000, progressBar: true },
      },
      { id: 'q', message: 'Q', type: 'info', options: { duration: 5000 } },
      { id: 'r', message: 'R', type: 'info', options: { progressBar: true } },
    ]);
    const items = fixture.nativeElement.querySelectorAll(
      '.ff-toast-container__item'
    );
    const bar = items[0].querySelector(
      '.ff-toast-container__progress'
    ) as HTMLElement;
    expect(bar).toBeTruthy();
    expect(bar.style.animationDuration).toBe('5000ms');
    expect(items[1].querySelector('.ff-toast-container__progress')).toBeNull();
    expect(items[2].querySelector('.ff-toast-container__progress')).toBeNull();
  });

  it('applies defaults for an item without options: top-right, dismissible, no progress bar', () => {
    const fixture = setup([{ id: 'd', message: 'Defaults', type: 'info' }]);
    const topRight = region(fixture, 'top-right');
    expect(topRight.querySelectorAll('ff-toast').length).toBe(1);
    expect(topRight.querySelector('.ff-toast__close')).toBeTruthy();
    expect(topRight.querySelector('.ff-toast-container__progress')).toBeNull();
  });

  it('falls back to the top-right region for unknown position values', () => {
    const fixture = setup([
      { id: 'u', message: 'U', type: 'info', options: { position: 'middle' } },
    ]);
    expect(region(fixture, 'top-right').querySelectorAll('ff-toast').length).toBe(1);
  });
});
