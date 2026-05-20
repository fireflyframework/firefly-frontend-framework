/** Tags considered dangerous — removed entirely by `sanitizeHtml`. */
const DANGEROUS_TAGS = new Set([
  'script', 'iframe', 'object', 'embed', 'applet',
  'form', 'input', 'textarea', 'select', 'button',
  'link', 'style', 'meta', 'base',
]);

/** Regex matching any HTML event-handler attribute (onclick, onerror, etc.). */
const EVENT_ATTR_RE = /\s+on\w+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]*)/gi;

/** Regex matching `javascript:` / `vbscript:` / `data:` URIs in href/src attributes. */
const DANGEROUS_URI_RE = /\s+(href|src|action)\s*=\s*(?:"(?:javascript|vbscript|data):[^"]*"|'(?:javascript|vbscript|data):[^']*')/gi;

/**
 * Sanitises an HTML string by removing dangerous tags, event-handler
 * attributes, and dangerous URI schemes.
 *
 * Safe tags (p, span, div, a, strong, em, etc.) are preserved.
 *
 * @example
 * ```typescript
 * sanitizeHtml('<p>Hello</p><script>alert(1)</script>');
 * // → '<p>Hello</p>'
 * ```
 */
export function sanitizeHtml(input: string): string {
  if (!input) return input ?? '';

  let result = input;

  // 1. Remove dangerous tags and their content
  for (const tag of DANGEROUS_TAGS) {
    const openClose = new RegExp(`<${tag}[^>]*>[\\s\\S]*?</${tag}>`, 'gi');
    const selfClose = new RegExp(`<${tag}[^>]*/?>`, 'gi');
    result = result.replace(openClose, '');
    result = result.replace(selfClose, '');
  }

  // 2. Remove event-handler attributes from remaining tags
  result = result.replace(EVENT_ATTR_RE, '');

  // 3. Remove dangerous URI schemes
  result = result.replace(DANGEROUS_URI_RE, '');

  return result;
}

/** HTML entity map for escaping. */
const ESCAPE_MAP: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#x27;',
};

const ESCAPE_RE = /[&<>"']/g;

/**
 * Escapes HTML special characters to prevent XSS when
 * inserting user content into HTML context.
 *
 * @example
 * ```typescript
 * escapeXss('<script>alert(1)</script>');
 * // → '&lt;script&gt;alert(1)&lt;/script&gt;'
 * ```
 */
export function escapeXss(input: string): string {
  if (!input) return input ?? '';
  return input.replace(ESCAPE_RE, (char) => ESCAPE_MAP[char]);
}

/**
 * Strips ALL HTML tags from a string, returning plain text only.
 *
 * @example
 * ```typescript
 * stripTags('<p>Hello <strong>world</strong></p>');
 * // → 'Hello world'
 * ```
 */
export function stripTags(input: string): string {
  if (!input) return input ?? '';
  return input.replace(/<[^>]*>/g, '');
}
