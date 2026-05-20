import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { BreadcrumbService } from './breadcrumb.service';
import { provideBreadcrumb } from './provide-breadcrumb';

@Component({ template: '', standalone: true })
class DummyComponent {}

describe('BreadcrumbService', () => {
  let service: BreadcrumbService;
  let router: Router;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideBreadcrumb(),
        provideRouter([
          {
            path: 'modules',
            data: { breadcrumb: 'Modules' },
            component: DummyComponent,
            children: [
              {
                path: 'detail',
                data: { breadcrumb: 'Detail' },
                component: DummyComponent,
              },
            ],
          },
          {
            path: 'no-breadcrumb',
            component: DummyComponent,
            children: [
              {
                path: 'child',
                data: { breadcrumb: 'Child' },
                component: DummyComponent,
              },
            ],
          },
          {
            path: 'simple',
            data: { breadcrumb: 'Simple' },
            component: DummyComponent,
          },
        ]),
      ],
    });
    service = TestBed.inject(BreadcrumbService);
    router = TestBed.inject(Router);
  });

  it('should return empty breadcrumbs on root route', () => {
    expect(service.breadcrumbs()).toEqual([]);
  });

  it('should build breadcrumbs from route data', async () => {
    await router.navigateByUrl('/simple');

    const crumbs = service.breadcrumbs();
    expect(crumbs.length).toBe(1);
    expect(crumbs[0]).toEqual({ label: 'Simple', route: '/simple' });
  });

  it('should build nested breadcrumbs', async () => {
    await router.navigateByUrl('/modules/detail');

    const crumbs = service.breadcrumbs();
    expect(crumbs.length).toBe(2);
    expect(crumbs[0]).toEqual({ label: 'Modules', route: '/modules' });
    expect(crumbs[1]).toEqual({
      label: 'Detail',
      route: '/modules/detail',
    });
  });

  it('should skip routes without breadcrumb data', async () => {
    await router.navigateByUrl('/no-breadcrumb/child');

    const crumbs = service.breadcrumbs();
    expect(crumbs.length).toBe(1);
    expect(crumbs[0]).toEqual({
      label: 'Child',
      route: '/no-breadcrumb/child',
    });
  });

  it('should update breadcrumbs on navigation', async () => {
    await router.navigateByUrl('/simple');
    expect(service.breadcrumbs().length).toBe(1);

    await router.navigateByUrl('/modules/detail');
    expect(service.breadcrumbs().length).toBe(2);
  });
});
