import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import {
  FfBottomSheetComponent,
  FfBottomSheetVariant,
  FfButtonComponent,
} from '@fireflyframework/design-system';

import { DemoSection } from '../../shared/demo-section';

/** Catalog page for `ff-bottom-sheet`. */
@Component({
  selector: 'app-bottom-sheet-page',
  imports: [DemoSection, FfBottomSheetComponent, FfButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="page">
      <h2 class="page__title">Bottom Sheet</h2>
      <p class="page__lead">
        <code>&lt;ff-bottom-sheet&gt;</code> — modal panel anchored to the bottom of the
        viewport with backdrop, semantic header accent and an actions slot.
      </p>

      <app-demo-section
        heading="Semantic variants"
        description="All values of FfBottomSheetVariant control the header accent."
        [code]="snippets.variants"
      >
        @for (v of variants; track v) {
          <ff-button variant="outline" (clicked)="openVariant.set(v)">{{ v }}</ff-button>
        }
        @if (openVariant(); as v) {
          <ff-bottom-sheet
            [open]="true"
            [title]="'Bottom sheet · ' + v"
            [message]="'This sheet uses type=' + v + '.'"
            [type]="v"
            (dismissed)="openVariant.set(null)"
          >
            <div ff-bottom-sheet-actions>
              <ff-button (clicked)="openVariant.set(null)">Close</ff-button>
            </div>
          </ff-bottom-sheet>
        }
      </app-demo-section>

      <app-demo-section
        heading="Non-dismissible"
        description="dismissible=false disables backdrop click and the close button."
        [code]="snippets.locked"
      >
        <ff-button variant="outline" (clicked)="lockedOpen.set(true)">Open locked sheet</ff-button>
        <ff-bottom-sheet
          [open]="lockedOpen()"
          title="Action required"
          message="Use the button to continue."
          [dismissible]="false"
          (dismissed)="lockedOpen.set(false)"
        >
          <div ff-bottom-sheet-actions>
            <ff-button (clicked)="lockedOpen.set(false)">Continue</ff-button>
          </div>
        </ff-bottom-sheet>
      </app-demo-section>
    </div>
  `,
})
export class BottomSheetPage {
  protected readonly variants: readonly FfBottomSheetVariant[] = [
    'success',
    'error',
    'warning',
    'info',
  ];

  protected readonly openVariant = signal<FfBottomSheetVariant | null>(null);
  protected readonly lockedOpen = signal(false);

  protected readonly snippets = {
    variants: `<ff-bottom-sheet [open]="show" title="Details" message="…" type="info"
  (dismissed)="show = false">
  <div ff-bottom-sheet-actions><ff-button (clicked)="show = false">Close</ff-button></div>
</ff-bottom-sheet>`,
    locked: `<ff-bottom-sheet [open]="show" [dismissible]="false" … />`,
  };
}
