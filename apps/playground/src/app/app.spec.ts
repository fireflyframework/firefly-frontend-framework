import { provideRouter } from '@angular/router';
import { TestBed } from '@angular/core/testing';

import { App } from './app';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it('should render the catalog title', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain(
      'Firefly Design System',
    );
  });

  it('should render the sidebar navigation with catalog links', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    const links = Array.from(compiled.querySelectorAll('a.shell__nav-link'));
    const hrefs = links.map((a) => a.getAttribute('href'));
    expect(hrefs).toContain('/foundations');
    expect(hrefs).toContain('/theming');
    expect(hrefs).toContain('/catalog/button');
    expect(hrefs).toContain('/patterns/tab-bar');
  });
});
