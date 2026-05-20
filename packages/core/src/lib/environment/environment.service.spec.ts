import { TestBed } from '@angular/core/testing';
import { EnvironmentService, ENVIRONMENT_CONFIG } from './environment.service';
import type { EnvironmentConfig } from './environment.types';

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const MULTI_ENV_CONFIG: EnvironmentConfig = {
  default: 'dev',
  environments: {
    dev: {
      apiBaseUrl: 'http://localhost:3000',
      services: {
        lending: 'http://localhost:3001',
        auth: 'http://localhost:4000',
      },
      flags: { enableBeta: true, debugMode: true },
    },
    staging: {
      apiBaseUrl: 'https://api.stg.firefly.com',
      services: {
        lending: 'https://lending.stg.firefly.com',
      },
      flags: { enableBeta: true, debugMode: false },
    },
    production: {
      apiBaseUrl: 'https://api.firefly.com',
      flags: { enableBeta: false },
    },
  },
};

const PROTECTED_CONFIG: EnvironmentConfig = {
  ...MULTI_ENV_CONFIG,
  protectedFields: ['currentEnv', 'apiBaseUrl', 'flags'],
};

// ---------------------------------------------------------------------------
// Tests — no config (defaults)
// ---------------------------------------------------------------------------

describe('EnvironmentService (no config)', () => {
  let service: EnvironmentService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [EnvironmentService],
    });
    service = TestBed.inject(EnvironmentService);
  });

  it('should default currentEnv to dev', () => {
    expect(service.currentEnv()).toBe('dev');
  });

  it('should default config to null', () => {
    expect(service.config()).toBeNull();
  });

  it('should return fallback apiBaseUrl http://localhost', () => {
    expect(service.getApiUrl()).toBe('http://localhost');
  });

  it('should return fallback apiBaseUrl when requesting unknown service', () => {
    expect(service.getApiUrl('lending')).toBe('http://localhost');
  });

  it('isDev should be true by default', () => {
    expect(service.isDev()).toBe(true);
  });

  it('isStaging should be false by default', () => {
    expect(service.isStaging()).toBe(false);
  });

  it('isProduction should be false by default', () => {
    expect(service.isProduction()).toBe(false);
  });

  it('getFlag should return undefined when no config', () => {
    expect(service.getFlag('anything')).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// Tests — with injected config
// ---------------------------------------------------------------------------

describe('EnvironmentService (injected config)', () => {
  let service: EnvironmentService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        EnvironmentService,
        { provide: ENVIRONMENT_CONFIG, useValue: MULTI_ENV_CONFIG },
      ],
    });
    service = TestBed.inject(EnvironmentService);
  });

  // --- loadConfig ---

  describe('loadConfig', () => {
    it('should set currentEnv to config.default', () => {
      expect(service.currentEnv()).toBe('dev');
    });

    it('should expose config via signal', () => {
      expect(service.config()).toEqual(MULTI_ENV_CONFIG);
    });

    it('should replace config when called again', () => {
      const newConfig: EnvironmentConfig = {
        default: 'staging',
        environments: {
          staging: { apiBaseUrl: 'https://new-staging.com' },
        },
      };
      service.loadConfig(newConfig);
      expect(service.currentEnv()).toBe('staging');
      expect(service.config()).toEqual(newConfig);
    });
  });

  // --- getApiUrl ---

  describe('getApiUrl', () => {
    it('should return apiBaseUrl for current env', () => {
      expect(service.getApiUrl()).toBe('http://localhost:3000');
    });

    it('should return service-specific URL when service exists', () => {
      expect(service.getApiUrl('lending')).toBe('http://localhost:3001');
    });

    it('should return service-specific URL for auth', () => {
      expect(service.getApiUrl('auth')).toBe('http://localhost:4000');
    });

    it('should fallback to apiBaseUrl for unknown service', () => {
      expect(service.getApiUrl('unknown')).toBe('http://localhost:3000');
    });

    it('should reflect environment change', () => {
      service.setEnvironment('staging');
      expect(service.getApiUrl()).toBe('https://api.stg.firefly.com');
      expect(service.getApiUrl('lending')).toBe('https://lending.stg.firefly.com');
    });

    it('should fallback to apiBaseUrl when env has no services', () => {
      service.setEnvironment('production');
      expect(service.getApiUrl('lending')).toBe('https://api.firefly.com');
    });
  });

  // --- isDev / isStaging / isProduction ---

  describe('environment checks', () => {
    it('isDev should be true when env is dev', () => {
      expect(service.isDev()).toBe(true);
      expect(service.isStaging()).toBe(false);
      expect(service.isProduction()).toBe(false);
    });

    it('isStaging should be true after switching', () => {
      service.setEnvironment('staging');
      expect(service.isDev()).toBe(false);
      expect(service.isStaging()).toBe(true);
      expect(service.isProduction()).toBe(false);
    });

    it('isProduction should be true after switching', () => {
      service.setEnvironment('production');
      expect(service.isDev()).toBe(false);
      expect(service.isStaging()).toBe(false);
      expect(service.isProduction()).toBe(true);
    });
  });

  // --- getFlag ---

  describe('getFlag', () => {
    it('should return flag value from current env', () => {
      expect(service.getFlag('enableBeta')).toBe(true);
      expect(service.getFlag('debugMode')).toBe(true);
    });

    it('should return undefined for non-existent flag', () => {
      expect(service.getFlag('nonExistent')).toBeUndefined();
    });

    it('should return flag from switched env', () => {
      service.setEnvironment('production');
      expect(service.getFlag('enableBeta')).toBe(false);
    });
  });

  // --- setEnvironment ---

  describe('setEnvironment', () => {
    it('should change the current environment', () => {
      service.setEnvironment('staging');
      expect(service.currentEnv()).toBe('staging');
    });

    it('should clear apiBaseUrl override on env change', () => {
      service.setApiBaseUrl('http://override.com');
      expect(service.getApiUrl()).toBe('http://override.com');
      service.setEnvironment('staging');
      expect(service.getApiUrl()).toBe('https://api.stg.firefly.com');
    });

    it('should clear flag overrides on env change', () => {
      service.setFlag('enableBeta', false);
      expect(service.getFlag('enableBeta')).toBe(false);
      service.setEnvironment('dev');
      expect(service.getFlag('enableBeta')).toBe(true);
    });
  });

  // --- setApiBaseUrl ---

  describe('setApiBaseUrl', () => {
    it('should override apiBaseUrl', () => {
      service.setApiBaseUrl('http://custom.com');
      expect(service.getApiUrl()).toBe('http://custom.com');
    });

    it('should not override service-specific URLs', () => {
      service.setApiBaseUrl('http://custom.com');
      expect(service.getApiUrl('lending')).toBe('http://localhost:3001');
    });
  });

  // --- setFlag ---

  describe('setFlag', () => {
    it('should override a flag value', () => {
      service.setFlag('enableBeta', false);
      expect(service.getFlag('enableBeta')).toBe(false);
    });

    it('should allow setting a new flag not in config', () => {
      service.setFlag('newFlag', 'hello');
      expect(service.getFlag('newFlag')).toBe('hello');
    });
  });

  // --- reset ---

  describe('reset', () => {
    it('should restore original environment', () => {
      service.setEnvironment('production');
      service.reset();
      expect(service.currentEnv()).toBe('dev');
    });

    it('should clear apiBaseUrl override', () => {
      service.setApiBaseUrl('http://override.com');
      service.reset();
      expect(service.getApiUrl()).toBe('http://localhost:3000');
    });

    it('should clear flag overrides', () => {
      service.setFlag('enableBeta', false);
      service.reset();
      expect(service.getFlag('enableBeta')).toBe(true);
    });

    it('should restore to last loadConfig state', () => {
      const newConfig: EnvironmentConfig = {
        default: 'staging',
        environments: {
          staging: { apiBaseUrl: 'https://new.com' },
        },
      };
      service.loadConfig(newConfig);
      service.setEnvironment('dev');
      service.reset();
      expect(service.currentEnv()).toBe('staging');
      expect(service.getApiUrl()).toBe('https://new.com');
    });
  });
});

