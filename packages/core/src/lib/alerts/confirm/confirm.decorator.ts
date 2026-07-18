import type { Injector } from '@angular/core';

import { ConfirmService } from './confirm.service';
import { resolveConfirmInput, type ConfirmInput } from './confirm.types';

// Method decorators have no injection context, so the root injector is captured
// once at bootstrap by `provideConfirm()` and read here. Module-level singleton:
// fine for a single SPA; not SSR / multi-app (use the directive there).
let confirmInjector: Injector | null = null;

/** Wired by {@link provideConfirm} — gives `@Confirm` access to {@link ConfirmService}. */
export function setConfirmInjector(injector: Injector): void {
  confirmInjector = injector;
}

/**
 * Method decorator that guards execution behind a confirmation. The wrapped
 * method runs ONLY if the user confirms; on cancel it resolves to `undefined`
 * without running. The method becomes async (it awaits the dialog).
 *
 * The input may be a ready-made template, or a function of the call arguments so
 * the dialog can name the entity. Both forms are translatable:
 *
 * ```ts
 * // Template (recommended): one constant carries title/message/buttons/variant.
 * @Confirm((type: DocumentType) => confirmTemplates.delete(type.name ?? ''))
 * async deleteType(type: DocumentType) { await this.types.delete(type.id); }
 *
 * // Ad-hoc config: i18n keys, per-field functions, open button variants.
 * @Confirm<[string]>({
 *   title: 'CONFIRM.RETIRE.TITLE',
 *   message: 'CONFIRM.RETIRE.MESSAGE',
 *   confirm: { label: 'CONFIRM.RETIRE.CONFIRM', variant: 'danger' },
 * })
 * async retire(id: string) { await this.types.retire(id); }
 * ```
 *
 * Requires {@link provideConfirm} in the app providers. Prefer
 * `ConfirmDirective` where a template trigger exists: it uses plain DI, works
 * under SSR, and is trivially testable.
 */
export function Confirm<A extends readonly unknown[] = readonly unknown[]>(input: ConfirmInput<A>) {
  return function (
    _target: object,
    _propertyKey: string | symbol,
    descriptor: PropertyDescriptor,
  ): PropertyDescriptor {
    const original = descriptor.value as (...args: A) => unknown;
    descriptor.value = async function (this: unknown, ...args: A): Promise<unknown> {
      if (!confirmInjector) {
        throw new Error('@Confirm requires provideConfirm() in the application providers.');
      }
      const service = confirmInjector.get(ConfirmService);
      const confirmed = await service.confirm(resolveConfirmInput(input, args));
      return confirmed ? original.call(this, ...args) : undefined;
    };
    return descriptor;
  };
}
