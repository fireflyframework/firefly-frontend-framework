import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
  FfIconComponent,
  FfIconSize,
} from '@fireflyframework/design-system';

import { DemoSection } from '../../shared/demo-section';
import { PLAYGROUND_ICONS } from '../../shared/icons';

/** Catalog page for `ff-icon`. */
@Component({
  selector: 'app-icon-page',
  imports: [DemoSection, FfIconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="page">
      <h2 class="page__title">Icon</h2>
      <p class="page__lead">
        <code>&lt;ff-icon&gt;</code> — SVG icon resolved by name from the registry built with
        <code>provideFfIcons</code>. The playground registers {{ names.length }} example
        icons in <code>app.config.ts</code>; icons inherit <code>currentColor</code>.
      </p>

      <app-demo-section
        heading="Registered icons"
        description="Every icon registered by the playground via provideFfIcons."
        [code]="snippets.registry"
      >
        @for (n of names; track n) {
          <div class="demo-stack" style="align-items: center; max-width: 80px">
            <ff-icon [name]="n" size="lg" />
            <span class="demo-label">{{ n }}</span>
          </div>
        }
      </app-demo-section>

      <app-demo-section
        heading="Sizes"
        description="All values of FfIconSize: 16 / 20 / 24 px."
        [code]="snippets.sizes"
      >
        @for (s of sizes; track s) {
          <ff-icon name="settings" [size]="s" />
        }
      </app-demo-section>

      <app-demo-section
        heading="Color and accessibility"
        description="Icons inherit the text color; a label exposes them as role='img'."
        [code]="snippets.color"
      >
        <span style="color: var(--ff-color-success-600)"><ff-icon name="check" size="lg" label="Success" /></span>
        <span style="color: var(--ff-color-error-500)"><ff-icon name="close" size="lg" label="Error" /></span>
        <span style="color: var(--ff-color-warning-600)"><ff-icon name="warning" size="lg" label="Warning" /></span>
      </app-demo-section>
    </div>
  `,
})
export class IconPage {
  protected readonly names = Object.keys(PLAYGROUND_ICONS);
  protected readonly sizes: readonly FfIconSize[] = ['sm', 'md', 'lg'];

  protected readonly snippets = {
    registry: `// app.config.ts
provideFfIcons({ check: 'M9 16.17 4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z', … })

<ff-icon name="check" />`,
    sizes: `<ff-icon name="settings" size="sm" />
<ff-icon name="settings" size="lg" />`,
    color: `<span style="color: var(--ff-color-success-600)">
  <ff-icon name="check" label="Success" />
</span>`,
  };
}
