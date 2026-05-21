import { ExportConfig } from '../file.types';

/**
 * Export tabular data to a PDF Blob.
 *
 * Uses `jspdf` and `jspdf-autotable` loaded via dynamic import for
 * tree-shaking. If these packages are not installed, a descriptive
 * error is thrown.
 *
 * @param data — Array of data objects to export.
 * @param config — Export configuration with columns and optional title.
 * @returns A `Promise<Blob>` with MIME type `application/pdf`.
 *
 * @example
 * ```typescript
 * const blob = await exportToPdf(users, {
 *   format: 'pdf',
 *   filename: 'users-report',
 *   title: 'User Report',
 *   columns: [
 *     { key: 'name', header: 'Name', width: 80 },
 *     { key: 'email', header: 'Email', width: 120 },
 *   ],
 * });
 * ```
 */
export async function exportToPdf<T>(data: T[], config: ExportConfig<T>): Promise<Blob> {
  let jsPDF: any;
  let autoTable: any;

  try {
    const jspdfModule = await import('jspdf');
    jsPDF = jspdfModule.default ?? jspdfModule.jsPDF;
  } catch {
    throw new Error(
      'PdfExporter: "jspdf" is not installed. Install it with: npm install jspdf jspdf-autotable',
    );
  }

  try {
    const autoTableModule = await import('jspdf-autotable');
    autoTable = autoTableModule.default ?? autoTableModule;
  } catch {
    throw new Error(
      'PdfExporter: "jspdf-autotable" is not installed. Install it with: npm install jspdf-autotable',
    );
  }

  const doc = new jsPDF();

  // Title
  if (config.title) {
    doc.setFontSize(16);
    doc.text(config.title, 14, 20);
  }

  // Table
  const startY = config.title ? 30 : 14;
  const head = [config.columns.map(col => col.header)];
  const body = data.map(row =>
    config.columns.map(col => {
      const value = row[col.key];
      return value == null ? '' : String(value);
    }),
  );

  const columnStyles: Record<number, { cellWidth?: number }> = {};
  config.columns.forEach((col, i) => {
    if (col.width) {
      columnStyles[i] = { cellWidth: col.width };
    }
  });

  autoTable(doc, {
    startY,
    head,
    body,
    columnStyles: Object.keys(columnStyles).length > 0 ? columnStyles : undefined,
    styles: { fontSize: 10 },
    headStyles: { fillColor: [41, 128, 185] },
    margin: { top: 14 },
  });

  return doc.output('blob');
}
