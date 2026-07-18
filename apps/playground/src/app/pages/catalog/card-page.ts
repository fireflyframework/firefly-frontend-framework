import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
  FfButtonComponent,
  FfCardComponent,
  FfCardShadow,
} from '@fireflyframework/design-system';

import { DemoSection } from '../../shared/demo-section';

/** Catalog page for `ff-card`. */
@Component({
  selector: 'app-card-page',
  imports: [DemoSection, FfCardComponent, FfButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="page">
      <h2 class="page__title">Card</h2>
      <p class="page__lead">
        <code>&lt;ff-card&gt;</code> — container with header/body/footer projection slots and
        four shadow levels (FfCardShadow).
      </p>

      <app-demo-section
        heading="Shadow levels"
        description="All values of FfCardShadow."
        [code]="snippets.shadows"
      >
        @for (s of shadows; track s) {
          <ff-card [shadow]="s" style="min-width: 180px">
            <p style="margin: 0">shadow="{{ s }}"</p>
          </ff-card>
        }
      </app-demo-section>

      <app-demo-section
        heading="Slots"
        description="Header ([ff-card-header]), default body and footer ([ff-card-footer])."
        [code]="snippets.slots"
      >
        <ff-card shadow="md" style="min-width: 280px">
          <div ff-card-header>Monthly report</div>
          <p style="margin: 0">Body content projected into the default slot.</p>
          <div ff-card-footer>
            <ff-button size="sm">Download</ff-button>
          </div>
        </ff-card>
      </app-demo-section>
    </div>
  `,
})
export class CardPage {
  protected readonly shadows: readonly FfCardShadow[] = ['none', 'sm', 'md', 'lg'];

  protected readonly snippets = {
    shadows: `<ff-card shadow="none">…</ff-card>
<ff-card shadow="lg">…</ff-card>`,
    slots: `<ff-card shadow="md">
  <div ff-card-header>Title</div>
  <p>Body content.</p>
  <div ff-card-footer><ff-button>Save</ff-button></div>
</ff-card>`,
  };
}
