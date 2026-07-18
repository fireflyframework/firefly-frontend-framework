import 'zone.js';
import 'zone.js/testing';
import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import {
  BrowserTestingModule,
  platformBrowserTesting,
} from '@angular/platform-browser/testing';
import { CdkTrapFocus } from '@angular/cdk/a11y';
import {
  FfSelectComponent,
  FfSelectLabelTemplateDirective,
  FfSelectOption,
  FfSelectOptionLike,
  FfSelectOptionTemplateDirective,
} from './ff-select.component';

TestBed.initTestEnvironment(BrowserTestingModule, platformBrowserTesting(), {
  teardown: { destroyAfterEach: true },
});

const MOCK_OPTIONS: FfSelectOption[] = [
  { label: 'Apple', value: 'apple' },
  { label: 'Banana', value: 'banana' },
  { label: 'Cherry', value: 'cherry' },
];

/** Reads the portaled listbox panel for `component` from the document (the panel lives in the CDK overlay container, not `fixture.nativeElement`). */
function panelOf(component: FfSelectComponent): HTMLElement | null {
  return document.getElementById((component as unknown as { panelId: string }).panelId);
}

/** Reads the option rows rendered inside `component`'s portaled panel. */
function optionsOf(component: FfSelectComponent): HTMLElement[] {
  return Array.from(panelOf(component)?.querySelectorAll<HTMLElement>('.ff-select__option') ?? []);
}

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

  it('should not be multiple by default', () => {
    expect(component.multiple()).toBe(false);
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

  it('should portal the dropdown panel to the CDK overlay container, not the component subtree', () => {
    fixture.componentRef.setInput('options', MOCK_OPTIONS);
    fixture.detectChanges();

    const trigger = fixture.nativeElement.querySelector('.ff-select__trigger');
    trigger.click();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.ff-select__dropdown')).toBeNull();
    const panel = panelOf(component);
    expect(panel).toBeTruthy();
    expect(document.querySelector('.cdk-overlay-container')?.contains(panel)).toBe(true);
  });

  it('should open dropdown on trigger click', () => {
    fixture.componentRef.setInput('options', MOCK_OPTIONS);
    fixture.detectChanges();

    const trigger = fixture.nativeElement.querySelector('.ff-select__trigger');
    trigger.click();
    fixture.detectChanges();

    const host = fixture.nativeElement as HTMLElement;
    expect(host.classList.contains('ff-select--open')).toBe(true);
    expect(panelOf(component)).toBeTruthy();
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

    const options = optionsOf(component);
    expect(options.length).toBe(3);
    expect(options[0].textContent?.trim()).toBe('Apple');
    expect(options[1].textContent?.trim()).toBe('Banana');
    expect(options[2].textContent?.trim()).toBe('Cherry');
  });

  it('should mark selected option with selected class', () => {
    fixture.componentRef.setInput('options', MOCK_OPTIONS);
    fixture.componentRef.setInput('value', 'cherry');
    fixture.detectChanges();

    const trigger = fixture.nativeElement.querySelector('.ff-select__trigger');
    trigger.click();
    fixture.detectChanges();

    const options = optionsOf(component);
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

    const options = optionsOf(component);
    options[1].click();
    fixture.detectChanges();

    expect(spy).toHaveBeenCalledWith('banana');

    const host = fixture.nativeElement as HTMLElement;
    expect(host.classList.contains('ff-select--open')).toBe(false);
  });

  it('should not emit for disabled option', () => {
    const opts: FfSelectOption[] = [{ label: 'A', value: 'a', disabled: true }];
    fixture.componentRef.setInput('options', opts);
    fixture.detectChanges();

    const spy = vi.fn();
    component.valueChange.subscribe(spy);

    const trigger = fixture.nativeElement.querySelector('.ff-select__trigger');
    trigger.click();
    fixture.detectChanges();

    optionsOf(component)[0].click();
    fixture.detectChanges();

    expect(spy).not.toHaveBeenCalled();
  });

  it('should apply disabled class to disabled option', () => {
    const opts: FfSelectOption[] = [{ label: 'A', value: 'a', disabled: true }];
    fixture.componentRef.setInput('options', opts);
    fixture.detectChanges();

    const trigger = fixture.nativeElement.querySelector('.ff-select__trigger');
    trigger.click();
    fixture.detectChanges();

    const opt = optionsOf(component)[0];
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

    component['search'].set('ban');
    fixture.detectChanges();

    const options = optionsOf(component);
    expect(options.length).toBe(1);
    expect(options[0].textContent?.trim()).toBe('Banana');
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

    const empty = panelOf(component)?.querySelector('.ff-select__empty');
    expect(empty).toBeTruthy();
    expect(empty?.textContent?.trim()).toBe('No results');
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

  it('should jump to the first option on Home and the last option on End', () => {
    fixture.componentRef.setInput('options', MOCK_OPTIONS);
    fixture.detectChanges();

    const trigger = fixture.nativeElement.querySelector('.ff-select__trigger');
    trigger.click();
    fixture.detectChanges();

    component['activeIndex'].set(1);
    component['onKeydown'](new KeyboardEvent('keydown', { key: 'End' }));
    expect(component['activeIndex']()).toBe(2);

    component['onKeydown'](new KeyboardEvent('keydown', { key: 'Home' }));
    expect(component['activeIndex']()).toBe(0);
  });

  it('should jump to a matching option via typeahead when not searchable', () => {
    fixture.componentRef.setInput('options', MOCK_OPTIONS);
    fixture.detectChanges();

    const trigger = fixture.nativeElement.querySelector('.ff-select__trigger');
    trigger.click();
    fixture.detectChanges();

    component['onKeydown'](new KeyboardEvent('keydown', { key: 'c' }));

    expect(component['activeIndex']()).toBe(2); // Cherry
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

    expect(panelOf(component)?.getAttribute('role')).toBe('listbox');
  });

  it('should have options with role option', () => {
    fixture.componentRef.setInput('options', MOCK_OPTIONS);
    fixture.detectChanges();

    const trigger = fixture.nativeElement.querySelector('.ff-select__trigger');
    trigger.click();
    fixture.detectChanges();

    optionsOf(component).forEach((opt) => {
      expect(opt.getAttribute('role')).toBe('option');
    });
  });

  it('should track the active option through aria-activedescendant on the trigger', () => {
    fixture.componentRef.setInput('options', MOCK_OPTIONS);
    fixture.detectChanges();

    const trigger = fixture.nativeElement.querySelector('.ff-select__trigger');
    trigger.click();
    fixture.detectChanges();

    component['onKeydown'](new KeyboardEvent('keydown', { key: 'ArrowDown' }));
    fixture.detectChanges();

    const activeOption = optionsOf(component)[0];
    expect(trigger.getAttribute('aria-activedescendant')).toBe(activeOption.id);
  });

  it('should close the dropdown when a pointer event happens outside the trigger and panel', () => {
    fixture.componentRef.setInput('options', MOCK_OPTIONS);
    fixture.detectChanges();

    const trigger = fixture.nativeElement.querySelector('.ff-select__trigger');
    trigger.click();
    fixture.detectChanges();
    expect(panelOf(component)).toBeTruthy();

    document.body.dispatchEvent(new Event('pointerdown', { bubbles: true }));
    document.body.dispatchEvent(new Event('click', { bubbles: true }));
    fixture.detectChanges();

    expect((fixture.nativeElement as HTMLElement).classList.contains('ff-select--open')).toBe(false);
  });
});

describe('ControlValueAccessor', () => {
  let hostFixture: ComponentFixture<SelectCvaHostComponent>;
  let control: FormControl<string>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SelectCvaHostComponent],
    }).compileComponents();

    hostFixture = TestBed.createComponent(SelectCvaHostComponent);
    control = hostFixture.componentInstance.control;
    hostFixture.detectChanges();
  });

  it('should render the initial FormControl value', () => {
    const value = hostFixture.nativeElement.querySelector('.ff-select__value');
    expect(value.textContent.trim()).toBe('Apple');
  });

  it('should reflect a later control.setValue()', () => {
    control.setValue('banana');
    hostFixture.detectChanges();

    const value = hostFixture.nativeElement.querySelector('.ff-select__value');
    expect(value.textContent.trim()).toBe('Banana');
  });

  it('should update control value and mark it dirty on option click', () => {
    const selectDebug = hostFixture.debugElement.query(
      (node) => node.componentInstance instanceof FfSelectComponent
    );
    const select = selectDebug.componentInstance as FfSelectComponent;

    const trigger = hostFixture.nativeElement.querySelector('.ff-select__trigger');
    trigger.click();
    hostFixture.detectChanges();

    optionsOf(select)[2].click();
    hostFixture.detectChanges();

    expect(control.value).toBe('cherry');
    expect(control.dirty).toBe(true);
  });

  it('should mark control as touched when the dropdown closes', () => {
    expect(control.touched).toBe(false);

    const selectDebug = hostFixture.debugElement.query(
      (node) => node.componentInstance instanceof FfSelectComponent
    );
    const select = selectDebug.componentInstance as FfSelectComponent;

    const trigger = hostFixture.nativeElement.querySelector('.ff-select__trigger');
    trigger.click();
    hostFixture.detectChanges();

    optionsOf(select)[1].click();
    hostFixture.detectChanges();

    expect(control.touched).toBe(true);
  });

  it('should disable the component when control.disable() is called', () => {
    control.disable();
    hostFixture.detectChanges();

    const trigger = hostFixture.nativeElement.querySelector('.ff-select__trigger');
    const host = hostFixture.nativeElement.querySelector('ff-select') as HTMLElement;
    expect(trigger.disabled).toBe(true);
    expect(host.classList.contains('ff-select--disabled')).toBe(true);
  });
});

