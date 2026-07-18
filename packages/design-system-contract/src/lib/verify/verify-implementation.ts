import type { DsComponentContract } from '../contract.types';

/**
 * A structural violation detected in a set of design-system contracts.
 */
export interface DsContractViolation {
  /** Selector of the offending contract (e.g. `'ff-tab-bar'`). */
  contract: string;
  /** Stable identifier of the violated rule (e.g. `'primitive-no-composes'`). */
  rule: string;
  /** Human-readable explanation of the violation. */
  message: string;
}

/**
 * Validates the STRUCTURAL rules of a set of design-system contracts.
 *
 * Pure function — no DOM, no implementation access. The rules checked are
 * the compositional-tier invariants of the "detachable design system"
 * architecture:
 *
 * 1. `selector-prefix` — every selector must start with `ff-`.
 * 2. `duplicate-selector` — selectors must be unique within the set.
 * 3. `primitive-no-composes` — primitives must not declare `composes`.
 * 4. `composition-required` — patterns/layouts must declare a non-empty
 *    `composes` list.
 * 5. `composes-unknown-selector` — every composed selector must resolve to
 *    a contract in the set.
 * 6. `pattern-composes-primitives-only` — patterns may only compose
 *    primitives.
 * 7. `layout-no-layout-composition` — layouts may compose primitives and
 *    patterns, but never other layouts.
 *
 * @param contracts - The contracts to validate as a whole (composition
 *   edges are resolved against this same list).
 * @returns All detected violations; an empty array means the set is
 *   structurally valid.
 */
export function verifyDsContracts(
  contracts: readonly DsComponentContract[]
): DsContractViolation[] {
  const violations: DsContractViolation[] = [];
  const bySelector = new Map<string, DsComponentContract>();
  const seen = new Set<string>();

  for (const contract of contracts) {
    if (!contract.selector.startsWith('ff-')) {
      violations.push({
        contract: contract.selector,
        rule: 'selector-prefix',
        message: `Selector '${contract.selector}' must start with the 'ff-' prefix.`,
      });
    }
    if (seen.has(contract.selector)) {
      violations.push({
        contract: contract.selector,
        rule: 'duplicate-selector',
        message: `Selector '${contract.selector}' is declared by more than one contract.`,
      });
    }
    seen.add(contract.selector);
    if (!bySelector.has(contract.selector)) {
      bySelector.set(contract.selector, contract);
    }
  }

  for (const contract of contracts) {
    const { selector, category, composes } = contract;

    if (category === 'primitive') {
      if (composes !== undefined) {
        violations.push({
          contract: selector,
          rule: 'primitive-no-composes',
          message: `Primitive '${selector}' must not declare 'composes' (primitives compose nothing).`,
        });
      }
      continue;
    }

    // pattern / layout tiers
    if (composes === undefined || composes.length === 0) {
      violations.push({
        contract: selector,
        rule: 'composition-required',
        message: `${capitalize(category)} '${selector}' must declare a non-empty 'composes' list.`,
      });
      continue;
    }

    for (const composed of composes) {
      const target = bySelector.get(composed);
      if (target === undefined) {
        violations.push({
          contract: selector,
          rule: 'composes-unknown-selector',
          message: `${capitalize(category)} '${selector}' composes unknown selector '${composed}'.`,
        });
        continue;
      }
      if (category === 'pattern' && target.category !== 'primitive') {
        violations.push({
          contract: selector,
          rule: 'pattern-composes-primitives-only',
          message: `Pattern '${selector}' composes '${composed}' (${target.category}); patterns may only compose primitives.`,
        });
      }
      if (category === 'layout' && target.category === 'layout') {
        violations.push({
          contract: selector,
          rule: 'layout-no-layout-composition',
          message: `Layout '${selector}' composes layout '${composed}'; layouts must not compose other layouts.`,
        });
      }
    }
  }

  return violations;
}

/** Uppercases the first letter of a tier name for messages. */
function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}
