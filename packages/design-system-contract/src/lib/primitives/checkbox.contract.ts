import type { DsComponentContract } from '../contract.types';

/**
 * Contract of the `ff-checkbox` primitive.
 *
 * Checkbox with checked, indeterminate and disabled states, backed by a
 * native `<input type="checkbox">` for accessibility. Works standalone via
 * `checked`/`changed` and also as a forms control (ControlValueAccessor)
 * with Reactive Forms or `ngModel`.
 */
export const CheckboxContract: DsComponentContract = {
  selector: 'ff-checkbox',
  category: 'primitive',
  inputs: {
    checked: { type: 'boolean', required: false, default: 'false' },
    indeterminate: { type: 'boolean', required: false, default: 'false' },
    disabled: { type: 'boolean', required: false, default: 'false' },
    label: { type: 'string', required: false, default: "''" },
    ariaLabel: { type: 'string', required: false, default: "''" },
  },
  outputs: {
    changed: { type: 'boolean' },
  },
  behavior: {
    hostAttributeOwnership: ['class'],
    keyboard: ['native checkbox semantics (Space toggles when focused)'],
    aria: [
      'backed by a native <input type="checkbox">',
      'label is associated to the native control via a generated id',
      'ariaLabel is exposed as aria-label on the native input only when label is empty, avoiding a duplicate name',
    ],
  },
};