@Component({
  standalone: true,
  imports: [ReactiveFormsModule, FfSelectComponent],
  template: `<ff-select [options]="options" [formControl]="control" />`,
})
class SelectCvaHostComponent {
  readonly options = MOCK_OPTIONS;
  readonly control = new FormControl('apple', { nonNullable: true });
}

describe('multi-selection', () => {
  let component: FfSelectComponent;
  let fixture: ComponentFixture<FfSelectComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FfSelectComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(FfSelectComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('options', MOCK_OPTIONS);
    fixture.componentRef.setInput('multiple', true);
    fixture.detectChanges();
  });

  it('renders a checkbox per option', () => {
    fixture.nativeElement.querySelector('.ff-select__trigger').click();
    fixture.detectChanges();

    const checkboxes = panelOf(component)?.querySelectorAll('.ff-select__checkbox');
    expect(checkboxes?.length).toBe(3);
  });

  it('accumulates values and emits valuesChange without closing the panel', () => {
    const spy = vi.fn();
    component.valuesChange.subscribe(spy);

    fixture.nativeElement.querySelector('.ff-select__trigger').click();
    fixture.detectChanges();

    const options = optionsOf(component);
    options[0].click();
    fixture.detectChanges();
    expect(spy).toHaveBeenNthCalledWith(1, ['apple']);

    // Simulates the caller feeding the emitted selection back through `[values]`
    // (the same controlled-component contract the single-select `value` input follows).
    fixture.componentRef.setInput('values', ['apple']);
    fixture.detectChanges();

    optionsOf(component)[2].click();
    fixture.detectChanges();

    expect(spy).toHaveBeenNthCalledWith(2, ['apple', 'cherry']);
    expect((fixture.nativeElement as HTMLElement).classList.contains('ff-select--open')).toBe(true);
  });

  it('toggles a value off when clicked again', () => {
    const spy = vi.fn();
    component.valuesChange.subscribe(spy);
    fixture.componentRef.setInput('values', ['apple', 'banana']);
    fixture.detectChanges();

    fixture.nativeElement.querySelector('.ff-select__trigger').click();
    fixture.detectChanges();

    optionsOf(component)[0].click();

    expect(spy).toHaveBeenCalledWith(['banana']);
  });

  it('shows the joined labels of the selected options in the trigger', () => {
    fixture.componentRef.setInput('values', ['apple', 'cherry']);
    fixture.detectChanges();

    const value = fixture.nativeElement.querySelector('.ff-select__value');
    expect(value.textContent.trim()).toBe('Apple, Cherry');
  });

  it('marks selected options with aria-selected and the selected class', () => {
    fixture.componentRef.setInput('values', ['banana']);
    fixture.detectChanges();
    fixture.nativeElement.querySelector('.ff-select__trigger').click();
    fixture.detectChanges();

    const options = optionsOf(component);
    expect(options[1].getAttribute('aria-selected')).toBe('true');
    expect(options[1].classList.contains('ff-select__option--selected')).toBe(true);
  });

  it('sets aria-multiselectable on the panel', () => {
    fixture.nativeElement.querySelector('.ff-select__trigger').click();
    fixture.detectChanges();

    expect(panelOf(component)?.getAttribute('aria-multiselectable')).toBe('true');
  });
});

