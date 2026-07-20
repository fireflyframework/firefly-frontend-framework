import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  Directive,
  ElementRef,
  OnDestroy,
  TemplateRef,
  ViewEncapsulation,
  computed,
  contentChild,
  forwardRef,
  inject,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import {
  CdkConnectedOverlay,
  CdkOverlayOrigin,
  Overlay,
  type ConnectedPosition,
} from '@angular/cdk/overlay';

/**
 * Any object usable as an `ff-select` option. `label`/`value` are resolved
 * dynamically through the `bindLabel`/`bindValue` inputs, so this type places
 * no constraint beyond "some object" — arbitrary domain objects (a user, a
 * country record fetched from an API, …) can be used directly as options.
 */
export type FfSelectOptionLike = Record<string, unknown>;

/**
 * Default option shape, used when `bindLabel`/`bindValue` are left at their
 * defaults (`'label'`/`'value'`).
 */
export interface FfSelectOption extends FfSelectOptionLike {
  /** Display text. */
  label: string;
  /** Form value emitted on selection. */
  value: string;
  /** Disables this individual option. */
  disabled?: boolean;
}

/**
 * Template context handed to a `[ffSelectOptionTemplate]` / `[ffSelectLabelTemplate]`
 * `<ng-template>`: `$implicit` is the raw option object (before `bindLabel`/`bindValue`
 * resolution), so a custom template can read any of its properties.
 */
export interface FfSelectTemplateContext {
  $implicit: FfSelectOptionLike;
}

/**
 * Marks an `<ng-template>` projected into `ff-select` as the custom renderer
 * for each row of the options panel, replacing the default text label.
 *
 * @example
 * ```html
 * <ff-select [options]="users" bindLabel="name" bindValue="id">
 *   <ng-template ffSelectOptionTemplate let-user>
 *     <img [src]="user.avatarUrl" /> {{ user.name }}
 *   </ng-template>
 * </ff-select>
 * ```
 */
@Directive({ selector: '[ffSelectOptionTemplate]', standalone: true })
export class FfSelectOptionTemplateDirective {
  /** Template reference captured by `ff-select` and rendered per option via `NgTemplateOutlet`. */
  readonly templateRef = inject<TemplateRef<FfSelectTemplateContext>>(TemplateRef);
}

/**
 * Marks an `<ng-template>` projected into `ff-select` as the custom renderer
 * for the trigger's selected-value label (single-selection mode only).
 */
@Directive({ selector: '[ffSelectLabelTemplate]', standalone: true })
export class FfSelectLabelTemplateDirective {
  /** Template reference captured by `ff-select` and rendered for the selected option. */
  readonly templateRef = inject<TemplateRef<FfSelectTemplateContext>>(TemplateRef);
}

/**
 * Firefly select atom.
 *
 * Single- or multi-selection dropdown with optional search filtering, custom
 * option/label templates, and full keyboard navigation (ArrowUp/Down,
 * Home/End, typeahead, Enter, Escape). The options panel is portaled to the
 * document body through the CDK `Overlay` so it escapes any clipping
 * ancestor (a scroll container, a modal with `overflow: hidden`, …) and
 * repositions itself on scroll/resize, flipping above the trigger when there
 * is no room below.
 *
 * Also implements {@link ControlValueAccessor}, so it can be bound with
 * Reactive Forms (`[formControl]`, `formControlName`) or `[(ngModel)]`.
 * The `value`/`valueChange` (single) and `values`/`valuesChange` (multiple)
 * APIs keep working unchanged when no forms directive is attached.
 *
 * Focus never moves into the portaled panel: keyboard and DOM focus always
 * stay on the local trigger button (or the inline search input, when
 * `searchable`), and the active option is only announced through
 * `aria-activedescendant`. This is deliberate — a panel rendered outside the
 * component's own DOM subtree (e.g. inside a modal using `cdkTrapFocus`)
 * would otherwise let focus escape the trap the moment an option received
 * it; keeping focus local sidesteps the conflict entirely.
 *
 * @example
 * ```html
 * <ff-select
 *   placeholder="Choose a country"
 *   [options]="countries"
 *   [value]="selected"
 *   [searchable]="true"
 *   (valueChange)="selected = $event"
 * />
 *
 * <ff-select [options]="countries" [formControl]="countryControl" />
 *
 * <ff-select [options]="users" bindLabel="name" bindValue="id" multiple [values]="selectedIds" (valuesChange)="selectedIds = $event" />
 * ```
 */
