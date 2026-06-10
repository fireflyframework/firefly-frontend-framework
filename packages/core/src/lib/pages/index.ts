/**
 * Standard page base directives.
 *
 * Doctrine: firefly-docs/reference/standard-page-bases.md.
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
