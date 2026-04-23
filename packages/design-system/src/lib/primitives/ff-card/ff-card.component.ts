import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  input,
} from '@angular/core';

/** Shadow elevation level for the card. */
export type FfCardShadow = 'none' | 'sm' | 'md' | 'lg';

/**
 * Firefly card atom.
 *
 * A composable container with optional header, body (default slot),
 * and footer zones via content projection.
 *
 * @example
 * ```html
 * <ff-card shadow="md">
 *   <div ff-card-header>Title</div>
 *   <p>Body content goes here.</p>
 *   <div ff-card-footer>
 *     <ff-button>Save</ff-button>
 *   </div>
 * </ff-card>
 * ```
 */
@Component({
  selector: 'ff-card',
  standalone: true,
  templateUrl: './ff-card.component.html',
  styleUrl: './ff-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    '[class]': '"ff-card ff-card--shadow-" + shadow()',
  },
})
export class FfCardComponent {
  /** Shadow elevation: `'none'` | `'sm'` | `'md'` | `'lg'`. Defaults to `'sm'`. */
  readonly shadow = input<FfCardShadow>('sm');
}
