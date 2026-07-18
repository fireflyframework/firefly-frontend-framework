import 'zone.js';
import 'zone.js/testing';
import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import {
  BrowserTestingModule,
  platformBrowserTesting,
} from '@angular/platform-browser/testing';
import { FfCheckboxComponent } from './ff-checkbox.component';

TestBed.initTestEnvironment(BrowserTestingModule, platformBrowserTesting(), {
  teardown: { destroyAfterEach: true },
});

describe('FfCheckboxComponent', () => {
  let component: FfCheckboxComponent;
  let fixture: ComponentFixture<FfCheckboxComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FfCheckboxComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(FfCheckboxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should not be checked by default', () => {
    expect(component.checked()).toBe(false);
  });

  it('should not be indeterminate by default', () => {
    expect(component.indeterminate()).toBe(false);
  });

  it('should not be disabled by default', () => {
    expect(component.disabled()).toBe(false);
  });

  it('should have empty label by default', () => {
    expect(component.label()).toBe('');
  });

  it('should render native checkbox input', () => {
    const input = fixture.nativeElement.querySelector('input[type="checkbox"]');
    expect(input).toBeTruthy();
  });

  it('should render label text when provided', () => {
    fixture.componentRef.setInput('label', 'Accept terms');
    fixture.detectChanges();

    const label = fixture.nativeElement.querySelector('.ff-checkbox__label');
    expect(label).toBeTruthy();
    expect(label.textContent.trim()).toBe('Accept terms');
  });

  it('should not render label span when empty', () => {
    const label = fixture.nativeElement.querySelector('.ff-checkbox__label');
    expect(label).toBeFalsy();
  });

  it('should apply checked class to host', () => {
    fixture.componentRef.setInput('checked', true);
    fixture.detectChanges();

    const hostEl = fixture.nativeElement as HTMLElement;
    expect(hostEl.classList.contains('ff-checkbox--checked')).toBe(true);
  });

  it('should apply indeterminate class to host', () => {
    fixture.componentRef.setInput('indeterminate', true);
    fixture.detectChanges();

    const hostEl = fixture.nativeElement as HTMLElement;
    expect(hostEl.classList.contains('ff-checkbox--indeterminate')).toBe(true);
  });

  it('should apply disabled class to host', () => {
    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();

    const hostEl = fixture.nativeElement as HTMLElement;
    expect(hostEl.classList.contains('ff-checkbox--disabled')).toBe(true);
  });

  it('should set aria-checked to "mixed" when indeterminate', () => {
    fixture.componentRef.setInput('indeterminate', true);
    fixture.detectChanges();

    const input = fixture.nativeElement.querySelector('input');
    expect(input.getAttribute('aria-checked')).toBe('mixed');
  });

  it('should set aria-checked to true when checked', () => {
    fixture.componentRef.setInput('checked', true);
    fixture.detectChanges();

    const input = fixture.nativeElement.querySelector('input');
    expect(input.getAttribute('aria-checked')).toBe('true');
  });

  it('should emit changed with new value on change', () => {
    const spy = vi.fn();
    component.changed.subscribe(spy);

    const input = fixture.nativeElement.querySelector('input');
    input.checked = true;
    input.dispatchEvent(new Event('change'));

    expect(spy).toHaveBeenCalledWith(true);
  });

  it('should not emit changed when disabled', () => {
    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();

    const spy = vi.fn();
    component.changed.subscribe(spy);

    // Call onChange directly since disabled native input won't fire change
    component.onChange({ target: { checked: true } } as unknown as Event);

    expect(spy).not.toHaveBeenCalled();
  });

  it('should disable native input when disabled', () => {
    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();

    const input = fixture.nativeElement.querySelector('input');
    expect(input.disabled).toBe(true);
  });

  it('should associate label with input via for/id', () => {
    fixture.componentRef.setInput('label', 'Test');
    fixture.detectChanges();

    const label = fixture.nativeElement.querySelector('label');
    const input = fixture.nativeElement.querySelector('input');
    expect(label.getAttribute('for')).toBe(input.id);
  });
});

@Component({
  standalone: true,
  imports: [ReactiveFormsModule, FfCheckboxComponent],
  template: `<ff-checkbox [formControl]="control" />`,
})
class CheckboxCvaHostComponent {
  readonly control = new FormControl(true, { nonNullable: true });
}

describe('ControlValueAccessor', () => {
  let hostFixture: ComponentFixture<CheckboxCvaHostComponent>;
  let control: FormControl<boolean>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CheckboxCvaHostComponent],
    }).compileComponents();

    hostFixture = TestBed.createComponent(CheckboxCvaHostComponent);
    control = hostFixture.componentInstance.control;
    hostFixture.detectChanges();
  });

  it('should render the initial FormControl value', () => {
    const input = hostFixture.nativeElement.querySelector('input');
    expect(input.checked).toBe(true);
  });

  it('should reflect a later control.setValue()', () => {
    control.setValue(false);
    hostFixture.detectChanges();

    const input = hostFixture.nativeElement.querySelector('input');
    expect(input.checked).toBe(false);
  });

  it('should update control value and mark it dirty on user toggle', () => {
    const input = hostFixture.nativeElement.querySelector('input');
    input.click();

    expect(control.value).toBe(false);
    expect(control.dirty).toBe(true);
  });

  it('should mark control as touched on toggle', () => {
    expect(control.touched).toBe(false);

    const input = hostFixture.nativeElement.querySelector('input');
    input.click();

    expect(control.touched).toBe(true);
  });

  it('should disable the component when control.disable() is called', () => {
    control.disable();
    hostFixture.detectChanges();

    const input = hostFixture.nativeElement.querySelector('input');
    const host = hostFixture.nativeElement.querySelector('ff-checkbox') as HTMLElement;
    expect(input.disabled).toBe(true);
    expect(host.classList.contains('ff-checkbox--disabled')).toBe(true);
  });
});
