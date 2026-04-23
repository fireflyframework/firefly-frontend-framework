/**
 * Convert a string to camelCase.
 * Handles kebab-case, snake_case, spaces, and PascalCase.
 *
 * @example
 * toCamelCase('my-variable-name') // => 'myVariableName'
 */
export function toCamelCase(str: string): string {
  return str
    .replace(/[\s_-]+(.)/g, (_, c: string) => c.toUpperCase())
    .replace(/^[A-Z]/, (c) => c.toLowerCase());
}
