/**
 * Identity fragments the initials can be derived from, in preference order:
 * explicit first+last name, a single first/last name, a full display name,
 * and finally the email local-part.
 */
export interface InitialsSource {
  readonly firstName?: string | null;
  readonly lastName?: string | null;
  readonly name?: string | null;
  readonly email?: string | null;
}

/**
 * Up-to-two-letter initials from whatever identity fragments are available:
 *
 *  - `firstName` + `lastName` → one letter each (`"María" + "García"` → `"MG"`)
 *  - a single `firstName`/`lastName` → its first two letters (`"María"` → `"MA"`)
 *  - `name` → first letter of up to two words (`"María García"` → `"MG"`,
 *    `"Luis"` → `"L"`)
 *  - `email` → first two letters of the local-part (`"ana@x.io"` → `"AN"`)
 *  - nothing usable → `fallback` (default `"??"`).
 *
 * TS-side core of `FfInitialsPipe`, so view-model builders and avatar
 * components can derive initials without instantiating the pipe.
 */
export function initialsFrom(source: InitialsSource, fallback = '??'): string {
  const first = (source.firstName ?? '').trim();
  const last = (source.lastName ?? '').trim();
  if (first && last) return (first[0] + last[0]).toUpperCase();
  const single = first || last;
  if (single) return single.slice(0, 2).toUpperCase();

  const name = (source.name ?? '').trim();
  if (name) {
    return name
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join('');
  }

  const email = (source.email ?? '').trim();
  const local = email.split('@')[0] ?? '';
  if (local) return local.slice(0, 2).toUpperCase();

  return fallback;
}
