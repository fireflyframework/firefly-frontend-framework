import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  input,
} from '@angular/core';

/** Display mode of the loader. */
export type FfLoaderVariant = 'spinner' | 'skeleton';

/** Predefined size of the loader. */
export type FfLoaderSize = 'sm' | 'md' | 'lg';

/**
 * Firefly loader atom.
 *
 * Provides two visual modes: a circular **spinner** for indeterminate loading
 * and a rectangular **skeleton** placeholder with shimmer animation.
 * All animations are CSS-only (no JavaScript).
 *
 * @example
 * ```html
 * <ff-loader variant="spinner" size="md" />
 * <ff-loader variant="skeleton" size="lg" />
 * ```
 */
@Component({
  selector: 'ff-loader',
  standalone: true,
  templateUrl: './ff-loader.component.html',
  styleUrl: './ff-loader.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    'role': 'status',
    '[attr.aria-label]': '"Loading"',
    '[class]': '"ff-loader ff-loader--" + variant() + " ff-loader--" + size()',
  },
})
export class FfLoaderComponent {
  /** Display mode: `'spinner'` (circular) or `'skeleton'` (shimmer placeholder). Defaults to `'spinner'`. */
  readonly variant = input<FfLoaderVariant>('spinner');

  /** Loader size: `'sm'` | `'md'` | `'lg'`. Defaults to `'md'`. */
  readonly size = input<FfLoaderSize>('md');
}
