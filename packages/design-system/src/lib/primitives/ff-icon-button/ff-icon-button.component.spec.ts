import 'zone.js';
import 'zone.js/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  BrowserTestingModule,
  platformBrowserTesting,
} from '@angular/platform-browser/testing';
import { FfIconButtonComponent } from './ff-icon-button.component';

TestBed.initTestEnvironment(BrowserTestingModule, platformBrowserTesting(), {
  teardown: { destroyAfterEach: true },
});

describe('FfIconButtonComponent', () => {
  let component: FfIconButtonComponent;
  let fixture: ComponentFixture<FfIconButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FfIconButtonComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(FfIconButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have default size "md"', () => {
    expect(component.size()).toBe('md');
  });

  it('should not be disabled by default', () => {
    expect(component.disabled()).toBe(false);
  });

  it('should have empty tooltip by default', () => {
    expect(component.tooltip()).toBe('');
  });

  it('should have empty icon by default', () => {
    expect(component.icon()).toBe('');
  });

  it('should apply size class to host', () => {
    const hostEl = fixture.nativeElement as HTMLElement;
    expect(hostEl.classList.contains('ff-icon-button--md')).toBe(true);
  });

  it('should set title attribute from tooltip input', () => {
    fixture.componentRef.setInput('tooltip', 'Edit item');
    fixture.detectChanges();

    const button = fixture.nativeElement.querySelector('button');
    expect(button.getAttribute('title')).toBe('Edit item');
  });

  it('should set aria-label from tooltip input', () => {
    fixture.componentRef.setInput('tooltip', 'Delete');
    fixture.detectChanges();

    const button = fixture.nativeElement.querySelector('button');
    expect(button.getAttribute('aria-label')).toBe('Delete');
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

  it('should set aria-disabled when disabled', () => {
    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();

    const button = fixture.nativeElement.querySelector('button');
    expect(button.getAttribute('aria-disabled')).toBe('true');
  });

  it('should apply disabled class to host when disabled', () => {
    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();

    const hostEl = fixture.nativeElement as HTMLElement;
    expect(hostEl.classList.contains('ff-icon-button--disabled')).toBe(true);
  });

  it('should render icon content via projection', () => {
    const hostEl = fixture.nativeElement as HTMLElement;
    const iconContainer = hostEl.querySelector('.ff-icon-button__icon');
    expect(iconContainer).toBeTruthy();
  });
});
