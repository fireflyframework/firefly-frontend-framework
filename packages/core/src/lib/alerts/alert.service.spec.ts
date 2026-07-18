import { TestBed } from '@angular/core/testing';
import { I18nService } from '../i18n';
import { AlertService } from './alert.service';
import { provideAlerts } from './provide-alerts';

describe('AlertService — toasts & banners', () => {
  let service: AlertService;

  beforeEach(() => {
    vi.useFakeTimers();
    TestBed.configureTestingModule({ providers: [provideAlerts()] });
    service = TestBed.inject(AlertService);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // ---------------------------------------------------------------
  // Toasts
  // ---------------------------------------------------------------

  describe('toast()', () => {
    it('should add a toast to activeToasts', () => {
      service.toast('Hello', 'success');

      expect(service.activeToasts()).toHaveLength(1);
      expect(service.activeToasts()[0].message).toBe('Hello');
      expect(service.activeToasts()[0].type).toBe('success');
    });

    it('should auto-dismiss after default duration (3000ms)', () => {
      service.toast('Temp', 'info');
      expect(service.activeToasts()).toHaveLength(1);

      vi.advanceTimersByTime(2999);
      expect(service.activeToasts()).toHaveLength(1);

      vi.advanceTimersByTime(1);
      expect(service.activeToasts()).toHaveLength(0);
    });

    it('should use 5000ms duration for error toasts by default', () => {
      service.toast('Error occurred', 'error');

      vi.advanceTimersByTime(3000);
      expect(service.activeToasts()).toHaveLength(1);

      vi.advanceTimersByTime(2000);
      expect(service.activeToasts()).toHaveLength(0);
    });

    it('should respect custom duration', () => {
      service.toast('Custom', 'info', { duration: 1000 });

      vi.advanceTimersByTime(999);
      expect(service.activeToasts()).toHaveLength(1);

      vi.advanceTimersByTime(1);
      expect(service.activeToasts()).toHaveLength(0);
    });

    it('should stack multiple toasts in FIFO order', () => {
      service.toast('First', 'info');
      service.toast('Second', 'success');
      service.toast('Third', 'warning');

      const toasts = service.activeToasts();
      expect(toasts).toHaveLength(3);
      expect(toasts[0].message).toBe('First');
      expect(toasts[1].message).toBe('Second');
      expect(toasts[2].message).toBe('Third');
    });

    it('should limit visible toasts to maxVisibleToasts (5)', () => {
      for (let i = 0; i < 7; i++) {
        service.toast(`Toast ${i}`, 'info');
      }

      const toasts = service.activeToasts();
      expect(toasts).toHaveLength(5);
      expect(toasts[0].message).toBe('Toast 2');
      expect(toasts[4].message).toBe('Toast 6');
    });

    it('should preserve all alert types', () => {
      const types = [
        'success',
        'error',
        'warning',
        'info',
        'destructive',
        'custom',
      ] as const;
      types.forEach((type) => service.toast(`msg-${type}`, type));

      // 5 max visible, so first one is removed
      expect(service.activeToasts()).toHaveLength(5);
      service.activeToasts().forEach((t) => {
        expect(types).toContain(t.type);
      });
    });
  });

  // ---------------------------------------------------------------
  // dismiss()
  // ---------------------------------------------------------------

  describe('dismiss()', () => {
    it('should remove a specific toast by ID', () => {
      service.toast('A', 'info');
      service.toast('B', 'success');

      const idA = service.activeToasts()[0].id;
      service.dismiss(idA);

      expect(service.activeToasts()).toHaveLength(1);
      expect(service.activeToasts()[0].message).toBe('B');
    });

    it('should clear the auto-dismiss timer when dismissed manually', () => {
      service.toast('Manual', 'info');
      const id = service.activeToasts()[0].id;

      service.dismiss(id);
      expect(service.activeToasts()).toHaveLength(0);

      // Advancing time should not cause errors or re-add the toast
      vi.advanceTimersByTime(5000);
      expect(service.activeToasts()).toHaveLength(0);
    });

    it('should be a no-op for unknown IDs', () => {
      service.toast('A', 'info');
      service.dismiss('nonexistent');

      expect(service.activeToasts()).toHaveLength(1);
    });
  });

  // ---------------------------------------------------------------
  // pauseToast() / resumeToast()
  // ---------------------------------------------------------------

  describe('pauseToast() / resumeToast()', () => {
    it('should freeze auto-dismiss while paused', () => {
      service.toast('Pausable', 'info', { duration: 3000 });
      const id = service.activeToasts()[0].id;

      vi.advanceTimersByTime(1000);
      service.pauseToast(id);

      // Way beyond the original duration — must not close while paused
      vi.advanceTimersByTime(60_000);
      expect(service.activeToasts()).toHaveLength(1);
    });

    it('should close after the exact remaining time on resume', () => {
      service.toast('Resumable', 'info', { duration: 3000 });
      const id = service.activeToasts()[0].id;

      vi.advanceTimersByTime(1000);
      service.pauseToast(id);
      vi.advanceTimersByTime(10_000);

      service.resumeToast(id);

      vi.advanceTimersByTime(1999);
      expect(service.activeToasts()).toHaveLength(1);

      vi.advanceTimersByTime(1);
      expect(service.activeToasts()).toHaveLength(0);
    });

    it('pauseToast() should be a no-op for unknown IDs', () => {
      service.toast('A', 'info');
      service.pauseToast('nonexistent');

      vi.advanceTimersByTime(3000);
      expect(service.activeToasts()).toHaveLength(0);
    });

    it('resumeToast() should be a no-op for unknown IDs', () => {
      service.toast('A', 'info');
      service.resumeToast('nonexistent');

      vi.advanceTimersByTime(3000);
      expect(service.activeToasts()).toHaveLength(0);
    });

    it('pausing twice should keep the remaining time of the first pause', () => {
      service.toast('Twice', 'info', { duration: 3000 });
      const id = service.activeToasts()[0].id;

      vi.advanceTimersByTime(1000);
      service.pauseToast(id);

      vi.advanceTimersByTime(500);
      service.pauseToast(id); // no-op — already paused

      service.resumeToast(id);

      vi.advanceTimersByTime(1999);
      expect(service.activeToasts()).toHaveLength(1);

      vi.advanceTimersByTime(1);
      expect(service.activeToasts()).toHaveLength(0);
    });

    it('resumeToast() without a previous pause should not alter the active timer', () => {
      service.toast('Untouched', 'info', { duration: 3000 });
      const id = service.activeToasts()[0].id;

      service.resumeToast(id); // no-op — never paused

      vi.advanceTimersByTime(2999);
      expect(service.activeToasts()).toHaveLength(1);

      vi.advanceTimersByTime(1);
      expect(service.activeToasts()).toHaveLength(0);
    });

    it('dismiss() during pause should clean the pause state', () => {
      service.toast('Dismissed while paused', 'info', { duration: 3000 });
      const id = service.activeToasts()[0].id;

      vi.advanceTimersByTime(1000);
      service.pauseToast(id);
      service.dismiss(id);

      expect(service.activeToasts()).toHaveLength(0);

      // Resume after dismiss must be a no-op and never re-arm anything
      service.resumeToast(id);
      vi.advanceTimersByTime(10_000);
      expect(service.activeToasts()).toHaveLength(0);
    });
  });

  // ---------------------------------------------------------------
  // progressBar option
  // ---------------------------------------------------------------

  describe('progressBar option', () => {
    it('should travel in the toast entry options', () => {
      service.toast('With progress', 'info', {
        duration: 3000,
        progressBar: true,
      });

      expect(service.activeToasts()[0].options.progressBar).toBe(true);
    });

    it('should be undefined when not provided', () => {
      service.toast('No progress', 'info');

      expect(service.activeToasts()[0].options.progressBar).toBeUndefined();
    });
  });

  // ---------------------------------------------------------------
  // Banners
  // ---------------------------------------------------------------

  describe('banner()', () => {
    it('should add a banner to activeBanners', () => {
      service.banner('Maintenance', 'warning');

      expect(service.activeBanners()).toHaveLength(1);
      expect(service.activeBanners()[0].message).toBe('Maintenance');
      expect(service.activeBanners()[0].type).toBe('warning');
    });

    it('should persist until dismissBanner() when no duration set', () => {
      service.banner('Persistent', 'info');

      vi.advanceTimersByTime(60_000);
      expect(service.activeBanners()).toHaveLength(1);
    });

    it('should auto-dismiss when duration is set', () => {
      service.banner('Temp', 'success', { duration: 5000 });

      vi.advanceTimersByTime(4999);
      expect(service.activeBanners()).toHaveLength(1);

      vi.advanceTimersByTime(1);
      expect(service.activeBanners()).toHaveLength(0);
    });

    it('should limit visible banners to maxVisibleBanners (3)', () => {
      for (let i = 0; i < 5; i++) {
        service.banner(`Banner ${i}`, 'info');
      }

      const banners = service.activeBanners();
      expect(banners).toHaveLength(3);
      expect(banners[0].message).toBe('Banner 2');
      expect(banners[2].message).toBe('Banner 4');
    });
  });

  // ---------------------------------------------------------------
  // dismissBanner()
  // ---------------------------------------------------------------

  describe('dismissBanner()', () => {
    it('should remove a specific banner by ID', () => {
      service.banner('A', 'info');
      service.banner('B', 'warning');

      const idA = service.activeBanners()[0].id;
      service.dismissBanner(idA);

      expect(service.activeBanners()).toHaveLength(1);
      expect(service.activeBanners()[0].message).toBe('B');
    });

    it('should clear the auto-dismiss timer when dismissed manually', () => {
      service.banner('Timed', 'info', { duration: 3000 });
      const id = service.activeBanners()[0].id;

      service.dismissBanner(id);
      expect(service.activeBanners()).toHaveLength(0);

      vi.advanceTimersByTime(5000);
      expect(service.activeBanners()).toHaveLength(0);
    });
  });

  // ---------------------------------------------------------------
  // dismissAll()
  // ---------------------------------------------------------------

  describe('dismissAll()', () => {
    it('should clear all toasts and banners', () => {
      service.toast('T1', 'info');
      service.toast('T2', 'success');
      service.banner('B1', 'warning');

      service.dismissAll();

      expect(service.activeToasts()).toHaveLength(0);
      expect(service.activeBanners()).toHaveLength(0);
    });

    it('should clear all pending timers', () => {
      service.toast('T', 'info');
      service.banner('B', 'info', { duration: 5000 });

      service.dismissAll();

      // Advancing time should not cause errors
      vi.advanceTimersByTime(10_000);
      expect(service.activeToasts()).toHaveLength(0);
      expect(service.activeBanners()).toHaveLength(0);
    });

    it('should also clear bottom-sheets and dialogs', () => {
      service.toast('T', 'info');
      service.banner('B', 'warning');
      service.bottomSheet('BS', 'info');
      service.dialog({ type: 'info', message: 'D' });

      service.dismissAll();

      expect(service.activeToasts()).toHaveLength(0);
      expect(service.activeBanners()).toHaveLength(0);
      expect(service.activeBottomSheets()).toHaveLength(0);
      expect(service.activeDialogs()).toHaveLength(0);
    });

    it('should resolve pending dialogs as cancelled', async () => {
      const promise = service.dialog({ type: 'info', message: 'test' });
      service.dismissAll();

      const result = await promise;
      expect(result).toEqual({ confirmed: false });
    });
  });

  // ---------------------------------------------------------------
  // Bottom-sheets
  // ---------------------------------------------------------------

  describe('bottomSheet()', () => {
    it('should add a bottom-sheet to activeBottomSheets', () => {
      service.bottomSheet('Details', 'info');

      expect(service.activeBottomSheets()).toHaveLength(1);
      expect(service.activeBottomSheets()[0].message).toBe('Details');
      expect(service.activeBottomSheets()[0].type).toBe('info');
    });

    it('should preserve options', () => {
      service.bottomSheet('Actions', 'warning', {
        title: 'Choose action',
        dismissible: true,
        actions: [{ label: 'Delete', callback: () => undefined, type: 'destructive' }],
      });

      const bs = service.activeBottomSheets()[0];
      expect(bs.options.title).toBe('Choose action');
      expect(bs.options.actions).toHaveLength(1);
      expect(bs.options.actions![0].label).toBe('Delete');
    });
  });

  describe('dismissBottomSheet()', () => {
    it('should remove a specific bottom-sheet by ID', () => {
      service.bottomSheet('A', 'info');
      service.bottomSheet('B', 'warning');

      const idA = service.activeBottomSheets()[0].id;
      service.dismissBottomSheet(idA);

      expect(service.activeBottomSheets()).toHaveLength(1);
      expect(service.activeBottomSheets()[0].message).toBe('B');
    });
  });

  // ---------------------------------------------------------------
  // Dialogs (Promise-based)
  // ---------------------------------------------------------------

  describe('dialog()', () => {
    it('should add a dialog to activeDialogs', () => {
      service.dialog({ type: 'info', message: 'Are you sure?' });

      expect(service.activeDialogs()).toHaveLength(1);
      expect(service.activeDialogs()[0].options.message).toBe('Are you sure?');
    });

    it('should return a Promise that resolves with DialogResult', async () => {
      const promise = service.dialog({
        type: 'info',
        message: 'Confirm?',
        confirmLabel: 'Yes',
        cancelLabel: 'No',
      });

      const id = service.activeDialogs()[0].id;
      service.resolveDialog(id, { confirmed: true });

      const result = await promise;
      expect(result).toEqual({ confirmed: true });
    });

    it('should remove dialog from activeDialogs after resolve', async () => {
      const promise = service.dialog({ type: 'info', message: 'test' });
      const id = service.activeDialogs()[0].id;

      service.resolveDialog(id, { confirmed: false });
      await promise;

      expect(service.activeDialogs()).toHaveLength(0);
    });

    it('should store destructiveConfirmText in options', () => {
      service.dialog({
        type: 'destructive',
        message: 'Delete account?',
        destructiveConfirmText: 'DELETE',
      });

      expect(
        service.activeDialogs()[0].options.destructiveConfirmText,
      ).toBe('DELETE');
    });

    it('should handle multiple pending dialogs simultaneously', async () => {
      const p1 = service.dialog({ type: 'info', message: 'First' });
      const p2 = service.dialog({ type: 'warning', message: 'Second' });

      expect(service.activeDialogs()).toHaveLength(2);

      const id1 = service.activeDialogs()[0].id;
      const id2 = service.activeDialogs()[1].id;

      service.resolveDialog(id2, { confirmed: false });
      service.resolveDialog(id1, { confirmed: true });

      const [r1, r2] = await Promise.all([p1, p2]);
      expect(r1.confirmed).toBe(true);
      expect(r2.confirmed).toBe(false);
      expect(service.activeDialogs()).toHaveLength(0);
    });
  });

  describe('resolveDialog()', () => {
    it('should be a no-op for unknown IDs', () => {
      service.resolveDialog('nonexistent', { confirmed: true });
      expect(service.activeDialogs()).toHaveLength(0);
    });

    it('should support DialogResult with input', async () => {
      const promise = service.dialog({
        type: 'destructive',
        message: 'Confirm delete',
        destructiveConfirmText: 'DELETE',
      });

      const id = service.activeDialogs()[0].id;
      service.resolveDialog(id, { confirmed: true, input: 'DELETE' });

      const result = await promise;
      expect(result).toEqual({ confirmed: true, input: 'DELETE' });
    });
  });

  // ---------------------------------------------------------------
  // Convenience shortcuts
  // ---------------------------------------------------------------

  describe('shortcuts', () => {
    it('success() should create a toast by default', () => {
      service.success('Done!');

      expect(service.activeToasts()).toHaveLength(1);
      expect(service.activeToasts()[0].type).toBe('success');
    });

    it('error() should create a toast by default', () => {
      service.error('Failed');

      expect(service.activeToasts()).toHaveLength(1);
      expect(service.activeToasts()[0].type).toBe('error');
    });

    it('error toast should have 5000ms duration', () => {
      service.error('Failed');

      vi.advanceTimersByTime(3000);
      expect(service.activeToasts()).toHaveLength(1);

      vi.advanceTimersByTime(2000);
      expect(service.activeToasts()).toHaveLength(0);
    });

    it('warning() should create a toast by default', () => {
      service.warning('Careful');

      expect(service.activeToasts()).toHaveLength(1);
      expect(service.activeToasts()[0].type).toBe('warning');
    });

    it('info() should create a toast by default', () => {
      service.info('FYI');

      expect(service.activeToasts()).toHaveLength(1);
      expect(service.activeToasts()[0].type).toBe('info');
    });

    it('success() with banner format should create a banner', () => {
      service.success('Saved', 'banner');

      expect(service.activeToasts()).toHaveLength(0);
      expect(service.activeBanners()).toHaveLength(1);
      expect(service.activeBanners()[0].type).toBe('success');
    });

    it('error() with dialog format should create a dialog', () => {
      service.error('Critical error', 'dialog');

      expect(service.activeToasts()).toHaveLength(0);
      expect(service.activeDialogs()).toHaveLength(1);
      expect(service.activeDialogs()[0].options.type).toBe('error');
    });

    it('info() with bottom-sheet format should create a bottom-sheet', () => {
      service.info('Details', 'bottom-sheet');

      expect(service.activeToasts()).toHaveLength(0);
      expect(service.activeBottomSheets()).toHaveLength(1);
      expect(service.activeBottomSheets()[0].type).toBe('info');
    });
  });

  describe('confirm()', () => {
    it('should return true when confirmed', async () => {
      const promise = service.confirm('Are you sure?');

      const id = service.activeDialogs()[0].id;
      service.resolveDialog(id, { confirmed: true });

      expect(await promise).toBe(true);
    });

    it('should return false when cancelled', async () => {
      const promise = service.confirm('Are you sure?');

      const id = service.activeDialogs()[0].id;
      service.resolveDialog(id, { confirmed: false });

      expect(await promise).toBe(false);
    });

    it('should create a dialog with default labels', () => {
      service.confirm('Delete this?');

      const dialog = service.activeDialogs()[0];
      expect(dialog.options.type).toBe('info');
      expect(dialog.options.confirmLabel).toBe('Confirm');
      expect(dialog.options.cancelLabel).toBe('Cancel');
    });

    it('should allow overriding dialog options', () => {
      service.confirm('Delete?', {
        type: 'destructive',
        confirmLabel: 'Delete',
        cancelLabel: 'Keep',
      });

      const dialog = service.activeDialogs()[0];
      expect(dialog.options.type).toBe('destructive');
      expect(dialog.options.confirmLabel).toBe('Delete');
      expect(dialog.options.cancelLabel).toBe('Keep');
    });
  });
});

describe('AlertService — confirm(options) rich overload', () => {
  let service: AlertService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideAlerts()] });
    service = TestBed.inject(AlertService);
  });

  it('opens one dialog with the mapped options', () => {
    void service.confirm({
      title: 'Delete file?',
      message: 'This cannot be undone.',
      confirm: { label: 'Delete', variant: 'danger' },
      cancel: { label: 'Keep it' },
      icon: 'trash',
    });

    const dialogs = service.activeDialogs();
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
    void service.confirm({ title: 'T', message: 'M' });

    const [dialog] = service.activeDialogs();
    expect(dialog.options.type).toBe('info');
    expect(dialog.options.cancelLabel).toBe('Cancel');
    expect(dialog.options.confirmLabel).toBeUndefined();
  });

  it('maps the warning button variant to the warning dialog type', () => {
    void service.confirm({
      title: 'T',
      message: 'M',
      confirm: { variant: 'warning' },
    });

    expect(service.activeDialogs()[0].options.type).toBe('warning');
  });

  it('maps requireTypedWord to destructiveConfirmText and forces the destructive type', () => {
    void service.confirm({
      title: 'T',
      message: 'M',
      requireTypedWord: 'DELETE',
    });

    const [dialog] = service.activeDialogs();
    expect(dialog.options.type).toBe('destructive');
    expect(dialog.options.destructiveConfirmText).toBe('DELETE');
  });

  it('resolves true when the dialog is confirmed, and removes it', async () => {
    const promise = service.confirm({ title: 'T', message: 'M' });

    const [dialog] = service.activeDialogs();
    service.resolveDialog(dialog.id, { confirmed: true });

    await expect(promise).resolves.toBe(true);
    expect(service.activeDialogs()).toHaveLength(0);
  });

  it('resolves false when the dialog is cancelled', async () => {
    const promise = service.confirm({ title: 'T', message: 'M' });

    const [dialog] = service.activeDialogs();
    service.resolveDialog(dialog.id, { confirmed: false });

    await expect(promise).resolves.toBe(false);
  });

  it('never rejects — an unexpected failure resolves to false', async () => {
    vi.spyOn(service, 'dialog').mockRejectedValueOnce(new Error('boom'));

    await expect(
      service.confirm({ title: 'T', message: 'M' }),
    ).resolves.toBe(false);
  });

  it('resolves i18n keys through I18nService when the app provides it', () => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        provideAlerts(),
        {
          provide: I18nService,
          useValue: {
            translate: (key: string, params?: Record<string, unknown>) =>
              `${key}:${JSON.stringify(params ?? {})}`,
          },
        },
      ],
    });
    const localService = TestBed.inject(AlertService);

    void localService.confirm({
      title: 'CONFIRM.TITLE',
      message: 'CONFIRM.MESSAGE',
      confirm: { label: 'CONFIRM.OK' },
      params: { name: 'invoice' },
    });

    const [dialog] = localService.activeDialogs();
    expect(dialog.options.title).toBe('CONFIRM.TITLE:{"name":"invoice"}');
    expect(dialog.options.message).toBe('CONFIRM.MESSAGE:{"name":"invoice"}');
    expect(dialog.options.confirmLabel).toBe('CONFIRM.OK:{"name":"invoice"}');
  });

  it('passes strings through unchanged when no I18nService is provided', () => {
    void service.confirm({
      title: 'Literal title',
      message: 'Literal message',
      params: { unused: true },
    });

    const [dialog] = service.activeDialogs();
    expect(dialog.options.title).toBe('Literal title');
    expect(dialog.options.message).toBe('Literal message');
  });
});
