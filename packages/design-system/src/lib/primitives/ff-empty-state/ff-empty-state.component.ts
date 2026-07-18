import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  input,
} from '@angular/core';

/**
 * Firefly empty-state atom.
 *
 * Centered placeholder for empty lists, empty search results or first-run
 * screens. Renders an optional projected icon (`[ff-empty-state-icon]`) above
 * the required `title`, an optional `description` below it, and a default slot
 * underneath for actions (e.g. a call-to-action button). Icons and actions are
 * projected — this primitive composes nothing.
 *
 * @example
 * ```html
 * <ff-empty-state
 *   title="No documents yet"
 *   description="Upload your first document to get started."
 * >
 *   <svg ff-empty-state-icon><!-- icon --></svg>
 *   <button type="button">Upload document</button>
 * </ff-empty-state>
 * ```
 */
@Component({
  selector: 'ff-empty-state',
  standalone: true,
  templateUrl: './ff-empty-state.component.html',
  styleUrl: './ff-empty-state.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    class: 'ff-empty-state',
  },
})
export class FfEmptyStateComponent {
  /** Main message of the empty state. Required. */
  readonly title = input.required<string>();

  /** Optional supporting text rendered below the title. */
  readonly description = input<string>();
}
