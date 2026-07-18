import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
  FfButtonComponent,
  FfPanelComponent,
  FfPanelVariant,
} from '@fireflyframework/design-system';

import { DemoSection } from '../../shared/demo-section';

/** Catalog page for `ff-panel`. */
@Component({
  selector: 'app-panel-page',
  imports: [DemoSection, FfPanelComponent, FfButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="page">
      <h2 class="page__title">Panel</h2>
      <p class="page__lead">
        <code>&lt;ff-panel&gt;</code> — container/callout with two appearances
        (FfPanelAppearance: card, alert) and six semantic variants (FfPanelVariant).
      </p>

      <app-demo-section
        heading="Alert appearance"
        description="All values of FfPanelVariant as callouts with left accent."
        [code]="snippets.alert"
      >
        <div class="demo-stack" style="max-width: 100%">
          @for (v of variants; track v) {
            <ff-panel appearance="alert" [variant]="v" [heading]="'Variant: ' + v">
              Callout body for the {{ v }} variant.
            </ff-panel>
          }
        </div>
      </app-demo-section>

      <app-demo-section
        heading="Card appearance"
        description="Bordered surface with heading, actions and footer slots; fill tints the background."
        [code]="snippets.card"
      >
        <div class="demo-stack" style="max-width: 100%">
          <ff-panel heading="Billing">
            <ff-button ff-panel-actions size="sm" variant="ghost">Edit</ff-button>
            <p style="margin: 0">Card body content.</p>
            <div ff-panel-footer>Footer zone</div>
          </ff-panel>
          <ff-panel variant="primary" [fill]="true" heading="Filled card">
            Card with the variant's tinted background (fill).
          </ff-panel>
        </div>
      </app-demo-section>
    </div>
  `,
})
export class PanelPage {
  protected readonly variants: readonly FfPanelVariant[] = [
    'neutral',
    'primary',
    'success',
    'warning',
    'danger',
    'info',
  ];

  protected readonly snippets = {
    alert: `<ff-panel appearance="alert" variant="warning">
  <span ff-panel-heading>Quota almost reached</span>
  You have used 90% of your storage.
</ff-panel>`,
    card: `<ff-panel heading="Billing">
  <button ff-panel-actions>Edit</button>
  <p>Card body content.</p>
  <div ff-panel-footer>Footer</div>
</ff-panel>`,
  };
}
