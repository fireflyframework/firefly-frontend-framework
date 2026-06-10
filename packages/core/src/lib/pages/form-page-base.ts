import { Directive, signal } from '@angular/core';

/** Whether the form creates a new entity or edits an existing one. */
export type FormPageMode = 'create' | 'edit';

/**
 * Base directive for create / edit form pages. Owns the submit
 * lifecycle: in-flight flag, error capture, idempotent submit handler
 * and default cancel navigation. The concrete page owns:
 *
 * - The form instance (Signal Forms or ReactiveForms via `toSignal`).
 * - The {@link save} call that hits the backend.
 * - The {@link readFormValue} extractor that produces the typed payload.
 * - The {@link onSubmitSuccess} navigation after a successful save.
 *
 * See firefly-docs/reference/standard-page-bases.md §2.3 and
 * standard-page-layouts.md §3.3 for the doctrine.
 */
@Directive()
export abstract class FormPageBase<T, F> {
  /** Mode. Subclass exposes this as input or derives it from the route. */
  protected abstract mode(): FormPageMode;

  /** The form. Use Signal Forms (v22) or ReactiveForms (v21). */
  protected abstract form: F;

  /** True while a submission is in flight. */
  protected readonly isSubmitting = signal(false);

  /** Last submission error, or `null` when in a good state. */
  protected readonly submitError = signal<Error | null>(null);

  /** Hit the backend with the form value; resolve with the saved entity. */
  protected abstract save(value: unknown): Promise<T>;

  /** Navigation after a successful submit. */
  protected abstract onSubmitSuccess(saved: T): void;

  /** Read the typed payload out of {@link form}. */
  protected abstract readFormValue(): unknown;

  /** Default cancel navigation. Subclass overrides if non-trivial. */
  protected onCancel(): void {
    history.back();
  }

  /**
   * Public submit handler. Wired to the template's `(ngSubmit)`. Idempotent
   * — re-entry while a submission is in flight is a no-op.
   */
  protected async onSubmit(): Promise<void> {
    if (this.isSubmitting()) return;
    this.isSubmitting.set(true);
    this.submitError.set(null);
    try {
      const saved = await this.save(this.readFormValue());
      this.onSubmitSuccess(saved);
    } catch (err) {
      this.submitError.set(err instanceof Error ? err : new Error(String(err)));
    } finally {
      this.isSubmitting.set(false);
    }
  }
}
