import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FfSkeletonComponent } from '@fireflyframework/design-system';

import { DemoSection } from '../../shared/demo-section';

/** Catalog page for `ff-skeleton`. */
@Component({
  selector: 'app-skeleton-page',
  imports: [DemoSection, FfSkeletonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="page">
      <h2 class="page__title">Skeleton</h2>
      <p class="page__lead">
        <code>&lt;ff-skeleton&gt;</code> — loading placeholder in three shapes
        (FfSkeletonVariant: text, rect, circle). Shimmer is CSS-only and respects
        prefers-reduced-motion.
      </p>

      <app-demo-section
        heading="Variants"
        description="text (multi-line, last line at 60%), rect and circle."
        [code]="snippets.variants"
      >
        <div class="demo-stack">
          <span class="demo-label">text · 3 lines</span>
          <ff-skeleton variant="text" [lines]="3" />
          <span class="demo-label">rect</span>
          <ff-skeleton variant="rect" height="120px" />
          <span class="demo-label">circle</span>
          <ff-skeleton variant="circle" height="48px" />
        </div>
      </app-demo-section>

      <app-demo-section
        heading="Without animation"
        description="animated=false renders a static placeholder."
        [code]="snippets.static"
      >
        <div class="demo-stack">
          <ff-skeleton variant="rect" height="60px" [animated]="false" />
        </div>
      </app-demo-section>

      <app-demo-section
        heading="Composed card placeholder"
        description="Combining shapes to sketch a loading card."
        [code]="snippets.composed"
      >
        <div style="display: flex; gap: var(--ff-spacing-md); align-items: flex-start; width: 320px">
          <ff-skeleton variant="circle" height="40px" />
          <div style="flex: 1">
            <ff-skeleton variant="text" [lines]="2" />
          </div>
        </div>
      </app-demo-section>
    </div>
  `,
})
export class SkeletonPage {
  protected readonly snippets = {
    variants: `<ff-skeleton variant="text" [lines]="3" width="80%" />
<ff-skeleton variant="rect" height="120px" />
<ff-skeleton variant="circle" height="48px" />`,
    static: `<ff-skeleton variant="rect" [animated]="false" />`,
    composed: `<ff-skeleton variant="circle" height="40px" />
<ff-skeleton variant="text" [lines]="2" />`,
  };
}
