// ─────────────────────────────────────────────────────────────────────────
// ⚠️ PROMOTION SEED — keep aligned with the product copy (BACKLOG_FRAMEWORK FW-024).
// ─────────────────────────────────────────────────────────────────────────
// A behaviourally-identical copy of this decorator lives in the flydocs-idp-studio
// product at `src/app/shared/forms/validates-form.ts`. FOR NOW the two MUST BE KEPT
// ALIGNED (same validation logic: mark touched+dirty, one summary notification,
// sync/async return shapes) until the product consumes this framework version and
// deletes its local copy.
//
// The ONLY intended difference: the framework is HEADLESS (it ships no UI toast of
// its own), so the summary notification is resolved through the injectable
// `FORM_VALIDATION_NOTIFIER` sink instead of importing a concrete toast service.
// The product's local copy calls `ng-hub-ui-toast`'s `ToastService.error()` directly.
//
// This file is NOT yet exported from the public `@fireflyframework/core` index — that
// lands with the promotion PR (declare the `@angular/forms` peer dependency, ship a
// `provideFormValidation()` + notifier wiring + specs, then `nx release`). See
// firefly-frontend-playbook form-validation-rules.md §7 for the doctrine.
// ─────────────────────────────────────────────────────────────────────────

import { InjectionToken, type Injector } from '@angular/core';
import type { AbstractControl, FormArray, FormGroup } from '@angular/forms';

import { I18nService } from '../i18n';

/**
 * Product-supplied sink for the single summary notification shown when a form is
 * submitted while invalid. The framework is headless, so the app wires this to
 * its toast/alert of choice, e.g.
 * `{ provide: FORM_VALIDATION_NOTIFIER, useFactory: () => { const t = inject(ToastService); return (m) => t.error(m); } }`.
 */
export const FORM_VALIDATION_NOTIFIER = new InjectionToken<(message: string) => void>(
  'FORM_VALIDATION_NOTIFIER',
);

// Method decorators have no injection context, so the root injector is captured
// once at bootstrap by `provideFormValidation()` and read here.
let formValidationInjector: Injector | null = null;

/** Wired by `provideFormValidation()` — gives `@validatesForm` access to its services. */
export function setFormValidationInjector(injector: Injector): void {
  formValidationInjector = injector;
}

/** i18n key for the single summary notification shown on an invalid submit attempt. */
export const FORM_VALIDATION_SUMMARY_KEY = 'FORMS.VALIDATION.SUMMARY';

/** Recursively mark a control (and its descendants) dirty. */
function markDeepDirty(control: AbstractControl): void {
  control.markAsDirty();
  const kids = (control as FormGroup | FormArray).controls as
    | Record<string, AbstractControl>
    | AbstractControl[]
    | undefined;
  if (kids) {
    (Array.isArray(kids) ? kids : Object.values(kids)).forEach(markDeepDirty);
  }
}

/**
 * Method decorator for a submit handler on a **non-page** form (a modal, an inline
 * editor — anything that does not extend a page base). Implements the Firefly
 * form-validation gate (form-validation-rules.md §7).
 *
 * On invocation, if the form returned by `getForm(this)` is **invalid**: it marks
 * every control touched + dirty (so the inline errors surface even on never-focused
 * fields), fires **one** summary notification via {@link FORM_VALIDATION_NOTIFIER}
 * ({@link FORM_VALIDATION_SUMMARY_KEY}), and returns **without** running the wrapped
 * method. When **valid**, it calls straight through — so the submit button never
 * needs to be disabled by validity (re-entry is the wrapped method's own idempotency
 * guard).
 *
 * Works for **both synchronous and asynchronous** handlers: the wrapped method's
 * return value passes through unchanged when valid, and the invalid short-circuit
 * mirrors its shape (a resolved `Promise` for an `async` method, `undefined` for a
 * sync one) so `await` / `.then()` callers never break.
 *
 * Requires `provideFormValidation()` (+ a `FORM_VALIDATION_NOTIFIER` binding) in the
 * application providers.
 *
 * @param getForm Selector that returns the `FormGroup` to gate, given the component
 *   instance (`this`).
 */
export function validatesForm<T>(getForm: (self: T) => FormGroup) {
  return function (
    _target: object,
    _propertyKey: string | symbol,
    descriptor: PropertyDescriptor,
  ): PropertyDescriptor {
    const original = descriptor.value as (...args: unknown[]) => unknown;
    const isAsync = original.constructor?.name === 'AsyncFunction';
    descriptor.value = function (this: T, ...args: unknown[]): unknown {
      const form = getForm(this);
      if (form.invalid) {
        form.markAllAsTouched();
        markDeepDirty(form);
        if (!formValidationInjector) {
          throw new Error(
            '@validatesForm requires provideFormValidation() in the application providers.',
          );
        }
        const message = formValidationInjector
          .get(I18nService)
          .translate(FORM_VALIDATION_SUMMARY_KEY);
        formValidationInjector.get(FORM_VALIDATION_NOTIFIER)(message);
        return isAsync ? Promise.resolve() : undefined;
      }
      return original.apply(this, args);
    };
    return descriptor;
  };
}
