import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  computed,
  input,
} from '@angular/core';

/** Shape of the skeleton placeholder. */
export type FfSkeletonVariant = 'text' | 'rect' | 'circle';

/** Default height per skeleton variant. */
const DEFAULT_HEIGHTS: Record<FfSkeletonVariant, string> = {
  text: '1em',
  rect: '80px',
  circle: '40px',
};

/**
 * Firefly skeleton atom.
 *
 * Loading placeholder in three shapes: `'text'` (one or more lines — the last
 * line of a multi-line block is shortened to 60%), `'rect'` and `'circle'`.
 * The shimmer animation is CSS-only and is disabled automatically under
 * `prefers-reduced-motion: reduce`.
 *
 * The host is `aria-hidden="true"`: skeletons are purely decorative — announce
 * loading state elsewhere (e.g. an `aria-busy` region).
 *
 * @example
 * ```html
 * <ff-skeleton />
 * <ff-skeleton variant="text" [lines]="3" width="80%" />
 * <ff-skeleton variant="rect" height="120px" />
 * <ff-skeleton variant="circle" height="48px" [animated]="false" />
 * ```
 */
@Component({
  selector: 'ff-skeleton',
  standalone: true,
  templateUrl: './ff-skeleton.component.html',
  styleUrl: './ff-skeleton.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    'aria-hidden': 'true',
    '[class]': '"ff-skeleton ff-skeleton--" + variant()',
    '[class.ff-skeleton--animated]': 'animated()',
  },
})
export class FfSkeletonComponent {
  /** Placeholder shape: `'text'` | `'rect'` | `'circle'`. Defaults to `'text'`. */
  readonly variant = input<FfSkeletonVariant>('text');

  /** CSS width. Defaults to `100%` (`circle` defaults to its height, staying round). */
  readonly width = input<string>();

  /** CSS height. Defaults per variant: text `1em`, rect `80px`, circle `40px`. */
  readonly height = input<string>();

  /** Number of lines for the `text` variant (the last line renders at 60% width). Defaults to `1`. */
  readonly lines = input(1);

  /** Enables the shimmer animation (auto-disabled under `prefers-reduced-motion`). Defaults to `true`. */
  readonly animated = input(true);

  /** Resolved CSS height (input or per-variant default). */
  protected readonly resolvedHeight = computed(
    () => this.height() ?? DEFAULT_HEIGHTS[this.variant()]
  );

  /** Resolved CSS width (input, or height for circles, or `100%`). */
  protected readonly resolvedWidth = computed(
    () =>
      this.width() ??
      (this.variant() === 'circle' ? this.resolvedHeight() : '100%')
  );

  /** Iterable for the `text` variant's line loop. */
  protected readonly lineItems = computed(() =>
    Array.from({ length: Math.max(1, this.lines()) }, (_, i) => i)
  );
}
