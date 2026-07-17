import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpEventType } from '@angular/common/http';
import { Observable, Subscription } from 'rxjs';
import { FILES_CONFIG, FileValidationConfig, UploadProgress } from './file.types';
import { FileValidationService } from './file-validation.service';

// ---------------------------------------------------------------------------
// Presigned upload contract
// ---------------------------------------------------------------------------

/** Minimal result the product's adapter returns from the init phase. */
export interface PresignedInitResult {
  /** Backend identifier of the reserved file row. */
  readonly fileId: string;

  /** Absolute, presigned URL the bytes are PUT to (another origin). */
  readonly uploadUrl: string;

  /** ISO timestamp when `uploadUrl` expires (informational only). */
  readonly expiresAt?: string;
}

/**
 * Contract supplied by the CONSUMER. The service knows nothing about the
 * backend's endpoints, payloads or auth — that lives in the product's adapter.
 *
 * @typeParam TComplete - Shape the backend returns from `complete` (surfaced
 *   as `PresignedUploadProgress.response` on the final `done` emission).
 */
export interface PresignedUploadAdapter<TComplete = unknown> {
  /** Phase 1 — reserve the row and return the presigned PUT URL. */
  init(file: File): Promise<PresignedInitResult>;

  /** Phase 3 — confirm the upload; the backend verifies and marks the file. */
  complete(fileId: string): Promise<TComplete>;
}

/** Ordered phases a single file moves through during a presigned upload. */
export type PresignedUploadPhase =
  | 'validating'
  | 'init'
  | 'uploading'
  | 'completing'
  | 'done'
  | 'error';

/** Distinguishes the origin of a failed presigned upload. */
export type PresignedUploadErrorCause =
  | 'validation-failed' // FileValidationService rejected the file (init never ran)
  | 'init-failed' // the adapter's init rejected (product backend error)
  | 's3-forbidden' // 403 on the PUT after exhausting the re-init retries
  | 's3-error' // any other PUT failure (network, storage 5xx)
  | 'complete-failed'; // the adapter's complete rejected

/**
 * Progress of a single file through the presigned flow.
 *
 * Extends {@link UploadProgress} (reused as the coarse-grained base) with the
 * fine-grained {@link PresignedUploadPhase} and, on failure, the
 * {@link PresignedUploadErrorCause}.
 */
export interface PresignedUploadProgress extends UploadProgress {
  /** Backend file id — available from the moment init resolves. */
  readonly fileId?: string;

  /** Current phase of the three-step flow. */
  readonly phase: PresignedUploadPhase;

  /** Origin of the failure (only when `phase === 'error'`). */
  readonly errorCause?: PresignedUploadErrorCause;
}

/** Per-call options for a presigned upload. */
export interface PresignedUploadOptions {
  /**
   * Pre-validation rules; `false` disables validation entirely.
   * Default (`undefined`): the module's `FilesConfig` defaults apply.
   */
  readonly validation?: FileValidationConfig | false;

  /** Re-init retries on a 403 of the PUT. Default: `1`. */
  readonly maxExpiredRetries?: number;
}

// ---------------------------------------------------------------------------
// Service
// ---------------------------------------------------------------------------

/**
 * Uploads files through a backend-agnostic **presigned** flow of three phases:
 * `init` (the product reserves a row and returns a presigned PUT URL) →
 * `PUT` (the bytes go **directly** to storage, another origin) →
 * `complete` (the product confirms and the backend verifies the file).
 *
 * The service knows nothing about any product's contract: the consumer supplies
 * a {@link PresignedUploadAdapter} that owns `init`/`complete`. It reuses
 * {@link UploadProgress} as the progress base, `FilesConfig.maxConcurrentUploads`
 * for the {@link uploadMany} concurrency cap, and {@link FileValidationService}
 * for optional pre-validation.
 *
 * **Interceptors apply.** The PUT goes out through the consuming app's
 * `HttpClient`, so the app's global interceptors run on it. The product must
 * exclude the absolute storage URL from its interceptors (no auth header, no
 * tenant/idempotency header) — the service cannot bypass Angular's interceptor
 * chain by design.
 *
 * @example
 * ```typescript
 * const uploader = inject(PresignedUploadService);
 * uploader.upload(file, {
 *   init: (f) => api.initFile(f),      // product contract
 *   complete: (id) => api.complete(id),
 * }).subscribe(p => console.log(p.phase, p.percent));
 * ```
 */
