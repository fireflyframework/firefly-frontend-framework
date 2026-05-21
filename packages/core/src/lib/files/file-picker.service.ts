import { Injectable, inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';

/**
 * Opens the browser's native file picker programmatically.
 *
 * Creates a hidden `<input type="file">` element, triggers a click,
 * and resolves with the selected files. The input is removed after use.
 *
 * @example
 * ```typescript
 * const files = await picker.pickFile('application/pdf,.pdf', true);
 * const image = await picker.pickImage();
 * ```
 */
@Injectable()
export class FilePickerService {
  private readonly doc = inject(DOCUMENT);

  /**
   * Open the native file picker dialog.
   *
   * @param accept — MIME types or extensions (e.g. `'image/*'`, `'.pdf,.docx'`)
   * @param multiple — Allow selecting multiple files. Default: `false`.
   * @returns Selected files, or empty array if cancelled.
   */
  pickFile(accept?: string, multiple?: boolean): Promise<File[]> {
    return new Promise<File[]>(resolve => {
      const input = this.doc.createElement('input') as HTMLInputElement;
      input.type = 'file';
      if (accept) input.accept = accept;
      if (multiple) input.multiple = true;
      input.style.display = 'none';

      const cleanup = () => {
        input.removeEventListener('change', onChange);
        input.removeEventListener('cancel', onCancel);
        if (input.parentNode) input.parentNode.removeChild(input);
      };

      const onChange = () => {
        const files = input.files ? Array.from(input.files) : [];
        cleanup();
        resolve(files);
      };

      const onCancel = () => {
        cleanup();
        resolve([]);
      };

      input.addEventListener('change', onChange);
      input.addEventListener('cancel', onCancel);

      this.doc.body.appendChild(input);
      input.click();
    });
  }

  /**
   * Open the native file picker filtered to images only.
   *
   * Shorthand for `pickFile('image/*', false)`.
   * @returns The selected image, or `null` if cancelled.
   */
  async pickImage(): Promise<File | null> {
    const files = await this.pickFile('image/*', false);
    return files[0] ?? null;
  }
}
