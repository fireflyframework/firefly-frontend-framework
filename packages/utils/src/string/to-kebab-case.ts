/**
 * Convert a string to kebab-case.
 * Handles camelCase, PascalCase, spaces, and underscores.
 *
 * @example
 * toKebabCase('myVariableName') // => 'my-variable-name'
 */
export function toKebabCase(str: string): string {
  return str
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/([A-Z])([A-Z][a-z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .toLowerCase();
}
