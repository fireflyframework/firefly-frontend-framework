import { Injectable, inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';

/**
 * Triggers file downloads programmatically.
 *
 * Uses the "hidden anchor + click" trick to initiate browser downloads
 * from URLs or in-memory Blobs. Blob URLs are revoked after download
 * to prevent memory leaks.
 *
 * @example
 * ```typescript
 * const dl = inject(FileDownloadService);
 *
 * // Download from URL
 * dl.download('/api/files/123', 'report.pdf');
 *
 * // Download in-memory blob
 * const blob = new Blob(['hello'], { type: 'text/plain' });
 * dl.downloadBlob(blob, 'greeting.txt');
 * ```
 */
@Injectable()
export class FileDownloadService {
  private readonly doc = inject(DOCUMENT);

  /**
   * Download a file from a URL.
   *
   * Creates a hidden `<a>` element with the download attribute,
   * clicks it, and removes it from the DOM.
   *
   * @param url — URL to download from.
   * @param filename — Suggested filename for the download.
   */
  download(url: string, filename: string): void {
    const anchor = this.doc.createElement('a');
    anchor.href = url;
    anchor.download = filename;
    anchor.style.display = 'none';

    this.doc.body.appendChild(anchor);
    anchor.click();
    this.doc.body.removeChild(anchor);
  }

  /**
   * Download an in-memory Blob as a file.
   *
   * Creates a temporary blob URL, triggers the download, then
   * revokes the URL to free memory.
   *
   * @param blob — The Blob or File to download.
   * @param filename — Suggested filename for the download.
   */
  downloadBlob(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    this.download(url, filename);
    URL.revokeObjectURL(url);
  }
}
