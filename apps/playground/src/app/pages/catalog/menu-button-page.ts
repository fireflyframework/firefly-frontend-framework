import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FfMenuButtonComponent, FfMenuButtonItem } from '@fireflyframework/design-system';

import { DemoSection } from '../../shared/demo-section';

/** Catalog page for `ff-menu-button`. */
@Component({
  selector: 'app-menu-button-page',
  imports: [DemoSection, FfMenuButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="page">
      <h2 class="page__title">Menu Button</h2>
      <p class="page__lead">
        <code>&lt;ff-menu-button&gt;</code> — trigger button composing
        <code>ff-button</code> + <code>ff-icon</code> that opens an accessible dropdown
        of actions (CDK connected overlay, keyboard navigation, <code>aria-haspopup</code> /
        <code>aria-expanded</code> / <code>role="menu"</code>).
      </p>

      <app-demo-section
        heading="Basic"
        description="triggerLabel + items; selected emits the activated entry."
        [code]="snippets.basic"
      >
        <div class="demo-stack">
          <ff-menu-button
            triggerLabel="Actions"
            [items]="items"
            (selected)="lastSelected.set($event.label)"
          />
          <span class="demo-label">last selected = "{{ lastSelected() }}"</span>
        </div>
      </app-demo-section>

      <app-demo-section
        heading="Trigger styling"
        description="variant/color/size are forwarded to the trigger ff-button."
        [code]="snippets.styled"
      >
        <ff-menu-button triggerLabel="Outline" variant="outline" color="success" [items]="items" />
        <ff-menu-button triggerLabel="Small ghost" variant="ghost" size="sm" [items]="items" />
      </app-demo-section>

      <app-demo-section heading="Disabled" [code]="snippets.disabled">
        <ff-menu-button triggerLabel="Disabled" [items]="items" [disabled]="true" />
      </app-demo-section>
    </div>
  `,
})
export class MenuButtonPage {
  protected readonly items: readonly FfMenuButtonItem[] = [
    { label: 'Rename', value: 'rename' },
    { label: 'Duplicate', value: 'duplicate' },
    { label: 'Archive', value: 'archive', disabled: true },
    { label: 'Delete', value: 'delete' },
  ];

  protected readonly lastSelected = signal('—');

  protected readonly snippets = {
    basic: `<ff-menu-button
  triggerLabel="Actions"
  [items]="[
    { label: 'Rename', value: 'rename' },
    { label: 'Delete', value: 'delete' },
  ]"
  (selected)="onAction($event)"
/>`,
    styled: `<ff-menu-button triggerLabel="Outline" variant="outline" color="success" [items]="items" />
<ff-menu-button triggerLabel="Small ghost" variant="ghost" size="sm" [items]="items" />`,
    disabled: `<ff-menu-button triggerLabel="Disabled" [items]="items" [disabled]="true" />`,
  };
}
