import { NoopAdapter } from './noop-adapter';
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

describe('NoopAdapter', () => {
  let adapter: NoopAdapter;

  beforeEach(() => {
    adapter = new NoopAdapter();
  });

  it('should have name "noop"', () => {
    expect(adapter.name).toBe('noop');
  });

  it('should support all event types', () => {
    expect(adapter.supports('any.event')).toBe(true);
    expect(adapter.supports('')).toBe(true);
  });

  it('should resolve without doing anything', async () => {
    const spy = vi.spyOn(console, 'log').mockImplementation(vi.fn());
    await expect(adapter.send(createEvent())).resolves.toBeUndefined();
    expect(spy).not.toHaveBeenCalled();
    spy.mockRestore();
  });

  it('should handle multiple sends without side effects', async () => {
    await adapter.send(createEvent());
    await adapter.send(createEvent({ severity: 'critical' }));
    await adapter.send(createEvent({ type: 'error.fatal' }));
    // If we got here without error, test passes
  });
});
