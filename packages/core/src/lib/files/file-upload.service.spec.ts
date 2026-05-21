import { TestBed } from '@angular/core/testing';
import {
  HttpClient,
  provideHttpClient,
} from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { FileUploadService } from './file-upload.service';
import { FILES_CONFIG, UploadProgress } from './file.types';

describe('FileUploadService', () => {
  let svc: FileUploadService;
  let httpMock: HttpTestingController;

  function setup(config?: object) {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        FileUploadService,
        provideHttpClient(),
        provideHttpClientTesting(),
        ...(config ? [{ provide: FILES_CONFIG, useValue: config }] : []),
      ],
    });
    svc = TestBed.inject(FileUploadService);
    httpMock = TestBed.inject(HttpTestingController);
  }

  afterEach(() => {
    httpMock?.verify();
  });

  // -------------------------------------------------------------------
  // upload() basics
  // -------------------------------------------------------------------
  it('should POST file as FormData to the given endpoint', () => {
    setup();
    const file = new File(['data'], 'test.pdf', { type: 'application/pdf' });
    svc.upload(file, '/api/upload').subscribe();

    const req = httpMock.expectOne('/api/upload');
    expect(req.request.method).toBe('POST');
    expect(req.request.body instanceof FormData).toBe(true);
    req.flush({ id: '123' });
  });

  it('should emit uploading status on Sent event', () => {
    setup();
    const file = new File(['data'], 'test.pdf', { type: 'application/pdf' });
    const emissions: UploadProgress[] = [];

    svc.upload(file, '/api/upload').subscribe(p => emissions.push(p));

    const req = httpMock.expectOne('/api/upload');
    req.flush({ id: '123' });

    // Should have at least a complete emission
    const last = emissions[emissions.length - 1];
    expect(last.status).toBe('complete');
    expect(last.percent).toBe(100);
  });

  it('should emit progress events with percentage', () => {
    setup();
    const file = new File(['data'], 'test.pdf', { type: 'application/pdf' });
    const emissions: UploadProgress[] = [];

    svc.upload(file, '/api/upload').subscribe(p => emissions.push(p));

    const req = httpMock.expectOne('/api/upload');

    // Simulate progress events
    req.event({ type: 0 }); // Sent
    req.event({ type: 1, loaded: 50, total: 100 }); // UploadProgress
    req.event({ type: 1, loaded: 100, total: 100 }); // UploadProgress
    req.event({ type: 4, body: { ok: true }, status: 200, statusText: 'OK', headers: req.request.headers, url: '/api/upload' }); // Response

    // HttpClient may emit additional internal events; check key states
    expect(emissions.length).toBeGreaterThanOrEqual(4);

    // Find key states in emissions
    const uploading = emissions.filter(e => e.status === 'uploading');
    const complete = emissions.filter(e => e.status === 'complete');

    expect(uploading.length).toBeGreaterThanOrEqual(2);
    // First uploading event: Sent (0%)
    expect(uploading[0].percent).toBe(0);
    // Progress events
    const progress50 = uploading.find(e => e.percent === 50);
    expect(progress50).toBeDefined();
    expect(progress50!.loadedBytes).toBe(50);
    expect(progress50!.totalBytes).toBe(100);
    const progress100 = uploading.find(e => e.percent === 100);
    expect(progress100).toBeDefined();
    // Complete
    expect(complete.length).toBe(1);
    expect(complete[0].percent).toBe(100);
    expect(complete[0].response).toEqual({ ok: true });
  });

  // -------------------------------------------------------------------
  // Headers
  // -------------------------------------------------------------------
  it('should pass custom headers', () => {
    setup();
    const file = new File(['data'], 'test.pdf', { type: 'application/pdf' });
    svc.upload(file, '/api/upload', { 'X-Custom': 'value' }).subscribe();

    const req = httpMock.expectOne('/api/upload');
    expect(req.request.headers.get('X-Custom')).toBe('value');
    req.flush({});
  });

  // -------------------------------------------------------------------
  // Error handling
  // -------------------------------------------------------------------
  it('should throw when no endpoint is provided and no config', () => {
    setup();
    const file = new File(['data'], 'test.pdf', { type: 'application/pdf' });
    expect(() => svc.upload(file, '')).toThrow(/No upload endpoint/);
  });

  it('should use FILES_CONFIG.uploadEndpoint as fallback', () => {
    setup({
      maxFileSizeBytes: 10_000_000,
      allowedMimeTypes: [],
      maxConcurrentUploads: 5,
      uploadEndpoint: '/api/config-upload',
      enablePreview: true,
    });
    const file = new File(['data'], 'test.pdf', { type: 'application/pdf' });
    svc.upload(file, '').subscribe();

    const req = httpMock.expectOne('/api/config-upload');
    expect(req.request.method).toBe('POST');
    req.flush({});
  });

  it('should propagate HTTP errors to subscriber', () => {
    setup();
    const file = new File(['data'], 'test.pdf', { type: 'application/pdf' });
    let error: any;

    svc.upload(file, '/api/upload').subscribe({
      error: e => (error = e),
    });

    const req = httpMock.expectOne('/api/upload');
    req.flush('Server Error', { status: 500, statusText: 'Internal Server Error' });

    expect(error).toBeDefined();
    expect(error.status).toBe(500);
  });

  // -------------------------------------------------------------------
  // uploadMultiple()
  // -------------------------------------------------------------------
  it('should upload multiple files and return array of results', () => {
    setup();
    const f1 = new File(['a'], 'a.txt', { type: 'text/plain' });
    const f2 = new File(['b'], 'b.txt', { type: 'text/plain' });
    let result: UploadProgress[] | undefined;

    svc.uploadMultiple([f1, f2], '/api/upload').subscribe(r => (result = r));

    const reqs = httpMock.match('/api/upload');
    expect(reqs.length).toBe(2);
    reqs[0].flush({ id: '1' });
    reqs[1].flush({ id: '2' });

    expect(result).toBeDefined();
    expect(result!.length).toBe(2);
    expect(result![0].status).toBe('complete');
    expect(result![1].status).toBe('complete');
  });
});
