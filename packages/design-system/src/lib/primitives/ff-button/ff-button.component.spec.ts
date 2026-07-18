import 'zone.js';
import 'zone.js/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  BrowserTestingModule,
  platformBrowserTesting,
} from '@angular/platform-browser/testing';
import { FfButtonComponent } from './ff-button.component';

TestBed.initTestEnvironment(BrowserTestingModule, platformBrowserTesting(), {
  teardown: { destroyAfterEach: true },
});

describe('FfButtonComponent', () => {
  let component: FfButtonComponent;
  let fixture: ComponentFixture<FfButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FfButtonComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(FfButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have default variant "solid"', () => {
    expect(component.variant()).toBe('solid');
  });

  it('should have no explicit default color (resolves to "primary")', () => {
    expect(component.color()).toBeUndefined();
  });

  it('should have default size "md"', () => {
    expect(component.size()).toBe('md');
  });

  it('should not be disabled by default', () => {
    expect(component.disabled()).toBe(false);
  });

  it('should not be loading by default', () => {
    expect(component.loading()).toBe(false);
  });

  it('should apply the default style + color classes to host', () => {
    const hostEl = fixture.nativeElement as HTMLElement;
    expect(hostEl.classList.contains('ff-button--solid')).toBe(true);
    expect(hostEl.classList.contains('ff-button--color-primary')).toBe(true);
  });

  it('should apply size class to host', () => {
    const hostEl = fixture.nativeElement as HTMLElement;
    expect(hostEl.classList.contains('ff-button--md')).toBe(true);
  });

  it('should emit clicked on click when not disabled', () => {
    const spy = vi.fn();
    component.clicked.subscribe(spy);

    const button = fixture.nativeElement.querySelector('button');
    button.click();

    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('should not emit clicked when disabled', () => {
    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();

    const spy = vi.fn();
    component.clicked.subscribe(spy);

    component.onClick();

    expect(spy).not.toHaveBeenCalled();
  });

  it('should not emit clicked when loading', () => {
    fixture.componentRef.setInput('loading', true);
    fixture.detectChanges();

    const spy = vi.fn();
    component.clicked.subscribe(spy);

    component.onClick();

    expect(spy).not.toHaveBeenCalled();
  });

  it('should render spinner when loading', () => {
    fixture.componentRef.setInput('loading', true);
    fixture.detectChanges();

    const spinner = fixture.nativeElement.querySelector('.ff-button__spinner');
    expect(spinner).toBeTruthy();
  });

  it('should not render spinner when not loading', () => {
    const spinner = fixture.nativeElement.querySelector('.ff-button__spinner');
    expect(spinner).toBeFalsy();
  });

  it('should set aria-disabled when disabled', () => {
    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();

    const button = fixture.nativeElement.querySelector('button');
    expect(button.getAttribute('aria-disabled')).toBe('true');
  });

  it('should set aria-busy when loading', () => {
    fixture.componentRef.setInput('loading', true);
    fixture.detectChanges();

    const button = fixture.nativeElement.querySelector('button');
    expect(button.getAttribute('aria-busy')).toBe('true');
  });

  it('should apply disabled class to host when disabled', () => {
    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();

    const hostEl = fixture.nativeElement as HTMLElement;
    expect(hostEl.classList.contains('ff-button--disabled')).toBe(true);
  });

  it('should project content', () => {
    const hostEl = fixture.nativeElement as HTMLElement;
    const content = hostEl.querySelector('.ff-button__content');
    expect(content).toBeTruthy();
  });

  it('should keep content visible when loading', () => {
    fixture.componentRef.setInput('loading', true);
    fixture.detectChanges();

    const content = fixture.nativeElement.querySelector('.ff-button__content');
    expect(content).toBeTruthy();
    expect(getComputedStyle(content).visibility).not.toBe('hidden');
  });

  describe('dual-axis styling', () => {
    it('applies the style axis class independently of color', () => {
      fixture.componentRef.setInput('variant', 'outline');
      fixture.componentRef.setInput('color', 'success');
      fixture.detectChanges();

      const hostEl = fixture.nativeElement as HTMLElement;
      expect(hostEl.classList.contains('ff-button--outline')).toBe(true);
      expect(hostEl.classList.contains('ff-button--color-success')).toBe(true);
    });

    it('applies every documented color with the ghost style', () => {
      const colors = [
        'primary',
        'secondary',
        'success',
        'warning',
        'error',
        'info',
        'neutral',
      ] as const;

      for (const color of colors) {
        fixture.componentRef.setInput('variant', 'ghost');
        fixture.componentRef.setInput('color', color);
        fixture.detectChanges();

        const hostEl = fixture.nativeElement as HTMLElement;
        expect(hostEl.classList.contains('ff-button--ghost')).toBe(true);
        expect(hostEl.classList.contains(`ff-button--color-${color}`)).toBe(true);
      }
    });
  });

  describe('legacy variant backward compatibility', () => {
    it('maps variant="primary" to solid + color primary', () => {
      fixture.componentRef.setInput('variant', 'primary');
      fixture.detectChanges();

      const hostEl = fixture.nativeElement as HTMLElement;
      expect(hostEl.classList.contains('ff-button--solid')).toBe(true);
      expect(hostEl.classList.contains('ff-button--color-primary')).toBe(true);
    });

    it('maps variant="secondary" to solid + color secondary', () => {
      fixture.componentRef.setInput('variant', 'secondary');
      fixture.detectChanges();

      const hostEl = fixture.nativeElement as HTMLElement;
      expect(hostEl.classList.contains('ff-button--solid')).toBe(true);
      expect(hostEl.classList.contains('ff-button--color-secondary')).toBe(true);
    });

    it('keeps rendering variant="outline" as the outline style with the primary color', () => {
      fixture.componentRef.setInput('variant', 'outline');
      fixture.detectChanges();

      const hostEl = fixture.nativeElement as HTMLElement;
      expect(hostEl.classList.contains('ff-button--outline')).toBe(true);
      expect(hostEl.classList.contains('ff-button--color-primary')).toBe(true);
    });

    it('keeps rendering variant="ghost" as the ghost style with the primary color', () => {
      fixture.componentRef.setInput('variant', 'ghost');
      fixture.detectChanges();

      const hostEl = fixture.nativeElement as HTMLElement;
      expect(hostEl.classList.contains('ff-button--ghost')).toBe(true);
      expect(hostEl.classList.contains('ff-button--color-primary')).toBe(true);
    });

    it('lets an explicit color override the legacy variant-derived default', () => {
      fixture.componentRef.setInput('variant', 'secondary');
      fixture.componentRef.setInput('color', 'success');
      fixture.detectChanges();

      const hostEl = fixture.nativeElement as HTMLElement;
      expect(hostEl.classList.contains('ff-button--solid')).toBe(true);
      expect(hostEl.classList.contains('ff-button--color-success')).toBe(true);
      expect(hostEl.classList.contains('ff-button--color-secondary')).toBe(false);
    });
  });
});