describe('bindLabel / bindValue', () => {
  interface Country {
    id: number;
    name: string;
  }

  const COUNTRIES: Country[] = [
    { id: 1, name: 'Spain' },
    { id: 2, name: 'France' },
  ];

  let component: FfSelectComponent;
  let fixture: ComponentFixture<FfSelectComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FfSelectComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(FfSelectComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('options', COUNTRIES as unknown as FfSelectOptionLike[]);
    fixture.componentRef.setInput('bindLabel', 'name');
    fixture.componentRef.setInput('bindValue', 'id');
    fixture.detectChanges();
  });

  it('resolves the display label and value through the bound keys', () => {
    fixture.componentRef.setInput('value', '1');
    fixture.detectChanges();

    const value = fixture.nativeElement.querySelector('.ff-select__value');
    expect(value.textContent.trim()).toBe('Spain');
  });

  it('emits the bound value (coerced to string) on selection', () => {
    const spy = vi.fn();
    component.valueChange.subscribe(spy);

    fixture.nativeElement.querySelector('.ff-select__trigger').click();
    fixture.detectChanges();

    optionsOf(component)[1].click();

    expect(spy).toHaveBeenCalledWith('2');
  });
});

describe('custom templates', () => {
  @Component({
    standalone: true,
    imports: [FfSelectComponent, FfSelectOptionTemplateDirective, FfSelectLabelTemplateDirective],
    template: `
      <ff-select [options]="options" [value]="value">
        <ng-template ffSelectOptionTemplate let-option>
          <em class="custom-option">{{ option.label }}!</em>
        </ng-template>
        <ng-template ffSelectLabelTemplate let-option>
          <strong class="custom-label">{{ option.label }}?</strong>
        </ng-template>
      </ff-select>
    `,
  })
  class SelectTemplatesHostComponent {
    readonly options = MOCK_OPTIONS;
    readonly value = 'banana';
  }

  let hostFixture: ComponentFixture<SelectTemplatesHostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SelectTemplatesHostComponent],
    }).compileComponents();

    hostFixture = TestBed.createComponent(SelectTemplatesHostComponent);
    hostFixture.detectChanges();
  });

  it('renders the custom label template for the selected value', () => {
    const label = hostFixture.nativeElement.querySelector('.custom-label');
    expect(label?.textContent?.trim()).toBe('Banana?');
  });

  it('renders the custom option template for each row', () => {
    const selectDebug = hostFixture.debugElement.query(
      (node) => node.componentInstance instanceof FfSelectComponent
    );
    const select = selectDebug.componentInstance as FfSelectComponent;

    hostFixture.nativeElement.querySelector('.ff-select__trigger').click();
    hostFixture.detectChanges();

    const customOptions = panelOf(select)?.querySelectorAll('.custom-option');
    expect(customOptions?.length).toBe(3);
    expect(customOptions?.[0].textContent?.trim()).toBe('Apple!');
  });
});

