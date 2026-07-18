import type { ConfirmOptions } from './confirm.types';

/**
 * Legacy confirm port. `@Confirm` and `[ffConfirm]` now go through
 * `AlertService.confirm(options)` by default; when a product binds its own
 * implementation to this token (via {@link provideConfirm}), that
 * implementation is still preferred — the existing custom-dialog scenario
 * keeps working unchanged.
 *
 * An implementation must:
 *
 *  1. resolve the i18n keys in {@link ConfirmOptions} (`title`, `message`,
 *     button `label`s and `requireTypedWord`, interpolating `params`);
 *  2. render a dialog;
 *  3. resolve `true` when the user confirms and `false` on cancel or dismiss —
 *     **never reject**, so a guarded call can `await` it without a try/catch.
 *
 * @deprecated The confirm lives in `AlertService` — this port is removed in
 * the next minor. The presentation swap point is the dialog container, not the
 * service: products with their own implementation migrate to rendering
 * `AlertService.activeDialogs()` with their own container and resolving via
 * `resolveDialog()`.
 */
export abstract class ConfirmService {
  /** Resolves `true` if the user confirms, `false` on cancel / dismiss. */
  abstract confirm(options: ConfirmOptions): Promise<boolean>;
}
