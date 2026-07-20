import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnDestroy,
  TemplateRef,
  ViewContainerRef,
  ViewEncapsulation,
  computed,
  effect,
  inject,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { ConnectedPosition, Overlay, OverlayRef } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';

import { FfButtonComponent } from '../../primitives/ff-button';
import type { FfButtonColor, FfButtonSize, FfButtonVariant } from '../../primitives/ff-button';
import { FfIconComponent } from '../../primitives/ff-icon';

/** Single actionable entry rendered inside the `ff-menu-button` dropdown panel. */
export interface FfMenuButtonItem {
  /** Display text rendered for the entry. */
  readonly label: string;
  /** Opaque value emitted through `selected` when the entry is activated. */
  readonly value: string;
  /** Disables the entry — skipped by keyboard navigation and cannot be activated. */
  readonly disabled?: boolean;
}

/**
 * Connected-overlay positions tried in order: primary below the trigger,
 * falling back above it when there is no room below (the CDK overlay picks
 * whichever position actually fits the viewport).
 */
const MENU_POSITIONS: ConnectedPosition[] = [
  { originX: 'start', originY: 'bottom', overlayX: 'start', overlayY: 'top', offsetY: 4 },
  { originX: 'start', originY: 'top', overlayX: 'start', overlayY: 'bottom', offsetY: -4 },
];

/**
 * Minimal structural shape of an RxJS `Subscription`, spelled out locally so
 * this file does not need a direct `rxjs` import (a transitive dependency of
 * `@angular/core`/`@angular/cdk`, not a declared peer of this package).
 */
interface Unsubscribable {
  unsubscribe(): void;
}

/**
 * Firefly menu button pattern.
 *
 * A trigger button (the `ff-button` primitive) that opens a keyboard- and
 * screen-reader-accessible dropdown of actions, positioned with the CDK
 * `Overlay` service (`ConnectedPositionStrategy`, anchored to the trigger,
 * falling back above it when there is no room below). Composes `ff-button`
 * and `ff-icon` — primitives only (pattern tier).
 *
 * Behavior guarantees:
 * - Trigger exposes `aria-haspopup="menu"` and `aria-expanded`; the panel is
 *   `role="menu"` with `role="menuitem"` entries.
 * - Keyboard: `ArrowDown`/`ArrowUp` on the trigger open the menu and focus
 *   the first/last enabled entry; inside the panel `ArrowDown`/`ArrowUp`
 *   move focus (wrapping), `Home`/`End` jump to the first/last enabled
 *   entry, `Enter`/`Space` activates the focused entry, `Escape` closes and
 *   returns focus to the trigger.
 * - Closes on: outside click, `Escape`, or activating an entry — always
 *   returning focus to the trigger except on outside click.
 *
 * @example
 * ```html
 * <ff-menu-button
 *   triggerLabel="Actions"
 *   [items]="[
 *     { label: 'Rename', value: 'rename' },
 *     { label: 'Archive', value: 'archive' },
 *     { label: 'Delete', value: 'delete', disabled: !canDelete },
 *   ]"
 *   (selected)="onAction($event)"
 * />
 * ```
 */
@Component({
  selector: 'ff-menu-button',
  standalone: true,
  imports: [FfButtonComponent, FfIconComponent],
  templateUrl: './ff-menu-button.component.html',
  styleUrl: './ff-menu-button.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    class: 'ff-menu-button',
  },
})
export class FfMenuButtonComponent implements OnDestroy {
  /** Entries rendered in the dropdown panel, in order. */
  readonly items = input.required<readonly FfMenuButtonItem[]>();

  /** Trigger label used when no content is projected into the default slot. */
  readonly triggerLabel = input('');

  /** Disables the trigger entirely (the panel cannot be opened). */
  readonly disabled = input(false);

  /** Style axis forwarded to the trigger `ff-button`. Defaults to `'solid'`. */
  readonly variant = input<FfButtonVariant>('solid');

  /** Color axis forwarded to the trigger `ff-button`. Defaults to `'primary'`. */
  readonly color = input<FfButtonColor>('primary');

  /** Size forwarded to the trigger `ff-button`. Defaults to `'md'`. */
  readonly size = input<FfButtonSize>('md');

  /** Emits the activated entry (click, or Enter/Space on the focused entry). */
  readonly selected = output<FfMenuButtonItem>();

  /** @internal Whether the dropdown panel is currently open. */
  protected readonly open = signal(false);

  /** @internal Index (within `items()`) of the keyboard-active entry, or `-1`. */
  protected readonly activeIndex = signal(-1);

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly overlay = inject(Overlay);
  private readonly viewContainerRef = inject(ViewContainerRef);
  private readonly menuTpl = viewChild.required<TemplateRef<unknown>>('menuTpl');

  private overlayRef: OverlayRef | null = null;
  private outsideClickSubscription: Unsubscribable | null = null;

  /** @internal Indexes of `items()` that are not disabled, in order. */
  protected readonly enabledIndexes = computed(() =>
    this.items().reduce<number[]>((acc, item, i) => {
      if (!item.disabled) {
        acc.push(i);
      }
      return acc;
    }, [])
  );

