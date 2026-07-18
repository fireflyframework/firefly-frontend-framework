import 'zone.js';
import 'zone.js/testing';
import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  BrowserTestingModule,
  platformBrowserTesting,
} from '@angular/platform-browser/testing';
import { FfEmptyStateComponent } from './ff-empty-state.component';

TestBed.initTestEnvironment(BrowserTestingModule, platformBrowserTesting(), {
  teardown: { destroyAfterEach: true },
});

@Component({
  standalone: true,
  imports: [FfEmptyStateComponent],
  template: `
    <ff-empty-state
      title="No documents"
      description="Upload your first document."
    >
      <svg ff-empty-state-icon data-testid="icon"></svg>
      <button type="button">Upload</button>
    </ff-empty-state>
  `,
})
class TestHostComponent {}

describe('FfEmptyStateComponent', () => {
  let fixture: ComponentFixture<FfEmptyStateComponent>;
  let component: FfEmptyStateComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FfEmptyStateComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(FfEmptyStateComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('title', 'Nothing here');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have the ff-empty-state host class', () => {
    const host = fixture.nativeElement as HTMLElement;
    expect(host.classList.contains('ff-empty-state')).toBe(true);
  });

  it('should render the title', () => {
    const title = fixture.nativeElement.querySelector('.ff-empty-state__title');
    expect(title).toBeTruthy();
    expect(title.textContent.trim()).toBe('Nothing here');
  });

  it('should not render a description when not provided', () => {
    const description = fixture.nativeElement.querySelector(
      '.ff-empty-state__description'
    );
    expect(description).toBeNull();
  });

  it('should render the description when provided', () => {
    fixture.componentRef.setInput('description', 'Try adjusting the filters.');
    fixture.detectChanges();

    const description = fixture.nativeElement.querySelector(
      '.ff-empty-state__description'
    );
    expect(description).toBeTruthy();
    expect(description.textContent.trim()).toBe('Try adjusting the filters.');
  });
});

describe('FfEmptyStateComponent (with host)', () => {
  let fixture: ComponentFixture<TestHostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();
  });

  it('should project the icon above the title', () => {
    const icon = fixture.nativeElement.querySelector(
      '.ff-empty-state__icon [data-testid="icon"]'
    );
    expect(icon).toBeTruthy();

    const emptyState = fixture.nativeElement.querySelector('ff-empty-state');
    const children = Array.from(emptyState.children) as HTMLElement[];
    const iconIdx = children.findIndex((el) =>
      el.classList.contains('ff-empty-state__icon')
    );
    const titleIdx = children.findIndex((el) =>
      el.classList.contains('ff-empty-state__title')
    );
    expect(iconIdx).toBeLessThan(titleIdx);
  });

  it('should render title and description from inputs', () => {
    const title = fixture.nativeElement.querySelector('.ff-empty-state__title');
    const description = fixture.nativeElement.querySelector(
      '.ff-empty-state__description'
    );
    expect(title.textContent.trim()).toBe('No documents');
    expect(description.textContent.trim()).toBe('Upload your first document.');
  });

  it('should project actions below the description', () => {
    const actions = fixture.nativeElement.querySelector(
      '.ff-empty-state__actions'
    );
    const button = actions.querySelector('button');
    expect(button).toBeTruthy();
    expect(button.textContent.trim()).toBe('Upload');

    const emptyState = fixture.nativeElement.querySelector('ff-empty-state');
    const children = Array.from(emptyState.children) as HTMLElement[];
    const descriptionIdx = children.findIndex((el) =>
      el.classList.contains('ff-empty-state__description')
    );
    const actionsIdx = children.findIndex((el) =>
      el.classList.contains('ff-empty-state__actions')
    );
    expect(descriptionIdx).toBeLessThan(actionsIdx);
  });
});
