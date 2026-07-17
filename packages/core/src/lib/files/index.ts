// Types
export type {
  ExportFormat,
  UploadProgress,
  FileValidationConfig,
  ValidationResult,
  ExportColumn,
  ExportConfig,
  FilesConfig,
} from './file.types';
export { FILES_CONFIG } from './file.types';

// Presigned upload contract
export type {
  PresignedInitResult,
  PresignedUploadAdapter,
  PresignedUploadPhase,
  PresignedUploadErrorCause,
  PresignedUploadProgress,
  PresignedUploadOptions,
} from './presigned-upload.service';

// Provider factory
export { provideFiles } from './provide-files';

// Services
export { FileValidationService } from './file-validation.service';
export { FilePickerService } from './file-picker.service';
export { FileUploadService } from './file-upload.service';
export { PresignedUploadService } from './presigned-upload.service';
export { FileDownloadService } from './file-download.service';
export { FilePreviewService } from './file-preview.service';
export { FileExportService } from './file-export.service';

// Exporters (pure functions) are NOT re-exported here to avoid
// forcing resolution of optional peer dependencies (jspdf, exceljs).
// Import them directly when needed:
//   import { exportToCsv } from '@fireflyframework/core/lib/files/exporters/csv-exporter';
//   import { exportToPdf } from '@fireflyframework/core/lib/files/exporters/pdf-exporter';
//   import { exportToExcel } from '@fireflyframework/core/lib/files/exporters/excel-exporter';
// Or use FileExportService which orchestrates all three.
