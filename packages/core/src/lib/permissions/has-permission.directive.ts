import {
  Directive,
  Input,
  TemplateRef,
  ViewContainerRef,
  effect,
  inject,
  signal,
} from '@angular/core';
import { PermissionService } from './permission.service';

/**
 * Structural directive that conditionally renders its host element
 * based on whether the current user has a specific permission.
 *
 * Reactive: if permissions change, the element is shown/hidden automatically.
 *
 * Usage:
 * ```html
 * <button *ffHasPermission="'resource.write'">Edit</button>
 * ```
 */
@Directive({ selector: '[ffHasPermission]', standalone: true })
export class HasPermissionDirective {
  private readonly permissions = inject(PermissionService);
  private readonly templateRef = inject(TemplateRef<unknown>);
  private readonly viewContainer = inject(ViewContainerRef);
  private readonly key = signal('');
  private isRendered = false;

  constructor() {
    effect(() => {
      const hasIt =
        this.key() !== '' &&
        this.permissions.permissions().includes(this.key());

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
  set ffHasPermission(value: string) {
    this.key.set(value);
  }
}
