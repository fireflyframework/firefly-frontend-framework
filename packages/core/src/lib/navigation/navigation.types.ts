/**
 * A navigation item in the application's navigation tree.
 *
 * Items form a recursive tree structure — the product decides
 * how to interpret and render it (flat list, grouped sidebar,
 * nested menu, top bar, etc.).
 *
 * Items without `route` act as section headers or containers.
 * Items with `children` can represent groups, submenus, or any
 * hierarchical structure the product needs.
 */
export interface NavItem {
  id: string;
  label: string;
  icon?: string;
  /** Navigation target. Items without route act as containers/headers. */
  route?: string;
  /** If set, the item (and its children) is only visible when this permission is granted. */
  requiredPermission?: string;
  /** Child items — enables arbitrary nesting depth. */
  children?: NavItem[];
}

/**
 * A single breadcrumb entry computed from the active route tree.
 */
export interface BreadcrumbItem {
  label: string;
  /** If set, the breadcrumb is clickable and navigates to this route. */
  route?: string;
}

/**
 * Configuration for the navigation module.
 * Passed to `provideNavigation()` at application startup.
 */
export interface NavigationConfig {
  items: NavItem[];
}
