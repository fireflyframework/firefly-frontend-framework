import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';

import { AlertService } from '../alert.service';
import { provideAlerts } from '../provide-alerts';
import { I18nService } from '../../i18n';
import { AlertConfirmService } from './alert-confirm.service';
import { Confirm, setConfirmInjector } from './confirm.decorator';
import { ConfirmService } from './confirm.service';
import { provideAlertConfirm } from './provide-confirm';

/** Lets the pending confirm() microtasks settle after resolveDialog(). */
async function settle(): Promise<void> {
  await Promise.resolve();
  await Promise.resolve();
}

describe('AlertConfirmService (integration with the real AlertService)', () => {
  let alerts: AlertService;
  let confirmService: ConfirmService;

  beforeEach(() => {
    setConfirmInjector(null as never);
    TestBed.configureTestingModule({
      providers: [provideAlerts(), provideAlertConfirm()],
    });
    confirmService = TestBed.inject(ConfirmService);
    alerts = TestBed.inject(AlertService);
  });

  it('provideAlertConfirm binds AlertConfirmService to the ConfirmService token', () => {
    expect(confirmService).toBeInstanceOf(AlertConfirmService);
  });

  it('confirm() opens one AlertService dialog with the mapped options', () => {
    void confirmService.confirm({
      title: 'Delete file?',
      message: 'This cannot be undone.',
      confirm: { label: 'Delete', variant: 'danger' },
      cancel: { label: 'Keep it' },
      icon: 'trash',
    });

    const dialogs = alerts.activeDialogs();
    expect(dialogs).toHaveLength(1);
    expect(dialogs[0].options).toEqual({
      type: 'destructive',
      title: 'Delete file?',
      message: 'This cannot be undone.',
      confirmLabel: 'Delete',
      cancelLabel: 'Keep it',
      destructiveConfirmText: undefined,
      icon: 'trash',
    });
  });

  it('defaults the cancel label and the info type for a plain confirmation', () => {
    void confirmService.confirm({ title: 'T', message: 'M' });

    const [dialog] = alerts.activeDialogs();
    expect(dialog.options.type).toBe('info');
    expect(dialog.options.cancelLabel).toBe('Cancel');
    expect(dialog.options.confirmLabel).toBeUndefined();
  });

  it('maps requireTypedWord to destructiveConfirmText and forces the destructive type', () => {
    void confirmService.confirm({
      title: 'T',
      message: 'M',
      requireTypedWord: 'DELETE',
    });

    const [dialog] = alerts.activeDialogs();
    expect(dialog.options.type).toBe('destructive');
    expect(dialog.options.destructiveConfirmText).toBe('DELETE');
  });

  it('resolves true when the dialog is confirmed, and removes it', async () => {
    const promise = confirmService.confirm({ title: 'T', message: 'M' });

    const [dialog] = alerts.activeDialogs();
    alerts.resolveDialog(dialog.id, { confirmed: true });

    await expect(promise).resolves.toBe(true);
    expect(alerts.activeDialogs()).toHaveLength(0);
  });

  it('resolves false when the dialog is cancelled', async () => {
    const promise = confirmService.confirm({ title: 'T', message: 'M' });

    const [dialog] = alerts.activeDialogs();
    alerts.resolveDialog(dialog.id, { confirmed: false });

    await expect(promise).resolves.toBe(false);
  });

  it('resolves i18n keys through I18nService when the app provides it', () => {
    TestBed.resetTestingModule();
    setConfirmInjector(null as never);
    TestBed.configureTestingModule({
      providers: [
        provideAlerts(),
        provideAlertConfirm(),
        {
          provide: I18nService,
          useValue: {
            translate: (key: string, params?: Record<string, unknown>) =>
              `${key}:${JSON.stringify(params ?? {})}`,
          },
        },
      ],
    });
    const service = TestBed.inject(ConfirmService);
    const localAlerts = TestBed.inject(AlertService);

    void service.confirm({
      title: 'CONFIRM.TITLE',
      message: 'CONFIRM.MESSAGE',
      confirm: { label: 'CONFIRM.OK' },
      params: { name: 'invoice' },
    });

    const [dialog] = localAlerts.activeDialogs();
    expect(dialog.options.title).toBe('CONFIRM.TITLE:{"name":"invoice"}');
    expect(dialog.options.message).toBe('CONFIRM.MESSAGE:{"name":"invoice"}');
    expect(dialog.options.confirmLabel).toBe('CONFIRM.OK:{"name":"invoice"}');
  });

  describe('@Confirm decorator through the real chain', () => {
    class Guarded {
      ran = 0;

      @Confirm<[string]>({ title: 'T', message: (id: string) => `Delete ${id}?` })
      async remove(id: string): Promise<string> {
        this.ran += 1;
        return id;
      }
    }

    it('runs the guarded method only after the dialog is confirmed', async () => {
      const guarded = new Guarded();
      const call = guarded.remove('42');
      await settle();

      expect(alerts.activeDialogs()).toHaveLength(1);
      expect(alerts.activeDialogs()[0].options.message).toBe('Delete 42?');
      expect(guarded.ran).toBe(0);

      alerts.resolveDialog(alerts.activeDialogs()[0].id, { confirmed: true });
      await expect(call).resolves.toBe('42');
      expect(guarded.ran).toBe(1);
    });

    it('skips the guarded method when the dialog is cancelled', async () => {
      const guarded = new Guarded();
      const call = guarded.remove('42');
      await settle();

      alerts.resolveDialog(alerts.activeDialogs()[0].id, { confirmed: false });
      await expect(call).resolves.toBeUndefined();
      expect(guarded.ran).toBe(0);
    });
  });
});
