import type { DsComponentContract } from '../contract.types';

/**
 * Contract of the `ff-radio` primitive (radio group).
 *
 * Mutually-exclusive radio group rendered from a declarative `options`
 * array, with horizontal/vertical orientation and per-option disable.
 * Works standalone via `value`/`valueChange` and also as a forms control
 * (ControlValueAccessor) with Reactive Forms or `ngModel`. When `name` is
 * empty an auto-generated unique name is used.
 */
export const RadioGroupContract: DsComponentContract = {
  selector: 'ff-radio',
  category: 'primitive',
  inputs: {
    options: {
      type: '{ label: string; value: string; disabled?: boolean }[]',
      required: false,
      default: '[]',
    },
    value: { type: 'string', required: false, default: "''" },
    name: { type: 'string', required: false, default: "''" },
    orientation: {
      type: "'horizontal' | 'vertical'",
      required: false,
      default: "'horizontal'",
    },
    disabled: { type: 'boolean', required: false, default: 'false' },
  },
  outputs: {
    valueChange: { type: 'string' },
  },
  behavior: {
    hostAttributeOwnership: ['class', 'role'],
    keyboard: ['native radio-group semantics (arrow keys move selection)'],
    aria: ['host has role="radiogroup"', 'backed by native <input type="radio"> elements'],
  },
};
