import { TestBed } from '@angular/core/testing';
import { PermissionService } from './permission.service';

describe('PermissionService', () => {
  let service: PermissionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PermissionService);
  });

  it('should start with empty permissions and roles', () => {
    expect(service.permissions()).toEqual([]);
    expect(service.roles()).toEqual([]);
  });

  describe('setPermissions', () => {
    it('should store permissions and roles', () => {
      service.setPermissions(['read', 'write'], ['admin']);

      expect(service.permissions()).toEqual(['read', 'write']);
      expect(service.roles()).toEqual(['admin']);
    });

    it('should replace existing permissions and roles', () => {
      service.setPermissions(['read'], ['admin']);
      service.setPermissions(['write'], ['viewer']);

      expect(service.permissions()).toEqual(['write']);
      expect(service.roles()).toEqual(['viewer']);
    });
  });

  describe('hasPermission', () => {
    it('should return true when permission exists', () => {
      service.setPermissions(['resource.read', 'resource.write'], []);

      expect(service.hasPermission('resource.read')()).toBe(true);
    });

    it('should return false when permission does not exist', () => {
      service.setPermissions(['resource.read'], []);

      expect(service.hasPermission('resource.write')()).toBe(false);
    });

    it('should react to permission changes', () => {
      const canWrite = service.hasPermission('resource.write');
      expect(canWrite()).toBe(false);

      service.setPermissions(['resource.write'], []);
      expect(canWrite()).toBe(true);
    });
  });

  describe('hasRole', () => {
    it('should return true when role exists', () => {
      service.setPermissions([], ['admin']);

      expect(service.hasRole('admin')()).toBe(true);
    });

    it('should return false when role does not exist', () => {
      service.setPermissions([], ['viewer']);

      expect(service.hasRole('admin')()).toBe(false);
    });

    it('should react to role changes', () => {
      const isAdmin = service.hasRole('admin');
      expect(isAdmin()).toBe(false);

      service.setPermissions([], ['admin']);
      expect(isAdmin()).toBe(true);
    });
  });

  describe('hasAnyRole', () => {
    it('should return true when at least one role matches', () => {
      service.setPermissions([], ['editor']);

      expect(service.hasAnyRole('admin', 'editor')()).toBe(true);
    });

    it('should return false when no roles match', () => {
      service.setPermissions([], ['viewer']);

      expect(service.hasAnyRole('admin', 'editor')()).toBe(false);
    });

    it('should return false with empty roles', () => {
      expect(service.hasAnyRole('admin')()).toBe(false);
    });
  });

  describe('hasAllPermissions', () => {
    it('should return true when all permissions present', () => {
      service.setPermissions(['read', 'write', 'delete'], []);

      expect(service.hasAllPermissions('read', 'write')()).toBe(true);
    });

    it('should return false when some permissions missing', () => {
      service.setPermissions(['read'], []);

      expect(service.hasAllPermissions('read', 'write')()).toBe(false);
    });

    it('should return true with no requirements', () => {
      expect(service.hasAllPermissions()()).toBe(true);
    });
  });

  describe('snapshot', () => {
    it('should return current state', () => {
      service.setPermissions(['read'], ['admin']);

      expect(service.snapshot()).toEqual({
        permissions: ['read'],
        roles: ['admin'],
      });
    });

    it('should return empty state when cleared', () => {
      service.setPermissions(['read'], ['admin']);
      service.clear();

      expect(service.snapshot()).toEqual({
        permissions: [],
        roles: [],
      });
    });
  });

  describe('clear', () => {
    it('should remove all permissions and roles', () => {
      service.setPermissions(['read', 'write'], ['admin', 'editor']);
      service.clear();

      expect(service.permissions()).toEqual([]);
      expect(service.roles()).toEqual([]);
    });

    it('should update existing computed signals after clear', () => {
      service.setPermissions(['read'], ['admin']);
      const canRead = service.hasPermission('read');
      const isAdmin = service.hasRole('admin');

      expect(canRead()).toBe(true);
      expect(isAdmin()).toBe(true);

      service.clear();

      expect(canRead()).toBe(false);
      expect(isAdmin()).toBe(false);
    });
  });
});
