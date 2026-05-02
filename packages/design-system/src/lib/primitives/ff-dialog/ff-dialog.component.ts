import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  input,
  output,
} from '@angular/core';

export type FfDialogVariant = 'success' | 'error' | 'warning' | 'info';

/**
 * Firefly dialog atom.
 *
 * Modal overlay with backdrop, Escape-to-close, and projected
 * zones for title, body, and actions.
 *
 * @example
 * ```html
 * <ff-dialog title="Confirm deletion" type="warning" [open]="showDialog" (closed)="showDialog = false">
 *   <p>Are you sure you want to delete this item?</p>
 *   <div ff-dialog-actions>
 *     <ff-button variant="secondary" (clicked)="showDialog = false">Cancel</ff-button>
 *     <ff-button variant="danger" (clicked)="delete()">Delete</ff-button>
 *   </div>
 * </ff-dialog>
 * ```
 */
@Component({
  selector: 'ff-dialog',
  standalone: true,
  templateUrl: './ff-dialog.component.html',
  styleUrl: './ff-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    '[class]': '"ff-dialog" + (type() ? " ff-dialog--" + type() : "")',
  },
})
export class FfDialogComponent {
  /** Controls visibility. Set to `true` to show the modal. */
  readonly open = input(false);

  /** Dialog title rendered in the header. */
  readonly title = input('');

  /** Semantic variant controlling visual style. Optional — when unset no variant class is applied. */
  readonly type = input<FfDialogVariant | undefined>(undefined);

  /** Whether the dialog can be closed via backdrop click, Escape key, or X button. Defaults to `true`. */
  readonly dismissible = input(true);

  /** Emits when the dialog is closed (Escape, backdrop click, or programmatic). */
  readonly closed = output<void>();

  /** @internal Handles backdrop click. */
  protected onBackdropClick(event: MouseEvent): void {
    if (this.dismissible() && (event.target as HTMLElement).classList.contains('ff-dialog__backdrop')) {
      this.closed.emit();
    }
  }

  /** @internal Handles Escape key. */
  protected onKeydown(event: KeyboardEvent): void {
    if (this.dismissible() && event.key === 'Escape') {
      this.closed.emit();
    }
  }
}
