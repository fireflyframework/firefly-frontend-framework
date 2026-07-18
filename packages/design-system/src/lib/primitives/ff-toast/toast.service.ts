import {
  ApplicationRef,
  ComponentRef,
  DOCUMENT,
  EnvironmentInjector,
  Injectable,
  InjectionToken,
  Injector,
  OnDestroy,
  Signal,
  createComponent,
  inject,
  signal,
} from '@angular/core';

import type { FfToastVariant } from './ff-toast.component';
import {
  FF_TOAST_HOST,
  FfToastContainerComponent,
  FfToastHost,
} from './ff-toast-container.component';

/** Screen region where a toast is rendered. */
export type FfToastPosition =
  | 'top-right'
  | 'top-left'
  | 'bottom-right'
  | 'bottom-left'
  | 'top-center'
  | 'bottom-center';

/**
 * Global toast defaults, configurable via `provideFfToasts`.
 * Per-toast {@link FfToastOptions} override these values.
 */
export interface FfToastGlobalConfig {
  /** Default auto-dismiss delay in milliseconds; `0` disables auto-dismiss. */
  timeout: number;
  /** Default screen region for new toasts. */
  position: FfToastPosition;
  /** Whether toasts render a manual dismiss button by default. */
  dismissible: boolean;
  /** Whether toasts render an auto-dismiss progress bar by default. */
  progressBar: boolean;
}

/** Built-in defaults applied when `provideFfToasts` receives no overrides. */
export const FF_TOAST_DEFAULT_CONFIG: FfToastGlobalConfig = {
  timeout: 4000,
  position: 'top-right',
  dismissible: true,
  progressBar: false,
};

/**
 * Injection token carrying the merged {@link FfToastGlobalConfig}.
 * Provided by `provideFfToasts`; not part of the public barrel — consumers
 * configure toasts exclusively through the provider function.
 */
export const FF_TOAST_CONFIG = new InjectionToken<FfToastGlobalConfig>(
  'FF_TOAST_CONFIG'
);

/** Per-toast display options; unset fields fall back to the global config. */
export interface FfToastOptions {
  /** Auto-dismiss delay in milliseconds; `0` keeps the toast until dismissed. */
  timeout?: number;
  /** Screen region for this toast. */
  position?: FfToastPosition;
  /** Whether the toast renders a manual dismiss button. */
  dismissible?: boolean;
  /** Whether the toast renders an auto-dismiss progress bar. */
  progressBar?: boolean;
}

/** Options accepted by {@link FfToastService.show}. */
export interface FfToastShowOptions extends FfToastOptions {
  /** Semantic variant; the `success`/`error`/`warning`/`info` shortcuts set it. */
  variant?: FfToastVariant;
}

/** An active toast as tracked by {@link FfToastService}. */
export interface FfToastEntry {
  /** Unique id, returned by `show` and accepted by `dismiss`. */
  readonly id: number;
  /** Message text. */
  readonly message: string;
  /** Semantic variant. */
  readonly variant: FfToastVariant;
  /** Screen region where the toast renders. */
  readonly position: FfToastPosition;
  /** Auto-dismiss delay in milliseconds (`0` = persistent). */
  readonly timeout: number;
  /** Whether the toast renders a manual dismiss button. */
  readonly dismissible: boolean;
  /** Whether the toast renders an auto-dismiss progress bar. */
  readonly progressBar: boolean;
}

/** Internal auto-dismiss timer bookkeeping for one toast. */
interface ToastTimer {
  timerId: ReturnType<typeof setTimeout> | null;
  /** Epoch milliseconds when the toast is due to auto-dismiss. */
  expiresAt: number;
  /** Milliseconds left when paused; `null` while the timer is running. */
  remaining: number | null;
}

/**
 * Imperative toast service of the Firefly design system.
 *
 * Renders `ff-toast` atoms inside fixed, `aria-live` screen regions without
 * any markup on the consumer side: the first `show` call creates an
 * `ff-toast-container` on demand and appends it to `document.body`.
 * Auto-dismiss (with optional CSS progress bar, paused on hover) uses plain
 * timers and CSS animations — no `@angular/animations` dependency.
 *
 * Register it with `provideFfToasts()` in the application config.
 *
 * @example
 * ```ts
 * export class SavePage {
 *   private readonly toasts = inject(FfToastService);
 *
 *   onSaved(): void {
 *     this.toasts.success('Document saved');
 *   }
 *
 *   onSyncStarted(): void {
 *     // Persistent toast in another corner, dismissed manually later.
 *     this.syncToastId = this.toasts.info('Syncing…', {
 *       timeout: 0,
 *       position: 'bottom-left',
 *     });
 *   }
 *
 *   onSyncEnded(): void {
 *     this.toasts.dismiss(this.syncToastId);
 *   }
 * }
 * ```
 */
