import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  input,
  output,
} from '@angular/core';

/** Display variant of the link. */
export type FfLinkVariant = 'inline' | 'standalone';

/** Allowed target values for the anchor. */
export type FfLinkTarget = '_self' | '_blank';

/**
 * Firefly link atom.
 *
 * Styled anchor with inline and standalone variants.
 * Automatically adds `rel="noopener noreferrer"` when `target="_blank"`.
 *
 * @example
 * ```html
 * <ff-link href="/dashboard">Go to dashboard</ff-link>
 * <ff-link href="https://example.com" target="_blank" variant="standalone">External</ff-link>
 * ```
 */
@Component({
  selector: 'ff-link',
  standalone: true,
  templateUrl: './ff-link.component.html',
  styleUrl: './ff-link.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    '[class]':
      '"ff-link ff-link--" + variant() + (underline() ? " ff-link--underline" : "") + (disabled() ? " ff-link--disabled" : "")',
  },
})
export class FfLinkComponent {
  /** URL the link points to. Defaults to `''`. */
  readonly href = input('');

  /** Anchor target: `'_self'` | `'_blank'`. Defaults to `'_self'`. */
  readonly target = input<FfLinkTarget>('_self');

  /** Display variant: `'inline'` | `'standalone'`. Defaults to `'inline'`. */
  readonly variant = input<FfLinkVariant>('inline');

  /** Whether the link is visually disabled. Defaults to `false`. */
  readonly disabled = input(false);

  /** Whether the link text is underlined. Defaults to `true`. */
  readonly underline = input(true);

  /** Emitted when the link is clicked (for SPA navigation). */
  readonly clicked = output<void>();

  /** @internal */
  onClick(event: Event): void {
    if (this.disabled()) {
      event.preventDefault();
      return;
    }
    this.clicked.emit();
  }
}
