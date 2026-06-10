import { Pipe, PipeTransform } from '@angular/core';

/**
 * Returns the uppercase file extension of a filename (segment after the
 * last dot), or `''` when there is no usable extension. The empty string
 * lets a template `@if` hide the surrounding chip / badge cleanly.
 *
 * @example
 * ```html
 * @if (item.fileName | ffFileExtension; as ext) { <span class="chip">{{ ext }}</span> }
 * ```
 */
@Pipe({ name: 'ffFileExtension', standalone: true })
export class FfFileExtensionPipe implements PipeTransform {
  transform(fileName: string | undefined | null): string {
    if (!fileName) return '';
    const dot = fileName.lastIndexOf('.');
    if (dot <= 0 || dot === fileName.length - 1) return '';
    return fileName.slice(dot + 1).toUpperCase();
  }
}
