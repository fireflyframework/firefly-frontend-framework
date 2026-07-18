import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
  FfLoaderComponent,
  FfLoaderSize,
  FfLoaderVariant,
} from '@fireflyframework/design-system';

import { DemoSection } from '../../shared/demo-section';

/** Catalog page for `ff-loader`. */
@Component({
  selector: 'app-loader-page',
  imports: [DemoSection, FfLoaderComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="page">
      <h2 class="page__title">Loader</h2>
      <p class="page__lead">
        <code>&lt;ff-loader&gt;</code> — indeterminate spinner or skeleton shimmer, CSS-only
        animations.
      </p>

      <app-demo-section
        heading="Variants"
        description="All values of FfLoaderVariant."
        [code]="snippets.variants"
      >
        @for (v of variants; track v) {
          <div class="demo-stack" style="max-width: 160px">
            <span class="demo-label">{{ v }}</span>
            <ff-loader [variant]="v" />
          </div>
        }
      </app-demo-section>

      <app-demo-section
        heading="Sizes"
        description="All values of FfLoaderSize (spinner mode)."
        [code]="snippets.sizes"
      >
        @for (s of sizes; track s) {
          <ff-loader variant="spinner" [size]="s" />
        }
      </app-demo-section>
    </div>
  `,
})
export class LoaderPage {
  protected readonly variants: readonly FfLoaderVariant[] = ['spinner', 'skeleton'];
  protected readonly sizes: readonly FfLoaderSize[] = ['sm', 'md', 'lg'];

  protected readonly snippets = {
    variants: `<ff-loader variant="spinner" size="md" />
<ff-loader variant="skeleton" size="lg" />`,
    sizes: `<ff-loader size="sm" />
<ff-loader size="md" />
<ff-loader size="lg" />`,
  };
}
