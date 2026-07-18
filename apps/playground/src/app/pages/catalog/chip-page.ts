import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import {
  FfChipComponent,
  FfChipSize,
} from '@fireflyframework/design-system';

import { DemoSection } from '../../shared/demo-section';

/** Catalog page for `ff-chip`. */
@Component({
  selector: 'app-chip-page',
  imports: [DemoSection, FfChipComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="page">
      <h2 class="page__title">Chip</h2>
      <p class="page__lead">
        <code>&lt;ff-chip&gt;</code> — inline tag with three variants of FfChipVariant:
        default (static), filter (toggleable) and removable.
      </p>

      <app-demo-section heading="Default" [code]="snippets.default">
        <ff-chip>Angular</ff-chip>
        <ff-chip>Design System</ff-chip>
        <ff-chip [disabled]="true">Disabled</ff-chip>
      </app-demo-section>

      <app-demo-section
        heading="Filter"
        description="Click to toggle the selected state."
        [code]="snippets.filter"
      >
        <ff-chip variant="filter" [selected]="filterOn()" (clicked)="filterOn.set(!filterOn())">
          Active filter: {{ filterOn() ? 'on' : 'off' }}
        </ff-chip>
      </app-demo-section>

      <app-demo-section
        heading="Removable"
        description="The close button emits (removed) — chips below are actually removed."
        [code]="snippets.removable"
      >
        @for (tag of tags(); track tag) {
          <ff-chip variant="removable" (removed)="remove(tag)">{{ tag }}</ff-chip>
        }
        @if (tags().length === 0) {
          <span class="demo-label">All chips removed — reload the page to reset.</span>
        }
      </app-demo-section>

      <app-demo-section heading="Sizes" description="All values of FfChipSize." [code]="snippets.sizes">
        @for (s of sizes; track s) {
          <ff-chip [size]="s">size {{ s }}</ff-chip>
        }
      </app-demo-section>
    </div>
  `,
})
export class ChipPage {
  protected readonly sizes: readonly FfChipSize[] = ['sm', 'md'];
  protected readonly filterOn = signal(true);
  protected readonly tags = signal<readonly string[]>(['One', 'Two', 'Three']);

  protected remove(tag: string): void {
    this.tags.set(this.tags().filter((t) => t !== tag));
  }

  protected readonly snippets = {
    default: `<ff-chip>Tag</ff-chip>
<ff-chip [disabled]="true">Disabled</ff-chip>`,
    filter: `<ff-chip variant="filter" [selected]="isActive" (clicked)="toggle()">Active</ff-chip>`,
    removable: `<ff-chip variant="removable" (removed)="onRemove()">Removable</ff-chip>`,
    sizes: `<ff-chip size="sm">Small</ff-chip>`,
  };
}
