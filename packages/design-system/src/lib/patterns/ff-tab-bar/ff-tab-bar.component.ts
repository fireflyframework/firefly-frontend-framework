import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  ViewEncapsulation,
  inject,
  input,
  output,
} from '@angular/core';
import { FfIconComponent } from '../../primitives/ff-icon';
import { FfBadgeComponent } from '../../primitives/ff-badge';

/** A single tab entry rendered by `ff-tab-bar`. */
export interface FfTab {
  /** Stable identifier emitted on activation. */
  readonly id: string;

  /** Visible label. */
  readonly label: string;

  /** Optional icon name resolved against the `FF_ICONS` registry. */
  readonly icon?: string;

  /** Optional badge content (e.g. a count) rendered after the label. */
  readonly badge?: string | number;

  /** Disables activation and keyboard focus for this tab. */
  readonly disabled?: boolean;
}

/** Visual style of the tab bar. */
export type FfTabBarVariant = 'underline' | 'pills';

/**
 * Firefly tab bar pattern.
 *
 * Horizontal tab strip with `underline` and `pills` visualizations,
 * roving-tabindex keyboard navigation (Arrow keys, Home, End) and
 * WAI-ARIA tablist semantics. Composes the `ff-icon` and `ff-badge`
 * primitives (composition tier: pattern — primitives only).
 *
 * Activation is manual: tabs activate on click, Enter or Space.
 * The component does not own the panel content — consumers switch
 * their own views from `activeIdChange`.
 *
 * @example
 * ```html
 * <ff-tab-bar
 *   [tabs]="[
 *     { id: 'general', label: 'General', icon: 'settings' },
 *     { id: 'members', label: 'Members', badge: 12 },
 *   ]"
 *   [activeId]="active()"
 *   (activeIdChange)="active.set($event)"
 * />
 * ```
 */
@Component({
  selector: 'ff-tab-bar',
  standalone: true,
  imports: [FfIconComponent, FfBadgeComponent],
  templateUrl: './ff-tab-bar.component.html',
  styleUrl: './ff-tab-bar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    '[class]': '"ff-tab-bar ff-tab-bar--" + variant()',
  },
})
export class FfTabBarComponent {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  /** Tabs to render, in order. */
  readonly tabs = input.required<readonly FfTab[]>();

  /** Id of the currently active tab. */
  readonly activeId = input<string>();

  /** Visual style: `'underline'` | `'pills'`. Defaults to `'underline'`. */
  readonly variant = input<FfTabBarVariant>('underline');

  /** Emits the id of the tab the user activates. */
  readonly activeIdChange = output<string>();

  /** Activates a tab (click / Enter / Space via native button semantics). */
  select(tab: FfTab): void {
    if (tab.disabled || tab.id === this.activeId()) {
      return;
    }
    this.activeIdChange.emit(tab.id);
  }

  /**
   * Roving focus: ArrowRight/ArrowLeft move to the next/previous enabled
   * tab (wrapping), Home/End jump to the first/last enabled tab.
   */
  onKeydown(event: KeyboardEvent): void {
    const keys = ['ArrowRight', 'ArrowLeft', 'Home', 'End'];
    if (!keys.includes(event.key)) {
      return;
    }
    event.preventDefault();

    const buttons = Array.from(
      this.host.nativeElement.querySelectorAll<HTMLButtonElement>(
        '.ff-tab-bar__tab:not(:disabled)',
      ),
    );
    if (buttons.length === 0) {
      return;
    }

    const current = buttons.indexOf(event.target as HTMLButtonElement);
    let next: number;
    switch (event.key) {
      case 'ArrowRight':
        next = current < 0 ? 0 : (current + 1) % buttons.length;
        break;
      case 'ArrowLeft':
        next = current < 0 ? 0 : (current - 1 + buttons.length) % buttons.length;
        break;
      case 'Home':
        next = 0;
        break;
      default:
        next = buttons.length - 1;
    }
    buttons[next].focus();
  }
}
