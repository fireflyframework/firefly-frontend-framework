import { Injectable, inject } from '@angular/core';
import { FileDownloadService } from './file-download.service';
import { ExportConfig, ExportFormat } from './file.types';
import { exportToCsv } from './exporters/csv-exporter';
import { exportToPdf } from './exporters/pdf-exporter';
import { exportToExcel } from './exporters/excel-exporter';

/** Maps export formats to file extensions. */
const FORMAT_EXTENSIONS: Record<ExportFormat, string> = {
  csv: '.csv',
  pdf: '.pdf',
  xlsx: '.xlsx',
};

/**
 * Orchestrates tabular data export by selecting the correct exporter
 * and delegating the download to `FileDownloadService`.
 *
 * @example
 * ```typescript
 * const exporter = inject(FileExportService);
 * await exporter.export(users, {
 *   format: 'csv',
 *   filename: 'users-report',
 *   columns: [
 *     { key: 'name', header: 'Name' },
 *     { key: 'email', header: 'Email' },
 *   ],
 * });
 * ```
 */
@Injectable()
export class FileExportService {
  private readonly downloadService = inject(FileDownloadService);

  /**
   * Export data to a file and trigger browser download.
   *
   * Selects the exporter based on `config.format`, generates the Blob,
   * and delegates download to `FileDownloadService.downloadBlob()`.
   *
   * @param data — Array of data objects to export.
   * @param config — Export configuration (format, filename, columns, etc.).
   */
  async export<T>(data: T[], config: ExportConfig<T>): Promise<void> {
    const blob = await this.generateBlob(data, config);
    const extension = FORMAT_EXTENSIONS[config.format];
    const filename = config.filename + extension;
    this.downloadService.downloadBlob(blob, filename);
  }

  /**
   * Generate a Blob without triggering download.
   *
   * Useful when the caller needs the Blob for preview or further processing.
   *
   * @param data — Array of data objects to export.
   * @param config — Export configuration.
   * @returns The generated Blob.
   */
  async generateBlob<T>(data: T[], config: ExportConfig<T>): Promise<Blob> {
    switch (config.format) {
      case 'csv':
        return exportToCsv(data, config);
      case 'pdf':
        return exportToPdf(data, config);
      case 'xlsx':
        return exportToExcel(data, config);
      default:
        throw new Error(
          `FileExportService: Unsupported export format "${config.format}". Supported: csv, pdf, xlsx.`,
        );
    }
  }
}
