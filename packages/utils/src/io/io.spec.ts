// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { downloadBlob } from './download-blob';

describe('downloadBlob', () => {
  let createObjSpy: ReturnType<typeof vi.spyOn>;
  let revokeObjSpy: ReturnType<typeof vi.spyOn>;
  let appendSpy: ReturnType<typeof vi.spyOn>;
  let removeSpy: ReturnType<typeof vi.spyOn>;
  let anchorClick: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    createObjSpy = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:mock');
    revokeObjSpy = vi.spyOn(URL, 'revokeObjectURL').mockReturnValue(undefined);
    anchorClick = vi.fn();
    appendSpy = vi.spyOn(document.body, 'appendChild').mockImplementation(<T extends Node>(node: T): T => {
      if ((node as unknown as HTMLAnchorElement).tagName === 'A') {
        (node as unknown as HTMLAnchorElement).click = anchorClick;
      }
      return node;
    });
    removeSpy = vi.spyOn(document.body, 'removeChild').mockImplementation(<T extends Node>(node: T): T => node);
  });

  afterEach(() => {
    createObjSpy.mockRestore();
    revokeObjSpy.mockRestore();
    appendSpy.mockRestore();
    removeSpy.mockRestore();
  });

  it('builds a Blob, appends a hidden anchor, clicks it, removes it and revokes the URL', () => {
    downloadBlob('{"a":1}', 'data.json', 'application/json');
    expect(createObjSpy).toHaveBeenCalledTimes(1);
    expect(appendSpy).toHaveBeenCalledTimes(1);
    expect(anchorClick).toHaveBeenCalledTimes(1);
    expect(removeSpy).toHaveBeenCalledTimes(1);
    expect(revokeObjSpy).toHaveBeenCalledWith('blob:mock');
  });

  it('forwards an existing Blob without re-wrapping', () => {
    const blob = new Blob(['hello'], { type: 'text/plain' });
    downloadBlob(blob, 'out.txt', 'text/plain');
    const arg = (createObjSpy.mock.calls[0] as [Blob])[0];
    expect(arg).toBe(blob);
  });

  it('uses application/octet-stream by default', () => {
    downloadBlob('x', 'x.bin');
    const arg = (createObjSpy.mock.calls[0] as [Blob])[0];
    expect(arg.type).toBe('application/octet-stream');
  });
});
