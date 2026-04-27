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

  it('should have default variant "primary"', () => {
    expect(component.variant()).toBe('primary');
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

  it('should apply variant class to host', () => {
    const hostEl = fixture.nativeElement as HTMLElement;
    expect(hostEl.classList.contains('ff-button--primary')).toBe(true);
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
});
