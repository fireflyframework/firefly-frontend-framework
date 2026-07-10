/**
 * Standard page base directives and the composables they are built from.
 *
 * Doctrine: standard-page-bases.md.
 *
 * Catalogue shipped so far: 4 of 6 (List, Detail, Form, Dashboard).
 * `WizardPageBase` and `SettingsPageBase` will be added when the first
 * consumer appears, per the "migrate when touched" policy.
 */
export type { PageResource } from './page-resource';
export { ListPageBase, type ListPageState, type UrlFilterCodec } from './list-page-base';
export { DetailPageBase, type DetailPageState } from './detail-page-base';
export { FormPageBase, type FormPageMode } from './form-page-base';
export { DashboardPageBase } from './dashboard-page-base';

// Standalone composables the bases are built from — for embedded / non-page
// consumers and for pages that combine behaviors beyond their base.
export { createListState, type ListState } from './list-state';
export { createUrlSyncedFilters, type UrlSyncedFilters } from './url-synced-filters';
export { scrollMemory, type ScrollMemoryOptions } from './scroll-memory';
export { autoRefresh } from './auto-refresh';
export { createSort, type Sort, type SortConfig, type SortSpec, type SortValue } from './sort';
export { createSelection, type Selection } from './selection';
