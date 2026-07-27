import 'zone.js';
import 'zone.js/testing';
import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  BrowserTestingModule,
  platformBrowserTesting,
} from '@angular/platform-browser/testing';
import {
  FfAccordionComponent,
  FfAccordionSectionTemplateDirective,
  FfAccordionSection,
  FfAccordionMode,
} from './ff-accordion.component';
import { provideFfIcons } from '../../primitives/ff-icon';

TestBed.initTestEnvironment(BrowserTestingModule, platformBrowserTesting(), {
  teardown: { destroyAfterEach: true },
});

const SECTIONS: readonly FfAccordionSection[] = [
  { id: 'shipping', heading: 'Shipping address' },
  { id: 'billing', heading: 'Billing details' },
  { id: 'notes', heading: 'Notes', disabled: true },
];

describe('FfAccordionComponent', () => {
  let fixture: ComponentFixture<FfAccordionComponent>;
  let component: FfAccordionComponent;

  function setup(
    inputs: Partial<{
      sections: readonly FfAccordionSection[];
      mode: FfAccordionMode;
      expandedIds: readonly string[];
    }> = {},
  ) {
    TestBed.configureTestingModule({
      imports: [FfAccordionComponent],
      providers: [provideFfIcons({ 'chevron-down': 'M0 0h24v24H0z' })],
    });
    fixture = TestBed.createComponent(FfAccordionComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('sections', inputs.sections ?? SECTIONS);
    if (inputs.mode) fixture.componentRef.setInput('mode', inputs.mode);
    if (inputs.expandedIds) fixture.componentRef.setInput('expandedIds', inputs.expandedIds);
    fixture.detectChanges();
    return fixture;
  }

  function toggles(): HTMLButtonElement[] {
    return Array.from(fixture.nativeElement.querySelectorAll('.ff-accordion__toggle'));
  }

  function regions(): HTMLElement[] {
    return Array.from(fixture.nativeElement.querySelectorAll('.ff-accordion__region'));
  }

  it('renders one toggle button and one role=region per section', () => {
    setup();
    const buttons = toggles();
    expect(buttons.length).toBe(3);

    const regionEls = regions();
    expect(regionEls.length).toBe(3);
    expect(regionEls.every((r) => r.getAttribute('role') === 'region')).toBe(true);
  });

  it('pairs each header/region via aria-controls / aria-labelledby / matching ids', () => {
    setup();
    const button = toggles()[0];
    const region = regions()[0];
    expect(button.getAttribute('aria-controls')).toBe(region.id);
    expect(region.getAttribute('aria-labelledby')).toBe(button.id);
  });

  it('reflects the collapsed state via aria-expanded=false and marks the region inert', () => {
    setup();
    const button = toggles()[0];
    const region = regions()[0];
    expect(button.getAttribute('aria-expanded')).toBe('false');
    expect(region.hasAttribute('inert')).toBe(true);
  });

  it('reflects the expanded state via aria-expanded=true and clears inert', () => {
    setup({ expandedIds: ['shipping'] });
    const button = toggles()[0];
    const region = regions()[0];
    expect(button.getAttribute('aria-expanded')).toBe('true');
    expect(region.hasAttribute('inert')).toBe(false);
  });

  it('single mode: expanding a section emits only that section id, closing others', () => {
    setup({ expandedIds: ['shipping'] });
    const emitted: (readonly string[])[] = [];
    component.expandedIdsChange.subscribe((next) => emitted.push(next));

    toggles()[1].click();
    expect(emitted).toEqual([['billing']]);
  });

  it('single mode: clicking the already-expanded section collapses it (emits [])', () => {
    setup({ expandedIds: ['shipping'] });
    const emitted: (readonly string[])[] = [];
    component.expandedIdsChange.subscribe((next) => emitted.push(next));

    toggles()[0].click();
    expect(emitted).toEqual([[]]);
  });

  it('multiple mode: expanding a section adds to the current set instead of replacing it', () => {
    setup({ mode: 'multiple', expandedIds: ['shipping'] });
    const emitted: (readonly string[])[] = [];
    component.expandedIdsChange.subscribe((next) => emitted.push(next));

    toggles()[1].click();
    expect(emitted).toEqual([['shipping', 'billing']]);
  });

  it('multiple mode: collapsing one expanded section leaves the others open', () => {
    setup({ mode: 'multiple', expandedIds: ['shipping', 'billing'] });
    const emitted: (readonly string[])[] = [];
    component.expandedIdsChange.subscribe((next) => emitted.push(next));

    toggles()[0].click();
    expect(emitted).toEqual([['billing']]);
  });

  it('a disabled section never toggles (native disabled button swallows the click)', () => {
    setup();
    const emitted: (readonly string[])[] = [];
    component.expandedIdsChange.subscribe((next) => emitted.push(next));

    expect(toggles()[2].disabled).toBe(true);
    toggles()[2].click();
    expect(emitted).toEqual([]);
  });

  it('ArrowDown/ArrowUp move focus between enabled headers, wrapping and skipping disabled ones', () => {
    setup();
    const buttons = toggles();
    buttons[0].focus();

    buttons[0].dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    expect(document.activeElement).toBe(buttons[1]);

    // 'notes' (index 2) is disabled and excluded from the query, so ArrowDown wraps back to 0.
    buttons[1].dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    expect(document.activeElement).toBe(buttons[0]);

    buttons[0].dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true }));
    expect(document.activeElement).toBe(buttons[1]);
  });

  it('Home/End move focus to the first/last enabled header', () => {
    setup();
    const buttons = toggles();
    buttons[1].focus();

    buttons[1].dispatchEvent(new KeyboardEvent('keydown', { key: 'Home', bubbles: true }));
    expect(document.activeElement).toBe(buttons[0]);

    buttons[0].dispatchEvent(new KeyboardEvent('keydown', { key: 'End', bubbles: true }));
    expect(document.activeElement).toBe(buttons[1]);
  });
});

@Component({
  standalone: true,
  imports: [FfAccordionComponent, FfAccordionSectionTemplateDirective],
  template: `
    <ff-accordion [sections]="sections" [expandedIds]="['shipping']">
      <ng-template ffAccordionSection="shipping" let-section>Shipping body for {{ section.heading }}</ng-template>
      <ng-template ffAccordionSection="billing" let-section>Billing body for {{ section.heading }}</ng-template>
    </ff-accordion>
  `,
})
class TestHostComponent {
  readonly sections: readonly FfAccordionSection[] = SECTIONS;
}

describe('FfAccordionComponent (with projected section templates)', () => {
  let fixture: ComponentFixture<TestHostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
      providers: [provideFfIcons({ 'chevron-down': 'M0 0h24v24H0z' })],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();
  });

  it('renders the matching template inside the expanded region and passes the section as context', () => {
    const region = fixture.nativeElement.querySelector('.ff-accordion__region');
    expect(region.textContent).toContain('Shipping body for Shipping address');
  });

  it('renders nothing for a section with no matching template', () => {
    const regions = fixture.nativeElement.querySelectorAll('.ff-accordion__region');
    // 'notes' has no [ffAccordionSection] template projected — its region stays empty.
    expect(regions[2].textContent?.trim()).toBe('');
  });
});
