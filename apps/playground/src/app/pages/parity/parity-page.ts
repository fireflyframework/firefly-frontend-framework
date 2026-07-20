import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
  FfAvatarComponent,
  FfAvatarSize,
  FfBadgeColor,
  FfBadgeComponent,
  FfBadgeShape,
  FfBadgeSize,
  FfButtonComponent,
  FfButtonVariant,
  FfCardComponent,
  FfCheckboxComponent,
  FfDividerComponent,
  FfEmptyStateComponent,
  FfIconButtonComponent,
  FfIconButtonSize,
  FfIconComponent,
  FfIconSize,
  FfInputComponent,
  FfPanelComponent,
  FfProgressComponent,
  FfRadioGroupComponent,
  FfRadioOption,
  FfSkeletonComponent,
  FfTab,
  FfTabBarComponent,
  FfTabBarVariant,
} from '@fireflyframework/design-system';

import { PLAYGROUND_ICONS } from '../../shared/icons';

/**
 * Visual parity QA page for the Flydocs catalog migration.
 *
 * Concentrates the migrated primitives from waves 1-5 with the prop
 * combinations that actually dominate Flydocs' real usage (per the migration
 * inventory), so a single route can be captured under the Flydocs theme and
 * compared against the legacy Hub UI rendering through a screenshot diff.
 *
 * Every specimen renders with fixed, static props (no random data, no
 * clock-dependent values) so repeated runs produce byte-identical
 * screenshots.
 */
