import 'zone.js';
import 'zone.js/testing';
import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  BrowserTestingModule,
  platformBrowserTesting,
} from '@angular/platform-browser/testing';
import { FfPanelComponent } from './ff-panel.component';

TestBed.initTestEnvironment(BrowserTestingModule, platformBrowserTesting(), {
  teardown: { destroyAfterEach: true },
});

@Component({
  standalone: true,
  imports: [FfPanelComponent],
  template: `
    <ff-panel>
      <span ff-panel-heading>Projected heading</span>
      <button ff-panel-actions type="button">Action</button>
      <p>Body content</p>
      <div ff-panel-footer>Footer content</div>
    </ff-panel>
  `,
})
class TestHostComponent {}

describe('FfPanelComponent', () => {
  let fixture: ComponentFixture<FfPanelComponent>;
  let component: FfPanelComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FfPanelComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(FfPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should default appearance to card and variant to neutral', () => {
    expect(component.appearance()).toBe('card');
    expect(component.variant()).toBe('neutral');

    const host = fixture.nativeElement as HTMLElement;
    expect(host.classList.contains('ff-panel')).toBe(true);
    expect(host.classList.contains('ff-panel--card')).toBe(true);
    expect(host.classList.contains('ff-panel--neutral')).toBe(true);
  });

  it('should apply alert appearance class', () => {
    fixture.componentRef.setInput('appearance', 'alert');
    fixture.detectChanges();

    const host = fixture.nativeElement as HTMLElement;
    expect(host.classList.contains('ff-panel--alert')).toBe(true);
    expect(host.classList.contains('ff-panel--card')).toBe(false);
  });

  it.each(['neutral', 'primary', 'success', 'warning', 'danger', 'info'])(
    'should apply %s variant class',
    (variant) => {
      fixture.componentRef.setInput('variant', variant);
      fixture.detectChanges();

      const host = fixture.nativeElement as HTMLElement;
      expect(host.classList.contains(`ff-panel--${variant}`)).toBe(true);
    }
  );

  it('should not have fill class by default', () => {
    const host = fixture.nativeElement as HTMLElement;
    expect(host.classList.contains('ff-panel--fill')).toBe(false);
  });

  it('should apply fill class when fill is true', () => {
    fixture.componentRef.setInput('fill', true);
    fixture.detectChanges();

    const host = fixture.nativeElement as HTMLElement;
    expect(host.classList.contains('ff-panel--fill')).toBe(true);
  });

  it('should render the heading input in the header', () => {
    fixture.componentRef.setInput('heading', 'Panel title');
    fixture.detectChanges();

    const heading = fixture.nativeElement.querySelector('.ff-panel__heading');
    expect(heading).toBeTruthy();
    expect(heading.textContent.trim()).toBe('Panel title');
  });

  it('should not render the heading element when heading is not set', () => {
    const heading = fixture.nativeElement.querySelector('.ff-panel__heading');
    expect(heading).toBeNull();
  });

  it('should leave the header empty when no heading and no projected content', () => {
    const header = fixture.nativeElement.querySelector(
      '.ff-panel__header'
    ) as HTMLElement;
    expect(header).toBeTruthy();
    // Only comment anchors remain — no element or text children (:empty collapses it).
    expect(header.childElementCount).toBe(0);
    expect(header.textContent?.trim()).toBe('');
  });
});

describe('FfPanelComponent (with host)', () => {
  let fixture: ComponentFixture<TestHostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();
  });

  it('should project heading content into the header', () => {
    const header = fixture.nativeElement.querySelector('.ff-panel__header');
    const projected = header.querySelector('[ff-panel-heading]');
    expect(projected).toBeTruthy();
    expect(projected.textContent.trim()).toBe('Projected heading');
  });

  it('should project actions into the header', () => {
    const header = fixture.nativeElement.querySelector('.ff-panel__header');
    const actions = header.querySelector('[ff-panel-actions]');
    expect(actions).toBeTruthy();
    expect(actions.textContent.trim()).toBe('Action');
  });

  it('should project default content into the body', () => {
    const body = fixture.nativeElement.querySelector('.ff-panel__body');
    const paragraph = body.querySelector('p');
    expect(paragraph).toBeTruthy();
    expect(paragraph.textContent.trim()).toBe('Body content');
  });

  it('should project footer content into the footer', () => {
    const footer = fixture.nativeElement.querySelector('.ff-panel__footer');
    const projected = footer.querySelector('[ff-panel-footer]');
    expect(projected).toBeTruthy();
    expect(projected.textContent.trim()).toBe('Footer content');
  });

  it('should render header before body and body before footer', () => {
    const panel = fixture.nativeElement.querySelector('ff-panel');
    const children = Array.from(panel.children) as HTMLElement[];
    const headerIdx = children.findIndex((el) =>
      el.classList.contains('ff-panel__header')
    );
    const bodyIdx = children.findIndex((el) =>
      el.classList.contains('ff-panel__body')
    );
    const footerIdx = children.findIndex((el) =>
      el.classList.contains('ff-panel__footer')
    );

    expect(headerIdx).toBeLessThan(bodyIdx);
    expect(bodyIdx).toBeLessThan(footerIdx);
  });
});
