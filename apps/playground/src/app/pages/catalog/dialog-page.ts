import { ChangeDetectionStrategy, Component, inject, input, signal } from '@angular/core';
import { AlertService, ConfirmDirective } from '@fireflyframework/core';
import {
  FfButtonComponent,
  FfDialogComponent,
  FfDialogContainerComponent,
  FfDialogResolution,
  FfDialogVariant,
  FfToastContainerComponent,
} from '@fireflyframework/design-system';

import { DemoSection } from '../../shared/demo-section';

/** Custom content hosted inside ff-dialog-container via NgComponentOutlet. */
@Component({
  selector: 'app-dialog-hosted-demo',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <h2 style="margin: 0 0 8px">Custom content</h2>
    <p style="margin: 0">
      Rendered for <strong>{{ name() }}</strong> through
      <code>options.component</code> + <code>componentData</code>. Close me
      with Escape or the backdrop.
    </p>
  `,
})
export class DialogHostedDemo {
  readonly name = input('nobody');
}

/**
 * Catalog page for the `ff-dialog` primitive and the `ff-dialog-container`
 * pattern, wired to core's headless `AlertService`: the service owns the
 * dialog queue and the Promise plumbing, the container renders
 * `activeDialogs()` and reports each resolution back via `resolveDialog`.
 */
@Component({
  selector: 'app-dialog-page',
  imports: [
    DemoSection,
    ConfirmDirective,
    FfDialogComponent,
    FfButtonComponent,
    FfDialogContainerComponent,
    FfToastContainerComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="page">
      <h2 class="page__title">Dialog</h2>
      <p class="page__lead">
        <code>&lt;ff-dialog&gt;</code> — modal overlay with backdrop, Escape-to-close and a
        projected actions zone. For service-driven dialogs, place the
        <code>&lt;ff-dialog-container&gt;</code> pattern once in your shell and let the headless
        <code>AlertService</code> from <code>&#64;fireflyframework/core</code> queue them.
      </p>

      <app-demo-section
        heading="Open a dialog"
        description="Visibility is controlled by the open input; (closed) fires on Escape, backdrop click or the X button."
        [code]="snippets.basic"
      >
        <ff-button (clicked)="open.set(true)">Open dialog</ff-button>
        <ff-dialog title="Confirm deletion" [open]="open()" (closed)="open.set(false)">
          <p>Are you sure you want to delete this item?</p>
          <div ff-dialog-actions>
            <ff-button variant="secondary" (clicked)="open.set(false)">Cancel</ff-button>
            <ff-button (clicked)="open.set(false)">Delete</ff-button>
          </div>
        </ff-dialog>
      </app-demo-section>

      <app-demo-section
        heading="Semantic variants"
        description="All values of FfDialogVariant applied via the type input."
        [code]="snippets.variants"
      >
        @for (v of variants; track v) {
          <ff-button variant="outline" (clicked)="variantOpen.set(v)">{{ v }}</ff-button>
        }
        @if (variantOpen(); as v) {
          <ff-dialog [title]="'Dialog · ' + v" [type]="v" [open]="true" (closed)="variantOpen.set(null)">
            <p>This dialog uses type="{{ v }}".</p>
            <div ff-dialog-actions>
              <ff-button (clicked)="variantOpen.set(null)">Close</ff-button>
            </div>
          </ff-dialog>
        }
      </app-demo-section>

      <app-demo-section
        heading="Non-dismissible"
        description="dismissible=false disables backdrop/Escape/X — only the actions can close it."
        [code]="snippets.locked"
      >
        <ff-button variant="outline" (clicked)="lockedOpen.set(true)">Open locked dialog</ff-button>
        <ff-dialog
          title="Processing"
          [open]="lockedOpen()"
          [dismissible]="false"
          (closed)="lockedOpen.set(false)"
        >
          <p>You must use the button below to close this dialog.</p>
          <div ff-dialog-actions>
            <ff-button (clicked)="lockedOpen.set(false)">Understood</ff-button>
          </div>
        </ff-dialog>
      </app-demo-section>

      <app-demo-section
        heading="Service-driven dialog (ff-dialog-container)"
        description="AlertService.dialog() returns a Promise; ff-dialog-container renders activeDialogs() with a CDK focus trap and resolves it back. The outcome is toasted."
        [code]="snippets.service"
      >
        <ff-button (clicked)="openServiceDialog()">Open via AlertService</ff-button>
      </app-demo-section>

      <app-demo-section
        heading="Destructive with typed confirmation"
        description="destructiveConfirmText renders an ff-input gate; confirm stays disabled until the text matches exactly."
        [code]="snippets.destructive"
      >
        <ff-button variant="outline" (clicked)="openDestructiveDialog()">Delete project…</ff-button>
      </app-demo-section>

      <app-demo-section
        heading="Custom component"
        description="options.component is hosted inside the panel via NgComponentOutlet with componentData as inputs; resolve via Escape or backdrop."
        [code]="snippets.custom"
      >
        <ff-button variant="outline" (clicked)="openCustomDialog()">Open custom dialog</ff-button>
      </app-demo-section>

      <app-demo-section
        heading="Confirm guard (ffConfirm + AlertConfirmService)"
        description="provideAlertConfirm() backs the confirm guard with AlertService dialogs: the guarded action runs only after the user confirms."
        [code]="snippets.guard"
      >
        <ff-button
          variant="outline"
          [ffConfirm]="{
            title: 'Archive report?',
            message: 'You can restore it later from the archive.',
            confirm: { label: 'Archive' },
          }"
          (ffConfirmed)="onGuardedAction()"
        >
          Archive report
        </ff-button>
      </app-demo-section>
    </div>

    <ff-dialog-container
      [dialogs]="alerts.activeDialogs()"
      (resolved)="onResolved($event)"
    />
    <ff-toast-container
      [toasts]="alerts.activeToasts()"
      (dismissed)="alerts.dismiss($event)"
      (hoverStarted)="alerts.pauseToast($event)"
      (hoverEnded)="alerts.resumeToast($event)"
    />
  `,
})
export class DialogPage {
  protected readonly alerts = inject(AlertService);

