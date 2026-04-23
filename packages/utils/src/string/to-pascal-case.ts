/**
 * Convert a string to PascalCase.
 * Handles kebab-case, snake_case, spaces, and camelCase.
 *
 * @example
 * toPascalCase('my-variable-name') // => 'MyVariableName'
 */
export function toPascalCase(str: string): string {
  return str
    .replace(/[\s_-]+(.)/g, (_, c: string) => c.toUpperCase())
    .replace(/^[a-z]/, (c) => c.toUpperCase());
}
