import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  input,
} from '@angular/core';

/** Semantic color variant of the badge. */
export type FfBadgeVariant = 'success' | 'warning' | 'error' | 'info' | 'neutral';

/** Predefined size of the badge. */
export type FfBadgeSize = 'sm' | 'md';

/**
 * Firefly badge atom.
 *
 * Inline status label with semantic color variants.
 * Text content is projected via `<ng-content>`.
 *
 * @example
 * ```html
 * <ff-badge variant="success">Active</ff-badge>
 * <ff-badge variant="error" size="sm">Failed</ff-badge>
 * ```
 */
@Component({
  selector: 'ff-badge',
  standalone: true,
  templateUrl: './ff-badge.component.html',
  styleUrl: './ff-badge.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    '[class]': '"ff-badge ff-badge--" + variant() + " ff-badge--" + size()',
  },
})
export class FfBadgeComponent {
  /** Semantic color: `'success'` | `'warning'` | `'error'` | `'info'` | `'neutral'`. Defaults to `'neutral'`. */
  readonly variant = input<FfBadgeVariant>('neutral');

  /** Badge size: `'sm'` | `'md'`. Defaults to `'md'`. */
  readonly size = input<FfBadgeSize>('md');
}
