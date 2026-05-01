import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { dynamicPermissionGuard } from './dynamic-permission.guard';
import { PermissionService } from '../permission.service';
import { RoutePermissionMap } from '../dynamic-permission.types';
import { DYNAMIC_PERMISSION_CONFIG } from '../provide-dynamic-permissions';

@Component({ template: '', standalone: true })
class DummyComponent {}

describe('dynamicPermissionGuard', () => {
  let service: PermissionService;
  let router: Router;

  function setup(
    routes: Parameters<typeof provideRouter>[0],
    tokenConfig?: Parameters<typeof DYNAMIC_PERMISSION_CONFIG['__type__'] extends never ? never : never>[0],
    providers: any[] = [],
  ) {
    TestBed.configureTestingModule({
      providers: [provideRouter(routes), ...providers],
    });
    service = TestBed.inject(PermissionService);
    router = TestBed.inject(Router);
  }

  // --- Static map tests ---

  it('should allow access when permission is present (static map)', async () => {
    const map: RoutePermissionMap = { '/protected': 'resource.read' };
    setup([
      {
        path: 'protected',
        component: DummyComponent,
        canActivate: [dynamicPermissionGuard({ permissionMap: map })],
      },
      { path: '', component: DummyComponent },
    ]);

    service.setPermissions(['resource.read'], []);
    const result = await router.navigateByUrl('/protected');

    expect(result).toBe(true);
    expect(router.url).toBe('/protected');
  });

  it('should deny access when permission is missing (static map)', async () => {
    const map: RoutePermissionMap = { '/protected': 'resource.read' };
    setup([
      {
        path: 'protected',
        component: DummyComponent,
        canActivate: [dynamicPermissionGuard({ permissionMap: map })],
      },
      { path: '', component: DummyComponent },
    ]);

    service.setPermissions([], []);
    await router.navigateByUrl('/protected');

    expect(router.url).toBe('/');
  });

  // --- Signal (reactive) map tests ---

  it('should use reactive Signal map correctly', async () => {
    const mapSignal = signal<RoutePermissionMap>({ '/protected': 'resource.read' });
    setup([
      {
        path: 'protected',
        component: DummyComponent,
        canActivate: [dynamicPermissionGuard({ permissionMap: mapSignal })],
      },
      { path: '', component: DummyComponent },
    ]);

    service.setPermissions(['resource.read'], []);
    const result = await router.navigateByUrl('/protected');

    expect(result).toBe(true);
    expect(router.url).toBe('/protected');
  });

  // --- Wildcard matching ---

  it('should match wildcard patterns', async () => {
    const map: RoutePermissionMap = { '/catalog/*': 'catalog.read' };
    setup([
      {
        path: 'catalog',
        children: [
          {
            path: 'products',
            component: DummyComponent,
            canActivate: [dynamicPermissionGuard({ permissionMap: map })],
          },
        ],
      },
      { path: '', component: DummyComponent },
    ]);

    service.setPermissions(['catalog.read'], []);
    const result = await router.navigateByUrl('/catalog/products');

    expect(result).toBe(true);
    expect(router.url).toBe('/catalog/products');
  });

  it('should prefer exact match over wildcard', async () => {
    const map: RoutePermissionMap = {
      '/catalog/*': 'catalog.read',
      '/catalog/admin': 'catalog.admin',
    };
    setup([
      {
        path: 'catalog',
        children: [
          {
            path: 'admin',
            component: DummyComponent,
            canActivate: [dynamicPermissionGuard({ permissionMap: map })],
          },
        ],
      },
      { path: '', component: DummyComponent },
    ]);

    // Has catalog.read but NOT catalog.admin
    service.setPermissions(['catalog.read'], []);
    await router.navigateByUrl('/catalog/admin');

    // Should be denied because exact match requires catalog.admin
    expect(router.url).toBe('/');
  });

  // --- Fallback behavior ---

  it('should deny when route not in map and fallback is deny (default)', async () => {
    const map: RoutePermissionMap = { '/other': 'other.read' };
    setup([
      {
        path: 'unknown',
        component: DummyComponent,
        canActivate: [dynamicPermissionGuard({ permissionMap: map })],
      },
      { path: '', component: DummyComponent },
    ]);

    service.setPermissions(['everything'], []);
    await router.navigateByUrl('/unknown');

    expect(router.url).toBe('/');
  });

  it('should allow when route not in map and fallback is allow', async () => {
    const map: RoutePermissionMap = { '/other': 'other.read' };
    setup([
      {
        path: 'unknown',
        component: DummyComponent,
        canActivate: [
          dynamicPermissionGuard({
            permissionMap: map,
            fallbackBehavior: 'allow',
          }),
        ],
      },
      { path: '', component: DummyComponent },
    ]);

    service.setPermissions([], []);
    const result = await router.navigateByUrl('/unknown');

    expect(result).toBe(true);
    expect(router.url).toBe('/unknown');
  });

  // --- Custom redirect ---

  it('should redirect to custom redirectTo when denied', async () => {
    const map: RoutePermissionMap = { '/protected': 'secret' };
    setup([
      {
        path: 'protected',
        component: DummyComponent,
        canActivate: [
          dynamicPermissionGuard({
            permissionMap: map,
            redirectTo: '/access-denied',
          }),
        ],
      },
      { path: 'access-denied', component: DummyComponent },
      { path: '', component: DummyComponent },
    ]);

    service.setPermissions([], []);
    await router.navigateByUrl('/protected');

    expect(router.url).toBe('/access-denied');
  });

  // --- Empty map ---

  it('should deny all with empty map and fallback deny', async () => {
    setup([
      {
        path: 'anything',
        component: DummyComponent,
        canActivate: [dynamicPermissionGuard({ permissionMap: {} })],
      },
      { path: '', component: DummyComponent },
    ]);

    service.setPermissions(['everything'], []);
    await router.navigateByUrl('/anything');

    expect(router.url).toBe('/');
  });

  it('should allow all with empty map and fallback allow', async () => {
    setup([
      {
        path: 'anything',
        component: DummyComponent,
        canActivate: [
          dynamicPermissionGuard({
            permissionMap: {},
            fallbackBehavior: 'allow',
          }),
        ],
      },
      { path: '', component: DummyComponent },
    ]);

    service.setPermissions([], []);
    const result = await router.navigateByUrl('/anything');

    expect(result).toBe(true);
    expect(router.url).toBe('/anything');
  });

  // --- Token-based config ---

  it('should read config from DYNAMIC_PERMISSION_CONFIG token when no inline config', async () => {
    const map: RoutePermissionMap = { '/guarded': 'token.perm' };
    setup(
      [
        {
          path: 'guarded',
          component: DummyComponent,
          canActivate: [dynamicPermissionGuard()],
        },
        { path: '', component: DummyComponent },
      ],
      undefined,
      [
        {
          provide: DYNAMIC_PERMISSION_CONFIG,
          useValue: { permissionMap: map },
        },
      ],
    );

    service.setPermissions(['token.perm'], []);
    const result = await router.navigateByUrl('/guarded');

    expect(result).toBe(true);
    expect(router.url).toBe('/guarded');
  });

  it('should deny by default when no config and no token', async () => {
    setup([
      {
        path: 'unguarded',
        component: DummyComponent,
        canActivate: [dynamicPermissionGuard()],
      },
      { path: '', component: DummyComponent },
    ]);

    service.setPermissions(['everything'], []);
    await router.navigateByUrl('/unguarded');

    expect(router.url).toBe('/');
  });
});
