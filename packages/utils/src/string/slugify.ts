/**
 * Convert a string into a URL-friendly slug.
 * Strips accents, replaces non-alphanumeric characters with hyphens,
 * and collapses consecutive hyphens.
 *
 * @example
 * slugify('Café con Leche!') // => 'cafe-con-leche'
 */
export function slugify(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
