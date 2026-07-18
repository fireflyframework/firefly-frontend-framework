import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
  FfButtonComponent,
  FfTooltipComponent,
  FfTooltipPosition,
} from '@fireflyframework/design-system';

import { DemoSection } from '../../shared/demo-section';

/** Catalog page for `ff-tooltip`. */
@Component({
  selector: 'app-tooltip-page',
  imports: [DemoSection, FfTooltipComponent, FfButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="page">
      <h2 class="page__title">Tooltip</h2>
      <p class="page__lead">
        <code>&lt;ff-tooltip&gt;</code> — informational overlay shown on hover/focus over a
        projected trigger. Four positions (FfTooltipPosition).
      </p>

      <app-demo-section
        heading="Positions"
        description="Hover or focus each button — all values of FfTooltipPosition."
        [code]="snippets.positions"
      >
        @for (p of positions; track p) {
          <ff-tooltip [text]="'Tooltip on ' + p" [position]="p">
            <ff-button variant="outline">{{ p }}</ff-button>
          </ff-tooltip>
        }
      </app-demo-section>

      <app-demo-section
        heading="Empty text"
        description="With an empty text, no tooltip is rendered at all."
        [code]="snippets.empty"
      >
        <ff-tooltip text="">
          <ff-button variant="ghost">Hover me — nothing happens</ff-button>
        </ff-tooltip>
      </app-demo-section>
    </div>
  `,
})
export class TooltipPage {
  protected readonly positions: readonly FfTooltipPosition[] = [
    'top',
    'bottom',
    'left',
    'right',
  ];

  protected readonly snippets = {
    positions: `<ff-tooltip text="More info" position="top">
  <button>Hover me</button>
</ff-tooltip>`,
    empty: `<ff-tooltip text=""><button>No tooltip</button></ff-tooltip>`,
  };
}
