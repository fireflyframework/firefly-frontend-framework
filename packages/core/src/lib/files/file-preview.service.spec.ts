import { TestBed } from '@angular/core/testing';
import { DOCUMENT } from '@angular/common';
import { FilePreviewService } from './file-preview.service';
import { FILES_CONFIG } from './file.types';

describe('FilePreviewService', () => {
  let svc: FilePreviewService;
  let mockWindow: { open: ReturnType<typeof vi.fn> };
  let mockDoc: { defaultView: any };
  let createObjectURLSpy: ReturnType<typeof vi.spyOn>;
  let revokeObjectURLSpy: ReturnType<typeof vi.spyOn>;
  let urlCounter: number;

  function setup(config?: object) {
    TestBed.resetTestingModule();

    mockWindow = { open: vi.fn() };
    mockDoc = { defaultView: mockWindow };

    TestBed.configureTestingModule({
      providers: [
        FilePreviewService,
        { provide: DOCUMENT, useValue: mockDoc },
        ...(config ? [{ provide: FILES_CONFIG, useValue: config }] : []),
      ],
    });

    svc = TestBed.inject(FilePreviewService);
  }

  beforeEach(() => {
    urlCounter = 0;
    createObjectURLSpy = vi.spyOn(URL, 'createObjectURL').mockImplementation(() => {
      return `blob:mock-url-${++urlCounter}`;
    });
    revokeObjectURLSpy = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => { /* noop */ });
  });

  afterEach(() => {
    createObjectURLSpy.mockRestore();
    revokeObjectURLSpy.mockRestore();
  });

  // -------------------------------------------------------------------
  // createBlobUrl()
  // -------------------------------------------------------------------
  describe('createBlobUrl()', () => {
    it('should create a blob URL from a blob', () => {
      setup();
      const blob = new Blob(['test'], { type: 'text/plain' });
      const url = svc.createBlobUrl(blob);

      expect(createObjectURLSpy).toHaveBeenCalledWith(blob);
      expect(url).toBe('blob:mock-url-1');
    });

    it('should track the created URL', () => {
      setup();
      const blob = new Blob(['test'], { type: 'text/plain' });
      svc.createBlobUrl(blob);

      expect(svc.activeUrlCount).toBe(1);
    });
  });

  // -------------------------------------------------------------------
  // revokeBlobUrl()
  // -------------------------------------------------------------------
  describe('revokeBlobUrl()', () => {
    it('should revoke a blob URL', () => {
      setup();
      const blob = new Blob(['test'], { type: 'text/plain' });
      const url = svc.createBlobUrl(blob);
      svc.revokeBlobUrl(url);

      expect(revokeObjectURLSpy).toHaveBeenCalledWith(url);
    });

    it('should remove the URL from tracking', () => {
      setup();
      const blob = new Blob(['test'], { type: 'text/plain' });
      const url = svc.createBlobUrl(blob);
      svc.revokeBlobUrl(url);

      expect(svc.activeUrlCount).toBe(0);
    });
  });

  // -------------------------------------------------------------------
  // revokeAll()
  // -------------------------------------------------------------------
  describe('revokeAll()', () => {
    it('should revoke all tracked URLs', () => {
      setup();
      const b1 = new Blob(['a'], { type: 'text/plain' });
      const b2 = new Blob(['b'], { type: 'text/plain' });
      svc.createBlobUrl(b1);
      svc.createBlobUrl(b2);

      svc.revokeAll();

      expect(revokeObjectURLSpy).toHaveBeenCalledTimes(2);
      expect(svc.activeUrlCount).toBe(0);
    });
  });

  // -------------------------------------------------------------------
  // previewInNewTab()
  // -------------------------------------------------------------------
  describe('previewInNewTab()', () => {
    it('should create a blob URL and open it in a new tab', () => {
      setup();
      const blob = new Blob(['pdf content'], { type: 'application/pdf' });
      const url = svc.previewInNewTab(blob);

      expect(createObjectURLSpy).toHaveBeenCalled();
      expect(mockWindow.open).toHaveBeenCalledWith(url, '_blank');
      expect(url).toBe('blob:mock-url-1');
    });

    it('should track the URL for cleanup', () => {
      setup();
      const blob = new Blob(['content'], { type: 'text/plain' });
      svc.previewInNewTab(blob);

      expect(svc.activeUrlCount).toBe(1);
    });

    it('should create a new blob with override MIME type when provided', () => {
      setup();
      const blob = new Blob(['content'], { type: 'application/octet-stream' });
      svc.previewInNewTab(blob, 'application/pdf');

      // createObjectURL is called with a new Blob (with overridden type)
      const calledBlob = createObjectURLSpy.mock.calls[0][0] as Blob;
      expect(calledBlob.type).toBe('application/pdf');
    });

    it('should return null when enablePreview is false', () => {
      setup({
        maxFileSizeBytes: 10_000_000,
        allowedMimeTypes: [],
        maxConcurrentUploads: 5,
        enablePreview: false,
      });
      const blob = new Blob(['content'], { type: 'text/plain' });
      const result = svc.previewInNewTab(blob);

      expect(result).toBeNull();
      expect(mockWindow.open).not.toHaveBeenCalled();
    });

    it('should work when enablePreview is true', () => {
      setup({
        maxFileSizeBytes: 10_000_000,
        allowedMimeTypes: [],
        maxConcurrentUploads: 5,
        enablePreview: true,
      });
      const blob = new Blob(['content'], { type: 'text/plain' });
      const url = svc.previewInNewTab(blob);

      expect(url).not.toBeNull();
      expect(mockWindow.open).toHaveBeenCalled();
    });

    it('should work without FILES_CONFIG (preview enabled by default)', () => {
      setup(); // no config
      const blob = new Blob(['content'], { type: 'text/plain' });
      const url = svc.previewInNewTab(blob);

      expect(url).not.toBeNull();
      expect(mockWindow.open).toHaveBeenCalled();
    });
  });
});
