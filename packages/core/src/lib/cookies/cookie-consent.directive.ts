import {
  Directive,
  effect,
  inject,
  input,
  TemplateRef,
  ViewContainerRef,
} from '@angular/core';

import { CookieConsentService } from './cookie-consent.service';
import type { CookieCategory } from './cookie.types';

/**
 * Structural directive that conditionally renders content based on
 * cookie consent for a given category.
 *
 * When the user has consented to the specified category, the template
 * is rendered. When consent is revoked (or not yet given), the template
 * is removed. The directive reacts to consent changes in real time
 * via Angular signals.
 *
 * @example
 * ```html
 * <div *ffCookieConsent="'analytics'">
 *   <!-- Only rendered when analytics cookies are consented -->
 *   <analytics-widget />
 * </div>
 *
 * <ng-template [ffCookieConsent]="'preferences'">
 *   <p>Preference-dependent content</p>
 * </ng-template>
 * ```
 */
@Directive({
  selector: '[ffCookieConsent]',
  standalone: true,
})
export class FfCookieConsentDirective {
  private readonly consent = inject(CookieConsentService);
  private readonly templateRef = inject(TemplateRef<unknown>);
  private readonly viewContainer = inject(ViewContainerRef);

  /** The cookie category to check consent for. */
  readonly ffCookieConsent = input.required<CookieCategory>();

  private hasView = false;

  constructor() {
    effect(() => {
      const category = this.ffCookieConsent();
      const allowed = this.consent.isCategoryAllowed(category)();

      if (allowed && !this.hasView) {
        this.viewContainer.createEmbeddedView(this.templateRef);
        this.hasView = true;
      } else if (!allowed && this.hasView) {
        this.viewContainer.clear();
        this.hasView = false;
      }
    });
  }
}