describe('overlay inside a CdkTrapFocus host (e.g. ff-dialog-container)', () => {
  @Component({
    standalone: true,
    imports: [CdkTrapFocus, FfSelectComponent],
    template: `
      <div class="dialog-panel" cdkTrapFocus [cdkTrapFocusAutoCapture]="true">
        <ff-select [options]="options" [searchable]="true" />
      </div>
    `,
  })
  class SelectInDialogHostComponent {
    readonly options = MOCK_OPTIONS;
  }

  let hostFixture: ComponentFixture<SelectInDialogHostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SelectInDialogHostComponent],
    }).compileComponents();

    hostFixture = TestBed.createComponent(SelectInDialogHostComponent);
    document.body.appendChild(hostFixture.nativeElement);
    hostFixture.detectChanges();
  });

  afterEach(() => {
    vi.useRealTimers();
    hostFixture.nativeElement.remove();
  });

  it('keeps focus on the local search input, never on the portaled panel, once open', () => {
    vi.useFakeTimers();
    const dialogPanel = hostFixture.nativeElement.querySelector('.dialog-panel');
    const trigger = hostFixture.nativeElement.querySelector('.ff-select__trigger');

    trigger.click();
    hostFixture.detectChanges();
    vi.runAllTimers();

    expect(dialogPanel.contains(document.activeElement)).toBe(true);
    expect(document.activeElement?.classList.contains('ff-select__search')).toBe(true);
    expect(document.querySelector('.cdk-overlay-container')?.contains(document.activeElement)).toBe(false);
  });

  it('returns focus to the trigger, still inside the dialog subtree, after Escape', () => {
    vi.useFakeTimers();
    const dialogPanel = hostFixture.nativeElement.querySelector('.dialog-panel');
    const trigger = hostFixture.nativeElement.querySelector('.ff-select__trigger');

    trigger.click();
    hostFixture.detectChanges();
    vi.runAllTimers();

    const search = hostFixture.nativeElement.querySelector('.ff-select__search');
    search.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }));
    hostFixture.detectChanges();
    vi.runAllTimers();

    expect(document.activeElement).toBe(trigger);
    expect(dialogPanel.contains(document.activeElement)).toBe(true);
  });
});