  protected readonly variants: readonly FfDialogVariant[] = [
    'success',
    'error',
    'warning',
    'info',
  ];

  protected readonly open = signal(false);
  protected readonly lockedOpen = signal(false);
  protected readonly variantOpen = signal<FfDialogVariant | null>(null);

  protected readonly snippets = {
    basic: `<ff-dialog title="Confirm deletion" [open]="show" (closed)="show = false">
  <p>Are you sure?</p>
  <div ff-dialog-actions>
    <ff-button variant="secondary" (clicked)="show = false">Cancel</ff-button>
  </div>
</ff-dialog>`,
    variants: `<ff-dialog title="Done" type="success" [open]="show" (closed)="show = false" />`,
    locked: `<ff-dialog title="Processing" [open]="show" [dismissible]="false" />`,
    service: `const result = await alerts.dialog({
  type: 'info',
  title: 'Publish changes?',
  message: 'The document becomes visible to every member.',
  confirmLabel: 'Publish',
  cancelLabel: 'Cancel',
});

<ff-dialog-container
  [dialogs]="alerts.activeDialogs()"
  (resolved)="alerts.resolveDialog($event.id, { confirmed: $event.confirmed, input: $event.input })"
/>`,
    destructive: `await alerts.dialog({
  type: 'destructive',
  title: 'Delete project?',
  message: 'Type DELETE to confirm. This cannot be undone.',
  confirmLabel: 'Delete forever',
  cancelLabel: 'Cancel',
  destructiveConfirmText: 'DELETE',
});`,
    custom: `await alerts.dialog({
  type: 'custom',
  component: DialogHostedDemo,
  componentData: { name: 'Firefly' },
});`,
    guard: `// app.config.ts
providers: [provideAlerts(), provideAlertConfirm()]

<button
  [ffConfirm]="{ title: 'Archive report?', message: '…', confirm: { label: 'Archive' } }"
  (ffConfirmed)="archive()"
>`,
  };

  /** Forwards a container resolution to the service (id + DialogResult shape). */
  protected onResolved(event: FfDialogResolution): void {
    this.alerts.resolveDialog(event.id, {
      confirmed: event.confirmed,
      input: event.input,
    });
  }

  protected async openServiceDialog(): Promise<void> {
    const result = await this.alerts.dialog({
      type: 'info',
      title: 'Publish changes?',
      message: 'The document becomes visible to every member.',
      confirmLabel: 'Publish',
      cancelLabel: 'Cancel',
    });
    if (result.confirmed) {
      this.alerts.success('Published');
    } else {
      this.alerts.info('Publication cancelled');
    }
  }

  protected async openDestructiveDialog(): Promise<void> {
    const result = await this.alerts.dialog({
      type: 'destructive',
      title: 'Delete project?',
      message: 'Type DELETE to confirm. This cannot be undone.',
      confirmLabel: 'Delete forever',
      cancelLabel: 'Cancel',
      destructiveConfirmText: 'DELETE',
    });
    if (result.confirmed) {
      this.alerts.toast(`Project deleted (typed "${result.input}")`, 'destructive');
    } else {
      this.alerts.info('Deletion cancelled');
    }
  }

  protected async openCustomDialog(): Promise<void> {
    const result = await this.alerts.dialog({
      type: 'custom',
      component: DialogHostedDemo,
      componentData: { name: 'Firefly' },
    });
    this.alerts.info(result.confirmed ? 'Custom dialog confirmed' : 'Custom dialog dismissed');
  }

  protected onGuardedAction(): void {
    this.alerts.success('Report archived');
  }
}
