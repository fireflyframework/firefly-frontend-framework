import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { NavigationService } from './navigation.service';
import { PermissionService } from '../permissions/permission.service';
import { NavItem } from './navigation.types';

describe('NavigationService', () => {
  let service: NavigationService;
  let permissions: PermissionService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideRouter([])],
    });
    service = TestBed.inject(NavigationService);
    permissions = TestBed.inject(PermissionService);
  });

  // Items with children (container pattern — product decides if these are "groups")
  const catalogSection: NavItem = {
    id: 'catalog',
    label: 'Catalog',
    requiredPermission: 'catalog.read',
    children: [
      { id: 'primitives', label: 'Primitives', route: '/catalog/primitives' },
      { id: 'patterns', label: 'Patterns', route: '/catalog/patterns' },
    ],
  };

  // Items with mixed permissions at different levels
  const toolsSection: NavItem = {
    id: 'tools',
    label: 'Tools',
    children: [
      { id: 'theming', label: 'Theming', route: '/tools/theming' },
      {
        id: 'network',
        label: 'Network',
        route: '/tools/network',
        requiredPermission: 'network.read',
      },
    ],
  };

  // Flat item (no children, just a route)
  const homeItem: NavItem = {
    id: 'home',
    label: 'Home',
    route: '/',
  };

  describe('configure', () => {
    it('should store items from config', () => {
      service.configure({ items: [homeItem, catalogSection] });
      permissions.setPermissions(['catalog.read'], []);

      const items = service.navItems();
      expect(items.length).toBe(2);
      expect(items[0].id).toBe('home');
      expect(items[1].id).toBe('catalog');
    });

    it('should replace existing items on reconfigure', () => {
      service.configure({ items: [homeItem, catalogSection] });
      service.configure({ items: [homeItem] });

      expect(service.navItems().length).toBe(1);
      expect(service.navItems()[0].id).toBe('home');
    });
  });

  describe('registerItem', () => {
    it('should add a new item', () => {
      service.registerItem(homeItem);

      expect(service.navItems().length).toBe(1);
      expect(service.navItems()[0].id).toBe('home');
    });

    it('should replace existing item with same id', () => {
      service.registerItem(homeItem);

      const updated: NavItem = { ...homeItem, label: 'Dashboard' };
      service.registerItem(updated);

      const items = service.navItems();
      expect(items.length).toBe(1);
      expect(items[0].label).toBe('Dashboard');
    });
  });

  describe('unregisterItem', () => {
    it('should remove item by id', () => {
      service.configure({ items: [homeItem, toolsSection] });
      service.unregisterItem('home');

      expect(service.navItems().every((i) => i.id !== 'home')).toBe(true);
    });

    it('should be a no-op for unknown id', () => {
      service.registerItem(homeItem);
      service.unregisterItem('nonexistent');

      expect(service.navItems().length).toBe(1);
    });
  });

  describe('navItems — permission filtering', () => {
    it('should show all items when no permissions are required', () => {
      service.configure({ items: [homeItem] });
      expect(service.navItems().length).toBe(1);
    });

    it('should hide item when required permission is missing', () => {
      permissions.setPermissions([], []);
      service.configure({ items: [catalogSection] });

      expect(service.navItems().length).toBe(0);
    });

    it('should show item when required permission is present', () => {
      permissions.setPermissions(['catalog.read'], []);
      service.configure({ items: [catalogSection] });

      expect(service.navItems().length).toBe(1);
      expect(service.navItems()[0].children!.length).toBe(2);
    });

    it('should filter children by individual permission', () => {
      permissions.setPermissions([], []);
      service.configure({ items: [toolsSection] });

      const items = service.navItems();
      expect(items.length).toBe(1);
      expect(items[0].children!.length).toBe(1);
      expect(items[0].children![0].id).toBe('theming');
    });

    it('should remove containers when all children are filtered out', () => {
      const allProtected: NavItem = {
        id: 'protected',
        label: 'Protected',
        children: [
          {
            id: 'secret',
            label: 'Secret',
            route: '/secret',
            requiredPermission: 'secret.read',
          },
        ],
      };

      permissions.setPermissions([], []);
      service.configure({ items: [allProtected] });

      expect(service.navItems().length).toBe(0);
    });

    it('should keep containers with route even when children are filtered out', () => {
      const withRoute: NavItem = {
        id: 'section',
        label: 'Section',
        route: '/section',
        children: [
          {
            id: 'child',
            label: 'Child',
            route: '/section/child',
            requiredPermission: 'child.read',
          },
        ],
      };

      permissions.setPermissions([], []);
      service.configure({ items: [withRoute] });

      const items = service.navItems();
      expect(items.length).toBe(1);
      expect(items[0].children!.length).toBe(0);
    });

    it('should filter recursively through nested levels', () => {
      const nested: NavItem = {
        id: 'level1',
        label: 'Level 1',
        children: [
          {
            id: 'level2',
            label: 'Level 2',
            children: [
              {
                id: 'level3-visible',
                label: 'Visible',
                route: '/deep/visible',
              },
              {
                id: 'level3-hidden',
                label: 'Hidden',
                route: '/deep/hidden',
                requiredPermission: 'deep.read',
              },
            ],
          },
        ],
      };

      permissions.setPermissions([], []);
      service.configure({ items: [nested] });

      const items = service.navItems();
      expect(items.length).toBe(1);
      expect(items[0].children![0].children!.length).toBe(1);
      expect(items[0].children![0].children![0].id).toBe('level3-visible');
    });

    it('should update reactively when permissions change', () => {
      permissions.setPermissions([], []);
      service.configure({ items: [catalogSection] });

      expect(service.navItems().length).toBe(0);

      permissions.setPermissions(['catalog.read'], []);
      expect(service.navItems().length).toBe(1);
    });
  });

  describe('activeRoute', () => {
    it('should have initial value from current router url', () => {
      expect(service.activeRoute()).toBe('/');
    });
  });
});
