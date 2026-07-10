import { signal } from '@angular/core';
import { describe, expect, it, vi } from 'vitest';

import { createListState } from './list-state';
import type { PageResource } from './page-resource';

function makeResource<T>(initial: { value?: T; isLoading?: boolean; error?: unknown } = {}) {
  const value = signal<T | undefined>(initial.value);
  const isLoading = signal(initial.isLoading ?? false);
  const error = signal<unknown>(initial.error);
  const resource: PageResource<T> = {
    value: () => value(),
    isLoading: () => isLoading(),
    error: () => error(),
    reload: vi.fn(),
  };
  return { resource, value, isLoading, error };
}

describe('createListState', () => {
  it("reports 'loading' while the resource fetches", () => {
    const { resource } = makeResource<number[]>({ isLoading: true });
    const state = createListState(() => resource);
    expect(state.state()).toBe('loading');
    expect(state.items()).toEqual([]);
    expect(state.isLoading()).toBe(true);
  });

  it("reports 'error' and surfaces it, even over an empty list", () => {
    const { resource } = makeResource<number[]>({ error: new Error('boom'), value: [] });
    const state = createListState(() => resource);
    expect(state.state()).toBe('error');
    expect(state.error()).toBeInstanceOf(Error);
    expect(state.isEmpty()).toBe(false);
  });

  it("reports 'data' once items arrive", () => {
    const { resource } = makeResource<number[]>({ value: [1, 2] });
    const state = createListState(() => resource);
    expect(state.state()).toBe('data');
    expect(state.items()).toEqual([1, 2]);
  });

  it("distinguishes 'empty' from 'filtered-empty' via the filter getter", () => {
    const { resource } = makeResource<number[]>({ value: [] });
    const filtering = signal(false);
    const state = createListState(
      () => resource,
      () => filtering(),
    );
    expect(state.state()).toBe('empty');
    filtering.set(true);
    expect(state.state()).toBe('filtered-empty');
  });

  it('treats an undefined value as an empty list', () => {
    const { resource } = makeResource<number[]>();
    const state = createListState(() => resource);
    expect(state.items()).toEqual([]);
    expect(state.isEmpty()).toBe(true);
  });

  it('reacts to the resource changing after construction', () => {
    const { resource, value, isLoading } = makeResource<number[]>({ isLoading: true });
    const state = createListState(() => resource);
    expect(state.state()).toBe('loading');
    isLoading.set(false);
    value.set([1]);
    expect(state.state()).toBe('data');
  });
});
