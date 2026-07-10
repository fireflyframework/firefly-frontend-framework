import { describe, expect, it } from 'vitest';

import { bumpVersion, nextVersion, parseVersion } from './semver';

describe('parseVersion', () => {
  it('parses 1–3 dotted-numeric components, padding with 0', () => {
    expect(parseVersion('1.2.3')).toEqual({ major: 1, minor: 2, patch: 3 });
    expect(parseVersion('  10.0.42 ')).toEqual({ major: 10, minor: 0, patch: 42 });
    expect(parseVersion('2.0')).toEqual({ major: 2, minor: 0, patch: 0 });
    expect(parseVersion('2')).toEqual({ major: 2, minor: 0, patch: 0 });
  });

  it('returns null for non-dotted-numeric versions', () => {
    expect(parseVersion('v1.2')).toBeNull();
    expect(parseVersion('draft')).toBeNull();
    expect(parseVersion('')).toBeNull();
    expect(parseVersion(undefined)).toBeNull();
  });
});

describe('bumpVersion', () => {
  it('bumps each level resetting lower components', () => {
    expect(bumpVersion('1.2.3', 'major')).toBe('2.0.0');
    expect(bumpVersion('1.2.3', 'minor')).toBe('1.3.0');
    expect(bumpVersion('1.2.3', 'patch')).toBe('1.2.4');
  });

  it('returns null for non-semver', () => {
    expect(bumpVersion('v2', 'patch')).toBeNull();
    expect(bumpVersion('', 'major')).toBeNull();
  });
});

describe('nextVersion', () => {
  it('patch-bumps strict semver', () => {
    expect(nextVersion('1.2.3')).toBe('1.2.4');
  });

  it('patch-bumps dotted-numeric 2-part versions (padded)', () => {
    // '2.0' parses as 2.0.0 → patch bump → 2.0.1
    expect(nextVersion('2.0')).toBe('2.0.1');
    expect(nextVersion('1.0')).toBe('1.0.1');
  });

  it('increments a trailing integer for non-dotted-numeric versions', () => {
    expect(nextVersion('v2')).toBe('v3');
    expect(nextVersion('draft-7')).toBe('draft-8');
  });

  it('appends .1 when there is no trailing digit', () => {
    expect(nextVersion('alpha')).toBe('alpha.1');
  });

  it('defaults empty/undefined to 0.0.1', () => {
    expect(nextVersion('')).toBe('0.0.1');
    expect(nextVersion(undefined)).toBe('0.0.1');
    expect(nextVersion('   ')).toBe('0.0.1');
  });
});
