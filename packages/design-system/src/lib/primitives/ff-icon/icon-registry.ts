import {
  EnvironmentProviders,
  InjectionToken,
  inject,
  makeEnvironmentProviders,
} from '@angular/core';

/**
 * Internal multi-provider token accumulating every icon set registered via
 * {@link provideFfIcons}. Each call contributes one `Record<string, string>`
 * entry; the {@link FF_ICONS} factory merges them all into a single map.
 *
 * Not part of the public API — consumers interact only with
 * {@link provideFfIcons} and {@link FF_ICONS}.
 */
const FF_ICON_SETS = new InjectionToken<readonly Record<string, string>[]>(
  'FF_ICON_SETS'
);

/**
 * Injection token exposing the merged icon registry as a readonly map of
 * icon name → SVG path data (the `d` attribute, drawn on a `0 0 24 24` viewBox).
 *
 * Populated by one or more {@link provideFfIcons} calls. `FfIconComponent`
 * injects it optionally, so an application without any registered icons
 * still renders (empty) icons without errors.
 *
 * @example
 * ```ts
 * const icons = inject(FF_ICONS, { optional: true });
 * const checkPath = icons?.get('check');
 * ```
 */
export const FF_ICONS = new InjectionToken<ReadonlyMap<string, string>>(
  'FF_ICONS'
);

/**
 * Registers an icon set for `ff-icon`, mapping icon names to SVG path data
 * (`d` attribute, viewBox `0 0 24 24`).
 *
 * Multi-registration pattern: each call adds its icons to an internal
 * multi-provider (`FF_ICON_SETS`) and (re)provides {@link FF_ICONS} with a
 * factory that merges every registered set into a single `Map`. Because the
 * factory always reads *all* accumulated sets, calling `provideFfIcons`
 * multiple times (e.g. a base set in `app.config.ts` plus feature-specific
 * sets in lazy routes) is safe and additive — later registrations win on
 * name collisions.
 *
 * @param icons Map of icon name → SVG path data to register.
 * @returns Environment providers to add to `bootstrapApplication` or a route.
 *
 * @example
 * ```ts
 * // app.config.ts — base set
 * providers: [
 *   provideFfIcons({ check: 'M9 16.2 4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4z' }),
 * ]
 *
 * // feature route — additive set (merged with the base set)
 * providers: [
 *   provideFfIcons({ close: 'M19 6.4 17.6 5 12 10.6 6.4 5 5 6.4 10.6 12 5 17.6 6.4 19 12 13.4 17.6 19 19 17.6 13.4 12z' }),
 * ]
 * ```
 */
export function provideFfIcons(
  icons: Record<string, string>
): EnvironmentProviders {
  return makeEnvironmentProviders([
    { provide: FF_ICON_SETS, useValue: icons, multi: true },
    {
      provide: FF_ICONS,
      useFactory: (): ReadonlyMap<string, string> => {
        const sets = inject(FF_ICON_SETS);
        const merged = new Map<string, string>();
        for (const set of sets) {
          for (const [name, path] of Object.entries(set)) {
            merged.set(name, path);
          }
        }
        return merged;
      },
    },
  ]);
}
