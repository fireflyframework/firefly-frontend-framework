import 'zone.js';
import 'zone.js/testing';
import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  BrowserTestingModule,
  platformBrowserTesting,
} from '@angular/platform-browser/testing';
import { FfCardComponent } from './ff-card.component';

TestBed.initTestEnvironment(BrowserTestingModule, platformBrowserTesting(), {
  teardown: { destroyAfterEach: true },
});

@Component({
  standalone: true,
  imports: [FfCardComponent],
  template: `
    <ff-card [shadow]="shadow">
      <div ff-card-header>Header</div>
      <p>Body content</p>
      <div ff-card-footer>Footer</div>
    </ff-card>
  `,
})
class TestHostComponent {
  shadow: 'none' | 'sm' | 'md' | 'lg' = 'sm';
}

describe('FfCardComponent', () => {
  let fixture: ComponentFixture<FfCardComponent>;
  let component: FfCardComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FfCardComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(FfCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should default shadow to sm', () => {
    expect(component.shadow()).toBe('sm');
  });

  it('should apply shadow-sm class by default', () => {
    const host = fixture.nativeElement as HTMLElement;
    expect(host.classList.contains('ff-card--shadow-sm')).toBe(true);
  });

  it('should apply shadow-none class', () => {
    fixture.componentRef.setInput('shadow', 'none');
    fixture.detectChanges();

    const host = fixture.nativeElement as HTMLElement;
    expect(host.classList.contains('ff-card--shadow-none')).toBe(true);
  });

  it('should apply shadow-md class', () => {
    fixture.componentRef.setInput('shadow', 'md');
    fixture.detectChanges();

    const host = fixture.nativeElement as HTMLElement;
    expect(host.classList.contains('ff-card--shadow-md')).toBe(true);
  });

  it('should apply shadow-lg class', () => {
    fixture.componentRef.setInput('shadow', 'lg');
    fixture.detectChanges();

    const host = fixture.nativeElement as HTMLElement;
    expect(host.classList.contains('ff-card--shadow-lg')).toBe(true);
  });

  it('should have ff-card base class', () => {
    const host = fixture.nativeElement as HTMLElement;
    expect(host.classList.contains('ff-card')).toBe(true);
  });
});

describe('FfCardComponent (with host)', () => {
  let fixture: ComponentFixture<TestHostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();
  });

  it('should project header content', () => {
    const header = fixture.nativeElement.querySelector('[ff-card-header]');
    expect(header).toBeTruthy();
    expect(header.textContent.trim()).toBe('Header');
  });

  it('should project body content', () => {
    const body = fixture.nativeElement.querySelector('p');
    expect(body).toBeTruthy();
    expect(body.textContent.trim()).toBe('Body content');
  });

  it('should project footer content', () => {
    const footer = fixture.nativeElement.querySelector('[ff-card-footer]');
    expect(footer).toBeTruthy();
    expect(footer.textContent.trim()).toBe('Footer');
  });

  it('should render header before body and footer', () => {
    const card = fixture.nativeElement.querySelector('ff-card');
    const children = Array.from(card.children) as HTMLElement[];
    const headerIdx = children.findIndex((el) =>
      el.hasAttribute('ff-card-header')
    );
    const footerIdx = children.findIndex((el) =>
      el.hasAttribute('ff-card-footer')
    );
    const bodyIdx = children.findIndex(
      (el) => el.tagName === 'P'
    );

    expect(headerIdx).toBeLessThan(bodyIdx);
    expect(bodyIdx).toBeLessThan(footerIdx);
  });
});
