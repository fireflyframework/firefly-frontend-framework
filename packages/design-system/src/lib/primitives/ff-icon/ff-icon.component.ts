import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  computed,
  inject,
  input,
  isDevMode,
} from '@angular/core';

import { FF_ICONS } from './icon-registry';

/** Predefined size of the icon: 16px (`sm`), 20px (`md`) or 24px (`lg`). */
export type FfIconSize = 'sm' | 'md' | 'lg';

/**
 * Firefly icon atom.
 *
 * Renders an SVG icon resolved by name from the registry provided via
 * `provideFfIcons` (token `FF_ICONS`). Icons are single-path SVGs drawn on a
 * `0 0 24 24` viewBox and filled with `currentColor`, so they inherit the
 * surrounding text color unless overridden via `--ff-icon-color`.
 *
 * Accessibility: with a `label` the SVG is exposed as `role="img"` with an
 * `aria-label`; without one it is decorative (`aria-hidden="true"`).
 *
 * Unknown names (or a missing registry) render an empty SVG and, in dev mode,
 * log a single `console.warn` per unknown name.
 *
 * @example
 * ```html
 * <ff-icon name="check" />
 * <ff-icon name="close" size="sm" label="Close dialog" />
 * ```
 */
@Component({
  selector: 'ff-icon',
  standalone: true,
  templateUrl: './ff-icon.component.html',
  styleUrl: './ff-icon.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    '[class]': '"ff-icon ff-icon--" + size()',
  },
})
export class FfIconComponent {
  /** Names already warned about, to log only once per unknown name. */
  private static readonly warnedNames = new Set<string>();

  /** Merged icon registry, if any `provideFfIcons` call registered one. */
  private readonly icons = inject(FF_ICONS, { optional: true });

  /**
   * Name of the icon to render, resolved against the registry provided via
   * `provideFfIcons`.
   *
   * @example
   * ```html
   * <ff-icon name="check" />
   * ```
   */
  readonly name = input.required<string>();

  /**
   * Icon size: `'sm'` (16px) | `'md'` (20px) | `'lg'` (24px). Defaults to `'md'`.
   *
   * @example
   * ```html
   * <ff-icon name="check" size="lg" />
   * ```
   */
  readonly size = input<FfIconSize>('md');

  /**
   * Accessible label. When set, the SVG is exposed as `role="img"` with this
   * `aria-label`; when omitted, the icon is decorative (`aria-hidden="true"`).
   *
   * @example
   * ```html
   * <ff-icon name="trash" label="Delete item" />
   * ```
   */
  readonly label = input<string>();

  /**
   * SVG path data (`d` attribute) resolved from the registry for the current
   * `name`, or `null` when the name is unknown or no registry is provided.
   *
   * @example
   * ```html
   * <path [attr.d]="path()" />
   * ```
   */
  readonly path = computed<string | null>(() => {
    const name = this.name();
    const path = this.icons?.get(name) ?? null;

    if (path === null && isDevMode() && !FfIconComponent.warnedNames.has(name)) {
      FfIconComponent.warnedNames.add(name);
      console.warn(
        `[ff-icon] Unknown icon name "${name}". Register it via provideFfIcons({ ${name}: '<svg path data>' }).`
      );
    }

    return path;
  });
}
