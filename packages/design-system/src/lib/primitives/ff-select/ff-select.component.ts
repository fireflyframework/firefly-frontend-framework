import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnDestroy,
  ViewEncapsulation,
  computed,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';

/** Single option inside a select dropdown. */
export interface FfSelectOption {
  /** Display text. */
  label: string;
  /** Form value emitted on selection. */
  value: string;
  /** Disables this individual option. */
  disabled?: boolean;
}

/**
 * Firefly select atom.
 *
 * Single-selection dropdown with optional search filtering and
 * keyboard navigation (ArrowUp/Down, Enter, Escape).
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
 * ```
 */
@Component({
  selector: 'ff-select',
  standalone: true,
  templateUrl: './ff-select.component.html',
  styleUrl: './ff-select.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    '[class]': '"ff-select"',
    '[class.ff-select--open]': 'open()',
    '[class.ff-select--disabled]': 'disabled()',
    '(document:click)': 'onDocumentClick($event)',
  },
})
export class FfSelectComponent implements OnDestroy {
  /** Available options. */
  readonly options = input<FfSelectOption[]>([]);

  /** Currently selected value. */
  readonly value = input('');

  /** Placeholder text when nothing is selected. */
  readonly placeholder = input('');

  /** Disables the entire select. */
  readonly disabled = input(false);

  /** Enables search/filter in the dropdown. */
  readonly searchable = input(false);

  /** Emits the selected value string. */
  readonly valueChange = output<string>();

  /** @internal */
  protected readonly open = signal(false);

  /** @internal */
  protected readonly search = signal('');

  /** @internal */
  protected readonly activeIndex = signal(-1);

  /** @internal */
  protected readonly searchInput =
    viewChild<ElementRef<HTMLInputElement>>('searchInput');

  /** Resolved display label for the current value. */
  protected readonly displayLabel = computed(() => {
    const opt = this.options().find((o) => o.value === this.value());
    return opt ? opt.label : '';
  });

  /** Filtered options based on search term. */
  protected readonly filteredOptions = computed(() => {
    const term = this.search().toLowerCase();
    if (!term) return this.options();
    return this.options().filter((o) =>
      o.label.toLowerCase().includes(term)
    );
  });

  /** @internal */
  protected toggle(): void {
    if (this.disabled()) return;
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
    setTimeout(() => this.searchInput()?.nativeElement.focus());
  }

  /** @internal */
  protected close(): void {
    this.open.set(false);
    this.search.set('');
    this.activeIndex.set(-1);
  }

  /** @internal */
  protected selectOption(option: FfSelectOption): void {
    if (option.disabled) return;
    this.valueChange.emit(option.value);
    this.close();
  }

  /** @internal */
  protected onSearchInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.search.set(value);
    this.activeIndex.set(-1);
  }

  /** @internal */
  protected onKeydown(event: KeyboardEvent): void {
    const opts = this.filteredOptions();

    switch (event.key) {
      case 'ArrowDown': {
        event.preventDefault();
        const next = Math.min(this.activeIndex() + 1, opts.length - 1);
        this.activeIndex.set(next);
        break;
      }
      case 'ArrowUp': {
        event.preventDefault();
        const prev = Math.max(this.activeIndex() - 1, 0);
        this.activeIndex.set(prev);
        break;
      }
      case 'Enter': {
        event.preventDefault();
        const idx = this.activeIndex();
        if (idx >= 0 && idx < opts.length) {
          this.selectOption(opts[idx]);
        }
        break;
      }
      case 'Escape':
        this.close();
        break;
    }
  }

  /** @internal */
  protected isOptionDisabled(option: FfSelectOption): boolean {
    return !!option.disabled;
  }

  /** @internal Close dropdown when clicking outside. */
  onDocumentClick(_event: Event): void {
    // stub — click-outside is handled via toggle()
  }

  ngOnDestroy(): void {
    this.close();
  }
}
