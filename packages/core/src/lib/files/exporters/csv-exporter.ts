import { ExportConfig } from '../file.types';

/** UTF-8 BOM for Excel compatibility. */
const UTF8_BOM = '\uFEFF';

/**
 * Escape a CSV field value.
 *
 * If the value contains the separator, a double-quote, or a newline,
 * it is wrapped in double-quotes with internal quotes escaped.
 */
function escapeField(value: string, separator: string): string {
  if (
    value.includes(separator) ||
    value.includes('"') ||
    value.includes('\n') ||
    value.includes('\r')
  ) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

/**
 * Export tabular data to a CSV Blob.
 *
 * Pure JS implementation with no external dependencies. Supports
 * configurable field separators and includes a UTF-8 BOM for
 * Excel compatibility.
 *
 * @param data — Array of data objects to export.
 * @param config — Export configuration with columns and optional csvSeparator.
 * @returns A `Blob` with MIME type `text/csv;charset=utf-8`.
 *
 * @example
 * ```typescript
 * const blob = exportToCsv(users, {
 *   format: 'csv',
 *   filename: 'users',
 *   columns: [
 *     { key: 'name', header: 'Name' },
 *     { key: 'email', header: 'Email' },
 *   ],
 * });
 * ```
 */
export function exportToCsv<T>(data: T[], config: ExportConfig<T>): Blob {
  const separator = config.csvSeparator ?? ',';
  const columns = config.columns;

  // Header row
  const headerRow = columns
    .map(col => escapeField(col.header, separator))
    .join(separator);

  // Data rows
  const dataRows = data.map(row =>
    columns
      .map(col => {
        const value = row[col.key];
        const str = value == null ? '' : String(value);
        return escapeField(str, separator);
      })
      .join(separator),
  );

  const csvContent = UTF8_BOM + [headerRow, ...dataRows].join('\r\n');

  return new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
}
