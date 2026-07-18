import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { AlertService, AlertType } from '@fireflyframework/core';
import {
  FfButtonComponent,
  FfSelectComponent,
  FfSelectOption,
  FfToastComponent,
  FfToastContainerComponent,
  FfToastVariant,
} from '@fireflyframework/design-system';

import { DemoSection } from '../../shared/demo-section';

/** Toast position values accepted by core's `ToastOptions`. */
type ToastPosition = 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';

/**
 * Catalog page for `ff-toast` and the `ff-toast-container` pattern, wired
 * to core's headless `AlertService`: the service owns the queue and the
 * timers, the container renders `activeToasts()` and reports dismiss/hover
 * back (hover pauses and resumes the auto-dismiss timer).
 */
@Component({
  selector: 'app-toast-page',
  imports: [
    DemoSection,
    FfButtonComponent,
    FfSelectComponent,
    FfToastComponent,
    FfToastContainerComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="page">
      <h2 class="page__title">Toast</h2>
      <p class="page__lead">
        <code>&lt;ff-toast&gt;</code> — compact notification. Place the
        <code>&lt;ff-toast-container&gt;</code> pattern once in your shell and let the
        headless <code>AlertService</code> from <code>&#64;fireflyframework/core</code>
        (registered via <code>provideAlerts()</code>) queue and auto-dismiss toasts.
      </p>

      <app-demo-section
        heading="Imperative API"
        description="AlertService shortcuts render through ff-toast-container: one toast per semantic type; destructive maps to the error variant."
        [code]="snippets.imperative"
      >
        @for (t of types; track t) {
          <ff-button variant="outline" (clicked)="showType(t)">{{ t }}</ff-button>
        }
      </app-demo-section>

      <app-demo-section
        heading="Positions"
        description="Every core ToastOptions position; pick a region and fire a toast into it."
        [code]="snippets.positions"
      >
        <ff-select
          [options]="positionOptions"
          [value]="position()"
          (valueChange)="onPositionChange($event)"
        />
        <ff-button (clicked)="showAtPosition()">Show toast here</ff-button>
      </app-demo-section>

      <app-demo-section
        heading="Progress bar + hover pause"
        description="progressBar renders a linear CSS countdown tied to duration. Hovering pauses the bar visually and, via hoverStarted/hoverEnded, pauses and resumes the AlertService timer."
        [code]="snippets.progress"
      >
        <ff-button variant="outline" (clicked)="showWithProgress()">
          With progress bar (6s)
        </ff-button>
        <ff-button variant="outline" (clicked)="showWithoutProgress()">
          Without progress bar
        </ff-button>
        <ff-button variant="secondary" (clicked)="alerts.dismissAll()">Clear all</ff-button>
      </app-demo-section>

      <app-demo-section
        heading="Inline atom"
        description="The bare ff-toast atom, rendered inline: all FfToastVariant values."
        [code]="snippets.inline"
      >
        <div class="demo-stack">
          @for (v of variants; track v) {
            <ff-toast [message]="'This is a ' + v + ' toast'" [type]="v" />
          }
          <ff-toast message="You cannot close me manually" type="info" [dismissible]="false" />
        </div>
      </app-demo-section>
    </div>

    <ff-toast-container
      [toasts]="alerts.activeToasts()"
      (dismissed)="alerts.dismiss($event)"
      (hoverStarted)="alerts.pauseToast($event)"
      (hoverEnded)="alerts.resumeToast($event)"
    />
  `,
})
export class ToastPage {
  protected readonly alerts = inject(AlertService);

  protected readonly types: readonly AlertType[] = [
    'success',
    'error',
    'warning',
    'info',
    'destructive',
  ];

  protected readonly variants: readonly FfToastVariant[] = [
    'success',
    'error',
    'warning',
    'info',
  ];

  protected readonly position = signal<ToastPosition>('top-right');

  protected readonly positionOptions: FfSelectOption[] = [
    { label: 'top-right', value: 'top-right' },
    { label: 'top-left', value: 'top-left' },
    { label: 'bottom-right', value: 'bottom-right' },
    { label: 'bottom-left', value: 'bottom-left' },
  ];

  protected readonly snippets = {
    imperative: `const alerts = inject(AlertService);
alerts.success('Document saved');
alerts.error('Upload failed');
alerts.toast('Item deleted', 'destructive');`,
    positions: `alerts.toast('Over here!', 'info', { position: 'bottom-left' });`,
    progress: `alerts.toast('Uploaded', 'success', { duration: 6000, progressBar: true });

<ff-toast-container
  [toasts]="alerts.activeToasts()"
  (dismissed)="alerts.dismiss($event)"
  (hoverStarted)="alerts.pauseToast($event)"
  (hoverEnded)="alerts.resumeToast($event)"
/>`,
    inline: `<ff-toast message="Saved!" type="success" (dismissed)="remove()" />`,
  };

  protected showType(type: AlertType): void {
    this.alerts.toast(`This is a ${type} toast`, type);
  }

  protected onPositionChange(value: string): void {
    this.position.set(value as ToastPosition);
  }

  protected showAtPosition(): void {
    this.alerts.toast(`Toast at ${this.position()}`, 'info', {
      position: this.position(),
    });
  }

  protected showWithProgress(): void {
    this.alerts.toast('Uploaded with progress', 'success', {
      duration: 6000,
      progressBar: true,
    });
  }

  protected showWithoutProgress(): void {
    this.alerts.toast('Uploaded without progress', 'success', {
      duration: 6000,
    });
  }
}
