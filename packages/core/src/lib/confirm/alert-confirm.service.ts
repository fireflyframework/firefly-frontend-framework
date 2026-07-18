import { Injectable, inject } from '@angular/core';

import { AlertService } from '../alerts/alert.service';
import type { AlertType, DialogOptions } from '../alerts/alert.types';
import { I18nService } from '../i18n';
import { ConfirmService } from './confirm.service';
import type { ConfirmOptions } from './confirm.types';

/**
 * Default {@link ConfirmService} implementation backed by core's own headless
 * {@link AlertService}: `confirm()` opens a Promise-based dialog through
 * `AlertService.dialog()` and resolves with the user's answer. The rendering
 * still belongs to the UI layer — mount a dialog presenter (e.g. the design
 * system's `ff-dialog-container`) bound to `alerts.activeDialogs()` /
 * `alerts.resolveDialog()`.
 *
 * Mapping from {@link ConfirmOptions} to {@link DialogOptions}:
 * - `title` / `message` / button `label`s / `requireTypedWord` are resolved
 *   through core's {@link I18nService} (with `params` interpolation) when the
 *   application provides it (`provideI18n()`); otherwise the strings pass
 *   through unchanged, so literal (non-key) copy keeps working. This is the
 *   only i18n mechanism the confirm contract references — no other
 *   integration is attempted.
 * - `requireTypedWord` maps to `destructiveConfirmText` and forces the
 *   `'destructive'` dialog type; otherwise the confirm button `variant`
 *   drives the type (`'danger'`/`'destructive'` → `'destructive'`,
 *   `'warning'` → `'warning'`, anything else → `'info'`).
 * - A missing cancel button still yields a `cancelLabel` (`'Cancel'`): a
 *   confirmation guard must always be cancellable.
 *
 * Honors the contract's no-reject clause: the returned Promise NEVER
 * rejects — any unexpected failure resolves to `false` (the safe answer for
 * a guard).
 *
 * Register it with {@link provideAlertConfirm} (requires `provideAlerts()`):
 *
 * ```ts
 * providers: [provideAlerts(), provideAlertConfirm()]
 * ```
 */
@Injectable()
export class AlertConfirmService extends ConfirmService {
  private readonly alerts = inject(AlertService);
  private readonly i18n = inject(I18nService, { optional: true });

  /** Resolves `true` if the user confirms, `false` on cancel / dismiss. Never rejects. */
  async confirm(options: ConfirmOptions): Promise<boolean> {
    try {
      const result = await this.alerts.dialog(this.toDialogOptions(options));
      return result.confirmed;
    } catch {
      // Contract: never reject — an unexpected failure denies the action.
      return false;
    }
  }

  /** Maps semantic confirm options onto an AlertService dialog. */
  private toDialogOptions(options: ConfirmOptions): DialogOptions {
    return {
      type: this.toDialogType(options),
      title: this.translate(options.title, options.params),
      message: this.translate(options.message, options.params),
      confirmLabel: this.translate(options.confirm?.label, options.params),
      cancelLabel: this.translate(options.cancel?.label, options.params) ?? 'Cancel',
      destructiveConfirmText: this.translate(options.requireTypedWord, options.params),
      icon: options.icon,
    };
  }

  /** Derives the semantic dialog type from the typed-word gate / button variant. */
  private toDialogType(options: ConfirmOptions): AlertType {
    if (options.requireTypedWord !== undefined) {
      return 'destructive';
    }
    switch (options.confirm?.variant) {
      case 'danger':
      case 'destructive':
        return 'destructive';
      case 'warning':
        return 'warning';
      default:
        return 'info';
    }
  }

  /**
   * Resolves an i18n key through {@link I18nService} when available;
   * otherwise (or for non-key literals, which translation leaves untouched)
   * returns the text as-is.
   */
  private translate(
    text: string | undefined,
    params?: Record<string, unknown>
  ): string | undefined {
    if (text === undefined) {
      return undefined;
    }
    return this.i18n?.translate(text, params) ?? text;
  }
}
