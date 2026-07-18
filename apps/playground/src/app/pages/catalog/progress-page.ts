import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import {
  FfButtonComponent,
  FfProgressComponent,
  FfProgressSize,
  FfProgressVariant,
} from '@fireflyframework/design-system';

import { DemoSection } from '../../shared/demo-section';

/** Catalog page for `ff-progress`. */
@Component({
  selector: 'app-progress-page',
  imports: [DemoSection, FfProgressComponent, FfButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="page">
      <h2 class="page__title">Progress</h2>
      <p class="page__lead">
        <code>&lt;ff-progress&gt;</code> — determinate progress bar, value clamped to 0–100,
        with semantic variants and two track heights.
      </p>

      <app-demo-section
        heading="Variants"
        description="All values of FfProgressVariant."
        [code]="snippets.variants"
      >
        <div class="demo-stack">
          @for (v of variants; track v) {
            <div>
              <span class="demo-label">{{ v }}</span>
              <ff-progress [value]="65" [variant]="v" [label]="'Progress ' + v" />
            </div>
          }
        </div>
      </app-demo-section>

      <app-demo-section
        heading="Sizes and value display"
        description="All values of FfProgressSize; showValue renders the percentage."
        [code]="snippets.sizes"
      >
        <div class="demo-stack">
          @for (s of sizes; track s) {
            <ff-progress [value]="40" [size]="s" [showValue]="true" [label]="'Size ' + s" />
          }
        </div>
      </app-demo-section>

      <app-demo-section
        heading="Live value"
        description="Signal-driven value with clamping (try passing above 100)."
        [code]="snippets.live"
      >
        <div class="demo-stack">
          <ff-progress [value]="value()" variant="success" [showValue]="true" label="Live demo" />
          <div style="display: flex; gap: var(--ff-spacing-sm)">
            <ff-button size="sm" variant="outline" (clicked)="add(-20)">-20</ff-button>
            <ff-button size="sm" variant="outline" (clicked)="add(20)">+20</ff-button>
          </div>
        </div>
      </app-demo-section>
    </div>
  `,
})
export class ProgressPage {
  protected readonly variants: readonly FfProgressVariant[] = [
    'primary',
    'success',
    'warning',
    'error',
  ];
  protected readonly sizes: readonly FfProgressSize[] = ['sm', 'md'];
  protected readonly value = signal(60);

  protected add(delta: number): void {
    this.value.set(Math.min(100, Math.max(0, this.value() + delta)));
  }

  protected readonly snippets = {
    variants: `<ff-progress [value]="42" label="Upload progress" />
<ff-progress [value]="42" variant="error" />`,
    sizes: `<ff-progress [value]="40" size="sm" [showValue]="true" />`,
    live: `<ff-progress [value]="uploadPct()" variant="success" [showValue]="true" />`,
  };
}
