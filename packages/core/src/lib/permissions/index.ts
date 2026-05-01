export { PermissionService } from './permission.service';
export { permissionGuard, roleGuard } from './guards/permission.guard';
export { dynamicPermissionGuard } from './guards/dynamic-permission.guard';
export { HasPermissionDirective } from './directives/has-permission.directive';
export { HasRoleDirective } from './directives/has-role.directive';
export { providePermissions } from './provide-permissions';
export {
  DYNAMIC_PERMISSION_CONFIG,
  provideDynamicPermissions,
} from './provide-dynamic-permissions';
export type { PermissionSnapshot } from './permission.types';
export type {
  RoutePermissionMap,
  DynamicPermissionConfig,
} from './dynamic-permission.types';
