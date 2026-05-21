import { TestBed } from '@angular/core/testing';
import { DOCUMENT } from '@angular/common';
import { FileDownloadService } from './file-download.service';

describe('FileDownloadService', () => {
  let svc: FileDownloadService;
  let mockAnchor: {
    href: string;
    download: string;
    style: { display: string };
    click: ReturnType<typeof vi.fn>;
  };
  let mockDoc: {
    createElement: ReturnType<typeof vi.fn>;
    body: { appendChild: ReturnType<typeof vi.fn>; removeChild: ReturnType<typeof vi.fn> };
  };

  beforeEach(() => {
    mockAnchor = {
      href: '',
      download: '',
      style: { display: '' },
      click: vi.fn(),
    };

    mockDoc = {
      createElement: vi.fn().mockReturnValue(mockAnchor),
      body: {
        appendChild: vi.fn(),
        removeChild: vi.fn(),
      },
    };

    TestBed.configureTestingModule({
      providers: [
        FileDownloadService,
        { provide: DOCUMENT, useValue: mockDoc },
      ],
    });

    svc = TestBed.inject(FileDownloadService);
  });

  // -------------------------------------------------------------------
  // download()
  // -------------------------------------------------------------------
  describe('download()', () => {
    it('should create an anchor element', () => {
      svc.download('/api/file/1', 'report.pdf');
      expect(mockDoc.createElement).toHaveBeenCalledWith('a');
    });

    it('should set href and download attributes', () => {
      svc.download('/api/file/1', 'report.pdf');
      expect(mockAnchor.href).toBe('/api/file/1');
      expect(mockAnchor.download).toBe('report.pdf');
    });

    it('should hide the anchor element', () => {
      svc.download('/api/file/1', 'report.pdf');
      expect(mockAnchor.style.display).toBe('none');
    });

    it('should append anchor to body, click it, and remove it', () => {
      svc.download('/api/file/1', 'report.pdf');

      expect(mockDoc.body.appendChild).toHaveBeenCalledWith(mockAnchor);
      expect(mockAnchor.click).toHaveBeenCalled();
      expect(mockDoc.body.removeChild).toHaveBeenCalledWith(mockAnchor);

      // Verify order: append -> click -> remove
      const appendOrder = mockDoc.body.appendChild.mock.invocationCallOrder[0];
      const clickOrder = mockAnchor.click.mock.invocationCallOrder[0];
      const removeOrder = mockDoc.body.removeChild.mock.invocationCallOrder[0];
      expect(appendOrder).toBeLessThan(clickOrder);
      expect(clickOrder).toBeLessThan(removeOrder);
    });
  });

  // -------------------------------------------------------------------
  // downloadBlob()
  // -------------------------------------------------------------------
  describe('downloadBlob()', () => {
    let createObjectURLSpy: ReturnType<typeof vi.spyOn>;
    let revokeObjectURLSpy: ReturnType<typeof vi.spyOn>;

    beforeEach(() => {
      createObjectURLSpy = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:mock-url');
      revokeObjectURLSpy = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => { /* noop */ });
    });

    afterEach(() => {
      createObjectURLSpy.mockRestore();
      revokeObjectURLSpy.mockRestore();
    });

    it('should create a blob URL from the blob', () => {
      const blob = new Blob(['test'], { type: 'text/plain' });
      svc.downloadBlob(blob, 'test.txt');
      expect(createObjectURLSpy).toHaveBeenCalledWith(blob);
    });

    it('should download using the blob URL', () => {
      const blob = new Blob(['test'], { type: 'text/plain' });
      svc.downloadBlob(blob, 'test.txt');
      expect(mockAnchor.href).toBe('blob:mock-url');
      expect(mockAnchor.download).toBe('test.txt');
    });

    it('should revoke the blob URL after download', () => {
      const blob = new Blob(['test'], { type: 'text/plain' });
      svc.downloadBlob(blob, 'test.txt');
      expect(revokeObjectURLSpy).toHaveBeenCalledWith('blob:mock-url');
    });

    it('should revoke after clicking (correct order)', () => {
      const blob = new Blob(['test'], { type: 'text/plain' });
      svc.downloadBlob(blob, 'test.txt');

      const clickOrder = mockAnchor.click.mock.invocationCallOrder[0];
      const revokeOrder = revokeObjectURLSpy.mock.invocationCallOrder[0];
      expect(clickOrder).toBeLessThan(revokeOrder);
    });
  });
});