@Component({
  selector: 'ff-select',
  standalone: true,
  imports: [NgTemplateOutlet, CdkConnectedOverlay, CdkOverlayOrigin],
  templateUrl: './ff-select.component.html',
  styleUrl: './ff-select.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => FfSelectComponent),
      multi: true,
    },
  ],
  host: {
    '[class]': '"ff-select"',
    '[class.ff-select--open]': 'open()',
    '[class.ff-select--disabled]': 'effectiveDisabled()',
  },
})
export class FfSelectComponent implements ControlValueAccessor, OnDestroy {
  /** @internal Sequence used to build a unique `panelId` per instance. */
  private static instanceCount = 0;

  private readonly overlay = inject(Overlay);

  /** Available options. Arbitrary objects are supported via `bindLabel`/`bindValue`. */
  readonly options = input<readonly FfSelectOptionLike[]>([]);

  /** Currently selected value (single-selection mode). */
  readonly value = input('');

  /** Selected values (multi-selection mode). Used when `multiple` is `true`. */
  readonly values = input<readonly string[]>([]);

  /** Placeholder text when nothing is selected. */
  readonly placeholder = input('');

  /** Disables the entire select. */
  readonly disabled = input(false);

  /** Enables search/filter of the options. */
  readonly searchable = input(false);

  /** Enables multi-selection: options render a checkbox and `values`/`valuesChange` drive the selection. */
  readonly multiple = input(false);

  /** Property read from each option to resolve its display label. */
  readonly bindLabel = input('label');

  /** Property read from each option to resolve its form value (coerced to `string`). */
  readonly bindValue = input('value');

  /** Emits the selected value string (single-selection mode). */
  readonly valueChange = output<string>();

  /** Emits the selected values (multi-selection mode). */
  readonly valuesChange = output<readonly string[]>();

  /** Custom option-row renderer, projected via `<ng-template ffSelectOptionTemplate let-option>`. */
  protected readonly optionTemplate = contentChild(FfSelectOptionTemplateDirective);

  /** Custom selected-label renderer, projected via `<ng-template ffSelectLabelTemplate let-option>`. */
  protected readonly labelTemplate = contentChild(FfSelectLabelTemplateDirective);

  /** @internal */
  protected readonly open = signal(false);

  /** @internal */
  protected readonly search = signal('');

  /** @internal Index of the keyboard-active option within `filteredOptions()`. */
  protected readonly activeIndex = signal(-1);

  /** @internal */
  protected readonly triggerButton = viewChild<ElementRef<HTMLButtonElement>>('triggerButton');

  /** @internal */
  protected readonly searchInput = viewChild<ElementRef<HTMLInputElement>>('searchInput');

  /** @internal Value written by the forms API via `writeValue` (single-selection mode). */
  private readonly cvaValue = signal<string | null>(null);

  /** @internal Values written by the forms API via `writeValue` (multi-selection mode). */
  private readonly cvaValues = signal<readonly string[] | null>(null);

  /** @internal Disabled state driven by the forms API via `setDisabledState`. */
  private readonly cvaDisabled = signal(false);

  /** @internal `true` once a forms directive attaches (first `registerOnChange`). */
  private readonly cvaAttached = signal(false);

  /** @internal Forms API change callback (noop until registered). */
  private onChangeFn: (value: string | readonly string[]) => void = () => undefined;

  /** @internal Forms API touched callback (noop until registered). */
  private onTouchedFn: () => void = () => undefined;

  /** @internal Pending typeahead buffer, cleared after a short pause between keystrokes. */
  private typeaheadBuffer = '';

  /** @internal Timer that clears the typeahead buffer. */
  private typeaheadTimer: ReturnType<typeof setTimeout> | undefined;

  /** Stable id of the portaled listbox panel; referenced by `aria-owns`/`aria-controls`/`aria-activedescendant`. */
  protected readonly panelId = `ff-select-panel-${FfSelectComponent.instanceCount++}`;

  /** Connected-overlay position list: below the trigger by default, flipping above when there is no room. */
  protected readonly positions: ConnectedPosition[] = [
    { originX: 'start', originY: 'bottom', overlayX: 'start', overlayY: 'top', offsetY: 4 },
    { originX: 'start', originY: 'top', overlayX: 'start', overlayY: 'bottom', offsetY: -4 },
  ];

  /** Repositions the panel on scroll/resize instead of closing it. */
  protected readonly scrollStrategy = this.overlay.scrollStrategies.reposition();

