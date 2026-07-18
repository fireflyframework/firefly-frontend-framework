import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import {
  FfButtonComponent,
  FfSelectComponent,
  FfSelectOption,
} from '@fireflyframework/design-system';

import { DemoSection } from '../../shared/demo-section';

/** Catalog page for `ff-select`. */
@Component({
  selector: 'app-select-page',
  imports: [DemoSection, FfSelectComponent, FfButtonComponent, ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="page">
      <h2 class="page__title">Select</h2>
      <p class="page__lead">
        <code>&lt;ff-select&gt;</code> — single-selection dropdown with optional search and
        keyboard navigation. Implements ControlValueAccessor.
      </p>

      <app-demo-section
        heading="Basic"
        description="Placeholder + preselected value; one option disabled."
        [code]="snippets.basic"
      >
        <div class="demo-stack">
          <ff-select placeholder="Choose a country" [options]="countries" />
          <ff-select [options]="countries" value="es" />
        </div>
      </app-demo-section>

      <app-demo-section
        heading="Searchable"
        description="searchable adds a filter input inside the dropdown."
        [code]="snippets.searchable"
      >
        <div class="demo-stack">
          <ff-select placeholder="Search a country…" [options]="countries" [searchable]="true" />
        </div>
      </app-demo-section>

      <app-demo-section heading="Disabled" [code]="snippets.disabled">
        <div class="demo-stack">
          <ff-select [options]="countries" value="fr" [disabled]="true" />
        </div>
      </app-demo-section>

      <app-demo-section
        heading="Reactive Forms (CVA)"
        description="FormControl<string> bound via [formControl]."
        [code]="snippets.forms"
      >
        <div class="demo-stack">
          <ff-select [options]="countries" [formControl]="control" />
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
export class SelectPage {
  protected readonly countries: FfSelectOption[] = [
    { label: 'Spain', value: 'es' },
    { label: 'France', value: 'fr' },
    { label: 'Germany', value: 'de' },
    { label: 'Italy', value: 'it' },
    { label: 'Portugal (unavailable)', value: 'pt', disabled: true },
  ];

  protected readonly control = new FormControl('de', { nonNullable: true });
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
    basic: `<ff-select placeholder="Choose a country" [options]="countries"
  [value]="selected" (valueChange)="selected = $event" />`,
    searchable: `<ff-select [options]="countries" [searchable]="true" />`,
    disabled: `<ff-select [options]="countries" [disabled]="true" />`,
    forms: `control = new FormControl('de', { nonNullable: true });

<ff-select [options]="countries" [formControl]="control" />`,
  };
}
