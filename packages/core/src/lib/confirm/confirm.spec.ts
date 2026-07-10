import { Component, Injectable, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { Confirm, setConfirmInjector } from './confirm.decorator';
import { ConfirmDirective } from './confirm.directive';
import { ConfirmService } from './confirm.service';
import { provideConfirm } from './provide-confirm';
import { resolveConfirmConfig, resolveConfirmInput, type ConfirmOptions } from './confirm.types';

/** Records what it was asked to confirm and answers whatever `answer` holds. */
@Injectable()
class FakeConfirmService extends ConfirmService {
  static answer = true;
  static seen: ConfirmOptions[] = [];

  confirm(options: ConfirmOptions): Promise<boolean> {
    FakeConfirmService.seen.push(options);
    return Promise.resolve(FakeConfirmService.answer);
  }
}

describe('resolveConfirmConfig', () => {
  it('passes literals through untouched', () => {
    const resolved = resolveConfirmConfig({ title: 'T', message: 'M' }, []);
    expect(resolved).toEqual({ title: 'T', message: 'M' });
  });

  it('applies per-field functions to the call args', () => {
    const resolved = resolveConfirmConfig<[string]>(
      { title: 'T', message: (name: string) => `Delete ${name}?` },
      ['invoice'],
    );
    expect(resolved.message).toBe('Delete invoice?');
  });

  it('resolves a nested button config', () => {
    const resolved = resolveConfirmConfig<[]>(
      { title: 'T', message: 'M', confirm: { label: 'L', variant: 'danger' } },
      [],
    );
    expect(resolved.confirm).toEqual({ label: 'L', variant: 'danger' });
  });
});

describe('resolveConfirmInput', () => {
  it('accepts a template function of the call args', () => {
    const template = (name: string): ConfirmOptions => ({ title: 'T', message: `Delete ${name}?` });
    expect(resolveConfirmInput(template, ['x']).message).toBe('Delete x?');
  });

  it('accepts a per-field config object', () => {
    expect(resolveConfirmInput({ title: 'T', message: 'M' }, []).title).toBe('T');
  });
});

describe('@Confirm', () => {
  class Guarded {
    ran = 0;

    @Confirm<[string]>({ title: 'T', message: (id: string) => `Delete ${id}?` })
    async remove(id: string): Promise<string> {
      this.ran += 1;
      return id;
    }
  }

  beforeEach(() => {
    FakeConfirmService.seen = [];
    FakeConfirmService.answer = true;
    setConfirmInjector(null as never);
    TestBed.configureTestingModule({ providers: [provideConfirm(FakeConfirmService)] });
    // `provideAppInitializer` runs on the first injector read.
    TestBed.inject(ConfirmService);
  });

  it('runs the wrapped method when the user confirms', async () => {
    const guarded = new Guarded();
    await expect(guarded.remove('42')).resolves.toBe('42');
    expect(guarded.ran).toBe(1);
    expect(FakeConfirmService.seen[0].message).toBe('Delete 42?');
  });

  it('skips the wrapped method and resolves undefined on cancel', async () => {
    FakeConfirmService.answer = false;
    const guarded = new Guarded();
    await expect(guarded.remove('42')).resolves.toBeUndefined();
    expect(guarded.ran).toBe(0);
  });

  it('throws a helpful error when provideConfirm() was never called', async () => {
    setConfirmInjector(null as never);
    await expect(new Guarded().remove('42')).rejects.toThrow(/provideConfirm\(\)/);
  });
});

describe('ConfirmDirective', () => {
  @Component({
    standalone: true,
    imports: [ConfirmDirective],
    template: `<button [ffConfirm]="{ title: 'T', message: 'M' }" (ffConfirmed)="onConfirmed()">
      Delete
    </button>`,
  })
  class Host {
    readonly confirmed = signal(0);
    onConfirmed(): void {
      this.confirmed.update((n) => n + 1);
    }
  }

  /** Clicks the button and lets the confirm promise settle. */
  async function clickAndSettle(): Promise<Host> {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    fixture.nativeElement.querySelector('button').click();
    await Promise.resolve();
    await Promise.resolve();
    return fixture.componentInstance;
  }

  beforeEach(() => {
    FakeConfirmService.seen = [];
    FakeConfirmService.answer = true;
    TestBed.configureTestingModule({ providers: [provideConfirm(FakeConfirmService)] });
  });

  it('emits ffConfirmed only after the user confirms', async () => {
    const host = await clickAndSettle();
    expect(host.confirmed()).toBe(1);
    expect(FakeConfirmService.seen[0]).toMatchObject({ title: 'T', message: 'M' });
  });

  it('does not emit on cancel', async () => {
    FakeConfirmService.answer = false;
    const host = await clickAndSettle();
    expect(host.confirmed()).toBe(0);
  });

  it('swallows the host click so the guarded action cannot fire first', async () => {
    const listener = vi.fn();
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const button = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
    button.addEventListener('click', listener);
    button.click();
    await Promise.resolve();
    expect(listener).not.toHaveBeenCalled();
  });
});
