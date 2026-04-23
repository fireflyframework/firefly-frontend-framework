import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  input,
  output,
} from '@angular/core';

/**
 * Firefly checkbox atom.
 *
 * Supports checked, indeterminate, and disabled states.
 * Uses a native `<input type="checkbox">` for accessibility.
 *
 * @example
 * ```html
 * <ff-checkbox
 *   label="Accept terms"
 *   [checked]="accepted"
 *   (changed)="accepted = $event"
 * />
 * ```
 */
@Component({
  selector: 'ff-checkbox',
  standalone: true,
  templateUrl: './ff-checkbox.component.html',
  styleUrl: './ff-checkbox.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    '[class]': '"ff-checkbox"',
    '[class.ff-checkbox--checked]': 'checked()',
    '[class.ff-checkbox--indeterminate]': 'indeterminate()',
    '[class.ff-checkbox--disabled]': 'disabled()',
  },
})
export class FfCheckboxComponent {
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

  /** @internal Handles change event from the native input. */
  onChange(event: Event): void {
    if (!this.disabled()) {
      const checked = (event.target as HTMLInputElement).checked;
      this.changed.emit(checked);
    }
  }
}

let nextId = 0;
