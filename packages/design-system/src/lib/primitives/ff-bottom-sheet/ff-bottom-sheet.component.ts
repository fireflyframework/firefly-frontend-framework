import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  input,
  output,
} from '@angular/core';

export type FfBottomSheetVariant = 'success' | 'error' | 'warning' | 'info';

/**
 * Firefly bottom-sheet atom.
 *
 * Modal panel anchored to the bottom of the viewport with a backdrop.
 * Supports projected body content and an actions zone.
 *
 * @example
 * ```html
 * @for (bs of alerts.activeBottomSheets(); track bs.id) {
 *   <ff-bottom-sheet
 *     [open]="true"
 *     [title]="bs.options.title ?? ''"
 *     [message]="bs.message"
 *     [type]="bs.type"
 *     (dismissed)="alerts.dismissBottomSheet(bs.id)"
 *   >
 *     <div ff-bottom-sheet-actions>
 *       <ff-button (clicked)="alerts.dismissBottomSheet(bs.id)">Close</ff-button>
 *     </div>
 *   </ff-bottom-sheet>
 * }
 * ```
 */
@Component({
  selector: 'ff-bottom-sheet',
  standalone: true,
  templateUrl: './ff-bottom-sheet.component.html',
  styleUrl: './ff-bottom-sheet.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    '[class]': '"ff-bottom-sheet"',
  },
})
export class FfBottomSheetComponent {
  /** Controls visibility. Set to `true` to show the bottom-sheet. */
  readonly open = input(false);

  /** Optional title rendered in the header. */
  readonly title = input('');

  /** Message text rendered in the body. */
  readonly message = input('');

  /** Semantic variant controlling the header accent. */
  readonly type = input<FfBottomSheetVariant>('info');

  /** Whether the bottom-sheet can be closed via backdrop click or close button. */
  readonly dismissible = input(true);

  /** Emits when the user dismisses the bottom-sheet. */
  readonly dismissed = output<void>();

  /** @internal Handles backdrop click. */
  protected onBackdropClick(event: MouseEvent): void {
    if (
      this.dismissible() &&
      (event.target as HTMLElement).classList.contains(
        'ff-bottom-sheet__backdrop',
      )
    ) {
      this.dismissed.emit();
    }
  }

  /** @internal Handles Escape key. */
  protected onKeydown(event: KeyboardEvent): void {
    if (this.dismissible() && event.key === 'Escape') {
      this.dismissed.emit();
    }
  }
}
