/**
 * Definition of a document/file-upload field within a feature.
 *
 * Drives the generation of file-upload controls with validation
 * for accepted formats, size limits, and multi-file support.
 *
 * @example
 * ```yaml
 * documents:
 *   - { field: attachments, type: file-upload, accept: [pdf, jpg, png], maxSize: 10MB, multiple: true }
 * ```
 */
export interface DocumentDef {
  /** Field name that holds the uploaded files. */
  field: string;

  /** Upload control type. */
  type: 'file-upload';

  /** Accepted file extensions (e.g. `['pdf', 'jpg', 'png']`). */
  accept: string[];

  /** Maximum file size as a human-readable string (e.g. `'10MB'`). */
  maxSize: string;

  /** Whether multiple files can be uploaded. */
  multiple?: boolean;
}
