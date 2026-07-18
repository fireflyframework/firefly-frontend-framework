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

  // --- Label types ---

  it('should have default labelType "default"', () => {
    expect(component.labelType()).toBe('default');
  });

  it('should not render label when labelType is "hidden"', () => {
    fixture.componentRef.setInput('label', 'Search');
    fixture.componentRef.setInput('labelType', 'hidden');
    fixture.detectChanges();

    const label = fixture.nativeElement.querySelector('.ff-input__label');
    expect(label).toBeFalsy();
  });

  it('should expose label as aria-label when labelType is "hidden"', () => {
    fixture.componentRef.setInput('label', 'Search');
    fixture.componentRef.setInput('labelType', 'hidden');
    fixture.detectChanges();

    const input = fixture.nativeElement.querySelector('input');
    expect(input.getAttribute('aria-label')).toBe('Search');
  });

  it('should not set aria-label when labelType is "default"', () => {
    fixture.componentRef.setInput('label', 'Name');
    fixture.detectChanges();

    const input = fixture.nativeElement.querySelector('input');
    expect(input.getAttribute('aria-label')).toBeNull();
  });

  it('should apply floating modifier class when labelType is "floating"', () => {
    fixture.componentRef.setInput('label', 'Name');
    fixture.componentRef.setInput('labelType', 'floating');
    fixture.detectChanges();

    const hostEl = fixture.nativeElement as HTMLElement;
    expect(hostEl.classList.contains('ff-input--label-floating')).toBe(true);
    expect(fixture.nativeElement.querySelector('.ff-input__label')).toBeTruthy();
  });

  // --- Search ---

  it('should emit search with the current value on Enter', () => {
    const spy = vi.fn();
    component.search.subscribe(spy);

    const input = fixture.nativeElement.querySelector('input');
    input.value = 'query';
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));

    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith('query');
  });
});

