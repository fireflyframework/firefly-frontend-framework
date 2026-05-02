import 'zone.js';
import 'zone.js/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  BrowserTestingModule,
  platformBrowserTesting,
} from '@angular/platform-browser/testing';
import { FfToastComponent } from './ff-toast.component';

TestBed.initTestEnvironment(BrowserTestingModule, platformBrowserTesting(), {
  teardown: { destroyAfterEach: true },
});

describe('FfToastComponent', () => {
  let component: FfToastComponent;
  let fixture: ComponentFixture<FfToastComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FfToastComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(FfToastComponent);
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

  it('should have ff-toast base class', () => {
    const host = fixture.nativeElement as HTMLElement;
    expect(host.classList.contains('ff-toast')).toBe(true);
  });

  it('should apply variant class from type', () => {
    fixture.componentRef.setInput('type', 'error');
    fixture.detectChanges();

    const host = fixture.nativeElement as HTMLElement;
    expect(host.classList.contains('ff-toast--error')).toBe(true);
  });

  it('should have role status', () => {
    const host = fixture.nativeElement as HTMLElement;
    expect(host.getAttribute('role')).toBe('status');
  });

  it('should render message text', () => {
    fixture.componentRef.setInput('message', 'File saved');
    fixture.detectChanges();

    const msg = fixture.nativeElement.querySelector('.ff-toast__message');
    expect(msg.textContent.trim()).toBe('File saved');
  });

  it('should render close button when dismissible', () => {
    const close = fixture.nativeElement.querySelector('.ff-toast__close');
    expect(close).toBeTruthy();
  });

  it('should not render close button when not dismissible', () => {
    fixture.componentRef.setInput('dismissible', false);
    fixture.detectChanges();

    const close = fixture.nativeElement.querySelector('.ff-toast__close');
    expect(close).toBeFalsy();
  });

  it('should emit dismissed on close click', () => {
    const spy = vi.fn();
    component.dismissed.subscribe(spy);

    const close = fixture.nativeElement.querySelector('.ff-toast__close');
    close.click();

    expect(spy).toHaveBeenCalledOnce();
  });

  it('should not render icon by default', () => {
    const icon = fixture.nativeElement.querySelector('.ff-toast__icon');
    expect(icon).toBeFalsy();
  });

  it('should render icon when provided', () => {
    fixture.componentRef.setInput('icon', '!');
    fixture.detectChanges();

    const icon = fixture.nativeElement.querySelector('.ff-toast__icon');
    expect(icon).toBeTruthy();
    expect(icon.textContent.trim()).toBe('!');
  });

  it('should update variant class when type changes', () => {
    fixture.componentRef.setInput('type', 'success');
    fixture.detectChanges();

    const host = fixture.nativeElement as HTMLElement;
    expect(host.classList.contains('ff-toast--success')).toBe(true);

    fixture.componentRef.setInput('type', 'warning');
    fixture.detectChanges();

    expect(host.classList.contains('ff-toast--warning')).toBe(true);
    expect(host.classList.contains('ff-toast--success')).toBe(false);
  });
});
