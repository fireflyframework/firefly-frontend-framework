import { Directive, inject, input, output } from '@angular/core';

import { AlertService } from '../alert.service';
import { ConfirmService } from './confirm.service';
import { resolveConfirmInput, type ConfirmInput, type ConfirmOptions } from './confirm.types';

/**
 * Confirmation guard on a trigger element — the Angular-native counterpart to
 * `@Confirm` (plain DI, no signature change, trivially testable). Intercepts the
 * host click, shows the confirmation, and emits `ffConfirmed` ONLY if the user
 * confirms.
 *
 * The confirmation goes through {@link AlertService.confirm} by default —
 * `provideAlerts()` plus a dialog presenter in the UI layer is all it needs.
 * If the application binds a custom {@link ConfirmService} (deprecated
 * `provideConfirm(Impl)` — a product with its own modal mechanism), that
 * implementation is preferred.
 *
 * Bind the guarded action to `ffConfirmed`, **never** to the host's own click:
 * that one fires before the dialog.
 *
 * ```html
 * <button [ffConfirm]="{ title: 'CONFIRM.DELETE.TITLE', message: 'CONFIRM.DELETE.MESSAGE',
 *                        confirm: { variant: 'danger' } }"
 *         (ffConfirmed)="onDelete(id)">Delete</button>
 * ```
 */
@Directive({
  selector: '[ffConfirm]',
  standalone: true,
  host: {
    '(click)': 'onClick($event)',
  },
})
export class ConfirmDirective {
  /** Legacy port — preferred when a product binds its own implementation. */
  private readonly customConfirm = inject(ConfirmService, { optional: true });
  /** Default confirm path (requires `provideAlerts()`). */
  private readonly alerts = inject(AlertService, { optional: true });

  /** Confirmation input — options, a per-field config, or a template result. */
  readonly ffConfirm = input.required<ConfirmInput<[]>>();

  /** Emitted only after the user confirms — bind the guarded action here. */
  readonly ffConfirmed = output<void>();

  protected async onClick(event: Event): Promise<void> {
    event.preventDefault();
    event.stopImmediatePropagation();
    const ok = await this.confirm(resolveConfirmInput(this.ffConfirm(), []));
    if (ok) this.ffConfirmed.emit();
  }

  /** Routes to the custom ConfirmService when bound, else to AlertService. */
  private confirm(options: ConfirmOptions): Promise<boolean> {
    if (this.customConfirm) {
      return this.customConfirm.confirm(options);
    }
    if (this.alerts) {
      return this.alerts.confirm(options);
    }
    throw new Error(
      '[ffConfirm] requires provideAlerts() (or the deprecated provideConfirm()) in the application providers.',
    );
  }
}
