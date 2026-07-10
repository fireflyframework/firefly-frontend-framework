import { afterNextRender, DestroyRef, ElementRef, inject } from '@angular/core';
import { readStorage, writeStorage, type StorageKind } from '@fireflyframework/utils/storage';

/** Configuration for {@link scrollMemory}. */
export interface ScrollMemoryOptions {
  /**
   * CSS selector of the scroll container the page lives inside — typically the
   * app shell's content area (`.shell-content` and the like). When omitted,
   * the nearest scrollable ancestor of the host element is used, which covers
   * the common shell layouts without any configuration.
   */
  containerSelector?: string;
  /**
   * Storage lifetime for the persisted offset. Defaults to `session`: a scroll
   * position is a "resume where I left off" affordance, not a preference.
   */
  storage?: StorageKind;
}

/** True when the element can scroll vertically under its own overflow rules. */
function isScrollable(element: HTMLElement): boolean {
  const overflowY = getComputedStyle(element).overflowY;
  return (
    (overflowY === 'auto' || overflowY === 'scroll') && element.scrollHeight > element.clientHeight
  );
}

/** Nearest ancestor (or self) that scrolls vertically, or `null`. */
function nearestScrollableAncestor(element: HTMLElement): HTMLElement | null {
  for (let node: HTMLElement | null = element; node; node = node.parentElement) {
    if (isScrollable(node)) return node;
  }
  return null;
}

/**
 * Scroll memory as a standalone composable: persists the scroll offset of the
 * page's scroll container when the host component is torn down (row click →
 * detail, any away-navigation) and restores it on the next visit — so "back"
 * resumes where the user left off.
 *
 * `key` is a **getter** so a base class can point at a field its subclass
 * assigns after construction (see {@link ListPageBase.scrollMemoryKey}); a
 * `null` key leaves the composable inert. The offset is stored under
 * `<key>.scrollTop`. Must run in an injection context.
 *
 * Restore runs strictly after render (`afterNextRender`), because app shells
 * commonly reset their scroll container to `0` on `NavigationEnd` and that
 * synchronous handler must settle first.
 *
 * `options` may itself be a getter, for the same reason `key` is: a base class
 * reading a subclass field during its own constructor would still observe the
 * base's default.
 */
export function scrollMemory(
  key: () => string | null,
  options: ScrollMemoryOptions | (() => ScrollMemoryOptions) = {},
): void {
  const hostElement = inject(ElementRef).nativeElement as HTMLElement;
  const resolveOptions = (): ScrollMemoryOptions =>
    typeof options === 'function' ? options() : options;

  const container = (selector: string | undefined): HTMLElement | null =>
    selector ? hostElement.closest(selector) : nearestScrollableAncestor(hostElement);

  afterNextRender(() => {
    const storageKey = key();
    if (!storageKey) return;
    const { containerSelector, storage = 'session' } = resolveOptions();
    const element = container(containerSelector);
    if (!element) return;
    const stored = Number(readStorage(storage, `${storageKey}.scrollTop`));
    if (Number.isFinite(stored) && stored > 0) element.scrollTop = stored;
  });

  inject(DestroyRef).onDestroy(() => {
    const storageKey = key();
    if (!storageKey) return;
    const { containerSelector, storage = 'session' } = resolveOptions();
    const element = container(containerSelector);
    if (!element) return;
    const offset = Math.round(element.scrollTop);
    if (offset >= 0) writeStorage(storage, `${storageKey}.scrollTop`, String(offset));
  });
}
