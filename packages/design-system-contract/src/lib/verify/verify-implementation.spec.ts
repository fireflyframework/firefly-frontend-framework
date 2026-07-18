import { ALL_CONTRACTS } from '../../index';
import type { DsComponentContract } from '../contract.types';
import { verifyDsContracts } from './verify-implementation';

/** Builds a minimal valid contract for synthetic rule-trigger cases. */
function contract(
  overrides: Partial<DsComponentContract> & Pick<DsComponentContract, 'selector' | 'category'>
): DsComponentContract {
  return { inputs: {}, outputs: {}, ...overrides };
}

describe('verifyDsContracts', () => {
  it('reports zero violations for ALL_CONTRACTS', () => {
    expect(verifyDsContracts(ALL_CONTRACTS)).toEqual([]);
  });

  it('covers the full inventory (23 primitives + 3 patterns)', () => {
    expect(ALL_CONTRACTS).toHaveLength(26);
    expect(ALL_CONTRACTS.filter((c) => c.category === 'primitive')).toHaveLength(23);
    expect(ALL_CONTRACTS.filter((c) => c.category === 'pattern')).toHaveLength(3);
  });

  it('flags a primitive that declares composes', () => {
    const violations = verifyDsContracts([
      contract({ selector: 'ff-a', category: 'primitive', composes: ['ff-b'] }),
      contract({ selector: 'ff-b', category: 'primitive' }),
    ]);
    expect(violations).toEqual([
      expect.objectContaining({ contract: 'ff-a', rule: 'primitive-no-composes' }),
    ]);
  });

  it('flags a pattern without composes', () => {
    const violations = verifyDsContracts([
      contract({ selector: 'ff-p', category: 'pattern' }),
    ]);
    expect(violations).toEqual([
      expect.objectContaining({ contract: 'ff-p', rule: 'composition-required' }),
    ]);
  });

  it('flags a pattern with an empty composes list', () => {
    const violations = verifyDsContracts([
      contract({ selector: 'ff-p', category: 'pattern', composes: [] }),
    ]);
    expect(violations).toEqual([
      expect.objectContaining({ contract: 'ff-p', rule: 'composition-required' }),
    ]);
  });

  it('flags a layout without composes', () => {
    const violations = verifyDsContracts([
      contract({ selector: 'ff-l', category: 'layout' }),
    ]);
    expect(violations).toEqual([
      expect.objectContaining({ contract: 'ff-l', rule: 'composition-required' }),
    ]);
  });

  it('flags a pattern composing another pattern', () => {
    const violations = verifyDsContracts([
      contract({ selector: 'ff-a', category: 'primitive' }),
      contract({ selector: 'ff-p1', category: 'pattern', composes: ['ff-a'] }),
      contract({ selector: 'ff-p2', category: 'pattern', composes: ['ff-p1'] }),
    ]);
    expect(violations).toEqual([
      expect.objectContaining({
        contract: 'ff-p2',
        rule: 'pattern-composes-primitives-only',
      }),
    ]);
  });

  it('flags a pattern composing a layout', () => {
    const violations = verifyDsContracts([
      contract({ selector: 'ff-a', category: 'primitive' }),
      contract({ selector: 'ff-l', category: 'layout', composes: ['ff-a'] }),
      contract({ selector: 'ff-p', category: 'pattern', composes: ['ff-l'] }),
    ]);
    expect(violations).toEqual([
      expect.objectContaining({
        contract: 'ff-p',
        rule: 'pattern-composes-primitives-only',
      }),
    ]);
  });

  it('flags a layout composing another layout', () => {
    const violations = verifyDsContracts([
      contract({ selector: 'ff-a', category: 'primitive' }),
      contract({ selector: 'ff-l1', category: 'layout', composes: ['ff-a'] }),
      contract({ selector: 'ff-l2', category: 'layout', composes: ['ff-l1'] }),
    ]);
    expect(violations).toEqual([
      expect.objectContaining({
        contract: 'ff-l2',
        rule: 'layout-no-layout-composition',
      }),
    ]);
  });

  it('allows a layout composing primitives and patterns', () => {
    const violations = verifyDsContracts([
      contract({ selector: 'ff-a', category: 'primitive' }),
      contract({ selector: 'ff-p', category: 'pattern', composes: ['ff-a'] }),
      contract({ selector: 'ff-l', category: 'layout', composes: ['ff-a', 'ff-p'] }),
    ]);
    expect(violations).toEqual([]);
  });

  it('flags composes referencing a selector that does not exist', () => {
    const violations = verifyDsContracts([
      contract({ selector: 'ff-p', category: 'pattern', composes: ['ff-ghost'] }),
    ]);
    expect(violations).toEqual([
      expect.objectContaining({ contract: 'ff-p', rule: 'composes-unknown-selector' }),
    ]);
  });

  it('flags duplicate selectors', () => {
    const violations = verifyDsContracts([
      contract({ selector: 'ff-a', category: 'primitive' }),
      contract({ selector: 'ff-a', category: 'primitive' }),
    ]);
    expect(violations).toEqual([
      expect.objectContaining({ contract: 'ff-a', rule: 'duplicate-selector' }),
    ]);
  });

  it('flags selectors without the ff- prefix', () => {
    const violations = verifyDsContracts([
      contract({ selector: 'mat-button', category: 'primitive' }),
    ]);
    expect(violations).toEqual([
      expect.objectContaining({ contract: 'mat-button', rule: 'selector-prefix' }),
    ]);
  });
});
