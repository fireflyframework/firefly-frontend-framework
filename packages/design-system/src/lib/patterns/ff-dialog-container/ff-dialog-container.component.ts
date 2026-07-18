import { NgComponentOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  ViewEncapsulation,
  computed,
  effect,
  inject,
  input,
  linkedSignal,
  output,
} from '@angular/core';
import type { Type } from '@angular/core';
import { CdkTrapFocus } from '@angular/cdk/a11y';

import { FfButtonComponent } from '../../primitives/ff-button';
import { FfIconComponent } from '../../primitives/ff-icon';
import { FfInputComponent } from '../../primitives/ff-input';

/**
 * Structural (duck-typed) shape of one dialog rendered by
 * `ff-dialog-container`.
 *
 * Deliberately local to the design system — the DS never imports
 * `@fireflyframework/core`. The `Dialog` entries exposed by core's headless
 * `AlertService` (`alerts.activeDialogs()`) match this interface
 * structurally, so they can be bound directly without any adapter.
 */
export interface FfDialogItem {
  /** Stable identifier, emitted back through the `resolved` output. */
  readonly id: string;
  /** Dialog configuration; unset fields use the documented defaults. */
  readonly options: {
    /** Heading rendered in the panel header (referenced by `aria-labelledby`). */
    readonly title?: string;
    /** Body copy rendered under the header. */
    readonly message?: string;
    /**
     * Semantic type. `'success' | 'error' | 'warning' | 'info'` map to the
     * matching panel accent, `'destructive'` maps to the `'error'` accent and
     * any other value (e.g. `'custom'`) renders without an accent (core's
     * `AlertType` fits structurally).
     */
    readonly type: string;
    /** Confirm button label. Default `'Confirm'`. */
    readonly confirmLabel?: string;
    /** Cancel button label. If omitted only the confirm button is shown. */
    readonly cancelLabel?: string;
    /**
     * Text the user must type (exact match) before the confirm button
     * enables. Renders an `ff-input` gate inside the panel.
     */
    readonly destructiveConfirmText?: string;
    /** Optional icon name (resolved via `provideFfIcons`) shown next to the title. */
    readonly icon?: string;
    /**
     * Custom Angular component hosted inside the panel via
     * `NgComponentOutlet` instead of the default title/message/buttons
     * layout. Typed `unknown` to stay structural; must be a `Type<unknown>`.
     */
    readonly component?: unknown;
    /** Inputs passed to `component` through `ngComponentOutletInputs`. */
    readonly componentData?: Record<string, unknown>;
  };
}

/**
 * Outcome of one dialog, emitted through `resolved`. Structurally compatible
 * with core's `DialogResult` (plus the originating `id`), so the application
 * layer can forward it directly:
 * `alerts.resolveDialog(event.id, { confirmed: event.confirmed, input: event.input })`.
 */
export interface FfDialogResolution {
  /** Identifier of the dialog being resolved. */
  readonly id: string;
  /** `true` when the user confirmed, `false` on cancel/backdrop/Escape. */
  readonly confirmed: boolean;
  /** Text typed into the destructive gate, when one was rendered. */
  readonly input?: string;
}

/** Panel accents backed by `ff-dialog-container__panel--*` modifiers. */
type DialogAccent = 'success' | 'error' | 'warning' | 'info';

/**
 * Firefly dialog container pattern.
 *
 * Purely presentational modal overlay: renders the TOPMOST (last) of the
 * given {@link FfDialogItem} entries as a modal panel — earlier entries stay
 * conceptually under the backdrop until the top one resolves (simple visual
 * stack). The container owns NO state beyond the destructive-gate text: the
 * dialog queue and the Promise plumbing live in an orchestrator such as
 * core's headless `AlertService`. The application layer places the container
 * once in its shell and wires `resolved` back to the service:
 *
 * @example
 * ```html
 * <!-- app shell; AlertService from @fireflyframework/core -->
 * <ff-dialog-container
 *   [dialogs]="alerts.activeDialogs()"
 *   (resolved)="alerts.resolveDialog($event.id, { confirmed: $event.confirmed, input: $event.input })"
 * />
 * ```
 *
 * Behavior guarantees:
 * - Panel is `role="dialog"` `aria-modal="true"`, labelled by its title via
 *   `aria-labelledby` (and described by its message via `aria-describedby`).
 * - Focus is trapped inside the panel with the CDK `CdkTrapFocus` directive
 *   (`cdkTrapFocusAutoCapture`); the element focused before the first dialog
 *   appeared is saved and re-focused once the last dialog resolves.
 * - Escape and backdrop click resolve the top dialog with
 *   `{ confirmed: false }`.
 * - When `options.destructiveConfirmText` is set, an `ff-input` gate keeps
 *   the confirm button disabled until the typed text matches exactly; the
 *   typed text is emitted as `input` on confirm.
 * - When `options.component` is set it is hosted via `NgComponentOutlet`
 *   (with `componentData` as inputs) INSIDE the container's own panel: the
 *   container never re-parents or adopts the consumer's host element — a
 *   deliberate contract clause (unlike hub's modal service, no DOM node
 *   supplied by the consumer is moved into the overlay).
 */
