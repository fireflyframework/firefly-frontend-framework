import 'zone.js';
import 'zone.js/testing';
import { Component, viewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  BrowserTestingModule,
  platformBrowserTesting,
} from '@angular/platform-browser/testing';
import { FfBottomSheetComponent } from './ff-bottom-sheet.component';

TestBed.initTestEnvironment(BrowserTestingModule, platformBrowserTesting(), {
  teardown: { destroyAfterEach: true },
});

@Component({
  standalone: true,
  imports: [FfBottomSheetComponent],
  template: `
    <ff-bottom-sheet [open]="true" title="Sheet Title" message="Body text">
      <p class="custom-content">Extra content</p>
      <div ff-bottom-sheet-actions>
        <button class="action-btn">Confirm</button>
      </div>
    </ff-bottom-sheet>
  `,
})
class ProjectionHostComponent {
  readonly sheet = viewChild.required(FfBottomSheetComponent);
}

describe('FfBottomSheetComponent', () => {
  let component: FfBottomSheetComponent;
  let fixture: ComponentFixture<FfBottomSheetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FfBottomSheetComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(FfBottomSheetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should not be open by default', () => {
    expect(component.open()).toBe(false);
  });

  it('should have info type by default', () => {
    expect(component.type()).toBe('info');
  });

  it('should have ff-bottom-sheet base class', () => {
    const host = fixture.nativeElement as HTMLElement;
    expect(host.classList.contains('ff-bottom-sheet')).toBe(true);
  });

  it('should not render backdrop when closed', () => {
    const backdrop = fixture.nativeElement.querySelector(
      '.ff-bottom-sheet__backdrop',
    );
    expect(backdrop).toBeFalsy();
  });

  it('should render backdrop when open', () => {
    fixture.componentRef.setInput('open', true);
    fixture.detectChanges();

    const backdrop = fixture.nativeElement.querySelector(
      '.ff-bottom-sheet__backdrop',
    );
    expect(backdrop).toBeTruthy();
  });

  it('should have role dialog on backdrop', () => {
    fixture.componentRef.setInput('open', true);
    fixture.detectChanges();

    const backdrop = fixture.nativeElement.querySelector(
      '.ff-bottom-sheet__backdrop',
    );
    expect(backdrop.getAttribute('role')).toBe('dialog');
  });

  it('should have aria-modal true', () => {
    fixture.componentRef.setInput('open', true);
    fixture.detectChanges();

    const backdrop = fixture.nativeElement.querySelector(
      '.ff-bottom-sheet__backdrop',
    );
    expect(backdrop.getAttribute('aria-modal')).toBe('true');
  });

  it('should set aria-label from title', () => {
    fixture.componentRef.setInput('open', true);
    fixture.componentRef.setInput('title', 'Details');
    fixture.detectChanges();

    const backdrop = fixture.nativeElement.querySelector(
      '.ff-bottom-sheet__backdrop',
    );
    expect(backdrop.getAttribute('aria-label')).toBe('Details');
  });

  it('should render panel with variant class', () => {
    fixture.componentRef.setInput('open', true);
    fixture.componentRef.setInput('type', 'error');
    fixture.detectChanges();

    const panel = fixture.nativeElement.querySelector(
      '.ff-bottom-sheet__panel',
    );
    expect(panel).toBeTruthy();
    expect(panel.classList.contains('ff-bottom-sheet__panel--error')).toBe(
      true,
    );
  });

  it('should render title when provided', () => {
    fixture.componentRef.setInput('open', true);
    fixture.componentRef.setInput('title', 'Sheet Title');
    fixture.detectChanges();

    const title = fixture.nativeElement.querySelector(
      '.ff-bottom-sheet__title',
    );
    expect(title).toBeTruthy();
    expect(title.textContent.trim()).toBe('Sheet Title');
  });

  it('should render message when provided', () => {
    fixture.componentRef.setInput('open', true);
    fixture.componentRef.setInput('message', 'Hello world');
    fixture.detectChanges();

    const msg = fixture.nativeElement.querySelector(
      '.ff-bottom-sheet__message',
    );
    expect(msg).toBeTruthy();
    expect(msg.textContent.trim()).toBe('Hello world');
  });

  it('should render close button when dismissible', () => {
    fixture.componentRef.setInput('open', true);
    fixture.detectChanges();

    const close = fixture.nativeElement.querySelector(
      '.ff-bottom-sheet__close',
    );
    expect(close).toBeTruthy();
  });

  it('should not render close button when not dismissible', () => {
    fixture.componentRef.setInput('open', true);
    fixture.componentRef.setInput('dismissible', false);
    fixture.detectChanges();

    const close = fixture.nativeElement.querySelector(
      '.ff-bottom-sheet__close',
    );
    expect(close).toBeFalsy();
  });

  it('should emit dismissed on close button click', () => {
    fixture.componentRef.setInput('open', true);
    fixture.detectChanges();

    const spy = vi.fn();
    component.dismissed.subscribe(spy);

    const close = fixture.nativeElement.querySelector(
      '.ff-bottom-sheet__close',
    );
    close.click();

    expect(spy).toHaveBeenCalledOnce();
  });

  it('should emit dismissed on Escape key', () => {
    fixture.componentRef.setInput('open', true);
    fixture.detectChanges();

    const spy = vi.fn();
    component.dismissed.subscribe(spy);

    const backdrop = fixture.nativeElement.querySelector(
      '.ff-bottom-sheet__backdrop',
    );
    backdrop.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));

    expect(spy).toHaveBeenCalledOnce();
  });

  it('should not emit dismissed on Escape when not dismissible', () => {
    fixture.componentRef.setInput('open', true);
    fixture.componentRef.setInput('dismissible', false);
    fixture.detectChanges();

    const spy = vi.fn();
    component.dismissed.subscribe(spy);

    const backdrop = fixture.nativeElement.querySelector(
      '.ff-bottom-sheet__backdrop',
    );
    backdrop.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));

    expect(spy).not.toHaveBeenCalled();
  });

  it('should emit dismissed on backdrop click', () => {
    fixture.componentRef.setInput('open', true);
    fixture.detectChanges();

    const spy = vi.fn();
    component.dismissed.subscribe(spy);

    const backdrop = fixture.nativeElement.querySelector(
      '.ff-bottom-sheet__backdrop',
    );
    backdrop.click();

    expect(spy).toHaveBeenCalledOnce();
  });

  it('should not emit dismissed on panel click', () => {
    fixture.componentRef.setInput('open', true);
    fixture.detectChanges();

    const spy = vi.fn();
    component.dismissed.subscribe(spy);

    const panel = fixture.nativeElement.querySelector(
      '.ff-bottom-sheet__panel',
    );
    panel.click();

    expect(spy).not.toHaveBeenCalled();
  });

  it('should not render header when no title and not dismissible', () => {
    fixture.componentRef.setInput('open', true);
    fixture.componentRef.setInput('dismissible', false);
    fixture.detectChanges();

    const header = fixture.nativeElement.querySelector(
      '.ff-bottom-sheet__header',
    );
    expect(header).toBeFalsy();
  });
});

describe('FfBottomSheetComponent (content projection)', () => {
  let fixture: ComponentFixture<ProjectionHostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProjectionHostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ProjectionHostComponent);
    fixture.detectChanges();
  });

  it('should project body content', () => {
    const content = fixture.nativeElement.querySelector('.custom-content');
    expect(content).toBeTruthy();
    expect(content.textContent.trim()).toBe('Extra content');
  });

  it('should project actions content', () => {
    const actionBtn = fixture.nativeElement.querySelector('.action-btn');
    expect(actionBtn).toBeTruthy();
    expect(actionBtn.textContent.trim()).toBe('Confirm');
  });

  it('should render title from host', () => {
    const title = fixture.nativeElement.querySelector(
      '.ff-bottom-sheet__title',
    );
    expect(title).toBeTruthy();
    expect(title.textContent.trim()).toBe('Sheet Title');
  });

  it('should render message from host', () => {
    const msg = fixture.nativeElement.querySelector(
      '.ff-bottom-sheet__message',
    );
    expect(msg).toBeTruthy();
    expect(msg.textContent.trim()).toBe('Body text');
  });
});
