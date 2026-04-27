import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  input,
  output,
} from '@angular/core';

/** Allowed input types. Includes `'textarea'` for multiline input. */
export type FfInputType = 'text' | 'number' | 'password' | 'textarea';

/**
 * Firefly input atom.
 *
 * Form input with label, hint text, and error message.
 * Emits value changes via the `valueChange` output.
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
 * ```
 */
@Component({
  selector: 'ff-input',
  standalone: true,
  templateUrl: './ff-input.component.html',
  styleUrl: './ff-input.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    '[class]': '"ff-input"',
    '[class.ff-input--disabled]': 'disabled()',
    '[class.ff-input--error]': '!!error()',
  },
})
export class FfInputComponent {
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

  /** @internal Forwards native input events. */
  onInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.valueChange.emit(value);
  }

  /** @internal Forwards native blur events. */
  onBlur(): void {
    this.blurred.emit();
  }
}

let nextId = 0;