  constructor() {
    // The trigger's `aria-haspopup`/`aria-expanded` must live on `ff-button`'s
    // own native `<button>` (the element that actually receives focus) —
    // setting them on the `<ff-menu-button>` host would not reach the
    // ARIA computation for the focused descendant. `.ff-button__native` is
    // not part of ff-button's public contract, so this coupling breaks
    // silently if that primitive restructures its template.
    effect(() => {
      const trigger = this.host.nativeElement.querySelector<HTMLButtonElement>(
        '.ff-button__native'
      );
      if (!trigger) {
        return;
      }
      trigger.setAttribute('aria-haspopup', 'menu');
      trigger.setAttribute('aria-expanded', String(this.open()));
    });
  }

  ngOnDestroy(): void {
    this.outsideClickSubscription?.unsubscribe();
    this.overlayRef?.dispose();
  }

  /** @internal Toggles the panel from the trigger click handler. */
  protected toggle(): void {
    if (this.disabled()) {
      return;
    }
    if (this.open()) {
      this.close();
    } else {
      this.openMenu();
    }
  }

  /** @internal Opens the panel without moving focus into it. */
  protected openMenu(): void {
    if (this.disabled() || this.open()) {
      return;
    }
    const overlayRef = this.ensureOverlay();
    if (!overlayRef.hasAttached()) {
      overlayRef.attach(new TemplatePortal(this.menuTpl(), this.viewContainerRef));
    }
    this.open.set(true);
  }

  /** @internal Closes the panel, optionally returning focus to the trigger. */
  protected close(focusTrigger = true): void {
    if (!this.open()) {
      return;
    }
    this.overlayRef?.detach();
    this.open.set(false);
    this.activeIndex.set(-1);
    if (focusTrigger) {
      this.host.nativeElement.querySelector<HTMLButtonElement>('.ff-button__native')?.focus();
    }
  }

  /** @internal Emits `selected` and closes the panel, unless the entry is disabled. */
  protected selectItem(item: FfMenuButtonItem): void {
    if (item.disabled) {
      return;
    }
    this.selected.emit(item);
    this.close();
  }

  /** @internal ArrowDown/ArrowUp open the menu and seed the active entry; Escape closes it. */
  protected onTriggerKeydown(event: KeyboardEvent): void {
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this.openMenu();
        this.focusIndex(this.enabledIndexes()[0] ?? -1);
        break;
      case 'ArrowUp': {
        event.preventDefault();
        this.openMenu();
        const enabled = this.enabledIndexes();
        this.focusIndex(enabled[enabled.length - 1] ?? -1);
        break;
      }
      case 'Escape':
        if (this.open()) {
          event.preventDefault();
          this.close();
        }
        break;
    }
  }

  /** @internal Full roving-focus keyboard model for the open panel. */
  protected onMenuKeydown(event: KeyboardEvent): void {
    const enabled = this.enabledIndexes();
    if (enabled.length === 0) {
      return;
    }
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this.moveActive(1);
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.moveActive(-1);
        break;
      case 'Home':
        event.preventDefault();
        this.focusIndex(enabled[0]);
        break;
      case 'End':
        event.preventDefault();
        this.focusIndex(enabled[enabled.length - 1]);
        break;
      case 'Escape':
        event.preventDefault();
        this.close();
        break;
      case 'Enter':
      case ' ': {
        event.preventDefault();
        const item = this.items()[this.activeIndex()];
        if (item) {
          this.selectItem(item);
        }
        break;
      }
      case 'Tab':
        this.close(false);
        break;
    }
  }

  /** Lazily creates the connected overlay anchored to this component's host. */
  private ensureOverlay(): OverlayRef {
    if (this.overlayRef) {
      return this.overlayRef;
    }

    const positionStrategy = this.overlay
      .position()
      .flexibleConnectedTo(this.host)
      .withPositions(MENU_POSITIONS)
      .withPush(false);

    const overlayRef = this.overlay.create({
      positionStrategy,
      scrollStrategy: this.overlay.scrollStrategies.close(),
      hasBackdrop: false,
      minWidth: this.host.nativeElement.getBoundingClientRect().width,
    });

    this.outsideClickSubscription = overlayRef.outsidePointerEvents().subscribe((event) => {
      if (!this.host.nativeElement.contains(event.target as Node)) {
        this.close(false);
      }
    });

    this.overlayRef = overlayRef;
    return overlayRef;
  }

  /** Moves the active index by `delta` among the enabled entries (wrapping). */
  private moveActive(delta: number): void {
    const enabled = this.enabledIndexes();
    if (enabled.length === 0) {
      return;
    }
    const currentPos = enabled.indexOf(this.activeIndex());
    const nextPos =
      currentPos < 0
        ? delta > 0
          ? 0
          : enabled.length - 1
        : (currentPos + delta + enabled.length) % enabled.length;
    this.focusIndex(enabled[nextPos]);
  }

  /** Sets the active index and moves native DOM focus to the matching menu item. */
  private focusIndex(index: number): void {
    this.activeIndex.set(index);
    if (index < 0) {
      return;
    }
    const items = this.overlayRef?.overlayElement.querySelectorAll<HTMLElement>(
      '[role="menuitem"]'
    );
    items?.[index]?.focus();
  }
}
