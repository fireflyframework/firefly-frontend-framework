import { WebhookAdapter } from './webhook-adapter';
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

describe('WebhookAdapter', () => {
  let fetchSpy: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    fetchSpy = vi.fn().mockResolvedValue(new Response('ok'));
    vi.stubGlobal('fetch', fetchSpy);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should have name "webhook"', () => {
    const adapter = new WebhookAdapter({ url: 'https://api.test/events' });
    expect(adapter.name).toBe('webhook');
  });

  it('should support all event types', () => {
    const adapter = new WebhookAdapter({ url: 'https://api.test/events' });
    expect(adapter.supports('any')).toBe(true);
  });

  it('should POST the full event as JSON', async () => {
    const adapter = new WebhookAdapter({ url: 'https://api.test/events' });
    const event = createEvent({ data: { key: 'value' } });
    await adapter.send(event);

    expect(fetchSpy).toHaveBeenCalledTimes(1);
    expect(fetchSpy.mock.calls[0][0]).toBe('https://api.test/events');
    const body = JSON.parse(fetchSpy.mock.calls[0][1].body);
    expect(body.type).toBe('test.event');
    expect(body.product).toBe('test-app');
    expect(body.data).toEqual({ key: 'value' });
  });

  it('should include custom headers', async () => {
    const adapter = new WebhookAdapter({
      url: 'https://api.test/events',
      headers: { 'X-Api-Key': 'secret123' },
    });
    await adapter.send(createEvent());

    const headers = fetchSpy.mock.calls[0][1].headers;
    expect(headers['Content-Type']).toBe('application/json');
    expect(headers['X-Api-Key']).toBe('secret123');
  });

  it('should work without custom headers', async () => {
    const adapter = new WebhookAdapter({ url: 'https://api.test/events' });
    await adapter.send(createEvent());

    const headers = fetchSpy.mock.calls[0][1].headers;
    expect(headers['Content-Type']).toBe('application/json');
  });
});
