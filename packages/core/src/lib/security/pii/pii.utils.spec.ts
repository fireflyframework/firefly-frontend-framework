import { maskNif, maskCard, maskPhone, maskEmail, maskIban } from './pii.utils';

describe('PII masking utils', () => {
  // -----------------------------------------------------------------------
  // maskNif
  // -----------------------------------------------------------------------
  describe('maskNif', () => {
    it('should mask a standard NIF keeping last 3 chars', () => {
      // '12345678A' → 9 chars, 9-3=6 asterisks + '78A'
      expect(maskNif('12345678A')).toBe('******78A');
    });

    it('should mask a NIE keeping last 3 chars', () => {
      // 'X1234567L' → 9 chars, 9-3=6 asterisks + '67L'
      expect(maskNif('X1234567L')).toBe('******67L');
    });

    it('should mask a CIF', () => {
      expect(maskNif('B12345678')).toBe('******678');
    });

    it('should return original if less than 4 chars', () => {
      expect(maskNif('AB')).toBe('AB');
    });

    it('should return empty string for empty input', () => {
      expect(maskNif('')).toBe('');
    });

    it('should handle null-like values gracefully', () => {
      expect(maskNif(null as unknown as string)).toBe('');
      expect(maskNif(undefined as unknown as string)).toBe('');
    });
  });

  // -----------------------------------------------------------------------
  // maskCard
  // -----------------------------------------------------------------------
  describe('maskCard', () => {
    it('should mask a 16-digit card number', () => {
      expect(maskCard('4111111111111111')).toBe('**** **** **** 1111');
    });

    it('should mask a card number with dashes', () => {
      expect(maskCard('4111-1111-1111-1111')).toBe('**** **** **** 1111');
    });

    it('should mask a card number with spaces', () => {
      expect(maskCard('4111 1111 1111 1111')).toBe('**** **** **** 1111');
    });

    it('should mask a 15-digit card (Amex)', () => {
      expect(maskCard('378282246310005')).toBe('**** **** **** 0005');
    });

    it('should return original if less than 4 digits', () => {
      expect(maskCard('123')).toBe('123');
    });

    it('should return empty string for empty input', () => {
      expect(maskCard('')).toBe('');
    });

    it('should handle null-like values gracefully', () => {
      expect(maskCard(null as unknown as string)).toBe('');
    });
  });

  // -----------------------------------------------------------------------
  // maskPhone
  // -----------------------------------------------------------------------
  describe('maskPhone', () => {
    it('should mask a Spanish phone with country code', () => {
      // +34 prefix detected (greedy 1-3 digits), rest masked keeping last 3
      const result = maskPhone('+34612345678');
      expect(result).toContain('+34');
      expect(result.endsWith('678')).toBe(true);
      expect(result).toContain('***');
    });

    it('should mask a phone without country code', () => {
      // 612345678 → 9 digits, last 3 = 678, masked = 6 → ** ***
      expect(maskPhone('612345678')).toBe('*** *** 678');
    });

    it('should mask a US phone with +1', () => {
      // +1 + 2025551234 (10 digits) → last 3 = 234, masked = 7 → ** *** *
      const result = maskPhone('+12025551234');
      expect(result).toContain('+1');
      expect(result.endsWith('234')).toBe(true);
    });

    it('should mask a UK phone with +44', () => {
      // +44 + 2071234567 (10 digits) → last 3 = 567, masked = 7 → ** *** *
      const result = maskPhone('+442071234567');
      expect(result).toContain('+44');
      expect(result.endsWith('567')).toBe(true);
    });

    it('should return original if less than 4 digits', () => {
      expect(maskPhone('12')).toBe('12');
    });

    it('should return empty string for empty input', () => {
      expect(maskPhone('')).toBe('');
    });

    it('should handle null-like values gracefully', () => {
      expect(maskPhone(null as unknown as string)).toBe('');
    });
  });

  // -----------------------------------------------------------------------
  // maskEmail
  // -----------------------------------------------------------------------
  describe('maskEmail', () => {
    it('should mask a standard email', () => {
      expect(maskEmail('user@mail.com')).toBe('u***@mail.com');
    });

    it('should mask a short local part', () => {
      expect(maskEmail('ab@example.org')).toBe('a***@example.org');
    });

    it('should mask a single-char local part', () => {
      expect(maskEmail('a@test.com')).toBe('a***@test.com');
    });

    it('should mask a long local part', () => {
      expect(maskEmail('john.doe.smith@company.co.uk')).toBe('j***@company.co.uk');
    });

    it('should return original if no @ sign', () => {
      expect(maskEmail('invalid-email')).toBe('invalid-email');
    });

    it('should return original if @ is first char', () => {
      expect(maskEmail('@domain.com')).toBe('@domain.com');
    });

    it('should return empty string for empty input', () => {
      expect(maskEmail('')).toBe('');
    });

    it('should handle null-like values gracefully', () => {
      expect(maskEmail(null as unknown as string)).toBe('');
    });
  });

  // -----------------------------------------------------------------------
  // maskIban
  // -----------------------------------------------------------------------
  describe('maskIban', () => {
    it('should mask a Spanish IBAN (24 chars, no spaces)', () => {
      // ES9121000418450200051332 → 24 chars, middle = 16, 4 groups
      expect(maskIban('ES9121000418450200051332')).toBe('ES91 **** **** **** **** 1332');
    });

    it('should mask a Spanish IBAN (with spaces)', () => {
      expect(maskIban('ES91 2100 0418 4502 0005 1332')).toBe('ES91 **** **** **** **** 1332');
    });

    it('should mask a German IBAN (22 chars)', () => {
      // DE89370400440532013000 → 22 chars, middle = 14, ceil(14/4) = 4 groups
      const result = maskIban('DE89370400440532013000');
      expect(result.startsWith('DE89')).toBe(true);
      expect(result.endsWith('3000')).toBe(true);
      expect(result).toContain('****');
    });

    it('should mask a UK IBAN (22 chars)', () => {
      const result = maskIban('GB29NWBK60161331926819');
      expect(result.startsWith('GB29')).toBe(true);
      expect(result.endsWith('6819')).toBe(true);
    });

    it('should return original if less than 8 chars', () => {
      expect(maskIban('ES91210')).toBe('ES91210');
    });

    it('should return empty string for empty input', () => {
      expect(maskIban('')).toBe('');
    });

    it('should handle null-like values gracefully', () => {
      expect(maskIban(null as unknown as string)).toBe('');
    });
  });
});