describe('FfInputComponent debounce', () => {
  let component: FfInputComponent;
  let fixture: ComponentFixture<FfInputComponent>;

  beforeEach(async () => {
    vi.useFakeTimers();

    await TestBed.configureTestingModule({
      imports: [FfInputComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(FfInputComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('debounceTime', 300);
    fixture.detectChanges();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  function typeValue(value: string): HTMLInputElement {
    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
    input.value = value;
    input.dispatchEvent(new Event('input'));
    return input;
  }

  it('should not emit valueChange before the debounce time elapses', () => {
    const spy = vi.fn();
    component.valueChange.subscribe(spy);

    typeValue('hel');
    vi.advanceTimersByTime(299);

    expect(spy).not.toHaveBeenCalled();
  });

  it('should emit valueChange once with the last value after the quiet period', () => {
    const spy = vi.fn();
    component.valueChange.subscribe(spy);

    typeValue('h');
    vi.advanceTimersByTime(100);
    typeValue('he');
    vi.advanceTimersByTime(100);
    typeValue('hello');
    vi.advanceTimersByTime(300);

    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith('hello');
  });

  it('should flush the pending value immediately on blur', () => {
    const spy = vi.fn();
    component.valueChange.subscribe(spy);

    const input = typeValue('pending');
    expect(spy).not.toHaveBeenCalled();

    input.dispatchEvent(new Event('blur'));

    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith('pending');

    vi.advanceTimersByTime(300);
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('should emit search when the debounce settles and type is "search"', () => {
    fixture.componentRef.setInput('type', 'search');
    fixture.detectChanges();

    const spy = vi.fn();
    component.search.subscribe(spy);

    typeValue('firefly');
    expect(spy).not.toHaveBeenCalled();

    vi.advanceTimersByTime(300);

    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith('firefly');
  });

  it('should not emit search on debounce settle for non-search types', () => {
    const spy = vi.fn();
    component.search.subscribe(spy);

    typeValue('firefly');
    vi.advanceTimersByTime(300);

    expect(spy).not.toHaveBeenCalled();
  });

  it('should flush pending value before emitting search on Enter', () => {
    const valueSpy = vi.fn();
    const searchSpy = vi.fn();
    component.valueChange.subscribe(valueSpy);
    component.search.subscribe(searchSpy);

    const input = typeValue('quick');
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));

    expect(valueSpy).toHaveBeenCalledWith('quick');
    expect(searchSpy).toHaveBeenCalledWith('quick');

    vi.advanceTimersByTime(300);
    expect(valueSpy).toHaveBeenCalledTimes(1);
    expect(searchSpy).toHaveBeenCalledTimes(1);
  });

  it('should emit valueChange synchronously when debounceTime is 0', () => {
    fixture.componentRef.setInput('debounceTime', 0);
    fixture.detectChanges();

    const spy = vi.fn();
    component.valueChange.subscribe(spy);

    typeValue('now');

    expect(spy).toHaveBeenCalledWith('now');
  });
});

@Component({
  standalone: true,
  imports: [FfInputComponent],
  template: `
    <ff-input label="With affixes">
      <span ff-input-prefix class="test-prefix">P</span>
      <span ff-input-suffix class="test-suffix">S</span>
    </ff-input>
  `,
})
class InputAffixHostComponent {}

describe('FfInputComponent affixes', () => {
  it('should project prefix and suffix content into the slots', async () => {
    await TestBed.configureTestingModule({
      imports: [InputAffixHostComponent],
    }).compileComponents();

    const hostFixture = TestBed.createComponent(InputAffixHostComponent);
    hostFixture.detectChanges();

    const prefix = hostFixture.nativeElement.querySelector('.ff-input__prefix .test-prefix');
    const suffix = hostFixture.nativeElement.querySelector('.ff-input__suffix .test-suffix');
    expect(prefix).toBeTruthy();
    expect(prefix.textContent).toBe('P');
    expect(suffix).toBeTruthy();
    expect(suffix.textContent).toBe('S');
  });

  it('should render the field wrapper with empty slots when nothing is projected', async () => {
    await TestBed.configureTestingModule({
      imports: [FfInputComponent],
    }).compileComponents();

    const fixture = TestBed.createComponent(FfInputComponent);
    fixture.detectChanges();

    const field = fixture.nativeElement.querySelector('.ff-input__field');
    const prefix = fixture.nativeElement.querySelector('.ff-input__prefix');
    const suffix = fixture.nativeElement.querySelector('.ff-input__suffix');
    expect(field).toBeTruthy();
    expect(prefix).toBeTruthy();
    expect(prefix.childElementCount).toBe(0);
    expect(suffix).toBeTruthy();
    expect(suffix.childElementCount).toBe(0);
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

@Component({
  standalone: true,
  imports: [ReactiveFormsModule, FfInputComponent],
  template: `<ff-input [formControl]="control" [debounceTime]="300" />`,
})
class InputCvaDebounceHostComponent {
  readonly control = new FormControl('initial', { nonNullable: true });
}

describe('ControlValueAccessor with debounce', () => {
  let hostFixture: ComponentFixture<InputCvaDebounceHostComponent>;
  let control: FormControl<string>;

  beforeEach(async () => {
    vi.useFakeTimers();

    await TestBed.configureTestingModule({
      imports: [InputCvaDebounceHostComponent],
    }).compileComponents();

    hostFixture = TestBed.createComponent(InputCvaDebounceHostComponent);
    control = hostFixture.componentInstance.control;
    hostFixture.detectChanges();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should debounce the forms callback', () => {
    const input = hostFixture.nativeElement.querySelector('input') as HTMLInputElement;
    input.value = 'typed';
    input.dispatchEvent(new Event('input'));

    expect(control.value).toBe('initial');

    vi.advanceTimersByTime(300);

    expect(control.value).toBe('typed');
  });

  it('should flush the forms callback on blur', () => {
    const input = hostFixture.nativeElement.querySelector('input') as HTMLInputElement;
    input.value = 'typed';
    input.dispatchEvent(new Event('input'));
    input.dispatchEvent(new Event('blur'));

    expect(control.value).toBe('typed');
  });
});
