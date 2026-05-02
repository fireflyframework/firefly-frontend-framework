import { Injectable, signal } from '@angular/core';
import {
  AlertType,
  Banner,
  BannerOptions,
  Toast,
  ToastOptions,
} from './alert.types';

const DEFAULT_TOAST_DURATION = 3000;
const ERROR_TOAST_DURATION = 5000;
const MAX_VISIBLE_TOASTS = 5;
const MAX_VISIBLE_BANNERS = 3;

/**
 * Headless alert state manager.
 *
 * Manages toast and banner state via signals. Does NOT render UI —
 * the product's design system reads the signals and displays them.
 *
 * This service handles: creation, auto-dismiss timers, dismissal,
 * and capacity limits (maxVisibleToasts / maxVisibleBanners).
 */
@Injectable({ providedIn: 'root' })
export class AlertService {
  private readonly _toasts = signal<Toast[]>([]);
  private readonly _banners = signal<Banner[]>([]);

  /** Active toasts (read-only). Ordered by creation time (FIFO). */
  readonly activeToasts = this._toasts.asReadonly();

  /** Active banners (read-only). Ordered by creation time (FIFO). */
  readonly activeBanners = this._banners.asReadonly();

  private readonly timers = new Map<string, ReturnType<typeof setTimeout>>();
  private nextId = 0;

  /**
   * Show a toast notification.
   * Auto-dismisses after `options.duration` (default 3000ms, error 5000ms).
   */
  toast(message: string, type: AlertType, options?: ToastOptions): void {
    const id = this.generateId();
    const duration =
      options?.duration ??
      (type === 'error' ? ERROR_TOAST_DURATION : DEFAULT_TOAST_DURATION);

    const entry: Toast = {
      id,
      message,
      type,
      options: options ?? {},
      createdAt: Date.now(),
    };

    this._toasts.update((current) => {
      const updated = [...current, entry];
      while (updated.length > MAX_VISIBLE_TOASTS) {
        const removed = updated.shift()!;
        this.clearTimer(removed.id);
      }
      return updated;
    });

    this.timers.set(id, setTimeout(() => this.dismiss(id), duration));
  }

  /**
   * Show a banner.
   * If `options.duration` is set, auto-dismisses. Otherwise persists until `dismissBanner()`.
   */
  banner(message: string, type: AlertType, options?: BannerOptions): void {
    const id = this.generateId();
    const entry: Banner = {
      id,
      message,
      type,
      options: options ?? {},
      createdAt: Date.now(),
    };

    this._banners.update((current) => {
      const updated = [...current, entry];
      while (updated.length > MAX_VISIBLE_BANNERS) {
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

  /** Dismiss a specific toast by ID. */
  dismiss(id: string): void {
    this._toasts.update((current) => current.filter((t) => t.id !== id));
    this.clearTimer(id);
  }

  /** Dismiss a specific banner by ID. */
  dismissBanner(id: string): void {
    this._banners.update((current) => current.filter((b) => b.id !== id));
    this.clearTimer(id);
  }

  /** Dismiss all toasts and banners. Clears all pending timers. */
  dismissAll(): void {
    this.timers.forEach((timer) => clearTimeout(timer));
    this.timers.clear();
    this._toasts.set([]);
    this._banners.set([]);
  }

  private generateId(): string {
    return `alert-${++this.nextId}`;
  }

  private clearTimer(id: string): void {
    const timer = this.timers.get(id);
    if (timer !== undefined) {
      clearTimeout(timer);
      this.timers.delete(id);
    }
  }
}
