import { Directive, inject, input, output } from '@angular/core';

import { ConfirmService } from './confirm.service';
import { resolveConfirmInput, type ConfirmInput } from './confirm.types';

/**
 * Confirmation guard on a trigger element — the Angular-native counterpart to
 * `@Confirm` (plain DI, no signature change, trivially testable). Intercepts the
 * host click, shows the confirmation, and emits `ffConfirmed` ONLY if the user
 * confirms.
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
  private readonly confirmService = inject(ConfirmService);

  /** Confirmation input — options, a per-field config, or a template result. */
  readonly ffConfirm = input.required<ConfirmInput<[]>>();

  /** Emitted only after the user confirms — bind the guarded action here. */
  readonly ffConfirmed = output<void>();

  protected async onClick(event: Event): Promise<void> {
    event.preventDefault();
    event.stopImmediatePropagation();
    const ok = await this.confirmService.confirm(resolveConfirmInput(this.ffConfirm(), []));
    if (ok) this.ffConfirmed.emit();
  }
}
