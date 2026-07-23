import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  computed,
  input,
  signal,
} from '@angular/core';

/**
 * Predefined size of the avatar (`'sm'` 32px, `'md'` 40px, `'lg'` 56px), or a
 * literal pixel number for an arbitrary custom size.
 */
export type FfAvatarSize = 'sm' | 'md' | 'lg' | number;

/**
 * Decorative background tone of the avatar, independent of image/initials
 * content. The seven values are the semantic palette of `FfBadgeColor`.
 */
export type FfAvatarTone =
  | 'primary'
  | 'secondary'
  | 'success'
  | 'warning'
  | 'error'
  | 'info'
  | 'neutral';

/**
 * Derives up to two initials from a full name: the first grapheme of the
 * first word and, when there is more than one word, the first grapheme of
 * the last word. Extra whitespace is ignored and the result is uppercased.
 *
 * @param name - Full name (e.g. `'Maria Garcia Luque'`). May be empty.
 * @returns The derived initials (`''`, 1 or 2 characters).
 */
function deriveInitialsFromName(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return '';

  const firstChar = Array.from(words[0])[0] ?? '';
  if (words.length === 1) return firstChar.toUpperCase();

  const lastChar = Array.from(words[words.length - 1])[0] ?? '';
  return (firstChar + lastChar).toUpperCase();
}

/**
 * Firefly avatar atom.
 *
 * Circular (or square, via `round`) avatar displaying an image, or falling
 * back to initials when `src` is empty or the image fails to load. Initials
 * come from the explicit `initials` input when set, otherwise they are
 * derived automatically from `name` (first + last word, uppercased). `size`
 * accepts the predefined tokens or a literal pixel number; `tone` applies a
 * decorative background palette independent of the image/initials content.
 *
 * @example
 * ```html
 * <ff-avatar src="https://example.com/photo.jpg" alt="Jane Doe" />
 * <ff-avatar name="Jane Doe" size="lg" />
 * <ff-avatar name="Jane Doe" [size]="72" [round]="false" cornerRadius="12px" />
 * <ff-avatar initials="JD" tone="success" />
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
    '[class]': 'hostClasses()',
    'role': 'img',
    '[attr.aria-label]': 'alt() || displayInitials() || null',
    '[style.width.px]': 'numericSizePx()',
    '[style.height.px]': 'numericSizePx()',
    '[style.--ff-avatar-initials-size]': 'initialsFontSize()',
    '[style.--ff-avatar-radius]': 'cornerRadius() ?? null',
  },
})
export class FfAvatarComponent {
  /** Image URL. When empty, initials are displayed. */
  readonly src = input('');

  /**
   * Explicit fallback text (1–2 characters). Takes precedence over the
   * initials derived from `name`. Displayed when `src` is empty or fails to
   * load.
   */
  readonly initials = input('');

  /**
   * Full name used to derive initials automatically (first + last word,
   * uppercased) when `initials` is not set.
   *
   * @example
   * ```html
   * <ff-avatar name="Maria Garcia Luque" />
   * ```
   */
  readonly name = input('');

  /** Alt text for the image. Also used as aria-label on the host. */
  readonly alt = input('');

  /**
   * Avatar size: `'sm'` (32px) | `'md'` (40px) | `'lg'` (56px), or a literal
   * pixel number for an arbitrary size. Defaults to `'md'`. Initials font
   * size scales proportionally when a numeric size is used.
   */
  readonly size = input<FfAvatarSize>('md');

  /**
   * Whether the avatar is fully rounded (`true`, default) or square with
   * rounded corners (`false`, sized via `cornerRadius`).
   */
  readonly round = input(true);

  /**
   * Corner radius applied when `round` is `false`, as a CSS length (e.g.
   * `'8px'`, `'20%'`). Falls back to `--ff-radius-md` when unset. Has no
   * effect while `round` is `true`.
   */
  readonly cornerRadius = input<string>();

  /**
   * Decorative background tone, independent of the image/initials content.
   * When unset, the avatar keeps its default neutral background.
   */
  readonly tone = input<FfAvatarTone>();

  /** @internal Whether the image failed to load. */
  readonly imgError = signal(false);

  /** @internal Pixel value of `size` when it is a literal number, else `null`. */
  protected readonly numericSizePx = computed(() => {
    const s = this.size();
    return typeof s === 'number' ? s : null;
  });

  /**
   * @internal `font-size` (px) for the initials label, proportional to a
   * numeric `size`; `null` when `size` is a predefined token (CSS classes
   * own the font size in that case).
   */
  protected readonly initialsFontSize = computed(() => {
    const px = this.numericSizePx();
    return px === null ? null : `${Math.round(px * 0.4)}px`;
  });

  /** @internal BEM size modifier: the token itself, or `'custom'` for a numeric size. */
  protected readonly sizeClass = computed(() => {
    const s = this.size();
    return typeof s === 'number' ? 'custom' : s;
  });

  /** @internal Host BEM classes derived from the active axes. */
  protected readonly hostClasses = computed(() => {
    const classes = ['ff-avatar', `ff-avatar--${this.sizeClass()}`];
    if (!this.round()) classes.push('ff-avatar--square');
    const tone = this.tone();
    if (tone) classes.push(`ff-avatar--tone-${tone}`);
    return classes.join(' ');
  });

  /**
   * @internal Truncated, uppercased initials (max 2 chars): the explicit
   * `initials` input when set, otherwise derived from `name`.
   */
  protected readonly displayInitials = computed(() => {
    const explicit = this.initials();
    if (explicit) return explicit.slice(0, 2).toUpperCase();
    return deriveInitialsFromName(this.name());
  });

  /** @internal Whether to show the image. */
  get showImage(): boolean {
    return !!this.src() && !this.imgError();
  }

  /** @internal Called when the image fails to load. */
  onImgError(): void {
    this.imgError.set(true);
  }
}
