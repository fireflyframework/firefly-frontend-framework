import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  FfBadgeComponent,
  FfCardComponent,
  FfLinkComponent,
} from '@fireflyframework/design-system';

import { PATTERN_COMPONENTS } from '../../shared/catalog-nav';

/** Planned patterns not yet implemented in the design system. */
const PATTERN_BACKLOG = [
  'Data table (sortable columns, row selection)',
  'Form field group (label + control + validation orchestration)',
  'Pagination',
  'Breadcrumbs',
  'Stepper / wizard',
  'App shell (top bar + collapsible side nav)',
] as const;

/** Patterns index: implemented patterns + backlog of upcoming ones. */
@Component({
  selector: 'app-patterns-page',
  imports: [RouterLink, FfCardComponent, FfLinkComponent, FfBadgeComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="page">
      <h2 class="page__title">Patterns</h2>
      <p class="page__lead">
        Patterns are compositions of primitives (and only primitives) solving a recurring
        UI problem. One pattern is available today; the rest are on the backlog.
      </p>

      <div class="catalog-grid">
        @for (p of patterns; track p.slug) {
          <ff-card shadow="sm">
            <div ff-card-header>
              <a [routerLink]="['/patterns', p.slug]" style="text-decoration: none">
                <ff-link>{{ p.label }}</ff-link>
              </a>
              <ff-badge variant="success" size="sm">Available</ff-badge>
            </div>
            <p class="catalog-grid__body">{{ p.description }}</p>
          </ff-card>
        }
      </div>

      <ff-card shadow="none">
        <div ff-card-header>
          Backlog
          <ff-badge variant="neutral" size="sm">Not implemented yet</ff-badge>
        </div>
        <p class="catalog-grid__body">
          These patterns do not exist in the design system yet — they are listed here so the
          catalog reflects the real state of the library:
        </p>
        <ul class="catalog-grid__body">
          @for (item of backlog; track item) {
            <li>{{ item }}</li>
          }
        </ul>
      </ff-card>
    </div>
  `,
})
export class PatternsPage {
  protected readonly patterns = PATTERN_COMPONENTS;
  protected readonly backlog = PATTERN_BACKLOG;
}
