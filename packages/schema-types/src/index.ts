// @fireflyframework/schema-types — DSL type definitions

// common
export type { ArchetypeConfig, Mode, Pattern } from './common';

// feature
export type { DocumentDef } from './feature/document';
export type { EndpointDef, EndpointMap } from './feature/endpoint';
export type { FeatureSchema } from './feature/feature-schema';
export type { FieldDef, FieldType } from './feature/field';
export type { HostIntegration } from './feature/host-integration';
export type {
  NavigationAction,
  NavigationConfig,
  NavigationTarget,
} from './feature/navigation';
export type { PermissionMap } from './feature/permissions';
export type { RelationDef, RelationType } from './feature/relation';
export type {
  ActionConfig,
  ColumnDef,
  FilterDef,
  PaginationConfig,
  ScreenDef,
  ScreenType,
  SidebarConfig,
  WizardSection,
  WizardStep,
} from './feature/screen';
export type { VisibilityConfig } from './feature/visibility';

// component
export type {
  A11yRequirements,
  ComponentInput,
  ComponentOutput,
  ComponentSpec,
} from './component';

// module
export type { ModuleSpec } from './module';

// product-component
export type { ProductComponentSpec } from './product-component';
