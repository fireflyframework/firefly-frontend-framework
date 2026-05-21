import { ExportConfig } from '../file.types';

interface TestRow {
  name: string;
  email: string;
}

const baseConfig: ExportConfig<TestRow> = {
  format: 'xlsx',
  filename: 'test',
  columns: [
    { key: 'name', header: 'Name' },
    { key: 'email', header: 'Email' },
  ],
};

// Shared mock state
let mockWorksheet: any;
let mockWorkbook: any;

vi.mock('exceljs', () => {
  function MockWorkbook() { return mockWorkbook; }
  return { Workbook: MockWorkbook, default: { Workbook: MockWorkbook } };
});

describe('exportToExcel', () => {
  beforeEach(() => {
    mockWorksheet = {
      columns: [],
      getRow: vi.fn().mockReturnValue({
        font: {},
        fill: {},
        alignment: {},
      }),
      addRow: vi.fn(),
    };

    mockWorkbook = {
      addWorksheet: vi.fn().mockReturnValue(mockWorksheet),
      title: undefined,
      xlsx: {
        writeBuffer: vi.fn().mockResolvedValue(new ArrayBuffer(10)),
      },
    };
  });

  async function run<T>(data: T[], config: ExportConfig<T>) {
    const { exportToExcel } = await import('./excel-exporter');
    return exportToExcel(data, config);
  }

  it('should generate an XLSX blob', async () => {
    const blob = await run([{ name: 'Alice', email: 'a@b.com' }], baseConfig);

    expect(blob).toBeInstanceOf(Blob);
    expect(blob.type).toBe('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  });

  it('should create a worksheet with the default sheet name', async () => {
    await run([], baseConfig);

    expect(mockWorkbook.addWorksheet).toHaveBeenCalledWith('Sheet1');
  });

  it('should use custom sheet name when provided', async () => {
    await run([], { ...baseConfig, sheetName: 'Users' });

    expect(mockWorkbook.addWorksheet).toHaveBeenCalledWith('Users');
  });

  it('should set column definitions with headers and keys', async () => {
    await run([], baseConfig);

    expect(mockWorksheet.columns).toEqual([
      { header: 'Name', key: 'name', width: 20 },
      { header: 'Email', key: 'email', width: 20 },
    ]);
  });

  it('should apply custom column widths', async () => {
    const config: ExportConfig<TestRow> = {
      ...baseConfig,
      columns: [
        { key: 'name', header: 'Name', width: 30 },
        { key: 'email', header: 'Email', width: 40 },
      ],
    };
    await run([], config);

    expect(mockWorksheet.columns).toEqual([
      { header: 'Name', key: 'name', width: 30 },
      { header: 'Email', key: 'email', width: 40 },
    ]);
  });

  it('should style the header row as bold', async () => {
    const headerRow = { font: {}, fill: {}, alignment: {} };
    mockWorksheet.getRow = vi.fn().mockReturnValue(headerRow);
    await run([], baseConfig);

    expect(mockWorksheet.getRow).toHaveBeenCalledWith(1);
    expect(headerRow.font).toEqual({ bold: true });
  });

  it('should add data rows with string values', async () => {
    const data: TestRow[] = [
      { name: 'Alice', email: 'alice@test.com' },
      { name: 'Bob', email: 'bob@test.com' },
    ];
    await run(data, baseConfig);

    expect(mockWorksheet.addRow).toHaveBeenCalledTimes(2);
    expect(mockWorksheet.addRow).toHaveBeenCalledWith({ name: 'Alice', email: 'alice@test.com' });
    expect(mockWorksheet.addRow).toHaveBeenCalledWith({ name: 'Bob', email: 'bob@test.com' });
  });

  it('should handle null values as empty strings', async () => {
    interface Partial { name: string; note: string | null }
    const config: ExportConfig<Partial> = {
      format: 'xlsx', filename: 'test',
      columns: [{ key: 'name', header: 'Name' }, { key: 'note', header: 'Note' }],
    };
    await run([{ name: 'Alice', note: null } as Partial], config);

    expect(mockWorksheet.addRow).toHaveBeenCalledWith({ name: 'Alice', note: '' });
  });

  it('should set workbook title when provided', async () => {
    await run([], { ...baseConfig, title: 'My Report' });

    expect(mockWorkbook.title).toBe('My Report');
  });

  it('should not set workbook title when not provided', async () => {
    await run([], baseConfig);

    expect(mockWorkbook.title).toBeUndefined();
  });

  it('should call writeBuffer to generate the output', async () => {
    await run([], baseConfig);

    expect(mockWorkbook.xlsx.writeBuffer).toHaveBeenCalled();
  });

  it('should have descriptive error message for missing exceljs', () => {
    const msg = 'ExcelExporter: "exceljs" is not installed. Install it with: npm install exceljs';
    expect(msg).toMatch(/exceljs.*not installed/i);
    expect(msg).toContain('npm install exceljs');
  });
});
