/**
 * Triggers a browser download of `content` as a file named
 * `filename`. Wraps the Blob + anchor click choreography so callers
 * stay free of DOM details.
 *
 * Pure side-effect on `document.body`; the temporary `<a>` is
 * removed before the function returns. The created object URL is
 * revoked synchronously to avoid leaking memory.
 *
 * @param content Body of the file. Pass a string, a Blob, or an
 *   `ArrayBuffer` — whatever the `Blob` constructor accepts.
 * @param filename Suggested name for the saved file. Browsers may
 *   override (extension policy, OS forbidden characters).
 * @param mimeType Defaults to `application/octet-stream`; pass
 *   `application/json` for JSON exports, `text/csv` for CSV, etc.
 */
export function downloadBlob(
  content: BlobPart,
  filename: string,
  mimeType = 'application/octet-stream',
): void {
  const blob = content instanceof Blob ? content : new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
