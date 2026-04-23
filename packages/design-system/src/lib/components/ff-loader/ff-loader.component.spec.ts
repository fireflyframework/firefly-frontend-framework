import 'zone.js';
import 'zone.js/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  BrowserTestingModule,
  platformBrowserTesting,
} from '@angular/platform-browser/testing';
import { FfLoaderComponent } from './ff-loader.component';

TestBed.initTestEnvironment(BrowserTestingModule, platformBrowserTesting(), {
  teardown: { destroyAfterEach: true },
});

describe('FfLoaderComponent', () => {
  let component: FfLoaderComponent;
  let fixture: ComponentFixture<FfLoaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FfLoaderComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(FfLoaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have default variant "spinner"', () => {
    expect(component.variant()).toBe('spinner');
  });

  it('should have default size "md"', () => {
    expect(component.size()).toBe('md');
  });

  it('should render spinner element by default', () => {
    const spinner = fixture.nativeElement.querySelector('.ff-loader__spinner');
    expect(spinner).toBeTruthy();
  });

  it('should not render skeleton when variant is spinner', () => {
    const skeleton = fixture.nativeElement.querySelector('.ff-loader__skeleton');
    expect(skeleton).toBeFalsy();
  });

  it('should render skeleton when variant is skeleton', () => {
    fixture.componentRef.setInput('variant', 'skeleton');
    fixture.detectChanges();

    const skeleton = fixture.nativeElement.querySelector('.ff-loader__skeleton');
    expect(skeleton).toBeTruthy();
  });

  it('should not render spinner when variant is skeleton', () => {
    fixture.componentRef.setInput('variant', 'skeleton');
    fixture.detectChanges();

    const spinner = fixture.nativeElement.querySelector('.ff-loader__spinner');
    expect(spinner).toBeFalsy();
  });

  it('should apply variant class to host', () => {
    const hostEl = fixture.nativeElement as HTMLElement;
    expect(hostEl.classList.contains('ff-loader--spinner')).toBe(true);
  });

  it('should apply size class to host', () => {
    const hostEl = fixture.nativeElement as HTMLElement;
    expect(hostEl.classList.contains('ff-loader--md')).toBe(true);
  });

  it('should have role="status" on host', () => {
    const hostEl = fixture.nativeElement as HTMLElement;
    expect(hostEl.getAttribute('role')).toBe('status');
  });

  it('should have aria-label on host', () => {
    const hostEl = fixture.nativeElement as HTMLElement;
    expect(hostEl.getAttribute('aria-label')).toBe('Loading');
  });

  it('should apply lg size class', () => {
    fixture.componentRef.setInput('size', 'lg');
    fixture.detectChanges();

    const hostEl = fixture.nativeElement as HTMLElement;
    expect(hostEl.classList.contains('ff-loader--lg')).toBe(true);
  });
});
