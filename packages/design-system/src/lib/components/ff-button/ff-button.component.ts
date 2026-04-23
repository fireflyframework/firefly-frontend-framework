import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  input,
  output,
} from '@angular/core';

/** Visual style of the button. */
export type FfButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost';

/** Predefined size of the button. */
export type FfButtonSize = 'sm' | 'md' | 'lg';

/**
 * Firefly button atom.
 *
 * Standalone component with token-based styling via CSS custom properties.
 * Supports four visual variants, three sizes, and disabled/loading states.
 *
 * @example
 * ```html
 * <ff-button variant="primary" size="md" (clicked)="onSave()">
 *   Save
 * </ff-button>
 *
 * <ff-button variant="outline" [loading]="isSaving">
 *   Processing...
 * </ff-button>
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
    '[class]': '"ff-button ff-button--" + variant() + " ff-button--" + size()',
    '[class.ff-button--disabled]': 'disabled()',
    '[class.ff-button--loading]': 'loading()',
  },
})
export class FfButtonComponent {
  /** Visual style: `'primary'` | `'secondary'` | `'outline'` | `'ghost'`. Defaults to `'primary'`. */
  readonly variant = input<FfButtonVariant>('primary');

  /** Button size: `'sm'` | `'md'` | `'lg'`. Defaults to `'md'`. */
  readonly size = input<FfButtonSize>('md');

  /** When `true`, the button is visually dimmed and ignores clicks. */
  readonly disabled = input(false);

  /** When `true`, shows a spinner and ignores clicks. */
  readonly loading = input(false);

  /** Emits when the button is clicked (only if not disabled or loading). */
  readonly clicked = output<void>();

  /** @internal Handles native click — guards against disabled/loading state. */
  onClick(): void {
    if (!this.disabled() && !this.loading()) {
      this.clicked.emit();
    }
  }
}
