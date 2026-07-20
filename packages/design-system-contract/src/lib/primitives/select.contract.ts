import type { DsComponentContract } from '../contract.types';

/**
 * Contract of the `ff-select` primitive.
 *
 * Single- or multi-selection dropdown with optional search filtering, custom
 * option/label templates, and full keyboard navigation. The options panel is
 * portaled to the document body (CDK overlay), so it escapes clipping
 * ancestors (e.g. a modal) and repositions on scroll. Works standalone via
 * `value`/`valueChange` (single) or `values`/`valuesChange` (multiple), and
 * also as a forms control (ControlValueAccessor) with Reactive Forms or
 * `ngModel`.
 */
export const SelectContract: DsComponentContract = {
  selector: 'ff-select',
  category: 'primitive',
  inputs: {
    options: {
      type: 'readonly Record<string, unknown>[]',
      required: false,
      default: '[]',
    },
    value: { type: 'string', required: false, default: "''" },
    values: { type: 'readonly string[]', required: false, default: '[]' },
    placeholder: { type: 'string', required: false, default: "''" },
    disabled: { type: 'boolean', required: false, default: 'false' },
    searchable: { type: 'boolean', required: false, default: 'false' },
    multiple: { type: 'boolean', required: false, default: 'false' },
    bindLabel: { type: 'string', required: false, default: "'label'" },
    bindValue: { type: 'string', required: false, default: "'value'" },
  },
  outputs: {
    valueChange: { type: 'string' },
    valuesChange: { type: 'readonly string[]' },
  },
  behavior: {
    contentSlots: ['[ffSelectOptionTemplate]', '[ffSelectLabelTemplate]'],
    hostAttributeOwnership: ['class'],
    keyboard: [
      'ArrowDown moves the active option down',
      'ArrowUp moves the active option up',
      'Home moves to the first option; End moves to the last option',
      'Typeahead jumps to the first option whose label starts with the typed characters (non-searchable mode)',
      'Enter selects the active option; Space selects it too outside searchable mode',
      'Escape closes the dropdown and returns focus to the trigger',
    ],
    aria: [
      'trigger exposes aria-haspopup="listbox" and aria-expanded',
      'trigger/search expose aria-owns/aria-controls pointing at the portaled panel and aria-activedescendant tracking the active option',
      'dropdown has role="listbox" (aria-multiselectable when multiple); options have role="option"',
      'options expose aria-selected and aria-disabled',
    ],
  },
};
