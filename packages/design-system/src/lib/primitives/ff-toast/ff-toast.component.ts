import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  input,
  output,
} from '@angular/core';

export type FfToastVariant = 'success' | 'error' | 'warning' | 'info';

/**
 * Firefly toast atom.
 *
 * Compact notification rendered inline. Most consumers should not
 * render it by hand: `FfToastService` (with `provideFfToasts()`) queues,
 * positions and auto-dismisses toasts through its own container. Use the
 * atom directly only for fully custom hosting.
 *
 * @example
 * ```html
 * @for (t of toastService.toasts(); track t.id) {
 *   <ff-toast
 *     [message]="t.message"
 *     [type]="t.type"
 *     [dismissible]="t.options.dismissible !== false"
 *     (dismissed)="alerts.dismiss(t.id)"
 *   />
 * }
 * ```
 */
@Component({
  selector: 'ff-toast',
  standalone: true,
  templateUrl: './ff-toast.component.html',
  styleUrl: './ff-toast.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    'role': 'status',
    '[class]': '"ff-toast ff-toast--" + type()',
  },
})
export class FfToastComponent {
  /** Toast message text. */
  readonly message = input('');

  /** Semantic variant controlling visual style. */
  readonly type = input<FfToastVariant>('info');

  /** Optional icon identifier (rendered as text; product maps to icon system). */
  readonly icon = input('');

  /** Whether the user can manually dismiss. */
  readonly dismissible = input(true);

  /** Emits when the user clicks the dismiss button. */
  readonly dismissed = output<void>();
}
