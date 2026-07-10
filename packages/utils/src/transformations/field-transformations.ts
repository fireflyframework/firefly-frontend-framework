/**
 * Identifier of a built-in single-source field transformation. Extend
 * by adding a new literal here and a matching `case` in
 * {@link applyTransformation}. New cases MUST stay pure and total
 * (return some value for every input) so callers never have to guard
 * against `undefined` results.
 */
export type FieldTransformation =
  | 'NONE'
  | 'UPPERCASE'
  | 'LOWERCASE'
  | 'TRIM'
  | 'DATE_FORMAT';

/**
 * Reads a value from a plain object via a dot-separated path
 * (`"issuer.address.city"`). Returns `undefined` when any segment is
 * missing — never throws, so callers can use the return value as a
 * boolean check.
 *
 * Designed for JSON-shaped inputs (string-keyed plain objects); does
 * not walk Maps, class instances or array indices. Wrap your input
 * with `JSON.parse(JSON.stringify(x))` if you need to flatten such
 * shapes first.
 *
 * @param obj the root object to walk
 * @param path dot-separated key path (`a.b.c`). Empty string yields the input.
 * @returns the leaf value, or `undefined` when the path does not resolve.
 *
 * @example
 * readPath({ issuer: { name: 'Acme' } }, 'issuer.name') // → 'Acme'
 * readPath({ issuer: { name: 'Acme' } }, 'issuer.taxId') // → undefined
 */
export function readPath(obj: Record<string, unknown>, path: string): unknown {
  if (path === '') return obj;
  const parts = path.split('.');
  let cur: unknown = obj;
  for (const p of parts) {
    if (cur && typeof cur === 'object' && p in (cur as Record<string, unknown>)) {
      cur = (cur as Record<string, unknown>)[p];
    } else {
      return undefined;
    }
  }
  return cur;
}

/**
 * Applies a {@link FieldTransformation} to a single value.
 *
 * **Total and side-effect free.** `null`/`undefined` pass through
 * untouched so callers can chain freely on optional fields.
 * Non-string inputs to string-only transformations (`UPPERCASE`,
 * `LOWERCASE`, `TRIM`) are returned unchanged rather than coerced —
 * the caller decides whether to stringify first.
 *
 * `DATE_FORMAT` parses the input with `new Date()` and emits the
 * ISO date (`YYYY-MM-DD`). Invalid dates pass through unchanged so a
 * misconfigured mapping is not silently rewritten.
 *
 * @param value the source value (any shape)
 * @param kind the transformation to apply
 * @returns the transformed value, with the same conceptual type when possible.
 *
 * @example
 * applyTransformation('Acme', 'UPPERCASE') // → 'ACME'
 * applyTransformation('  x  ', 'TRIM')     // → 'x'
 * applyTransformation('2026-05-31T12:00:00Z', 'DATE_FORMAT') // → '2026-05-31'
 * applyTransformation(42, 'UPPERCASE')     // → 42 (non-string passthrough)
 * applyTransformation(null, 'UPPERCASE')   // → null
 */
export function applyTransformation(value: unknown, kind: FieldTransformation): unknown {
  if (value === null || value === undefined) return value;
  switch (kind) {
    case 'UPPERCASE':
      return typeof value === 'string' ? value.toUpperCase() : value;
    case 'LOWERCASE':
      return typeof value === 'string' ? value.toLowerCase() : value;
    case 'TRIM':
      return typeof value === 'string' ? value.trim() : value;
    case 'DATE_FORMAT': {
      if (typeof value !== 'string') return value;
      const d = new Date(value);
      return Number.isNaN(d.getTime()) ? value : d.toISOString().slice(0, 10);
    }
    case 'NONE':
    default:
      return value;
  }
}
