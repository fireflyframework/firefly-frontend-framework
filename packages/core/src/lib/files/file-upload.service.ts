import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpEventType, HttpHeaders } from '@angular/common/http';
import { Observable, map, scan, forkJoin } from 'rxjs';
import { FILES_CONFIG, UploadProgress } from './file.types';

/**
 * Uploads files via HTTP POST with real-time progress tracking.
 *
 * Uses `HttpClient` with `reportProgress` to emit `UploadProgress` events
 * containing percentage, loaded/total bytes, and final response.
 *
 * @example
 * ```typescript
 * const uploader = inject(FileUploadService);
 * uploader.upload(file, '/api/files').subscribe(p => {
 *   console.log(`${p.percent}% — ${p.status}`);
 * });
 * ```
 */
@Injectable()
export class FileUploadService {
  private readonly http = inject(HttpClient);
  private readonly config = inject(FILES_CONFIG, { optional: true });

  /**
   * Upload a single file with progress tracking.
   *
   * @param file — The file to upload.
   * @param endpoint — URL to POST to. If not provided, falls back to `FilesConfig.uploadEndpoint`.
   * @param headers — Optional extra headers (e.g. authorization, content-disposition).
   * @returns Observable that emits `UploadProgress` on each progress event and completes on success.
   */
  upload(file: File, endpoint: string, headers?: Record<string, string>): Observable<UploadProgress> {
    const url = endpoint || this.config?.uploadEndpoint;
    if (!url) {
      throw new Error('FileUploadService: No upload endpoint provided. Pass an endpoint or configure uploadEndpoint in provideFiles().');
    }

    const formData = new FormData();
    formData.append('file', file, file.name);

    let httpHeaders: HttpHeaders | undefined;
    if (headers) {
      httpHeaders = new HttpHeaders(headers);
    }

    return this.http.post(url, formData, {
      reportProgress: true,
      observe: 'events',
      headers: httpHeaders,
    }).pipe(
      scan<any, UploadProgress>((acc, event) => {
        switch (event.type) {
          case HttpEventType.Sent:
            return { percent: 0, loadedBytes: 0, status: 'uploading' };

          case HttpEventType.UploadProgress: {
            const total = event.total;
            const loaded = event.loaded ?? 0;
            const percent = total ? Math.round((loaded / total) * 100) : acc.percent;
            return {
              percent,
              loadedBytes: loaded,
              totalBytes: total,
              status: 'uploading' as const,
            };
          }

          case HttpEventType.Response:
            return {
              percent: 100,
              loadedBytes: acc.loadedBytes,
              totalBytes: acc.totalBytes,
              status: 'complete' as const,
              response: event.body,
            };

          default:
            return acc;
        }
      }, { percent: 0, loadedBytes: 0, status: 'pending' }),
    );
  }

  /**
   * Upload multiple files concurrently with individual progress tracking.
   *
   * @returns Observable that emits an array of `UploadProgress` (one per file) when all complete.
   */
  uploadMultiple(files: File[], endpoint: string): Observable<UploadProgress[]> {
    const uploads = files.map(file => this.upload(file, endpoint));
    return forkJoin(uploads);
  }
}
