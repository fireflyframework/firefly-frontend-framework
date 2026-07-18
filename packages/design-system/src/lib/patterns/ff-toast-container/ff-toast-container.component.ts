import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  computed,
  input,
  output,
} from '@angular/core';

import { FfToastComponent } from '../../primitives/ff-toast';
import type { FfToastVariant } from '../../primitives/ff-toast';

/**
 * Structural (duck-typed) shape of one toast rendered by
 * `ff-toast-container`.
 *
 * Deliberately local to the design system — the DS never imports
 * `@fireflyframework/core`. The `Toast` entries exposed by core's headless
 * `AlertService` (`alerts.activeToasts()`) match this interface
 * structurally, so they can be bound directly without any adapter.
 */
export interface FfToastItem {
  /** Stable identifier, emitted back through every output. */
  readonly id: string;
  /** Message text. */
  readonly message: string;
  /**
   * Semantic type. `'success' | 'error' | 'warning' | 'info'` map to the
   * matching `ff-toast` variant, `'destructive'` maps to `'error'` and any
   * other value falls back to `'info'` (core's `AlertType` fits
   * structurally).
   */
  readonly type: string;
  /** Optional presentation options; unset fields use the documented defaults. */
  readonly options?: {
    /** Auto-dismiss delay in ms; drives the optional progress bar. */
    readonly duration?: number;
    /** Screen region; unknown or missing values render at `'top-right'`. */
    readonly position?: string;
    /** Whether the toast renders a manual dismiss button. Default `true`. */
    readonly dismissible?: boolean;
    /** Whether to render a progress bar tied to `duration`. Default `false`. */
    readonly progressBar?: boolean;
  };
}

/** Screen regions rendered by the container, in fixed order. */
const POSITIONS = [
  'top-left',
  'top-center',
  'top-right',
  'bottom-left',
  'bottom-center',
  'bottom-right',
] as const;

type ToastPosition = (typeof POSITIONS)[number];

/** One toast resolved for rendering (variant/position/flags normalized). */
interface ResolvedToast {
  readonly item: FfToastItem;
  readonly variant: FfToastVariant;
  readonly dismissible: boolean;
  readonly duration: number;
  readonly progressBar: boolean;
}

/**
 * Firefly toast container pattern.
 *
 * Purely presentational overlay: renders the given {@link FfToastItem}
 * entries as `ff-toast` primitives inside six fixed, always-present
 * `aria-live="polite"` screen regions (one per position, created upfront so
 * screen readers announce insertions). Error toasts are additionally wrapped
 * in `role="alert"`. The enter transition and the optional auto-dismiss
 * progress bar (tied to `options.duration`, visually paused while hovered)
 * are pure CSS animations — no `@angular/animations` — and are disabled
 * under `prefers-reduced-motion`.
 *
 * The container owns NO state and NO timers: queueing, auto-dismiss and
 * capacity live in an orchestrator such as core's headless `AlertService`.
 * The application layer places the container once in its shell and wires
 * the outputs back to the service — including `hoverStarted`/`hoverEnded`
 * to pause/resume the auto-dismiss timer while the pointer is over a toast:
 *
 * @example
 * ```html
 * <!-- app shell; AlertService from @fireflyframework/core -->
 * <ff-toast-container
 *   [toasts]="alerts.activeToasts()"
 *   (dismissed)="alerts.dismiss($event)"
 *   (hoverStarted)="alerts.pauseToast($event)"
 *   (hoverEnded)="alerts.resumeToast($event)"
 * />
 * ```
 *
 * The host uses `position: fixed` and ignores pointer events outside the
 * toasts themselves, so it can sit anywhere in the shell's markup without
 * affecting layout.
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
  /** Toasts to render, in insertion order (e.g. `alerts.activeToasts()`). */
  readonly toasts = input.required<readonly FfToastItem[]>();

  /** Emits the toast id when the user clicks its dismiss button. */
  readonly dismissed = output<string>();

  /** Emits the toast id when the pointer enters it (wire to pause). */
  readonly hoverStarted = output<string>();

  /** Emits the toast id when the pointer leaves it (wire to resume). */
  readonly hoverEnded = output<string>();

  protected readonly positions = POSITIONS;

  /** Toasts resolved and grouped by screen region, in input order. */
  protected readonly grouped = computed(() => {
    const byPosition = {} as Record<ToastPosition, ResolvedToast[]>;
    for (const position of POSITIONS) {
      byPosition[position] = [];
    }
    for (const item of this.toasts()) {
      byPosition[resolvePosition(item)].push({
        item,
        variant: resolveVariant(item),
        dismissible: item.options?.dismissible !== false,
        duration: item.options?.duration ?? 0,
        progressBar: item.options?.progressBar === true,
      });
    }
    return byPosition;
  });
}

/** Maps a structural `type` to an `ff-toast` variant. */
function resolveVariant(item: FfToastItem): FfToastVariant {
  switch (item.type) {
    case 'success':
    case 'error':
    case 'warning':
    case 'info':
      return item.type;
    case 'destructive':
      return 'error';
    default:
      return 'info';
  }
}

/** Maps a structural `position` to a known region (default `top-right`). */
function resolvePosition(item: FfToastItem): ToastPosition {
  const position = item.options?.position;
  return (POSITIONS as readonly string[]).includes(position ?? '')
    ? (position as ToastPosition)
    : 'top-right';
}
