import { TestBed } from '@angular/core/testing';
import { DOCUMENT } from '@angular/common';
import { FilePickerService } from './file-picker.service';

describe('FilePickerService', () => {
  let mockInput: {
    type: string;
    accept: string;
    multiple: boolean;
    style: { display: string };
    files: FileList | null;
    click: ReturnType<typeof vi.fn>;
    addEventListener: ReturnType<typeof vi.fn>;
    removeEventListener: ReturnType<typeof vi.fn>;
    parentNode: { removeChild: ReturnType<typeof vi.fn> } | null;
  };
  let listeners: Record<string, (...args: unknown[]) => void>;
  let mockDoc: {
    createElement: ReturnType<typeof vi.fn>;
    body: { appendChild: ReturnType<typeof vi.fn> };
  };

  function setup() {
    listeners = {};
    mockInput = {
      type: '',
      accept: '',
      multiple: false,
      style: { display: '' },
      files: null,
      click: vi.fn(),
      addEventListener: vi.fn((event: string, fn: (...args: unknown[]) => void) => {
        listeners[event] = fn;
      }),
      removeEventListener: vi.fn(),
      parentNode: { removeChild: vi.fn() },
    };

    mockDoc = {
      createElement: vi.fn().mockReturnValue(mockInput),
      body: { appendChild: vi.fn() },
    };

    TestBed.configureTestingModule({
      providers: [
        FilePickerService,
        { provide: DOCUMENT, useValue: mockDoc },
      ],
    });
    return TestBed.inject(FilePickerService);
  }

  function createFileList(files: File[]): FileList {
    const list = {
      length: files.length,
      item: (i: number) => files[i] ?? null,
      [Symbol.iterator]: function* () { yield* files; },
    } as unknown as FileList;
    for (let i = 0; i < files.length; i++) {
      (list as any)[i] = files[i];
    }
    return list;
  }

  // -------------------------------------------------------------------
  // pickFile
  // -------------------------------------------------------------------
  it('should create a hidden file input and click it', async () => {
    const svc = setup();
    const promise = svc.pickFile();

    expect(mockDoc.createElement).toHaveBeenCalledWith('input');
    expect(mockInput.type).toBe('file');
    expect(mockInput.style.display).toBe('none');
    expect(mockDoc.body.appendChild).toHaveBeenCalledWith(mockInput);
    expect(mockInput.click).toHaveBeenCalled();

    // Simulate user selecting a file
    const file = new File(['content'], 'test.pdf', { type: 'application/pdf' });
    mockInput.files = createFileList([file]);
    listeners['change']();

    const result = await promise;
    expect(result).toEqual([file]);
  });

  it('should set accept attribute when provided', async () => {
    const svc = setup();
    const promise = svc.pickFile('image/*');
    mockInput.files = createFileList([]);
    listeners['change']();
    await promise;

    expect(mockInput.accept).toBe('image/*');
  });

  it('should set multiple attribute when true', async () => {
    const svc = setup();
    const promise = svc.pickFile(undefined, true);
    mockInput.files = createFileList([]);
    listeners['change']();
    await promise;

    expect(mockInput.multiple).toBe(true);
  });

  it('should not set multiple when false or undefined', async () => {
    const svc = setup();
    const promise = svc.pickFile();
    mockInput.files = createFileList([]);
    listeners['change']();
    await promise;

    expect(mockInput.multiple).toBe(false);
  });

  it('should return multiple files when multiple is true', async () => {
    const svc = setup();
    const promise = svc.pickFile(undefined, true);

    const f1 = new File(['a'], 'a.txt', { type: 'text/plain' });
    const f2 = new File(['b'], 'b.txt', { type: 'text/plain' });
    mockInput.files = createFileList([f1, f2]);
    listeners['change']();

    const result = await promise;
    expect(result).toEqual([f1, f2]);
  });

  it('should return empty array when cancelled', async () => {
    const svc = setup();
    const promise = svc.pickFile();
    listeners['cancel']();

    const result = await promise;
    expect(result).toEqual([]);
  });

  it('should return empty array when files is null on change', async () => {
    const svc = setup();
    const promise = svc.pickFile();
    mockInput.files = null;
    listeners['change']();

    const result = await promise;
    expect(result).toEqual([]);
  });

  it('should cleanup input after selection', async () => {
    const svc = setup();
    const promise = svc.pickFile();
    mockInput.files = createFileList([]);
    listeners['change']();
    await promise;

    expect(mockInput.removeEventListener).toHaveBeenCalledWith('change', expect.any(Function));
    expect(mockInput.removeEventListener).toHaveBeenCalledWith('cancel', expect.any(Function));
    expect(mockInput.parentNode!.removeChild).toHaveBeenCalledWith(mockInput);
  });

  it('should cleanup input after cancel', async () => {
    const svc = setup();
    const promise = svc.pickFile();
    listeners['cancel']();
    await promise;

    expect(mockInput.removeEventListener).toHaveBeenCalled();
  });

  // -------------------------------------------------------------------
  // pickImage
  // -------------------------------------------------------------------
  it('should call pickFile with image/* and single mode', async () => {
    const svc = setup();
    const promise = svc.pickImage();

    expect(mockInput.accept).toBe('image/*');
    expect(mockInput.multiple).toBe(false);

    const img = new File(['pixels'], 'photo.png', { type: 'image/png' });
    mockInput.files = createFileList([img]);
    listeners['change']();

    const result = await promise;
    expect(result).toEqual(img);
  });

  it('should return null from pickImage when cancelled', async () => {
    const svc = setup();
    const promise = svc.pickImage();
    listeners['cancel']();

    const result = await promise;
    expect(result).toBeNull();
  });
});
