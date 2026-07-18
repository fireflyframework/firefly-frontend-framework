import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
} from '@angular/core';

import { DemoSection } from '../../shared/demo-section';
import { ThemeService } from '../../shared/theme.service';

/** Color families exposed by the token layer (steps 100–900 each). */
const COLOR_FAMILIES = [
  'primary',
  'secondary',
  'tertiary',
  'neutral',
  'success',
  'warning',
  'error',
  'info',
] as const;

/** Scale steps shared by every color family. */
const COLOR_STEPS = [100, 200, 300, 400, 500, 600, 700, 800, 900] as const;

/**
 * Foundations: the raw design tokens — color scales, spacing, radius,
 * typography and elevation — rendered from the real CSS custom properties.
 */
@Component({
  selector: 'app-foundations-page',
  imports: [DemoSection],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="page">
      <h2 class="page__title">Foundations</h2>
      <p class="page__lead">
        The raw token layer of the design system. Every value below is read live from the
        CSS custom properties on <code>:root</code> — toggle dark mode in the header to see
        the palettes flip.
      </p>

      <app-demo-section
        heading="Color"
        description="8 families × 9 steps (100–900). Swatch values are resolved with getComputedStyle."
      >
        <div class="demo-stack" style="max-width: 100%">
          @for (family of families; track family) {
            <div>
              <h4 class="scale-title">{{ family }}</h4>
              <div class="swatch-scale">
                @for (step of steps; track step) {
                  <div class="swatch">
                    <div
                      class="swatch__color"
                      [style.background]="'var(' + varName(family, step) + ')'"
                    ></div>
                    <div class="swatch__meta">{{ step }} · {{ resolved()[varName(family, step)] }}</div>
                  </div>
                }
              </div>
            </div>
          }
        </div>
      </app-demo-section>

      <app-demo-section
        heading="Spacing"
        description="5-value scale: xs(4) sm(8) md(16) lg(24) xl(32)."
      >
        <div class="demo-stack">
          @for (s of spacing; track s) {
            <div>
              <span class="demo-label">--ff-spacing-{{ s }} · {{ resolved()['--ff-spacing-' + s] }}</span>
              <div class="spacing-bar" [style.width]="'calc(var(--ff-spacing-' + s + ') * 6)'"></div>
            </div>
          }
        </div>
      </app-demo-section>

      <app-demo-section heading="Radius" description="Corner radii from subtle to fully round.">
        @for (r of radii; track r) {
          <div class="radius-box" [style.border-radius]="'var(--ff-radius-' + r + ')'">
            {{ r }} · {{ resolved()['--ff-radius-' + r] }}
          </div>
        }
      </app-demo-section>

      <app-demo-section
        heading="Typography"
        description="Modular font-size scale (--ff-font-size-*)."
      >
        <div class="demo-stack" style="max-width: 100%">
          @for (size of fontSizes; track size) {
            <div>
              <span class="demo-label">--ff-font-size-{{ size }} · {{ resolved()['--ff-font-size-' + size] }}</span>
              <div [style.font-size]="'var(--ff-font-size-' + size + ')'">
                The quick brown fox
              </div>
            </div>
          }
        </div>
      </app-demo-section>

      <app-demo-section
        heading="Shadows"
        description="Elevation tokens (--ff-elevation-sm/md/lg) applied to surface boxes."
      >
        @for (level of elevations; track level) {
          <div class="shadow-box" [style.box-shadow]="'var(--ff-elevation-' + level + ')'">
            elevation-{{ level }}
          </div>
        }
      </app-demo-section>
    </div>
  `,
})
export class FoundationsPage {
  private readonly theme = inject(ThemeService);

  protected readonly families = COLOR_FAMILIES;
  protected readonly steps = COLOR_STEPS;
  protected readonly spacing = ['xs', 'sm', 'md', 'lg', 'xl'] as const;
  protected readonly radii = ['sm', 'md', 'lg', 'full'] as const;
  protected readonly fontSizes = ['2xs', 'xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl'] as const;
  protected readonly elevations = ['sm', 'md', 'lg'] as const;

  /** All token values re-read from :root whenever the theme flips. */
  protected readonly resolved = computed<Record<string, string>>(() => {
    this.theme.dark(); // reactive dependency: recompute on theme change
    const style = getComputedStyle(document.documentElement);
    const out: Record<string, string> = {};
    const names: string[] = [];
    for (const family of this.families) {
      for (const step of this.steps) {
        names.push(this.varName(family, step));
      }
    }
    for (const s of this.spacing) names.push(`--ff-spacing-${s}`);
    for (const r of this.radii) names.push(`--ff-radius-${r}`);
    for (const f of this.fontSizes) names.push(`--ff-font-size-${f}`);
    for (const name of names) {
      out[name] = style.getPropertyValue(name).trim();
    }
    return out;
  });

  /** Builds the custom-property name of a color scale step. */
  protected varName(family: string, step: number): string {
    return `--ff-color-${family}-${step}`;
  }
}
