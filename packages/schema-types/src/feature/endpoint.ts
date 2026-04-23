/**
 * Definition of a single API endpoint bound to a backend operation.
 *
 * @example
 * ```yaml
 * endpoints:
 *   list: { operationId: loanControllerGetAll, paginated: true }
 *   search: { operationId: loanControllerSearch, type: autocomplete }
 * ```
 */
export interface EndpointDef {
  /** Backend operation identifier (e.g. `loanControllerGetAll`). */
  operationId: string;

  /** Whether the endpoint returns paginated results. */
  paginated?: boolean;

  /** Endpoint variant — `autocomplete` enables typeahead search behavior. */
  type?: 'autocomplete' | 'standard';
}

/**
 * Map of CRUD + custom operations to their endpoint definitions.
 *
 * Standard keys (`list`, `get`, `create`, `update`, `delete`, `search`)
 * are predefined; arbitrary keys are allowed for custom operations.
 *
 * @example
 * ```yaml
 * endpoints:
 *   list:   { operationId: loanControllerGetAll, paginated: true }
 *   get:    { operationId: loanControllerGetById }
 *   create: { operationId: loanControllerCreate }
 *   update: { operationId: loanControllerUpdate }
 *   search: { operationId: loanControllerSearch, type: autocomplete }
 * ```
 */
export type EndpointMap = Record<
  'list' | 'get' | 'create' | 'update' | 'delete' | 'search' | string,
  EndpointDef
>;
