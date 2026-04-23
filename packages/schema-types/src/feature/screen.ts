import type { FieldType } from './field';

/**
 * Screen layout variants supported by the DSL.
 *
 * - `table-page`  — paginated data table with filters, columns and actions.
 * - `detail-page` — single-entity detail view.
 * - `wizard`      — multi-step guided flow with sections and sidebar.
 * - `modal-form`  — lightweight modal dialog with a subset of fields.
 */
export type ScreenType = 'table-page' | 'detail-page' | 'wizard' | 'modal-form';

/**
 * Column definition for a `table-page` screen.
 *
 * @example
 * ```yaml
 * columns:
 *   - { field: applicantName, sortable: true, filterable: true, width: 200 }
 *   - { field: amount, type: currency, alignment: right }
 *   - { field: status, type: enum, cellRenderer: status-badge }
 * ```
 */
export interface ColumnDef {
  /** Field name to display in this column. */
  field: string;

  /** Override the default field type for display purposes. */
  type?: FieldType;

  /** Whether the column is sortable. */
  sortable?: boolean;

  /** Whether the column supports inline filtering. */
  filterable?: boolean;

  /** Column width in pixels. */
  width?: number;

  /** Text alignment within the column. */
  alignment?: 'left' | 'center' | 'right';

  /** Custom cell renderer component identifier. */
  cellRenderer?: string;
}

/**
 * Filter definition for a `table-page` screen.
 *
 * @example
 * ```yaml
 * filters:
 *   - { field: status, type: select, options: [pending, approved, rejected] }
 *   - { field: dateRange, type: date-range }
 *   - { field: search, type: text, searchFields: [applicantName, nif] }
 * ```
 */
export interface FilterDef {
  /** Field name this filter operates on. */
  field: string;

  /** Filter control type. */
  type: 'text' | 'select' | 'date-range' | 'number-range' | 'boolean';

  /** Available options for `select` filters. */
  options?: string[];

  /** Fields to search across for `text` filters. */
  searchFields?: string[];
}

/**
 * Pagination configuration for a `table-page` screen.
 *
 * @example
 * ```yaml
 * pagination: { type: server-side, pageSize: 25 }
 * ```
 */
export interface PaginationConfig {
  /** Pagination strategy. */
  type: 'server-side' | 'client-side';

  /** Number of rows per page. */
  pageSize: number;
}

/**
 * Action configuration for a `table-page` screen, grouped by trigger zone.
 *
 * @example
 * ```yaml
 * actions:
 *   row: [view-detail, edit]
 *   bulk: [export-csv]
 *   header: [create-new, refresh]
 * ```
 */
export interface ActionConfig {
  /** Actions available on each table row. */
  row?: string[];

  /** Actions available when rows are selected (bulk operations). */
  bulk?: string[];

  /** Actions displayed in the table header/toolbar. */
  header?: string[];
}

/**
 * Section within a wizard step.
 *
 * Sections define the content blocks inside each step: forms, search panels,
 * calculated displays, or summaries.
 *
 * @example
 * ```yaml
 * sections:
 *   - type: company-search
 *     endpoint: { operationId: searchCompany }
 *     searchFields: [companyName, taxId]
 *   - type: form
 *     fields: [companyName, legalForm, taxId]
 * ```
 */
export interface WizardSection {
  /** Section type that drives the generated UI component. */
  type: 'form' | 'company-search' | 'calculated-display' | 'summary' | string;

  /** Fields rendered in this section (for `form` type). */
  fields?: string[];

  /** Endpoint binding (for `company-search` type). */
  endpoint?: { operationId: string };

  /** Fields used for search (for `company-search` type). */
  searchFields?: string[];

  /** Calculation formula expression (for `calculated-display` type). */
  formula?: string;

  /** Target field that receives the calculated value. */
  target?: string;

  /** Whether the section is read-only (for `summary` type). */
  readOnly?: boolean;
}

/**
 * Step within a `wizard` screen.
 *
 * @example
 * ```yaml
 * steps:
 *   - id: client-info
 *     sections:
 *       - type: form
 *         fields: [companyName, legalForm, taxId]
 *     validation:
 *       required: [companyName, taxId, legalForm]
 *   - id: review
 *     type: summary
 *     readOnly: true
 * ```
 */
export interface WizardStep {
  /** Unique step identifier within the wizard. */
  id: string;

  /** Optional step type override (e.g. `summary`). */
  type?: string;

  /** Content sections within this step. */
  sections?: WizardSection[];

  /** Validation rules for this step. */
  validation?: {
    /** Fields required to advance to the next step. */
    required?: string[];
  };

  /** Computed field expressions evaluated in this step. */
  computed?: Record<string, string>;

  /** Whether this step is read-only. */
  readOnly?: boolean;
}

/**
 * Sidebar configuration for a `wizard` screen.
 *
 * @example
 * ```yaml
 * sidebar:
 *   type: product-card
 *   persistent: true
 * ```
 */
export interface SidebarConfig {
  /** Sidebar component type identifier. */
  type: string;

  /** Whether the sidebar remains visible across all wizard steps. */
  persistent?: boolean;
}

/**
 * Root screen definition in the DSL.
 *
 * Each feature can declare multiple named screens (e.g. `list`, `detail`, `apply`).
 * The {@link ScreenType} determines which sub-properties are relevant.
 *
 * @example
 * ```yaml
 * screens:
 *   list:
 *     type: table-page
 *     columns: [...]
 *     filters: [...]
 *     pagination: { type: server-side, pageSize: 25 }
 *     actions: { row: [...], bulk: [...], header: [...] }
 *   detail: { type: detail-page }
 *   apply:
 *     type: wizard
 *     steps: [...]
 *     sidebar: { type: product-card, persistent: true }
 *   approve: { type: modal-form, fields: [status, score] }
 * ```
 */
export interface ScreenDef {
  /** Screen layout variant. */
  type: ScreenType;

  /** Column definitions (for `table-page`). */
  columns?: ColumnDef[];

  /** Filter definitions (for `table-page`). */
  filters?: FilterDef[];

  /** Pagination configuration (for `table-page`). */
  pagination?: PaginationConfig;

  /** Action configuration grouped by zone (for `table-page`). */
  actions?: ActionConfig;

  /** Wizard steps (for `wizard`). */
  steps?: WizardStep[];

  /** Sidebar panel (for `wizard`). */
  sidebar?: SidebarConfig;

  /** Fields to display (for `modal-form` or simple screens). */
  fields?: string[];
}
