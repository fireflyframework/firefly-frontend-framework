import { SlackAdapter } from './slack-adapter';
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

describe('SlackAdapter', () => {
  let adapter: SlackAdapter;
  let fetchSpy: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    adapter = new SlackAdapter({ webhookUrl: 'https://hooks.slack.com/test' });
    fetchSpy = vi.fn().mockResolvedValue(new Response('ok'));
    vi.stubGlobal('fetch', fetchSpy);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should have name "slack"', () => {
    expect(adapter.name).toBe('slack');
  });

  it('should support all event types', () => {
    expect(adapter.supports('any')).toBe(true);
  });

  it('should POST to the webhook URL', async () => {
    await adapter.send(createEvent());
    expect(fetchSpy).toHaveBeenCalledTimes(1);
    expect(fetchSpy.mock.calls[0][0]).toBe('https://hooks.slack.com/test');
    expect(fetchSpy.mock.calls[0][1].method).toBe('POST');
  });

  it('should send JSON content type', async () => {
    await adapter.send(createEvent());
    expect(fetchSpy.mock.calls[0][1].headers['Content-Type']).toBe('application/json');
  });

  it('should format message with severity emoji', async () => {
    await adapter.send(createEvent({ severity: 'critical', product: 'my-app', type: 'error.fatal', message: 'DB down' }));
    const body = JSON.parse(fetchSpy.mock.calls[0][1].body);
    expect(body.text).toContain('\uD83D\uDEA8');
    expect(body.text).toContain('[my-app]');
    expect(body.text).toContain('error.fatal');
    expect(body.text).toContain('DB down');
  });

  it('should use info emoji for info severity', async () => {
    await adapter.send(createEvent({ severity: 'info' }));
    const body = JSON.parse(fetchSpy.mock.calls[0][1].body);
    expect(body.text).toContain('\u2139\uFE0F');
  });

  it('should use warning emoji for warning severity', async () => {
    await adapter.send(createEvent({ severity: 'warning' }));
    const body = JSON.parse(fetchSpy.mock.calls[0][1].body);
    expect(body.text).toContain('\u26A0\uFE0F');
  });

  it('should use error emoji for error severity', async () => {
    await adapter.send(createEvent({ severity: 'error' }));
    const body = JSON.parse(fetchSpy.mock.calls[0][1].body);
    expect(body.text).toContain('\u274C');
  });
});