@Component({
  selector: 'app-parity-page',
  imports: [
    FfAvatarComponent,
    FfBadgeComponent,
    FfButtonComponent,
    FfCardComponent,
    FfCheckboxComponent,
    FfDividerComponent,
    FfEmptyStateComponent,
    FfIconButtonComponent,
    FfIconComponent,
    FfInputComponent,
    FfPanelComponent,
    FfProgressComponent,
    FfRadioGroupComponent,
    FfSkeletonComponent,
    FfTabBarComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './parity-page.scss',
  template: `
    <div class="page">
      <h2 class="page__title">Parity</h2>
      <p class="page__lead">
        One route concentrating the real prop combinations used across the migrated
        primitives, organized in the five migration waves, as a stable surface for
        screenshot-diff comparisons under the Flydocs theme.
      </p>

      <section class="parity-wave" data-testid="parity-wave-1">
        <h3 class="parity-wave__title">Wave 1 — Icon</h3>
        <div class="parity-wave__group">
          <h4 class="parity-wave__group-title">Registry icons × all sizes</h4>
          @for (size of iconSizes; track size) {
            <div class="parity-row">
              @for (name of iconNames; track name) {
                <div class="parity-specimen">
                  <ff-icon [name]="name" [size]="size" />
                  <span class="demo-label">{{ name }} · {{ size }}</span>
                </div>
              }
            </div>
          }
        </div>
      </section>

      <section class="parity-wave" data-testid="parity-wave-2">
        <h3 class="parity-wave__title">Wave 2 — Stateless</h3>

        <div class="parity-wave__group">
          <h4 class="parity-wave__group-title">Badge — color × size (tinted, dominant combo)</h4>
          @for (size of badgeSizes; track size) {
            <div class="parity-row">
              @for (color of badgeColors; track color) {
                <ff-badge [color]="color" [size]="size">{{ color }}</ff-badge>
              }
            </div>
          }
          <div class="parity-row">
            <ff-badge color="success" [dot]="true">Online</ff-badge>
            <ff-badge color="warning" [dot]="true">Degraded</ff-badge>
            <ff-badge color="error" [dot]="true" />
          </div>
          <div class="parity-row">
            @for (shape of badgeShapes; track shape) {
              <ff-badge color="primary" [shape]="shape">{{ shape }}</ff-badge>
            }
          </div>
        </div>

        <div class="parity-wave__group">
          <h4 class="parity-wave__group-title">Avatar — initials × size</h4>
          <div class="parity-row">
            @for (size of avatarSizes; track size) {
              <ff-avatar [size]="size" initials="MG" alt="Maria Garcia" />
            }
          </div>
        </div>

        <div class="parity-wave__group">
          <h4 class="parity-wave__group-title">Skeleton — variants</h4>
          <div class="parity-row">
            <ff-skeleton variant="text" [lines]="2" width="160px" />
            <ff-skeleton variant="rect" width="120px" height="60px" />
            <ff-skeleton variant="circle" height="48px" />
          </div>
        </div>

        <div class="parity-wave__group">
          <h4 class="parity-wave__group-title">Progress — values</h4>
          <div class="parity-row">
            @for (value of progressValues; track value) {
              <ff-progress
                class="parity-progress"
                [value]="value"
                variant="primary"
                [showValue]="true"
                [label]="'Progress ' + value"
              />
            }
          </div>
        </div>

        <div class="parity-wave__group">
          <h4 class="parity-wave__group-title">Divider</h4>
          <div class="parity-row">
            <span>Left</span>
            <ff-divider orientation="vertical" />
            <span>Right</span>
          </div>
          <ff-divider />
        </div>

        <div class="parity-wave__group">
          <h4 class="parity-wave__group-title">Empty state — title + description</h4>
          <ff-empty-state
            class="parity-full-width"
            title="No documents yet"
            description="Upload your first document to get started."
          />
        </div>
      </section>

      <section class="parity-wave" data-testid="parity-wave-3">
        <h3 class="parity-wave__title">Wave 3 — Actions</h3>

        <div class="parity-wave__group">
          <h4 class="parity-wave__group-title">
            Button — variant × color primary, size sm (dominant) and md
          </h4>
          <div class="parity-row">
            @for (variant of buttonStyleVariants; track variant) {
              <ff-button [variant]="variant" color="primary" size="sm">{{ variant }}</ff-button>
            }
          </div>
          <div class="parity-row">
            @for (variant of buttonStyleVariants; track variant) {
              <ff-button [variant]="variant" color="primary" size="md">{{ variant }}</ff-button>
            }
          </div>
          <div class="parity-row">
            <ff-button color="primary" [loading]="true">Loading</ff-button>
            <ff-button color="primary" [disabled]="true">Disabled</ff-button>
          </div>
        </div>

        <div class="parity-wave__group">
          <h4 class="parity-wave__group-title">Icon button — sizes, real icon</h4>
          <div class="parity-row">
            @for (size of iconButtonSizes; track size) {
              <ff-icon-button [size]="size" tooltip="Search">
                <ff-icon name="search" />
              </ff-icon-button>
            }
          </div>
        </div>
      </section>

      <section class="parity-wave" data-testid="parity-wave-4">
        <h3 class="parity-wave__title">Wave 4 — Panels/tabs</h3>

        <div class="parity-wave__group">
          <h4 class="parity-wave__group-title">
            Panel — alert appearance, warning/danger, projected heading
          </h4>
          <div class="parity-row">
            <ff-panel appearance="alert" variant="warning">
              <span ff-panel-heading>Quota almost reached</span>
              You have used 90% of your storage.
            </ff-panel>
            <ff-panel appearance="alert" variant="danger">
              <span ff-panel-heading>Upload failed</span>
              The document could not be processed.
            </ff-panel>
          </div>
        </div>

        <div class="parity-wave__group">
          <h4 class="parity-wave__group-title">
            Panel — default (card) appearance, projected heading and footer
          </h4>
          <ff-panel>
            <span ff-panel-heading>Billing</span>
            <p class="parity-body-text">Card body content.</p>
            <div ff-panel-footer>Footer zone</div>
          </ff-panel>
        </div>

        <div class="parity-wave__group">
          <h4 class="parity-wave__group-title">Card — basic</h4>
          <ff-card class="parity-card" shadow="md">
            <p class="parity-body-text">Basic card body content.</p>
          </ff-card>
        </div>

        <div class="parity-wave__group">
          <h4 class="parity-wave__group-title">Tab bar — 4 tabs, active tab not first</h4>
          <ff-tab-bar [tabs]="tabs" activeId="members" />
          <div class="parity-row">
            @for (variant of tabBarVariants; track variant) {
              <ff-tab-bar [tabs]="tabs" [variant]="variant" activeId="alerts" />
            }
          </div>
        </div>
      </section>

      <section class="parity-wave" data-testid="parity-wave-5">
        <h3 class="parity-wave__title">Wave 5 — Form fields</h3>

        <div class="parity-wave__group">
          <h4 class="parity-wave__group-title">
            Input — label, placeholder, prefix icon, error, disabled
          </h4>
          <div class="parity-row">
            <div class="parity-specimen" data-testid="parity-input-default">
              <ff-input label="Search" placeholder="Search documents...">
                <ff-icon ff-input-prefix name="search" size="sm" />
              </ff-input>
            </div>
            <div class="parity-specimen" data-testid="parity-input-error">
              <ff-input label="Email" value="not-an-email" error="This field is required." />
            </div>
            <div class="parity-specimen" data-testid="parity-input-disabled">
              <ff-input label="Disabled field" [disabled]="true" value="Read only value" />
            </div>
          </div>
        </div>

        <div class="parity-wave__group">
          <h4 class="parity-wave__group-title">Checkbox — unchecked, checked, disabled checked</h4>
          <div class="parity-row">
            <ff-checkbox label="Unchecked" />
            <ff-checkbox label="Checked" [checked]="true" />
            <ff-checkbox label="Disabled checked" [checked]="true" [disabled]="true" />
          </div>
        </div>

        <div class="parity-wave__group">
          <h4 class="parity-wave__group-title">Radio group — selected option</h4>
          <ff-radio name="parity-plan" [options]="radioOptions" value="pro" />
        </div>
      </section>
    </div>
  `,
})
export class ParityPage {
  /** Icons registered by the playground, sampled for the icon wave. */
  protected readonly iconNames: readonly string[] = Object.keys(PLAYGROUND_ICONS).slice(0, 5);

  /** Every value of `FfIconSize`. */
  protected readonly iconSizes: readonly FfIconSize[] = ['sm', 'md', 'lg'];

  /** Dominant badge colors sourced from Flydocs domain-status pipes. */
  protected readonly badgeColors: readonly FfBadgeColor[] = [
    'primary',
    'success',
    'warning',
    'error',
    'neutral',
  ];

  /** The two smallest badge sizes, dominant in Flydocs usage. */
  protected readonly badgeSizes: readonly FfBadgeSize[] = ['xs', 'sm'];

  /** Both values of `FfBadgeShape`. */
  protected readonly badgeShapes: readonly FfBadgeShape[] = ['pill', 'square'];

  /** Every value of `FfAvatarSize`. */
  protected readonly avatarSizes: readonly FfAvatarSize[] = ['sm', 'md', 'lg'];

  /** Fixed progress values matching common upload/processing checkpoints. */
  protected readonly progressValues: readonly number[] = [25, 60, 90];

  /** Every value of `FfButtonVariant`'s style axis. */
  protected readonly buttonStyleVariants: readonly FfButtonVariant[] = [
    'solid',
    'outline',
    'ghost',
  ];

  /** Every value of `FfIconButtonSize`. */
  protected readonly iconButtonSizes: readonly FfIconButtonSize[] = ['sm', 'md', 'lg'];

  /** Tabs used by the tab-bar specimens, with a non-first active tab. */
  protected readonly tabs: readonly FfTab[] = [
    { id: 'general', label: 'General' },
    { id: 'members', label: 'Members', badge: 12 },
    { id: 'alerts', label: 'Alerts', icon: 'warning' },
    { id: 'archive', label: 'Archive' },
  ];

  /** Both values of `FfTabBarVariant`. */
  protected readonly tabBarVariants: readonly FfTabBarVariant[] = ['underline', 'pills'];

  /** Radio options with a pre-selected value. */
  protected readonly radioOptions: FfRadioOption[] = [
    { label: 'Free', value: 'free' },
    { label: 'Pro', value: 'pro' },
    { label: 'Enterprise', value: 'enterprise' },
  ];
}
