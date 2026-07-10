/**
 * Converts a runtime identifier (`documentTypes`, `processing`) into an
 * UPPER_SNAKE_CASE i18n key segment (`DOCUMENT_TYPES`, `PROCESSING`),
 * honouring the framework's i18n key convention. Use it when building
 * translation keys dynamically from camelCase identifiers.
 *
 * @example
 * toI18nSegment('documentTypes')  // => 'DOCUMENT_TYPES'
 * toI18nSegment('processing')     // => 'PROCESSING'
 */
export function toI18nSegment(value: string): string {
  return value.replace(/(?<=[a-z0-9])(?=[A-Z])/g, '_').toUpperCase();
}
