import type { ArchetypeConfig } from '../common';
import type { DocumentDef } from './document';
import type { EndpointMap } from './endpoint';
import type { FieldDef } from './field';
import type { HostIntegration } from './host-integration';
import type { NavigationConfig } from './navigation';
import type { PermissionMap } from './permissions';
import type { RelationDef } from './relation';
import type { ScreenDef } from './screen';
import type { VisibilityConfig } from './visibility';

/**
 * Root type of the Firefly DSL — represents one `feature.schema.yaml` file.
 *
 * A FeatureSchema describes a complete business feature: its entity,
 * backend bindings, fields, screens, access control, relationships,
 * documents and navigation. The generator consumes this type to produce
 * Angular code for the entire feature.
 *
 * @example
 * ```yaml
 * # features/loan-applications/feature.schema.yaml
 * id: loan-applications
 * entity: LoanApplication
 * backendService: lending-core
 * apiVersion: v1
 * archetype:
 *   mode: platform
 *   pattern: flow
 * endpoints:
 *   list: { operationId: loanControllerGetAll, paginated: true }
 *   get:  { operationId: loanControllerGetById }
 * fields:
 *   - { name: applicantName, type: string, required: true, showInList: true }
 *   - { name: amount, type: currency, required: true }
 * screens:
 *   list: { type: table-page, columns: [...], filters: [...] }
 *   detail: { type: detail-page }
 * permissions:
 *   create: [agent, manager]
 * visibility:
 *   tabs:
 *     leasing: [agent, manager]
 * relations:
 *   - { entity: Borrower, type: many-to-one, field: borrowerId }
 * documents:
 *   - { field: attachments, type: file-upload, accept: [pdf], maxSize: 10MB }
 * navigation:
 *   fromList:
 *     rowClick: { goto: detail, params: { id: ':entityId' } }
 *   breadcrumb: [list, detail]
 * ```
 */
export interface FeatureSchema {
  /** Unique feature identifier (kebab-case). */
  id: string;

  /** Primary entity name (PascalCase). */
  entity: string;

  /** Backend microservice that owns this entity. */
  backendService: string;

  /** API version prefix (e.g. `'v1'`). */
  apiVersion: string;

  /** Product archetype configuration. */
  archetype?: ArchetypeConfig;

  /** Map of CRUD + custom operations to backend endpoints. */
  endpoints: EndpointMap;

  /** Entity field definitions. */
  fields: FieldDef[];

  /** Named screen definitions (e.g. `list`, `detail`, `apply`). */
  screens: Record<string, ScreenDef>;

  /** Action-to-roles permission mapping. */
  permissions?: PermissionMap;

  /** Section-level role-based visibility rules. */
  visibility?: VisibilityConfig;

  /** Relationships to other entities. */
  relations?: RelationDef[];

  /** Document/file-upload field definitions. */
  documents?: DocumentDef[];

  /** Navigation configuration between screens. */
  navigation?: NavigationConfig;

  /** Host integration settings (required for embedded archetype). */
  hostIntegration?: HostIntegration;
}
