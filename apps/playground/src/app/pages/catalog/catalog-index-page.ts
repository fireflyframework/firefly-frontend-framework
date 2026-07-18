import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FfCardComponent, FfLinkComponent } from '@fireflyframework/design-system';

import { CATALOG_COMPONENTS } from '../../shared/catalog-nav';

/** Catalog index: one ff-card per primitive, linking to its demo page. */
@Component({
  selector: 'app-catalog-index-page',
  imports: [RouterLink, FfCardComponent, FfLinkComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="page" style="max-width: 1200px">
      <h2 class="page__title">Primitives</h2>
      <p class="page__lead">
        {{ components.length }} standalone primitives, importable from
        <code>&#64;fireflyframework/design-system</code>. Pick one to see its variants,
        states and usage snippets.
      </p>

      <div class="catalog-grid">
        @for (c of components; track c.slug) {
          <ff-card shadow="sm">
            <div ff-card-header>
              <a [routerLink]="['/catalog', c.slug]" style="text-decoration: none">
                <ff-link>{{ c.label }}</ff-link>
              </a>
              <code class="demo-label">&lt;{{ c.selector }}&gt;</code>
            </div>
            <p class="catalog-grid__body">{{ c.description }}</p>
          </ff-card>
        }
      </div>
    </div>
  `,
})
export class CatalogIndexPage {
  protected readonly components = CATALOG_COMPONENTS;
}
