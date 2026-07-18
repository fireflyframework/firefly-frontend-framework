import type { DsComponentContract } from '../contract.types';

/**
 * Contract of the `ff-input` primitive.
 *
 * Form input with label, hint and error message, including a `'textarea'`
 * multiline mode. Works standalone via `value`/`valueChange` and also as a
 * forms control (ControlValueAccessor) with Reactive Forms or `ngModel`;
 * once a forms directive attaches, the forms value takes precedence over the
 * `value` input.
 */
export const InputContract: DsComponentContract = {
  selector: 'ff-input',
  category: 'primitive',
  inputs: {
    type: {
      type: "'text' | 'number' | 'password' | 'textarea'",
      required: false,
      default: "'text'",
    },
    placeholder: { type: 'string', required: false, default: "''" },
    value: { type: 'string', required: false, default: "''" },
    disabled: { type: 'boolean', required: false, default: 'false' },
    error: { type: 'string', required: false, default: "''" },
    hint: { type: 'string', required: false, default: "''" },
    label: { type: 'string', required: false, default: "''" },
    rows: { type: 'number', required: false, default: '3' },
  },
  outputs: {
    valueChange: { type: 'string' },
    blurred: { type: 'void' },
  },
  behavior: {
    hostAttributeOwnership: ['class'],
    aria: ['label is associated to the native control via a generated id'],
  },
};
