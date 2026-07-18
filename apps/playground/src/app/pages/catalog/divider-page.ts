import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
  FfDividerComponent,
  FfDividerThickness,
} from '@fireflyframework/design-system';

import { DemoSection } from '../../shared/demo-section';

/** Catalog page for `ff-divider`. */
@Component({
  selector: 'app-divider-page',
  imports: [DemoSection, FfDividerComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="page">
      <h2 class="page__title">Divider</h2>
      <p class="page__lead">
        <code>&lt;ff-divider&gt;</code> — purely decorative separator, horizontal or
        vertical, in two thicknesses.
      </p>

      <app-demo-section
        heading="Horizontal"
        description="Both values of FfDividerThickness."
        [code]="snippets.horizontal"
      >
        <div class="demo-stack">
          @for (t of thicknesses; track t) {
            <div>
              <span class="demo-label">thickness "{{ t }}"</span>
              <ff-divider [thickness]="t" />
            </div>
          }
        </div>
      </app-demo-section>

      <app-demo-section
        heading="Vertical"
        description="Vertical orientation inside a flex row."
        [code]="snippets.vertical"
      >
        <div style="display: flex; align-items: stretch; gap: var(--ff-spacing-md); height: 48px">
          <span>Left</span>
          <ff-divider orientation="vertical" />
          <span>Middle</span>
          <ff-divider orientation="vertical" thickness="medium" />
          <span>Right</span>
        </div>
      </app-demo-section>
    </div>
  `,
})
export class DividerPage {
  protected readonly thicknesses: readonly FfDividerThickness[] = ['thin', 'medium'];

  protected readonly snippets = {
    horizontal: `<ff-divider />
<ff-divider thickness="medium" />`,
    vertical: `<ff-divider orientation="vertical" thickness="medium" />`,
  };
}
