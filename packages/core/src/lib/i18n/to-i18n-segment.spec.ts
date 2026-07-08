import { describe, it, expect } from 'vitest';

import { toI18nSegment } from './to-i18n-segment';

describe('toI18nSegment', () => {
  it('uppercases a single lowercase word', () => {
    expect(toI18nSegment('processing')).toBe('PROCESSING');
  });

  it('splits camelCase boundaries with underscores', () => {
    expect(toI18nSegment('documentTypes')).toBe('DOCUMENT_TYPES');
    expect(toI18nSegment('workflowTemplateId')).toBe('WORKFLOW_TEMPLATE_ID');
  });

  it('inserts a boundary after digits before an uppercase letter', () => {
    expect(toI18nSegment('step1Done')).toBe('STEP1_DONE');
  });

  it('leaves an already upper/segmented value untouched', () => {
    expect(toI18nSegment('PROCESSING')).toBe('PROCESSING');
  });

  it('returns an empty string for an empty input', () => {
    expect(toI18nSegment('')).toBe('');
  });
});
