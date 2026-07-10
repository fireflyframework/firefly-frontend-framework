import { Pipe, type PipeTransform } from '@angular/core';
import { humanizeColumnName, humanizeLabel } from '@fireflyframework/utils/string';

/**
 * Sentence-case label for a backend identifier (`identity_card` →
 * `Identity card`). The optional argument sets the fallback for missing/empty
 * input (default `''`, so a template `@if` can collapse the segment).
 *
 * @example
 * ```html
 * <span>{{ tag.label | ffHumanizeLabel }}</span>
 * <td>{{ group.name | ffHumanizeLabel: '—' }}</td>
 * ```
 */
@Pipe({ name: 'ffHumanizeLabel', standalone: true })
export class FfHumanizeLabelPipe implements PipeTransform {
  transform(raw: string | null | undefined, emptyFallback = ''): string {
    return humanizeLabel(raw, emptyFallback);
  }
}

/**
 * Title-Case label for a backend field/column identifier (`cap_table_vigente` →
 * `Cap Table Vigente`). Prefer this over pre-baking the label in a TS view
 * model when the raw identifier is already bound.
 *
 * Title-case sibling of {@link FfHumanizeLabelPipe} — this one for table column
 * headers and array-row labels, that one for free-standing labels.
 *
 * @example
 * ```html
 * <th>{{ column.key | ffHumanizeColumn }}</th>
 * ```
 */
@Pipe({ name: 'ffHumanizeColumn', standalone: true })
export class FfHumanizeColumnPipe implements PipeTransform {
  transform(raw: string | null | undefined): string {
    return humanizeColumnName(raw ?? '');
  }
}
