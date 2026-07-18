import type { DsComponentContract } from '../contract.types';

/**
 * Contract of the `ff-link` primitive.
 *
 * Styled anchor with inline and standalone variants. Link text is projected
 * through the default slot. When `target` is `'_blank'` the implementation
 * adds `rel="noopener noreferrer"`. When disabled, navigation is prevented
 * and `clicked` is not emitted.
 */
export const LinkContract: DsComponentContract = {
  selector: 'ff-link',
  category: 'primitive',
  inputs: {
    href: { type: 'string', required: false, default: "''" },
    target: { type: "'_self' | '_blank'", required: false, default: "'_self'" },
    variant: {
      type: "'inline' | 'standalone'",
      required: false,
      default: "'inline'",
    },
    disabled: { type: 'boolean', required: false, default: 'false' },
    underline: { type: 'boolean', required: false, default: 'true' },
  },
  outputs: {
    clicked: { type: 'void' },
  },
  behavior: {
    contentSlots: ['default'],
    hostAttributeOwnership: ['class'],
  },
};
