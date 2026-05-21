import { TestBed } from '@angular/core/testing';
import { FileExportService } from './file-export.service';
import { FileDownloadService } from './file-download.service';
import { ExportConfig } from './file.types';

// ---------------------------------------------------------------------------
// Mock the three exporter modules
// ---------------------------------------------------------------------------
let mockCsvBlob: Blob;
let mockPdfBlob: Blob;
let mockExcelBlob: Blob;

vi.mock('./exporters/csv-exporter', () => ({
  exportToCsv: (...args: any[]) => mockCsvBlob,
}));

vi.mock('./exporters/pdf-exporter', () => ({
  exportToPdf: (...args: any[]) => Promise.resolve(mockPdfBlob),
}));

vi.mock('./exporters/excel-exporter', () => ({
  exportToExcel: (...args: any[]) => Promise.resolve(mockExcelBlob),
}));

interface TestRow {
  name: string;
  email: string;
}

const TEST_DATA: TestRow[] = [
  { name: 'Alice', email: 'alice@test.com' },
  { name: 'Bob', email: 'bob@test.com' },
];

function makeConfig(format: 'csv' | 'pdf' | 'xlsx'): ExportConfig<TestRow> {
  return {
    format,
    filename: 'test-export',
    columns: [
      { key: 'name', header: 'Name' },
      { key: 'email', header: 'Email' },
    ],
  };
}

describe('FileExportService', () => {
  let svc: FileExportService;
  let downloadSpy: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockCsvBlob = new Blob(['csv-data'], { type: 'text/csv' });
    mockPdfBlob = new Blob(['pdf-data'], { type: 'application/pdf' });
    mockExcelBlob = new Blob(['excel-data'], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

    downloadSpy = vi.fn();

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        FileExportService,
        { provide: FileDownloadService, useValue: { downloadBlob: downloadSpy } },
      ],
    });

    svc = TestBed.inject(FileExportService);
  });

  // -------------------------------------------------------------------
  // export() — format routing
  // -------------------------------------------------------------------
  it('should export CSV and trigger download with .csv extension', async () => {
    await svc.export(TEST_DATA, makeConfig('csv'));

    expect(downloadSpy).toHaveBeenCalledOnce();
    expect(downloadSpy).toHaveBeenCalledWith(mockCsvBlob, 'test-export.csv');
  });

  it('should export PDF and trigger download with .pdf extension', async () => {
    await svc.export(TEST_DATA, makeConfig('pdf'));

    expect(downloadSpy).toHaveBeenCalledOnce();
    expect(downloadSpy).toHaveBeenCalledWith(mockPdfBlob, 'test-export.pdf');
  });

  it('should export Excel and trigger download with .xlsx extension', async () => {
    await svc.export(TEST_DATA, makeConfig('xlsx'));

    expect(downloadSpy).toHaveBeenCalledOnce();
    expect(downloadSpy).toHaveBeenCalledWith(mockExcelBlob, 'test-export.xlsx');
  });

  // -------------------------------------------------------------------
  // generateBlob() — returns blob without download
  // -------------------------------------------------------------------
  it('should generate CSV blob without triggering download', async () => {
    const blob = await svc.generateBlob(TEST_DATA, makeConfig('csv'));

    expect(blob).toBe(mockCsvBlob);
    expect(downloadSpy).not.toHaveBeenCalled();
  });

  it('should generate PDF blob without triggering download', async () => {
    const blob = await svc.generateBlob(TEST_DATA, makeConfig('pdf'));

    expect(blob).toBe(mockPdfBlob);
    expect(downloadSpy).not.toHaveBeenCalled();
  });

  it('should generate Excel blob without triggering download', async () => {
    const blob = await svc.generateBlob(TEST_DATA, makeConfig('xlsx'));

    expect(blob).toBe(mockExcelBlob);
    expect(downloadSpy).not.toHaveBeenCalled();
  });

  // -------------------------------------------------------------------
  // Error handling
  // -------------------------------------------------------------------
  it('should throw for unsupported format', async () => {
    const config = { ...makeConfig('csv'), format: 'xml' as any };

    await expect(svc.export(TEST_DATA, config)).rejects.toThrow(
      /Unsupported export format "xml"/,
    );
    expect(downloadSpy).not.toHaveBeenCalled();
  });

  it('should include supported formats in error message', async () => {
    const config = { ...makeConfig('csv'), format: 'html' as any };

    await expect(svc.generateBlob(TEST_DATA, config)).rejects.toThrow(
      /Supported: csv, pdf, xlsx/,
    );
  });

  // -------------------------------------------------------------------
  // Filename extension
  // -------------------------------------------------------------------
  it('should append .csv extension to filename', async () => {
    await svc.export(TEST_DATA, { ...makeConfig('csv'), filename: 'report' });
    expect(downloadSpy.mock.calls[0][1]).toBe('report.csv');
  });

  it('should append .pdf extension to filename', async () => {
    await svc.export(TEST_DATA, { ...makeConfig('pdf'), filename: 'report' });
    expect(downloadSpy.mock.calls[0][1]).toBe('report.pdf');
  });

  it('should append .xlsx extension to filename', async () => {
    await svc.export(TEST_DATA, { ...makeConfig('xlsx'), filename: 'report' });
    expect(downloadSpy.mock.calls[0][1]).toBe('report.xlsx');
  });
});
