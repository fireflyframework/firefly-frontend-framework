import 'zone.js';
import 'zone.js/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  BrowserTestingModule,
  platformBrowserTesting,
} from '@angular/platform-browser/testing';
import { FfBannerComponent } from './ff-banner.component';

TestBed.initTestEnvironment(BrowserTestingModule, platformBrowserTesting(), {
  teardown: { destroyAfterEach: true },
});

describe('FfBannerComponent', () => {
  let component: FfBannerComponent;
  let fixture: ComponentFixture<FfBannerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FfBannerComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(FfBannerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have info type by default', () => {
    expect(component.type()).toBe('info');
  });

  it('should have empty message by default', () => {
    expect(component.message()).toBe('');
  });

  it('should be dismissible by default', () => {
    expect(component.dismissible()).toBe(true);
  });

  it('should have ff-banner base class', () => {
    const host = fixture.nativeElement as HTMLElement;
    expect(host.classList.contains('ff-banner')).toBe(true);
  });

  it('should apply variant class from type', () => {
    fixture.componentRef.setInput('type', 'warning');
    fixture.detectChanges();

    const host = fixture.nativeElement as HTMLElement;
    expect(host.classList.contains('ff-banner--warning')).toBe(true);
  });

  it('should have role alert', () => {
    const host = fixture.nativeElement as HTMLElement;
    expect(host.getAttribute('role')).toBe('alert');
  });

  it('should render message text', () => {
    fixture.componentRef.setInput('message', 'Maintenance at 2am');
    fixture.detectChanges();

    const msg = fixture.nativeElement.querySelector('.ff-banner__message');
    expect(msg.textContent.trim()).toBe('Maintenance at 2am');
  });

  it('should render close button when dismissible', () => {
    const close = fixture.nativeElement.querySelector('.ff-banner__close');
    expect(close).toBeTruthy();
  });

  it('should not render close button when not dismissible', () => {
    fixture.componentRef.setInput('dismissible', false);
    fixture.detectChanges();

    const close = fixture.nativeElement.querySelector('.ff-banner__close');
    expect(close).toBeFalsy();
  });

  it('should emit dismissed on close click', () => {
    const spy = vi.fn();
    component.dismissed.subscribe(spy);

    const close = fixture.nativeElement.querySelector('.ff-banner__close');
    close.click();

    expect(spy).toHaveBeenCalledOnce();
  });

  it('should not render icon by default', () => {
    const icon = fixture.nativeElement.querySelector('.ff-banner__icon');
    expect(icon).toBeFalsy();
  });

  it('should render icon when provided', () => {
    fixture.componentRef.setInput('icon', 'i');
    fixture.detectChanges();

    const icon = fixture.nativeElement.querySelector('.ff-banner__icon');
    expect(icon).toBeTruthy();
    expect(icon.textContent.trim()).toBe('i');
  });

  it('should not render action button by default', () => {
    const action = fixture.nativeElement.querySelector('.ff-banner__action');
    expect(action).toBeFalsy();
  });

  it('should render action button when actionLabel is provided', () => {
    fixture.componentRef.setInput('actionLabel', 'Retry');
    fixture.detectChanges();

    const action = fixture.nativeElement.querySelector('.ff-banner__action');
    expect(action).toBeTruthy();
    expect(action.textContent.trim()).toBe('Retry');
  });

  it('should emit actionClicked on action button click', () => {
    fixture.componentRef.setInput('actionLabel', 'Retry');
    fixture.detectChanges();

    const spy = vi.fn();
    component.actionClicked.subscribe(spy);

    const action = fixture.nativeElement.querySelector('.ff-banner__action');
    action.click();

    expect(spy).toHaveBeenCalledOnce();
  });

  it('should update variant class when type changes', () => {
    fixture.componentRef.setInput('type', 'error');
    fixture.detectChanges();

    const host = fixture.nativeElement as HTMLElement;
    expect(host.classList.contains('ff-banner--error')).toBe(true);

    fixture.componentRef.setInput('type', 'success');
    fixture.detectChanges();

    expect(host.classList.contains('ff-banner--success')).toBe(true);
    expect(host.classList.contains('ff-banner--error')).toBe(false);
  });
});
