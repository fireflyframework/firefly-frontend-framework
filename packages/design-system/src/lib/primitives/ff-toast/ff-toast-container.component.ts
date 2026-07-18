import {
  ChangeDetectionStrategy,
  Component,
  InjectionToken,
  Signal,
  ViewEncapsulation,
  computed,
  inject,
} from '@angular/core';

import { FfToastComponent } from './ff-toast.component';
import type { FfToastEntry, FfToastPosition } from './toast.service';

/**
 * Internal contract `FfToastService` hands to the container it creates:
 * the active-toast state plus the lifecycle callbacks the container invokes.
 *
 * Not part of the public API — the container is an implementation detail of
 * the service and is never placed in markup by consumers.
 */
export interface FfToastHost {
  /** Active toasts across all positions. */
  readonly toasts: Signal<readonly FfToastEntry[]>;
  /** Dismisses one toast by id. */
  dismiss(id: number): void;
  /** Pauses the auto-dismiss timer of a toast (pointer enters it). */
  pause(id: number): void;
  /** Resumes a paused auto-dismiss timer (pointer leaves it). */
  resume(id: number): void;
}

/** Internal token binding the container to its creating service. */
export const FF_TOAST_HOST = new InjectionToken<FfToastHost>('FF_TOAST_HOST');

/** Fixed render order of the screen regions. */
const POSITIONS: readonly FfToastPosition[] = [
  'top-left',
  'top-center',
  'top-right',
  'bottom-left',
  'bottom-center',
  'bottom-right',
];

/**
 * Internal overlay rendering the active toasts of `FfToastService`.
 *
 * Renders one fixed, `aria-live="polite"` region per {@link FfToastPosition}
 * (regions exist upfront so screen readers announce insertions) and one
 * `ff-toast` per active entry. Error toasts are wrapped in `role="alert"`.
 * Enter transition and the optional auto-dismiss progress bar are pure CSS
 * animations (no `@angular/animations`), paused while hovered and disabled
 * under `prefers-reduced-motion`.
 */
@Component({
  selector: 'ff-toast-container',
  standalone: true,
  imports: [FfToastComponent],
  templateUrl: './ff-toast-container.component.html',
  styleUrl: './ff-toast-container.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    class: 'ff-toast-container',
  },
})
export class FfToastContainerComponent {
  protected readonly host = inject(FF_TOAST_HOST);

  protected readonly positions = POSITIONS;

  /** Active toasts grouped by screen region, in insertion order. */
  protected readonly grouped = computed(() => {
    const byPosition = {} as Record<FfToastPosition, FfToastEntry[]>;
    for (const position of POSITIONS) {
      byPosition[position] = [];
    }
    for (const toast of this.host.toasts()) {
      byPosition[toast.position].push(toast);
    }
    return byPosition;
  });
}