@Injectable()
export class PresignedUploadService {
  private readonly http = inject(HttpClient);
  private readonly validation = inject(FileValidationService);
  private readonly config = inject(FILES_CONFIG, { optional: true });

  /**
   * Upload a single file through the three-phase presigned flow.
   *
   * Emits once on entering each phase plus once per PUT progress event. A 403
   * of the PUT triggers a re-init (fresh URL) and a retry, up to
   * `options.maxExpiredRetries` (default 1); when exhausted the stream emits a
   * final `error` with `errorCause: 's3-forbidden'`. The stream never errors —
   * failures are delivered as a final `phase: 'error'` emission, then it
   * completes.
   *
   * @param file - The file to upload; sent to storage byte-for-byte (never rebuilt).
   * @param adapter - Consumer-supplied `init`/`complete` contract.
   * @param options - Optional pre-validation rules and retry count.
   */
  upload<T>(
    file: File,
    adapter: PresignedUploadAdapter<T>,
    options?: PresignedUploadOptions,
  ): Observable<PresignedUploadProgress> {
    return new Observable<PresignedUploadProgress>((subscriber) => {
      let cancelled = false;
      let innerSub: Subscription | null = null;
      const maxRetries = options?.maxExpiredRetries ?? 1;

      const emit = (progress: PresignedUploadProgress): void => {
        if (!cancelled) subscriber.next(progress);
      };
      const finish = (progress: PresignedUploadProgress): void => {
        if (cancelled) return;
        subscriber.next(progress);
        subscriber.complete();
      };

      const run = async (): Promise<void> => {
        let loadedBytes = 0;
        let totalBytes: number | undefined;
        let fileId: string | undefined;

        // Phase 1 — validating (optional)
        if (options?.validation !== false) {
          emit({ phase: 'validating', status: 'pending', percent: 0, loadedBytes: 0 });
          const rules = typeof options?.validation === 'object' ? options.validation : undefined;
          const result = this.validation.validate(file, rules);
          if (!result.valid) {
            finish({
              phase: 'error',
              status: 'error',
              percent: 0,
              loadedBytes: 0,
              error: result.errors.join('; '),
              errorCause: 'validation-failed',
            });
            return;
          }
        }

        // Phase 2 — init
        emit({ phase: 'init', status: 'pending', percent: 0, loadedBytes: 0 });
        try {
          const init = await adapter.init(file);
          fileId = init.fileId;
          if (cancelled) return;

          // Phase 3 — PUT the bytes directly to storage, with 403 → re-init retry
          let uploadUrl = init.uploadUrl;
          for (let attempt = 0; ; attempt++) {
            try {
              await this.putBytes(uploadUrl, file, {
                onProgress: (loaded, total) => {
                  loadedBytes = loaded;
                  totalBytes = total;
                  emit({
                    phase: 'uploading',
                    status: 'uploading',
                    percent: total ? Math.round((loaded / total) * 100) : 0,
                    loadedBytes: loaded,
                    totalBytes: total,
                    fileId,
                  });
                },
                registerSub: (sub) => (innerSub = sub),
                isCancelled: () => cancelled,
              });
              break; // PUT succeeded
            } catch (putError) {
              if (cancelled) return;
              const status = putError instanceof HttpErrorResponse ? putError.status : 0;

              if (status === 403 && attempt < maxRetries) {
                // URL expired / bad signature → re-init for a fresh URL and retry
                emit({ phase: 'init', status: 'pending', percent: 0, loadedBytes: 0, fileId });
                const reinit = await adapter.init(file);
                if (cancelled) return;
                fileId = reinit.fileId;
                uploadUrl = reinit.uploadUrl;
                loadedBytes = 0;
                totalBytes = undefined;
                continue;
              }

              finish({
                phase: 'error',
                status: 'error',
                percent: totalBytes ? Math.round((loadedBytes / totalBytes) * 100) : 0,
                loadedBytes,
                totalBytes,
                error: this.messageOf(putError),
                errorCause: status === 403 ? 's3-forbidden' : 's3-error',
                fileId,
              });
              return;
            }
          }
        } catch (initError) {
          if (cancelled) return;
          finish({
            phase: 'error',
            status: 'error',
            percent: 0,
            loadedBytes,
            totalBytes,
            error: this.messageOf(initError),
            errorCause: 'init-failed',
            fileId,
          });
          return;
        }

        // Phase 4 — completing
        emit({
          phase: 'completing',
          status: 'uploading',
          percent: 100,
          loadedBytes,
          totalBytes,
          fileId,
        });
        let response: unknown;
        try {
          response = await adapter.complete(fileId as string);
        } catch (completeError) {
          if (cancelled) return;
          finish({
            phase: 'error',
            status: 'error',
            percent: 100,
            loadedBytes,
            totalBytes,
            error: this.messageOf(completeError),
            errorCause: 'complete-failed',
            fileId,
          });
          return;
        }
        if (cancelled) return;

        // Phase 5 — done
        finish({
          phase: 'done',
          status: 'complete',
          percent: 100,
          loadedBytes,
          totalBytes,
          fileId,
          response,
        });
      };

      void run();

      return () => {
        cancelled = true;
        innerSub?.unsubscribe();
      };
    });
  }

