import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  input,
} from '@angular/core';

/** Orientation of the divider line. */
export type FfDividerOrientation = 'horizontal' | 'vertical';

/** Visual thickness of the divider line. */
export type FfDividerThickness = 'thin' | 'medium';

/**
 * Firefly divider atom.
 *
 * Visual separator rendered as a horizontal or vertical line.
 * Purely decorative — no outputs, no content projection.
 *
 * @example
 * ```html
 * <ff-divider />
 * <ff-divider orientation="vertical" thickness="medium" />
 * ```
 */
@Component({
  selector: 'ff-divider',
  standalone: true,
  template: '',
  styleUrl: './ff-divider.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    'role': 'separator',
    '[attr.aria-orientation]': 'orientation()',
    '[class]':
      '"ff-divider ff-divider--" + orientation() + " ff-divider--" + thickness()',
  },
})
export class FfDividerComponent {
  /** Line direction: `'horizontal'` | `'vertical'`. Defaults to `'horizontal'`. */
  readonly orientation = input<FfDividerOrientation>('horizontal');

  /** Line weight: `'thin'` (1px) | `'medium'` (2px). Defaults to `'thin'`. */
  readonly thickness = input<FfDividerThickness>('thin');
}