  /**
   * Effective selected value rendered by the template (single-selection mode).
   *
   * Precedence: once a forms directive is attached (Reactive Forms or
   * `ngModel`), the ControlValueAccessor value wins; otherwise the
   * `value` input is used, keeping the classic API fully functional.
   */
  protected readonly effectiveValue = computed(() =>
    this.cvaAttached() ? (this.cvaValue() ?? '') : this.value()
  );

  /** Effective selected values rendered by the template (multi-selection mode). Same CVA-over-input precedence as `effectiveValue`. */
  protected readonly effectiveValues = computed<readonly string[]>(() =>
    this.cvaAttached() ? (this.cvaValues() ?? []) : this.values()
  );

  /** Effective disabled state: `disabled` input OR forms API disabled state. */
  protected readonly effectiveDisabled = computed(
    () => this.disabled() || this.cvaDisabled()
  );

  /** The selected option object (single-selection mode), or `null` when nothing matches. */
  protected readonly selectedOption = computed<FfSelectOptionLike | null>(() => {
    const val = this.effectiveValue();
    return this.options().find((o) => this.optionValue(o) === val) ?? null;
  });

  /** The selected option objects (multi-selection mode). */
  protected readonly selectedOptions = computed<readonly FfSelectOptionLike[]>(() => {
    const vals = this.effectiveValues();
    return this.options().filter((o) => vals.includes(this.optionValue(o)));
  });

  /** Resolved display label for the current value(s); comma-joined in multi-selection mode. */
  protected readonly displayLabel = computed(() => {
    if (this.multiple()) {
      return this.selectedOptions()
        .map((o) => this.optionLabel(o))
        .join(', ');
    }
    const opt = this.selectedOption();
    return opt ? this.optionLabel(opt) : '';
  });

  /** Filtered options based on the search term, matched against the resolved label. */
  protected readonly filteredOptions = computed(() => {
    const term = this.search().toLowerCase();
    if (!term) return this.options();
    return this.options().filter((o) => this.optionLabel(o).toLowerCase().includes(term));
  });

  /** `id` of the keyboard-active option, or `null`; drives `aria-activedescendant`. */
  protected readonly activeOptionId = computed(() => {
    const idx = this.activeIndex();
    return idx >= 0 ? this.optionDomId(idx) : null;
  });

  /** @internal Resolves an option's form value through `bindValue`, coerced to `string`. */
  protected optionValue(option: FfSelectOptionLike): string {
    return String(option[this.bindValue()] ?? '');
  }

  /** @internal Resolves an option's display label through `bindLabel`, coerced to `string`. */
  protected optionLabel(option: FfSelectOptionLike): string {
    return String(option[this.bindLabel()] ?? '');
  }

  /** @internal */
  protected isOptionDisabled(option: FfSelectOptionLike): boolean {
    return !!option['disabled'];
  }

  /** @internal Whether `option` is part of the current selection (single or multi). */
  protected isOptionSelected(option: FfSelectOptionLike): boolean {
    const val = this.optionValue(option);
    return this.multiple() ? this.effectiveValues().includes(val) : this.effectiveValue() === val;
  }

  /** @internal DOM id of the option at `index`, unique within this instance's panel. */
  protected optionDomId(index: number): string {
    return `${this.panelId}-option-${index}`;
  }

  /** @internal */
  protected toggle(): void {
    if (this.effectiveDisabled()) return;
    if (this.open()) {
      this.close();
    } else {
      this.openDropdown();
    }
  }

  /** @internal */
  protected openDropdown(): void {
    this.open.set(true);
    this.search.set('');
    this.activeIndex.set(-1);
    if (this.searchable()) {
      setTimeout(() => this.searchInput()?.nativeElement.focus());
    }
  }

  /**
   * @internal Closes the dropdown, marking the control as touched and
   * returning focus to the trigger button — focus never lingers on a
   * portaled element.
   */
  protected close(): void {
    if (this.open()) {
      this.onTouchedFn();
    }
    this.open.set(false);
    this.search.set('');
    this.activeIndex.set(-1);
    setTimeout(() => this.triggerButton()?.nativeElement.focus());
  }

  /** @internal Selects (single mode) or toggles (multi mode) `option`; no-ops for disabled options. */
  protected selectOption(option: FfSelectOptionLike): void {
    if (this.isOptionDisabled(option)) return;
    const val = this.optionValue(option);

    if (this.multiple()) {
      const current = this.effectiveValues();
      const next = current.includes(val)
        ? current.filter((v) => v !== val)
        : [...current, val];
      if (this.cvaAttached()) {
        this.cvaValues.set(next);
      }
      this.valuesChange.emit(next);
      this.onChangeFn(next);
      return;
    }

    if (this.cvaAttached()) {
      this.cvaValue.set(val);
    }
    this.valueChange.emit(val);
    this.onChangeFn(val);
    this.close();
  }

