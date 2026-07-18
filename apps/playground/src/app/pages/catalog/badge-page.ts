import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
  FfBadgeComponent,
  FfBadgeSize,
  FfBadgeVariant,
} from '@fireflyframework/design-system';

import { DemoSection } from '../../shared/demo-section';

/** Catalog page for `ff-badge`. */
@Component({
  selector: 'app-badge-page',
  imports: [DemoSection, FfBadgeComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="page">
      <h2 class="page__title">Badge</h2>
      <p class="page__lead">
        <code>&lt;ff-badge&gt;</code> — inline status label with semantic color variants.
        Content is projected.
      </p>

      <app-demo-section
        heading="Variants"
        description="All values of FfBadgeVariant."
        [code]="snippets.variants"
      >
        @for (v of variants; track v) {
          <ff-badge [variant]="v">{{ v }}</ff-badge>
        }
      </app-demo-section>

      <app-demo-section
        heading="Sizes"
        description="All values of FfBadgeSize."
        [code]="snippets.sizes"
      >
        @for (s of sizes; track s) {
          <ff-badge variant="info" [size]="s">size {{ s }}</ff-badge>
        }
      </app-demo-section>
    </div>
  `,
})
export class BadgePage {
  protected readonly variants: readonly FfBadgeVariant[] = [
    'success',
    'warning',
    'error',
    'info',
    'neutral',
  ];
  protected readonly sizes: readonly FfBadgeSize[] = ['sm', 'md'];

  protected readonly snippets = {
    variants: `<ff-badge variant="success">Active</ff-badge>
<ff-badge variant="error">Failed</ff-badge>`,
    sizes: `<ff-badge variant="info" size="sm">12</ff-badge>`,
  };
}
