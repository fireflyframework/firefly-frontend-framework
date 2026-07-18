import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
  FfAvatarComponent,
  FfAvatarSize,
} from '@fireflyframework/design-system';

import { DemoSection } from '../../shared/demo-section';

/** Catalog page for `ff-avatar`. */
@Component({
  selector: 'app-avatar-page',
  imports: [DemoSection, FfAvatarComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="page">
      <h2 class="page__title">Avatar</h2>
      <p class="page__lead">
        <code>&lt;ff-avatar&gt;</code> — circular avatar with automatic initials fallback
        when the image is missing or fails to load.
      </p>

      <app-demo-section
        heading="Sizes"
        description="All values of FfAvatarSize, initials mode."
        [code]="snippets.sizes"
      >
        @for (s of sizes; track s) {
          <ff-avatar [size]="s" initials="MG" [alt]="'Avatar ' + s" />
        }
      </app-demo-section>

      <app-demo-section
        heading="Image error fallback"
        description="A broken src falls back to the initials automatically."
        [code]="snippets.fallback"
      >
        <ff-avatar src="https://invalid.example/broken.png" initials="FB" alt="Fallback demo" />
        <span class="demo-label">← src points to a broken URL, initials take over</span>
      </app-demo-section>
    </div>
  `,
})
export class AvatarPage {
  protected readonly sizes: readonly FfAvatarSize[] = ['sm', 'md', 'lg'];

  protected readonly snippets = {
    sizes: `<ff-avatar initials="JD" size="lg" />
<ff-avatar src="https://example.com/photo.jpg" alt="Jane Doe" />`,
    fallback: `<ff-avatar src="broken.png" initials="JD" alt="Jane Doe" />`,
  };
}
