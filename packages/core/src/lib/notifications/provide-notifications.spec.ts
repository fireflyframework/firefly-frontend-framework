import { TestBed } from '@angular/core/testing';
import { provideNotifications } from './provide-notifications';
import { NotificationService } from './notification.service';
import { NOTIFICATION_CONFIG, NotificationConfig } from './notification.types';

describe('provideNotifications', () => {
  function setup(options?: Parameters<typeof provideNotifications>[0]) {
    TestBed.configureTestingModule({
      providers: [provideNotifications(options)],
    });
  }

  it('should provide NotificationService', () => {
    setup();
    const service = TestBed.inject(NotificationService);
    expect(service).toBeInstanceOf(NotificationService);
  });

  it('should provide NOTIFICATION_CONFIG with console as default enabled adapter', () => {
    setup();
    const config = TestBed.inject(NOTIFICATION_CONFIG);
    expect(config.enabledAdapters).toContain('console');
  });

  it('should register ConsoleAdapter by default', async () => {
    setup();
    // Trigger initializers
    await TestBed.inject(NotificationService);
    const service = TestBed.inject(NotificationService);
    const adapters = service.getAdapters();
    expect(adapters.some(a => a.name === 'console')).toBe(true);
  });

  it('should register additional adapters from options', async () => {
    setup({
      adapters: ['slack', 'webhook'],
      slack: { webhookUrl: 'https://hooks.slack.com/test' },
      webhook: { url: 'https://api.test/events' },
    });
    const service = TestBed.inject(NotificationService);
    const adapters = service.getAdapters();
    expect(adapters.some(a => a.name === 'console')).toBe(true);
    expect(adapters.some(a => a.name === 'slack')).toBe(true);
    expect(adapters.some(a => a.name === 'webhook')).toBe(true);
  });

  it('should include adapter names in config.enabledAdapters', () => {
    setup({
      adapters: ['slack', 'email'],
      slack: { webhookUrl: 'https://hooks.slack.com/test' },
      email: { smtpEndpoint: 'https://api.test/email', from: 'no@test.com' },
    });
    const config = TestBed.inject(NOTIFICATION_CONFIG);
    expect(config.enabledAdapters).toEqual(['console', 'slack', 'email']);
  });

  it('should store adapter-specific config', () => {
    setup({
      adapters: ['slack'],
      slack: { webhookUrl: 'https://hooks.slack.com/test' },
    });
    const config = TestBed.inject(NOTIFICATION_CONFIG);
    expect(config.slack?.webhookUrl).toBe('https://hooks.slack.com/test');
  });

  it('should not register adapter if options for it are missing', async () => {
    setup({
      adapters: ['slack'],
      // slack options intentionally omitted
    });
    const service = TestBed.inject(NotificationService);
    const adapters = service.getAdapters();
    expect(adapters.some(a => a.name === 'slack')).toBe(false);
    expect(adapters.some(a => a.name === 'console')).toBe(true);
  });

  it('should work with no options at all', async () => {
    setup();
    const service = TestBed.inject(NotificationService);
    const config = TestBed.inject(NOTIFICATION_CONFIG);
    expect(service.getAdapters().length).toBeGreaterThanOrEqual(1);
    expect(config.enabledAdapters).toEqual(['console']);
  });
});
