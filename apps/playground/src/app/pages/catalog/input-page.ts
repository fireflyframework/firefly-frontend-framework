import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import {
  FfButtonComponent,
  FfInputComponent,
  FfInputType,
} from '@fireflyframework/design-system';

import { DemoSection } from '../../shared/demo-section';

/** Catalog page for `ff-input`. */
@Component({
  selector: 'app-input-page',
  imports: [DemoSection, FfInputComponent, FfButtonComponent, ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="page">
      <h2 class="page__title">Input</h2>
      <p class="page__lead">
        <code>&lt;ff-input&gt;</code> — form field with label, hint and error. Implements
        ControlValueAccessor, so it works with Reactive Forms and ngModel.
      </p>

      <app-demo-section
        heading="Types"
        description="All values of FfInputType, including textarea."
        [code]="snippets.types"
      >
        <div class="demo-stack">
          @for (t of types; track t) {
            <ff-input [type]="t" [label]="'Type: ' + t" [placeholder]="t" />
          }
        </div>
      </app-demo-section>

      <app-demo-section
        heading="Hint, error and disabled"
        description="Error styling activates when the error input is non-empty."
        [code]="snippets.states"
      >
        <div class="demo-stack">
          <ff-input label="With hint" hint="We never share your email." placeholder="you@example.com" />
          <ff-input label="With error" error="This field is required." />
          <ff-input label="Disabled" [disabled]="true" value="Read only value" />
        </div>
      </app-demo-section>

      <app-demo-section
        heading="Reactive Forms (CVA)"
        description="FormControl bound via [formControl]; toggle disables through the forms API."
        [code]="snippets.forms"
      >
        <div class="demo-stack">
          <ff-input label="Project name" [formControl]="control" hint="Bound with [formControl]" />
          <div>
            <ff-button size="sm" variant="outline" (clicked)="toggleDisabled()">
              {{ controlDisabled() ? 'Enable' : 'Disable' }} control
            </ff-button>
          </div>
          <span class="demo-label">control.value = "{{ liveValue() }}"</span>
        </div>
      </app-demo-section>
    </div>
  `,
})
export class InputPage {
  protected readonly types: readonly FfInputType[] = ['text', 'number', 'password', 'textarea'];

  protected readonly control = new FormControl('Firefly', { nonNullable: true });
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
    types: `<ff-input label="Email" placeholder="you@example.com" />
<ff-input label="Password" type="password" />
<ff-input label="Notes" type="textarea" [rows]="3" />`,
    states: `<ff-input label="With hint" hint="We never share your email." />
<ff-input label="With error" error="This field is required." />
<ff-input label="Disabled" [disabled]="true" />`,
    forms: `control = new FormControl('Firefly', { nonNullable: true });

<ff-input label="Project name" [formControl]="control" />`,
  };
}
