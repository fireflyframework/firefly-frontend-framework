/**
 * Specification of a framework service module.
 *
 * Describes a reusable service module that a product can enable
 * via the `modules` array in its product YAML. Each module maps
 * to an Angular provider function (e.g. `provideAuth()`).
 *
 * @example
 * ```yaml
 * # modules/auth.module.yaml
 * name: auth
 * path: '@nicdo/framework-core/auth'
 * services: [AuthService, TokenInterceptor]
 * providers: [provideAuth]
 * dependsOn: [session]
 * exports: [AuthGuard]
 * ```
 */
export interface ModuleSpec {
  /** Module identifier (kebab-case, e.g. `'auth'`). */
  name: string;

  /** Import path of the module package. */
  path: string;

  /** Services provided by this module. */
  services: string[];

  /** Angular provider functions exposed by this module. */
  providers?: string[];

  /** Other modules this one depends on. */
  dependsOn?: string[];

  /** Public symbols re-exported for consumer use. */
  exports?: string[];
}
