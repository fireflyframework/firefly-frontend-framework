import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { AlertService } from '@fireflyframework/core';
import {
  FfButtonComponent,
  FfDialogContainerComponent,
  FfDialogResolution,
  FfSelectComponent,
  FfSelectLabelTemplateDirective,
  FfSelectOption,
  FfSelectOptionTemplateDirective,
} from '@fireflyframework/design-system';

import { DemoSection } from '../../shared/demo-section';

/** A country record fetched as-is from a backend: no `label`/`value` keys, resolved via `bindLabel`/`bindValue`. */
interface CountryRecord {
  readonly id: string;
  readonly name: string;
  readonly flag: string;
  readonly [key: string]: unknown;
}

/**
 * Content hosted inside `ff-dialog-container` via `AlertService.dialog({ type: 'custom' })`,
 * demonstrating that the portaled `ff-select` panel opens/closes correctly inside a
 * `cdkTrapFocus`-guarded modal.
 */
@Component({
  selector: 'app-select-dialog-demo',
  imports: [FfSelectComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <h2 style="margin: 0 0 8px">Assign a reviewer</h2>
    <p style="margin: 0 0 12px">
      This <code>&lt;ff-select searchable&gt;</code> lives inside a dialog trapped by
      <code>cdkTrapFocus</code>. Its options panel is portaled to the document body, but keyboard
      focus never leaves the dialog.
    </p>
    <ff-select placeholder="Choose a reviewer" [options]="reviewers" [searchable]="true" />
  `,
})
export class SelectDialogDemo {
  protected readonly reviewers: FfSelectOption[] = [
    { label: 'Alex Rivera', value: 'alex' },
    { label: 'Priya Shah', value: 'priya' },
    { label: 'Sam Okafor', value: 'sam' },
  ];
}

/** Catalog page for `ff-select`. */
@Component({
  selector: 'app-select-page',
  imports: [
    DemoSection,
    FfSelectComponent,
    FfSelectOptionTemplateDirective,
    FfSelectLabelTemplateDirective,
    FfButtonComponent,
    FfDialogContainerComponent,
    ReactiveFormsModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="page">
      <h2 class="page__title">Select</h2>
      <p class="page__lead">
        <code>&lt;ff-select&gt;</code> — single- or multi-selection dropdown with optional search,
        custom templates and a portaled overlay panel. Implements ControlValueAccessor.
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
        description="searchable adds an inline filter; the panel stays portaled and repositions on scroll."
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

      <app-demo-section
        heading="Multi-selection"
        description="multiple renders a checkbox per option; values/valuesChange carry the array and the panel stays open across picks."
        [code]="snippets.multiple"
      >
        <div class="demo-stack">
          <ff-select
            placeholder="Choose countries"
            [options]="countries"
            [multiple]="true"
            [values]="selectedCountries()"
            (valuesChange)="selectedCountries.set($event)"
          />
          <span class="demo-label">values = [{{ selectedCountries().join(', ') }}]</span>
        </div>
      </app-demo-section>

      <app-demo-section
        heading="bindLabel / bindValue"
        description="Options can be arbitrary objects (here { id, name, flag }); bindLabel/bindValue resolve the display text and the form value."
        [code]="snippets.bindings"
      >
        <div class="demo-stack">
          <ff-select
            placeholder="Choose a country"
            [options]="countryRecords"
            bindLabel="name"
            bindValue="id"
            [value]="selectedCountryId()"
            (valueChange)="selectedCountryId.set($event)"
          />
          <span class="demo-label">value = "{{ selectedCountryId() }}"</span>
        </div>
      </app-demo-section>

      <app-demo-section
        heading="Custom templates"
        description="ffSelectOptionTemplate customizes each row; ffSelectLabelTemplate customizes the trigger's selected-value display."
        [code]="snippets.templates"
      >
        <div class="demo-stack">
          <ff-select placeholder="Choose a country" [options]="countryRecords" bindLabel="name" bindValue="id">
            <ng-template ffSelectOptionTemplate let-country>
              <span>{{ country.flag }}&nbsp;{{ country.name }}</span>
            </ng-template>
            <ng-template ffSelectLabelTemplate let-country>
              <strong>{{ country.flag }} {{ country.name }}</strong>
            </ng-template>
          </ff-select>
        </div>
      </app-demo-section>

      <app-demo-section
        heading="Inside a modal (ff-dialog-container)"
        description="AlertService.dialog() hosts a searchable ff-select through NgComponentOutlet; the panel is portaled to the body but opening/closing it never escapes the dialog's cdkTrapFocus."
        [code]="snippets.dialog"
      >
        <ff-button (clicked)="openSelectDialog()">Open dialog with a select</ff-button>
      </app-demo-section>
    </div>

    <ff-dialog-container
      [dialogs]="alerts.activeDialogs()"
      (resolved)="onResolved($event)"
    />
  `,
})
export class SelectPage {
  protected readonly alerts = inject(AlertService);

  protected readonly countries: FfSelectOption[] = [
    { label: 'Spain', value: 'es' },
    { label: 'France', value: 'fr' },
    { label: 'Germany', value: 'de' },
    { label: 'Italy', value: 'it' },
    { label: 'Portugal (unavailable)', value: 'pt', disabled: true },
  ];

  protected readonly countryRecords: CountryRecord[] = [
    { id: 'es', name: 'Spain', flag: '🇪🇸' },
    { id: 'fr', name: 'France', flag: '🇫🇷' },
    { id: 'de', name: 'Germany', flag: '🇩🇪' },
    { id: 'it', name: 'Italy', flag: '🇮🇹' },
  ];

  protected readonly control = new FormControl('de', { nonNullable: true });
  protected readonly liveValue = toSignal(this.control.valueChanges, {
    initialValue: this.control.value,
  });
  protected readonly controlDisabled = signal(false);

  protected readonly selectedCountries = signal<readonly string[]>(['es']);
  protected readonly selectedCountryId = signal('fr');

  protected toggleDisabled(): void {
    if (this.control.disabled) {
      this.control.enable();
    } else {
      this.control.disable();
    }
    this.controlDisabled.set(this.control.disabled);
  }

  /** Forwards a container resolution to the service (id + DialogResult shape). */
  protected onResolved(event: FfDialogResolution): void {
    this.alerts.resolveDialog(event.id, {
      confirmed: event.confirmed,
      input: event.input,
    });
  }

  protected async openSelectDialog(): Promise<void> {
    const result = await this.alerts.dialog({
      type: 'custom',
      component: SelectDialogDemo,
      confirmLabel: 'Close',
    });
    this.alerts.info(result.confirmed ? 'Dialog closed' : 'Dialog dismissed');
  }

  protected readonly snippets = {
    basic: `<ff-select placeholder="Choose a country" [options]="countries"
  [value]="selected" (valueChange)="selected = $event" />`,
    searchable: `<ff-select [options]="countries" [searchable]="true" />`,
    disabled: `<ff-select [options]="countries" [disabled]="true" />`,
    forms: `control = new FormControl('de', { nonNullable: true });

<ff-select [options]="countries" [formControl]="control" />`,
    multiple: `<ff-select [options]="countries" [multiple]="true"
  [values]="selectedCountries()" (valuesChange)="selectedCountries.set($event)" />`,
    bindings: `countryRecords: { id: string; name: string; flag: string }[] = [...];

<ff-select [options]="countryRecords" bindLabel="name" bindValue="id"
  [value]="selectedCountryId()" (valueChange)="selectedCountryId.set($event)" />`,
    templates: `<ff-select [options]="countryRecords" bindLabel="name" bindValue="id">
  <ng-template ffSelectOptionTemplate let-country>{{ country.flag }} {{ country.name }}</ng-template>
  <ng-template ffSelectLabelTemplate let-country><strong>{{ country.flag }} {{ country.name }}</strong></ng-template>
</ff-select>`,
    dialog: `await alerts.dialog({ type: 'custom', component: SelectDialogDemo, confirmLabel: 'Close' });

<ff-dialog-container [dialogs]="alerts.activeDialogs()" (resolved)="..." />`,
  };
}
