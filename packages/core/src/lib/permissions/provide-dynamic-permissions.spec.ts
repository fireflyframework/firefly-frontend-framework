import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import {
  DYNAMIC_PERMISSION_CONFIG,
  provideDynamicPermissions,
} from './provide-dynamic-permissions';
import { DynamicPermissionConfig, RoutePermissionMap } from './dynamic-permission.types';
import { dynamicPermissionGuard } from './guards/dynamic-permission.guard';
import { PermissionService } from './permission.service';

@Component({ template: '', standalone: true })
class DummyComponent {}

describe('provideDynamicPermissions', () => {
  it('should return valid EnvironmentProviders', () => {
    const config: DynamicPermissionConfig = {
      permissionMap: { '/admin': 'admin.access' },
    };
    const providers = provideDynamicPermissions(config);
    expect(providers).toBeDefined();
  });

  it('should register DYNAMIC_PERMISSION_CONFIG token', () => {
    const config: DynamicPermissionConfig = {
      permissionMap: { '/admin': 'admin.access' },
      fallbackBehavior: 'deny',
      redirectTo: '/forbidden',
    };

    TestBed.configureTestingModule({
      providers: [provideRouter([]), provideDynamicPermissions(config)],
    });

    const injected = TestBed.inject(DYNAMIC_PERMISSION_CONFIG);
    expect(injected).toBe(config);
    expect(injected.permissionMap).toEqual({ '/admin': 'admin.access' });
    expect(injected.fallbackBehavior).toBe('deny');
    expect(injected.redirectTo).toBe('/forbidden');
  });

  it('should allow dynamicPermissionGuard() without args to use provided config', async () => {
    const map: RoutePermissionMap = { '/secured': 'secure.read' };

    TestBed.configureTestingModule({
      providers: [
        provideRouter([
          {
            path: 'secured',
            component: DummyComponent,
            canActivate: [dynamicPermissionGuard()],
          },
          { path: '', component: DummyComponent },
        ]),
        provideDynamicPermissions({ permissionMap: map }),
      ],
    });

    const service = TestBed.inject(PermissionService);
    const router = TestBed.inject(Router);

    service.setPermissions(['secure.read'], []);
    const result = await router.navigateByUrl('/secured');

    expect(result).toBe(true);
    expect(router.url).toBe('/secured');
  });

  it('should respect fallbackBehavior from provided config', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([
          {
            path: 'unmapped',
            component: DummyComponent,
            canActivate: [dynamicPermissionGuard()],
          },
          { path: '', component: DummyComponent },
        ]),
        provideDynamicPermissions({
          permissionMap: {},
          fallbackBehavior: 'allow',
        }),
      ],
    });

    const router = TestBed.inject(Router);
    const result = await router.navigateByUrl('/unmapped');

    expect(result).toBe(true);
    expect(router.url).toBe('/unmapped');
  });

  it('should respect redirectTo from provided config', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([
          {
            path: 'locked',
            component: DummyComponent,
            canActivate: [dynamicPermissionGuard()],
          },
          { path: 'no-access', component: DummyComponent },
          { path: '', component: DummyComponent },
        ]),
        provideDynamicPermissions({
          permissionMap: { '/locked': 'lock.open' },
          redirectTo: '/no-access',
        }),
      ],
    });

    const service = TestBed.inject(PermissionService);
    const router = TestBed.inject(Router);

    service.setPermissions([], []);
    await router.navigateByUrl('/locked');

    expect(router.url).toBe('/no-access');
  });

  it('should be overridden by inline config when guard receives arguments', async () => {
    const tokenMap: RoutePermissionMap = { '/page': 'token.perm' };
    const inlineMap: RoutePermissionMap = { '/page': 'inline.perm' };

    TestBed.configureTestingModule({
      providers: [
        provideRouter([
          {
            path: 'page',
            component: DummyComponent,
            canActivate: [
              dynamicPermissionGuard({ permissionMap: inlineMap }),
            ],
          },
          { path: '', component: DummyComponent },
        ]),
        provideDynamicPermissions({ permissionMap: tokenMap }),
      ],
    });

    const service = TestBed.inject(PermissionService);
    const router = TestBed.inject(Router);

    // Has token.perm but NOT inline.perm — inline config requires inline.perm
    service.setPermissions(['token.perm'], []);
    await router.navigateByUrl('/page');

    // Denied because inline config takes precedence and requires 'inline.perm'
    expect(router.url).toBe('/');
  });
});
