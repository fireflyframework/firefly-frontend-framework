import { inject, Injectable, Signal } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map } from 'rxjs';
import { BreadcrumbItem } from './navigation.types';

/**
 * Computes breadcrumbs from the current route tree.
 *
 * Products define breadcrumb labels via route data:
 * ```typescript
 * { path: 'contracts', data: { breadcrumb: 'Contracts' }, children: [
 *   { path: ':id', data: { breadcrumb: 'Detail' } }
 * ]}
 * ```
 *
 * Routes without `data.breadcrumb` are skipped in the trail.
 */
@Injectable({ providedIn: 'root' })
export class BreadcrumbService {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  /** Breadcrumb trail computed from the active route tree. */
  readonly breadcrumbs: Signal<BreadcrumbItem[]> = toSignal(
    this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd),
      map(() => this.buildBreadcrumbs(this.route.root)),
    ),
    { initialValue: this.buildBreadcrumbs(this.route.root) },
  );

  private buildBreadcrumbs(
    route: ActivatedRoute,
    url = '',
    breadcrumbs: BreadcrumbItem[] = [],
  ): BreadcrumbItem[] {
    const children = route.children;
    if (children.length === 0) {
      return breadcrumbs;
    }

    for (const child of children) {
      const segments = child.snapshot.url.map((s) => s.path);
      if (segments.length === 0) {
        return this.buildBreadcrumbs(child, url, breadcrumbs);
      }

      const childUrl = `${url}/${segments.join('/')}`;
      const label = child.snapshot.data['breadcrumb'] as string | undefined;

      if (label) {
        breadcrumbs.push({ label, route: childUrl });
      }

      return this.buildBreadcrumbs(child, childUrl, breadcrumbs);
    }

    return breadcrumbs;
  }
}
