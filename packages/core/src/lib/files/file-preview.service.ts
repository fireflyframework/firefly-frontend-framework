import { Injectable, inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { FILES_CONFIG } from './file.types';

/**
 * Manages file previews and blob URL lifecycle.
 *
 * Creates temporary blob URLs for displaying file content and opens
 * previews in new browser tabs. Tracks active blob URLs and provides
 * cleanup to prevent memory leaks.
 *
 * @example
 * ```typescript
 * const preview = inject(FilePreviewService);
 *
 * // Preview a blob in a new tab
 * preview.previewInNewTab(blob, 'application/pdf');
 *
 * // Manual blob URL management
 * const url = preview.createBlobUrl(blob);
 * // ... use url in an <img> or <iframe> ...
 * preview.revokeBlobUrl(url);
 * ```
 */
@Injectable()
export class FilePreviewService {
  private readonly doc = inject(DOCUMENT);
  private readonly config = inject(FILES_CONFIG, { optional: true });
  private readonly activeUrls = new Set<string>();

  /**
   * Create a blob URL and track it for later cleanup.
   *
   * @param blob — The Blob or File to create a URL for.
   * @returns A `blob:` URL string.
   */
  createBlobUrl(blob: Blob): string {
    const url = URL.createObjectURL(blob);
    this.activeUrls.add(url);
    return url;
  }

  /**
   * Revoke a previously created blob URL and free its memory.
   *
   * @param url — The blob URL to revoke.
   */
  revokeBlobUrl(url: string): void {
    URL.revokeObjectURL(url);
    this.activeUrls.delete(url);
  }

  /**
   * Revoke all tracked blob URLs. Call on component destroy to prevent leaks.
   */
  revokeAll(): void {
    for (const url of this.activeUrls) {
      URL.revokeObjectURL(url);
    }
    this.activeUrls.clear();
  }

  /**
   * Open a file preview in a new browser tab.
   *
   * Creates a temporary blob URL, opens it in a new tab, and returns
   * the URL for later cleanup. If `enablePreview` is `false` in config,
   * this method is a no-op and returns `null`.
   *
   * @param blob — The Blob or File to preview.
   * @param mimeType — Optional MIME type override (uses blob.type by default).
   * @returns The blob URL opened, or `null` if preview is disabled.
   */
  previewInNewTab(blob: Blob, mimeType?: string): string | null {
    if (this.config?.enablePreview === false) {
      return null;
    }

    const previewBlob = mimeType
      ? new Blob([blob], { type: mimeType })
      : blob;

    const url = this.createBlobUrl(previewBlob);
    const win = this.doc.defaultView;
    win?.open(url, '_blank');
    return url;
  }

  /** Number of currently active (un-revoked) blob URLs. */
  get activeUrlCount(): number {
    return this.activeUrls.size;
  }
}
