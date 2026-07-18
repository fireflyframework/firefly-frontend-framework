import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  input,
} from '@angular/core';

/** Visual appearance of the panel. */
export type FfPanelAppearance = 'card' | 'alert';

/** Semantic color variant of the panel. */
export type FfPanelVariant =
  | 'neutral'
  | 'primary'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info';

/**
 * Firefly panel atom.
 *
 * Container/callout primitive with two appearances:
 * - `'card'`: neutral surface with a full border (optionally tinted via `fill`).
 * - `'alert'`: callout with a thick left accent border and a subtle tinted
 *   background derived from the semantic `variant`.
 *
 * Structure is header → body → footer. The header renders the `heading` input
 * (if provided) plus the `[ff-panel-heading]` and `[ff-panel-actions]` slots
 * (actions are aligned to the right). The footer renders the
 * `[ff-panel-footer]` slot. Header and footer wrappers collapse via the CSS
 * `:empty` selector when they receive no content — Angular strips
 * whitespace-only text nodes from the template (`preserveWhitespaces: false`
 * is the default) and `@if`/`ng-content` anchors are comment nodes, which
 * `:empty` ignores, so an unused zone occupies no space.
 *
 * Accessibility: this primitive does not force any ARIA role. When the alert
 * content is dynamic (injected after page load), the consumer should add
 * `role="alert"` (or `role="status"`) to the projected content or to the host.
 *
 * @example
 * ```html
 * <ff-panel heading="Billing">
 *   <button ff-panel-actions>Edit</button>
 *   <p>Card body content.</p>
 *   <div ff-panel-footer>Footer</div>
 * </ff-panel>
 *
 * <ff-panel appearance="alert" variant="warning">
 *   <span ff-panel-heading>Quota almost reached</span>
 *   You have used 90% of your storage.
 * </ff-panel>
 * ```
 */
@Component({
  selector: 'ff-panel',
  standalone: true,
  templateUrl: './ff-panel.component.html',
  styleUrl: './ff-panel.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    '[class]':
      '"ff-panel ff-panel--" + appearance() + " ff-panel--" + variant()',
    '[class.ff-panel--fill]': 'fill()',
  },
})
export class FfPanelComponent {
  /** Visual appearance: `'card'` (bordered surface) | `'alert'` (accented callout). Defaults to `'card'`. */
  readonly appearance = input<FfPanelAppearance>('card');

  /** Semantic color: `'neutral'` | `'primary'` | `'success'` | `'warning'` | `'danger'` | `'info'`. Defaults to `'neutral'`. */
  readonly variant = input<FfPanelVariant>('neutral');

  /** Optional heading text rendered in the header zone. Alternative to the `[ff-panel-heading]` slot. */
  readonly heading = input<string>();

  /** When `true`, the card appearance also uses the variant's tinted background. Defaults to `false`. */
  readonly fill = input(false);
}
