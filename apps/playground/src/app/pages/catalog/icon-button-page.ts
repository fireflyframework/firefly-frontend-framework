import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
  FfIconButtonComponent,
  FfIconButtonSize,
  FfIconComponent,
} from '@fireflyframework/design-system';

import { DemoSection } from '../../shared/demo-section';

/** Catalog page for `ff-icon-button`. */
@Component({
  selector: 'app-icon-button-page',
  imports: [DemoSection, FfIconButtonComponent, FfIconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="page">
      <h2 class="page__title">Icon Button</h2>
      <p class="page__lead">
        <code>&lt;ff-icon-button&gt;</code> — compact square button for icon-only actions.
        The icon is projected; <code>tooltip</code> maps to the native title attribute.
      </p>

      <app-demo-section
        heading="Sizes"
        description="All values of FfIconButtonSize, with a projected ff-icon."
        [code]="snippets.sizes"
      >
        @for (s of sizes; track s) {
          <ff-icon-button [size]="s" tooltip="Search">
            <ff-icon name="search" />
          </ff-icon-button>
        }
      </app-demo-section>

      <app-demo-section
        heading="States"
        description="Disabled icon buttons ignore clicks."
        [code]="snippets.states"
      >
        <ff-icon-button tooltip="Settings">
          <ff-icon name="settings" />
        </ff-icon-button>
        <ff-icon-button [disabled]="true" tooltip="Disabled">
          <ff-icon name="close" />
        </ff-icon-button>
      </app-demo-section>
    </div>
  `,
})
export class IconButtonPage {
  protected readonly sizes: readonly FfIconButtonSize[] = ['sm', 'md', 'lg'];

  protected readonly snippets = {
    sizes: `<ff-icon-button size="md" tooltip="Search" (clicked)="onSearch()">
  <ff-icon name="search" />
</ff-icon-button>`,
    states: `<ff-icon-button [disabled]="true" tooltip="Disabled">
  <ff-icon name="close" />
</ff-icon-button>`,
  };
}
