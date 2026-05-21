import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideFiles } from './provide-files';
import { FileValidationService } from './file-validation.service';
import { FilePickerService } from './file-picker.service';
import { FileUploadService } from './file-upload.service';
import { FileDownloadService } from './file-download.service';
import { FilePreviewService } from './file-preview.service';
import { FileExportService } from './file-export.service';
import { FILES_CONFIG, FilesConfig } from './file.types';

describe('provideFiles', () => {
  afterEach(() => TestBed.resetTestingModule());

  it('should return valid EnvironmentProviders', () => {
    const providers = provideFiles();
    expect(providers).toBeDefined();
  });

  it('should register all 6 services without config', () => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideFiles()],
    });

    expect(TestBed.inject(FileValidationService)).toBeInstanceOf(FileValidationService);
    expect(TestBed.inject(FilePickerService)).toBeInstanceOf(FilePickerService);
    expect(TestBed.inject(FileUploadService)).toBeInstanceOf(FileUploadService);
    expect(TestBed.inject(FileDownloadService)).toBeInstanceOf(FileDownloadService);
    expect(TestBed.inject(FilePreviewService)).toBeInstanceOf(FilePreviewService);
    expect(TestBed.inject(FileExportService)).toBeInstanceOf(FileExportService);
  });

  it('should not provide FILES_CONFIG when no config is passed', () => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideFiles()],
    });

    expect(() => TestBed.inject(FILES_CONFIG)).toThrow();
  });

  it('should provide FILES_CONFIG when config is passed', () => {
    const filesConfig: Partial<FilesConfig> = {
      maxFileSizeBytes: 5_000_000,
      allowedMimeTypes: ['application/pdf'],
      enablePreview: false,
    };

    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideFiles(filesConfig)],
    });

    const config = TestBed.inject(FILES_CONFIG);
    expect(config).toEqual(filesConfig);
  });

  it('should allow calling provideFiles without arguments', () => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideFiles()],
    });

    const svc = TestBed.inject(FileDownloadService);
    expect(svc).toBeDefined();
  });
});
