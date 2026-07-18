import { inject, Injectable, signal } from '@angular/core';
import {
  AlertFormat,
  AlertType,
  Banner,
  BannerOptions,
  BottomSheet,
  BottomSheetOptions,
  Dialog,
  DialogOptions,
  DialogResult,
  Toast,
  ToastOptions,
} from './alert.types';
import { ALERT_CONFIG } from './provide-alerts';

const DEFAULT_TOAST_DURATION = 3000;
const ERROR_TOAST_DURATION = 5000;
const MAX_VISIBLE_TOASTS = 5;
const MAX_VISIBLE_BANNERS = 3;

/**
 * Headless alert state manager.
 *
 * Provides the **mechanics** of user feedback: creation, auto-dismiss,
 * capacity limits, and Promise-based dialogs. The **rendering** is
 * the product's responsibility — read the signals and display them
 * using your design system components.
 *
 * Supports 4 presentation formats (toast, banner, bottom-sheet, dialog)
 * and 6 semantic types (success, error, warning, info, destructive, custom).
 *
 * @example
 * ```typescript
 * // Inject in a component or service
 * private alerts = inject(AlertService);
 *
 * // Fire-and-forget
 * this.alerts.success('Item saved');
 * this.alerts.error('Upload failed');
 * this.alerts.banner('Scheduled maintenance at 2am', 'warning');
 *
 * // Promise-based dialog
 * const result = await this.alerts.dialog({
 *   type: 'destructive',
 *   title: 'Delete account?',
 *   message: 'This action cannot be undone.',
 *   confirmLabel: 'Delete',
 *   cancelLabel: 'Cancel',
 * });
 *
 * // Simplified confirm
 * if (await this.alerts.confirm('Discard changes?')) { ... }
 *
 * // Read signals in template (via the UI layer)
 * // @for (toast of alerts.activeToasts(); track toast.id) { ... }
 * ```
 */
@Injectable()
export class AlertService {
  private readonly _toasts = signal<Toast[]>([]);
  private readonly _banners = signal<Banner[]>([]);
  private readonly _bottomSheets = signal<BottomSheet[]>([]);
  private readonly _dialogs = signal<Dialog[]>([]);

  /** Active toasts (read-only). Ordered by creation time (FIFO). */
  readonly activeToasts = this._toasts.asReadonly();

  /** Active banners (read-only). Ordered by creation time (FIFO). */
  readonly activeBanners = this._banners.asReadonly();

  /** Active bottom-sheets (read-only). */
  readonly activeBottomSheets = this._bottomSheets.asReadonly();

  /** Active dialogs (read-only). */
  readonly activeDialogs = this._dialogs.asReadonly();

  private readonly config = inject(ALERT_CONFIG, { optional: true });
  private readonly timers = new Map<string, ReturnType<typeof setTimeout>>();
  /** Arming metadata per toast timer, used to compute remaining time on pause. */
  private readonly timerMeta = new Map<
    string,
    { armedAt: number; duration: number }
  >();
  /** Paused toasts and the remaining auto-dismiss time to re-arm on resume. */
  private readonly pausedToasts = new Map<string, { remaining: number }>();
  private readonly dialogResolvers = new Map<
    string,
    (result: DialogResult) => void
  >();
  private nextId = 0;

  // ---------------------------------------------------------------
  // Toast
  // ---------------------------------------------------------------

  /**
   * Show a toast notification.
   * Auto-dismisses after `options.duration` (default 3000ms, error 5000ms).
   *
   * @param message - Text to display in the toast
   * @param type - Semantic alert type (success, error, warning, info, destructive, custom)
   * @param options - Optional configuration (duration, position, icon, custom component)
   */
  toast(message: string, type: AlertType, options?: ToastOptions): void {
    const id = this.generateId();
    const defaultDuration = this.config?.defaultToastDuration ?? DEFAULT_TOAST_DURATION;
    const duration =
      options?.duration ??
      (type === 'error' ? ERROR_TOAST_DURATION : defaultDuration);
    const maxToasts = this.config?.maxVisibleToasts ?? MAX_VISIBLE_TOASTS;

    const entry: Toast = {
      id,
      message,
      type,
      options: {
        ...options,
        position: options?.position ?? this.config?.defaultToastPosition,
      },
      createdAt: Date.now(),
    };

    this._toasts.update((current) => {
      const updated = [...current, entry];
      while (updated.length > maxToasts) {
        const removed = updated.shift()!;
        this.clearTimer(removed.id);
      }
      return updated;
    });

    this.armToastTimer(id, duration);
  }

