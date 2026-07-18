import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
  FfButtonComponent,
  FfEmptyStateComponent,
  FfIconComponent,
} from '@fireflyframework/design-system';

import { DemoSection } from '../../shared/demo-section';

/** Catalog page for `ff-empty-state`. */
@Component({
  selector: 'app-empty-state-page',
  imports: [DemoSection, FfEmptyStateComponent, FfButtonComponent, FfIconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="page">
      <h2 class="page__title">Empty State</h2>
      <p class="page__lead">
        <code>&lt;ff-empty-state&gt;</code> — centered placeholder with a required title,
        optional description, projected icon and an action slot.
      </p>

      <app-demo-section heading="Title only" [code]="snippets.minimal">
        <ff-empty-state title="No results" style="width: 100%" />
      </app-demo-section>

      <app-demo-section
        heading="Full composition"
        description="Icon slot ([ff-empty-state-icon]) + description + call-to-action."
        [code]="snippets.full"
      >
        <ff-empty-state
          title="No documents yet"
          description="Upload your first document to get started."
          style="width: 100%"
        >
          <ff-icon ff-empty-state-icon name="search" size="lg" />
          <ff-button (clicked)="noop()">Upload document</ff-button>
        </ff-empty-state>
      </app-demo-section>
    </div>
  `,
})
export class EmptyStatePage {
  protected noop(): void {
    // demo action
  }

  protected readonly snippets = {
    minimal: `<ff-empty-state title="No results" />`,
    full: `<ff-empty-state title="No documents yet"
  description="Upload your first document to get started.">
  <ff-icon ff-empty-state-icon name="search" size="lg" />
  <ff-button (clicked)="upload()">Upload document</ff-button>
</ff-empty-state>`,
  };
}
