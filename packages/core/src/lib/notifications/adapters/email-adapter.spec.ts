import { EmailAdapter } from './email-adapter';
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

describe('EmailAdapter', () => {
  let adapter: EmailAdapter;
  let fetchSpy: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    adapter = new EmailAdapter({
      smtpEndpoint: 'https://api.internal/send-email',
      from: 'noreply@acme.com',
    });
    fetchSpy = vi.fn().mockResolvedValue(new Response('ok'));
    vi.stubGlobal('fetch', fetchSpy);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should have name "email"', () => {
    expect(adapter.name).toBe('email');
  });

  it('should support all event types', () => {
    expect(adapter.supports('any')).toBe(true);
  });

  it('should POST to the smtp endpoint', async () => {
    await adapter.send(createEvent());
    expect(fetchSpy).toHaveBeenCalledTimes(1);
    expect(fetchSpy.mock.calls[0][0]).toBe('https://api.internal/send-email');
    expect(fetchSpy.mock.calls[0][1].method).toBe('POST');
  });

  it('should include from address in payload', async () => {
    await adapter.send(createEvent());
    const body = JSON.parse(fetchSpy.mock.calls[0][1].body);
    expect(body.from).toBe('noreply@acme.com');
  });

  it('should format subject with severity, product and type', async () => {
    await adapter.send(createEvent({
      severity: 'critical',
      product: 'lending',
      type: 'error.db',
    }));
    const body = JSON.parse(fetchSpy.mock.calls[0][1].body);
    expect(body.subject).toBe('[CRITICAL] [lending] error.db');
  });

  it('should include message as body', async () => {
    await adapter.send(createEvent({ message: 'DB connection lost' }));
    const body = JSON.parse(fetchSpy.mock.calls[0][1].body);
    expect(body.body).toBe('DB connection lost');
  });

  it('should include data and timestamp', async () => {
    const data = { pool: 'primary' };
    await adapter.send(createEvent({ data, timestamp: '2026-06-01T12:00:00Z' }));
    const body = JSON.parse(fetchSpy.mock.calls[0][1].body);
    expect(body.data).toEqual({ pool: 'primary' });
    expect(body.timestamp).toBe('2026-06-01T12:00:00Z');
  });
});