  /**
   * Pause the auto-dismiss timer of a toast.
   * The remaining time is preserved and re-armed on `resumeToast()`.
   *
   * Safe no-op when the ID does not exist, has no active timer,
   * or is already paused.
   *
   * @param id - Toast identifier from `activeToasts` signal
   *
   * @example
   * ```typescript
   * // UI layer: freeze auto-close while the user hovers the toast
   * onMouseEnter(toast: Toast): void {
   *   this.alerts.pauseToast(toast.id);
   * }
   * ```
   */
  pauseToast(id: string): void {
    if (this.pausedToasts.has(id)) {
      return;
    }
    const meta = this.timerMeta.get(id);
    const timer = this.timers.get(id);
    if (meta === undefined || timer === undefined) {
      return;
    }

    const elapsed = Date.now() - meta.armedAt;
    const remaining = Math.max(0, meta.duration - elapsed);

    clearTimeout(timer);
    this.timers.delete(id);
    this.timerMeta.delete(id);
    this.pausedToasts.set(id, { remaining });
  }

  /**
   * Resume the auto-dismiss timer of a previously paused toast.
   * Re-arms the timeout with the remaining time saved by `pauseToast()`.
   *
   * Safe no-op when the ID does not exist or was not paused.
   *
   * @param id - Toast identifier from `activeToasts` signal
   *
   * @example
   * ```typescript
   * // UI layer: restart the countdown when the user stops hovering
   * onMouseLeave(toast: Toast): void {
   *   this.alerts.resumeToast(toast.id);
   * }
   * ```
   */
  resumeToast(id: string): void {
    const paused = this.pausedToasts.get(id);
    if (paused === undefined) {
      return;
    }
    this.pausedToasts.delete(id);
    this.armToastTimer(id, paused.remaining);
  }

  // ---------------------------------------------------------------
  // Banner
  // ---------------------------------------------------------------

  /**
   * Show a banner.
   * If `options.duration` is set, auto-dismisses. Otherwise persists until `dismissBanner()`.
   *
   * @param message - Text to display in the banner
   * @param type - Semantic alert type
   * @param options - Optional configuration (position, duration, action button, icon)
   */
  banner(message: string, type: AlertType, options?: BannerOptions): void {
    const id = this.generateId();
    const maxBanners = this.config?.maxVisibleBanners ?? MAX_VISIBLE_BANNERS;
    const entry: Banner = {
      id,
      message,
      type,
      options: {
        ...options,
        position: options?.position ?? this.config?.defaultBannerPosition,
      },
      createdAt: Date.now(),
    };

    this._banners.update((current) => {
      const updated = [...current, entry];
      while (updated.length > maxBanners) {
        const removed = updated.shift()!;
        this.clearTimer(removed.id);
      }
      return updated;
    });

    if (options?.duration) {
      this.timers.set(
        id,
        setTimeout(() => this.dismissBanner(id), options.duration),
      );
    }
  }

  // ---------------------------------------------------------------
  // Bottom-sheet
  // ---------------------------------------------------------------

  /**
   * Show a bottom-sheet. Persists until `dismissBottomSheet()`.
   *
   * @param message - Text to display in the bottom-sheet
   * @param type - Semantic alert type
   * @param options - Optional configuration (title, actions, swipe-to-dismiss)
   */
  bottomSheet(
    message: string,
    type: AlertType,
    options?: BottomSheetOptions,
  ): void {
    const id = this.generateId();
    const entry: BottomSheet = {
      id,
      message,
      type,
      options: options ?? {},
      createdAt: Date.now(),
    };

    this._bottomSheets.update((current) => [...current, entry]);
  }

  // ---------------------------------------------------------------
  // Dialog (Promise-based)
  // ---------------------------------------------------------------

  /**
   * Open a dialog. Returns a Promise that resolves when the UI calls
   * `resolveDialog(id, result)`.
   *
   * @param options - Dialog configuration (type, title, message, labels, destructiveConfirmText)
   * @returns Promise that resolves with `DialogResult` when the user confirms or cancels
   */
  dialog(options: DialogOptions): Promise<DialogResult> {
    const id = this.generateId();

    const promise = new Promise<DialogResult>((resolve) => {
      this.dialogResolvers.set(id, resolve);
    });

    const entry: Dialog = {
      id,
      options,
      createdAt: Date.now(),
    };

    this._dialogs.update((current) => [...current, entry]);

    return promise;
  }

  /**
   * Resolve a pending dialog. Called by the UI layer when the user
   * confirms or cancels. Removes the dialog from the active list.
   *
   * @param id - Dialog identifier from `activeDialogs` signal
   * @param result - Outcome with `confirmed` flag and optional `input` text
   */
  resolveDialog(id: string, result: DialogResult): void {
    const resolve = this.dialogResolvers.get(id);
    if (resolve) {
      resolve(result);
      this.dialogResolvers.delete(id);
    }
    this._dialogs.update((current) => current.filter((d) => d.id !== id));
  }

  // ---------------------------------------------------------------
  // Convenience shortcuts
  // ---------------------------------------------------------------

