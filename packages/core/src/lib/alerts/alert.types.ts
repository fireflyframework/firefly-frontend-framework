/** Semantic alert type — shared across all 4 presentation formats. */
export type AlertType =
  | 'success'
  | 'error'
  | 'warning'
  | 'info'
  | 'destructive'
  | 'custom';

/** Presentation format for convenience shortcuts. */
export type AlertFormat = 'toast' | 'banner' | 'bottom-sheet' | 'dialog';

// ---------------------------------------------------------------------------
// Internal state models (managed by AlertService via signals)
// ---------------------------------------------------------------------------

/** Immutable toast entry managed by AlertService. Read from `activeToasts` signal. */
export interface Toast {
  readonly id: string;
  readonly message: string;
  readonly type: AlertType;
  readonly options: ToastOptions;
  readonly createdAt: number;
}

/** Immutable banner entry managed by AlertService. Read from `activeBanners` signal. */
export interface Banner {
  readonly id: string;
  readonly message: string;
  readonly type: AlertType;
  readonly options: BannerOptions;
  readonly createdAt: number;
}

/** Immutable bottom-sheet entry managed by AlertService. Read from `activeBottomSheets` signal. */
export interface BottomSheet {
  readonly id: string;
  readonly message: string;
  readonly type: AlertType;
  readonly options: BottomSheetOptions;
  readonly createdAt: number;
}

/** Immutable dialog entry managed by AlertService. Read from `activeDialogs` signal. */
export interface Dialog {
  readonly id: string;
  readonly options: DialogOptions;
  readonly createdAt: number;
}

// ---------------------------------------------------------------------------
// Options per format
// ---------------------------------------------------------------------------

export interface ToastOptions {
  /** Duration in ms before auto-dismiss. Default 3000 (error: 5000). */
  duration?: number;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  /** Whether the user can manually dismiss. Default true. */
  dismissible?: boolean;
  icon?: string;
  customClass?: string;
  /** Custom Angular component. Uses `unknown` to avoid importing @angular/core in types. */
  component?: unknown;
  componentData?: Record<string, unknown>;
}

export interface BannerOptions {
  position?: 'top' | 'bottom';
  /** Duration in ms. If omitted the banner persists until dismissed. */
  duration?: number;
  dismissible?: boolean;
  icon?: string;
  action?: { label: string; callback: () => void };
  customClass?: string;
  component?: unknown;
  componentData?: Record<string, unknown>;
}

export interface BottomSheetOptions {
  title?: string;
  /** Whether the bottom-sheet can be dismissed via button/backdrop. Default true. */
  dismissible?: boolean;
  /** Whether swipe-to-dismiss is enabled. Default true. Implemented by the UI layer. */
  swipeToDismiss?: boolean;
  actions?: { label: string; callback: () => void; type?: AlertType }[];
  icon?: string;
  customClass?: string;
  component?: unknown;
  componentData?: Record<string, unknown>;
}

export interface DialogOptions {
  title?: string;
  message?: string;
  type: AlertType;
  /** Confirm button label. Default "Confirm". */
  confirmLabel?: string;
  /** Cancel button label. If omitted only the confirm button is shown. */
  cancelLabel?: string;
  /** Required confirmation text for destructive dialogs. */
  destructiveConfirmText?: string;
  icon?: string;
  customClass?: string;
  component?: unknown;
  componentData?: Record<string, unknown>;
}

export interface DialogResult {
  confirmed: boolean;
  /** User input value, if the dialog captured text (e.g. destructiveConfirmText). */
  input?: string;
}

// ---------------------------------------------------------------------------
// Global configuration (provided via provideAlerts())
// ---------------------------------------------------------------------------

export interface AlertConfig {
  defaultToastDuration?: number;
  defaultToastPosition?: ToastOptions['position'];
  defaultBannerPosition?: BannerOptions['position'];
  /** Maximum visible toasts at once. Default 5. */
  maxVisibleToasts?: number;
  /** Maximum visible banners at once. Default 3. */
  maxVisibleBanners?: number;
}
