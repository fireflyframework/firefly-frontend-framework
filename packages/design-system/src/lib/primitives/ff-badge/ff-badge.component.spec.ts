import 'zone.js';
import 'zone.js/testing';
import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  BrowserTestingModule,
  platformBrowserTesting,
} from '@angular/platform-browser/testing';
import { FfBadgeComponent } from './ff-badge.component';

TestBed.initTestEnvironment(BrowserTestingModule, platformBrowserTesting(), {
  teardown: { destroyAfterEach: true },
});

@Component({
  imports: [FfBadgeComponent],
  template: `<ff-badge [maxWidth]="maxWidth()">Very long badge label</ff-badge>`,
})
class OverflowHost {
  readonly maxWidth = signal<string | undefined>(undefined);
}

/** Forces the label overflow measurement of `el` to a fixed outcome. */
function mockOverflow(el: HTMLElement, scrollWidth: number, clientWidth: number): void {
  Object.defineProperty(el, 'scrollWidth', { configurable: true, value: scrollWidth });
  Object.defineProperty(el, 'clientWidth', { configurable: true, value: clientWidth });
}

describe('FfBadgeComponent', () => {
  let component: FfBadgeComponent;
  let fixture: ComponentFixture<FfBadgeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FfBadgeComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(FfBadgeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have default variant "neutral"', () => {
    expect(component.variant()).toBe('neutral');
  });

  it('should have default size "md"', () => {
    expect(component.size()).toBe('md');
  });

  it('should apply variant class to host', () => {
    const hostEl = fixture.nativeElement as HTMLElement;
    expect(hostEl.classList.contains('ff-badge--neutral')).toBe(true);
  });

  it('should apply size class to host', () => {
    const hostEl = fixture.nativeElement as HTMLElement;
    expect(hostEl.classList.contains('ff-badge--md')).toBe(true);
  });

  it('should apply success variant class', () => {
    fixture.componentRef.setInput('variant', 'success');
    fixture.detectChanges();

    const hostEl = fixture.nativeElement as HTMLElement;
    expect(hostEl.classList.contains('ff-badge--success')).toBe(true);
  });

  it('should apply warning variant class', () => {
    fixture.componentRef.setInput('variant', 'warning');
    fixture.detectChanges();

    const hostEl = fixture.nativeElement as HTMLElement;
    expect(hostEl.classList.contains('ff-badge--warning')).toBe(true);
  });

  it('should apply error variant class', () => {
    fixture.componentRef.setInput('variant', 'error');
    fixture.detectChanges();

    const hostEl = fixture.nativeElement as HTMLElement;
    expect(hostEl.classList.contains('ff-badge--error')).toBe(true);
  });

  it('should apply info variant class', () => {
    fixture.componentRef.setInput('variant', 'info');
    fixture.detectChanges();

    const hostEl = fixture.nativeElement as HTMLElement;
    expect(hostEl.classList.contains('ff-badge--info')).toBe(true);
  });

  it('should apply sm size class', () => {
    fixture.componentRef.setInput('size', 'sm');
    fixture.detectChanges();

    const hostEl = fixture.nativeElement as HTMLElement;
    expect(hostEl.classList.contains('ff-badge--sm')).toBe(true);
  });

  it('should render label container', () => {
    const label = fixture.nativeElement.querySelector('.ff-badge__label');
    expect(label).toBeTruthy();
  });

  it('should have default shape "pill" and apply its class', () => {
    const hostEl = fixture.nativeElement as HTMLElement;
    expect(component.shape()).toBe('pill');
    expect(hostEl.classList.contains('ff-badge--pill')).toBe(true);
  });

  it('should apply square shape class', () => {
    fixture.componentRef.setInput('shape', 'square');
    fixture.detectChanges();

    const hostEl = fixture.nativeElement as HTMLElement;
    expect(hostEl.classList.contains('ff-badge--square')).toBe(true);
    expect(hostEl.classList.contains('ff-badge--pill')).toBe(false);
  });

  it('should apply xs size class', () => {
    fixture.componentRef.setInput('size', 'xs');
    fixture.detectChanges();

    const hostEl = fixture.nativeElement as HTMLElement;
    expect(hostEl.classList.contains('ff-badge--xs')).toBe(true);
  });

  it('should apply color class when color is set', () => {
    fixture.componentRef.setInput('color', 'primary');
    fixture.detectChanges();

    const hostEl = fixture.nativeElement as HTMLElement;
    expect(hostEl.classList.contains('ff-badge--primary')).toBe(true);
  });

  it('should give color precedence over variant', () => {
    fixture.componentRef.setInput('variant', 'error');
    fixture.componentRef.setInput('color', 'secondary');
    fixture.detectChanges();

    const hostEl = fixture.nativeElement as HTMLElement;
    expect(hostEl.classList.contains('ff-badge--secondary')).toBe(true);
    expect(hostEl.classList.contains('ff-badge--error')).toBe(false);
  });

  it('should fall back to variant when color is not set', () => {
    fixture.componentRef.setInput('variant', 'warning');
    fixture.detectChanges();

    const hostEl = fixture.nativeElement as HTMLElement;
    expect(hostEl.classList.contains('ff-badge--warning')).toBe(true);
  });

  it('should not render a dot by default', () => {
    expect(component.dot()).toBe(false);
    expect(fixture.nativeElement.querySelector('.ff-badge__dot')).toBeNull();
  });

  it('should render an aria-hidden dot and apply dot class when dot is true', () => {
    fixture.componentRef.setInput('dot', true);
    fixture.detectChanges();

    const hostEl = fixture.nativeElement as HTMLElement;
    const dot = hostEl.querySelector('.ff-badge__dot');
    expect(hostEl.classList.contains('ff-badge--dot')).toBe(true);
    expect(dot).toBeTruthy();
    expect(dot?.getAttribute('aria-hidden')).toBe('true');
  });

  describe('overflow tooltip', () => {
    let hostFixture: ComponentFixture<OverflowHost>;
    let badgeEl: HTMLElement;
    let labelEl: HTMLElement;

    beforeEach(async () => {
      hostFixture = TestBed.createComponent(OverflowHost);
      hostFixture.detectChanges();
      badgeEl = hostFixture.nativeElement.querySelector('ff-badge');
      labelEl = badgeEl.querySelector('.ff-badge__label') as HTMLElement;
    });

    it('should not set title nor truncate class when maxWidth is not set', () => {
      expect(badgeEl.classList.contains('ff-badge--truncate')).toBe(false);
      expect(badgeEl.hasAttribute('title')).toBe(false);
    });

    it('should set the host title to the label text when really truncated', () => {
      mockOverflow(labelEl, 200, 120);
      hostFixture.componentInstance.maxWidth.set('120px');
      hostFixture.detectChanges();

      expect(badgeEl.classList.contains('ff-badge--truncate')).toBe(true);
      expect(labelEl.style.maxWidth).toBe('120px');
      expect(badgeEl.getAttribute('title')).toBe('Very long badge label');
    });

    it('should not set title when maxWidth is set but nothing is truncated', () => {
      mockOverflow(labelEl, 80, 120);
      hostFixture.componentInstance.maxWidth.set('120px');
      hostFixture.detectChanges();

      expect(badgeEl.classList.contains('ff-badge--truncate')).toBe(true);
      expect(badgeEl.hasAttribute('title')).toBe(false);
    });

    it('should remove the title when maxWidth is cleared', () => {
      mockOverflow(labelEl, 200, 120);
      hostFixture.componentInstance.maxWidth.set('120px');
      hostFixture.detectChanges();
      expect(badgeEl.hasAttribute('title')).toBe(true);

      hostFixture.componentInstance.maxWidth.set(undefined);
      hostFixture.detectChanges();

      expect(badgeEl.hasAttribute('title')).toBe(false);
      expect(labelEl.style.maxWidth).toBe('');
    });
  });
});
