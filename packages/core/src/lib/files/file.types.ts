import { InjectionToken } from '@angular/core';

// ---------------------------------------------------------------------------
// Export format
// ---------------------------------------------------------------------------

/**
 * Supported export formats for tabular data.
 *
 * - `'csv'`  — Comma-separated values (pure JS, no dependencies)
 * - `'pdf'`  — PDF document via `jspdf` (optional peer dependency)
 * - `'xlsx'` — Excel workbook via `exceljs` (optional peer dependency)
 */
export type ExportFormat = 'csv' | 'pdf' | 'xlsx';

// ---------------------------------------------------------------------------
// Upload progress
// ---------------------------------------------------------------------------

/**
 * Tracks the progress of a file upload.
 *
 * Emitted by `FileUploadService.upload()` as an `Observable<UploadProgress>`.
 *
 * @example
 * ```typescript
 * uploader.upload(file, '/api/files').subscribe(progress => {
 *   console.log(`${progress.percent}%`);
 *   if (progress.status === 'complete') { ... }
 * });
 * ```
 */
export interface UploadProgress {
  /** Percentage completed (0–100). */
  readonly percent: number;

  /** Total bytes to upload (`undefined` if server doesn't report). */
  readonly totalBytes?: number;

  /** Bytes uploaded so far. */
  readonly loadedBytes: number;

  /** Current status of the upload. */
  readonly status: 'pending' | 'uploading' | 'complete' | 'error';

  /** Server response body (only when `status === 'complete'`). */
  readonly response?: unknown;

  /** Error message (only when `status === 'error'`). */
  readonly error?: string;
}

// ---------------------------------------------------------------------------
// File validation
// ---------------------------------------------------------------------------

/**
 * Rules for validating a file before upload or processing.
 *
 * All fields are optional — only specified rules are enforced.
 *
 * @example
 * ```typescript
 * const rules: FileValidationConfig = {
 *   maxSizeBytes: 10 * 1024 * 1024,
 *   allowedMimeTypes: ['application/pdf', 'image/png'],
 *   allowedExtensions: ['.pdf', '.png'],
 * };
 * ```
 */
export interface FileValidationConfig {
  /** Maximum file size in bytes. */
  readonly maxSizeBytes?: number;

  /** Allowed MIME types (e.g. `'application/pdf'`, `'image/*'`). */
  readonly allowedMimeTypes?: string[];

  /** Allowed file extensions including dot (e.g. `'.pdf'`, `'.png'`). */
  readonly allowedExtensions?: string[];
}

/**
 * Result of file validation.
 *
 * @example
 * ```typescript
 * const result = validator.validate(file, rules);
 * if (!result.valid) {
 *   console.error(result.errors);
 * }
 * ```
 */
export interface ValidationResult {
  /** Whether the file passed all validation rules. */
  readonly valid: boolean;

  /** List of validation error messages (empty when valid). */
  readonly errors: string[];
}

// ---------------------------------------------------------------------------
// Export configuration
// ---------------------------------------------------------------------------

/**
 * Column definition for tabular data export.
 *
 * Maps a data property to a column header in the exported file.
 */
export interface ExportColumn<T = unknown> {
  /** Property key to extract from each data row. */
  readonly key: keyof T & string;

  /** Display header text for this column. */
  readonly header: string;

  /** Column width (interpretation depends on format: chars for CSV, pts for PDF/Excel). */
  readonly width?: number;
}

/**
 * Configuration for exporting tabular data to a file.
 *
 * @example
 * ```typescript
 * exportService.export(users, {
 *   format: 'csv',
 *   filename: 'users-report',
 *   columns: [
 *     { key: 'name', header: 'Full Name' },
 *     { key: 'email', header: 'Email Address' },
 *   ],
 * });
 * ```
 */
export interface ExportConfig<T = unknown> {
  /** Output format. */
  readonly format: ExportFormat;

  /** Filename without extension (extension is added automatically). */
  readonly filename: string;

  /** Column definitions mapping data keys to headers. */
  readonly columns: ExportColumn<T>[];

  /** Document title (used in PDF header and Excel sheet title). */
  readonly title?: string;

  /** Sheet name for Excel exports. Default: `'Sheet1'`. */
  readonly sheetName?: string;

  /** Field separator for CSV exports. Default: `','`. */
  readonly csvSeparator?: string;
}

// ---------------------------------------------------------------------------
// Module configuration
// ---------------------------------------------------------------------------

/**
 * Configuration for `provideFiles()`.
 *
 * Controls file upload limits, allowed types, and preview behavior.
 * All fields are optional — sensible defaults are applied.
 *
 * @example
 * ```typescript
 * provideFiles({
 *   maxFileSizeBytes: 10 * 1024 * 1024,
 *   allowedMimeTypes: ['application/pdf', 'image/png', 'image/jpeg'],
 * })
 * ```
 */
export interface FilesConfig {
  /** Maximum file size in bytes. Default: 10 MB (10 * 1024 * 1024). */
  readonly maxFileSizeBytes: number;

  /** Allowed MIME types. Default: `[]` (no restriction). */
  readonly allowedMimeTypes: string[];

  /** Maximum number of concurrent uploads. Default: `5`. */
  readonly maxConcurrentUploads: number;

  /** Override upload endpoint (bypasses global apiBaseUrl). */
  readonly uploadEndpoint?: string;

  /** Enable inline file previews. Default: `true`. */
  readonly enablePreview: boolean;
}

/**
 * Injection token for the files module configuration.
 *
 * Provided by `provideFiles()`. Services inject this to read config.
 */
export const FILES_CONFIG = new InjectionToken<FilesConfig>('FILES_CONFIG');
