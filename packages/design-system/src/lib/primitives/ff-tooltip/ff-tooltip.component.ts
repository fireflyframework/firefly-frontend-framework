import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  input,
  signal,
} from '@angular/core';

/** Tooltip position relative to the trigger element. */
export type FfTooltipPosition = 'top' | 'bottom' | 'left' | 'right';

let nextId = 0;

/**
 * Firefly tooltip atom.
 *
 * Informational overlay shown on hover/focus over a trigger element.
 * Content projection is used for the trigger.
 *
 * @example
 * ```html
 * <ff-tooltip text="More info" position="top">
 *   <button>Hover me</button>
 * </ff-tooltip>
 * ```
 */
@Component({
  selector: 'ff-tooltip',
  standalone: true,
  templateUrl: './ff-tooltip.component.html',
  styleUrl: './ff-tooltip.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    'class': 'ff-tooltip',
    '(mouseenter)': 'show()',
    '(mouseleave)': 'hide()',
    '(focusin)': 'show()',
    '(focusout)': 'hide()',
    '[attr.aria-describedby]': 'text() ? tooltipId : null',
  },
})
export class FfTooltipComponent {
  /** Text displayed inside the tooltip. No tooltip is rendered when empty. */
  readonly text = input('');

  /** Position of the tooltip relative to the trigger: `'top'` | `'bottom'` | `'left'` | `'right'`. Defaults to `'top'`. */
  readonly position = input<FfTooltipPosition>('top');

  /** @internal Whether the tooltip is currently visible. */
  readonly visible = signal(false);

  /** @internal Unique DOM id for aria-describedby. */
  readonly tooltipId = `ff-tooltip-${nextId++}`;

  /** @internal Show the tooltip (only if text is provided). */
  show(): void {
    if (this.text()) {
      this.visible.set(true);
    }
  }

  /** @internal Hide the tooltip. */
  hide(): void {
    this.visible.set(false);
  }
}
