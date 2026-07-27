import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  Directive,
  ElementRef,
  TemplateRef,
  ViewEncapsulation,
  computed,
  contentChildren,
  inject,
  input,
  output,
} from '@angular/core';
import type { FfAccordionMode, FfAccordionSection } from '@fireflyframework/design-system-contract';

import { FfIconComponent } from '../../primitives/ff-icon';
import { FfPanelComponent } from '../../primitives/ff-panel';

export type { FfAccordionMode, FfAccordionSection } from '@fireflyframework/design-system-contract';

/**
 * Template context handed to `[ffAccordionSection]` `<ng-template>`s:
 * `$implicit` is the section descriptor, `index` its zero-based position.
 */
export interface FfAccordionSectionTemplateContext {
  $implicit: FfAccordionSection;
  index: number;
}

/**
 * Marks an `<ng-template>` projected into `ff-accordion` as the body content
 * of the section whose {@link FfAccordionSection.id} matches this
 * directive's value.
 *
 * @example
 * ```html
 * <ff-accordion [sections]="sections">
 *   <ng-template ffAccordionSection="billing" let-section>
 *     Billing details for {{ section.heading }}…
 *   </ng-template>
 * </ff-accordion>
 * ```
 */
@Directive({ selector: '[ffAccordionSection]', standalone: true })
export class FfAccordionSectionTemplateDirective {
  /** Section id this template renders, matched against `FfAccordionSection.id`. */
  readonly ffAccordionSection = input.required<string>();

  /** Template reference captured by `ff-accordion` and rendered per matching section via `NgTemplateOutlet`. */
  readonly templateRef = inject<TemplateRef<FfAccordionSectionTemplateContext>>(TemplateRef);
}

/**
 * Firefly accordion pattern.
 *
 * Stacked disclosure sections (`FfAccordionSection[]`), each rendered as an
 * `ff-panel` whose header zone hosts the accessible toggle `<button>`
 * (`aria-expanded`, `aria-controls`) and whose body zone hosts an animated
 * `role="region"` wrapper (`aria-labelledby`) around the section's
 * `[ffAccordionSection]` template. `mode` governs whether one (`'single'`,
 * default) or several (`'multiple'`) sections may stay expanded at once. The
 * component does not own which sections start expanded — it is fully
 * controlled through `expandedIds` / `expandedIdsChange`, mirroring
 * `ff-tab-bar`'s `activeId` / `activeIdChange`. The collapse animates the
 * region's height via a CSS grid track transition, skipped entirely under
 * `prefers-reduced-motion: reduce`; a collapsed region is also marked
 * `inert`, removing it from focus and the accessibility tree until expanded.
 * Composes `ff-panel` and `ff-icon` — primitives only (pattern tier).
 *
 * @example
 * ```html
 * <ff-accordion
 *   [sections]="[
 *     { id: 'shipping', heading: 'Shipping address' },
 *     { id: 'billing', heading: 'Billing details' },
 *   ]"
 *   [expandedIds]="expanded()"
 *   (expandedIdsChange)="expanded.set($event)"
 * >
 *   <ng-template ffAccordionSection="shipping" let-section>…</ng-template>
 *   <ng-template ffAccordionSection="billing" let-section>…</ng-template>
 * </ff-accordion>
 * ```
 */
@Component({
  selector: 'ff-accordion',
  standalone: true,
  imports: [NgTemplateOutlet, FfPanelComponent, FfIconComponent],
  templateUrl: './ff-accordion.component.html',
  styleUrl: './ff-accordion.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    class: 'ff-accordion',
  },
})
export class FfAccordionComponent {
  /** @internal Sequence used to build unique header/region ids per instance. */
  private static instanceCount = 0;

  /** @internal Unique id prefix for this instance's header/region pairs. */
  private readonly instanceId = `ff-accordion-${FfAccordionComponent.instanceCount++}`;

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  /** Sections to render, in order. */
  readonly sections = input.required<readonly FfAccordionSection[]>();

  /** Expansion mode: `'single'` (default, closes any other section) | `'multiple'`. */
  readonly mode = input<FfAccordionMode>('single');

  /** Ids of the currently expanded sections. */
  readonly expandedIds = input<readonly string[]>([]);

  /** Emits the next expanded-ids set when the user toggles a section. */
  readonly expandedIdsChange = output<readonly string[]>();

  /** Custom per-section body renderers, keyed by `FfAccordionSection.id`. */
  protected readonly sectionTemplates = contentChildren(FfAccordionSectionTemplateDirective);

  /** @internal Section templates indexed by id for O(1) lookup while rendering. */
  protected readonly sectionTemplateMap = computed(() => {
    const map = new Map<string, TemplateRef<FfAccordionSectionTemplateContext>>();
    for (const directive of this.sectionTemplates()) {
      map.set(directive.ffAccordionSection(), directive.templateRef);
    }
    return map;
  });

  /** @internal Whether the given section is currently expanded. */
  protected isExpanded(id: string): boolean {
    return this.expandedIds().includes(id);
  }

  /** @internal Id of a section's disclosure header button, referenced by its region's `aria-labelledby`. */
  protected headerId(id: string): string {
    return `${this.instanceId}-header-${id}`;
  }

  /** @internal Id of a section's region, referenced by its header's `aria-controls`. */
  protected regionId(id: string): string {
    return `${this.instanceId}-region-${id}`;
  }

  /**
   * @internal Toggles a section's expansion and emits the resulting
   * `expandedIds`. In `'single'` mode expanding one section always closes
   * every other section; in `'multiple'` mode sections toggle independently.
   * No-ops for disabled sections.
   */
  protected toggle(section: FfAccordionSection): void {
    if (section.disabled) {
      return;
    }
    const current = this.expandedIds();
    const isOpen = current.includes(section.id);
    const next =
      this.mode() === 'single'
        ? isOpen
          ? []
          : [section.id]
        : isOpen
          ? current.filter((id) => id !== section.id)
          : [...current, section.id];
    this.expandedIdsChange.emit(next);
  }

  /**
   * @internal Roving focus across section headers: ArrowDown/ArrowUp move to
   * the next/previous enabled header (wrapping), Home/End jump to the
   * first/last enabled header.
   */
  protected onKeydown(event: KeyboardEvent): void {
    const keys = ['ArrowDown', 'ArrowUp', 'Home', 'End'];
    if (!keys.includes(event.key)) {
      return;
    }
    event.preventDefault();

    const buttons = Array.from(
      this.host.nativeElement.querySelectorAll<HTMLButtonElement>(
        '.ff-accordion__toggle:not(:disabled)',
      ),
    );
    if (buttons.length === 0) {
      return;
    }

    const current = buttons.indexOf(event.target as HTMLButtonElement);
    let next: number;
    switch (event.key) {
      case 'ArrowDown':
        next = current < 0 ? 0 : (current + 1) % buttons.length;
        break;
      case 'ArrowUp':
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
