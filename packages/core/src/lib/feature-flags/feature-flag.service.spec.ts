import { TestBed } from '@angular/core/testing';
import { FeatureFlagService, FEATURE_FLAG_CONFIG } from './feature-flag.service';
import { provideFeatureFlags } from './provide-feature-flags';

describe('FeatureFlagService', () => {
  let service: FeatureFlagService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideFeatureFlags()] });
    service = TestBed.inject(FeatureFlagService);
  });

  it('should start with empty flags', () => {
    expect(service.flags()).toEqual(new Map());
  });

  describe('setFlag', () => {
    it('should set a single flag', () => {
      service.setFlag('new-dashboard', true);

      expect(service.flags().get('new-dashboard')).toBe(true);
    });

    it('should overwrite an existing flag', () => {
      service.setFlag('new-dashboard', true);
      service.setFlag('new-dashboard', false);

      expect(service.flags().get('new-dashboard')).toBe(false);
    });
  });

  describe('setFlags', () => {
    it('should merge multiple flags', () => {
      service.setFlags({ alpha: true, beta: false });

      expect(service.flags().get('alpha')).toBe(true);
      expect(service.flags().get('beta')).toBe(false);
    });

    it('should preserve existing flags not in the input', () => {
      service.setFlag('existing', true);
      service.setFlags({ newFlag: true });

      expect(service.flags().get('existing')).toBe(true);
      expect(service.flags().get('newFlag')).toBe(true);
    });
  });

  describe('isEnabled', () => {
    it('should return false for unknown flags', () => {
      expect(service.isEnabled('unknown')()).toBe(false);
    });

    it('should return true when flag is enabled', () => {
      service.setFlag('feature-x', true);

      expect(service.isEnabled('feature-x')()).toBe(true);
    });

    it('should return false when flag is disabled', () => {
      service.setFlag('feature-x', false);

      expect(service.isEnabled('feature-x')()).toBe(false);
    });

    it('should react to flag changes', () => {
      const enabled = service.isEnabled('feature-x');
      expect(enabled()).toBe(false);

      service.setFlag('feature-x', true);
      expect(enabled()).toBe(true);

      service.setFlag('feature-x', false);
      expect(enabled()).toBe(false);
    });

    it('should return the same signal instance for the same flag name', () => {
      const first = service.isEnabled('feature-x');
      const second = service.isEnabled('feature-x');

      expect(first).toBe(second);
    });
  });

  describe('loadFlags', () => {
    it('should load static defaults', async () => {
      await service.loadFlags('static', {
        defaults: { alpha: true, beta: false },
      });

      expect(service.isEnabled('alpha')()).toBe(true);
      expect(service.isEnabled('beta')()).toBe(false);
    });

    it('should ignore static load when no defaults provided', async () => {
      await service.loadFlags('static', {});

      expect(service.flags().size).toBe(0);
    });

    it('should load flags from localStorage', async () => {
      localStorage.setItem('ff-flags', JSON.stringify({ local: true }));

      await service.loadFlags('localStorage');

      expect(service.isEnabled('local')()).toBe(true);

      localStorage.removeItem('ff-flags');
    });

    it('should ignore invalid localStorage data', async () => {
      localStorage.setItem('ff-flags', JSON.stringify([1, 2, 3]));

      await service.loadFlags('localStorage');

      expect(service.flags().size).toBe(0);

      localStorage.removeItem('ff-flags');
    });

    it('should ignore missing localStorage key', async () => {
      localStorage.removeItem('ff-flags');

      await service.loadFlags('localStorage');

      expect(service.flags().size).toBe(0);
    });

    it('should load flags from endpoint', async () => {
      const mockResponse = { endpoint: true };
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      await service.loadFlags('endpoint', {
        endpointUrl: 'https://flags.example.com/api',
      });

      expect(service.isEnabled('endpoint')()).toBe(true);
      expect(globalThis.fetch).toHaveBeenCalledWith(
        'https://flags.example.com/api',
      );
    });

    it('should ignore endpoint when no URL provided', async () => {
      await service.loadFlags('endpoint', {});

      expect(service.flags().size).toBe(0);
    });

    it('should use custom loader when provided', async () => {
      const loader = vi.fn().mockResolvedValue({ custom: true });

      await service.loadFlags('static', { loader });

      expect(loader).toHaveBeenCalled();
      expect(service.isEnabled('custom')()).toBe(true);
    });

    it('should prioritize loader over source', async () => {
      const loader = vi
        .fn()
        .mockResolvedValue({ 'from-loader': true });

      await service.loadFlags('static', {
        defaults: { 'from-static': true },
        loader,
      });

      expect(service.isEnabled('from-loader')()).toBe(true);
      expect(service.isEnabled('from-static')()).toBe(false);
    });

    it('should load from a registered custom source', async () => {
      const firebaseLoader = vi.fn().mockResolvedValue({ 'fb-flag': true });
      service.registerSource('firebase', firebaseLoader);

      await service.loadFlags('firebase');

      expect(firebaseLoader).toHaveBeenCalled();
      expect(service.isEnabled('fb-flag')()).toBe(true);
    });

    it('should prioritize config.loader over registered source', async () => {
      const registered = vi.fn().mockResolvedValue({ reg: true });
      const configLoader = vi.fn().mockResolvedValue({ cfg: true });
      service.registerSource('custom', registered);

      await service.loadFlags('custom', { loader: configLoader });

      expect(configLoader).toHaveBeenCalled();
      expect(registered).not.toHaveBeenCalled();
      expect(service.isEnabled('cfg')()).toBe(true);
    });

    it('should do nothing for unregistered unknown source', async () => {
      await service.loadFlags('unknown-source');

      expect(service.flags().size).toBe(0);
    });
  });

  describe('registerSource', () => {
    it('should register a custom source', async () => {
      const loader = vi.fn().mockResolvedValue({ custom: true });
      service.registerSource('my-source', loader);

      await service.loadFlags('my-source');

      expect(service.isEnabled('custom')()).toBe(true);
    });

    it('should allow overriding a registered source', async () => {
      const loaderV1 = vi.fn().mockResolvedValue({ v1: true });
      const loaderV2 = vi.fn().mockResolvedValue({ v2: true });

      service.registerSource('source', loaderV1);
      service.registerSource('source', loaderV2);

      await service.loadFlags('source');

      expect(loaderV1).not.toHaveBeenCalled();
      expect(loaderV2).toHaveBeenCalled();
      expect(service.isEnabled('v2')()).toBe(true);
    });
  });

  describe('loadFromSources', () => {
    it('should load and merge from multiple sources', async () => {
      service.registerSource('source-a', async () => ({ a: true }));
      service.registerSource('source-b', async () => ({ b: true }));

      await service.loadFromSources(['source-a', 'source-b']);

      expect(service.isEnabled('a')()).toBe(true);
      expect(service.isEnabled('b')()).toBe(true);
    });

    it('should let later sources override earlier ones', async () => {
      service.registerSource('base', async () => ({ flag: false }));
      service.registerSource('override', async () => ({ flag: true }));

      await service.loadFromSources(['base', 'override']);

      expect(service.isEnabled('flag')()).toBe(true);
    });

    it('should mix built-in and custom sources', async () => {
      service.registerSource('custom', async () => ({ custom: true }));

      await service.loadFromSources(['static', 'custom'], {
        defaults: { builtin: true },
      });

      expect(service.isEnabled('builtin')()).toBe(true);
      expect(service.isEnabled('custom')()).toBe(true);
    });
  });

  describe('flagsChanged', () => {
    it('should start at 0', () => {
      expect(service.flagsChanged()).toBe(0);
    });

    it('should increment on setFlag', () => {
      service.setFlag('a', true);

      expect(service.flagsChanged()).toBe(1);
    });

    it('should increment on setFlags', () => {
      service.setFlags({ a: true, b: true });

      expect(service.flagsChanged()).toBe(1);
    });

    it('should increment on clear', () => {
      service.setFlag('a', true);
      const before = service.flagsChanged();

      service.clear();

      expect(service.flagsChanged()).toBe(before + 1);
    });

    it('should track cumulative mutations', () => {
      service.setFlag('a', true);
      service.setFlag('b', true);
      service.setFlags({ c: true });
      service.clear();

      expect(service.flagsChanged()).toBe(4);
    });
  });

  describe('snapshot', () => {
    it('should return current flag state as plain object', () => {
      service.setFlags({ alpha: true, beta: false });

      expect(service.snapshot()).toEqual({
        flags: { alpha: true, beta: false },
      });
    });

    it('should return empty object when no flags set', () => {
      expect(service.snapshot()).toEqual({ flags: {} });
    });
  });

  describe('clear', () => {
    it('should remove all flags', () => {
      service.setFlags({ alpha: true, beta: true });
      service.clear();

      expect(service.flags().size).toBe(0);
    });

    it('should update existing computed signals after clear', () => {
      service.setFlag('feature-x', true);
      const enabled = service.isEnabled('feature-x');
      expect(enabled()).toBe(true);

      service.clear();

      expect(enabled()).toBe(false);
    });

    it('should return empty snapshot after clear', () => {
      service.setFlags({ alpha: true });
      service.clear();

      expect(service.snapshot()).toEqual({ flags: {} });
    });
  });
});

describe('FeatureFlagService with config', () => {
  it('should load defaults from injected config', () => {
    TestBed.configureTestingModule({
      providers: [
        provideFeatureFlags({ defaults: { 'pre-loaded': true } }),
      ],
    });

    const service = TestBed.inject(FeatureFlagService);

    expect(service.isEnabled('pre-loaded')()).toBe(true);
  });
});
