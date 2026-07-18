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

/**
 * Firefly checkbox atom.
 *
 * Supports checked, indeterminate, and disabled states.
 * Uses a native `<input type="checkbox">` for accessibility.
 *
 * Also implements {@link ControlValueAccessor}, so it can be bound with
 * Reactive Forms (`[formControl]`, `formControlName`) or `[(ngModel)]`.
 * The `checked` / `changed` API keeps working unchanged when no forms
 * directive is attached.
 *
 * @example
 * ```html
 * <ff-checkbox
 *   label="Accept terms"
 *   [checked]="accepted"
 *   (changed)="accepted = $event"
 * />
 *
 * <ff-checkbox label="Accept terms" [formControl]="acceptedControl" />
 * ```
 */
@Component({
  selector: 'ff-checkbox',
  standalone: true,
  templateUrl: './ff-checkbox.component.html',
  styleUrl: './ff-checkbox.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => FfCheckboxComponent),
      multi: true,
    },
  ],
  host: {
    '[class]': '"ff-checkbox"',
    '[class.ff-checkbox--checked]': 'effectiveChecked()',
    '[class.ff-checkbox--indeterminate]': 'indeterminate()',
    '[class.ff-checkbox--disabled]': 'effectiveDisabled()',
  },
})
export class FfCheckboxComponent implements ControlValueAccessor {
  /** Whether the checkbox is checked. */
  readonly checked = input(false);

  /** Whether the checkbox is in indeterminate state (partial selection). */
  readonly indeterminate = input(false);

  /** When `true`, the checkbox is visually dimmed and non-interactive. */
  readonly disabled = input(false);

  /** Label text displayed next to the checkbox. */
  readonly label = input('');

  /** Emits the new checked state when toggled. */
  readonly changed = output<boolean>();

  /** @internal Unique id for label-input association. */
  protected readonly inputId = `ff-checkbox-${nextId++}`;

  /** @internal Value written by the forms API via `writeValue`. */
  private readonly cvaValue = signal<boolean | null>(null);

  /** @internal Disabled state driven by the forms API via `setDisabledState`. */
  private readonly cvaDisabled = signal(false);

  /** @internal `true` once a forms directive attaches (first `registerOnChange`). */
  private readonly cvaAttached = signal(false);

  /** @internal Forms API change callback (noop until registered). */
  private onChangeFn: (value: boolean) => void = () => undefined;

  /** @internal Forms API touched callback (noop until registered). */
  private onTouchedFn: () => void = () => undefined;

  /**
   * Effective checked state rendered by the template.
   *
   * Precedence: once a forms directive is attached (Reactive Forms or
   * `ngModel`), the ControlValueAccessor value wins; otherwise the
   * `checked` input is used, keeping the classic API fully functional.
   */
  protected readonly effectiveChecked = computed(() =>
    this.cvaAttached() ? (this.cvaValue() ?? false) : this.checked()
  );

  /** Effective disabled state: `disabled` input OR forms API disabled state. */
  protected readonly effectiveDisabled = computed(
    () => this.disabled() || this.cvaDisabled()
  );

  /** @internal Handles change event from the native input. */
  onChange(event: Event): void {
    if (!this.effectiveDisabled()) {
      const checked = (event.target as HTMLInputElement).checked;
      if (this.cvaAttached()) {
        this.cvaValue.set(checked);
      }
      this.changed.emit(checked);
      this.onChangeFn(checked);
      this.onTouchedFn();
    }
  }

  /** Writes a new checked state from the forms API. Does not emit `changed`. */
  writeValue(value: boolean | null): void {
    this.cvaValue.set(value);
  }

  /** Registers the forms API change callback and marks the CVA as attached. */
  registerOnChange(fn: (value: boolean) => void): void {
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
