import 'zone.js';
import 'zone.js/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  BrowserTestingModule,
  platformBrowserTesting,
} from '@angular/platform-browser/testing';
import { FfBadgeComponent } from './ff-badge.component';

TestBed.initTestEnvironment(BrowserTestingModule, platformBrowserTesting(), {
  teardown: { destroyAfterEach: true },
});

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
});
