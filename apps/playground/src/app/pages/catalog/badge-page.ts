import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
  FfBadgeColor,
  FfBadgeComponent,
  FfBadgeShape,
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
        heading="Colors"
        description="All values of FfBadgeColor. The color axis is independent of variant and takes precedence over it."
        [code]="snippets.colors"
      >
        @for (c of colors; track c) {
          <ff-badge [color]="c">{{ c }}</ff-badge>
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

      <app-demo-section
        heading="Shapes"
        description="All values of FfBadgeShape: full-radius pill (default) or square with --ff-radius-sm."
        [code]="snippets.shapes"
      >
        @for (sh of shapes; track sh) {
          <ff-badge color="primary" [shape]="sh">{{ sh }}</ff-badge>
        }
      </app-demo-section>

      <app-demo-section
        heading="Dot"
        description="Status dot mode: aria-hidden colored dot, with or without a projected label."
        [code]="snippets.dot"
      >
        <ff-badge color="success" [dot]="true">Online</ff-badge>
        <ff-badge color="warning" [dot]="true">Degraded</ff-badge>
        <ff-badge color="error" [dot]="true" />
      </app-demo-section>

      <app-demo-section
        heading="Overflow tooltip"
        description="With maxWidth set the label truncates with an ellipsis and, only when really truncated, the badge exposes the full text through the native title tooltip (owned by the component)."
        [code]="snippets.overflow"
      >
        <ff-badge variant="info" maxWidth="120px">
          Very long status label that truncates
        </ff-badge>
        <ff-badge variant="neutral" maxWidth="200px">Short label</ff-badge>
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
  protected readonly colors: readonly FfBadgeColor[] = [
    'primary',
    'secondary',
    'success',
    'warning',
    'error',
    'info',
    'neutral',
  ];
  protected readonly sizes: readonly FfBadgeSize[] = ['xs', 'sm', 'md'];
  protected readonly shapes: readonly FfBadgeShape[] = ['pill', 'square'];

  protected readonly snippets = {
    variants: `<ff-badge variant="success">Active</ff-badge>
<ff-badge variant="error">Failed</ff-badge>`,
    colors: `<ff-badge color="primary">Beta</ff-badge>
<ff-badge color="secondary">New</ff-badge>`,
    sizes: `<ff-badge variant="info" size="xs">3</ff-badge>
<ff-badge variant="info" size="sm">12</ff-badge>`,
    shapes: `<ff-badge color="primary" shape="square">Draft</ff-badge>`,
    dot: `<ff-badge color="success" [dot]="true">Online</ff-badge>
<ff-badge color="error" [dot]="true" />`,
    overflow: `<ff-badge variant="info" maxWidth="120px">
  Very long status label that truncates
</ff-badge>`,
  };
}
