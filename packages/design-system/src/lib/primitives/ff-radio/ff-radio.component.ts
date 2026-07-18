import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  computed,
  forwardRef,
  input,
  output,
  signal,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

/** Single option inside a radio group. */
export interface FfRadioOption {
  /** Display text. */
  label: string;
  /** Form value emitted on selection. */
  value: string;
  /** Disables this individual option. */
  disabled?: boolean;
}

/** Layout direction of the radio group. */
export type FfRadioOrientation = 'horizontal' | 'vertical';

/**
 * Firefly radio-group atom.
 *
 * Renders a set of mutually-exclusive radio buttons from a declarative
 * `options` array.  Supports horizontal / vertical layout and per-option
 * disable.
 *
 * Also implements {@link ControlValueAccessor}, so it can be bound with
 * Reactive Forms (`[formControl]`, `formControlName`) or `[(ngModel)]`.
 * The `value` / `valueChange` API keeps working unchanged when no forms
 * directive is attached.
 *
 * @example
 * ```html
 * <ff-radio
 *   name="plan"
 *   [options]="plans"
 *   [value]="selectedPlan"
 *   (valueChange)="selectedPlan = $event"
 * />
 *
 * <ff-radio name="plan" [options]="plans" [formControl]="planControl" />
 * ```
 */
@Component({
  selector: 'ff-radio',
  standalone: true,
  templateUrl: './ff-radio.component.html',
  styleUrl: './ff-radio.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => FfRadioGroupComponent),
      multi: true,
    },
  ],
  host: {
    'role': 'radiogroup',
    '[class]':
      '"ff-radio ff-radio--" + orientation()',
    '[class.ff-radio--disabled]': 'effectiveDisabled()',
  },
})
export class FfRadioGroupComponent implements ControlValueAccessor {
  /** Available options to display. */
  readonly options = input<FfRadioOption[]>([]);

  /** Currently selected value. */
  readonly value = input('');

  /** Shared `name` attribute for the native radio inputs. */
  readonly name = input('');

  /** Layout direction: `'horizontal'` (default) or `'vertical'`. */
  readonly orientation = input<FfRadioOrientation>('horizontal');

  /** Disables the entire group when `true`. */
  readonly disabled = input(false);

  /** Emits the selected option's `value` string. */
  readonly valueChange = output<string>();

  /** @internal Auto-generated name fallback. */
  protected readonly fallbackName = `ff-radio-${nextId++}`;

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

  /** @internal Resolves the effective `name` (explicit or fallback). */
  protected get effectiveName(): string {
    return this.name() || this.fallbackName;
  }

  /** @internal Determines whether a specific option is disabled. */
  protected isOptionDisabled(option: FfRadioOption): boolean {
    return this.effectiveDisabled() || !!option.disabled;
  }

  /** @internal Handles selection of a radio option. */
  onSelect(option: FfRadioOption): void {
    if (!this.isOptionDisabled(option)) {
      if (this.cvaAttached()) {
        this.cvaValue.set(option.value);
      }
      this.valueChange.emit(option.value);
      this.onChangeFn(option.value);
      this.onTouchedFn();
    }
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
}

let nextId = 0;
