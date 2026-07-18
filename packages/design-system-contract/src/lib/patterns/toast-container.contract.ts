import type { DsComponentContract } from '../contract.types';

/**
 * Contract of the `ff-toast-container` pattern.
 *
 * Purely presentational toast overlay: renders the given toast items as
 * `ff-toast` primitives (pattern tier — primitives only) inside six fixed,
 * always-present screen regions. It owns no state and no timers — an
 * external orchestrator (e.g. a headless alert service) supplies the items
 * and reacts to the outputs: `dismissed` removes a toast, and
 * `hoverStarted`/`hoverEnded` let the orchestrator pause/resume its
 * auto-dismiss timer while the pointer is over the toast.
 *
 * The `type` field is structural (`string`): `success`/`error`/`warning`/
 * `info` map to the matching `ff-toast` variant, `destructive` maps to
 * `error` and any other value falls back to `info`. Unknown or missing
 * `options.position` values render in the `top-right` region.
 */
export const ToastContainerContract: DsComponentContract = {
  selector: 'ff-toast-container',
  category: 'pattern',
  composes: ['ff-toast'],
  inputs: {
    toasts: {
      type: "readonly { id: string; message: string; type: string; options?: { duration?: number; position?: string; dismissible?: boolean; progressBar?: boolean } }[]",
      required: true,
    },
  },
  outputs: {
    dismissed: { type: 'string' },
    hoverStarted: { type: 'string' },
    hoverEnded: { type: 'string' },
  },
  behavior: {
    hostAttributeOwnership: ['class'],
    aria: [
      'all six position regions exist upfront with aria-live="polite"',
      'error (and destructive) toasts are wrapped in role="alert"',
      'hoverStarted/hoverEnded emit the toast id so the orchestrator can pause/resume auto-dismiss while hovered (the CSS progress bar pauses visually)',
    ],
  },
};