  /** @internal */
  protected onSearchInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.search.set(value);
    this.activeIndex.set(-1);
  }

  /** @internal Prevents an option's `mousedown` from stealing focus away from the trigger/search input. */
  protected onOptionMouseDown(event: MouseEvent): void {
    event.preventDefault();
  }

  /** @internal Closes the dropdown when the CDK overlay reports a pointer event outside the trigger/panel. */
  protected onOverlayOutsideClick(): void {
    this.close();
  }

  /** @internal Full keyboard contract: ArrowUp/Down, Home/End, typeahead, Enter/Space, Escape. */
  protected onKeydown(event: KeyboardEvent): void {
    if (this.effectiveDisabled()) return;
    const opts = this.filteredOptions();

    if (!this.open()) {
      if (event.key === 'ArrowDown' || event.key === 'ArrowUp' || event.key === 'Enter') {
        event.preventDefault();
        this.openDropdown();
        return;
      }
      if (!this.searchable() && this.isPrintableChar(event)) {
        event.preventDefault();
        this.openDropdown();
        this.typeahead(event.key);
      }
      return;
    }

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this.moveActive(1, opts.length);
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.moveActive(-1, opts.length);
        break;
      case 'Home':
        event.preventDefault();
        if (opts.length > 0) this.activeIndex.set(0);
        break;
      case 'End':
        event.preventDefault();
        if (opts.length > 0) this.activeIndex.set(opts.length - 1);
        break;
      case 'Enter': {
        event.preventDefault();
        const idx = this.activeIndex();
        if (idx >= 0 && idx < opts.length) {
          this.selectOption(opts[idx]);
        }
        break;
      }
      case ' ': {
        if (this.searchable()) break;
        event.preventDefault();
        const idx = this.activeIndex();
        if (idx >= 0 && idx < opts.length) {
          this.selectOption(opts[idx]);
        }
        break;
      }
      case 'Escape':
        event.preventDefault();
        this.close();
        break;
      default:
        if (!this.searchable() && this.isPrintableChar(event)) {
          this.typeahead(event.key);
        }
    }
  }

  /** @internal Clamped active-index move (no wraparound), matching a native `<select>`. */
  private moveActive(delta: number, length: number): void {
    const next = Math.min(Math.max(this.activeIndex() + delta, 0), length - 1);
    this.activeIndex.set(next);
  }

  /** @internal Appends `char` to the typeahead buffer and jumps to the first matching option. */
  private typeahead(char: string): void {
    clearTimeout(this.typeaheadTimer);
    this.typeaheadBuffer += char.toLowerCase();
    const buffer = this.typeaheadBuffer;
    const idx = this.filteredOptions().findIndex((o) =>
      this.optionLabel(o).toLowerCase().startsWith(buffer)
    );
    if (idx >= 0) {
      this.activeIndex.set(idx);
    }
    this.typeaheadTimer = setTimeout(() => {
      this.typeaheadBuffer = '';
    }, 500);
  }

  /** @internal Whether `event.key` is a single printable character (no modifier). */
  private isPrintableChar(event: KeyboardEvent): boolean {
    return event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey;
  }

  /** Writes a new value from the forms API. Does not emit `valueChange`/`valuesChange`. */
  writeValue(value: string | readonly string[] | null): void {
    if (this.multiple()) {
      this.cvaValues.set(Array.isArray(value) ? [...value] : []);
    } else {
      this.cvaValue.set(typeof value === 'string' ? value : null);
    }
  }

  /** Registers the forms API change callback and marks the CVA as attached. */
  registerOnChange(fn: (value: string | readonly string[]) => void): void {
    this.cvaAttached.set(true);
    this.onChangeFn = fn;
  }

  /** Registers the forms API touched callback. */
  registerOnTouched(fn: () => void): void {
    this.onTouchedFn = fn;
  }

  /** Sets the disabled state from the forms API (`control.disable()`). */
  setDisabledState(isDisabled: boolean): void {
    this.cvaDisabled.set(isDisabled);
  }

  ngOnDestroy(): void {
    clearTimeout(this.typeaheadTimer);
    // Reset dropdown state directly (not via `close()`) to avoid marking
    // the attached control as touched during teardown.
    this.open.set(false);
    this.search.set('');
    this.activeIndex.set(-1);
  }
}
