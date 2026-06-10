import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it, vi } from 'vitest';

import { FormPageBase, type FormPageMode } from './form-page-base';

interface Saved {
  id: string;
}
interface FormShape {
  value: () => { name: string };
}

@Component({ standalone: true, template: '' })
class TestFormPage extends FormPageBase<Saved, FormShape> {
  private readonly _mode = signal<FormPageMode>('create');
  saveSpy = vi.fn<(value: unknown) => Promise<Saved>>().mockResolvedValue({ id: 'new' });
  successSpy = vi.fn<(saved: Saved) => void>();

  protected override form: FormShape = { value: () => ({ name: 'Jane' }) };
  protected override mode(): FormPageMode {
    return this._mode();
  }

  protected override save(value: unknown): Promise<Saved> {
    return this.saveSpy(value);
  }

  protected override onSubmitSuccess(saved: Saved): void {
    this.successSpy(saved);
  }

  protected override readFormValue(): unknown {
    return this.form.value();
  }

  public setMode(m: FormPageMode) {
    this._mode.set(m);
  }
  public readMode() {
    return this.mode();
  }
  public readIsSubmitting() {
    return this.isSubmitting();
  }
  public readSubmitError() {
    return this.submitError();
  }
  public async callSubmit() {
    await this.onSubmit();
  }
  public callCancel() {
    this.onCancel();
  }
}

function mount(): TestFormPage {
  TestBed.resetTestingModule();
  TestBed.configureTestingModule({ imports: [TestFormPage] });
  return TestBed.createComponent(TestFormPage).componentInstance;
}

describe('FormPageBase', () => {
  it('exposes the mode signal', () => {
    const c = mount();
    expect(c.readMode()).toBe('create');
    c.setMode('edit');
    expect(c.readMode()).toBe('edit');
  });

  it('toggles isSubmitting around onSubmit and clears submitError on success', async () => {
    const c = mount();
    const states: boolean[] = [];
    const orig = c.saveSpy.getMockImplementation();
    if (!orig) throw new Error('saveSpy has no mock implementation');
    c.saveSpy.mockImplementation(async (v) => {
      states.push(c.readIsSubmitting());
      return orig(v);
    });
    await c.callSubmit();
    expect(states).toEqual([true]);
    expect(c.readIsSubmitting()).toBe(false);
    expect(c.readSubmitError()).toBeNull();
  });

  it('calls save with the typed form value and onSubmitSuccess with the saved entity', async () => {
    const c = mount();
    await c.callSubmit();
    expect(c.saveSpy).toHaveBeenCalledWith({ name: 'Jane' });
    expect(c.successSpy).toHaveBeenCalledWith({ id: 'new' });
  });

  it('captures save errors into submitError, does not throw, and resets isSubmitting', async () => {
    const c = mount();
    c.saveSpy.mockRejectedValueOnce(new Error('500'));
    await c.callSubmit();
    expect(c.readSubmitError()).toBeInstanceOf(Error);
    expect(c.readSubmitError()?.message).toBe('500');
    expect(c.readIsSubmitting()).toBe(false);
    expect(c.successSpy).not.toHaveBeenCalled();
  });

  it('re-entry into onSubmit while in flight is a no-op', async () => {
    const c = mount();
    let resolve!: (s: Saved) => void;
    c.saveSpy.mockImplementationOnce(() => new Promise<Saved>((r) => (resolve = r)));
    const p1 = c.callSubmit();
    const p2 = c.callSubmit();
    expect(c.saveSpy).toHaveBeenCalledTimes(1);
    resolve({ id: 'x' });
    await Promise.all([p1, p2]);
    expect(c.saveSpy).toHaveBeenCalledTimes(1);
  });

  it('onCancel calls history.back() by default', () => {
    const c = mount();
    const spy = vi.spyOn(history, 'back').mockImplementation(() => undefined);
    c.callCancel();
    expect(spy).toHaveBeenCalledTimes(1);
    spy.mockRestore();
  });
});
