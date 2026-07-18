import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnDestroy,
  ViewEncapsulation,
  computed,
  forwardRef,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

/** Single option inside a select dropdown. */
export interface FfSelectOption {
  /** Display text. */
  label: string;
  /** Form value emitted on selection. */
  value: string;
  /** Disables this individual option. */
  disabled?: boolean;
}

/**
 * Firefly select atom.
 *
 * Single-selection dropdown with optional search filtering and
 * keyboard navigation (ArrowUp/Down, Enter, Escape).
 *
 * Also implements {@link ControlValueAccessor}, so it can be bound with
 * Reactive Forms (`[formControl]`, `formControlName`) or `[(ngModel)]`.
 * The `value` / `valueChange` API keeps working unchanged when no forms
 * directive is attached.
 *
 * @example
 * ```html
 * <ff-select
 *   placeholder="Choose a country"
 *   [options]="countries"
 *   [value]="selected"
 *   [searchable]="true"
 *   (valueChange)="selected = $event"
 * />
 *
 * <ff-select [options]="countries" [formControl]="countryControl" />
 * ```
 */
@Component({
  selector: 'ff-select',
  standalone: true,
  templateUrl: './ff-select.component.html',
  styleUrl: './ff-select.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => FfSelectComponent),
      multi: true,
    },
  ],
  host: {
    '[class]': '"ff-select"',
    '[class.ff-select--open]': 'open()',
    '[class.ff-select--disabled]': 'effectiveDisabled()',
    '(document:click)': 'onDocumentClick($event)',
  },
})
export class FfSelectComponent implements ControlValueAccessor, OnDestroy {
  /** Available options. */
  readonly options = input<FfSelectOption[]>([]);

  /** Currently selected value. */
  readonly value = input('');

  /** Placeholder text when nothing is selected. */
  readonly placeholder = input('');

  /** Disables the entire select. */
  readonly disabled = input(false);

  /** Enables search/filter in the dropdown. */
  readonly searchable = input(false);

  /** Emits the selected value string. */
  readonly valueChange = output<string>();

  /** @internal */
  protected readonly open = signal(false);

  /** @internal */
  protected readonly search = signal('');

  /** @internal */
  protected readonly activeIndex = signal(-1);

  /** @internal */
  protected readonly searchInput =
    viewChild<ElementRef<HTMLInputElement>>('searchInput');

  /** @internal Value written by the forms API via `writeValue`. */
  private readonly cvaValue = signal<string | null>(null);

  /** @internal Disabled state driven by the forms API via `setDisabledState`. */
  private readonly cvaDisabled = signal(false);

  /** @internal `true` once a forms directive attaches (first `registerOnChange`). */
  private readonly cvaAttached = signal(false);

  /** @internal Forms API change callback (noop until registered). */
  private onChangeFn: (value: string) => void = () => undefined;

  /** @internal Forms API touched callback (noop until registered). */
  private onTouchedFn: () => void = () => undefined;

  /**
   * Effective selected value rendered by the template.
   *
   * Precedence: once a forms directive is attached (Reactive Forms or
   * `ngModel`), the ControlValueAccessor value wins; otherwise the
   * `value` input is used, keeping the classic API fully functional.
   */
  protected readonly effectiveValue = computed(() =>
    this.cvaAttached() ? (this.cvaValue() ?? '') : this.value()
  );

  /** Effective disabled state: `disabled` input OR forms API disabled state. */
  protected readonly effectiveDisabled = computed(
    () => this.disabled() || this.cvaDisabled()
  );

  /** Resolved display label for the current value. */
  protected readonly displayLabel = computed(() => {
    const opt = this.options().find((o) => o.value === this.effectiveValue());
    return opt ? opt.label : '';
  });

  /** Filtered options based on search term. */
  protected readonly filteredOptions = computed(() => {
    const term = this.search().toLowerCase();
    if (!term) return this.options();
    return this.options().filter((o) =>
      o.label.toLowerCase().includes(term)
    );
  });

  /** @internal */
  protected toggle(): void {
    if (this.effectiveDisabled()) return;
    if (this.open()) {
      this.close();
    } else {
      this.openDropdown();
    }
  }

  /** @internal */
  protected openDropdown(): void {
    this.open.set(true);
    this.search.set('');
    this.activeIndex.set(-1);
    setTimeout(() => this.searchInput()?.nativeElement.focus());
  }

  /** @internal Closes the dropdown, marking the control as touched. */
  protected close(): void {
    if (this.open()) {
      this.onTouchedFn();
    }
    this.open.set(false);
    this.search.set('');
    this.activeIndex.set(-1);
  }

  /** @internal */
  protected selectOption(option: FfSelectOption): void {
    if (option.disabled) return;
    if (this.cvaAttached()) {
      this.cvaValue.set(option.value);
    }
    this.valueChange.emit(option.value);
    this.onChangeFn(option.value);
    this.close();
  }

  /** @internal */
  protected onSearchInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.search.set(value);
    this.activeIndex.set(-1);
  }

  /** @internal */
  protected onKeydown(event: KeyboardEvent): void {
    const opts = this.filteredOptions();

    switch (event.key) {
      case 'ArrowDown': {
        event.preventDefault();
        const next = Math.min(this.activeIndex() + 1, opts.length - 1);
        this.activeIndex.set(next);
        break;
      }
      case 'ArrowUp': {
        event.preventDefault();
        const prev = Math.max(this.activeIndex() - 1, 0);
        this.activeIndex.set(prev);
        break;
      }
      case 'Enter': {
        event.preventDefault();
        const idx = this.activeIndex();
        if (idx >= 0 && idx < opts.length) {
          this.selectOption(opts[idx]);
        }
        break;
      }
      case 'Escape':
        this.close();
        break;
    }
  }

  /** @internal */
  protected isOptionDisabled(option: FfSelectOption): boolean {
    return !!option.disabled;
  }

  /** @internal Close dropdown when clicking outside. */
  onDocumentClick(_event: Event): void {
    // stub — click-outside is handled via toggle()
  }

  /** Writes a new value from the forms API. Does not emit `valueChange`. */
  writeValue(value: string | null): void {
    this.cvaValue.set(value);
  }

  /** Registers the forms API change callback and marks the CVA as attached. */
  registerOnChange(fn: (value: string) => void): void {
    this.cvaAttached.set(true);
    this.onChangeFn = fn;
  }

  /** Registers the forms API touched callback. */
  registerOnTouched(fn: () => void): void {
    this.onTouchedFn = fn;
  }

  /** Sets the disabled state from the forms API (`control.disable()`). */
  setDisabledState(isDisabled: boolean): void {
    this.cvaDisabled.set(isDisabled);
  }

  ngOnDestroy(): void {
    // Reset dropdown state directly (not via `close()`) to avoid marking
    // the attached control as touched during teardown.
    this.open.set(false);
    this.search.set('');
    this.activeIndex.set(-1);
  }
}
