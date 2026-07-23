import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import {
  FfAccordionComponent,
  FfAccordionSection,
  FfAccordionSectionTemplateDirective,
} from '@fireflyframework/design-system';

import { DemoSection } from '../../shared/demo-section';

/** Pattern page for `ff-accordion`. */
@Component({
  selector: 'app-accordion-page',
  imports: [DemoSection, FfAccordionComponent, FfAccordionSectionTemplateDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="page">
      <h2 class="page__title">Accordion</h2>
      <p class="page__lead">
        <code>&lt;ff-accordion&gt;</code> — stacked disclosure sections composing
        <code>ff-panel</code> and <code>ff-icon</code>. Fully controlled through
        <code>expandedIds</code> / <code>(expandedIdsChange)</code>, just like
        <code>ff-tab-bar</code>'s <code>activeId</code>.
      </p>

      <app-demo-section
        heading="Single mode (default)"
        description="Expanding a section closes whichever other section was open."
        [code]="snippets.single"
      >
        <div class="demo-stack" style="max-width: 100%">
          <ff-accordion [sections]="sections" [expandedIds]="singleExpanded()" (expandedIdsChange)="singleExpanded.set($event)">
            <ng-template ffAccordionSection="shipping" let-section>
              <p style="margin: 0">Ship to the address on file for {{ section.heading }}.</p>
            </ng-template>
            <ng-template ffAccordionSection="billing">
              <p style="margin: 0">Invoices are sent to the billing email on record.</p>
            </ng-template>
            <ng-template ffAccordionSection="notes">
              <p style="margin: 0">Internal notes are visible to the account team only.</p>
            </ng-template>
          </ff-accordion>
          <span class="demo-label">expandedIds = "{{ singleExpanded().join(', ') || '(none)' }}"</span>
        </div>
      </app-demo-section>

      <app-demo-section
        heading="Multiple mode"
        description="Any number of sections can stay expanded independently."
        [code]="snippets.multiple"
      >
        <div class="demo-stack" style="max-width: 100%">
          <ff-accordion
            mode="multiple"
            [sections]="sections"
            [expandedIds]="multipleExpanded()"
            (expandedIdsChange)="multipleExpanded.set($event)"
          >
            <ng-template ffAccordionSection="shipping" let-section>
              <p style="margin: 0">Ship to the address on file for {{ section.heading }}.</p>
            </ng-template>
            <ng-template ffAccordionSection="billing">
              <p style="margin: 0">Invoices are sent to the billing email on record.</p>
            </ng-template>
            <ng-template ffAccordionSection="notes">
              <p style="margin: 0">Internal notes are visible to the account team only.</p>
            </ng-template>
          </ff-accordion>
          <span class="demo-label">expandedIds = "{{ multipleExpanded().join(', ') || '(none)' }}"</span>
        </div>
      </app-demo-section>

      <app-demo-section
        heading="Disabled section"
        description="A disabled section's toggle cannot be activated or reached by roving focus."
        [code]="snippets.disabled"
      >
        <div class="demo-stack" style="max-width: 100%">
          <ff-accordion
            [sections]="sectionsWithDisabled"
            [expandedIds]="disabledExpanded()"
            (expandedIdsChange)="disabledExpanded.set($event)"
          >
            <ng-template ffAccordionSection="active" let-section>
              <p style="margin: 0">{{ section.heading }} is open for editing.</p>
            </ng-template>
            <ng-template ffAccordionSection="locked">
              <p style="margin: 0">This content is unreachable while the section is disabled.</p>
            </ng-template>
          </ff-accordion>
        </div>
      </app-demo-section>
    </div>
  `,
})
export class AccordionPage {
  protected readonly sections: readonly FfAccordionSection[] = [
    { id: 'shipping', heading: 'Shipping address' },
    { id: 'billing', heading: 'Billing details' },
    { id: 'notes', heading: 'Notes' },
  ];

  protected readonly sectionsWithDisabled: readonly FfAccordionSection[] = [
    { id: 'active', heading: 'Editable section' },
    { id: 'locked', heading: 'Locked section', disabled: true },
  ];

  protected readonly singleExpanded = signal<readonly string[]>(['shipping']);
  protected readonly multipleExpanded = signal<readonly string[]>(['shipping', 'billing']);
  protected readonly disabledExpanded = signal<readonly string[]>([]);

  protected readonly snippets = {
    single: `<ff-accordion
  [sections]="[
    { id: 'shipping', heading: 'Shipping address' },
    { id: 'billing', heading: 'Billing details' },
  ]"
  [expandedIds]="expanded()"
  (expandedIdsChange)="expanded.set($event)"
>
  <ng-template ffAccordionSection="shipping" let-section>…</ng-template>
  <ng-template ffAccordionSection="billing">…</ng-template>
</ff-accordion>`,
    multiple: `<ff-accordion mode="multiple" [sections]="sections" [expandedIds]="expanded()" (expandedIdsChange)="expanded.set($event)">…</ff-accordion>`,
    disabled: `<ff-accordion [sections]="[{ id: 'locked', heading: 'Locked section', disabled: true }]" …>…</ff-accordion>`,
  };
}
