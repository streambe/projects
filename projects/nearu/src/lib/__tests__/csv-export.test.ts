import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock DOM APIs
const clickMock = vi.fn();
const appendChildMock = vi.fn();
const removeChildMock = vi.fn();
const createObjectURLMock = vi.fn().mockReturnValue('blob:mock-url');
const revokeObjectURLMock = vi.fn();

Object.defineProperty(globalThis, 'document', {
  value: {
    createElement: vi.fn().mockReturnValue({
      href: '',
      download: '',
      click: clickMock,
    }),
    body: {
      appendChild: appendChildMock,
      removeChild: removeChildMock,
    },
  },
  writable: true,
});

Object.defineProperty(globalThis, 'URL', {
  value: {
    createObjectURL: createObjectURLMock,
    revokeObjectURL: revokeObjectURLMock,
  },
  writable: true,
});

Object.defineProperty(globalThis, 'Blob', {
  value: class MockBlob {
    content: unknown[];
    options: Record<string, unknown>;
    constructor(content: unknown[], options: Record<string, unknown>) {
      this.content = content;
      this.options = options;
    }
  },
  writable: true,
});

import { exportToCSV } from '@/lib/csv-export';

describe('csv-export', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('generates CSV with headers and rows', () => {
    const data = [
      { name: 'Alice', age: 30 },
      { name: 'Bob', age: 25 },
    ];
    exportToCSV(data, 'test');

    expect(createObjectURLMock).toHaveBeenCalledTimes(1);
    const blob = createObjectURLMock.mock.calls[0][0];
    const content = blob.content[0];
    expect(content).toContain('name,age');
    expect(content).toContain('Alice,30');
    expect(content).toContain('Bob,25');
  });

  it('escapes commas in values', () => {
    const data = [{ note: 'hello, world' }];
    exportToCSV(data, 'test');

    const blob = createObjectURLMock.mock.calls[0][0];
    const content = blob.content[0];
    expect(content).toContain('"hello, world"');
  });

  it('escapes quotes in values', () => {
    const data = [{ note: 'say "hi"' }];
    exportToCSV(data, 'test');

    const blob = createObjectURLMock.mock.calls[0][0];
    const content = blob.content[0];
    expect(content).toContain('"say ""hi"""');
  });

  it('does nothing for empty data array', () => {
    exportToCSV([], 'test');
    expect(createObjectURLMock).not.toHaveBeenCalled();
  });

  it('prepends BOM character', () => {
    const data = [{ a: 1 }];
    exportToCSV(data, 'test');

    const blob = createObjectURLMock.mock.calls[0][0];
    const content = blob.content[0] as string;
    expect(content.startsWith('\uFEFF')).toBe(true);
  });

  it('triggers download and cleans up', () => {
    const data = [{ x: 1 }];
    exportToCSV(data, 'report');

    expect(clickMock).toHaveBeenCalled();
    expect(appendChildMock).toHaveBeenCalled();
    expect(removeChildMock).toHaveBeenCalled();
    expect(revokeObjectURLMock).toHaveBeenCalled();
  });
});