  /**
   * Show a success alert. Default format: toast.
   *
   * @param message - Text to display
   * @param format - Presentation format (toast, banner, bottom-sheet, dialog). Default: toast
   */
  success(message: string, format?: AlertFormat): void {
    this.shortcut(message, 'success', format);
  }

  /**
   * Show an error alert. Default format: toast (5000ms).
   *
   * @param message - Text to display
   * @param format - Presentation format. Default: toast
   */
  error(message: string, format?: AlertFormat): void {
    this.shortcut(message, 'error', format);
  }

  /**
   * Show a warning alert. Default format: toast.
   *
   * @param message - Text to display
   * @param format - Presentation format. Default: toast
   */
  warning(message: string, format?: AlertFormat): void {
    this.shortcut(message, 'warning', format);
  }

  /**
   * Show an info alert. Default format: toast.
   *
   * @param message - Text to display
   * @param format - Presentation format. Default: toast
   */
  info(message: string, format?: AlertFormat): void {
    this.shortcut(message, 'info', format);
  }

  /**
   * Show a confirmation dialog. Returns `true` if confirmed, `false` if cancelled.
   *
   * @param message - Question or statement to confirm
   * @param options - Optional overrides for dialog configuration (type, labels)
   * @returns Promise that resolves to `true` if confirmed, `false` if cancelled
   */
  confirm(
    message: string,
    options?: Partial<DialogOptions>,
  ): Promise<boolean> {
    return this.dialog({
      type: 'info',
      message,
      confirmLabel: 'Confirm',
      cancelLabel: 'Cancel',
      ...options,
    }).then((result) => result.confirmed);
  }

  // ---------------------------------------------------------------
  // Dismiss
  // ---------------------------------------------------------------

  /**
   * Dismiss a specific toast by ID.
   *
   * @param id - Toast identifier from `activeToasts` signal
   */
  dismiss(id: string): void {
    this._toasts.update((current) => current.filter((t) => t.id !== id));
    this.clearTimer(id);
  }

  /**
   * Dismiss a specific banner by ID.
   *
   * @param id - Banner identifier from `activeBanners` signal
   */
  dismissBanner(id: string): void {
    this._banners.update((current) => current.filter((b) => b.id !== id));
    this.clearTimer(id);
  }

  /**
   * Dismiss a specific bottom-sheet by ID.
   *
   * @param id - Bottom-sheet identifier from `activeBottomSheets` signal
   */
  dismissBottomSheet(id: string): void {
    this._bottomSheets.update((current) =>
      current.filter((bs) => bs.id !== id),
    );
  }

  /** Dismiss all alerts. Clears timers and resolves pending dialogs as cancelled. */
  dismissAll(): void {
    this.timers.forEach((timer) => clearTimeout(timer));
    this.timers.clear();
    this.timerMeta.clear();
    this.pausedToasts.clear();
    this._toasts.set([]);
    this._banners.set([]);
    this._bottomSheets.set([]);

    // Resolve pending dialogs as cancelled
    this.dialogResolvers.forEach((resolve) =>
      resolve({ confirmed: false }),
    );
    this.dialogResolvers.clear();
    this._dialogs.set([]);
  }

  // ---------------------------------------------------------------
  // Internal
  // ---------------------------------------------------------------

  /**
   * Route a convenience shortcut to the appropriate format method.
   *
   * @param message - Text to display
   * @param type - Semantic alert type
   * @param format - Presentation format. Default: toast
   */
  private shortcut(
    message: string,
    type: AlertType,
    format: AlertFormat = 'toast',
  ): void {
    switch (format) {
      case 'toast':
        this.toast(message, type);
        break;
      case 'banner':
        this.banner(message, type);
        break;
      case 'bottom-sheet':
        this.bottomSheet(message, type);
        break;
      case 'dialog':
        // Fire-and-forget — caller uses dialog() directly if they need the result
        this.dialog({ message, type });
        break;
    }
  }

  /** Generate a unique alert identifier. */
  private generateId(): string {
    return `alert-${++this.nextId}`;
  }

  /**
   * Arm (or re-arm) the auto-dismiss timer of a toast, recording the
   * arming timestamp so `pauseToast()` can compute the remaining time.
   *
   * @param id - Toast identifier
   * @param duration - Time in ms until auto-dismiss
   */
  private armToastTimer(id: string, duration: number): void {
    this.timerMeta.set(id, { armedAt: Date.now(), duration });
    this.timers.set(id, setTimeout(() => this.dismiss(id), duration));
  }

  /**
   * Clear and remove an auto-dismiss timer, along with any arming
   * metadata or pause state associated with the alert.
   *
   * @param id - Alert identifier whose timer should be cleared
   */
  private clearTimer(id: string): void {
    const timer = this.timers.get(id);
    if (timer !== undefined) {
      clearTimeout(timer);
      this.timers.delete(id);
    }
    this.timerMeta.delete(id);
    this.pausedToasts.delete(id);
  }
}
