import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { FfButtonComponent, FfDividerComponent } from '@fireflyframework/design-system';

import { CATALOG_COMPONENTS, PATTERN_COMPONENTS } from './shared/catalog-nav';
import { BrandThemeService } from './shared/brand-theme.service';
import { ThemeService } from './shared/theme.service';

/**
 * Playground shell: header with dark-mode toggle + sidebar navigation
 * over the four catalog layers (Foundations, Theming, Primitives, Patterns).
 */
@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, FfButtonComponent, FfDividerComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  protected readonly theme = inject(ThemeService);
  protected readonly brandTheme = inject(BrandThemeService);
  protected readonly components = CATALOG_COMPONENTS;
  protected readonly patterns = PATTERN_COMPONENTS;
}
