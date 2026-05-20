/**
 * Masks a Spanish NIF/NIE/CIF.
 *
 * Keeps the last 3 characters visible.
 *
 * @example
 * ```typescript
 * maskNif('12345678A');  // '******78A'
 * maskNif('X1234567L');  // '******67L'
 * ```
 */
export function maskNif(value: string): string {
  if (!value || value.length < 4) return value ?? '';
  const visible = value.slice(-3);
  const masked = '*'.repeat(value.length - 3);
  return masked + visible;
}

/**
 * Masks a credit/debit card number.
 *
 * Shows only the last 4 digits in standard card format.
 *
 * @example
 * ```typescript
 * maskCard('4111111111111111');  // '**** **** **** 1111'
 * maskCard('4111-1111-1111-1111');  // '**** **** **** 1111'
 * ```
 */
export function maskCard(value: string): string {
  if (!value) return '';
  const digits = value.replace(/\D/g, '');
  if (digits.length < 4) return value;
  const last4 = digits.slice(-4);
  return `**** **** **** ${last4}`;
}

/**
 * Masks a phone number.
 *
 * Keeps the country code prefix and last 3 digits visible.
 *
 * @example
 * ```typescript
 * maskPhone('+34612345678');  // '+34 *** *** 678'
 * maskPhone('612345678');     // '*** *** 678'
 * ```
 */
export function maskPhone(value: string): string {
  if (!value) return '';
  const digits = value.replace(/\D/g, '');
  if (digits.length < 4) return value;

  // Detect country code prefix (starts with + in original value)
  if (value.startsWith('+')) {
    const prefixMatch = value.match(/^\+(\d{1,3})/);
    if (prefixMatch) {
      const prefix = `+${prefixMatch[1]}`;
      const rest = digits.slice(prefixMatch[1].length);
      if (rest.length < 3) return value;
      const last3 = rest.slice(-3);
      const maskedLen = rest.length - 3;
      return `${prefix} ${formatMaskedGroups(maskedLen)} ${last3}`;
    }
  }

  // No country code
  const last3 = digits.slice(-3);
  const maskedLen = digits.length - 3;
  return `${formatMaskedGroups(maskedLen)} ${last3}`;
}

/** Formats masked characters into groups of 3 separated by spaces. */
function formatMaskedGroups(count: number): string {
  const full = Math.floor(count / 3);
  const remainder = count % 3;
  const groups: string[] = [];
  for (let i = 0; i < full; i++) groups.push('***');
  if (remainder > 0) groups.push('*'.repeat(remainder));
  return groups.join(' ');
}

/**
 * Masks an email address.
 *
 * Shows the first character of the local part and the full domain.
 *
 * @example
 * ```typescript
 * maskEmail('user@mail.com');     // 'u***@mail.com'
 * maskEmail('ab@example.org');    // 'a***@example.org'
 * ```
 */
export function maskEmail(value: string): string {
  if (!value) return '';
  const atIndex = value.indexOf('@');
  if (atIndex < 1) return value;
  const local = value.slice(0, atIndex);
  const domain = value.slice(atIndex);
  const firstChar = local[0];
  return `${firstChar}***${domain}`;
}

/**
 * Masks an IBAN (International Bank Account Number).
 *
 * Shows the country code + check digits (first 4) and last 4 characters.
 *
 * @example
 * ```typescript
 * maskIban('ES9121000418450200051332');  // 'ES91 **** **** **** 1332'
 * maskIban('ES91 2100 0418 4502 0005 1332');  // 'ES91 **** **** **** 1332'
 * ```
 */
export function maskIban(value: string): string {
  if (!value) return '';
  const clean = value.replace(/\s/g, '');
  if (clean.length < 8) return value;
  const prefix = clean.slice(0, 4);
  const last4 = clean.slice(-4);
  const middleLen = clean.length - 8;
  // Group middle chars in blocks of 4, each replaced with ****
  const groups = Math.ceil(middleLen / 4);
  const maskedGroups = Array(groups).fill('****').join(' ');
  return `${prefix} ${maskedGroups} ${last4}`;
}
