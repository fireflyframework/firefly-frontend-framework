import { describe, expect, it } from 'vitest';

import { FfFileExtensionPipe } from './ff-file-extension.pipe';

describe('FfFileExtensionPipe', () => {
  const pipe = new FfFileExtensionPipe();

  it('returns the uppercase extension', () => {
    expect(pipe.transform('factura.pdf')).toBe('PDF');
    expect(pipe.transform('scan_2026.PNG')).toBe('PNG');
    expect(pipe.transform('a.b.docx')).toBe('DOCX');
  });

  it('returns empty string when there is no usable extension', () => {
    expect(pipe.transform('F-2026-04821')).toBe('');
    expect(pipe.transform('.hidden')).toBe('');
    expect(pipe.transform('trailing.')).toBe('');
  });

  it('returns empty string for falsy input', () => {
    expect(pipe.transform(undefined)).toBe('');
    expect(pipe.transform(null)).toBe('');
    expect(pipe.transform('')).toBe('');
  });
});
