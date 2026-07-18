import 'zone.js';
import 'zone.js/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  BrowserTestingModule,
  platformBrowserTesting,
} from '@angular/platform-browser/testing';
import { FfProgressComponent } from './ff-progress.component';

TestBed.initTestEnvironment(BrowserTestingModule, platformBrowserTesting(), {
  teardown: { destroyAfterEach: true },
});

describe('FfProgressComponent', () => {
  let fixture: ComponentFixture<FfProgressComponent>;
  let component: FfProgressComponent;

  const track = (): HTMLElement =>
    fixture.nativeElement.querySelector('.ff-progress__track');
  const fill = (): HTMLElement =>
    fixture.nativeElement.querySelector('.ff-progress__fill');

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FfProgressComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(FfProgressComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('value', 50);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should default variant to primary and size to md', () => {
    const host = fixture.nativeElement as HTMLElement;
    expect(host.classList.contains('ff-progress')).toBe(true);
    expect(host.classList.contains('ff-progress--primary')).toBe(true);
    expect(host.classList.contains('ff-progress--md')).toBe(true);
  });

  it.each(['primary', 'success', 'warning', 'error'])(
    'should apply %s variant class',
    (variant) => {
      fixture.componentRef.setInput('variant', variant);
      fixture.detectChanges();

      const host = fixture.nativeElement as HTMLElement;
      expect(host.classList.contains(`ff-progress--${variant}`)).toBe(true);
    }
  );

  it('should apply sm size class', () => {
    fixture.componentRef.setInput('size', 'sm');
    fixture.detectChanges();

    const host = fixture.nativeElement as HTMLElement;
    expect(host.classList.contains('ff-progress--sm')).toBe(true);
  });

  it('should set the fill width from the value', () => {
    expect(fill().style.width).toBe('50%');
  });

  it('should clamp values below 0 to 0', () => {
    fixture.componentRef.setInput('value', -20);
    fixture.detectChanges();

    expect(fill().style.width).toBe('0%');
    expect(track().getAttribute('aria-valuenow')).toBe('0');
  });

  it('should clamp values above 100 to 100', () => {
    fixture.componentRef.setInput('value', 250);
    fixture.detectChanges();

    expect(fill().style.width).toBe('100%');
    expect(track().getAttribute('aria-valuenow')).toBe('100');
  });

  it('should expose progressbar aria attributes', () => {
    const el = track();
    expect(el.getAttribute('role')).toBe('progressbar');
    expect(el.getAttribute('aria-valuemin')).toBe('0');
    expect(el.getAttribute('aria-valuemax')).toBe('100');
    expect(el.getAttribute('aria-valuenow')).toBe('50');
  });

  it('should not set aria-label when label is not provided', () => {
    expect(track().getAttribute('aria-label')).toBeNull();
  });

  it('should set aria-label from the label input', () => {
    fixture.componentRef.setInput('label', 'Upload progress');
    fixture.detectChanges();

    expect(track().getAttribute('aria-label')).toBe('Upload progress');
  });

  it('should not render the value text by default', () => {
    const value = fixture.nativeElement.querySelector('.ff-progress__value');
    expect(value).toBeNull();
  });

  it('should render the rounded percentage when showValue is true', () => {
    fixture.componentRef.setInput('showValue', true);
    fixture.componentRef.setInput('value', 42.6);
    fixture.detectChanges();

    const value = fixture.nativeElement.querySelector('.ff-progress__value');
    expect(value).toBeTruthy();
    expect(value.textContent.trim()).toBe('43%');
  });
});