@Injectable()
export class FfToastService implements OnDestroy {
  private readonly document = inject(DOCUMENT);
  private readonly appRef = inject(ApplicationRef);
  private readonly environmentInjector = inject(EnvironmentInjector);
  private readonly injector = inject(Injector);
  private readonly config =
    inject(FF_TOAST_CONFIG, { optional: true }) ?? FF_TOAST_DEFAULT_CONFIG;

  private readonly activeToasts = signal<readonly FfToastEntry[]>([]);
  private readonly timers = new Map<number, ToastTimer>();
  private containerRef: ComponentRef<FfToastContainerComponent> | null = null;
  private nextId = 0;

  /** Active toasts across all positions, in insertion order. */
  readonly toasts: Signal<readonly FfToastEntry[]> =
    this.activeToasts.asReadonly();

  /**
   * Shows a toast and returns its id (usable with {@link dismiss}).
   *
   * @param message Message text.
   * @param options Per-toast overrides of the global config, plus `variant`.
   */
  show(message: string, options: FfToastShowOptions = {}): number {
    this.ensureContainer();

    const entry: FfToastEntry = {
      id: this.nextId++,
      message,
      variant: options.variant ?? 'info',
      position: options.position ?? this.config.position,
      timeout: options.timeout ?? this.config.timeout,
      dismissible: options.dismissible ?? this.config.dismissible,
      progressBar: options.progressBar ?? this.config.progressBar,
    };

    this.activeToasts.update((toasts) => [...toasts, entry]);
    if (entry.timeout > 0) {
      this.timers.set(entry.id, {
        timerId: setTimeout(() => this.dismiss(entry.id), entry.timeout),
        expiresAt: Date.now() + entry.timeout,
        remaining: null,
      });
    }
    return entry.id;
  }

  /** Shows a `success` toast. */
  success(message: string, options: FfToastOptions = {}): number {
    return this.show(message, { ...options, variant: 'success' });
  }

  /** Shows an `error` toast (announced assertively via `role="alert"`). */
  error(message: string, options: FfToastOptions = {}): number {
    return this.show(message, { ...options, variant: 'error' });
  }

  /** Shows an `info` toast. */
  info(message: string, options: FfToastOptions = {}): number {
    return this.show(message, { ...options, variant: 'info' });
  }

  /** Shows a `warning` toast. */
  warning(message: string, options: FfToastOptions = {}): number {
    return this.show(message, { ...options, variant: 'warning' });
  }

  /** Dismisses one toast by id; unknown ids are ignored. */
  dismiss(id: number): void {
    this.clearTimer(id);
    this.activeToasts.update((toasts) => toasts.filter((t) => t.id !== id));
  }

  /** Dismisses every active toast in every position. */
  clear(): void {
    for (const id of [...this.timers.keys()]) {
      this.clearTimer(id);
    }
    this.activeToasts.set([]);
  }

  ngOnDestroy(): void {
    this.clear();
    if (this.containerRef) {
      this.containerRef.location.nativeElement.remove();
      this.containerRef.destroy();
      this.containerRef = null;
    }
  }

  /** Suspends the auto-dismiss timer of a toast (hover). */
  private pause(id: number): void {
    const timer = this.timers.get(id);
    if (!timer || timer.timerId === null) {
      return;
    }
    clearTimeout(timer.timerId);
    timer.timerId = null;
    timer.remaining = Math.max(0, timer.expiresAt - Date.now());
  }

  /** Resumes a paused auto-dismiss timer with the remaining time. */
  private resume(id: number): void {
    const timer = this.timers.get(id);
    if (!timer || timer.remaining === null) {
      return;
    }
    timer.expiresAt = Date.now() + timer.remaining;
    timer.timerId = setTimeout(() => this.dismiss(id), timer.remaining);
    timer.remaining = null;
  }

  private clearTimer(id: number): void {
    const timer = this.timers.get(id);
    if (timer?.timerId !== null && timer?.timerId !== undefined) {
      clearTimeout(timer.timerId);
    }
    this.timers.delete(id);
  }

  /** Creates and attaches the toast container the first time it is needed. */
  private ensureContainer(): void {
    if (this.containerRef) {
      return;
    }
    const host: FfToastHost = {
      toasts: this.toasts,
      dismiss: (id) => this.dismiss(id),
      pause: (id) => this.pause(id),
      resume: (id) => this.resume(id),
    };
    this.containerRef = createComponent(FfToastContainerComponent, {
      environmentInjector: this.environmentInjector,
      elementInjector: Injector.create({
        providers: [{ provide: FF_TOAST_HOST, useValue: host }],
        parent: this.injector,
      }),
    });
    this.appRef.attachView(this.containerRef.hostView);
    this.document.body.appendChild(this.containerRef.location.nativeElement);
  }
}
