import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import {
  FfBannerComponent,
  FfBannerVariant,
} from '@fireflyframework/design-system';

import { DemoSection } from '../../shared/demo-section';

/** Catalog page for `ff-banner`. */
@Component({
  selector: 'app-banner-page',
  imports: [DemoSection, FfBannerComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="page">
      <h2 class="page__title">Banner</h2>
      <p class="page__lead">
        <code>&lt;ff-banner&gt;</code> — full-width notification bar with optional action
        button and dismiss. The consumer owns positioning.
      </p>

      <app-demo-section
        heading="Variants"
        description="All values of FfBannerVariant."
        [code]="snippets.variants"
      >
        <div class="demo-stack" style="max-width: 100%">
          @for (v of variants; track v) {
            <ff-banner [message]="'This is a ' + v + ' banner'" [type]="v" />
          }
        </div>
      </app-demo-section>

      <app-demo-section
        heading="With action"
        description="actionLabel renders a button that emits (actionClicked)."
        [code]="snippets.action"
      >
        <div class="demo-stack" style="max-width: 100%">
          <ff-banner
            message="A new version is available."
            type="info"
            actionLabel="Reload"
            (actionClicked)="clicks.set(clicks() + 1)"
          />
          <span class="demo-label">actionClicked fired {{ clicks() }} times</span>
        </div>
      </app-demo-section>
    </div>
  `,
})
export class BannerPage {
  protected readonly variants: readonly FfBannerVariant[] = [
    'success',
    'error',
    'warning',
    'info',
  ];
  protected readonly clicks = signal(0);

  protected readonly snippets = {
    variants: `<ff-banner message="Quota reached" type="warning" (dismissed)="hide()" />`,
    action: `<ff-banner message="A new version is available." type="info"
  actionLabel="Reload" (actionClicked)="reload()" />`,
  };
}
