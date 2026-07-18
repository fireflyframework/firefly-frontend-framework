import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import {
  FfButtonComponent,
  FfDialogComponent,
  FfDialogVariant,
} from '@fireflyframework/design-system';

import { DemoSection } from '../../shared/demo-section';

/** Catalog page for `ff-dialog`. */
@Component({
  selector: 'app-dialog-page',
  imports: [DemoSection, FfDialogComponent, FfButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="page">
      <h2 class="page__title">Dialog</h2>
      <p class="page__lead">
        <code>&lt;ff-dialog&gt;</code> — modal overlay with backdrop, Escape-to-close and a
        projected actions zone. Optional semantic type (FfDialogVariant).
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
    </div>
  `,
})
export class DialogPage {
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
  };
}
