/**
 * One button of a confirmation. `variant` is an **open string** on purpose: the
 * confirm primitive only forwards it — it is the *dialog* (a product concern)
 * that decides what each variant means (which button variant, whether to tint
 * it as destructive, …). The confirmable is never aware of the styling.
 */
export interface ConfirmButton {
  /** Button label — i18n key (or literal). */
  label?: string;
  /** Presentation hint, interpreted by the dialog (e.g. 'primary' | 'danger' | …). */
  variant?: string;
}

/**
 * What a confirmation needs, semantically — the confirm primitive understands
 * only this. Button appearance is carried opaquely in {@link ConfirmButton}.
 *
 * `title`, `message` and button `label`s are **i18n keys**: the
 * {@link ConfirmService} implementation resolves them (with `params`
 * interpolation) before the dialog renders. A non-key literal passes through
 * unchanged, so hand-written strings still work.
 */
export interface ConfirmOptions {
  /** Dialog heading — i18n key (or literal). */
  title: string;
  /** Body copy — i18n key (or literal). */
  message: string;
  /** Confirm (proceed) button. */
  confirm?: ConfirmButton;
  /** Cancel (dismiss) button. */
  cancel?: ConfirmButton;
  /** Interpolation params shared by the translated title / message / labels. */
  params?: Record<string, unknown>;
  /**
   * Optional icon shown next to the title (e.g. `'trash'`, `'warning'`).
   * Resolved against the product icon registry. Visual emphasis is a dialog
   * concern; the confirm primitive only forwards the key.
   */
  icon?: string;
  /**
   * The word the user must type before the confirm button enables — an i18n key
   * or a literal, resolved like the rest.
   *
   * Reserve it for destruction that another actor depends on and that cannot be
   * undone. **Reversible** actions — archive, deactivate, discard a draft — take
   * the plain confirm. The gate scales to the blast radius; a word demanded for
   * a harmless action is the same noise as a warning nobody reads.
   */
  requireTypedWord?: string;
}

/**
 * Decorator / directive configuration. Every field is either a literal or a
 * function of the guarded call's arguments, so the dialog can name the entity:
 * `message: (id) => \`Delete ${id}?\``. For the directive the args list is empty.
 */
export type ConfirmConfig<A extends readonly unknown[] = readonly unknown[]> = {
  [K in keyof ConfirmOptions]: ConfirmOptions[K] | ((...args: A) => ConfirmOptions[K]);
};

/**
 * Resolve a {@link ConfirmConfig} (literals or arg-functions) into flat
 * {@link ConfirmOptions}.
 */
export function resolveConfirmConfig<A extends readonly unknown[]>(
  config: ConfirmConfig<A>,
  args: A,
): ConfirmOptions {
  const resolved = {} as Record<string, unknown>;
  for (const key of Object.keys(config) as (keyof ConfirmOptions)[]) {
    const value = config[key];
    resolved[key] = typeof value === 'function' ? (value as (...a: A) => unknown)(...args) : value;
  }
  return resolved as unknown as ConfirmOptions;
}

/**
 * What `@Confirm` / `[ffConfirm]` accept: either a per-field
 * {@link ConfirmConfig}, or a **function of the call args producing full
 * options** — which is how a product's confirm template is applied, e.g.
 * `(id) => confirmTemplates.delete(id)`.
 */
export type ConfirmInput<A extends readonly unknown[] = readonly unknown[]> =
  | ConfirmConfig<A>
  | ((...args: A) => ConfirmOptions);

/** Resolve a {@link ConfirmInput} (config object or template function) against the call args. */
export function resolveConfirmInput<A extends readonly unknown[]>(
  input: ConfirmInput<A>,
  args: A,
): ConfirmOptions {
  return typeof input === 'function' ? input(...args) : resolveConfirmConfig(input, args);
}