@Component({
  selector: 'ff-dialog-container',
  standalone: true,
  imports: [
    NgComponentOutlet,
    CdkTrapFocus,
    FfButtonComponent,
    FfIconComponent,
    FfInputComponent,
  ],
  templateUrl: './ff-dialog-container.component.html',
  styleUrl: './ff-dialog-container.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    class: 'ff-dialog-container',
  },
})
export class FfDialogContainerComponent {
  /** Active dialogs, oldest first (e.g. `alerts.activeDialogs()`). Only the last is visible. */
  readonly dialogs = input.required<readonly FfDialogItem[]>();

  /** Emits the outcome of the top dialog (confirm, cancel, backdrop or Escape). */
  readonly resolved = output<FfDialogResolution>();

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  /** Topmost (visible) dialog, or `null` when the stack is empty. */
  protected readonly top = computed<FfDialogItem | null>(() => {
    const dialogs = this.dialogs();
    return dialogs.length > 0 ? dialogs[dialogs.length - 1] : null;
  });

  /** Panel accent for the top dialog (`destructive` → `error`; unknown → none). */
  protected readonly accent = computed<DialogAccent | null>(() => {
    switch (this.top()?.options.type) {
      case 'success':
      case 'error':
      case 'warning':
      case 'info':
        return this.top()?.options.type as DialogAccent;
      case 'destructive':
        return 'error';
      default:
        return null;
    }
  });

  /** Custom component hosted in the panel, when the top dialog declares one. */
  protected readonly hostedComponent = computed<Type<unknown> | null>(
    () => (this.top()?.options.component ?? null) as Type<unknown> | null
  );

  /** Inputs forwarded to the hosted component via `ngComponentOutletInputs`. */
  protected readonly hostedInputs = computed<Record<string, unknown>>(
    () => this.top()?.options.componentData ?? {}
  );

  /** Destructive-gate text typed so far; resets whenever the top dialog changes. */
  protected readonly typed = linkedSignal<FfDialogItem | null, string>({
    source: this.top,
    computation: () => '',
  });

  /** `true` while the destructive gate text does not match exactly. */
  protected readonly confirmDisabled = computed(() => {
    const gate = this.top()?.options.destructiveConfirmText;
    return gate !== undefined && this.typed() !== gate;
  });

  /** Element focused before the first dialog appeared, restored at close. */
  private previouslyFocused: Element | null = null;

  /** Whether the previous effect run had at least one active dialog. */
  private wasOpen = false;

  constructor() {
    effect(() => {
      const open = this.dialogs().length > 0;
      if (open && !this.wasOpen) {
        const active = document.activeElement;
        this.previouslyFocused =
          active !== null && !this.host.nativeElement.contains(active) ? active : null;
      } else if (!open && this.wasOpen) {
        const previous = this.previouslyFocused;
        this.previouslyFocused = null;
        if (previous instanceof HTMLElement && previous.isConnected) {
          previous.focus();
        }
      }
      this.wasOpen = open;
    });
  }

  /** @internal id of the title element, referenced by `aria-labelledby`. */
  protected titleId(id: string): string {
    return `ff-dialog-container-title-${id}`;
  }

  /** @internal id of the message element, referenced by `aria-describedby`. */
  protected messageId(id: string): string {
    return `ff-dialog-container-message-${id}`;
  }

  /** @internal Resolves the top dialog as cancelled (cancel/backdrop/Escape). */
  protected cancel(id: string): void {
    this.resolved.emit({ id, confirmed: false });
  }

  /** @internal Resolves the top dialog as confirmed (with the gate text, if any). */
  protected confirm(dialog: FfDialogItem): void {
    this.resolved.emit(
      dialog.options.destructiveConfirmText !== undefined
        ? { id: dialog.id, confirmed: true, input: this.typed() }
        : { id: dialog.id, confirmed: true }
    );
  }
}
