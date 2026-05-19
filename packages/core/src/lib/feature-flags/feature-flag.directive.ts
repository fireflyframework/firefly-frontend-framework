import {
  Directive,
  Input,
  TemplateRef,
  ViewContainerRef,
  effect,
  inject,
  signal,
} from '@angular/core';
import { FeatureFlagService } from './feature-flag.service';

/**
 * Structural directive that conditionally renders its host element
 * based on whether a feature flag is enabled.
 *
 * Reactive: if the flag state changes, the element is shown/hidden
 * automatically without a page refresh.
 *
 * Usage:
 * ```html
 * <section *ffFeatureFlag="'new-dashboard'">
 *   New dashboard content here
 * </section>
 * ```
 */
@Directive({ selector: '[ffFeatureFlag]', standalone: true })
export class FfFeatureFlagDirective {
  private readonly flagService = inject(FeatureFlagService);
  private readonly templateRef = inject(TemplateRef<unknown>);
  private readonly viewContainer = inject(ViewContainerRef);
  private readonly flagName = signal('');
  private isRendered = false;

  constructor() {
    effect(() => {
      const name = this.flagName();
      const enabled = name !== '' && this.flagService.isEnabled(name)();

      if (enabled && !this.isRendered) {
        this.viewContainer.createEmbeddedView(this.templateRef);
        this.isRendered = true;
      } else if (!enabled && this.isRendered) {
        this.viewContainer.clear();
        this.isRendered = false;
      }
    });
  }

  @Input()
  set ffFeatureFlag(value: string) {
    this.flagName.set(value);
  }
}
