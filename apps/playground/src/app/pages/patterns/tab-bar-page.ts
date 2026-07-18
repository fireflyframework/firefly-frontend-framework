import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import {
  FfTab,
  FfTabBarComponent,
  FfTabBarVariant,
} from '@fireflyframework/design-system';

import { DemoSection } from '../../shared/demo-section';

/** Pattern page for `ff-tab-bar`. */
@Component({
  selector: 'app-tab-bar-page',
  imports: [DemoSection, FfTabBarComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="page">
      <h2 class="page__title">Tab Bar</h2>
      <p class="page__lead">
        <code>&lt;ff-tab-bar&gt;</code> — horizontal tab strip composing ff-icon and
        ff-badge, with roving-tabindex keyboard navigation. It does not own the panel
        content: switch your own view from <code>(activeIdChange)</code>.
      </p>

      <app-demo-section
        heading="Tabs with icon, badge and disabled"
        description="FfTab supports icon (registry name), badge and disabled. Content below switches with activeId."
        [code]="snippets.full"
      >
        <div class="demo-stack" style="max-width: 100%">
          <ff-tab-bar [tabs]="tabs" [activeId]="active()" (activeIdChange)="active.set($event)" />
          <div>
            @switch (active()) {
              @case ('general') {
                <p style="margin: 0">General settings panel — the default tab.</p>
              }
              @case ('members') {
                <p style="margin: 0">Members panel — 12 people in this workspace.</p>
              }
              @case ('alerts') {
                <p style="margin: 0">Alerts panel — 3 unread warnings.</p>
              }
            }
          </div>
          <span class="demo-label">activeId = "{{ active() }}"</span>
        </div>
      </app-demo-section>

      <app-demo-section
        heading="Variants"
        description="Both values of FfTabBarVariant."
        [code]="snippets.variants"
      >
        <div class="demo-stack" style="max-width: 100%">
          @for (v of variants; track v) {
            <div>
              <span class="demo-label">{{ v }}</span>
              <ff-tab-bar
                [tabs]="simpleTabs"
                [variant]="v"
                [activeId]="variantActive()"
                (activeIdChange)="variantActive.set($event)"
              />
            </div>
          }
        </div>
      </app-demo-section>
    </div>
  `,
})
export class TabBarPage {
  protected readonly tabs: readonly FfTab[] = [
    { id: 'general', label: 'General', icon: 'settings' },
    { id: 'members', label: 'Members', badge: 12 },
    { id: 'alerts', label: 'Alerts', icon: 'warning', badge: 3 },
    { id: 'archive', label: 'Archive', disabled: true },
  ];

  protected readonly simpleTabs: readonly FfTab[] = [
    { id: 'one', label: 'One' },
    { id: 'two', label: 'Two' },
    { id: 'three', label: 'Three' },
  ];

  protected readonly variants: readonly FfTabBarVariant[] = ['underline', 'pills'];
  protected readonly active = signal('general');
  protected readonly variantActive = signal('one');

  protected readonly snippets = {
    full: `<ff-tab-bar
  [tabs]="[
    { id: 'general', label: 'General', icon: 'settings' },
    { id: 'members', label: 'Members', badge: 12 },
    { id: 'archive', label: 'Archive', disabled: true },
  ]"
  [activeId]="active()"
  (activeIdChange)="active.set($event)"
/>`,
    variants: `<ff-tab-bar [tabs]="tabs" variant="pills" … />`,
  };
}
