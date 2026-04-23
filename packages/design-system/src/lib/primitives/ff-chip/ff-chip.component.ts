import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  input,
  output,
} from '@angular/core';

/** Visual variant of the chip. */
export type FfChipVariant = 'default' | 'filter' | 'removable';

/** Predefined size of the chip. */
export type FfChipSize = 'sm' | 'md';

/**
 * Firefly chip atom.
 *
 * Inline label/tag with three variants:
 * - `default` — static label
 * - `filter` — toggleable with selected state
 * - `removable` — with close button
 *
 * Text content is projected via `<ng-content>`.
 *
 * @example
 * ```html
 * <ff-chip>Tag</ff-chip>
 * <ff-chip variant="filter" [selected]="isActive" (clicked)="toggle()">Active</ff-chip>
 * <ff-chip variant="removable" (removed)="onRemove()">Removable</ff-chip>
 * ```
 */
@Component({
  selector: 'ff-chip',
  standalone: true,
  templateUrl: './ff-chip.component.html',
  styleUrl: './ff-chip.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    '[class]':
      '"ff-chip ff-chip--" + variant() + " ff-chip--" + size() + (selected() ? " ff-chip--selected" : "") + (disabled() ? " ff-chip--disabled" : "")',
  },
})
export class FfChipComponent {
  /** Chip variant: `'default'` | `'filter'` | `'removable'`. Defaults to `'default'`. */
  readonly variant = input<FfChipVariant>('default');

  /** Whether the chip is selected (only applies to `filter` variant). Defaults to `false`. */
  readonly selected = input(false);

  /** Whether the chip is disabled. Defaults to `false`. */
  readonly disabled = input(false);

  /** Chip size: `'sm'` | `'md'`. Defaults to `'md'`. */
  readonly size = input<FfChipSize>('md');

  /** Emitted when the chip body is clicked (useful for filter toggle). */
  readonly clicked = output<void>();

  /** Emitted when the remove button is clicked (only for `removable` variant). */
  readonly removed = output<void>();

  /** @internal */
  onClick(): void {
    if (!this.disabled()) {
      this.clicked.emit();
    }
  }

  /** @internal */
  onRemove(event: Event): void {
    event.stopPropagation();
    if (!this.disabled()) {
      this.removed.emit();
    }
  }
}
