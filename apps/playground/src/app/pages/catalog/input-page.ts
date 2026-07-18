import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import {
  FfButtonComponent,
  FfIconComponent,
  FfInputComponent,
  FfInputLabelType,
  FfInputType,
} from '@fireflyframework/design-system';

import { DemoSection } from '../../shared/demo-section';

/** Catalog page for `ff-input`. */
@Component({
  selector: 'app-input-page',
  imports: [DemoSection, FfInputComponent, FfButtonComponent, FfIconComponent, ReactiveFormsModule],
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
        heading="Prefix and suffix affixes"
        description="Content projected via [ff-input-prefix] / [ff-input-suffix]; empty slots collapse."
        [code]="snippets.affixes"
      >
        <div class="demo-stack">
          <ff-input label="Search" placeholder="Search components...">
            <ff-icon ff-input-prefix name="search" size="sm" />
          </ff-input>
          <ff-input label="Settings key" placeholder="e.g. theme.mode">
            <ff-icon ff-input-suffix name="settings" size="sm" />
          </ff-input>
          <ff-input label="Both" placeholder="Prefix and suffix">
            <ff-icon ff-input-prefix name="search" size="sm" />
            <ff-icon ff-input-suffix name="close" size="sm" />
          </ff-input>
        </div>
      </app-demo-section>

      <app-demo-section
        heading="Debounce"
        description="With debounceTime, valueChange emits after the quiet period; blur flushes immediately."
        [code]="snippets.debounce"
      >
        <div class="demo-stack">
          <ff-input
            label="Debounced (400ms)"
            placeholder="Type fast, then pause"
            [debounceTime]="400"
            (valueChange)="onDebouncedChange($event)"
          />
          <span class="demo-label">
            emissions = {{ debounceCount() }} · last value = "{{ debouncedValue() }}"
          </span>
        </div>
      </app-demo-section>

      <app-demo-section
        heading="Search"
        description="search emits on Enter and, for type='search' with debounce, when the debounce settles."
        [code]="snippets.search"
      >
        <div class="demo-stack">
          <ff-input
            label="Search the catalog"
            type="search"
            placeholder="Press Enter or just stop typing"
            [debounceTime]="400"
            (search)="onSearch($event)"
          >
            <ff-icon ff-input-prefix name="search" size="sm" />
          </ff-input>
          <span class="demo-label">
            searches = {{ searchCount() }} · last query = "{{ lastSearch() }}"
          </span>
        </div>
      </app-demo-section>

      <app-demo-section
        heading="Label types"
        description="default renders above the field, floating sits on the border, hidden is aria-label only."
        [code]="snippets.labelTypes"
      >
        <div class="demo-stack">
          @for (lt of labelTypes; track lt) {
            <ff-input [labelType]="lt" [label]="'Label: ' + lt" [placeholder]="lt" />
          }
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
  protected readonly types: readonly FfInputType[] = [
    'text',
    'number',
    'password',
    'search',
    'textarea',
  ];
  protected readonly labelTypes: readonly FfInputLabelType[] = ['default', 'floating', 'hidden'];

  protected readonly debouncedValue = signal('');
  protected readonly debounceCount = signal(0);
  protected readonly lastSearch = signal('');
  protected readonly searchCount = signal(0);

  protected onDebouncedChange(value: string): void {
    this.debouncedValue.set(value);
    this.debounceCount.update((count) => count + 1);
  }

  protected onSearch(query: string): void {
    this.lastSearch.set(query);
    this.searchCount.update((count) => count + 1);
  }

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
    affixes: `<ff-input label="Search" placeholder="Search components...">
  <ff-icon ff-input-prefix name="search" size="sm" />
</ff-input>

<ff-input label="Settings key">
  <ff-icon ff-input-suffix name="settings" size="sm" />
</ff-input>`,
    debounce: `<ff-input
  label="Debounced (400ms)"
  [debounceTime]="400"
  (valueChange)="onDebouncedChange($event)"
/>`,
    search: `<ff-input type="search" [debounceTime]="400" (search)="onSearch($event)">
  <ff-icon ff-input-prefix name="search" size="sm" />
</ff-input>`,
    labelTypes: `<ff-input labelType="default" label="Above the field" />
<ff-input labelType="floating" label="On the border" />
<ff-input labelType="hidden" label="Screen readers only" />`,
  };
}
