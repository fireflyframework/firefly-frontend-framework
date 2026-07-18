import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  ViewEncapsulation,
  computed,
  forwardRef,
  input,
  output,
  signal,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

/** Allowed input types. Includes `'textarea'` for multiline input. */
export type FfInputType = 'text' | 'number' | 'password' | 'search' | 'textarea';

/**
 * Label rendering modes.
 *
 * - `'default'` — label rendered above the field.
 * - `'floating'` — label floats over the field's top border (BEM modifier).
 * - `'hidden'` — no visible label; the text is exposed as `aria-label`.
 */
export type FfInputLabelType = 'default' | 'floating' | 'hidden';

/**
 * Firefly input atom.
 *
 * Form input with label, hint text, and error message.
 * Emits value changes via the `valueChange` output.
 *
 * Also implements {@link ControlValueAccessor}, so it can be bound with
 * Reactive Forms (`[formControl]`, `formControlName`) or `[(ngModel)]`.
 * The `value` / `valueChange` API keeps working unchanged when no forms
 * directive is attached.
 *
 * Prefix/suffix affixes are projected into the field wrapper via the
 * `[ff-input-prefix]` and `[ff-input-suffix]` content slots; empty slots
 * collapse via CSS `:empty`. The primitive does not compose other
 * design-system components — consumers project e.g. an `ff-icon` themselves.
 *
 * When `debounceTime > 0`, `valueChange` and the forms callback are emitted
 * after the given quiet period; blur always flushes the pending value
 * immediately. `search` emits on Enter and, for `type="search"`, whenever the
 * debounce settles.
 *
 * @example
 * ```html
 * <ff-input
 *   label="Email"
 *   placeholder="you@example.com"
 *   [value]="email"
 *   (valueChange)="email = $event"
 * />
 *
 * <ff-input label="Password" type="password" error="Required" />
 *
 * <ff-input label="Notes" type="textarea" [rows]="5" />
 *
 * <ff-input label="Email" [formControl]="emailControl" />
 *
 * <ff-input label="Search" type="search" labelType="hidden" [debounceTime]="300" (search)="find($event)">
 *   <ff-icon ff-input-prefix name="search" />
 * </ff-input>
 * ```
 */
@Component({
  selector: 'ff-input',
  standalone: true,
  templateUrl: './ff-input.component.html',
  styleUrl: './ff-input.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => FfInputComponent),
      multi: true,
    },
  ],
  host: {
    '[class]': '"ff-input"',
    '[class.ff-input--disabled]': 'effectiveDisabled()',
    '[class.ff-input--error]': '!!error()',
    '[class.ff-input--label-floating]': "labelType() === 'floating'",
  },
})
export class FfInputComponent implements ControlValueAccessor, OnDestroy {
  /** Native input type. Defaults to `'text'`. */
  readonly type = input<FfInputType>('text');

  /** Placeholder text shown when the input is empty. */
  readonly placeholder = input('');

  /** Current value of the input. */
  readonly value = input('');

  /** When `true`, the input is visually dimmed and non-interactive. */
  readonly disabled = input(false);

  /** Error message displayed below the input. Triggers error styling when non-empty. */
  readonly error = input('');

  /** Hint text displayed below the input (hidden when error is present). */
  readonly hint = input('');

  /** Label text displayed above the input. */
  readonly label = input('');

  /** Number of visible text rows. Only applies when `type` is `'textarea'`. Defaults to `3`. */
  readonly rows = input(3);

  /**
   * Quiet period in milliseconds before `valueChange` and the forms callback
   * are emitted. `0` (default) emits synchronously on every input event.
   * Blur always flushes the pending value immediately.
   */
  readonly debounceTime = input(0);

  /** How the label is rendered. Defaults to `'default'` (above the field). */
  readonly labelType = input<FfInputLabelType>('default');

  /** Emits the new value on every input event (debounced when `debounceTime > 0`). */
  readonly valueChange = output<string>();

  /** Emits when the input loses focus. Useful for marking form controls as touched. */
  readonly blurred = output<void>();