// ---------------------------------------------------------------------------
// Tests — protectedFields
// ---------------------------------------------------------------------------

describe('EnvironmentService (protectedFields)', () => {
  let service: EnvironmentService;
  let warnSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        EnvironmentService,
        { provide: ENVIRONMENT_CONFIG, useValue: PROTECTED_CONFIG },
      ],
    });
    service = TestBed.inject(EnvironmentService);
    warnSpy = vi.spyOn(console, 'warn').mockImplementation(vi.fn());
  });

  afterEach(() => {
    warnSpy.mockRestore();
  });

  it('setEnvironment should be blocked and log warning', () => {
    service.setEnvironment('production');
    expect(service.currentEnv()).toBe('dev');
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining('currentEnv'),
    );
  });

  it('setApiBaseUrl should be blocked and log warning', () => {
    service.setApiBaseUrl('http://hacked.com');
    expect(service.getApiUrl()).toBe('http://localhost:3000');
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining('apiBaseUrl'),
    );
  });

  it('setFlag should be blocked and log warning', () => {
    service.setFlag('enableBeta', false);
    expect(service.getFlag('enableBeta')).toBe(true);
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining('flags'),
    );
  });
});

// ---------------------------------------------------------------------------
// Tests — loadEnvironment (fetch)
// ---------------------------------------------------------------------------

describe('EnvironmentService.loadEnvironment', () => {
  let service: EnvironmentService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [EnvironmentService],
    });
    service = TestBed.inject(EnvironmentService);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should fetch JSON and call loadConfig', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      json: () => Promise.resolve(MULTI_ENV_CONFIG),
    } as Response);

    await service.loadEnvironment('/assets/env.json');

    expect(globalThis.fetch).toHaveBeenCalledWith('/assets/env.json');
    expect(service.currentEnv()).toBe('dev');
    expect(service.config()).toEqual(MULTI_ENV_CONFIG);
  });

  it('should be a no-op when no URL is provided', async () => {
    vi.spyOn(globalThis, 'fetch');
    await service.loadEnvironment();
    expect(globalThis.fetch).not.toHaveBeenCalled();
  });
});
