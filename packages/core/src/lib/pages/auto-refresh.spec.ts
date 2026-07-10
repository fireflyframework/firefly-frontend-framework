import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { autoRefresh } from './auto-refresh';
import type { PageResource } from './page-resource';

const reload = vi.fn();
const resource: PageResource<unknown> = {
  value: () => undefined,
  isLoading: () => false,
  error: () => undefined,
  reload,
};

/** Host that wires `autoRefresh` with a per-test interval. */
function mount(intervalMs: number | null) {
  @Component({ standalone: true, template: '' })
  class Host {
    constructor() {
      autoRefresh(
        () => intervalMs,
        () => resource,
      );
    }
  }
  const fixture = TestBed.createComponent(Host);
  fixture.detectChanges();
  TestBed.tick(); // flushes the `afterNextRender` that installs the timer
  return fixture;
}

/** jsdom leaves `document.hidden` at false; this flips it for one test. */
function setHidden(hidden: boolean): void {
  Object.defineProperty(document, 'hidden', { value: hidden, configurable: true });
}

describe('autoRefresh', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    reload.mockClear();
    setHidden(false);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('reloads the resource on every tick', () => {
    mount(1000);
    vi.advanceTimersByTime(3000);
    expect(reload).toHaveBeenCalledTimes(3);
  });

  it('skips the tick while the tab is in the background', () => {
    mount(1000);
    setHidden(true);
    vi.advanceTimersByTime(2000);
    expect(reload).not.toHaveBeenCalled();

    setHidden(false);
    vi.advanceTimersByTime(1000);
    expect(reload).toHaveBeenCalledTimes(1);
  });

  it('stays inert for a null or non-positive interval', () => {
    mount(null);
    vi.advanceTimersByTime(5000);
    expect(reload).not.toHaveBeenCalled();

    mount(0);
    vi.advanceTimersByTime(5000);
    expect(reload).not.toHaveBeenCalled();
  });

  it('clears the timer when the host is destroyed', () => {
    const fixture = mount(1000);
    vi.advanceTimersByTime(1000);
    const callsBeforeDestroy = reload.mock.calls.length;
    fixture.destroy();
    vi.advanceTimersByTime(5000);
    expect(reload).toHaveBeenCalledTimes(callsBeforeDestroy);
  });
});
