import { exportToCsv } from './csv-exporter';
import { ExportConfig } from '../file.types';

interface TestRow {
  name: string;
  email: string;
  age: number;
}

const columns: ExportConfig<TestRow>['columns'] = [
  { key: 'name', header: 'Name' },
  { key: 'email', header: 'Email' },
  { key: 'age', header: 'Age' },
];

function blobToText(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsText(blob);
  });
}

describe('exportToCsv', () => {
  const baseConfig: ExportConfig<TestRow> = {
    format: 'csv',
    filename: 'test',
    columns,
  };

  it('should generate CSV with headers and data rows', async () => {
    const data: TestRow[] = [
      { name: 'Alice', email: 'alice@test.com', age: 30 },
      { name: 'Bob', email: 'bob@test.com', age: 25 },
    ];

    const blob = exportToCsv(data, baseConfig);
    const text = await blobToText(blob);

    expect(text).toContain('Name,Email,Age');
    expect(text).toContain('Alice,alice@test.com,30');
    expect(text).toContain('Bob,bob@test.com,25');
  });

  it('should include UTF-8 BOM as first bytes', async () => {
    const blob = exportToCsv([], baseConfig);
    const buffer = await new Promise<ArrayBuffer>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as ArrayBuffer);
      reader.onerror = () => reject(reader.error);
      reader.readAsArrayBuffer(blob);
    });
    const bytes = new Uint8Array(buffer);
    // UTF-8 BOM = EF BB BF
    expect(bytes[0]).toBe(0xef);
    expect(bytes[1]).toBe(0xbb);
    expect(bytes[2]).toBe(0xbf);
  });

  it('should have correct MIME type', () => {
    const blob = exportToCsv([], baseConfig);
    expect(blob.type).toBe('text/csv;charset=utf-8');
  });

  it('should use comma as default separator', async () => {
    const data: TestRow[] = [{ name: 'Alice', email: 'a@b.com', age: 30 }];
    const blob = exportToCsv(data, baseConfig);
    const text = await blobToText(blob);

    const lines = text.split('\r\n');
    expect(lines[0]).toContain('Name,Email,Age');
    expect(lines[1]).toBe('Alice,a@b.com,30');
  });

  it('should support semicolon separator', async () => {
    const config: ExportConfig<TestRow> = { ...baseConfig, csvSeparator: ';' };
    const data: TestRow[] = [{ name: 'Alice', email: 'a@b.com', age: 30 }];
    const blob = exportToCsv(data, config);
    const text = await blobToText(blob);

    const lines = text.split('\r\n');
    expect(lines[0]).toContain('Name;Email;Age');
    expect(lines[1]).toBe('Alice;a@b.com;30');
  });

  it('should support tab separator', async () => {
    const config: ExportConfig<TestRow> = { ...baseConfig, csvSeparator: '\t' };
    const data: TestRow[] = [{ name: 'Alice', email: 'a@b.com', age: 30 }];
    const blob = exportToCsv(data, config);
    const text = await blobToText(blob);

    const lines = text.split('\r\n');
    expect(lines[0]).toContain('Name\tEmail\tAge');
    expect(lines[1]).toBe('Alice\ta@b.com\t30');
  });

  it('should escape fields containing the separator', async () => {
    const data: TestRow[] = [{ name: 'Doe, Jane', email: 'j@b.com', age: 28 }];
    const blob = exportToCsv(data, baseConfig);
    const text = await blobToText(blob);

    expect(text).toContain('"Doe, Jane"');
  });

  it('should escape fields containing double quotes', async () => {
    const data: TestRow[] = [{ name: 'She said "hi"', email: 'a@b.com', age: 25 }];
    const blob = exportToCsv(data, baseConfig);
    const text = await blobToText(blob);

    expect(text).toContain('"She said ""hi"""');
  });

  it('should escape fields containing newlines', async () => {
    const data: TestRow[] = [{ name: 'Line1\nLine2', email: 'a@b.com', age: 25 }];
    const blob = exportToCsv(data, baseConfig);
    const text = await blobToText(blob);

    expect(text).toContain('"Line1\nLine2"');
  });

  it('should handle null/undefined values as empty strings', async () => {
    interface Partial { name: string; note: string | null }
    const config: ExportConfig<Partial> = {
      format: 'csv',
      filename: 'test',
      columns: [
        { key: 'name', header: 'Name' },
        { key: 'note', header: 'Note' },
      ],
    };
    const data = [{ name: 'Alice', note: null }] as Partial[];
    const blob = exportToCsv(data, config);
    const text = await blobToText(blob);

    const lines = text.split('\r\n');
    expect(lines[1]).toBe('Alice,');
  });

  it('should handle empty data array (headers only)', async () => {
    const blob = exportToCsv([], baseConfig);
    const text = await blobToText(blob);

    const lines = text.split('\r\n');
    expect(lines.length).toBe(1);
    expect(lines[0]).toContain('Name,Email,Age');
  });

  it('should use CRLF line endings', async () => {
    const data: TestRow[] = [
      { name: 'Alice', email: 'a@b.com', age: 30 },
      { name: 'Bob', email: 'b@b.com', age: 25 },
    ];
    const blob = exportToCsv(data, baseConfig);
    const text = await blobToText(blob);

    const crlfCount = (text.match(/\r\n/g) || []).length;
    expect(crlfCount).toBe(2);
  });
});
