import 'zone.js';
import 'zone.js/testing';
import { ApplicationRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import {
  BrowserTestingModule,
  platformBrowserTesting,
} from '@angular/platform-browser/testing';
import { provideFfToasts } from './provide-ff-toasts';
import { FfToastService } from './toast.service';

TestBed.initTestEnvironment(BrowserTestingModule, platformBrowserTesting(), {
  teardown: { destroyAfterEach: true },
});

describe('FfToastService', () => {
  let service: FfToastService;
  let appRef: ApplicationRef;

  /** Flushes pending change detection on the detached container view. */
  function detect(): void {
    appRef.tick();
  }

  function containerEl(): HTMLElement | null {
    return document.body.querySelector('ff-toast-container');
  }

  beforeEach(() => {
    vi.useFakeTimers();
    TestBed.configureTestingModule({
      providers: [provideFfToasts()],
    });
    service = TestBed.inject(FfToastService);
    appRef = TestBed.inject(ApplicationRef);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should create', () => {
    expect(service).toBeTruthy();
  });

  it('should not attach any container before the first toast', () => {
    expect(containerEl()).toBeNull();
  });

  it('should add to the queue and render in the DOM on show', () => {
    const id = service.show('File saved');
    detect();

    expect(service.toasts()).toHaveLength(1);
    expect(service.toasts()[0].id).toBe(id);

    const toast = containerEl()?.querySelector('ff-toast');
    expect(toast).toBeTruthy();
    expect(toast?.textContent).toContain('File saved');
  });

  it('should reuse a single container across shows', () => {
    service.show('one');
    service.show('two');
    detect();

    expect(document.body.querySelectorAll('ff-toast-container')).toHaveLength(1);
    expect(containerEl()?.querySelectorAll('ff-toast')).toHaveLength(2);
  });

  it.each(['success', 'error', 'warning', 'info'] as const)(
    'shortcut %s should apply the variant',
    (variant) => {
      service[variant]('message');
      detect();

      expect(service.toasts()[0].variant).toBe(variant);
      const toast = containerEl()?.querySelector('ff-toast');
      expect(toast?.classList.contains(`ff-toast--${variant}`)).toBe(true);
    }
  );

  it('should default to the info variant on show', () => {
    service.show('plain');
    expect(service.toasts()[0].variant).toBe('info');
  });

  it('should auto-dismiss after the default 4000ms timeout', () => {
    service.show('bye');
    detect();
    expect(containerEl()?.querySelectorAll('ff-toast')).toHaveLength(1);

    vi.advanceTimersByTime(3999);
    detect();
    expect(service.toasts()).toHaveLength(1);

    vi.advanceTimersByTime(1);
    detect();
    expect(service.toasts()).toHaveLength(0);
    expect(containerEl()?.querySelectorAll('ff-toast')).toHaveLength(0);
  });

  it('should honor a custom timeout', () => {
    service.show('quick', { timeout: 1000 });
    vi.advanceTimersByTime(1000);
    detect();

    expect(service.toasts()).toHaveLength(0);
  });

  it('should persist with timeout 0', () => {
    service.show('sticky', { timeout: 0 });
    vi.advanceTimersByTime(60_000);
    detect();

    expect(service.toasts()).toHaveLength(1);
    expect(containerEl()?.querySelectorAll('ff-toast')).toHaveLength(1);
  });

  it('should dismiss a toast by id', () => {
    const id = service.show('a', { timeout: 0 });
    service.show('b', { timeout: 0 });
    detect();

    service.dismiss(id);
    detect();

    expect(service.toasts()).toHaveLength(1);
    expect(service.toasts()[0].message).toBe('b');
  });

  it('should ignore dismiss with an unknown id', () => {
    service.show('a', { timeout: 0 });
    service.dismiss(999);

    expect(service.toasts()).toHaveLength(1);
  });

  it('should clear all toasts', () => {
    service.show('a');
    service.show('b', { position: 'bottom-left' });
    service.show('c', { timeout: 0 });
    detect();

    service.clear();
    detect();

    expect(service.toasts()).toHaveLength(0);
    expect(containerEl()?.querySelectorAll('ff-toast')).toHaveLength(0);
  });

  it('should render in the top-right region by default', () => {
    service.show('hello');
    detect();

    const region = containerEl()?.querySelector(
      '.ff-toast-container__region--top-right'
    );
    expect(region?.querySelectorAll('ff-toast')).toHaveLength(1);
  });

  it('should apply the region class of the requested position', () => {
    service.show('down left', { position: 'bottom-left' });
    detect();

    const region = containerEl()?.querySelector(
      '.ff-toast-container__region--bottom-left'
    );
    expect(region?.querySelectorAll('ff-toast')).toHaveLength(1);
    expect(
      containerEl()
        ?.querySelector('.ff-toast-container__region--top-right')
        ?.querySelectorAll('ff-toast')
    ).toHaveLength(0);
  });

  it('should expose aria-live="polite" regions', () => {
    service.show('announce me');
    detect();

    const regions = containerEl()?.querySelectorAll('[aria-live="polite"]');
    expect(regions?.length).toBeGreaterThan(0);
    const region = containerEl()?.querySelector(
      '.ff-toast-container__region--top-right'
    );
    expect(region?.getAttribute('aria-live')).toBe('polite');
  });

  it('should wrap error toasts in role="alert"', () => {
    service.error('boom', { timeout: 0 });
    service.info('fyi', { timeout: 0 });
    detect();

    const alerts = containerEl()?.querySelectorAll('[role="alert"]');
    expect(alerts).toHaveLength(1);
    expect(alerts?.[0].querySelector('ff-toast')?.textContent).toContain(
      'boom'
    );
  });

  it('should dismiss on the toast close button click', () => {
    service.show('closable', { timeout: 0 });
    detect();

    const close = containerEl()?.querySelector(
      '.ff-toast__close'
    ) as HTMLButtonElement;
    close.click();
    detect();

    expect(service.toasts()).toHaveLength(0);
  });

  it('should render the progress bar only when progressBar is set', () => {
    service.show('no bar');
    service.show('bar', { progressBar: true });
    detect();

    expect(
      containerEl()?.querySelectorAll('.ff-toast-container__progress')
    ).toHaveLength(1);
  });

  it('should not render a progress bar for persistent toasts', () => {
    service.show('sticky bar', { progressBar: true, timeout: 0 });
    detect();

    expect(
      containerEl()?.querySelectorAll('.ff-toast-container__progress')
    ).toHaveLength(0);
  });

  it('should pause the auto-dismiss timer on hover and resume on leave', () => {
    service.show('hover me', { timeout: 4000 });
    detect();

    const item = containerEl()?.querySelector(
      '.ff-toast-container__item'
    ) as HTMLElement;

    vi.advanceTimersByTime(2000);
    item.dispatchEvent(new MouseEvent('mouseenter'));
    vi.advanceTimersByTime(10_000);
    detect();
    expect(service.toasts()).toHaveLength(1);

    item.dispatchEvent(new MouseEvent('mouseleave'));
    vi.advanceTimersByTime(2000);
    detect();
    expect(service.toasts()).toHaveLength(0);
  });

  it('should honor the dismissible option', () => {
    service.show('locked', { dismissible: false, timeout: 0 });
    detect();

    expect(containerEl()?.querySelector('.ff-toast__close')).toBeNull();
  });

  it('should remove the container from the body on destroy', () => {
    service.show('temp');
    detect();
    expect(containerEl()).toBeTruthy();

    service.ngOnDestroy();
    expect(containerEl()).toBeNull();
  });
});

describe('FfToastService with global config', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideFfToasts({ position: 'bottom-center', progressBar: true }),
      ],
    });
  });

  it('should apply configured defaults and keep built-ins for the rest', () => {
    const service = TestBed.inject(FfToastService);
    service.show('configured');

    const toast = service.toasts()[0];
    expect(toast.position).toBe('bottom-center');
    expect(toast.progressBar).toBe(true);
    expect(toast.timeout).toBe(4000);
    expect(toast.dismissible).toBe(true);
  });
});
