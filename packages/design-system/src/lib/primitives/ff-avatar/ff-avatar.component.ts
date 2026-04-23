import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  input,
  signal,
} from '@angular/core';

/** Predefined size of the avatar. */
export type FfAvatarSize = 'sm' | 'md' | 'lg';

/**
 * Firefly avatar atom.
 *
 * Circular avatar displaying an image or initials as fallback.
 * Falls back to initials automatically when the image fails to load.
 *
 * @example
 * ```html
 * <ff-avatar src="https://example.com/photo.jpg" alt="Jane Doe" />
 * <ff-avatar initials="JD" size="lg" />
 * ```
 */
@Component({
  selector: 'ff-avatar',
  standalone: true,
  templateUrl: './ff-avatar.component.html',
  styleUrl: './ff-avatar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    '[class]': '"ff-avatar ff-avatar--" + size()',
    'role': 'img',
    '[attr.aria-label]': 'alt() || initials() || null',
  },
})
export class FfAvatarComponent {
  /** Image URL. When empty, initials are displayed. */
  readonly src = input('');

  /** Fallback text (1–2 characters). Displayed when `src` is empty or fails to load. */
  readonly initials = input('');

  /** Alt text for the image. Also used as aria-label on the host. */
  readonly alt = input('');

  /** Avatar size: `'sm'` (32px) | `'md'` (40px) | `'lg'` (56px). Defaults to `'md'`. */
  readonly size = input<FfAvatarSize>('md');

  /** @internal Whether the image failed to load. */
  readonly imgError = signal(false);

  /** @internal Truncated initials (max 2 chars, uppercase). */
  get displayInitials(): string {
    return this.initials().slice(0, 2).toUpperCase();
  }

  /** @internal Whether to show the image. */
  get showImage(): boolean {
    return !!this.src() && !this.imgError();
  }

  /** @internal Called when the image fails to load. */
  onImgError(): void {
    this.imgError.set(true);
  }
}
