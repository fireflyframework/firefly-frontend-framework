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
 * Compact notification rendered inline. The consumer positions the toast
 * and manages its lifecycle: the headless `AlertService` from
 * `@fireflyframework/core` orchestrates the queue (creation, auto-dismiss,
 * pause/resume) and the presentational `ff-toast-container` pattern renders
 * its `activeToasts()` as `ff-toast` atoms.
 *
 * @example
 * ```html
 * <!-- app shell; alerts = inject(AlertService) from @fireflyframework/core -->
 * <ff-toast-container
 *   [toasts]="alerts.activeToasts()"
 *   (dismissed)="alerts.dismiss($event)"
 *   (hoverStarted)="alerts.pauseToast($event)"
 *   (hoverEnded)="alerts.resumeToast($event)"
 * />
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
