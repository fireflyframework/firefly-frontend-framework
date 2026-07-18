import 'zone.js';
import 'zone.js/testing';
import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import {
  BrowserTestingModule,
  platformBrowserTesting,
} from '@angular/platform-browser/testing';
import { FfInputComponent } from './ff-input.component';

TestBed.initTestEnvironment(BrowserTestingModule, platformBrowserTesting(), {
  teardown: { destroyAfterEach: true },
});

describe('FfInputComponent', () => {
  let component: FfInputComponent;
  let fixture: ComponentFixture<FfInputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FfInputComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(FfInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have default type "text"', () => {
    expect(component.type()).toBe('text');
  });

  it('should not be disabled by default', () => {
    expect(component.disabled()).toBe(false);
  });

  it('should have empty error by default', () => {
    expect(component.error()).toBe('');
  });

  it('should render native input element', () => {
    const input = fixture.nativeElement.querySelector('input');
    expect(input).toBeTruthy();
  });

  it('should render label when provided', () => {
    fixture.componentRef.setInput('label', 'Email');
    fixture.detectChanges();

    const label = fixture.nativeElement.querySelector('.ff-input__label');
    expect(label).toBeTruthy();
    expect(label.textContent.trim()).toBe('Email');
  });

  it('should not render label when empty', () => {
    const label = fixture.nativeElement.querySelector('.ff-input__label');
    expect(label).toBeFalsy();
  });

  it('should associate label with input via for/id', () => {
    fixture.componentRef.setInput('label', 'Name');
    fixture.detectChanges();

    const label = fixture.nativeElement.querySelector('label');
    const input = fixture.nativeElement.querySelector('input');
    expect(label.getAttribute('for')).toBe(input.id);
  });

  it('should set placeholder on native input', () => {
    fixture.componentRef.setInput('placeholder', 'Enter email');
    fixture.detectChanges();

    const input = fixture.nativeElement.querySelector('input');
    expect(input.placeholder).toBe('Enter email');
  });

  it('should set type on native input', () => {
    fixture.componentRef.setInput('type', 'password');
    fixture.detectChanges();

    const input = fixture.nativeElement.querySelector('input');
    expect(input.type).toBe('password');
  });

  it('should render error message when error is set', () => {
    fixture.componentRef.setInput('error', 'Required field');
    fixture.detectChanges();

    const error = fixture.nativeElement.querySelector('.ff-input__error');
    expect(error).toBeTruthy();
    expect(error.textContent.trim()).toBe('Required field');
  });

  it('should render hint when provided and no error', () => {
    fixture.componentRef.setInput('hint', 'Enter your email');
    fixture.detectChanges();

    const hint = fixture.nativeElement.querySelector('.ff-input__hint');
    expect(hint).toBeTruthy();
    expect(hint.textContent.trim()).toBe('Enter your email');
  });

  it('should hide hint when error is present', () => {
    fixture.componentRef.setInput('hint', 'Some hint');
    fixture.componentRef.setInput('error', 'Some error');
    fixture.detectChanges();

    const hint = fixture.nativeElement.querySelector('.ff-input__hint');
    expect(hint).toBeFalsy();
  });

  it('should apply error class to host when error is set', () => {
    fixture.componentRef.setInput('error', 'Invalid');
    fixture.detectChanges();

    const hostEl = fixture.nativeElement as HTMLElement;
    expect(hostEl.classList.contains('ff-input--error')).toBe(true);
  });

  it('should set aria-invalid when error is set', () => {
    fixture.componentRef.setInput('error', 'Bad value');
    fixture.detectChanges();

    const input = fixture.nativeElement.querySelector('input');
    expect(input.getAttribute('aria-invalid')).toBe('true');
  });

  it('should apply disabled class to host when disabled', () => {
    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();

    const hostEl = fixture.nativeElement as HTMLElement;
    expect(hostEl.classList.contains('ff-input--disabled')).toBe(true);
  });

  it('should disable native input when disabled', () => {
    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();

    const input = fixture.nativeElement.querySelector('input');
    expect(input.disabled).toBe(true);
  });

  it('should emit valueChange on input event', () => {
    const spy = vi.fn();
    component.valueChange.subscribe(spy);

    const input = fixture.nativeElement.querySelector('input');
    input.value = 'hello';
    input.dispatchEvent(new Event('input'));

    expect(spy).toHaveBeenCalledWith('hello');
  });

  it('should set error role="alert"', () => {
    fixture.componentRef.setInput('error', 'Error msg');
    fixture.detectChanges();

    const error = fixture.nativeElement.querySelector('.ff-input__error');
    expect(error.getAttribute('role')).toBe('alert');
  });

  // --- Textarea support ---

  it('should render textarea when type is "textarea"', () => {
    fixture.componentRef.setInput('type', 'textarea');
    fixture.detectChanges();

    const textarea = fixture.nativeElement.querySelector('textarea');
    const input = fixture.nativeElement.querySelector('input');
    expect(textarea).toBeTruthy();
    expect(input).toBeNull();
  });

  it('should render input (not textarea) for non-textarea types', () => {
    const input = fixture.nativeElement.querySelector('input');
    const textarea = fixture.nativeElement.querySelector('textarea');
    expect(input).toBeTruthy();
    expect(textarea).toBeNull();
  });

  it('should have default rows of 3', () => {
    expect(component.rows()).toBe(3);
  });

  it('should apply rows attribute on textarea', () => {
    fixture.componentRef.setInput('type', 'textarea');
    fixture.componentRef.setInput('rows', 5);
    fixture.detectChanges();

    const textarea = fixture.nativeElement.querySelector('textarea');
    expect(textarea.rows).toBe(5);
  });

  it('should apply ff-input__native class on textarea', () => {
    fixture.componentRef.setInput('type', 'textarea');
    fixture.detectChanges();

    const textarea = fixture.nativeElement.querySelector('textarea');
    expect(textarea.classList.contains('ff-input__native')).toBe(true);
  });

  it('should emit valueChange from textarea', () => {
    fixture.componentRef.setInput('type', 'textarea');
    fixture.detectChanges();

    const spy = vi.fn();
    component.valueChange.subscribe(spy);

    const textarea = fixture.nativeElement.querySelector('textarea');
    textarea.value = 'multiline text';
    textarea.dispatchEvent(new Event('input'));

    expect(spy).toHaveBeenCalledWith('multiline text');
  });

  it('should render label for textarea', () => {
    fixture.componentRef.setInput('type', 'textarea');
    fixture.componentRef.setInput('label', 'Notes');
    fixture.detectChanges();

    const label = fixture.nativeElement.querySelector('.ff-input__label');
    const textarea = fixture.nativeElement.querySelector('textarea');
    expect(label).toBeTruthy();
    expect(label.getAttribute('for')).toBe(textarea.id);
  });

  it('should set aria-invalid on textarea when error is set', () => {
    fixture.componentRef.setInput('type', 'textarea');
    fixture.componentRef.setInput('error', 'Required');
    fixture.detectChanges();

    const textarea = fixture.nativeElement.querySelector('textarea');
    expect(textarea.getAttribute('aria-invalid')).toBe('true');
  });

  it('should set placeholder on textarea', () => {
    fixture.componentRef.setInput('type', 'textarea');
    fixture.componentRef.setInput('placeholder', 'Enter notes...');
    fixture.detectChanges();

    const textarea = fixture.nativeElement.querySelector('textarea');
    expect(textarea.placeholder).toBe('Enter notes...');
  });

  it('should disable textarea when disabled', () => {
    fixture.componentRef.setInput('type', 'textarea');
    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();

    const textarea = fixture.nativeElement.querySelector('textarea');
    expect(textarea.disabled).toBe(true);
  });
});

