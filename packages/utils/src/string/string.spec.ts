import { describe, it, expect } from 'vitest';
import { toKebabCase, toCamelCase, toPascalCase, slugify, truncate, capitalize, escapeHtml } from './index';

describe('toKebabCase', () => {
  it('converts camelCase', () => {
    expect(toKebabCase('myVariableName')).toBe('my-variable-name');
  });

  it('converts PascalCase', () => {
    expect(toKebabCase('MyVariableName')).toBe('my-variable-name');
  });

  it('converts spaces and underscores', () => {
    expect(toKebabCase('hello world_foo')).toBe('hello-world-foo');
  });

  it('returns empty string for empty input', () => {
    expect(toKebabCase('')).toBe('');
  });
});

describe('toCamelCase', () => {
  it('converts kebab-case', () => {
    expect(toCamelCase('my-variable-name')).toBe('myVariableName');
  });

  it('converts snake_case', () => {
    expect(toCamelCase('my_variable_name')).toBe('myVariableName');
  });

  it('converts PascalCase', () => {
    expect(toCamelCase('MyVariable')).toBe('myVariable');
  });

  it('returns empty string for empty input', () => {
    expect(toCamelCase('')).toBe('');
  });
});

describe('toPascalCase', () => {
  it('converts kebab-case', () => {
    expect(toPascalCase('my-variable-name')).toBe('MyVariableName');
  });

  it('converts snake_case', () => {
    expect(toPascalCase('my_variable_name')).toBe('MyVariableName');
  });

  it('converts camelCase', () => {
    expect(toPascalCase('myVariable')).toBe('MyVariable');
  });

  it('returns empty string for empty input', () => {
    expect(toPascalCase('')).toBe('');
  });
});

describe('slugify', () => {
  it('converts basic text', () => {
    expect(slugify('Hello World')).toBe('hello-world');
  });

  it('strips accents', () => {
    expect(slugify('Café con Leche')).toBe('cafe-con-leche');
  });

  it('handles special characters', () => {
    expect(slugify('Price: $100!')).toBe('price-100');
  });

  it('collapses consecutive hyphens', () => {
    expect(slugify('foo---bar')).toBe('foo-bar');
  });

  it('trims leading and trailing hyphens', () => {
    expect(slugify('--hello--')).toBe('hello');
  });

  it('returns empty string for empty input', () => {
    expect(slugify('')).toBe('');
  });
});

describe('truncate', () => {
  it('truncates long strings with default suffix', () => {
    expect(truncate('Hello World', 5)).toBe('Hello...');
  });

  it('returns original string when within limit', () => {
    expect(truncate('Hi', 10)).toBe('Hi');
  });

  it('uses custom suffix', () => {
    expect(truncate('Hello World', 5, '…')).toBe('Hello…');
  });

  it('returns empty string for empty input', () => {
    expect(truncate('', 5)).toBe('');
  });
});

describe('capitalize', () => {
  it('capitalizes first character', () => {
    expect(capitalize('hello')).toBe('Hello');
  });

  it('leaves already capitalized strings unchanged', () => {
    expect(capitalize('Hello')).toBe('Hello');
  });

  it('handles single character', () => {
    expect(capitalize('a')).toBe('A');
  });

  it('returns empty string for empty input', () => {
    expect(capitalize('')).toBe('');
  });
});

describe('escapeHtml', () => {
  it('escapes ampersand', () => {
    expect(escapeHtml('a & b')).toBe('a &amp; b');
  });

  it('escapes angle brackets', () => {
    expect(escapeHtml('<div>')).toBe('&lt;div&gt;');
  });

  it('escapes double quotes', () => {
    expect(escapeHtml('"hello"')).toBe('&quot;hello&quot;');
  });

  it('escapes single quotes', () => {
    expect(escapeHtml("it's")).toBe('it&#39;s');
  });

  it('escapes all characters together', () => {
    expect(escapeHtml('<a href="x">&\'</a>')).toBe('&lt;a href=&quot;x&quot;&gt;&amp;&#39;&lt;/a&gt;');
  });

  it('returns empty string for empty input', () => {
    expect(escapeHtml('')).toBe('');
  });
});
