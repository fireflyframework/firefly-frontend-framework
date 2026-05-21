import { TestBed } from '@angular/core/testing';
import { FileValidationService } from './file-validation.service';
import { FILES_CONFIG, FilesConfig } from './file.types';

function createFile(name: string, size: number, type: string): File {
  const content = new ArrayBuffer(size);
  return new File([content], name, { type });
}

describe('FileValidationService', () => {
  function setup(config?: Partial<FilesConfig>) {
    TestBed.configureTestingModule({
      providers: [
        FileValidationService,
        ...(config
          ? [{ provide: FILES_CONFIG, useValue: config }]
          : []),
      ],
    });
    return TestBed.inject(FileValidationService);
  }

  // -------------------------------------------------------------------
  // Valid files
  // -------------------------------------------------------------------
  it('should return valid for a file with no rules', () => {
    const svc = setup();
    const result = svc.validate(createFile('doc.pdf', 1024, 'application/pdf'));
    expect(result.valid).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it('should return valid when file passes all rules', () => {
    const svc = setup();
    const result = svc.validate(createFile('photo.png', 500, 'image/png'), {
      maxSizeBytes: 1024,
      allowedMimeTypes: ['image/png', 'image/jpeg'],
      allowedExtensions: ['.png', '.jpg'],
    });
    expect(result.valid).toBe(true);
    expect(result.errors).toEqual([]);
  });

  // -------------------------------------------------------------------
  // Size validation
  // -------------------------------------------------------------------
  it('should reject file exceeding maxSizeBytes', () => {
    const svc = setup();
    const result = svc.validate(createFile('big.pdf', 2000, 'application/pdf'), {
      maxSizeBytes: 1000,
    });
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBe(1);
    expect(result.errors[0]).toContain('2000');
    expect(result.errors[0]).toContain('1000');
  });

  it('should accept file at exact maxSizeBytes limit', () => {
    const svc = setup();
    const result = svc.validate(createFile('exact.pdf', 1000, 'application/pdf'), {
      maxSizeBytes: 1000,
    });
    expect(result.valid).toBe(true);
  });

  // -------------------------------------------------------------------
  // MIME type validation
  // -------------------------------------------------------------------
  it('should reject disallowed MIME type', () => {
    const svc = setup();
    const result = svc.validate(createFile('doc.exe', 100, 'application/x-msdownload'), {
      allowedMimeTypes: ['application/pdf', 'image/png'],
    });
    expect(result.valid).toBe(false);
    expect(result.errors[0]).toContain('application/x-msdownload');
    expect(result.errors[0]).toContain('not allowed');
  });

  it('should support wildcard MIME patterns (image/*)', () => {
    const svc = setup();
    const result = svc.validate(createFile('photo.webp', 100, 'image/webp'), {
      allowedMimeTypes: ['image/*'],
    });
    expect(result.valid).toBe(true);
  });

  it('should reject non-matching wildcard MIME', () => {
    const svc = setup();
    const result = svc.validate(createFile('doc.pdf', 100, 'application/pdf'), {
      allowedMimeTypes: ['image/*'],
    });
    expect(result.valid).toBe(false);
  });

  it('should handle file with empty MIME type', () => {
    const svc = setup();
    const result = svc.validate(createFile('unknown', 100, ''), {
      allowedMimeTypes: ['application/pdf'],
    });
    expect(result.valid).toBe(false);
    expect(result.errors[0]).toContain('unknown');
  });

  // -------------------------------------------------------------------
  // Extension validation
  // -------------------------------------------------------------------
  it('should reject disallowed extension', () => {
    const svc = setup();
    const result = svc.validate(createFile('virus.exe', 100, 'application/x-msdownload'), {
      allowedExtensions: ['.pdf', '.png'],
    });
    expect(result.valid).toBe(false);
    expect(result.errors[0]).toContain('.exe');
  });

  it('should be case-insensitive for extensions', () => {
    const svc = setup();
    const result = svc.validate(createFile('PHOTO.PNG', 100, 'image/png'), {
      allowedExtensions: ['.png'],
    });
    expect(result.valid).toBe(true);
  });

  it('should handle file without extension', () => {
    const svc = setup();
    const result = svc.validate(createFile('noext', 100, 'text/plain'), {
      allowedExtensions: ['.txt'],
    });
    expect(result.valid).toBe(false);
  });

  // -------------------------------------------------------------------
  // Multiple errors
  // -------------------------------------------------------------------
  it('should collect multiple errors at once', () => {
    const svc = setup();
    const result = svc.validate(createFile('bad.exe', 5000, 'application/x-msdownload'), {
      maxSizeBytes: 1000,
      allowedMimeTypes: ['application/pdf'],
      allowedExtensions: ['.pdf'],
    });
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBe(3);
  });

  // -------------------------------------------------------------------
  // Module-level defaults from FILES_CONFIG
  // -------------------------------------------------------------------
  it('should use FILES_CONFIG maxFileSizeBytes as default', () => {
    const svc = setup({
      maxFileSizeBytes: 500,
      allowedMimeTypes: [],
      maxConcurrentUploads: 5,
      enablePreview: true,
    });
    const result = svc.validate(createFile('big.pdf', 1000, 'application/pdf'));
    expect(result.valid).toBe(false);
    expect(result.errors[0]).toContain('500');
  });

  it('should use FILES_CONFIG allowedMimeTypes as default', () => {
    const svc = setup({
      maxFileSizeBytes: 10_000_000,
      allowedMimeTypes: ['image/png'],
      maxConcurrentUploads: 5,
      enablePreview: true,
    });
    const result = svc.validate(createFile('doc.pdf', 100, 'application/pdf'));
    expect(result.valid).toBe(false);
  });

  it('should prefer per-call rules over FILES_CONFIG', () => {
    const svc = setup({
      maxFileSizeBytes: 100,
      allowedMimeTypes: ['image/png'],
      maxConcurrentUploads: 5,
      enablePreview: true,
    });
    // Per-call rules override: bigger size, different MIME
    const result = svc.validate(createFile('doc.pdf', 500, 'application/pdf'), {
      maxSizeBytes: 1000,
      allowedMimeTypes: ['application/pdf'],
    });
    expect(result.valid).toBe(true);
  });

  it('should skip MIME check when FILES_CONFIG has empty allowedMimeTypes', () => {
    const svc = setup({
      maxFileSizeBytes: 10_000_000,
      allowedMimeTypes: [],
      maxConcurrentUploads: 5,
      enablePreview: true,
    });
    const result = svc.validate(createFile('anything.xyz', 100, 'application/octet-stream'));
    expect(result.valid).toBe(true);
  });
});
