/**
 * Cardinality type for entity relationships.
 */
export type RelationType = 'many-to-one' | 'one-to-many' | 'many-to-many';

/**
 * Definition of a relationship between the current entity and another.
 *
 * Used by the generator to create foreign-key bindings, navigation links,
 * and display labels in list/detail screens.
 *
 * @example
 * ```yaml
 * relations:
 *   - { entity: Borrower, type: many-to-one, field: borrowerId, display: borrowerName }
 *   - { entity: Contract, type: one-to-many, parentField: loanApplicationId }
 * ```
 */
export interface RelationDef {
  /** Target entity name. */
  entity: string;

  /** Cardinality of the relationship. */
  type: RelationType;

  /** Foreign-key field on the current entity (for many-to-one). */
  field?: string;

  /** Field used to display the related entity in the UI. */
  display?: string;

  /** Field on the related entity that points back (for one-to-many). */
  parentField?: string;
}
