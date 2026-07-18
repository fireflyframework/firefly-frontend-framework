import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
  FfLinkComponent,
  FfLinkVariant,
} from '@fireflyframework/design-system';

import { DemoSection } from '../../shared/demo-section';

/** Catalog page for `ff-link`. */
@Component({
  selector: 'app-link-page',
  imports: [DemoSection, FfLinkComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="page">
      <h2 class="page__title">Link</h2>
      <p class="page__lead">
        <code>&lt;ff-link&gt;</code> — styled anchor. Adds
        <code>rel="noopener noreferrer"</code> automatically when target is _blank.
      </p>

      <app-demo-section
        heading="Variants"
        description="All values of FfLinkVariant."
        [code]="snippets.variants"
      >
        @for (v of variants; track v) {
          <ff-link href="#" [variant]="v">{{ v }} link</ff-link>
        }
      </app-demo-section>

      <app-demo-section
        heading="States and options"
        description="Underline off, disabled, external target."
        [code]="snippets.states"
      >
        <ff-link href="#" [underline]="false">No underline</ff-link>
        <ff-link href="#" [disabled]="true">Disabled</ff-link>
        <ff-link href="https://angular.dev" target="_blank" variant="standalone">
          External (new tab)
        </ff-link>
      </app-demo-section>
    </div>
  `,
})
export class LinkPage {
  protected readonly variants: readonly FfLinkVariant[] = ['inline', 'standalone'];

  protected readonly snippets = {
    variants: `<ff-link href="/dashboard">Go to dashboard</ff-link>
<ff-link href="/docs" variant="standalone">Documentation</ff-link>`,
    states: `<ff-link href="#" [underline]="false">No underline</ff-link>
<ff-link href="#" [disabled]="true">Disabled</ff-link>
<ff-link href="https://example.com" target="_blank">External</ff-link>`,
  };
}
