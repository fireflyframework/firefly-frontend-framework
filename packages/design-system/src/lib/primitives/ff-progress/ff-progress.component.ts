import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  computed,
  input,
} from '@angular/core';

/** Semantic color variant of the progress bar. */
export type FfProgressVariant = 'primary' | 'success' | 'warning' | 'error';

/** Predefined size (track height) of the progress bar. */
export type FfProgressSize = 'sm' | 'md';

/**
 * Firefly progress atom.
 *
 * Determinate horizontal progress bar. The `value` input is clamped to the
 * `0–100` range. Exposes `role="progressbar"` with `aria-valuemin`,
 * `aria-valuemax` and `aria-valuenow`; provide `label` for an accessible name.
 *
 * @example
 * ```html
 * <ff-progress [value]="42" label="Upload progress" />
 * <ff-progress [value]="uploadPct()" variant="success" size="sm" [showValue]="true" />
 * ```
 */
@Component({
  selector: 'ff-progress',
  standalone: true,
  templateUrl: './ff-progress.component.html',
  styleUrl: './ff-progress.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    '[class]':
      '"ff-progress ff-progress--" + variant() + " ff-progress--" + size()',
  },
})
export class FfProgressComponent {
  /** Progress value in the `0–100` range. Out-of-range values are clamped. */
  readonly value = input.required<number>();

  /** Semantic color: `'primary'` | `'success'` | `'warning'` | `'error'`. Defaults to `'primary'`. */
  readonly variant = input<FfProgressVariant>('primary');

  /** Track height: `'sm'` (4px) | `'md'` (8px). Defaults to `'md'`. */
  readonly size = input<FfProgressSize>('md');

  /** When `true`, renders the rounded percentage (`NN%`) to the right of the track. Defaults to `false`. */
  readonly showValue = input(false);

  /** Accessible name applied as `aria-label` on the progressbar element. */
  readonly label = input<string>();

  /** `value` clamped to the `0–100` range (used for the fill width and `aria-valuenow`). */
  protected readonly clampedValue = computed(() =>
    Math.min(100, Math.max(0, this.value()))
  );

  /** Rounded percentage rendered when `showValue` is enabled. */
  protected readonly displayValue = computed(() =>
    Math.round(this.clampedValue())
  );
}
