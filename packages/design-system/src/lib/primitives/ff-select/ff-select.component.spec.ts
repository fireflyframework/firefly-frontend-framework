import 'zone.js';
import 'zone.js/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  BrowserTestingModule,
  platformBrowserTesting,
} from '@angular/platform-browser/testing';
import { FfSelectComponent, FfSelectOption } from './ff-select.component';

TestBed.initTestEnvironment(BrowserTestingModule, platformBrowserTesting(), {
  teardown: { destroyAfterEach: true },
});

const MOCK_OPTIONS: FfSelectOption[] = [
  { label: 'Apple', value: 'apple' },
  { label: 'Banana', value: 'banana' },
  { label: 'Cherry', value: 'cherry' },
];

describe('FfSelectComponent', () => {
  let component: FfSelectComponent;
  let fixture: ComponentFixture<FfSelectComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FfSelectComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(FfSelectComponent);
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

  it('should not be disabled by default', () => {
    expect(component.disabled()).toBe(false);
  });

  it('should not be searchable by default', () => {
    expect(component.searchable()).toBe(false);
  });

  it('should be closed by default', () => {
    const host = fixture.nativeElement as HTMLElement;
    expect(host.classList.contains('ff-select--open')).toBe(false);
  });

  it('should render trigger button', () => {
    const trigger = fixture.nativeElement.querySelector('.ff-select__trigger');
    expect(trigger).toBeTruthy();
  });

  it('should show placeholder when no value', () => {
    fixture.componentRef.setInput('placeholder', 'Pick one');
    fixture.detectChanges();

    const value = fixture.nativeElement.querySelector('.ff-select__value');
    expect(value.textContent.trim()).toBe('Pick one');
    expect(value.classList.contains('ff-select__value--placeholder')).toBe(true);
  });

  it('should show selected label when value is set', () => {
    fixture.componentRef.setInput('options', MOCK_OPTIONS);
    fixture.componentRef.setInput('value', 'banana');
    fixture.detectChanges();

    const value = fixture.nativeElement.querySelector('.ff-select__value');
    expect(value.textContent.trim()).toBe('Banana');
    expect(value.classList.contains('ff-select__value--placeholder')).toBe(false);
  });

  it('should have aria-haspopup on trigger', () => {
    const trigger = fixture.nativeElement.querySelector('.ff-select__trigger');
    expect(trigger.getAttribute('aria-haspopup')).toBe('listbox');
  });

  it('should set aria-expanded to false when closed', () => {
    const trigger = fixture.nativeElement.querySelector('.ff-select__trigger');
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
  });

  it('should open dropdown on trigger click', () => {
    fixture.componentRef.setInput('options', MOCK_OPTIONS);
    fixture.detectChanges();

    const trigger = fixture.nativeElement.querySelector('.ff-select__trigger');
    trigger.click();
    fixture.detectChanges();

    const host = fixture.nativeElement as HTMLElement;
    expect(host.classList.contains('ff-select--open')).toBe(true);

    const dropdown = fixture.nativeElement.querySelector('.ff-select__dropdown');
    expect(dropdown).toBeTruthy();
  });

  it('should set aria-expanded to true when open', () => {
    fixture.componentRef.setInput('options', MOCK_OPTIONS);
    fixture.detectChanges();

    const trigger = fixture.nativeElement.querySelector('.ff-select__trigger');
    trigger.click();
    fixture.detectChanges();

    expect(trigger.getAttribute('aria-expanded')).toBe('true');
  });

  it('should render options in dropdown', () => {
    fixture.componentRef.setInput('options', MOCK_OPTIONS);
    fixture.detectChanges();

    const trigger = fixture.nativeElement.querySelector('.ff-select__trigger');
    trigger.click();
    fixture.detectChanges();

    const options = fixture.nativeElement.querySelectorAll('.ff-select__option');
    expect(options.length).toBe(3);
    expect(options[0].textContent.trim()).toBe('Apple');
    expect(options[1].textContent.trim()).toBe('Banana');
    expect(options[2].textContent.trim()).toBe('Cherry');
  });

  it('should mark selected option with selected class', () => {
    fixture.componentRef.setInput('options', MOCK_OPTIONS);
    fixture.componentRef.setInput('value', 'cherry');
    fixture.detectChanges();

    const trigger = fixture.nativeElement.querySelector('.ff-select__trigger');
    trigger.click();
    fixture.detectChanges();

    const options = fixture.nativeElement.querySelectorAll('.ff-select__option');
    expect(options[2].classList.contains('ff-select__option--selected')).toBe(true);
    expect(options[2].getAttribute('aria-selected')).toBe('true');
  });

  it('should emit valueChange and close on option click', () => {
    fixture.componentRef.setInput('options', MOCK_OPTIONS);
    fixture.detectChanges();

    const spy = vi.fn();
    component.valueChange.subscribe(spy);

    const trigger = fixture.nativeElement.querySelector('.ff-select__trigger');
    trigger.click();
    fixture.detectChanges();

    const options = fixture.nativeElement.querySelectorAll('.ff-select__option');
    options[1].click();
    fixture.detectChanges();

    expect(spy).toHaveBeenCalledWith('banana');

    const host = fixture.nativeElement as HTMLElement;
    expect(host.classList.contains('ff-select--open')).toBe(false);
  });

  it('should not emit for disabled option', () => {
    const opts: FfSelectOption[] = [
      { label: 'A', value: 'a', disabled: true },
    ];
    fixture.componentRef.setInput('options', opts);
    fixture.detectChanges();

    const spy = vi.fn();
    component.valueChange.subscribe(spy);

    const trigger = fixture.nativeElement.querySelector('.ff-select__trigger');
    trigger.click();
    fixture.detectChanges();

    const options = fixture.nativeElement.querySelectorAll('.ff-select__option');
    options[0].click();
    fixture.detectChanges();

    expect(spy).not.toHaveBeenCalled();
  });

  it('should apply disabled class to disabled option', () => {
    const opts: FfSelectOption[] = [
      { label: 'A', value: 'a', disabled: true },
    ];
    fixture.componentRef.setInput('options', opts);
    fixture.detectChanges();

    const trigger = fixture.nativeElement.querySelector('.ff-select__trigger');
    trigger.click();
    fixture.detectChanges();

    const opt = fixture.nativeElement.querySelector('.ff-select__option');
    expect(opt.classList.contains('ff-select__option--disabled')).toBe(true);
    expect(opt.getAttribute('aria-disabled')).toBe('true');
  });

  it('should not open when disabled', () => {
    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();

    component.toggle();
    fixture.detectChanges();

    const host = fixture.nativeElement as HTMLElement;
    expect(host.classList.contains('ff-select--open')).toBe(false);
  });

  it('should apply disabled class to host', () => {
    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();

    const host = fixture.nativeElement as HTMLElement;
    expect(host.classList.contains('ff-select--disabled')).toBe(true);
  });

  it('should disable trigger button when disabled', () => {
    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();

    const trigger = fixture.nativeElement.querySelector('.ff-select__trigger');
    expect(trigger.disabled).toBe(true);
  });

  it('should show search input when searchable', () => {
    fixture.componentRef.setInput('options', MOCK_OPTIONS);
    fixture.componentRef.setInput('searchable', true);
    fixture.detectChanges();

    const trigger = fixture.nativeElement.querySelector('.ff-select__trigger');
    trigger.click();
    fixture.detectChanges();

    const search = fixture.nativeElement.querySelector('.ff-select__search');
    expect(search).toBeTruthy();
  });

  it('should not show search input when not searchable', () => {
    fixture.componentRef.setInput('options', MOCK_OPTIONS);
    fixture.detectChanges();

    const trigger = fixture.nativeElement.querySelector('.ff-select__trigger');
    trigger.click();
    fixture.detectChanges();

    const search = fixture.nativeElement.querySelector('.ff-select__search');
    expect(search).toBeFalsy();
  });

  it('should filter options based on search term', () => {
    fixture.componentRef.setInput('options', MOCK_OPTIONS);
    fixture.componentRef.setInput('searchable', true);
    fixture.detectChanges();

    const trigger = fixture.nativeElement.querySelector('.ff-select__trigger');
    trigger.click();
    fixture.detectChanges();

    // Simulate search input
    component['search'].set('ban');
    fixture.detectChanges();

    const options = fixture.nativeElement.querySelectorAll('.ff-select__option');
    expect(options.length).toBe(1);
    expect(options[0].textContent.trim()).toBe('Banana');
  });

  it('should show empty message when no results match', () => {
    fixture.componentRef.setInput('options', MOCK_OPTIONS);
    fixture.componentRef.setInput('searchable', true);
    fixture.detectChanges();

    const trigger = fixture.nativeElement.querySelector('.ff-select__trigger');
    trigger.click();
    fixture.detectChanges();

    component['search'].set('xyz');
    fixture.detectChanges();

    const empty = fixture.nativeElement.querySelector('.ff-select__empty');
    expect(empty).toBeTruthy();
    expect(empty.textContent.trim()).toBe('No results');
  });

  it('should close dropdown on Escape key', () => {
    fixture.componentRef.setInput('options', MOCK_OPTIONS);
    fixture.detectChanges();

    const trigger = fixture.nativeElement.querySelector('.ff-select__trigger');
    trigger.click();
    fixture.detectChanges();

    expect((fixture.nativeElement as HTMLElement).classList.contains('ff-select--open')).toBe(true);

    component['onKeydown'](new KeyboardEvent('keydown', { key: 'Escape' }));
    fixture.detectChanges();

    expect((fixture.nativeElement as HTMLElement).classList.contains('ff-select--open')).toBe(false);
  });

  it('should navigate with ArrowDown key', () => {
    fixture.componentRef.setInput('options', MOCK_OPTIONS);
    fixture.detectChanges();

    const trigger = fixture.nativeElement.querySelector('.ff-select__trigger');
    trigger.click();
    fixture.detectChanges();

    component['onKeydown'](new KeyboardEvent('keydown', { key: 'ArrowDown' }));
    fixture.detectChanges();

    expect(component['activeIndex']()).toBe(0);

    component['onKeydown'](new KeyboardEvent('keydown', { key: 'ArrowDown' }));
    fixture.detectChanges();

    expect(component['activeIndex']()).toBe(1);
  });

  it('should navigate with ArrowUp key', () => {
    fixture.componentRef.setInput('options', MOCK_OPTIONS);
    fixture.detectChanges();

    const trigger = fixture.nativeElement.querySelector('.ff-select__trigger');
    trigger.click();
    fixture.detectChanges();

    component['activeIndex'].set(2);

    component['onKeydown'](new KeyboardEvent('keydown', { key: 'ArrowUp' }));
    fixture.detectChanges();

    expect(component['activeIndex']()).toBe(1);
  });

  it('should select active option on Enter key', () => {
    fixture.componentRef.setInput('options', MOCK_OPTIONS);
    fixture.detectChanges();

    const spy = vi.fn();
    component.valueChange.subscribe(spy);

    const trigger = fixture.nativeElement.querySelector('.ff-select__trigger');
    trigger.click();
    fixture.detectChanges();

    component['activeIndex'].set(2);
    component['onKeydown'](new KeyboardEvent('keydown', { key: 'Enter' }));
    fixture.detectChanges();

    expect(spy).toHaveBeenCalledWith('cherry');
  });

  it('should toggle dropdown on trigger click', () => {
    fixture.componentRef.setInput('options', MOCK_OPTIONS);
    fixture.detectChanges();

    const trigger = fixture.nativeElement.querySelector('.ff-select__trigger');

    trigger.click();
    fixture.detectChanges();
    expect((fixture.nativeElement as HTMLElement).classList.contains('ff-select--open')).toBe(true);

    trigger.click();
    fixture.detectChanges();
    expect((fixture.nativeElement as HTMLElement).classList.contains('ff-select--open')).toBe(false);
  });

  it('should have dropdown with role listbox', () => {
    fixture.componentRef.setInput('options', MOCK_OPTIONS);
    fixture.detectChanges();

    const trigger = fixture.nativeElement.querySelector('.ff-select__trigger');
    trigger.click();
    fixture.detectChanges();

    const dropdown = fixture.nativeElement.querySelector('.ff-select__dropdown');
    expect(dropdown.getAttribute('role')).toBe('listbox');
  });

  it('should have options with role option', () => {
    fixture.componentRef.setInput('options', MOCK_OPTIONS);
    fixture.detectChanges();

    const trigger = fixture.nativeElement.querySelector('.ff-select__trigger');
    trigger.click();
    fixture.detectChanges();

    const options = fixture.nativeElement.querySelectorAll('.ff-select__option');
    options.forEach((opt: HTMLElement) => {
      expect(opt.getAttribute('role')).toBe('option');
    });
  });
});
