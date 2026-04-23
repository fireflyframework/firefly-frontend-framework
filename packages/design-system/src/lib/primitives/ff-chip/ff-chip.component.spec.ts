import 'zone.js';
import 'zone.js/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  BrowserTestingModule,
  platformBrowserTesting,
} from '@angular/platform-browser/testing';
import { FfChipComponent } from './ff-chip.component';

TestBed.initTestEnvironment(BrowserTestingModule, platformBrowserTesting(), {
  teardown: { destroyAfterEach: true },
});

describe('FfChipComponent', () => {
  let component: FfChipComponent;
  let fixture: ComponentFixture<FfChipComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FfChipComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(FfChipComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have default variant "default"', () => {
    expect(component.variant()).toBe('default');
  });

  it('should have default size "md"', () => {
    expect(component.size()).toBe('md');
  });

  it('should have default selected false', () => {
    expect(component.selected()).toBe(false);
  });

  it('should have default disabled false', () => {
    expect(component.disabled()).toBe(false);
  });

  it('should apply variant class to host', () => {
    const hostEl = fixture.nativeElement as HTMLElement;
    expect(hostEl.classList.contains('ff-chip--default')).toBe(true);
  });

  it('should apply size class to host', () => {
    const hostEl = fixture.nativeElement as HTMLElement;
    expect(hostEl.classList.contains('ff-chip--md')).toBe(true);
  });

  it('should apply filter variant class', () => {
    fixture.componentRef.setInput('variant', 'filter');
    fixture.detectChanges();

    const hostEl = fixture.nativeElement as HTMLElement;
    expect(hostEl.classList.contains('ff-chip--filter')).toBe(true);
  });

  it('should apply selected class when selected is true', () => {
    fixture.componentRef.setInput('selected', true);
    fixture.detectChanges();

    const hostEl = fixture.nativeElement as HTMLElement;
    expect(hostEl.classList.contains('ff-chip--selected')).toBe(true);
  });

  it('should not apply selected class when selected is false', () => {
    const hostEl = fixture.nativeElement as HTMLElement;
    expect(hostEl.classList.contains('ff-chip--selected')).toBe(false);
  });

  it('should apply disabled class when disabled', () => {
    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();

    const hostEl = fixture.nativeElement as HTMLElement;
    expect(hostEl.classList.contains('ff-chip--disabled')).toBe(true);
  });

  it('should apply sm size class', () => {
    fixture.componentRef.setInput('size', 'sm');
    fixture.detectChanges();

    const hostEl = fixture.nativeElement as HTMLElement;
    expect(hostEl.classList.contains('ff-chip--sm')).toBe(true);
  });

  it('should render body button', () => {
    const body = fixture.nativeElement.querySelector('.ff-chip__body');
    expect(body).toBeTruthy();
    expect(body.tagName).toBe('BUTTON');
  });

  it('should not render remove button by default', () => {
    const remove = fixture.nativeElement.querySelector('.ff-chip__remove');
    expect(remove).toBeNull();
  });

  it('should render remove button for removable variant', () => {
    fixture.componentRef.setInput('variant', 'removable');
    fixture.detectChanges();

    const remove = fixture.nativeElement.querySelector('.ff-chip__remove');
    expect(remove).toBeTruthy();
    expect(remove.getAttribute('aria-label')).toBe('Remove');
  });

  it('should emit clicked on body click', () => {
    const spy = vi.fn();
    component.clicked.subscribe(spy);

    const body = fixture.nativeElement.querySelector('.ff-chip__body');
    body.click();

    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('should not emit clicked when disabled', () => {
    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();

    const spy = vi.fn();
    component.clicked.subscribe(spy);

    // Call onClick directly since disabled button won't fire click in DOM
    component.onClick();

    expect(spy).not.toHaveBeenCalled();
  });

  it('should emit removed on remove button click', () => {
    fixture.componentRef.setInput('variant', 'removable');
    fixture.detectChanges();

    const spy = vi.fn();
    component.removed.subscribe(spy);

    const remove = fixture.nativeElement.querySelector('.ff-chip__remove');
    remove.click();

    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('should not emit removed when disabled', () => {
    fixture.componentRef.setInput('variant', 'removable');
    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();

    const spy = vi.fn();
    component.removed.subscribe(spy);

    component.onRemove(new Event('click'));

    expect(spy).not.toHaveBeenCalled();
  });

  it('should stop propagation on remove click', () => {
    fixture.componentRef.setInput('variant', 'removable');
    fixture.detectChanges();

    const event = new Event('click');
    const stopSpy = vi.spyOn(event, 'stopPropagation');

    component.onRemove(event);

    expect(stopSpy).toHaveBeenCalled();
  });

  it('should disable body button when disabled', () => {
    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();

    const body = fixture.nativeElement.querySelector('.ff-chip__body');
    expect(body.disabled).toBe(true);
  });
});
