import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import {
  FfButtonComponent,
  FfRadioGroupComponent,
  FfRadioOption,
} from '@fireflyframework/design-system';

import { DemoSection } from '../../shared/demo-section';

/** Catalog page for `ff-radio` (FfRadioGroupComponent). */
@Component({
  selector: 'app-radio-group-page',
  imports: [DemoSection, FfRadioGroupComponent, FfButtonComponent, ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="page">
      <h2 class="page__title">Radio Group</h2>
      <p class="page__lead">
        <code>&lt;ff-radio&gt;</code> — mutually-exclusive options from a declarative
        options array, with per-option disable. Implements ControlValueAccessor.
      </p>

      <app-demo-section
        heading="Orientations"
        description="All values of FfRadioOrientation."
        [code]="snippets.orientations"
      >
        <div class="demo-stack">
          <span class="demo-label">horizontal</span>
          <ff-radio name="plan-h" [options]="options" value="pro" orientation="horizontal" />
          <span class="demo-label">vertical</span>
          <ff-radio name="plan-v" [options]="options" value="free" orientation="vertical" />
        </div>
      </app-demo-section>

      <app-demo-section
        heading="Disabled"
        description="Whole group disabled, or a single option via option.disabled."
        [code]="snippets.disabled"
      >
        <div class="demo-stack">
          <span class="demo-label">group disabled</span>
          <ff-radio name="plan-d" [options]="options" value="pro" [disabled]="true" />
          <span class="demo-label">one option disabled</span>
          <ff-radio name="plan-od" [options]="optionsWithDisabled" value="free" />
        </div>
      </app-demo-section>

      <app-demo-section
        heading="Reactive Forms (CVA)"
        description="FormControl<string> bound via [formControl]."
        [code]="snippets.forms"
      >
        <div class="demo-stack">
          <ff-radio name="plan-form" [options]="options" [formControl]="control" />
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
export class RadioGroupPage {
  protected readonly options: FfRadioOption[] = [
    { label: 'Free', value: 'free' },
    { label: 'Pro', value: 'pro' },
    { label: 'Enterprise', value: 'enterprise' },
  ];

  protected readonly optionsWithDisabled: FfRadioOption[] = [
    { label: 'Free', value: 'free' },
    { label: 'Pro', value: 'pro' },
    { label: 'Enterprise (soon)', value: 'enterprise', disabled: true },
  ];

  protected readonly control = new FormControl('pro', { nonNullable: true });
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
    orientations: `<ff-radio name="plan" [options]="plans" orientation="vertical"
  [value]="selected" (valueChange)="selected = $event" />`,
    disabled: `<ff-radio name="plan" [options]="plans" [disabled]="true" />
// per option: { label: 'Enterprise', value: 'ent', disabled: true }`,
    forms: `control = new FormControl('pro', { nonNullable: true });

<ff-radio name="plan" [options]="plans" [formControl]="control" />`,
  };
}
