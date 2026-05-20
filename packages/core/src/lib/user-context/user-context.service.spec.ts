import { TestBed } from '@angular/core/testing';
import { UserContextService } from './user-context.service';
import { ROLE_PRIORITY } from './role-priority.config';
import { UserProfile } from './user-context.types';
import { provideUserContext } from './provide-user-context';

const MOCK_USER: UserProfile = {
  userId: 'u1',
  email: 'test@example.com',
  firstName: 'Test',
  lastName: 'User',
};

describe('UserContextService', () => {
  let service: UserContextService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideUserContext()] });
    service = TestBed.inject(UserContextService);
  });

  it('should have null user initially', () => {
    expect(service.user()).toBeNull();
  });

  it('should have empty roles initially', () => {
    expect(service.roles()).toEqual([]);
  });

  it('should have null currentRole initially', () => {
    expect(service.currentRole()).toBeNull();
  });

  it('should set user profile via setUser', () => {
    service.setUser(MOCK_USER);

    expect(service.user()).toEqual(MOCK_USER);
  });

  it('should set roles via setRoles', () => {
    service.setRoles(['admin', 'agent']);

    expect(service.roles()).toEqual(['admin', 'agent']);
  });

  it('should return first role as currentRole with default empty priority', () => {
    // Default ROLE_PRIORITY is [] — first role wins
    service.setRoles(['agent', 'admin']);

    expect(service.currentRole()).toBe('agent');
  });

  it('should reset all signals on clear', () => {
    service.setUser(MOCK_USER);
    service.setRoles(['admin']);

    service.clear();

    expect(service.user()).toBeNull();
    expect(service.roles()).toEqual([]);
    expect(service.currentRole()).toBeNull();
  });

  it('should update currentRole reactively when roles change', () => {
    service.setRoles(['agent']);
    expect(service.currentRole()).toBe('agent');

    service.setRoles(['supervisor']);
    expect(service.currentRole()).toBe('supervisor');
  });

  describe('with custom role priority', () => {
    beforeEach(() => {
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [
          provideUserContext(),
          {
            provide: ROLE_PRIORITY,
            useValue: ['admin', 'supervisor', 'distributor', 'agent'],
          },
        ],
      });
      service = TestBed.inject(UserContextService);
    });

    it('should return highest priority role', () => {
      service.setRoles(['agent', 'admin']);

      expect(service.currentRole()).toBe('admin');
    });

    it('should return single role regardless of priority', () => {
      service.setRoles(['distributor']);

      expect(service.currentRole()).toBe('distributor');
    });

    it('should fallback to first role if none match priority list', () => {
      service.setRoles(['custom-role', 'other-role']);

      expect(service.currentRole()).toBe('custom-role');
    });

    it('should respect priority order (supervisor before agent)', () => {
      service.setRoles(['agent', 'supervisor']);

      expect(service.currentRole()).toBe('supervisor');
    });
  });
});