@Component({
  standalone: true,
  imports: [ReactiveFormsModule, FfInputComponent],
  template: `<ff-input [formControl]="control" />`,
})
class InputCvaHostComponent {
  readonly control = new FormControl('initial', { nonNullable: true });
}

describe('ControlValueAccessor', () => {
  let hostFixture: ComponentFixture<InputCvaHostComponent>;
  let control: FormControl<string>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InputCvaHostComponent],
    }).compileComponents();

    hostFixture = TestBed.createComponent(InputCvaHostComponent);
    control = hostFixture.componentInstance.control;
    hostFixture.detectChanges();
  });

  it('should render the initial FormControl value', () => {
    const input = hostFixture.nativeElement.querySelector('input');
    expect(input.value).toBe('initial');
  });

  it('should reflect a later control.setValue()', () => {
    control.setValue('updated');
    hostFixture.detectChanges();

    const input = hostFixture.nativeElement.querySelector('input');
    expect(input.value).toBe('updated');
  });

  it('should update control value and mark it dirty on user input', () => {
    const input = hostFixture.nativeElement.querySelector('input');
    input.value = 'typed';
    input.dispatchEvent(new Event('input'));

    expect(control.value).toBe('typed');
    expect(control.dirty).toBe(true);
  });

  it('should mark control as touched on blur', () => {
    expect(control.touched).toBe(false);

    const input = hostFixture.nativeElement.querySelector('input');
    input.dispatchEvent(new Event('blur'));

    expect(control.touched).toBe(true);
  });

  it('should disable the component when control.disable() is called', () => {
    control.disable();
    hostFixture.detectChanges();

    const input = hostFixture.nativeElement.querySelector('input');
    const host = hostFixture.nativeElement.querySelector('ff-input') as HTMLElement;
    expect(input.disabled).toBe(true);
    expect(host.classList.contains('ff-input--disabled')).toBe(true);
  });
});
