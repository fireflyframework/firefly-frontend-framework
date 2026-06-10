import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it, vi } from 'vitest';

import { DashboardPageBase } from './dashboard-page-base';
import type { PageResource } from './page-resource';

function makeWidget(initial: { loading?: boolean; error?: unknown } = {}): PageResource<unknown> & {
  setLoading: (v: boolean) => void;
  setError: (e: unknown) => void;
  reload: ReturnType<typeof vi.fn>;
} {
  const l = signal<boolean>(initial.loading ?? false);
  const e = signal<unknown>(initial.error);
  const reload = vi.fn();
  return {
    value: () => undefined,
    isLoading: () => l(),
    error: () => e(),
    reload,
    setLoading: l.set,
    setError: e.set,
  };
}

@Component({ standalone: true, template: '' })
class TestDashboardPage extends DashboardPageBase {
  w1 = makeWidget();
  w2 = makeWidget();
  w3 = makeWidget();
  protected override widgets = [this.w1, this.w2, this.w3] as const;

  public readIsLoading() {
    return this.isLoading();
  }
  public readError() {
    return this.error();
  }
  public callRefreshAll() {
    this.refreshAll();
  }
}

function mount(): TestDashboardPage {
  TestBed.resetTestingModule();
  TestBed.configureTestingModule({ imports: [TestDashboardPage] });
  return TestBed.createComponent(TestDashboardPage).componentInstance;
}

describe('DashboardPageBase', () => {
  it('isLoading is true while any widget is loading', () => {
    const c = mount();
    expect(c.readIsLoading()).toBe(false);
    c.w2.setLoading(true);
    expect(c.readIsLoading()).toBe(true);
    c.w2.setLoading(false);
    expect(c.readIsLoading()).toBe(false);
  });

  it('error surfaces the first widget error, or null if all clean', () => {
    const c = mount();
    expect(c.readError()).toBeNull();
    c.w3.setError(new Error('w3 boom'));
    expect(c.readError()?.message).toBe('w3 boom');
    c.w1.setError(new Error('w1 boom'));
    // first non-null in iteration order
    expect(c.readError()?.message).toBe('w1 boom');
  });

  it('coerces non-Error errors to Error instances', () => {
    const c = mount();
    c.w2.setError('plain string');
    expect(c.readError()).toBeInstanceOf(Error);
    expect(c.readError()?.message).toBe('plain string');
  });

  it('refreshAll calls reload() on every widget once', () => {
    const c = mount();
    c.callRefreshAll();
    expect(c.w1.reload).toHaveBeenCalledTimes(1);
    expect(c.w2.reload).toHaveBeenCalledTimes(1);
    expect(c.w3.reload).toHaveBeenCalledTimes(1);
  });
});