  /**
   * Upload many files with individual progress, capping PUTs in flight at
   * `FilesConfig.maxConcurrentUploads` (default 5). A file in error does NOT
   * cancel the rest; the stream emits the full array on every change and
   * completes once every file reached `done` or `error`.
   *
   * @param files - Files to upload.
   * @param adapter - Consumer-supplied `init`/`complete` contract.
   * @param options - Optional pre-validation rules and retry count (per file).
   */
  uploadMany<T>(
    files: readonly File[],
    adapter: PresignedUploadAdapter<T>,
    options?: PresignedUploadOptions,
  ): Observable<readonly PresignedUploadProgress[]> {
    return new Observable<readonly PresignedUploadProgress[]>((subscriber) => {
      const limit = this.config?.maxConcurrentUploads ?? 5;
      const states: PresignedUploadProgress[] = files.map(() => ({
        phase: 'validating',
        status: 'pending',
        percent: 0,
        loadedBytes: 0,
      }));
      const subs: Subscription[] = [];
      let nextIndex = 0;
      let active = 0;
      let settled = 0;
      let closed = false;

      const emitAll = (): void => subscriber.next(states.slice());

      const pump = (): void => {
        while (!closed && active < limit && nextIndex < files.length) {
          const index = nextIndex++;
          active++;
          const sub = this.upload(files[index], adapter, options).subscribe({
            next: (progress) => {
              states[index] = progress;
              emitAll();
            },
            complete: () => {
              active--;
              settled++;
              if (settled === files.length && !closed) {
                closed = true;
                subscriber.complete();
              } else {
                pump();
              }
            },
          });
          subs.push(sub);
        }
      };

      emitAll();
      if (files.length === 0) {
        subscriber.complete();
      } else {
        pump();
      }

      return () => {
        closed = true;
        subs.forEach((sub) => sub.unsubscribe());
      };
    });
  }

  /**
   * PUT the raw file to the presigned URL with progress reporting. Resolves on
   * the storage response, rejects with the `HttpErrorResponse` on failure. No
   * auth/tenant headers and `withCredentials: false` — authorization is signed
   * into the URL. The body is the original `File`, so `Content-Length` matches
   * the declared `byteSize` (storage returns 403 `SignatureDoesNotMatch` otherwise).
   */
  private putBytes(
    uploadUrl: string,
    file: File,
    cbs: {
      onProgress: (loaded: number, total: number | undefined) => void;
      registerSub: (sub: Subscription) => void;
      isCancelled: () => boolean;
    },
  ): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      const sub = this.http
        .put(uploadUrl, file, {
          headers: { 'Content-Type': file.type },
          reportProgress: true,
          observe: 'events',
          withCredentials: false,
        })
        .subscribe({
          next: (event) => {
            if (cbs.isCancelled()) return;
            if (event.type === HttpEventType.UploadProgress) {
              cbs.onProgress(event.loaded, event.total);
            } else if (event.type === HttpEventType.Response) {
              resolve();
            }
          },
          error: (error) => reject(error),
          complete: () => resolve(),
        });
      cbs.registerSub(sub);
    });
  }

  /** Extract a human-readable message from an unknown thrown value. */
  private messageOf(error: unknown): string {
    if (error instanceof HttpErrorResponse) {
      return error.message;
    }
    if (error instanceof Error) {
      return error.message;
    }
    return String(error);
  }
}
