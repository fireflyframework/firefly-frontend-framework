import 'zone.js';
import 'zone.js/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  BrowserTestingModule,
  platformBrowserTesting,
} from '@angular/platform-browser/testing';
import { FfDividerComponent } from './ff-divider.component';

TestBed.initTestEnvironment(BrowserTestingModule, platformBrowserTesting(), {
  teardown: { destroyAfterEach: true },
});

describe('FfDividerComponent', () => {
  let component: FfDividerComponent;
  let fixture: ComponentFixture<FfDividerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FfDividerComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(FfDividerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have default orientation "horizontal"', () => {
    expect(component.orientation()).toBe('horizontal');
  });

  it('should have default thickness "thin"', () => {
    expect(component.thickness()).toBe('thin');
  });

  it('should apply horizontal class to host', () => {
    const hostEl = fixture.nativeElement as HTMLElement;
    expect(hostEl.classList.contains('ff-divider--horizontal')).toBe(true);
  });

  it('should apply thin class to host', () => {
    const hostEl = fixture.nativeElement as HTMLElement;
    expect(hostEl.classList.contains('ff-divider--thin')).toBe(true);
  });

  it('should apply vertical class when set', () => {
    fixture.componentRef.setInput('orientation', 'vertical');
    fixture.detectChanges();

    const hostEl = fixture.nativeElement as HTMLElement;
    expect(hostEl.classList.contains('ff-divider--vertical')).toBe(true);
  });

  it('should apply medium thickness class when set', () => {
    fixture.componentRef.setInput('thickness', 'medium');
    fixture.detectChanges();

    const hostEl = fixture.nativeElement as HTMLElement;
    expect(hostEl.classList.contains('ff-divider--medium')).toBe(true);
  });

  it('should have role="separator"', () => {
    const hostEl = fixture.nativeElement as HTMLElement;
    expect(hostEl.getAttribute('role')).toBe('separator');
  });

  it('should have aria-orientation matching orientation input', () => {
    const hostEl = fixture.nativeElement as HTMLElement;
    expect(hostEl.getAttribute('aria-orientation')).toBe('horizontal');
  });

  it('should update aria-orientation when orientation changes', () => {
    fixture.componentRef.setInput('orientation', 'vertical');
    fixture.detectChanges();

    const hostEl = fixture.nativeElement as HTMLElement;
    expect(hostEl.getAttribute('aria-orientation')).toBe('vertical');
  });
});
