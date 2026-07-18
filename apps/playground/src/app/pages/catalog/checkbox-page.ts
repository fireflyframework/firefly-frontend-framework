import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import {
  FfButtonComponent,
  FfCheckboxComponent,
} from '@fireflyframework/design-system';

import { DemoSection } from '../../shared/demo-section';

/** Catalog page for `ff-checkbox`. */
@Component({
  selector: 'app-checkbox-page',
  imports: [DemoSection, FfCheckboxComponent, FfButtonComponent, ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="page">
      <h2 class="page__title">Checkbox</h2>
      <p class="page__lead">
        <code>&lt;ff-checkbox&gt;</code> — native checkbox with indeterminate and disabled
        states. Implements ControlValueAccessor.
      </p>

      <app-demo-section
        heading="States"
        description="Checked, unchecked, indeterminate and disabled."
        [code]="snippets.states"
      >
        <div class="demo-stack">
          <ff-checkbox label="Unchecked" />
          <ff-checkbox label="Checked" [checked]="true" />
          <ff-checkbox label="Indeterminate" [indeterminate]="true" />
          <ff-checkbox label="Disabled" [disabled]="true" />
          <ff-checkbox label="Disabled checked" [checked]="true" [disabled]="true" />
        </div>
      </app-demo-section>

      <app-demo-section
        heading="Reactive Forms (CVA)"
        description="FormControl<boolean> bound via [formControl]."
        [code]="snippets.forms"
      >
        <div class="demo-stack">
          <ff-checkbox label="Accept terms and conditions" [formControl]="control" />
          <div>
            <ff-button size="sm" variant="outline" (clicked)="toggleDisabled()">
              {{ controlDisabled() ? 'Enable' : 'Disable' }} control
            </ff-button>
          </div>
          <span class="demo-label">control.value = {{ liveValue() }}</span>
        </div>
      </app-demo-section>
    </div>
  `,
})
export class CheckboxPage {
  protected readonly control = new FormControl(true, { nonNullable: true });
  protected readonly liveValue = toSignal(this.control.valueChanges, {
    initialValue: this.control.value,
  });
  protected readonly controlDisabled = signal(false);

  protected toggleDisabled(): void {
    if (this.control.disabled) {
      this.control.enable();
    } else {
      this.control.disable();
    }
    this.controlDisabled.set(this.control.disabled);
  }

  protected readonly snippets = {
    states: `<ff-checkbox label="Checked" [checked]="true" />
<ff-checkbox label="Indeterminate" [indeterminate]="true" />
<ff-checkbox label="Disabled" [disabled]="true" />`,
    forms: `control = new FormControl(true, { nonNullable: true });

<ff-checkbox label="Accept terms" [formControl]="control" />`,
  };
}
