import { computed, inject, Injectable, Signal, signal } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map } from 'rxjs';
import { PermissionService } from '../permissions/permission.service';
import { NavItem, NavigationConfig } from './navigation.types';

/**
 * Manages the navigation state of the application.
 *
 * Responsibilities:
 * - Store a tree of navigation items
 * - Filter items recursively based on current permissions
 * - Track the active route
 *
 * The product defines WHAT items exist and HOW to render them.
 * The framework handles permission filtering and active route
 * tracking automatically.
 *
 * Does NOT wrap `Router.navigate()` — use Angular Router directly.
 */
@Injectable()
export class NavigationService {
  private readonly permissions = inject(PermissionService);
  private readonly router = inject(Router);

  private readonly _items = signal<NavItem[]>([]);

  /** Active route URL, updated on every NavigationEnd event. */
  readonly activeRoute: Signal<string> = toSignal(
    this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd),
      map((e) => e.urlAfterRedirects),
    ),
    { initialValue: this.router.url },
  );

  /**
   * Navigation items filtered recursively by current permissions.
   * Items with `requiredPermission` are hidden when the permission is absent.
   * Container items (no route) are removed when all children are filtered out.
   */
  readonly navItems: Signal<NavItem[]> = computed(() =>
    this.filterByPermissions(this._items()),
  );

  /**
   * Set the initial navigation configuration (replaces all items).
   *
   * @param config - Navigation tree definition
   */
  configure(config: NavigationConfig): void {
    this._items.set(config.items);
  }

  /**
   * Register a top-level navigation item dynamically.
   * If an item with the same `id` already exists, it is replaced.
   * Useful for lazy-loaded features that add their own nav items.
   *
   * @param item - Navigation item to add or replace
   */
  registerItem(item: NavItem): void {
    this._items.update((items) => {
      const filtered = items.filter((i) => i.id !== item.id);
      return [...filtered, item];
    });
  }

  /**
   * Remove a top-level navigation item by id.
   *
   * @param id - Identifier of the item to remove
   */
  unregisterItem(id: string): void {
    this._items.update((items) => items.filter((i) => i.id !== id));
  }

  /**
   * Recursively filter navigation items by current permissions.
   * Removes items whose `requiredPermission` is not granted, and
   * removes containers when all their children are filtered out.
   *
   * @param items - Navigation items to filter
   * @returns Filtered array of permitted items
   */
  private filterByPermissions(items: NavItem[]): NavItem[] {
    const currentPerms = this.permissions.permissions();
    return items
      .filter(
        (item) =>
          !item.requiredPermission ||
          currentPerms.includes(item.requiredPermission),
      )
      .map((item) =>
        item.children
          ? { ...item, children: this.filterByPermissions(item.children) }
          : item,
      )
      .filter((item) => item.route || !item.children || item.children.length > 0);
  }
}
