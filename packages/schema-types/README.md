# @fireflyframework/schema-types

TypeScript definitions for the Firefly DSL.

This package describes product, feature, module, and component schemas used by Firefly generators, skills, and product templates. It is intentionally type-only: consumers import contracts, not runtime behavior.

For ecosystem context, see `../../../firefly-frontend-playbook/reference/framework-packages.md` from this package directory.

## Installation

```bash
npm install @fireflyframework/schema-types
```

## Usage

```typescript
import type { FeatureSchema, ComponentSpec } from '@fireflyframework/schema-types';

const feature: FeatureSchema = {
  id: 'loan-applications',
  entity: 'LoanApplication',
  backendService: 'lending-core',
  apiVersion: 'v1',
  endpoints: {
    list: { operationId: 'loanControllerGetAll', paginated: true },
    get: { operationId: 'loanControllerGetById' },
  },
  fields: [
    { name: 'applicantName', type: 'string', required: true, showInList: true },
    { name: 'amount', type: 'currency', required: true },
  ],
  screens: {
    list: { type: 'table-page' },
    detail: { type: 'detail-page' },
  },
};
```

## Main concepts

| Area | Types | Purpose |
|---|---|---|
| Common | `Mode`, `Pattern`, `ArchetypeConfig` | Product shape: platform or embedded, plus default UI pattern |
| Feature | `FeatureSchema`, `FieldDef`, `EndpointMap`, `ScreenDef`, `PermissionMap`, `VisibilityConfig` | Declarative description of a business feature |
| Component | `ComponentSpec`, `ComponentInput`, `ComponentOutput`, `A11yRequirements` | Public contract of reusable design-system components |
| Module | `ModuleSpec` | Contract of reusable framework service modules |
| Product component | `ProductComponentSpec` | Feature-specific generated or product-owned components |

## Feature schema

`FeatureSchema` is the root type for a `feature.schema.yaml` file. It describes one business feature:

- identity: `id`, `entity`, `backendService`, `apiVersion`
- archetype: `platform` or `embedded`
- API bindings: `endpoints`
- data model: `fields`, `relations`, `documents`
- UI: `screens`, `navigation`, `visibility`
- access control: `permissions`
- host behavior for embedded products: `hostIntegration`

Minimal shape:

```typescript
import type { FeatureSchema } from '@fireflyframework/schema-types';

export const schema: FeatureSchema = {
  id: 'customers',
  entity: 'Customer',
  backendService: 'crm',
  apiVersion: 'v1',
  endpoints: {
    list: { operationId: 'customerControllerGetAll', paginated: true },
  },
  fields: [
    { name: 'name', type: 'string', required: true, showInList: true },
  ],
  screens: {
    list: {
      type: 'table-page',
      columns: [{ field: 'name', sortable: true }],
    },
  },
};
```

## Supported field types

`FieldType` currently supports:

- `string`
- `number`
- `boolean`
- `date`
- `currency`
- `nif`
- `iban`
- `enum`
- `file-upload`
- `text`
- `email`
- `phone`

These types should drive generated form controls, validation, table rendering, and formatting.

## Supported screen types

`ScreenType` currently supports:

- `table-page`
- `detail-page`
- `wizard`
- `modal-form`

## Embedded products

When `archetype.mode` is `embedded`, `hostIntegration` describes how the product talks to its host:

- auth: `delegated` or `standard`
- theme: `external` or `api`
- communication: `postMessage` or `customEvent`
- events exchanged with the host

The current product template still treats embedded mode as a future capability. Keep schemas explicit, but validate generator support before using embedded mode in production.

## Commands

```bash
nx build schema-types
nx lint schema-types
```

## Documentation status

This README explains the public type surface. The next documentation step is to add complete YAML examples for common feature patterns.
