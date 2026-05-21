import { ExportConfig } from '../file.types';

/**
 * Export tabular data to an Excel (XLSX) Blob.
 *
 * Uses `exceljs` loaded via dynamic import for tree-shaking.
 * If the package is not installed, a descriptive error is thrown.
 *
 * @param data — Array of data objects to export.
 * @param config — Export configuration with columns, optional sheetName and title.
 * @returns A `Promise<Blob>` with MIME type for XLSX.
 *
 * @example
 * ```typescript
 * const blob = await exportToExcel(users, {
 *   format: 'xlsx',
 *   filename: 'users-report',
 *   title: 'User Report',
 *   sheetName: 'Users',
 *   columns: [
 *     { key: 'name', header: 'Name', width: 30 },
 *     { key: 'email', header: 'Email', width: 40 },
 *   ],
 * });
 * ```
 */
export async function exportToExcel<T>(data: T[], config: ExportConfig<T>): Promise<Blob> {
  let ExcelJS: any;

  try {
    ExcelJS = await import('exceljs');
  } catch {
    throw new Error(
      'ExcelExporter: "exceljs" is not installed. Install it with: npm install exceljs',
    );
  }

  const Workbook = ExcelJS.Workbook ?? ExcelJS.default?.Workbook;
  if (!Workbook) {
    throw new Error('ExcelExporter: Could not resolve exceljs Workbook class.');
  }

  const workbook = new Workbook();
  const sheetName = config.sheetName ?? 'Sheet1';
  const worksheet = workbook.addWorksheet(sheetName);

  // Column definitions
  worksheet.columns = config.columns.map(col => ({
    header: col.header,
    key: col.key,
    width: col.width ?? 20,
  }));

  // Style header row (bold + fill)
  const headerRow = worksheet.getRow(1);
  headerRow.font = { bold: true };
  headerRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF2980B9' },
  };
  headerRow.alignment = { vertical: 'middle' };

  // Add data rows
  for (const row of data) {
    const values: Record<string, string> = {};
    for (const col of config.columns) {
      const value = row[col.key];
      values[col.key] = value == null ? '' : String(value);
    }
    worksheet.addRow(values);
  }

  // Title as sheet header (if provided)
  if (config.title) {
    workbook.title = config.title;
  }

  const buffer = await workbook.xlsx.writeBuffer();
  const xlsxMime = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
  return new Blob([buffer], { type: xlsxMime });
}
