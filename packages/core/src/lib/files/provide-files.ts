import { EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';
import { FILES_CONFIG, FilesConfig } from './file.types';
import { FileValidationService } from './file-validation.service';
import { FilePickerService } from './file-picker.service';
import { FileUploadService } from './file-upload.service';
import { PresignedUploadService } from './presigned-upload.service';
import { FileDownloadService } from './file-download.service';
import { FilePreviewService } from './file-preview.service';
import { FileExportService } from './file-export.service';

/**
 * Configure the Files module.
 *
 * Registers all file-related services and optionally sets `FilesConfig`
 * for upload limits, allowed types, and preview behavior.
 *
 * This is an **EXTENDED** module — services are NOT available globally.
 * Call `provideFiles()` in your `appConfig` to enable them.
 *
 * @example
 * ```ts
 * import { provideFiles } from '@fireflyframework/core';
 *
 * export const appConfig: ApplicationConfig = {
 *   providers: [
 *     provideFiles({
 *       maxFileSizeBytes: 10 * 1024 * 1024,
 *       allowedMimeTypes: ['application/pdf', 'image/png'],
 *       maxConcurrentUploads: 5,
 *       enablePreview: true,
 *     }),
 *   ],
 * };
 * ```
 *
 * @param config - Optional files configuration. Services work with sensible defaults if omitted.
 * @returns EnvironmentProviders to register in the application config
 */
export function provideFiles(
  config?: Partial<FilesConfig>,
): EnvironmentProviders {
  return makeEnvironmentProviders([
    FileValidationService,
    FilePickerService,
    FileUploadService,
    PresignedUploadService,
    FileDownloadService,
    FilePreviewService,
    FileExportService,
    ...(config
      ? [{ provide: FILES_CONFIG, useValue: config }]
      : []),
  ]);
}
