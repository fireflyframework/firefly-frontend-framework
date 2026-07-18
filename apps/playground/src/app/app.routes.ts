import { Route } from '@angular/router';

/**
 * Living-catalog routes: 4 layers, all lazy.
 *
 * - `/foundations` — design tokens (color, spacing, radius, typography, shadows)
 * - `/theming`     — theming cascade + live token inspector
 * - `/catalog`     — one page per primitive (23)
 * - `/patterns`    — composed patterns (ff-tab-bar) + backlog
 */
export const appRoutes: Route[] = [
  { path: '', pathMatch: 'full', redirectTo: 'catalog' },
  {
    path: 'foundations',
    title: 'Foundations · Firefly DS',
    loadComponent: () => import('./pages/foundations/foundations-page').then((m) => m.FoundationsPage),
  },
  {
    path: 'theming',
    title: 'Theming · Firefly DS',
    loadComponent: () => import('./pages/theming/theming-page').then((m) => m.ThemingPage),
  },
  {
    path: 'catalog',
    title: 'Catalog · Firefly DS',
    loadComponent: () => import('./pages/catalog/catalog-index-page').then((m) => m.CatalogIndexPage),
  },
  {
    path: 'catalog/button',
    title: 'Button · Firefly DS',
    loadComponent: () => import('./pages/catalog/button-page').then((m) => m.ButtonPage),
  },
  {
    path: 'catalog/icon-button',
    title: 'Icon Button · Firefly DS',
    loadComponent: () => import('./pages/catalog/icon-button-page').then((m) => m.IconButtonPage),
  },
  {
    path: 'catalog/badge',
    title: 'Badge · Firefly DS',
    loadComponent: () => import('./pages/catalog/badge-page').then((m) => m.BadgePage),
  },
  {
    path: 'catalog/loader',
    title: 'Loader · Firefly DS',
    loadComponent: () => import('./pages/catalog/loader-page').then((m) => m.LoaderPage),
  },
  {
    path: 'catalog/input',
    title: 'Input · Firefly DS',
    loadComponent: () => import('./pages/catalog/input-page').then((m) => m.InputPage),
  },
  {
    path: 'catalog/checkbox',
    title: 'Checkbox · Firefly DS',
    loadComponent: () => import('./pages/catalog/checkbox-page').then((m) => m.CheckboxPage),
  },
  {
    path: 'catalog/radio-group',
    title: 'Radio Group · Firefly DS',
    loadComponent: () => import('./pages/catalog/radio-group-page').then((m) => m.RadioGroupPage),
  },
  {
    path: 'catalog/select',
    title: 'Select · Firefly DS',
    loadComponent: () => import('./pages/catalog/select-page').then((m) => m.SelectPage),
  },
  {
    path: 'catalog/card',
    title: 'Card · Firefly DS',
    loadComponent: () => import('./pages/catalog/card-page').then((m) => m.CardPage),
  },
  {
    path: 'catalog/dialog',
    title: 'Dialog · Firefly DS',
    loadComponent: () => import('./pages/catalog/dialog-page').then((m) => m.DialogPage),
  },
  {
    path: 'catalog/toast',
    title: 'Toast · Firefly DS',
    loadComponent: () => import('./pages/catalog/toast-page').then((m) => m.ToastPage),
  },
  {
    path: 'catalog/banner',
    title: 'Banner · Firefly DS',
    loadComponent: () => import('./pages/catalog/banner-page').then((m) => m.BannerPage),
  },
  {
    path: 'catalog/bottom-sheet',
    title: 'Bottom Sheet · Firefly DS',
    loadComponent: () => import('./pages/catalog/bottom-sheet-page').then((m) => m.BottomSheetPage),
  },
  {
    path: 'catalog/divider',
    title: 'Divider · Firefly DS',
    loadComponent: () => import('./pages/catalog/divider-page').then((m) => m.DividerPage),
  },
  {
    path: 'catalog/chip',
    title: 'Chip · Firefly DS',
    loadComponent: () => import('./pages/catalog/chip-page').then((m) => m.ChipPage),
  },
  {
    path: 'catalog/link',
    title: 'Link · Firefly DS',
    loadComponent: () => import('./pages/catalog/link-page').then((m) => m.LinkPage),
  },
  {
    path: 'catalog/avatar',
    title: 'Avatar · Firefly DS',
    loadComponent: () => import('./pages/catalog/avatar-page').then((m) => m.AvatarPage),
  },
  {
    path: 'catalog/tooltip',
    title: 'Tooltip · Firefly DS',
    loadComponent: () => import('./pages/catalog/tooltip-page').then((m) => m.TooltipPage),
  },
  {
    path: 'catalog/icon',
    title: 'Icon · Firefly DS',
    loadComponent: () => import('./pages/catalog/icon-page').then((m) => m.IconPage),
  },
  {
    path: 'catalog/panel',
    title: 'Panel · Firefly DS',
    loadComponent: () => import('./pages/catalog/panel-page').then((m) => m.PanelPage),
  },
  {
    path: 'catalog/progress',
    title: 'Progress · Firefly DS',
    loadComponent: () => import('./pages/catalog/progress-page').then((m) => m.ProgressPage),
  },
  {
    path: 'catalog/skeleton',
    title: 'Skeleton · Firefly DS',
    loadComponent: () => import('./pages/catalog/skeleton-page').then((m) => m.SkeletonPage),
  },
  {
    path: 'catalog/empty-state',
    title: 'Empty State · Firefly DS',
    loadComponent: () => import('./pages/catalog/empty-state-page').then((m) => m.EmptyStatePage),
  },
  {
    path: 'patterns',
    title: 'Patterns · Firefly DS',
    loadComponent: () => import('./pages/patterns/patterns-page').then((m) => m.PatternsPage),
  },
  {
    path: 'patterns/tab-bar',
    title: 'Tab Bar · Firefly DS',
    loadComponent: () => import('./pages/patterns/tab-bar-page').then((m) => m.TabBarPage),
  },
  { path: '**', redirectTo: 'catalog' },
];
