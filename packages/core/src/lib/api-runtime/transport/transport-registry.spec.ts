import { TestBed } from '@angular/core/testing';
import { TransportRegistry } from './transport-registry';
import { TransportAdapter } from './transport-adapter';
import { TransportError } from './transport-error';
import { TransportProtocol, TransportRequest, TransportResponse } from './transport-request';
import { TransportRoute } from './transport-route';

/** Minimal mock adapter for testing */
class MockTransportAdapter extends TransportAdapter {
  readonly protocol: TransportProtocol;
  readonly name: string;
  destroyCalled = false;

  constructor(protocol: TransportProtocol = 'http', name = 'MockAdapter') {
    super();
    this.protocol = protocol;
    this.name = name;
  }

  override request<T>(_req: TransportRequest): Promise<TransportResponse<T>> {
    return Promise.resolve({ data: {} as T, status: 200, headers: {}, durationMs: 0 });
  }

  override destroy(): void {
    this.destroyCalled = true;
  }
}

describe('TransportRegistry', () => {
  let registry: TransportRegistry;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    registry = TestBed.inject(TransportRegistry);
  });

  describe('resolve — exact route match', () => {
    it('should resolve exact route for a service', () => {
      const adapter = new MockTransportAdapter('http');
      registry.registerAdapter(adapter);
      registry.setRoutes([
        { service: 'lending-engine', protocol: 'http', baseUrl: 'https://lending.api.com' },
      ]);

      const resolved = registry.resolve('lending-engine');

      expect(resolved.adapter).toBe(adapter);
      expect(resolved.route.baseUrl).toBe('https://lending.api.com');
      expect(resolved.route.service).toBe('lending-engine');
    });
  });

  describe('resolve — wildcard fallback', () => {
    it('should fallback to wildcard when no exact match', () => {
      const adapter = new MockTransportAdapter('http');
      registry.registerAdapter(adapter);
      registry.setRoutes([
        { service: '*', protocol: 'http', baseUrl: 'https://default.api.com' },
      ]);

      const resolved = registry.resolve('unknown-service');

      expect(resolved.adapter).toBe(adapter);
      expect(resolved.route.baseUrl).toBe('https://default.api.com');
    });

    it('should prefer exact match over wildcard', () => {
      const adapter = new MockTransportAdapter('http');
      registry.registerAdapter(adapter);
      registry.setRoutes([
        { service: 'lending-engine', protocol: 'http', baseUrl: 'https://lending.api.com' },
        { service: '*', protocol: 'http', baseUrl: 'https://default.api.com' },
      ]);

      const resolved = registry.resolve('lending-engine');

      expect(resolved.route.baseUrl).toBe('https://lending.api.com');
    });
  });

  describe('resolve — error: no route and no wildcard', () => {
    it('should throw TransportError when no route and no wildcard', () => {
      const adapter = new MockTransportAdapter('http');
      registry.registerAdapter(adapter);
      registry.setRoutes([]);

      expect(() => registry.resolve('unknown-service')).toThrowError(TransportError);
    });

    it('should include service name in error message', () => {
      registry.setRoutes([]);

      try {
        registry.resolve('my-service');
        fail('Expected TransportError');
      } catch (e) {
        expect(e).toBeInstanceOf(TransportError);
        expect((e as TransportError).message).toContain("'my-service'");
        expect((e as TransportError).service).toBe('my-service');
        expect((e as TransportError).operation).toBe('resolve');
      }
    });
  });

  describe('resolve — error: no adapter for protocol', () => {
    it('should throw TransportError when no adapter registered for protocol', () => {
      registry.setRoutes([
        { service: 'grpc-service', protocol: 'grpc', baseUrl: 'https://grpc.api.com' },
      ]);

      expect(() => registry.resolve('grpc-service')).toThrowError(TransportError);
    });

    it('should include actionable message with provider name', () => {
      registry.setRoutes([
        { service: '*', protocol: 'grpc', baseUrl: 'https://grpc.api.com' },
      ]);

      try {
        registry.resolve('any-service');
        fail('Expected TransportError');
      } catch (e) {
        expect(e).toBeInstanceOf(TransportError);
        expect((e as TransportError).message).toContain('provideGrpcTransport()');
        expect((e as TransportError).protocol).toBe('grpc');
      }
    });
  });

  describe('resolve — template {service} expansion', () => {
    it('should expand {service} in baseUrl', () => {
      const adapter = new MockTransportAdapter('http');
      registry.registerAdapter(adapter);
      registry.setRoutes([
        { service: '*', protocol: 'http', baseUrl: 'https://{service}.firefly.bank' },
      ]);

      const resolved = registry.resolve('lending-engine');

      expect(resolved.route.baseUrl).toBe('https://lending-engine.firefly.bank');
    });
  });

  describe('registerAdapter', () => {
    it('should overwrite existing adapter for same protocol', () => {
      const adapter1 = new MockTransportAdapter('http', 'Adapter1');
      const adapter2 = new MockTransportAdapter('http', 'Adapter2');
      registry.registerAdapter(adapter1);
      registry.registerAdapter(adapter2);
      registry.setRoutes([{ service: '*', protocol: 'http', baseUrl: 'https://api.com' }]);

      const resolved = registry.resolve('any');

      expect(resolved.adapter).toBe(adapter2);
      expect(resolved.adapter.name).toBe('Adapter2');
    });
  });

  describe('setRoutes', () => {
    it('should replace routes entirely', () => {
      const adapter = new MockTransportAdapter('http');
      registry.registerAdapter(adapter);

      registry.setRoutes([{ service: 'old-service', protocol: 'http', baseUrl: 'https://old.com' }]);
      registry.setRoutes([{ service: 'new-service', protocol: 'http', baseUrl: 'https://new.com' }]);

      expect(() => registry.resolve('old-service')).toThrowError(TransportError);

      const resolved = registry.resolve('new-service');
      expect(resolved.route.baseUrl).toBe('https://new.com');
    });
  });

  describe('destroyAll', () => {
    it('should call destroy on all registered adapters and clear them', () => {
      const httpAdapter = new MockTransportAdapter('http', 'HttpAdapter');
      const grpcAdapter = new MockTransportAdapter('grpc', 'GrpcAdapter');
      registry.registerAdapter(httpAdapter);
      registry.registerAdapter(grpcAdapter);
      registry.setRoutes([{ service: '*', protocol: 'http', baseUrl: 'https://api.com' }]);

      registry.destroyAll();

      expect(httpAdapter.destroyCalled).toBe(true);
      expect(grpcAdapter.destroyCalled).toBe(true);
      // After destroyAll, adapters are cleared — resolve should fail
      expect(() => registry.resolve('any')).toThrowError(TransportError);
    });
  });

  describe('configuredServices computed signal', () => {
    it('should reflect configured service names', () => {
      registry.setRoutes([
        { service: 'lending-engine', protocol: 'http', baseUrl: 'https://lending.com' },
        { service: 'exp-security', protocol: 'http', baseUrl: 'https://security.com' },
        { service: '*', protocol: 'http', baseUrl: 'https://default.com' },
      ]);

      expect(registry.configuredServices()).toEqual(['lending-engine', 'exp-security', '*']);
    });
  });

  describe('multiple adapters coexist', () => {
    it('should resolve different services to different adapters', () => {
      const httpAdapter = new MockTransportAdapter('http', 'HttpAdapter');
      const grpcAdapter = new MockTransportAdapter('grpc', 'GrpcAdapter');
      registry.registerAdapter(httpAdapter);
      registry.registerAdapter(grpcAdapter);
      registry.setRoutes([
        { service: 'rest-service', protocol: 'http', baseUrl: 'https://rest.com' },
        { service: 'grpc-service', protocol: 'grpc', baseUrl: 'https://grpc.com' },
      ]);

      const restResolved = registry.resolve('rest-service');
      const grpcResolved = registry.resolve('grpc-service');

      expect(restResolved.adapter.name).toBe('HttpAdapter');
      expect(grpcResolved.adapter.name).toBe('GrpcAdapter');
    });
  });
});
