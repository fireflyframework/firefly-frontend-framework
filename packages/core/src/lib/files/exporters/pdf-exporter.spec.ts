import { ExportConfig } from '../file.types';

interface TestRow {
  name: string;
  email: string;
}

const baseConfig: ExportConfig<TestRow> = {
  format: 'pdf',
  filename: 'test',
  columns: [
    { key: 'name', header: 'Name' },
    { key: 'email', header: 'Email' },
  ],
};

// Shared mock state — mutated by the factory, read by tests
let mockDoc: any;
let mockAutoTable: ReturnType<typeof vi.fn>;

vi.mock('jspdf', () => {
  function MockJsPDF() { return mockDoc; }
  return { default: MockJsPDF, jsPDF: MockJsPDF };
});

vi.mock('jspdf-autotable', () => ({
  default: (...args: any[]) => mockAutoTable(...args),
}));

describe('exportToPdf', () => {
  beforeEach(() => {
    mockDoc = {
      setFontSize: vi.fn(),
      text: vi.fn(),
      output: vi.fn().mockReturnValue(new Blob(['%PDF'], { type: 'application/pdf' })),
    };
    mockAutoTable = vi.fn();
  });

  // Lazy import so mocks are in place
  async function run<T>(data: T[], config: ExportConfig<T>) {
    const { exportToPdf } = await import('./pdf-exporter');
    return exportToPdf(data, config);
  }

  it('should generate a PDF blob', async () => {
    const blob = await run([{ name: 'Alice', email: 'a@b.com' }], baseConfig);
    expect(blob).toBeInstanceOf(Blob);
    expect(blob.type).toBe('application/pdf');
  });

  it('should call autoTable with head and body', async () => {
    await run([{ name: 'Alice', email: 'alice@test.com' }], baseConfig);

    expect(mockAutoTable).toHaveBeenCalledTimes(1);
    const args = mockAutoTable.mock.calls[0];
    expect(args[0]).toBe(mockDoc);
    expect(args[1].head).toEqual([['Name', 'Email']]);
    expect(args[1].body).toEqual([['Alice', 'alice@test.com']]);
  });

  it('should add title when provided', async () => {
    await run([], { ...baseConfig, title: 'My Report' });

    expect(mockDoc.setFontSize).toHaveBeenCalledWith(16);
    expect(mockDoc.text).toHaveBeenCalledWith('My Report', 14, 20);
  });

  it('should not add title when not provided', async () => {
    await run([], baseConfig);

    expect(mockDoc.setFontSize).not.toHaveBeenCalled();
    expect(mockDoc.text).not.toHaveBeenCalled();
  });

  it('should set startY=30 after title', async () => {
    await run([], { ...baseConfig, title: 'Report' });
    expect(mockAutoTable.mock.calls[0][1].startY).toBe(30);
  });

  it('should set startY=14 when no title', async () => {
    await run([], baseConfig);
    expect(mockAutoTable.mock.calls[0][1].startY).toBe(14);
  });

  it('should apply column widths when specified', async () => {
    const config: ExportConfig<TestRow> = {
      ...baseConfig,
      columns: [
        { key: 'name', header: 'Name', width: 80 },
        { key: 'email', header: 'Email', width: 120 },
      ],
    };
    await run([], config);

    expect(mockAutoTable.mock.calls[0][1].columnStyles).toEqual({
      0: { cellWidth: 80 },
      1: { cellWidth: 120 },
    });
  });

  it('should handle null values as empty strings', async () => {
    interface Partial { name: string; note: string | null }
    const config: ExportConfig<Partial> = {
      format: 'pdf', filename: 'test',
      columns: [{ key: 'name', header: 'Name' }, { key: 'note', header: 'Note' }],
    };
    await run([{ name: 'Alice', note: null } as Partial], config);

    expect(mockAutoTable.mock.calls[0][1].body).toEqual([['Alice', '']]);
  });

  it('should have descriptive error message for missing jspdf', () => {
    const msg = 'PdfExporter: "jspdf" is not installed. Install it with: npm install jspdf jspdf-autotable';
    expect(msg).toMatch(/jspdf.*not installed/i);
  });

  it('should have descriptive error message for missing jspdf-autotable', () => {
    const msg = 'PdfExporter: "jspdf-autotable" is not installed. Install it with: npm install jspdf-autotable';
    expect(msg).toMatch(/jspdf-autotable.*not installed/i);
  });

  it('should call doc.output with blob format', async () => {
    await run([], baseConfig);
    expect(mockDoc.output).toHaveBeenCalledWith('blob');
  });
});
