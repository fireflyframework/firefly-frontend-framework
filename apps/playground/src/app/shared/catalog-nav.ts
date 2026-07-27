/** One entry of the living catalog (sidebar + index cards). */
export interface CatalogEntry {
  /** URL slug under `/catalog` (or `/patterns`). */
  readonly slug: string;
  /** Human-readable name. */
  readonly label: string;
  /** Selector of the demonstrated component. */
  readonly selector: string;
  /** One-line description shown on the index cards. */
  readonly description: string;
}

/** The 23 design-system primitives demonstrated under `/catalog`. */
export const CATALOG_COMPONENTS: readonly CatalogEntry[] = [
  { slug: 'button', label: 'Button', selector: 'ff-button', description: 'Action button with 4 variants, 3 sizes, disabled and loading states.' },
  { slug: 'icon-button', label: 'Icon Button', selector: 'ff-icon-button', description: 'Compact square button for icon-only actions.' },
  { slug: 'badge', label: 'Badge', selector: 'ff-badge', description: 'Inline status label with semantic color variants.' },
  { slug: 'loader', label: 'Loader', selector: 'ff-loader', description: 'Indeterminate spinner or skeleton shimmer placeholder.' },
  { slug: 'input', label: 'Input', selector: 'ff-input', description: 'Text/number/password/textarea field with label, hint and error. CVA.' },
  { slug: 'checkbox', label: 'Checkbox', selector: 'ff-checkbox', description: 'Native checkbox with indeterminate state. CVA.' },
  { slug: 'radio-group', label: 'Radio Group', selector: 'ff-radio', description: 'Mutually-exclusive options, horizontal or vertical. CVA.' },
  { slug: 'select', label: 'Select', selector: 'ff-select', description: 'Dropdown with optional search and keyboard navigation. CVA.' },
  { slug: 'card', label: 'Card', selector: 'ff-card', description: 'Container with header/body/footer slots and 4 shadow levels.' },
  { slug: 'dialog', label: 'Dialog', selector: 'ff-dialog', description: 'Modal overlay with backdrop, Escape-to-close and action slot.' },
  { slug: 'toast', label: 'Toast', selector: 'ff-toast', description: 'Compact inline notification with 4 semantic variants.' },
  { slug: 'banner', label: 'Banner', selector: 'ff-banner', description: 'Full-width notification bar with action and dismiss.' },
  { slug: 'bottom-sheet', label: 'Bottom Sheet', selector: 'ff-bottom-sheet', description: 'Modal panel anchored to the bottom of the viewport.' },
  { slug: 'divider', label: 'Divider', selector: 'ff-divider', description: 'Horizontal or vertical separator line.' },
  { slug: 'chip', label: 'Chip', selector: 'ff-chip', description: 'Inline tag: default, filter (toggleable) or removable.' },
  { slug: 'link', label: 'Link', selector: 'ff-link', description: 'Styled anchor with inline and standalone variants.' },
  { slug: 'avatar', label: 'Avatar', selector: 'ff-avatar', description: 'Circular image with automatic initials fallback.' },
  { slug: 'tooltip', label: 'Tooltip', selector: 'ff-tooltip', description: 'Informational overlay on hover/focus in 4 positions.' },
  { slug: 'icon', label: 'Icon', selector: 'ff-icon', description: 'SVG icon resolved by name from the provideFfIcons registry.' },
  { slug: 'panel', label: 'Panel', selector: 'ff-panel', description: 'Container/callout with card and alert appearances.' },
  { slug: 'progress', label: 'Progress', selector: 'ff-progress', description: 'Determinate progress bar with semantic variants.' },
  { slug: 'skeleton', label: 'Skeleton', selector: 'ff-skeleton', description: 'Loading placeholder: text lines, rect or circle.' },
  { slug: 'empty-state', label: 'Empty State', selector: 'ff-empty-state', description: 'Centered placeholder for empty lists and first-run screens.' },
];

/** Patterns demonstrated under `/patterns`. */
export const PATTERN_COMPONENTS: readonly CatalogEntry[] = [
  { slug: 'tab-bar', label: 'Tab Bar', selector: 'ff-tab-bar', description: 'Horizontal tab strip (underline/pills) composing ff-icon and ff-badge.' },
  { slug: 'accordion', label: 'Accordion', selector: 'ff-accordion', description: 'Stacked disclosure sections (single/multiple) composing ff-panel and ff-icon.' },
  { slug: 'data-table', label: 'Data Table', selector: 'ff-data-table', description: 'Typed headers with cell/row/expansion templates, sorting, selection and server-side pagination.' },
  { slug: 'list', label: 'List', selector: 'ff-list', description: 'Item-per-template collection sharing the data table selection, pagination and empty states.' },
];
