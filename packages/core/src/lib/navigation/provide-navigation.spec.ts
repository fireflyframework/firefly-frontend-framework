import { ApplicationInitStatus } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { NavigationService } from './navigation.service';
import { NavigationConfig } from './navigation.types';
import { provideNavigation } from './provide-navigation';
import { providePermissions } from '../permissions/provide-permissions';

describe('provideNavigation', () => {
  const config: NavigationConfig = {
    items: [
      { id: 'home', label: 'Home', route: '/' },
      {
        id: 'catalog',
        label: 'Catalog',
        children: [
          { id: 'products', label: 'Products', route: '/catalog/products' },
        ],
      },
    ],
  };

  it('should return valid EnvironmentProviders', () => {
    const providers = provideNavigation(config);
    expect(providers).toBeDefined();
  });

  it('should configure NavigationService via APP_INITIALIZER', async () => {
    TestBed.configureTestingModule({
      providers: [provideRouter([]), providePermissions(), provideNavigation(config)],
    });

    const initStatus = TestBed.inject(ApplicationInitStatus);
    await initStatus.donePromise;

    const service = TestBed.inject(NavigationService);
    const items = service.navItems();
    expect(items.length).toBe(2);
    expect(items[0].id).toBe('home');
    expect(items[1].id).toBe('catalog');
    expect(items[1].children!.length).toBe(1);
  });

  it('should work with empty items', async () => {
    TestBed.configureTestingModule({
      providers: [provideRouter([]), providePermissions(), provideNavigation({ items: [] })],
    });

    const initStatus = TestBed.inject(ApplicationInitStatus);
    await initStatus.donePromise;

    const service = TestBed.inject(NavigationService);
    expect(service.navItems().length).toBe(0);
  });
});
