import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it, vi } from 'vitest';

import { DetailPageBase } from './detail-page-base';
import type { PageResource } from './page-resource';

interface Workflow {
  id: string;
}

function makeResource(initial: {
  value?: Workflow;
  isLoading?: boolean;
  error?: unknown;
} = {}): PageResource<Workflow> & {
  setValue: (v: Workflow | undefined) => void;
  setLoading: (v: boolean) => void;
  setError: (e: unknown) => void;
  reload: ReturnType<typeof vi.fn>;
} {
  const v = signal<Workflow | undefined>(initial.value);
  const l = signal<boolean>(initial.isLoading ?? false);
  const e = signal<unknown>(initial.error);
  const reload = vi.fn();
  return {
    value: () => v(),
    isLoading: () => l(),
    error: () => e(),
    reload,
    setValue: v.set,
    setLoading: l.set,
    setError: e.set,
  };
}

@Component({ standalone: true, template: '' })
class TestDetailPage extends DetailPageBase<Workflow> {
  protected override resource = makeResource({ isLoading: true });

  public readState() {
    return this.state();
  }
  public readEntity() {
    return this.entity();
  }
  public readIsLoading() {
    return this.isLoading();
  }
  public readError() {
    return this.error();
  }
  public callRetry() {
    this.onRetry();
  }
  public callBack() {
    this.onBack();
  }
  public setResource(value: Workflow | undefined, loading = false, error: unknown = undefined): void {
    const r = this.resource as ReturnType<typeof makeResource>;
    r.setValue(value);
    r.setLoading(loading);
    r.setError(error);
  }
  public getReloadSpy() {
    return (this.resource as ReturnType<typeof makeResource>).reload;
  }
}

function mount(): TestDetailPage {
  TestBed.resetTestingModule();
  TestBed.configureTestingModule({ imports: [TestDetailPage] });
  return TestBed.createComponent(TestDetailPage).componentInstance;
}

describe('DetailPageBase', () => {
  it("yields state='loading' while isLoading is true", () => {
    const c = mount();
    c.setResource(undefined, true);
    expect(c.readState()).toBe('loading');
  });

  it("yields state='error' on resource error", () => {
    const c = mount();
    c.setResource(undefined, false, new Error('nope'));
    expect(c.readState()).toBe('error');
    expect(c.readError()).toBeInstanceOf(Error);
  });

  it("yields state='not-found' when the resource resolves to undefined/null", () => {
    const c = mount();
    c.setResource(undefined, false);
    expect(c.readState()).toBe('not-found');
    expect(c.readEntity()).toBeNull();
  });

  it("yields state='data' when an entity is loaded", () => {
    const c = mount();
    c.setResource({ id: 'w1' }, false);
    expect(c.readState()).toBe('data');
    expect(c.readEntity()).toEqual({ id: 'w1' });
  });

  it('onRetry triggers a resource reload', () => {
    const c = mount();
    c.callRetry();
    expect(c.getReloadSpy()).toHaveBeenCalledTimes(1);
  });

  it('onBack calls history.back() by default', () => {
    const c = mount();
    const spy = vi.spyOn(history, 'back').mockImplementation(() => undefined);
    c.callBack();
    expect(spy).toHaveBeenCalledTimes(1);
    spy.mockRestore();
  });
});
