import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
  FfButtonColor,
  FfButtonComponent,
  FfButtonSize,
  FfButtonVariant,
} from '@fireflyframework/design-system';

import { DemoSection } from '../../shared/demo-section';

/** Catalog page for `ff-button`. */
@Component({
  selector: 'app-button-page',
  imports: [DemoSection, FfButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="page">
      <h2 class="page__title">Button</h2>
      <p class="page__lead">
        <code>&lt;ff-button&gt;</code> — action button with two independent axes,
        <code>variant</code> (style: solid / outline / ghost) and <code>color</code>
        (semantic palette), three sizes, and disabled/loading states. Emits
        <code>(clicked)</code> only when interactive.
      </p>

      <app-demo-section
        heading="Style × Color"
        description="Every FfButtonVariant style crossed with every FfButtonColor."
        [code]="snippets.axes"
      >
        <div class="demo-stack" style="max-width: 100%">
          @for (v of styleVariants; track v) {
            <div>
              <span class="demo-label">variant="{{ v }}"</span><br />
              @for (c of colors; track c) {
                <ff-button [variant]="v" [color]="c">{{ c }}</ff-button>
              }
            </div>
          }
        </div>
      </app-demo-section>

      <app-demo-section
        heading="Legacy variant compatibility"
        description="Pre-dual-axis values ('primary' / 'secondary') keep rendering as solid buttons — soft-deprecated, still supported."
        [code]="snippets.legacy"
      >
        @for (v of legacyVariants; track v) {
          <ff-button [variant]="v">{{ v }}</ff-button>
        }
      </app-demo-section>

      <app-demo-section
        heading="Sizes"
        description="All values of FfButtonSize."
        [code]="snippets.sizes"
      >
        @for (s of sizes; track s) {
          <ff-button [size]="s">size {{ s }}</ff-button>
        }
      </app-demo-section>

      <app-demo-section
        heading="States"
        description="Disabled and loading buttons ignore clicks."
        [code]="snippets.states"
      >
        <ff-button [disabled]="true">Disabled</ff-button>
        <ff-button [loading]="true">Loading</ff-button>
        <ff-button variant="outline" [loading]="true">Loading outline</ff-button>
      </app-demo-section>
    </div>
  `,
})
export class ButtonPage {
  protected readonly styleVariants: readonly FfButtonVariant[] = ['solid', 'outline', 'ghost'];
  protected readonly colors: readonly FfButtonColor[] = [
    'primary',
    'secondary',
    'success',
    'warning',
    'error',
    'info',
    'neutral',
  ];
  protected readonly legacyVariants: readonly FfButtonVariant[] = ['primary', 'secondary'];
  protected readonly sizes: readonly FfButtonSize[] = ['sm', 'md', 'lg'];

  protected readonly snippets = {
    axes: `<ff-button variant="solid" color="primary" (clicked)="save()">Save</ff-button>
<ff-button variant="outline" color="danger">Delete</ff-button>
<ff-button variant="ghost" color="neutral">Cancel</ff-button>`,
    legacy: `<!-- soft-deprecated, still supported: maps to solid + matching color -->
<ff-button variant="primary">Save</ff-button>
<ff-button variant="secondary">Secondary</ff-button>`,
    sizes: `<ff-button size="sm">Small</ff-button>
<ff-button size="md">Medium</ff-button>
<ff-button size="lg">Large</ff-button>`,
    states: `<ff-button [disabled]="true">Disabled</ff-button>
<ff-button [loading]="isSaving">Saving…</ff-button>`,
  };
}
