/** A parsed semantic version. */
export interface ParsedVersion {
  readonly major: number;
  readonly minor: number;
  readonly patch: number;
}

/** The component to bump in {@link bumpVersion}. */
export type BumpLevel = 'major' | 'minor' | 'patch';

const SEMVER_RE = /^(\d+)(?:\.(\d+))?(?:\.(\d+))?$/;

/**
 * Parses a dotted-numeric version with 1–3 components, padding missing
 * components with `0` (`'2'` → `2.0.0`, `'2.0'` → `2.0.0`,
 * `'1.2.3'` → `1.2.3`). This tolerance matters because real templates
 * use 2-part versions (`'2.0'`). Returns `null` when the input is not
 * purely dotted-numeric (`'v1.2'`, `'draft'`, `''`) so callers fall
 * back to {@link nextVersion}'s non-semver handling.
 */
export function parseVersion(version: string | null | undefined): ParsedVersion | null {
  const match = SEMVER_RE.exec((version ?? '').trim());
  if (!match) return null;
  return {
    major: Number(match[1]),
    minor: Number(match[2] ?? 0),
    patch: Number(match[3] ?? 0),
  };
}

/**
 * Bumps a clean semver string at the given level (resetting lower
 * components). Returns `null` when the input is not strict semver so the
 * caller can fall back to {@link nextVersion}.
 *
 * - `major`: `1.2.3` → `2.0.0`
 * - `minor`: `1.2.3` → `1.3.0`
 * - `patch`: `1.2.3` → `1.2.4`
 */
export function bumpVersion(version: string | null | undefined, level: BumpLevel): string | null {
  const parsed = parseVersion(version);
  if (!parsed) return null;
  switch (level) {
    case 'major':
      return `${parsed.major + 1}.0.0`;
    case 'minor':
      return `${parsed.major}.${parsed.minor + 1}.0`;
    case 'patch':
      return `${parsed.major}.${parsed.minor}.${parsed.patch + 1}`;
  }
}

/**
 * Returns the "next" version for duplicate-as-new-version flows.
 *
 * - Strict semver → patch bump (`1.2.3` → `1.2.4`).
 * - Non-semver but ends in a number → increments the trailing number
 *   (`v2` → `v3`, `1.0` → `1.1`, `draft-7` → `draft-8`).
 * - Anything else (empty, no trailing digits) → appends `.1`
 *   (`alpha` → `alpha.1`, `''` → `0.0.1`).
 *
 * Deterministic so callers and tests can rely on the exact output.
 */
export function nextVersion(version: string | null | undefined): string {
  const trimmed = (version ?? '').trim();
  if (trimmed === '') return '0.0.1';

  const bumped = bumpVersion(trimmed, 'patch');
  if (bumped) return bumped;

  // Non-semver: increment a trailing integer if present.
  const trailing = /^(.*?)(\d+)$/.exec(trimmed);
  if (trailing) {
    return `${trailing[1]}${Number(trailing[2]) + 1}`;
  }
  return `${trimmed}.1`;
}
