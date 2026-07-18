import type { DsComponentContract } from '../contract.types';

/**
 * Contract of the `ff-select` primitive.
 *
 * Single-selection dropdown with optional search filtering and keyboard
 * navigation. Works standalone via `value`/`valueChange` and also as a
 * forms control (ControlValueAccessor) with Reactive Forms or `ngModel`.
 */
export const SelectContract: DsComponentContract = {
  selector: 'ff-select',
  category: 'primitive',
  inputs: {
    options: {
      type: '{ label: string; value: string; disabled?: boolean }[]',
      required: false,
      default: '[]',
    },
    value: { type: 'string', required: false, default: "''" },
    placeholder: { type: 'string', required: false, default: "''" },
    disabled: { type: 'boolean', required: false, default: 'false' },
    searchable: { type: 'boolean', required: false, default: 'false' },
  },
  outputs: {
    valueChange: { type: 'string' },
  },
  behavior: {
    hostAttributeOwnership: ['class'],
    keyboard: [
      'ArrowDown moves the active option down',
      'ArrowUp moves the active option up',
      'Enter selects the active option',
      'Escape closes the dropdown',
    ],
    aria: [
      'trigger exposes aria-haspopup="listbox" and aria-expanded',
      'dropdown has role="listbox"; options have role="option"',
      'options expose aria-selected and aria-disabled',
    ],
  },
};
