import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  input,
  output,
} from '@angular/core';

/** Predefined size of the icon button. */
export type FfIconButtonSize = 'sm' | 'md' | 'lg';

/**
 * Firefly icon-button atom.
 *
 * Compact button designed for icon-only actions. Renders a projected icon
 * inside a square hit area with an optional native tooltip.
 *
 * @example
 * ```html
 * <ff-icon-button tooltip="Edit" (clicked)="onEdit()">
 *   <i class="fi-edit"></i>
 * </ff-icon-button>
 * ```
 */
@Component({
  selector: 'ff-icon-button',
  standalone: true,
  templateUrl: './ff-icon-button.component.html',
  styleUrl: './ff-icon-button.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    '[class]': '"ff-icon-button ff-icon-button--" + size()',
    '[class.ff-icon-button--disabled]': 'disabled()',
  },
})
export class FfIconButtonComponent {
  /** CSS class or identifier for the icon to display (projected via `<ng-content>`). */
  readonly icon = input('');

  /** Native tooltip text shown on hover via the `title` attribute. */
  readonly tooltip = input('');

  /** When `true`, the button is visually dimmed and ignores clicks. */
  readonly disabled = input(false);

  /** Button size: `'sm'` | `'md'` | `'lg'`. Defaults to `'md'`. */
  readonly size = input<FfIconButtonSize>('md');

  /** Emits when the button is clicked (only if not disabled). */
  readonly clicked = output<void>();

  /** @internal Handles native click — guards against disabled state. */
  onClick(): void {
    if (!this.disabled()) {
      this.clicked.emit();
    }
  }
}
