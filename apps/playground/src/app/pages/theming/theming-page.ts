import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
} from '@angular/core';
import { FfButtonComponent, FfPanelComponent } from '@fireflyframework/design-system';

import { DemoSection } from '../../shared/demo-section';
import { ThemeService } from '../../shared/theme.service';

/** Semantic tokens shown in the live inspector. */
const INSPECTED_TOKENS = [
  '--ff-color-surface',
  '--ff-color-background',
  '--ff-color-border',
  '--ff-color-border-focus',
  '--ff-color-on-primary',
  '--ff-color-on-surface',
  '--ff-color-on-surface-variant',
  '--ff-color-overlay',
  '--ff-text-primary',
  '--ff-text-secondary',
  '--ff-text-muted',
  '--ff-text-disabled',
  '--ff-bg-primary',
  '--ff-bg-secondary',
  '--ff-bg-tertiary',
] as const;

/**
 * Theming: explains the token cascade (defaults → tenant → dark) and offers a
 * live inspector of the semantic tokens, re-resolved on every theme toggle.
 */
@Component({
  selector: 'app-theming-page',
  imports: [DemoSection, FfButtonComponent, FfPanelComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="page">
      <h2 class="page__title">Theming</h2>
      <p class="page__lead">
        Firefly themes are pure CSS custom properties. Components never reference raw
        colors — only semantic tokens — so re-theming is a matter of overriding variables.
      </p>

      <app-demo-section
        heading="The cascade"
        description="Three layers override each other in order, all at CSS level — no rebuild required."
      >
        <div class="demo-stack" style="max-width: 100%">
          <ff-panel appearance="alert" variant="neutral" heading="1 · Defaults">
            <code>:root</code> receives the full token set from the design-system
            (<code>tokens/index.scss</code>): palettes, semantic aliases, spacing, typography.
          </ff-panel>
          <ff-panel appearance="alert" variant="primary" heading="2 · Tenant">
            A tenant theme overrides a small set of brand tokens (primary/secondary scales,
            radius, fonts) on <code>:root</code>, after the defaults. Everything downstream
            follows automatically.
          </ff-panel>
          <ff-panel appearance="alert" variant="info" heading="3 · Dark">
            <code>:root[data-theme="dark"]</code> (see <code>_dark.scss</code>) inverts the
            palette scales and remaps surfaces/text. It wins over both previous layers and is
            what the header toggle activates.
          </ff-panel>
        </div>
      </app-demo-section>

      <app-demo-section
        heading="Dark mode toggle"
        description="Sets data-theme='dark' on <html> and persists the choice in localStorage ('ff-dark-mode')."
      >
        <ff-button (clicked)="theme.toggle()">
          Switch to {{ theme.dark() ? 'light' : 'dark' }} mode
        </ff-button>
        <span class="demo-label">Current: {{ theme.dark() ? 'dark' : 'light' }}</span>
      </app-demo-section>

      <app-demo-section
        heading="Token inspector"
        description="Computed value of the main semantic tokens, re-read live on every toggle."
      >
        <table class="token-table">
          <thead>
            <tr>
              <th>Token</th>
              <th>Sample</th>
              <th>Computed value</th>
            </tr>
          </thead>
          <tbody>
            @for (token of tokens(); track token.name) {
              <tr>
                <td class="token-table__name">{{ token.name }}</td>
                <td><span class="token-table__chip" [style.background]="'var(' + token.name + ')'"></span></td>
                <td class="token-table__value">{{ token.value }}</td>
              </tr>
            }
          </tbody>
        </table>
      </app-demo-section>
    </div>
  `,
})
export class ThemingPage {
  protected readonly theme = inject(ThemeService);

  /** Inspected tokens with their current computed value (reactive to theme). */
  protected readonly tokens = computed(() => {
    this.theme.dark(); // reactive dependency: recompute on theme change
    const style = getComputedStyle(document.documentElement);
    return INSPECTED_TOKENS.map((name) => ({
      name,
      value: style.getPropertyValue(name).trim(),
    }));
  });
}
