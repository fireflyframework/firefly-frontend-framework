import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  computed,
  input,
  output,
} from '@angular/core';

/**
 * Style axis of the button: `'solid'` (filled), `'outline'` (bordered,
 * transparent fill) or `'ghost'` (borderless, transparent fill).
 *
 * `'primary'` and `'secondary'` are **soft-deprecated** legacy values kept
 * for backward compatibility with the pre-dual-axis API: they resolve to
 * `'solid'` and additionally seed the `color` axis (`'primary'` /
 * `'secondary'` respectively) when `color` is left unset. New call sites
 * should pass `variant="solid"` and set `color` explicitly instead.
 */
export type FfButtonVariant = 'solid' | 'outline' | 'ghost' | 'primary' | 'secondary';

/**
 * Semantic color axis of the button, independent of `variant`. Combined
 * with `variant` to pick the rendered palette (e.g. `variant="outline"
 * color="success"` renders a green outlined button).
 */
export type FfButtonColor =
  | 'primary'
  | 'secondary'
  | 'success'
  | 'warning'
  | 'error'
  | 'info'
  | 'neutral';

/** Predefined size of the button. */
export type FfButtonSize = 'sm' | 'md' | 'lg';

/**
 * Firefly button atom.
 *
 * Standalone component with token-based styling via CSS custom properties.
 * Exposes two independent styling axes — `variant` (style: solid / outline /
 * ghost) and `color` (semantic palette: primary / secondary / success /
 * warning / error / info / neutral) — plus three sizes and disabled/loading
 * states.
 *
 * Backward compatibility: the pre-dual-axis values `'primary'` and
 * `'secondary'` are still accepted by `variant` (soft-deprecated) and are
 * mapped internally to `variant: 'solid'` + the matching `color`, so
 * existing call sites keep rendering identically without changes.
 *
 * @example
 * ```html
 * <ff-button variant="solid" color="primary" (clicked)="onSave()">
 *   Save
 * </ff-button>
 *
 * <ff-button variant="outline" color="danger" [loading]="isDeleting">
 *   Delete
 * </ff-button>
 *
 * <!-- legacy API, still supported -->
 * <ff-button variant="primary">Save</ff-button>
 * ```
 */
@Component({
  selector: 'ff-button',
  standalone: true,
  templateUrl: './ff-button.component.html',
  styleUrl: './ff-button.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    '[class]': 'hostClasses()',
    '[class.ff-button--disabled]': 'disabled()',
    '[class.ff-button--loading]': 'loading()',
  },
})
export class FfButtonComponent {
  /**
   * Style axis: `'solid'` | `'outline'` | `'ghost'`. Also accepts the
   * legacy `'primary'` | `'secondary'` values (soft-deprecated — see
   * {@link FfButtonVariant}). Defaults to `'solid'`.
   */
  readonly variant = input<FfButtonVariant>('solid');

  /**
   * Semantic color axis, independent of `variant`. When unset, defaults to
   * `'primary'` — except when the legacy `variant="secondary"` is used
   * without an explicit `color`, in which case it defaults to `'secondary'`
   * to preserve the pre-dual-axis rendering.
   */
  readonly color = input<FfButtonColor>();

  /** Button size: `'sm'` | `'md'` | `'lg'`. Defaults to `'md'`. */
  readonly size = input<FfButtonSize>('md');

  /** When `true`, the button is visually dimmed and ignores clicks. */
  readonly disabled = input(false);

  /** When `true`, shows a spinner and ignores clicks. */
  readonly loading = input(false);

  /** Emits when the button is clicked (only if not disabled or loading). */
  readonly clicked = output<void>();

  /**
   * Resolved style axis: legacy `'primary'` / `'secondary'` values collapse
   * to `'solid'`; `'solid'` / `'outline'` / `'ghost'` pass through as-is.
   */
  protected readonly resolvedVariant = computed<'solid' | 'outline' | 'ghost'>(() => {
    const variant = this.variant();
    return variant === 'primary' || variant === 'secondary' ? 'solid' : variant;
  });

  /**
   * Resolved color axis: the explicit `color` input wins; otherwise the
   * legacy `variant="secondary"` seeds `'secondary'` and every other legacy
   * or new-axis value defaults to `'primary'`.
   */
  protected readonly resolvedColor = computed<FfButtonColor>(() => {
    const explicit = this.color();
    if (explicit) {
      return explicit;
    }
    return this.variant() === 'secondary' ? 'secondary' : 'primary';
  });

  /** Host BEM classes derived from the resolved style + color + size axes. */
  protected readonly hostClasses = computed(() => {
    return [
      'ff-button',
      `ff-button--${this.resolvedVariant()}`,
      `ff-button--color-${this.resolvedColor()}`,
      `ff-button--${this.size()}`,
    ].join(' ');
  });

  /** @internal Handles native click — guards against disabled/loading state. */
  onClick(): void {
    if (!this.disabled() && !this.loading()) {
      this.clicked.emit();
    }
  }
}
