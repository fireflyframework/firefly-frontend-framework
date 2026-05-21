import { Injectable, inject } from '@angular/core';
import { FILES_CONFIG, FileValidationConfig, ValidationResult } from './file.types';

/**
 * Validates files against configurable rules before upload or processing.
 *
 * Checks MIME type, file size, and file extension.
 * Module-level defaults come from `FilesConfig` (via `provideFiles()`).
 * Per-call rules in `FileValidationConfig` take precedence.
 *
 * @example
 * ```typescript
 * const result = validator.validate(file, {
 *   maxSizeBytes: 5 * 1024 * 1024,
 *   allowedMimeTypes: ['application/pdf'],
 * });
 * if (!result.valid) console.error(result.errors);
 * ```
 */
@Injectable()
export class FileValidationService {
  private readonly config = inject(FILES_CONFIG, { optional: true });

  /**
   * Validate a file against the given rules.
   *
   * If no rules are provided, module-level defaults from `FilesConfig` apply.
   * Returns `{ valid: true, errors: [] }` when all checks pass.
   */
  validate(file: File, rules?: FileValidationConfig): ValidationResult {
    const errors: string[] = [];

    const maxSize = rules?.maxSizeBytes ?? this.config?.maxFileSizeBytes;
    const allowedMimes = rules?.allowedMimeTypes ?? (this.config?.allowedMimeTypes.length ? this.config.allowedMimeTypes : undefined);
    const allowedExts = rules?.allowedExtensions;

    if (maxSize != null && file.size > maxSize) {
      errors.push(`File size ${file.size} bytes exceeds maximum ${maxSize} bytes`);
    }

    if (allowedMimes != null && allowedMimes.length > 0) {
      const matches = allowedMimes.some(pattern => this.mimeMatches(file.type, pattern));
      if (!matches) {
        errors.push(`File type '${file.type || 'unknown'}' is not allowed. Allowed: ${allowedMimes.join(', ')}`);
      }
    }

    if (allowedExts != null && allowedExts.length > 0) {
      const ext = this.getExtension(file.name);
      const normalizedAllowed = allowedExts.map(e => e.toLowerCase());
      if (!normalizedAllowed.includes(ext.toLowerCase())) {
        errors.push(`File extension '${ext}' is not allowed. Allowed: ${allowedExts.join(', ')}`);
      }
    }

    return { valid: errors.length === 0, errors };
  }

  /** Match a MIME type against a pattern (supports wildcards like `image/*`). */
  private mimeMatches(mime: string, pattern: string): boolean {
    if (pattern === '*/*') return true;
    if (pattern.endsWith('/*')) {
      const prefix = pattern.slice(0, pattern.indexOf('/'));
      return mime.startsWith(prefix + '/');
    }
    return mime === pattern;
  }

  /** Extract file extension including dot. Returns empty string if no extension. */
  private getExtension(filename: string): string {
    const idx = filename.lastIndexOf('.');
    return idx >= 0 ? filename.slice(idx) : '';
  }
}
