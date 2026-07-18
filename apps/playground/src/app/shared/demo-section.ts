import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/**
 * Reusable catalog block: title + description + render stage + code snippet.
 *
 * The demo content is projected into the stage; the snippet is passed as a
 * plain string via the `code` input.
 */
@Component({
  selector: 'app-demo-section',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="demo-section">
      <h3 class="demo-section__title">{{ heading() }}</h3>
      @if (description()) {
        <p class="demo-section__description">{{ description() }}</p>
      }
      <div class="demo-section__stage">
        <ng-content />
      </div>
      @if (code()) {
        <pre class="demo-section__code"><code>{{ code() }}</code></pre>
      }
    </section>
  `,
})
export class DemoSection {
  /** Section title. */
  readonly heading = input.required<string>();

  /** Optional short explanation rendered under the title. */
  readonly description = input('');

  /** Optional usage snippet rendered as a code block. */
  readonly code = input('');
}
