import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
  FfToastComponent,
  FfToastVariant,
} from '@fireflyframework/design-system';

import { DemoSection } from '../../shared/demo-section';

/** Catalog page for `ff-toast`. */
@Component({
  selector: 'app-toast-page',
  imports: [DemoSection, FfToastComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="page">
      <h2 class="page__title">Toast</h2>
      <p class="page__lead">
        <code>&lt;ff-toast&gt;</code> — compact notification rendered inline; the consumer
        owns positioning and lifecycle (e.g. an AlertService loop).
      </p>

      <app-demo-section
        heading="Variants"
        description="All values of FfToastVariant."
        [code]="snippets.variants"
      >
        <div class="demo-stack">
          @for (v of variants; track v) {
            <ff-toast [message]="'This is a ' + v + ' toast'" [type]="v" />
          }
        </div>
      </app-demo-section>

      <app-demo-section
        heading="Non-dismissible"
        description="dismissible=false removes the close button."
        [code]="snippets.persistent"
      >
        <div class="demo-stack">
          <ff-toast message="You cannot close me manually" type="info" [dismissible]="false" />
        </div>
      </app-demo-section>
    </div>
  `,
})
export class ToastPage {
  protected readonly variants: readonly FfToastVariant[] = [
    'success',
    'error',
    'warning',
    'info',
  ];

  protected readonly snippets = {
    variants: `<ff-toast message="Saved!" type="success" (dismissed)="remove()" />`,
    persistent: `<ff-toast message="Syncing…" type="info" [dismissible]="false" />`,
  };
}
