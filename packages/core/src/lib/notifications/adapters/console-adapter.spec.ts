import { ConsoleAdapter } from './console-adapter';
import { FireflyEvent } from '../notification.types';

function createEvent(overrides?: Partial<FireflyEvent>): FireflyEvent {
  return {
    type: 'test.event',
    product: 'test-app',
    severity: 'info',
    message: 'Test message',
    timestamp: '2026-01-01T00:00:00.000Z',
    ...overrides,
  };
}

describe('ConsoleAdapter', () => {
  let adapter: ConsoleAdapter;

  beforeEach(() => {
    adapter = new ConsoleAdapter();
  });

  it('should have name "console"', () => {
    expect(adapter.name).toBe('console');
  });

  it('should support all event types', () => {
    expect(adapter.supports('any.event')).toBe(true);
    expect(adapter.supports('error.critical')).toBe(true);
    expect(adapter.supports('')).toBe(true);
  });

  it('should log info events with console.log', async () => {
    const spy = vi.spyOn(console, 'log').mockImplementation(vi.fn());
    await adapter.send(createEvent({ severity: 'info' }));
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy.mock.calls[0][0]).toContain('[INFO]');
    expect(spy.mock.calls[0][0]).toContain('test-app');
    expect(spy.mock.calls[0][0]).toContain('test.event');
    spy.mockRestore();
  });

  it('should log warning events with console.warn', async () => {
    const spy = vi.spyOn(console, 'warn').mockImplementation(vi.fn());
    await adapter.send(createEvent({ severity: 'warning' }));
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy.mock.calls[0][0]).toContain('[WARN]');
    spy.mockRestore();
  });

  it('should log error events with console.error', async () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(vi.fn());
    await adapter.send(createEvent({ severity: 'error' }));
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy.mock.calls[0][0]).toContain('[ERROR]');
    spy.mockRestore();
  });

  it('should log critical events with console.error', async () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(vi.fn());
    await adapter.send(createEvent({ severity: 'critical' }));
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy.mock.calls[0][0]).toContain('[CRITICAL]');
    spy.mockRestore();
  });

  it('should include event data when present', async () => {
    const spy = vi.spyOn(console, 'log').mockImplementation(vi.fn());
    const data = { key: 'value' };
    await adapter.send(createEvent({ data }));
    expect(spy.mock.calls[0][1]).toEqual(data);
    spy.mockRestore();
  });

  it('should pass empty string when no data', async () => {
    const spy = vi.spyOn(console, 'log').mockImplementation(vi.fn());
    await adapter.send(createEvent());
    expect(spy.mock.calls[0][1]).toBe('');
    spy.mockRestore();
  });

  it('should format the log line correctly', async () => {
    const spy = vi.spyOn(console, 'log').mockImplementation(vi.fn());
    await adapter.send(createEvent({
      severity: 'info',
      product: 'my-app',
      type: 'deploy.complete',
      message: 'Deployment finished',
    }));
    expect(spy.mock.calls[0][0]).toBe('[INFO] [my-app] deploy.complete: Deployment finished');
    spy.mockRestore();
  });
});
