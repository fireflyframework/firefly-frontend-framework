import { FfPiiMaskPipe } from './pii-mask.pipe';

describe('FfPiiMaskPipe', () => {
  let pipe: FfPiiMaskPipe;

  beforeEach(() => {
    pipe = new FfPiiMaskPipe();
  });

  // ---------------------------------------------------------------------
  // NIF masking
  // ---------------------------------------------------------------------
  it('should mask a NIF', () => {
    expect(pipe.transform('12345678A', 'nif')).toBe('******78A');
  });

  // ---------------------------------------------------------------------
  // Card masking
  // ---------------------------------------------------------------------
  it('should mask a card number', () => {
    expect(pipe.transform('4111111111111111', 'card')).toBe('**** **** **** 1111');
  });

  // ---------------------------------------------------------------------
  // Phone masking
  // ---------------------------------------------------------------------
  it('should mask a phone number', () => {
    expect(pipe.transform('612345678', 'phone')).toBe('*** *** 678');
  });

  // ---------------------------------------------------------------------
  // Email masking
  // ---------------------------------------------------------------------
  it('should mask an email', () => {
    expect(pipe.transform('user@mail.com', 'email')).toBe('u***@mail.com');
  });

  // ---------------------------------------------------------------------
  // IBAN masking
  // ---------------------------------------------------------------------
  it('should mask an IBAN', () => {
    expect(pipe.transform('ES9121000418450200051332', 'iban')).toBe('ES91 **** **** **** **** 1332');
  });

  // ---------------------------------------------------------------------
  // Null / undefined / empty handling
  // ---------------------------------------------------------------------
  it('should return empty string for null', () => {
    expect(pipe.transform(null, 'nif')).toBe('');
  });

  it('should return empty string for undefined', () => {
    expect(pipe.transform(undefined, 'card')).toBe('');
  });

  it('should return empty string for empty string', () => {
    expect(pipe.transform('', 'email')).toBe('');
  });
});
