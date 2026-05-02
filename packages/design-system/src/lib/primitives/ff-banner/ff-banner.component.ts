import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  input,
  output,
} from '@angular/core';

export type FfBannerVariant = 'success' | 'error' | 'warning' | 'info';

/**
 * Firefly banner atom.
 *
 * Full-width notification bar with optional action button and dismiss.
 * The consumer positions the banner (e.g. top or bottom of the viewport)
 * and iterates over active banners from AlertService.
 *
 * @example
 * ```html
 * @for (b of alerts.activeBanners(); track b.id) {
 *   <ff-banner
 *     [message]="b.message"
 *     [type]="b.type"
 *     [actionLabel]="b.options.action?.label ?? ''"
 *     (actionClicked)="b.options.action?.callback()"
 *     (dismissed)="alerts.dismissBanner(b.id)"
 *   />
 * }
 * ```
 */
@Component({
  selector: 'ff-banner',
  standalone: true,
  templateUrl: './ff-banner.component.html',
  styleUrl: './ff-banner.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    'role': 'alert',
    '[class]': '"ff-banner ff-banner--" + type()',
  },
})
export class FfBannerComponent {
  /** Banner message text. */
  readonly message = input('');

  /** Semantic variant controlling visual style. */
  readonly type = input<FfBannerVariant>('info');

  /** Optional icon identifier (rendered as text; product maps to icon system). */
  readonly icon = input('');

  /** Label for the optional action button. If empty, no button is rendered. */
  readonly actionLabel = input('');

  /** Whether the user can manually dismiss. */
  readonly dismissible = input(true);

  /** Emits when the user clicks the dismiss button. */
  readonly dismissed = output<void>();

  /** Emits when the user clicks the action button. */
  readonly actionClicked = output<void>();
}
