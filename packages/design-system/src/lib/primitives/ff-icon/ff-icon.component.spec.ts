import 'zone.js';
import 'zone.js/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  BrowserTestingModule,
  platformBrowserTesting,
} from '@angular/platform-browser/testing';
import { EnvironmentProviders } from '@angular/core';
import { FfIconComponent } from './ff-icon.component';
import { provideFfIcons } from './icon-registry';

TestBed.initTestEnvironment(BrowserTestingModule, platformBrowserTesting(), {
  teardown: { destroyAfterEach: true },
});

const CHECK_PATH = 'M9 16.2 4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4z';
const CLOSE_PATH =
  'M19 6.4 17.6 5 12 10.6 6.4 5 5 6.4 10.6 12 5 17.6 6.4 19 12 13.4 17.6 19 19 17.6 13.4 12z';

describe('FfIconComponent', () => {
  async function setup(
    name: string,
    providers: EnvironmentProviders[] = [provideFfIcons({ check: CHECK_PATH })]
  ): Promise<ComponentFixture<FfIconComponent>> {
    await TestBed.configureTestingModule({
      imports: [FfIconComponent],
      providers,
    }).compileComponents();

    const fixture = TestBed.createComponent(FfIconComponent);
    fixture.componentRef.setInput('name', name);
    fixture.detectChanges();
    return fixture;
  }

  it('should create', async () => {
    const fixture = await setup('check');
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should render the registered path', async () => {
    const fixture = await setup('check');
    const path = fixture.nativeElement.querySelector('svg path');
    expect(path).toBeTruthy();
    expect(path.getAttribute('d')).toBe(CHECK_PATH);
  });

  it('should render an empty svg for an unknown name without breaking', async () => {
    const fixture = await setup('does-not-exist');
    const svg = fixture.nativeElement.querySelector('svg');
    expect(svg).toBeTruthy();
    expect(fixture.nativeElement.querySelector('svg path')).toBeNull();
  });

  it('should render an empty svg when no registry is provided', async () => {
    const fixture = await setup('no-registry-icon', []);
    const svg = fixture.nativeElement.querySelector('svg');
    expect(svg).toBeTruthy();
    expect(fixture.nativeElement.querySelector('svg path')).toBeNull();
  });

  it('should have default size "md" and apply its class to host', async () => {
    const fixture = await setup('check');
    expect(fixture.componentInstance.size()).toBe('md');
    const hostEl = fixture.nativeElement as HTMLElement;
    expect(hostEl.classList.contains('ff-icon')).toBe(true);
    expect(hostEl.classList.contains('ff-icon--md')).toBe(true);
  });

  it('should apply sm size class', async () => {
    const fixture = await setup('check');
    fixture.componentRef.setInput('size', 'sm');
    fixture.detectChanges();

    const hostEl = fixture.nativeElement as HTMLElement;
    expect(hostEl.classList.contains('ff-icon--sm')).toBe(true);
  });

  it('should apply lg size class', async () => {
    const fixture = await setup('check');
    fixture.componentRef.setInput('size', 'lg');
    fixture.detectChanges();

    const hostEl = fixture.nativeElement as HTMLElement;
    expect(hostEl.classList.contains('ff-icon--lg')).toBe(true);
  });

  it('should expose role="img" and aria-label when label is set', async () => {
    const fixture = await setup('check');
    fixture.componentRef.setInput('label', 'Confirm');
    fixture.detectChanges();

    const svg = fixture.nativeElement.querySelector('svg');
    expect(svg.getAttribute('role')).toBe('img');
    expect(svg.getAttribute('aria-label')).toBe('Confirm');
    expect(svg.hasAttribute('aria-hidden')).toBe(false);
  });

  it('should be aria-hidden when no label is set', async () => {
    const fixture = await setup('check');
    const svg = fixture.nativeElement.querySelector('svg');
    expect(svg.getAttribute('aria-hidden')).toBe('true');
    expect(svg.hasAttribute('role')).toBe(false);
    expect(svg.hasAttribute('aria-label')).toBe(false);
  });

  it('should merge icon sets from multiple provideFfIcons calls', async () => {
    const fixture = await setup('close', [
      provideFfIcons({ check: CHECK_PATH }),
      provideFfIcons({ close: CLOSE_PATH }),
    ]);

    expect(
      fixture.nativeElement.querySelector('svg path').getAttribute('d')
    ).toBe(CLOSE_PATH);

    fixture.componentRef.setInput('name', 'check');
    fixture.detectChanges();
    expect(
      fixture.nativeElement.querySelector('svg path').getAttribute('d')
    ).toBe(CHECK_PATH);
  });

  it('should let later provideFfIcons calls override earlier names', async () => {
    const fixture = await setup('check', [
      provideFfIcons({ check: CHECK_PATH }),
      provideFfIcons({ check: CLOSE_PATH }),
    ]);

    expect(
      fixture.nativeElement.querySelector('svg path').getAttribute('d')
    ).toBe(CLOSE_PATH);
  });

  it('should warn only once per unknown name in dev mode', async () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => void 0);
    try {
      const fixture = await setup('unique-unknown-name');
      fixture.componentRef.setInput('size', 'sm');
      fixture.detectChanges();

      const warns = warnSpy.mock.calls.filter((args) =>
        String(args[0]).includes('unique-unknown-name')
      );
      expect(warns.length).toBe(1);
    } finally {
      warnSpy.mockRestore();
    }
  });
});
