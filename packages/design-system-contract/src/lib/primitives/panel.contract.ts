import type { DsComponentContract } from '../contract.types';

/**
 * Contract of the `ff-panel` primitive.
 *
 * Container/callout with `card` (bordered surface) and `alert` (accented
 * callout) appearances and semantic color variants. Structure is header →
 * body → footer: the header renders the `heading` input plus the
 * `[ff-panel-heading]` and `[ff-panel-actions]` slots, the body renders the
 * default slot and the footer renders `[ff-panel-footer]`. Unused zones
 * collapse and occupy no space. The primitive does not force any ARIA role;
 * consumers add `role="alert"`/`role="status"` for dynamic alert content.
 */
export const PanelContract: DsComponentContract = {
  selector: 'ff-panel',
  category: 'primitive',
  inputs: {
    appearance: { type: "'card' | 'alert'", required: false, default: "'card'" },
    variant: {
      type: "'neutral' | 'primary' | 'success' | 'warning' | 'danger' | 'info'",
      required: false,
      default: "'neutral'",
    },
    heading: {
      type: 'string | undefined',
      required: false,
      default: 'undefined',
    },
    fill: { type: 'boolean', required: false, default: 'false' },
  },
  outputs: {},
  behavior: {
    contentSlots: [
      '[ff-panel-heading]',
      '[ff-panel-actions]',
      'default',
      '[ff-panel-footer]',
    ],
    hostAttributeOwnership: ['class'],
    aria: [
      'no ARIA role is forced; consumers add role="alert"/"status" for dynamic alerts',
    ],
  },
};