  /**
   * Emits the current value on Enter and, when `type` is `'search'` and
   * `debounceTime > 0`, whenever the debounce settles.
   *
   * The name is mandated by the `ff-input` contract; its semantics
   * intentionally differ from the native DOM `search` event.
   */
  // eslint-disable-next-line @angular-eslint/no-output-native
  readonly search = output<string>();

  /** @internal Unique id for label-input association. */
  protected readonly inputId = `ff-input-${nextId++}`;

  /** @internal Value written by the forms API via `writeValue`. */
  private readonly cvaValue = signal<string | null>(null);

  /** @internal Disabled state driven by the forms API via `setDisabledState`. */
  private readonly cvaDisabled = signal(false);

  /** @internal `true` once a forms directive attaches (first `registerOnChange`). */
  private readonly cvaAttached = signal(false);

  /** @internal Forms API change callback (noop until registered). */
  private onChangeFn: (value: string) => void = () => undefined;

  /** @internal Forms API touched callback (noop until registered). */
  private onTouchedFn: () => void = () => undefined;

  /** @internal Pending debounce timer id (`null` when idle). */
  private debounceTimer: ReturnType<typeof setTimeout> | null = null;

  /** @internal Value awaiting a debounced emission (`null` when none). */
  private pendingValue: string | null = null;

  /**
   * Effective value rendered by the template.
   *
   * Precedence: once a forms directive is attached (Reactive Forms or
   * `ngModel`), the ControlValueAccessor value wins; otherwise the
   * `value` input is used, keeping the classic API fully functional.
   */
  protected readonly effectiveValue = computed(() =>
    this.cvaAttached() ? (this.cvaValue() ?? '') : this.value()
  );

  /** Effective disabled state: `disabled` input OR forms API disabled state. */
  protected readonly effectiveDisabled = computed(
    () => this.disabled() || this.cvaDisabled()
  );

  /** @internal `aria-label` for the native control when the label is hidden. */
  protected readonly effectiveAriaLabel = computed(() =>
    this.labelType() === 'hidden' && this.label() ? this.label() : null
  );

  /** @internal Forwards native input events (debounced when `debounceTime > 0`). */
  onInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    if (this.cvaAttached()) {
      this.cvaValue.set(value);
    }
    const wait = this.debounceTime();
    if (wait > 0) {
      this.pendingValue = value;
      if (this.debounceTimer !== null) {
        clearTimeout(this.debounceTimer);
      }
      this.debounceTimer = setTimeout(() => this.settleDebounce(), wait);
      return;
    }
    this.emitValue(value);
  }

  /** @internal Forwards native blur events, flushing any pending debounced value. */
  onBlur(): void {
    this.flushDebounce();
    this.blurred.emit();
    this.onTouchedFn();
  }

  /** @internal Emits `search` on Enter, flushing any pending debounced value first. */
  onEnter(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.flushDebounce();
    this.search.emit(value);
  }

  /** Writes a new value from the forms API. Does not emit `valueChange`. */
  writeValue(value: string | null): void {
    this.cvaValue.set(value);
  }

  /** Registers the forms API change callback and marks the CVA as attached. */
  registerOnChange(fn: (value: string) => void): void {
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

  /** @internal Cancels any pending debounce timer on destroy. */
  ngOnDestroy(): void {
    if (this.debounceTimer !== null) {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = null;
    }
  }

  /** @internal Emits the value through the classic output and the forms callback. */
  private emitValue(value: string): void {
    this.valueChange.emit(value);
    this.onChangeFn(value);
  }

  /** @internal Emits the pending value when the debounce quiet period elapses. */
  private settleDebounce(): void {
    this.debounceTimer = null;
    if (this.pendingValue === null) {
      return;
    }
    const value = this.pendingValue;
    this.pendingValue = null;
    this.emitValue(value);
    if (this.type() === 'search') {
      this.search.emit(value);
    }
  }

  /** @internal Cancels the debounce timer and emits the pending value immediately. */
  private flushDebounce(): void {
    if (this.debounceTimer !== null) {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = null;
    }
    if (this.pendingValue !== null) {
      const value = this.pendingValue;
      this.pendingValue = null;
      this.emitValue(value);
    }
  }
}

let nextId = 0;
