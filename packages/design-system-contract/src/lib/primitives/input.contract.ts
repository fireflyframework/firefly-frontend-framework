import type { DsComponentContract } from '../contract.types';

/**
 * Contract of the `ff-input` primitive.
 *
 * Form input with label, hint and error message, including a `'textarea'`
 * multiline mode. Works standalone via `value`/`valueChange` and also as a
 * forms control (ControlValueAccessor) with Reactive Forms or `ngModel`;
 * once a forms directive attaches, the forms value takes precedence over the
 * `value` input.
 *
 * Prefix/suffix affixes are projected into the field wrapper via the
 * `[ff-input-prefix]`/`[ff-input-suffix]` content slots (empty slots collapse;
 * consumers project e.g. an `ff-icon` themselves). When `debounceTime > 0`,
 * `valueChange` and the forms callback are debounced by that quiet period and
 * blur always flushes the pending value immediately. `search` emits on Enter
 * and, for `type: 'search'` with `debounceTime > 0`, when the debounce
 * settles. `labelType: 'hidden'` exposes the label as `aria-label` only;
 * `'floating'` renders it over the field's top border.
 */
export const InputContract: DsComponentContract = {
  selector: 'ff-input',
  category: 'primitive',
  inputs: {
    type: {
      type: "'text' | 'number' | 'password' | 'search' | 'textarea'",
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
    debounceTime: { type: 'number', required: false, default: '0' },
    labelType: {
      type: "'default' | 'floating' | 'hidden'",
      required: false,
      default: "'default'",
    },
  },
  outputs: {
    valueChange: { type: 'string' },
    blurred: { type: 'void' },
    search: { type: 'string' },
  },
  behavior: {
    contentSlots: ['[ff-input-prefix]', '[ff-input-suffix]'],
    hostAttributeOwnership: ['class'],
    aria: [
      'label is associated to the native control via a generated id',
      "labelType 'hidden' exposes the label text as aria-label on the native control",
    ],
  },
};
