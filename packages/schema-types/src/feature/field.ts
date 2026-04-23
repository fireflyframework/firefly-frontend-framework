/**
 * Supported field data types in the DSL.
 *
 * Each type drives form control selection, validation rules,
 * and display formatting during code generation.
 */
export type FieldType =
  | 'string'
  | 'number'
  | 'boolean'
  | 'date'
  | 'currency'
  | 'nif'
  | 'iban'
  | 'enum'
  | 'file-upload'
  | 'text'
  | 'email'
  | 'phone';

/**
 * Declarative definition of an entity field.
 *
 * Fields are the atomic data units of a feature. The generator uses
 * them to produce form controls, table columns, and validation rules.
 *
 * @example
 * ```yaml
 * fields:
 *   - { name: applicantName, type: string, required: true, showInList: true }
 *   - { name: nif, type: nif, pii: true, mask: "***-****-{last4}" }
 *   - { name: status, type: enum, options: [pending, approved, rejected] }
 * ```
 */
export interface FieldDef {
  /** Unique field name within the entity. */
  name: string;

  /** Data type that drives control selection and validation. */
  type: FieldType;

  /** Whether the field is mandatory in create/update forms. */
  required?: boolean;

  /** Whether the field appears as a column in the list screen. */
  showInList?: boolean;

  /** Marks the field as Personally Identifiable Information. */
  pii?: boolean;

  /** Display mask pattern for PII fields (e.g. `"***-****-{last4}"`). */
  mask?: string;

  /** Allowed values when {@link type} is `'enum'`. */
  options?: string[];
}
