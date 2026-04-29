import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { Component } from '@angular/core';
import { permissionGuard, roleGuard } from './permission.guard';
import { PermissionService } from '../permission.service';

@Component({ template: '', standalone: true })
class DummyComponent {}

describe('permissionGuard', () => {
  let service: PermissionService;
  let router: Router;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([
          {
            path: 'protected',
            component: DummyComponent,
            canActivate: [permissionGuard('resource.write')],
          },
          {
            path: 'multi',
            component: DummyComponent,
            canActivate: [permissionGuard('read', 'write')],
          },
          { path: '', component: DummyComponent },
        ]),
      ],
    });

    service = TestBed.inject(PermissionService);
    router = TestBed.inject(Router);
  });

  it('should allow navigation when permission exists', async () => {
    service.setPermissions(['resource.write'], []);

    const result = await router.navigateByUrl('/protected');

    expect(result).toBe(true);
    expect(router.url).toBe('/protected');
  });

  it('should redirect to / when permission is missing', async () => {
    service.setPermissions(['resource.read'], []);

    await router.navigateByUrl('/protected');

    expect(router.url).toBe('/');
  });

  it('should require ALL listed permissions', async () => {
    service.setPermissions(['read'], []);

    await router.navigateByUrl('/multi');

    expect(router.url).toBe('/');
  });

  it('should allow when all listed permissions present', async () => {
    service.setPermissions(['read', 'write', 'delete'], []);

    const result = await router.navigateByUrl('/multi');

    expect(result).toBe(true);
    expect(router.url).toBe('/multi');
  });
});

describe('roleGuard', () => {
  let service: PermissionService;
  let router: Router;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([
          {
            path: 'admin',
            component: DummyComponent,
            canActivate: [roleGuard('admin')],
          },
          {
            path: 'staff',
            component: DummyComponent,
            canActivate: [roleGuard('admin', 'editor')],
          },
          { path: '', component: DummyComponent },
        ]),
      ],
    });

    service = TestBed.inject(PermissionService);
    router = TestBed.inject(Router);
  });

  it('should allow navigation when role exists', async () => {
    service.setPermissions([], ['admin']);

    const result = await router.navigateByUrl('/admin');

    expect(result).toBe(true);
    expect(router.url).toBe('/admin');
  });

  it('should redirect to / when role is missing', async () => {
    service.setPermissions([], ['viewer']);

    await router.navigateByUrl('/admin');

    expect(router.url).toBe('/');
  });

  it('should allow when ANY of the listed roles matches', async () => {
    service.setPermissions([], ['editor']);

    const result = await router.navigateByUrl('/staff');

    expect(result).toBe(true);
    expect(router.url).toBe('/staff');
  });

  it('should redirect when none of the listed roles match', async () => {
    service.setPermissions([], ['viewer']);

    await router.navigateByUrl('/staff');

    expect(router.url).toBe('/');
  });
});
