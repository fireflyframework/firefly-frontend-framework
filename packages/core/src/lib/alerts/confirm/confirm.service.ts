import type { ConfirmOptions } from './confirm.types';

/**
 * The contract `@Confirm` and `[ffConfirm]` consume, and the DI token products
 * bind their own dialog to. It is abstract on purpose: **the dialog is a product
 * concern** — it owns the modal mechanism, the button variants and the icon
 * registry, none of which belong in the framework.
 *
 * An implementation must:
 *
 *  1. resolve the i18n keys in {@link ConfirmOptions} (`title`, `message`,
 *     button `label`s and `requireTypedWord`, interpolating `params`);
 *  2. render a dialog;
 *  3. resolve `true` when the user confirms and `false` on cancel or dismiss —
 *     **never reject**, so a guarded call can `await` it without a try/catch.
 *
 * Bind it with {@link provideConfirm}:
 *
 * ```ts
 * providers: [provideConfirm(HubModalConfirmService)]
 * ```
 */
export abstract class ConfirmService {
  /** Resolves `true` if the user confirms, `false` on cancel / dismiss. */
  abstract confirm(options: ConfirmOptions): Promise<boolean>;
}
