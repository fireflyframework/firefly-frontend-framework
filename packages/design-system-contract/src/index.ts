/**
 * @fileoverview Public API of `@fireflyframework/design-system-contract`.
 *
 * The design-system contract: the stable public API (selectors, typed
 * inputs/outputs, compositional tiers, composition edges, required tokens
 * and behavioral clauses) products program against, independent of any
 * implementation. Pure TypeScript — no Angular, no implementation imports.
 */

// ---- Contract model ----
export type {
  DsTier,
  DsInputContract,
  DsOutputContract,
  DsBehaviorContract,
  DsComponentContract,
} from './lib/contract.types';

// ---- Primitive contracts ----
export { AvatarContract } from './lib/primitives/avatar.contract';
export { BadgeContract } from './lib/primitives/badge.contract';
export { BannerContract } from './lib/primitives/banner.contract';
export { BottomSheetContract } from './lib/primitives/bottom-sheet.contract';
export { ButtonContract } from './lib/primitives/button.contract';
export { CardContract } from './lib/primitives/card.contract';
export { CheckboxContract } from './lib/primitives/checkbox.contract';
export { ChipContract } from './lib/primitives/chip.contract';
export { DialogContract } from './lib/primitives/dialog.contract';
export { DividerContract } from './lib/primitives/divider.contract';
export { EmptyStateContract } from './lib/primitives/empty-state.contract';
export { IconContract } from './lib/primitives/icon.contract';
export { IconButtonContract } from './lib/primitives/icon-button.contract';
export { InputContract } from './lib/primitives/input.contract';
export { LinkContract } from './lib/primitives/link.contract';
export { LoaderContract } from './lib/primitives/loader.contract';
export { PanelContract } from './lib/primitives/panel.contract';
export { ProgressContract } from './lib/primitives/progress.contract';
export { RadioGroupContract } from './lib/primitives/radio.contract';
export { SelectContract } from './lib/primitives/select.contract';
export { SkeletonContract } from './lib/primitives/skeleton.contract';
export { ToastContract } from './lib/primitives/toast.contract';
export { TooltipContract } from './lib/primitives/tooltip.contract';

// ---- Pattern contracts ----
export { TabBarContract } from './lib/patterns/tab-bar.contract';

// ---- Required design tokens ----
export {
  REQUIRED_DESIGN_TOKENS,
  type RequiredDesignToken,
} from './lib/tokens/required-tokens';

// ---- Structural verification ----
export {
  verifyDsContracts,
  type DsContractViolation,
} from './lib/verify/verify-implementation';

import type { DsComponentContract } from './lib/contract.types';
import { AvatarContract } from './lib/primitives/avatar.contract';
import { BadgeContract } from './lib/primitives/badge.contract';
import { BannerContract } from './lib/primitives/banner.contract';
import { BottomSheetContract } from './lib/primitives/bottom-sheet.contract';
import { ButtonContract } from './lib/primitives/button.contract';
import { CardContract } from './lib/primitives/card.contract';
import { CheckboxContract } from './lib/primitives/checkbox.contract';
import { ChipContract } from './lib/primitives/chip.contract';
import { DialogContract } from './lib/primitives/dialog.contract';
import { DividerContract } from './lib/primitives/divider.contract';
import { EmptyStateContract } from './lib/primitives/empty-state.contract';
import { IconContract } from './lib/primitives/icon.contract';
import { IconButtonContract } from './lib/primitives/icon-button.contract';
import { InputContract } from './lib/primitives/input.contract';
import { LinkContract } from './lib/primitives/link.contract';
import { LoaderContract } from './lib/primitives/loader.contract';
import { PanelContract } from './lib/primitives/panel.contract';
import { ProgressContract } from './lib/primitives/progress.contract';
import { RadioGroupContract } from './lib/primitives/radio.contract';
import { SelectContract } from './lib/primitives/select.contract';
import { SkeletonContract } from './lib/primitives/skeleton.contract';
import { ToastContract } from './lib/primitives/toast.contract';
import { TooltipContract } from './lib/primitives/tooltip.contract';
import { TabBarContract } from './lib/patterns/tab-bar.contract';

/**
 * Every design-system component contract (23 primitives + 1 pattern),
 * aggregated for whole-system checks such as {@link verifyDsContracts}.
 */
export const ALL_CONTRACTS: readonly DsComponentContract[] = [
  // primitives
  AvatarContract,
  BadgeContract,
  BannerContract,
  BottomSheetContract,
  ButtonContract,
  CardContract,
  CheckboxContract,
  ChipContract,
  DialogContract,
  DividerContract,
  EmptyStateContract,
  IconContract,
  IconButtonContract,
  InputContract,
  LinkContract,
  LoaderContract,
  PanelContract,
  ProgressContract,
  RadioGroupContract,
  SelectContract,
  SkeletonContract,
  ToastContract,
  TooltipContract,
  // patterns
  TabBarContract,
];
