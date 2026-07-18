import 'zone.js';
import 'zone.js/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  BrowserTestingModule,
  platformBrowserTesting,
} from '@angular/platform-browser/testing';
import { FfSkeletonComponent } from './ff-skeleton.component';

TestBed.initTestEnvironment(BrowserTestingModule, platformBrowserTesting(), {
  teardown: { destroyAfterEach: true },
});

describe('FfSkeletonComponent', () => {
  let fixture: ComponentFixture<FfSkeletonComponent>;
  let component: FfSkeletonComponent;

  const lines = (): HTMLElement[] =>
    Array.from(fixture.nativeElement.querySelectorAll('.ff-skeleton__line'));

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FfSkeletonComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(FfSkeletonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should be hidden from assistive technology', () => {
    const host = fixture.nativeElement as HTMLElement;
    expect(host.getAttribute('aria-hidden')).toBe('true');
  });

  it('should default to a single animated text line at 100% width and 1em height', () => {
    const host = fixture.nativeElement as HTMLElement;
    expect(host.classList.contains('ff-skeleton--text')).toBe(true);
    expect(host.classList.contains('ff-skeleton--animated')).toBe(true);

    const all = lines();
    expect(all.length).toBe(1);
    expect(all[0].style.width).toBe('100%');
    expect(all[0].style.height).toBe('1em');
  });

  it.each(['text', 'rect', 'circle'])(
    'should apply %s variant class',
    (variant) => {
      fixture.componentRef.setInput('variant', variant);
      fixture.detectChanges();

      const host = fixture.nativeElement as HTMLElement;
      expect(host.classList.contains(`ff-skeleton--${variant}`)).toBe(true);
    }
  );

  it('should default rect height to 80px', () => {
    fixture.componentRef.setInput('variant', 'rect');
    fixture.detectChanges();

    expect(lines()[0].style.height).toBe('80px');
  });

  it('should default circle to 40px x 40px', () => {
    fixture.componentRef.setInput('variant', 'circle');
    fixture.detectChanges();

    expect(lines()[0].style.height).toBe('40px');
    expect(lines()[0].style.width).toBe('40px');
  });

  it('should honor explicit width and height', () => {
    fixture.componentRef.setInput('variant', 'rect');
    fixture.componentRef.setInput('width', '200px');
    fixture.componentRef.setInput('height', '120px');
    fixture.detectChanges();

    expect(lines()[0].style.width).toBe('200px');
    expect(lines()[0].style.height).toBe('120px');
  });

  it('should render N lines for the text variant, the last at 60% width', () => {
    fixture.componentRef.setInput('lines', 3);
    fixture.detectChanges();

    const all = lines();
    expect(all.length).toBe(3);
    expect(all[0].style.width).toBe('100%');
    expect(all[1].style.width).toBe('100%');
    expect(all[2].style.width).toBe('60%');
  });

  it('should ignore lines for non-text variants', () => {
    fixture.componentRef.setInput('variant', 'rect');
    fixture.componentRef.setInput('lines', 4);
    fixture.detectChanges();

    expect(lines().length).toBe(1);
  });

  it('should remove the animated class when animated is false', () => {
    fixture.componentRef.setInput('animated', false);
    fixture.detectChanges();

    const host = fixture.nativeElement as HTMLElement;
    expect(host.classList.contains('ff-skeleton--animated')).toBe(false);
  });
});
