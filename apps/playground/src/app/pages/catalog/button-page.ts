import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
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
        <code>&lt;ff-button&gt;</code> — action button with four variants, three sizes, and
        disabled/loading states. Emits <code>(clicked)</code> only when interactive.
      </p>

      <app-demo-section
        heading="Variants"
        description="All values of FfButtonVariant."
        [code]="snippets.variants"
      >
        @for (v of variants; track v) {
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
  protected readonly variants: readonly FfButtonVariant[] = [
    'primary',
    'secondary',
    'outline',
    'ghost',
  ];
  protected readonly sizes: readonly FfButtonSize[] = ['sm', 'md', 'lg'];

  protected readonly snippets = {
    variants: `<ff-button variant="primary" (clicked)="save()">Save</ff-button>
<ff-button variant="secondary">Secondary</ff-button>
<ff-button variant="outline">Outline</ff-button>
<ff-button variant="ghost">Ghost</ff-button>`,
    sizes: `<ff-button size="sm">Small</ff-button>
<ff-button size="md">Medium</ff-button>
<ff-button size="lg">Large</ff-button>`,
    states: `<ff-button [disabled]="true">Disabled</ff-button>
<ff-button [loading]="isSaving">Saving…</ff-button>`,
  };
}
