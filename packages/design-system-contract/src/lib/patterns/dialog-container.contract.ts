import type { DsComponentContract } from '../contract.types';

/**
 * Contract of the `ff-dialog-container` pattern.
 *
 * Purely presentational modal overlay: renders the TOPMOST (last) of the
 * given dialog items as a `role="dialog"` panel (earlier items stay under
 * the backdrop until the top one resolves) and composes `ff-button`,
 * `ff-input` and `ff-icon` primitives (pattern tier — primitives only). It
 * deliberately does NOT compose the `ff-dialog` primitive: that atom owns a
 * declarative single-dialog API (`open`/`closed`, projected content slots,
 * its own backdrop/Escape/close-button handling) that cannot host a
 * data-driven dialog LIST with per-item resolution ids, a typed
 * destructive gate, `NgComponentOutlet` hosting and a CDK focus trap around
 * the panel — forcing it would mean fighting its projection model and
 * stacking one fixed backdrop per instance.
 *
 * The container owns no state beyond the destructive-gate text: an external
 * orchestrator (e.g. a headless alert service) supplies the items and reacts
 * to `resolved` (`{ id, confirmed, input? }` — structurally forwardable to
 * `resolveDialog(id, { confirmed, input })`).
 *
 * The `type` field is structural (`string`): `success`/`error`/`warning`/
 * `info` map to the matching panel accent, `destructive` maps to `error`
 * and any other value renders without an accent.
 */
export const DialogContainerContract: DsComponentContract = {
  selector: 'ff-dialog-container',
  category: 'pattern',
  composes: ['ff-button', 'ff-input', 'ff-icon'],
  inputs: {
    dialogs: {
      type: "readonly { id: string; options: { title?: string; message?: string; type: string; confirmLabel?: string; cancelLabel?: string; destructiveConfirmText?: string; icon?: string; component?: unknown; componentData?: Record<string, unknown> } }[]",
      required: true,
    },
  },
  outputs: {
    resolved: { type: '{ id: string; confirmed: boolean; input?: string }' },
  },
  behavior: {
    hostAttributeOwnership: ['class'],
    keyboard: [
      'Escape resolves the top dialog with { confirmed: false }',
      'focus is trapped inside the panel (CDK CdkTrapFocus with auto-capture) while a dialog is open',
    ],
    aria: [
      'panel has role="dialog" and aria-modal="true"',
      'panel is labelled by its title via aria-labelledby and described by its message via aria-describedby',
      'backdrop click resolves the top dialog with { confirmed: false }',
      'confirm button stays disabled until the typed text matches destructiveConfirmText exactly; the typed text is emitted as input on confirm',
      'options.component is hosted INSIDE the panel via NgComponentOutlet (componentData as inputs); the container never re-parents or adopts a consumer-owned host element',
      'the element focused before the first dialog appeared is re-focused once the last dialog resolves',
      "confirm button label defaults to 'Confirm'; the cancel button renders only when cancelLabel is set",
    ],
  },
};
