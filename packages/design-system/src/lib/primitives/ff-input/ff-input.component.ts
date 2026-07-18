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

/** Allowed input types. Includes `'textarea'` for multiline input. */
export type FfInputType = 'text' | 'number' | 'password' | 'textarea';

/**
 * Firefly input atom.
 *
 * Form input with label, hint text, and error message.
 * Emits value changes via the `valueChange` output.
 *
 * Also implements {@link ControlValueAccessor}, so it can be bound with
 * Reactive Forms (`[formControl]`, `formControlName`) or `[(ngModel)]`.
 * The `value` / `valueChange` API keeps working unchanged when no forms
 * directive is attached.
 *
 * @example
 * ```html
 * <ff-input
 *   label="Email"
 *   placeholder="you@example.com"
 *   [value]="email"
 *   (valueChange)="email = $event"
 * />
 *
 * <ff-input label="Password" type="password" error="Required" />
 *
 * <ff-input label="Notes" type="textarea" [rows]="5" />
 *
 * <ff-input label="Email" [formControl]="emailControl" />
 * ```
 */
@Component({
  selector: 'ff-input',
  standalone: true,
  templateUrl: './ff-input.component.html',
  styleUrl: './ff-input.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => FfInputComponent),
      multi: true,
    },
  ],
  host: {
    '[class]': '"ff-input"',
    '[class.ff-input--disabled]': 'effectiveDisabled()',
    '[class.ff-input--error]': '!!error()',
  },
})
export class FfInputComponent implements ControlValueAccessor {
  /** Native input type. Defaults to `'text'`. */
  readonly type = input<FfInputType>('text');

  /** Placeholder text shown when the input is empty. */
  readonly placeholder = input('');

  /** Current value of the input. */
  readonly value = input('');

  /** When `true`, the input is visually dimmed and non-interactive. */
  readonly disabled = input(false);

  /** Error message displayed below the input. Triggers error styling when non-empty. */
  readonly error = input('');

  /** Hint text displayed below the input (hidden when error is present). */
  readonly hint = input('');

  /** Label text displayed above the input. */
  readonly label = input('');

  /** Number of visible text rows. Only applies when `type` is `'textarea'`. Defaults to `3`. */
  readonly rows = input(3);

  /** Emits the new value on every input event. */
  readonly valueChange = output<string>();

  /** Emits when the input loses focus. Useful for marking form controls as touched. */
  readonly blurred = output<void>();

  /** @internal Unique id for label-input association. */
  protected readonly inputId = `ff-input-${nextId++}`;

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
   * Effective value rendered by the template.
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

  /** @internal Forwards native input events. */
  onInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    if (this.cvaAttached()) {
      this.cvaValue.set(value);
    }
    this.valueChange.emit(value);
    this.onChangeFn(value);
  }

  /** @internal Forwards native blur events. */
  onBlur(): void {
    this.blurred.emit();
    this.onTouchedFn();
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
