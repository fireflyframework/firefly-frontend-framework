import 'zone.js';
import 'zone.js/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  BrowserTestingModule,
  platformBrowserTesting,
} from '@angular/platform-browser/testing';
import { FfRadioGroupComponent, FfRadioOption } from './ff-radio.component';

TestBed.initTestEnvironment(BrowserTestingModule, platformBrowserTesting(), {
  teardown: { destroyAfterEach: true },
});

const MOCK_OPTIONS: FfRadioOption[] = [
  { label: 'Option A', value: 'a' },
  { label: 'Option B', value: 'b' },
  { label: 'Option C', value: 'c' },
];

describe('FfRadioGroupComponent', () => {
  let component: FfRadioGroupComponent;
  let fixture: ComponentFixture<FfRadioGroupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FfRadioGroupComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(FfRadioGroupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have empty options by default', () => {
    expect(component.options()).toEqual([]);
  });

  it('should have empty value by default', () => {
    expect(component.value()).toBe('');
  });

  it('should default to horizontal orientation', () => {
    expect(component.orientation()).toBe('horizontal');
  });

  it('should not be disabled by default', () => {
    expect(component.disabled()).toBe(false);
  });

  it('should have role radiogroup', () => {
    const host = fixture.nativeElement as HTMLElement;
    expect(host.getAttribute('role')).toBe('radiogroup');
  });

  it('should render radio inputs for each option', () => {
    fixture.componentRef.setInput('options', MOCK_OPTIONS);
    fixture.detectChanges();

    const inputs = fixture.nativeElement.querySelectorAll('input[type="radio"]');
    expect(inputs.length).toBe(3);
  });

  it('should render labels for each option', () => {
    fixture.componentRef.setInput('options', MOCK_OPTIONS);
    fixture.detectChanges();

    const labels = fixture.nativeElement.querySelectorAll('.ff-radio__label');
    expect(labels.length).toBe(3);
    expect(labels[0].textContent.trim()).toBe('Option A');
    expect(labels[1].textContent.trim()).toBe('Option B');
    expect(labels[2].textContent.trim()).toBe('Option C');
  });

  it('should check the input matching current value', () => {
    fixture.componentRef.setInput('options', MOCK_OPTIONS);
    fixture.componentRef.setInput('value', 'b');
    fixture.detectChanges();

    const inputs = fixture.nativeElement.querySelectorAll('input[type="radio"]');
    expect(inputs[0].checked).toBe(false);
    expect(inputs[1].checked).toBe(true);
    expect(inputs[2].checked).toBe(false);
  });

  it('should apply selected class to matching item', () => {
    fixture.componentRef.setInput('options', MOCK_OPTIONS);
    fixture.componentRef.setInput('value', 'a');
    fixture.detectChanges();

    const items = fixture.nativeElement.querySelectorAll('.ff-radio__item');
    expect(items[0].classList.contains('ff-radio__item--selected')).toBe(true);
    expect(items[1].classList.contains('ff-radio__item--selected')).toBe(false);
  });

  it('should apply horizontal class by default', () => {
    const host = fixture.nativeElement as HTMLElement;
    expect(host.classList.contains('ff-radio--horizontal')).toBe(true);
  });

  it('should apply vertical class when orientation is vertical', () => {
    fixture.componentRef.setInput('orientation', 'vertical');
    fixture.detectChanges();

    const host = fixture.nativeElement as HTMLElement;
    expect(host.classList.contains('ff-radio--vertical')).toBe(true);
  });

  it('should apply disabled class to host when disabled', () => {
    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();

    const host = fixture.nativeElement as HTMLElement;
    expect(host.classList.contains('ff-radio--disabled')).toBe(true);
  });

  it('should disable all native inputs when group is disabled', () => {
    fixture.componentRef.setInput('options', MOCK_OPTIONS);
    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();

    const inputs = fixture.nativeElement.querySelectorAll('input[type="radio"]');
    inputs.forEach((input: HTMLInputElement) => {
      expect(input.disabled).toBe(true);
    });
  });

  it('should disable individual option when option.disabled is true', () => {
    const opts: FfRadioOption[] = [
      { label: 'A', value: 'a' },
      { label: 'B', value: 'b', disabled: true },
    ];
    fixture.componentRef.setInput('options', opts);
    fixture.detectChanges();

    const inputs = fixture.nativeElement.querySelectorAll('input[type="radio"]');
    expect(inputs[0].disabled).toBe(false);
    expect(inputs[1].disabled).toBe(true);
  });

  it('should emit valueChange on selection', () => {
    fixture.componentRef.setInput('options', MOCK_OPTIONS);
    fixture.detectChanges();

    const spy = vi.fn();
    component.valueChange.subscribe(spy);

    const inputs = fixture.nativeElement.querySelectorAll('input[type="radio"]');
    inputs[2].dispatchEvent(new Event('change'));

    expect(spy).toHaveBeenCalledWith('c');
  });

  it('should not emit valueChange when group is disabled', () => {
    fixture.componentRef.setInput('options', MOCK_OPTIONS);
    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();

    const spy = vi.fn();
    component.valueChange.subscribe(spy);

    component.onSelect(MOCK_OPTIONS[1]);

    expect(spy).not.toHaveBeenCalled();
  });

  it('should not emit valueChange when individual option is disabled', () => {
    const opts: FfRadioOption[] = [
      { label: 'A', value: 'a', disabled: true },
    ];
    fixture.componentRef.setInput('options', opts);
    fixture.detectChanges();

    const spy = vi.fn();
    component.valueChange.subscribe(spy);

    component.onSelect(opts[0]);

    expect(spy).not.toHaveBeenCalled();
  });

  it('should share the same name attribute across all inputs', () => {
    fixture.componentRef.setInput('options', MOCK_OPTIONS);
    fixture.componentRef.setInput('name', 'plan-type');
    fixture.detectChanges();

    const inputs = fixture.nativeElement.querySelectorAll('input[type="radio"]');
    inputs.forEach((input: HTMLInputElement) => {
      expect(input.name).toBe('plan-type');
    });
  });

  it('should use fallback name when none provided', () => {
    fixture.componentRef.setInput('options', MOCK_OPTIONS);
    fixture.detectChanges();

    const inputs = fixture.nativeElement.querySelectorAll('input[type="radio"]');
    const name = inputs[0].name;
    expect(name).toMatch(/^ff-radio-\d+$/);
    inputs.forEach((input: HTMLInputElement) => {
      expect(input.name).toBe(name);
    });
  });
});
