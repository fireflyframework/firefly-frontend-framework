import 'zone.js';
import 'zone.js/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  BrowserTestingModule,
  platformBrowserTesting,
} from '@angular/platform-browser/testing';
import { FfTooltipComponent } from './ff-tooltip.component';

TestBed.initTestEnvironment(BrowserTestingModule, platformBrowserTesting(), {
  teardown: { destroyAfterEach: true },
});

describe('FfTooltipComponent', () => {
  let component: FfTooltipComponent;
  let fixture: ComponentFixture<FfTooltipComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FfTooltipComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(FfTooltipComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have default position "top"', () => {
    expect(component.position()).toBe('top');
  });

  it('should have default text empty', () => {
    expect(component.text()).toBe('');
  });

  it('should not be visible by default', () => {
    expect(component.visible()).toBe(false);
  });

  it('should not render panel when text is empty', () => {
    const panel = fixture.nativeElement.querySelector('.ff-tooltip__panel');
    expect(panel).toBeNull();
  });

  it('should render panel when text is provided', () => {
    fixture.componentRef.setInput('text', 'Hello');
    fixture.detectChanges();

    const panel = fixture.nativeElement.querySelector('.ff-tooltip__panel');
    expect(panel).toBeTruthy();
    expect(panel.textContent.trim()).toBe('Hello');
  });

  it('should show tooltip on show()', () => {
    fixture.componentRef.setInput('text', 'Hello');
    fixture.detectChanges();

    component.show();
    fixture.detectChanges();

    const panel = fixture.nativeElement.querySelector('.ff-tooltip__panel');
    expect(panel.classList.contains('ff-tooltip__panel--visible')).toBe(true);
  });

  it('should hide tooltip on hide()', () => {
    fixture.componentRef.setInput('text', 'Hello');
    fixture.detectChanges();

    component.show();
    fixture.detectChanges();
    component.hide();
    fixture.detectChanges();

    const panel = fixture.nativeElement.querySelector('.ff-tooltip__panel');
    expect(panel.classList.contains('ff-tooltip__panel--visible')).toBe(false);
  });

  it('should not show tooltip when text is empty', () => {
    component.show();
    expect(component.visible()).toBe(false);
  });

  it('should apply top position class by default', () => {
    fixture.componentRef.setInput('text', 'Hello');
    fixture.detectChanges();

    const panel = fixture.nativeElement.querySelector('.ff-tooltip__panel');
    expect(panel.classList.contains('ff-tooltip__panel--top')).toBe(true);
  });

  it('should apply bottom position class', () => {
    fixture.componentRef.setInput('text', 'Hello');
    fixture.componentRef.setInput('position', 'bottom');
    fixture.detectChanges();

    const panel = fixture.nativeElement.querySelector('.ff-tooltip__panel');
    expect(panel.classList.contains('ff-tooltip__panel--bottom')).toBe(true);
  });

  it('should apply left position class', () => {
    fixture.componentRef.setInput('text', 'Hello');
    fixture.componentRef.setInput('position', 'left');
    fixture.detectChanges();

    const panel = fixture.nativeElement.querySelector('.ff-tooltip__panel');
    expect(panel.classList.contains('ff-tooltip__panel--left')).toBe(true);
  });

  it('should apply right position class', () => {
    fixture.componentRef.setInput('text', 'Hello');
    fixture.componentRef.setInput('position', 'right');
    fixture.detectChanges();

    const panel = fixture.nativeElement.querySelector('.ff-tooltip__panel');
    expect(panel.classList.contains('ff-tooltip__panel--right')).toBe(true);
  });

  it('should have role="tooltip" on panel', () => {
    fixture.componentRef.setInput('text', 'Hello');
    fixture.detectChanges();

    const panel = fixture.nativeElement.querySelector('.ff-tooltip__panel');
    expect(panel.getAttribute('role')).toBe('tooltip');
  });

  it('should set aria-describedby on host when text provided', () => {
    fixture.componentRef.setInput('text', 'Hello');
    fixture.detectChanges();

    const hostEl = fixture.nativeElement as HTMLElement;
    expect(hostEl.getAttribute('aria-describedby')).toBe(component.tooltipId);
  });

  it('should not set aria-describedby when text is empty', () => {
    const hostEl = fixture.nativeElement as HTMLElement;
    expect(hostEl.getAttribute('aria-describedby')).toBeNull();
  });

  it('should have unique tooltip id', () => {
    const fixture2 = TestBed.createComponent(FfTooltipComponent);
    const component2 = fixture2.componentInstance;

    expect(component.tooltipId).not.toBe(component2.tooltipId);
    fixture2.destroy();
  });

  it('should show on mouseenter and hide on mouseleave', () => {
    fixture.componentRef.setInput('text', 'Hello');
    fixture.detectChanges();

    const hostEl = fixture.nativeElement as HTMLElement;

    hostEl.dispatchEvent(new Event('mouseenter'));
    fixture.detectChanges();
    expect(component.visible()).toBe(true);

    hostEl.dispatchEvent(new Event('mouseleave'));
    fixture.detectChanges();
    expect(component.visible()).toBe(false);
  });

  it('should show on focusin and hide on focusout', () => {
    fixture.componentRef.setInput('text', 'Hello');
    fixture.detectChanges();

    const hostEl = fixture.nativeElement as HTMLElement;

    hostEl.dispatchEvent(new Event('focusin'));
    fixture.detectChanges();
    expect(component.visible()).toBe(true);

    hostEl.dispatchEvent(new Event('focusout'));
    fixture.detectChanges();
    expect(component.visible()).toBe(false);
  });
});
