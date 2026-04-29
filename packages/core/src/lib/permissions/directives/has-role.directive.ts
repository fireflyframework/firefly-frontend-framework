import {
  Directive,
  Input,
  TemplateRef,
  ViewContainerRef,
  effect,
  inject,
  signal,
} from '@angular/core';
import { PermissionService } from '../permission.service';

/**
 * Structural directive that conditionally renders its host element
 * based on whether the current user has a specific role.
 *
 * Reactive: if roles change, the element is shown/hidden automatically.
 *
 * Usage:
 * ```html
 * <div *ffHasRole="'admin'">Admin-only content</div>
 * ```
 */
@Directive({ selector: '[ffHasRole]', standalone: true })
export class HasRoleDirective {
  private readonly permissions = inject(PermissionService);
  private readonly templateRef = inject(TemplateRef<unknown>);
  private readonly viewContainer = inject(ViewContainerRef);
  private readonly role = signal('');
  private isRendered = false;

  constructor() {
    effect(() => {
      const hasIt =
        this.role() !== '' &&
        this.permissions.roles().includes(this.role());

      if (hasIt && !this.isRendered) {
        this.viewContainer.createEmbeddedView(this.templateRef);
        this.isRendered = true;
      } else if (!hasIt && this.isRendered) {
        this.viewContainer.clear();
        this.isRendered = false;
      }
    });
  }

  @Input()
  set ffHasRole(value: string) {
    this.role.set(value);
  }
}
