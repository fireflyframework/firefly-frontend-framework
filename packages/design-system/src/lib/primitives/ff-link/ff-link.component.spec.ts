import 'zone.js';
import 'zone.js/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  BrowserTestingModule,
  platformBrowserTesting,
} from '@angular/platform-browser/testing';
import { FfLinkComponent } from './ff-link.component';

TestBed.initTestEnvironment(BrowserTestingModule, platformBrowserTesting(), {
  teardown: { destroyAfterEach: true },
});

describe('FfLinkComponent', () => {
  let component: FfLinkComponent;
  let fixture: ComponentFixture<FfLinkComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FfLinkComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(FfLinkComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have default variant "inline"', () => {
    expect(component.variant()).toBe('inline');
  });

  it('should have default target "_self"', () => {
    expect(component.target()).toBe('_self');
  });

  it('should have default underline true', () => {
    expect(component.underline()).toBe(true);
  });

  it('should have default disabled false', () => {
    expect(component.disabled()).toBe(false);
  });

  it('should render anchor element', () => {
    const anchor = fixture.nativeElement.querySelector('.ff-link__anchor');
    expect(anchor).toBeTruthy();
    expect(anchor.tagName).toBe('A');
  });

  it('should apply href to anchor', () => {
    fixture.componentRef.setInput('href', '/dashboard');
    fixture.detectChanges();

    const anchor = fixture.nativeElement.querySelector('.ff-link__anchor');
    expect(anchor.getAttribute('href')).toBe('/dashboard');
  });

  it('should apply target to anchor', () => {
    fixture.componentRef.setInput('target', '_blank');
    fixture.detectChanges();

    const anchor = fixture.nativeElement.querySelector('.ff-link__anchor');
    expect(anchor.getAttribute('target')).toBe('_blank');
  });

  it('should add rel="noopener noreferrer" when target is _blank', () => {
    fixture.componentRef.setInput('target', '_blank');
    fixture.detectChanges();

    const anchor = fixture.nativeElement.querySelector('.ff-link__anchor');
    expect(anchor.getAttribute('rel')).toBe('noopener noreferrer');
  });

  it('should not add rel when target is _self', () => {
    const anchor = fixture.nativeElement.querySelector('.ff-link__anchor');
    expect(anchor.getAttribute('rel')).toBeNull();
  });

  it('should apply inline variant class to host', () => {
    const hostEl = fixture.nativeElement as HTMLElement;
    expect(hostEl.classList.contains('ff-link--inline')).toBe(true);
  });

  it('should apply standalone variant class', () => {
    fixture.componentRef.setInput('variant', 'standalone');
    fixture.detectChanges();

    const hostEl = fixture.nativeElement as HTMLElement;
    expect(hostEl.classList.contains('ff-link--standalone')).toBe(true);
  });

  it('should apply underline class when underline is true', () => {
    const hostEl = fixture.nativeElement as HTMLElement;
    expect(hostEl.classList.contains('ff-link--underline')).toBe(true);
  });

  it('should not apply underline class when underline is false', () => {
    fixture.componentRef.setInput('underline', false);
    fixture.detectChanges();

    const hostEl = fixture.nativeElement as HTMLElement;
    expect(hostEl.classList.contains('ff-link--underline')).toBe(false);
  });

  it('should apply disabled class when disabled', () => {
    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();

    const hostEl = fixture.nativeElement as HTMLElement;
    expect(hostEl.classList.contains('ff-link--disabled')).toBe(true);
  });

  it('should set aria-disabled when disabled', () => {
    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();

    const anchor = fixture.nativeElement.querySelector('.ff-link__anchor');
    expect(anchor.getAttribute('aria-disabled')).toBe('true');
  });

  it('should set tabindex -1 when disabled', () => {
    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();

    const anchor = fixture.nativeElement.querySelector('.ff-link__anchor');
    expect(anchor.getAttribute('tabindex')).toBe('-1');
  });

  it('should emit clicked on click', () => {
    const spy = vi.fn();
    component.clicked.subscribe(spy);

    const anchor = fixture.nativeElement.querySelector('.ff-link__anchor');
    anchor.click();

    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('should not emit clicked when disabled', () => {
    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();

    const spy = vi.fn();
    component.clicked.subscribe(spy);

    const event = new Event('click', { cancelable: true });
    component.onClick(event);

    expect(spy).not.toHaveBeenCalled();
    expect(event.defaultPrevented).toBe(true);
  });
});
