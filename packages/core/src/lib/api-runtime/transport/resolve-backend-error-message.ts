import { HttpErrorResponse } from '@angular/common/http';

import { TransportError } from './transport-error';

/**
 * Maps a backend root-cause `code` to an i18n key. Backends commonly wrap the
 * real cause several levels deep and stringify it inside `detail` (e.g.
 * `"Invalid request: {…UNIQUE_CONSTRAINT_VIOLATION…}"`), so a known code is a
 * far better signal than the raw `detail`.
 *
 * The contract is product-specific — pass your own map, e.g.
 * `{ UNIQUE_CONSTRAINT_VIOLATION: 'ERRORS.UNIQUE_CONSTRAINT' }`.
 */
export type BackendCodeKeys = Readonly<Record<string, string>>;

/** Longest `detail` still treated as human copy rather than a serialized blob. */
const MAX_HUMAN_MESSAGE_LENGTH = 200;

/**
 * A `detail` is only shown verbatim when it reads as a human sentence — never
 * when it is (or embeds) a serialized error envelope. Guards against dumping
 * raw JSON into a toast.
 */
function isHumanMessage(text: string): boolean {
  const trimmed = text.trim();
  return (
    trimmed.length > 0 &&
    trimmed.length <= MAX_HUMAN_MESSAGE_LENGTH &&
    !trimmed.includes('{') &&
    !trimmed.includes('"type":') &&
    !/^invalid request/i.test(trimmed)
  );
}

/** `JSON.stringify` that never throws (circular refs → empty haystack). */
function safeStringify(value: unknown): string {
  try {
    return JSON.stringify(value) ?? '';
  } catch {
    return '';
  }
}

/** Unwraps the `HttpErrorResponse` a `TransportError` may be carrying. */
function httpResponseOf(err: unknown): HttpErrorResponse | null {
  if (err instanceof TransportError && err.originalError instanceof HttpErrorResponse) {
    return err.originalError;
  }
  return err instanceof HttpErrorResponse ? err : null;
}

/**
 * Extracts the most specific human-readable message from a failed backend
 * call, trying the richest sources first:
 *
 *  1. a **known root-cause `code`** anywhere in the error envelope (a substring
 *     match on the serialized body is robust against the nesting backends
 *     apply) → its i18n key from `codeKeys`;
 *  2. the HTTP body's `detail` / `message` / `error`, **only when it reads as a
 *     human sentence** — never a raw JSON envelope;
 *  3. the HTTP status line (`"412 Precondition Failed"`) when the body is empty
 *     but the response carries a real status;
 *  4. `Error.message` for plain thrown errors (same human-sentence guard);
 *  5. the caller-supplied `fallbackKey`.
 *
 * A non-empty but non-human body (a JSON envelope with no known code) is worse
 * than the friendly fallback, so it skips straight to step 5 rather than
 * surfacing `"400 Bad Request"`.
 *
 * The return value is either a resolved backend message or an i18n key — route
 * it through `I18nService.translate(...)`, which passes unknown keys through
 * untouched, so a genuine backend sentence survives the call.
 *
 * @param err The rejected value from the transport layer.
 * @param fallbackKey i18n key used when nothing better can be extracted.
 * @param codeKeys Product's backend-code → i18n-key contract. See
 *   {@link BackendCodeKeys}.
 */
export function resolveBackendErrorMessage(
  err: unknown,
  fallbackKey: string,
  codeKeys: BackendCodeKeys = {},
): string {
  const response = httpResponseOf(err);

  if (response) {
    const body = response.error as
      | { detail?: unknown; message?: unknown; error?: unknown }
      | string
      | null
      | undefined;

    // 1. Known root-cause code wins over the (often JSON-blob) detail.
    const haystack = typeof body === 'string' ? body : safeStringify(body);
    for (const [code, key] of Object.entries(codeKeys)) {
      if (haystack.includes(code)) return key;
    }

    // 2. A human-readable detail / message / error, never a JSON envelope.
    if (typeof body === 'string' && isHumanMessage(body)) return body.trim();
    if (body && typeof body === 'object') {
      const detail = body.detail ?? body.message ?? body.error;
      if (typeof detail === 'string' && isHumanMessage(detail)) return detail.trim();
    }

    // 3. Status line — ONLY when the body is empty.
    const bodyIsEmpty = body == null || (typeof body === 'string' && body.trim().length === 0);
    if (bodyIsEmpty && response.statusText && response.status > 0) {
      return `${response.status} ${response.statusText}`;
    }
  }

  // 4. Plain thrown Error. A TransportError is excluded explicitly: its own
  // `message` is a generic wrapper ("Request failed"), never user copy, and a
  // `!response` guard alone would let a TransportError carrying no
  // `originalError` leak that wrapper into a toast.
  if (!(err instanceof TransportError) && err instanceof Error && isHumanMessage(err.message)) {
    return err.message.trim();
  }

  return fallbackKey;
}

/**
 * True when the raw technical text of a backend error (its `Error.message` plus
 * the serialized HTTP body) contains ANY of the given needles
 * (case-insensitive). For a caller that wants a **field-specific** message
 * ("that email is already taken") to win over the generic
 * {@link resolveBackendErrorMessage} copy: probe the constraint/code footprint
 * first, and only fall back to the generic resolver otherwise.
 *
 * The raw text is NEVER shown to the user — this only decides which i18n key to
 * translate.
 */
export function backendErrorMatches(err: unknown, ...needles: readonly string[]): boolean {
  const parts: string[] = [];
  if (err instanceof Error && err.message) parts.push(err.message);

  const response = httpResponseOf(err);
  if (response) {
    parts.push(typeof response.error === 'string' ? response.error : safeStringify(response.error));
  }

  const haystack = parts.join(' ').toLowerCase();
  return needles.some((needle) => haystack.includes(needle.toLowerCase()));
}
