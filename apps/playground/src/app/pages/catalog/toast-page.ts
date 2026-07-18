import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import {
  FfButtonComponent,
  FfSelectComponent,
  FfSelectOption,
  FfToastComponent,
  FfToastPosition,
  FfToastService,
  FfToastVariant,
} from '@fireflyframework/design-system';

import { DemoSection } from '../../shared/demo-section';

/** Catalog page for `ff-toast` and the imperative `FfToastService`. */
@Component({
  selector: 'app-toast-page',
  imports: [DemoSection, FfButtonComponent, FfSelectComponent, FfToastComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="page">
      <h2 class="page__title">Toast</h2>
      <p class="page__lead">
        <code>&lt;ff-toast&gt;</code> — compact notification. Use it inline, or let
        <code>FfToastService</code> (registered via <code>provideFfToasts</code>) queue,
        position and auto-dismiss toasts imperatively with zero markup.
      </p>

      <app-demo-section
        heading="Imperative API"
        description="FfToastService shortcuts: one toast per variant, default position (top-right) and timeout (4000ms)."
        [code]="snippets.imperative"
      >
        @for (v of variants; track v) {
          <ff-button variant="outline" (clicked)="showVariant(v)">{{ v }}</ff-button>
        }
      </app-demo-section>

      <app-demo-section
        heading="Positions"
        description="Every FfToastPosition value; pick a region and fire a toast into it."
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
        heading="Progress bar"
        description="progressBar renders a linear CSS countdown, paused on hover (auto-dismiss pauses too)."
        [code]="snippets.progress"
      >
        <ff-button variant="outline" (clicked)="showWithProgress()">
          With progress bar (6s)
        </ff-button>
        <ff-button variant="outline" (clicked)="showWithoutProgress()">
          Without progress bar
        </ff-button>
      </app-demo-section>

      <app-demo-section
        heading="Persistent (timeout 0)"
        description="timeout: 0 disables auto-dismiss; the toast stays until dismissed manually."
        [code]="snippets.persistent"
      >
        <ff-button variant="outline" (clicked)="showPersistent()">
          Show persistent toast
        </ff-button>
        <ff-button variant="secondary" (clicked)="toasts.clear()">Clear all</ff-button>
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
  `,
})
export class ToastPage {
  protected readonly toasts = inject(FfToastService);

  protected readonly variants: readonly FfToastVariant[] = [
    'success',
    'error',
    'warning',
    'info',
  ];

  protected readonly position = signal<FfToastPosition>('top-right');

  protected readonly positionOptions: FfSelectOption[] = [
    { label: 'top-right', value: 'top-right' },
    { label: 'top-left', value: 'top-left' },
    { label: 'top-center', value: 'top-center' },
    { label: 'bottom-right', value: 'bottom-right' },
    { label: 'bottom-left', value: 'bottom-left' },
    { label: 'bottom-center', value: 'bottom-center' },
  ];

  protected readonly snippets = {
    imperative: `const toasts = inject(FfToastService);
toasts.success('Document saved');
toasts.error('Upload failed');`,
    positions: `toasts.info('Over here!', { position: 'bottom-center' });`,
    progress: `toasts.success('Uploaded', { timeout: 6000, progressBar: true });`,
    persistent: `const id = toasts.warning('Syncing…', { timeout: 0 });
// later
toasts.dismiss(id);
toasts.clear();`,
    inline: `<ff-toast message="Saved!" type="success" (dismissed)="remove()" />`,
  };

  protected showVariant(variant: FfToastVariant): void {
    this.toasts[variant](`This is a ${variant} toast`);
  }

  protected onPositionChange(value: string): void {
    this.position.set(value as FfToastPosition);
  }

  protected showAtPosition(): void {
    this.toasts.info(`Toast at ${this.position()}`, {
      position: this.position(),
    });
  }

  protected showWithProgress(): void {
    this.toasts.success('Uploaded with progress', {
      timeout: 6000,
      progressBar: true,
    });
  }

  protected showWithoutProgress(): void {
    this.toasts.success('Uploaded without progress', { timeout: 6000 });
  }

  protected showPersistent(): void {
    this.toasts.warning('I stay until you close me', { timeout: 0 });
  }
}
