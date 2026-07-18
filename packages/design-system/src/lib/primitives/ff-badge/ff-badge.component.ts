import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  ViewEncapsulation,
  computed,
  effect,
  inject,
  input,
  viewChild,
} from '@angular/core';

/** Semantic color variant of the badge. */
export type FfBadgeVariant = 'success' | 'warning' | 'error' | 'info' | 'neutral';

/**
 * Color palette of the badge, independent of the semantic variant.
 *
 * Extends the semantic palettes with the brand ones (`'primary'` /
 * `'secondary'`). When `color` is set it takes precedence over `variant`.
 */
export type FfBadgeColor =
  | 'primary'
  | 'secondary'
  | 'success'
  | 'warning'
  | 'error'
  | 'info'
  | 'neutral';

/** Predefined size of the badge. */
export type FfBadgeSize = 'xs' | 'sm' | 'md';

/** Corner shape of the badge: fully rounded pill or slightly rounded square. */
export type FfBadgeShape = 'pill' | 'square';

/**
 * Firefly badge atom.
 *
 * Inline status label with semantic color variants, an independent `color`
 * axis, an optional status dot, pill/square shapes and an automatic overflow
 * tooltip. Text content is projected via `<ng-content>`.
 *
 * The component OWNS the host `title` attribute: it sets it to the label text
 * when `maxWidth` causes real truncation and removes it otherwise. Consumers
 * must not write `title` on `<ff-badge>` themselves.
 *
 * @example
 * ```html
 * <ff-badge variant="success">Active</ff-badge>
 * <ff-badge variant="error" size="sm">Failed</ff-badge>
 * <ff-badge color="primary" shape="square" size="xs">v2</ff-badge>
 * <ff-badge color="success" [dot]="true">Online</ff-badge>
 * <ff-badge variant="info" maxWidth="120px">Very long label that truncates</ff-badge>
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
    '[class]': 'hostClasses()',
  },
})
export class FfBadgeComponent {
  /** Semantic color: `'success'` | `'warning'` | `'error'` | `'info'` | `'neutral'`. Defaults to `'neutral'`. */
  readonly variant = input<FfBadgeVariant>('neutral');

  /**
   * Color palette, independent of `variant`. Adds the brand palettes
   * (`'primary'` / `'secondary'`) to the semantic ones. When set it decides
   * the palette (`-100` background / `-700` foreground scale) and takes
   * precedence over `variant`; when unset, `variant` keeps working as before.
   *
   * @example
   * ```html
   * <ff-badge color="primary">Beta</ff-badge>
   * ```
   */
  readonly color = input<FfBadgeColor>();

  /**
   * Renders a decorative status dot (`aria-hidden`) tinted with the active
   * palette. The projected label remains optional: with a label the dot is
   * shown next to plain text; without one only the dot is rendered.
   *
   * @example
   * ```html
   * <ff-badge color="success" [dot]="true">Online</ff-badge>
   * <ff-badge color="error" [dot]="true" />
   * ```
   */
  readonly dot = input(false);

  /**
   * Corner shape: `'pill'` (full radius) or `'square'` (`--ff-radius-sm`).
   * Defaults to `'pill'`.
   *
   * @example
   * ```html
   * <ff-badge color="info" shape="square">Draft</ff-badge>
   * ```
   */
  readonly shape = input<FfBadgeShape>('pill');

  /** Badge size: `'xs'` | `'sm'` | `'md'`. Defaults to `'md'`. */
  readonly size = input<FfBadgeSize>('md');

  /**
   * Maximum width of the label as a CSS length (e.g. `'120px'`, `'8rem'`).
   * When set, the label truncates with an ellipsis and, ONLY when the text is
   * really truncated (`scrollWidth > clientWidth`), the component writes the
   * full label text into the host `title` attribute so the native tooltip
   * reveals it. The component owns that attribute: it removes it when there
   * is no truncation or when `maxWidth` is cleared.
   *
   * @example
   * ```html
   * <ff-badge variant="warning" maxWidth="96px">Pending external validation</ff-badge>
   * ```
   */
  readonly maxWidth = input<string>();

  /** Host BEM classes derived from the active axes. `color` wins over `variant`. */
  protected readonly hostClasses = computed(() => {
    const classes = [
      'ff-badge',
      `ff-badge--${this.color() ?? this.variant()}`,
      `ff-badge--${this.size()}`,
      `ff-badge--${this.shape()}`,
    ];
    if (this.dot()) classes.push('ff-badge--dot');
    if (this.maxWidth()) classes.push('ff-badge--truncate');
    return classes.join(' ');
  });

  private readonly hostRef = inject<ElementRef<HTMLElement>>(ElementRef);

  private readonly labelRef = viewChild<ElementRef<HTMLElement>>('label');

  constructor() {
    // Overflow tooltip: applies `maxWidth` imperatively so the measurement
    // always happens after the constraint is in place, then reflects real
    // truncation into the host `title` attribute (owned by the component).
    effect(() => {
      const host = this.hostRef.nativeElement;
      const label = this.labelRef()?.nativeElement;
      const maxWidth = this.maxWidth();
      if (!label) return;

      if (!maxWidth) {
        label.style.maxWidth = '';
        host.removeAttribute('title');
        return;
      }

      label.style.maxWidth = maxWidth;
      const truncated = label.scrollWidth > label.clientWidth;
      if (truncated) {
        host.setAttribute('title', label.textContent?.trim() ?? '');
      } else {
        host.removeAttribute('title');
      }
    });
  }
}
