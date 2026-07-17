import { TestBed } from '@angular/core/testing';
import { HttpEventType, provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { PresignedUploadService, PresignedUploadProgress } from './presigned-upload.service';
import { FileValidationService } from './file-validation.service';
import { FILES_CONFIG } from './file.types';

/** Yield to a macrotask so all pending promise microtasks flush. */
const tick = () => new Promise<void>((resolve) => setTimeout(resolve, 0));

describe('PresignedUploadService', () => {
  let svc: PresignedUploadService;
  let httpMock: HttpTestingController;

  function setup(config?: object) {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        PresignedUploadService,
        FileValidationService,
        provideHttpClient(),
        provideHttpClientTesting(),
        ...(config ? [{ provide: FILES_CONFIG, useValue: config }] : []),
      ],
    });
    svc = TestBed.inject(PresignedUploadService);
    httpMock = TestBed.inject(HttpTestingController);
  }

  afterEach(() => {
    httpMock?.verify();
  });

  // -------------------------------------------------------------------
  // 1 — Happy path
  // -------------------------------------------------------------------
  it('runs validating→init→uploading→completing→done; PUT carries Content-Type, withCredentials:false, body is the File', async () => {
    setup();
    const file = new File(['data'], 'test.pdf', { type: 'application/pdf' });
    const init = vi.fn().mockResolvedValue({ fileId: 'f1', uploadUrl: 'https://storage.test/put' });
    const complete = vi.fn().mockResolvedValue({ state: 'INGESTED' });
    const emissions: PresignedUploadProgress[] = [];

    svc.upload(file, { init, complete }).subscribe((p) => emissions.push(p));

    await tick();
    const req = httpMock.expectOne('https://storage.test/put');
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toBe(file);
    expect(req.request.withCredentials).toBe(false);
    expect(req.request.headers.get('Content-Type')).toBe('application/pdf');

    req.event({ type: HttpEventType.UploadProgress, loaded: 50, total: 100 });
    req.flush({ state: 'INGESTED' });
    await tick();

    expect(emissions.map((e) => e.phase)).toEqual([
      'validating',
      'init',
      'uploading',
      'completing',
      'done',
    ]);
    const done = emissions[emissions.length - 1];
    expect(done.status).toBe('complete');
    expect(done.percent).toBe(100);
    expect(done.response).toEqual({ state: 'INGESTED' });
    expect(complete).toHaveBeenCalledWith('f1');
  });

  // -------------------------------------------------------------------
  // 2 — 403 → re-init → ok
  // -------------------------------------------------------------------
  it('re-inits and retries the PUT once on a 403, then completes', async () => {
    setup();
    const file = new File(['data'], 'a.pdf', { type: 'application/pdf' });
    const init = vi
      .fn()
      .mockResolvedValueOnce({ fileId: 'f1', uploadUrl: 'https://storage.test/put-1' })
      .mockResolvedValueOnce({ fileId: 'f1', uploadUrl: 'https://storage.test/put-2' });
    const complete = vi.fn().mockResolvedValue({ state: 'INGESTED' });
    const emissions: PresignedUploadProgress[] = [];

    svc.upload(file, { init, complete }).subscribe((p) => emissions.push(p));

    await tick();
    httpMock.expectOne('https://storage.test/put-1').flush('', { status: 403, statusText: 'Forbidden' });
    await tick();
    httpMock.expectOne('https://storage.test/put-2').flush({ state: 'INGESTED' });
    await tick();

    expect(init).toHaveBeenCalledTimes(2);
    expect(emissions[emissions.length - 1].phase).toBe('done');
  });

  // -------------------------------------------------------------------
  // 3 — 403 → re-init → 403 → error s3-forbidden
  // -------------------------------------------------------------------
  it('emits error s3-forbidden after the re-init retry is exhausted (init called 1 + maxExpiredRetries)', async () => {
    setup();
    const file = new File(['data'], 'a.pdf', { type: 'application/pdf' });
    const init = vi
      .fn()
      .mockResolvedValueOnce({ fileId: 'f1', uploadUrl: 'https://storage.test/put-1' })
      .mockResolvedValueOnce({ fileId: 'f1', uploadUrl: 'https://storage.test/put-2' });
    const complete = vi.fn();
    const emissions: PresignedUploadProgress[] = [];

    svc.upload(file, { init, complete }).subscribe((p) => emissions.push(p));

    await tick();
    httpMock.expectOne('https://storage.test/put-1').flush('', { status: 403, statusText: 'Forbidden' });
    await tick();
    httpMock.expectOne('https://storage.test/put-2').flush('', { status: 403, statusText: 'Forbidden' });
    await tick();

    expect(init).toHaveBeenCalledTimes(2);
    const last = emissions[emissions.length - 1];
    expect(last.phase).toBe('error');
    expect(last.errorCause).toBe('s3-forbidden');
    expect(complete).not.toHaveBeenCalled();
  });

  // -------------------------------------------------------------------
  // 4 — init fails → init-failed, zero PUTs
  // -------------------------------------------------------------------
  it('emits error init-failed and never issues a PUT when init rejects', async () => {
    setup();
    const file = new File(['data'], 'a.pdf', { type: 'application/pdf' });
    const init = vi.fn().mockRejectedValue(new Error('backend 500'));
    const complete = vi.fn();
    const emissions: PresignedUploadProgress[] = [];

    svc.upload(file, { init, complete }).subscribe((p) => emissions.push(p));
    await tick();

    httpMock.expectNone((req) => req.method === 'PUT');
    const last = emissions[emissions.length - 1];
    expect(last.phase).toBe('error');
    expect(last.errorCause).toBe('init-failed');
  });

  // -------------------------------------------------------------------
  // 5 — complete fails → complete-failed (PUT ran)
  // -------------------------------------------------------------------
  it('emits error complete-failed after the PUT succeeds but complete rejects', async () => {
    setup();
    const file = new File(['data'], 'a.pdf', { type: 'application/pdf' });
    const init = vi.fn().mockResolvedValue({ fileId: 'f1', uploadUrl: 'https://storage.test/put' });
    const complete = vi.fn().mockRejectedValue(new Error('complete 409'));
    const emissions: PresignedUploadProgress[] = [];

    svc.upload(file, { init, complete }).subscribe((p) => emissions.push(p));
    await tick();
    httpMock.expectOne('https://storage.test/put').flush({ ok: true });
    await tick();

    const last = emissions[emissions.length - 1];
    expect(last.phase).toBe('error');
    expect(last.errorCause).toBe('complete-failed');
    expect(complete).toHaveBeenCalledWith('f1');
  });

  // -------------------------------------------------------------------
  // 6 — Validation
  // -------------------------------------------------------------------
  it('rejects a file outside the allowlist with validation-failed (adapter untouched); validation:false disables it', async () => {
    setup({
      maxFileSizeBytes: 10,
      allowedMimeTypes: ['application/pdf'],
      maxConcurrentUploads: 5,
      enablePreview: true,
    });
    const file = new File(['x'.repeat(100)], 'big.bin', { type: 'application/octet-stream' });
    const init = vi.fn().mockResolvedValue({ fileId: 'f1', uploadUrl: 'https://storage.test/put' });
    const complete = vi.fn().mockResolvedValue({ ok: true });

    const rejected: PresignedUploadProgress[] = [];
    svc.upload(file, { init, complete }).subscribe((p) => rejected.push(p));
    await tick();

    expect(init).not.toHaveBeenCalled();
    httpMock.expectNone((req) => req.method === 'PUT');
    const last = rejected[rejected.length - 1];
    expect(last.phase).toBe('error');
    expect(last.errorCause).toBe('validation-failed');

    // validation:false skips the check and proceeds to init/PUT/complete
    const allowed: PresignedUploadProgress[] = [];
    svc.upload(file, { init, complete }, { validation: false }).subscribe((p) => allowed.push(p));
    await tick();
    httpMock.expectOne('https://storage.test/put').flush({ ok: true });
    await tick();

    expect(init).toHaveBeenCalledTimes(1);
    expect(allowed[allowed.length - 1].phase).toBe('done');
  });

  // -------------------------------------------------------------------
  // 7 — uploadMany concurrency + resilience
  // -------------------------------------------------------------------
  it('caps PUTs in flight at maxConcurrentUploads and one failure does not cancel the rest', async () => {
    setup({
      maxFileSizeBytes: 10_000_000,
      allowedMimeTypes: [],
      maxConcurrentUploads: 2,
      enablePreview: true,
    });
    const files = [0, 1, 2, 3].map((i) => new File(['d'], `f${i}.pdf`, { type: 'application/pdf' }));
    const init = vi.fn((f: File) => Promise.resolve({ fileId: f.name, uploadUrl: `https://storage.test/${f.name}` }));
    const complete = vi.fn().mockResolvedValue({ ok: true });

    let lastArray: readonly PresignedUploadProgress[] = [];
    let completed = false;
    svc.uploadMany(files, { init, complete }).subscribe({
      next: (a) => (lastArray = a),
      complete: () => (completed = true),
    });

    await tick();
    let inflight = httpMock.match((req) => req.method === 'PUT');
    expect(inflight.length).toBe(2); // never more than the cap

    inflight[0].flush({ ok: true });
    inflight[1].flush('', { status: 500, statusText: 'Server Error' }); // one fails
    await tick();

    inflight = httpMock.match((req) => req.method === 'PUT');
    expect(inflight.length).toBe(2); // next wave, still capped
    inflight[0].flush({ ok: true });
    inflight[1].flush({ ok: true });
    await tick();

    expect(completed).toBe(true);
    expect(lastArray.length).toBe(4);
    expect(lastArray.filter((s) => s.phase === 'error').length).toBe(1);
    expect(lastArray.filter((s) => s.phase === 'done').length).toBe(3);
  });

  // -------------------------------------------------------------------
  // 8 — Progress mapping
  // -------------------------------------------------------------------
  it('maps PUT UploadProgress events to percent/loadedBytes', async () => {
    setup();
    const file = new File(['data'], 'a.pdf', { type: 'application/pdf' });
    const init = vi.fn().mockResolvedValue({ fileId: 'f1', uploadUrl: 'https://storage.test/put' });
    const complete = vi.fn().mockResolvedValue({ ok: true });
    const emissions: PresignedUploadProgress[] = [];

    svc.upload(file, { init, complete }).subscribe((p) => emissions.push(p));
    await tick();
    const req = httpMock.expectOne('https://storage.test/put');
    req.event({ type: HttpEventType.UploadProgress, loaded: 25, total: 100 });
    req.event({ type: HttpEventType.UploadProgress, loaded: 100, total: 100 });
    req.flush({ ok: true });
    await tick();

    const uploading = emissions.filter((e) => e.phase === 'uploading');
    expect(uploading.length).toBe(2);
    expect(uploading[0].percent).toBe(25);
    expect(uploading[0].loadedBytes).toBe(25);
    expect(uploading[0].totalBytes).toBe(100);
    expect(uploading[1].percent).toBe(100);
  });
});
