import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  input,
  output,
} from '@angular/core';

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
 * @example
 * ```html
 * <ff-radio
 *   name="plan"
 *   [options]="plans"
 *   [value]="selectedPlan"
 *   (valueChange)="selectedPlan = $event"
 * />
 * ```
 */
@Component({
  selector: 'ff-radio',
  standalone: true,
  templateUrl: './ff-radio.component.html',
  styleUrl: './ff-radio.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    'role': 'radiogroup',
    '[class]':
      '"ff-radio ff-radio--" + orientation()',
    '[class.ff-radio--disabled]': 'disabled()',
  },
})
export class FfRadioGroupComponent {
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

  /** @internal Resolves the effective `name` (explicit or fallback). */
  protected get effectiveName(): string {
    return this.name() || this.fallbackName;
  }

  /** @internal Determines whether a specific option is disabled. */
  protected isOptionDisabled(option: FfRadioOption): boolean {
    return this.disabled() || !!option.disabled;
  }

  /** @internal Handles selection of a radio option. */
  onSelect(option: FfRadioOption): void {
    if (!this.isOptionDisabled(option)) {
      this.valueChange.emit(option.value);
    }
  }
}

let nextId = 0;
