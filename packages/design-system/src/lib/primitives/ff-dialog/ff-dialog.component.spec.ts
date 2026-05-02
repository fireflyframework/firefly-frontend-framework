import 'zone.js';
import 'zone.js/testing';
import { Component, viewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  BrowserTestingModule,
  platformBrowserTesting,
} from '@angular/platform-browser/testing';
import { FfDialogComponent } from './ff-dialog.component';

TestBed.initTestEnvironment(BrowserTestingModule, platformBrowserTesting(), {
  teardown: { destroyAfterEach: true },
});

@Component({
  standalone: true,
  imports: [FfDialogComponent],
  template: `
    <ff-dialog [open]="true" title="Host Title">
      <p class="body-text">Dialog body</p>
      <div ff-dialog-actions>
        <button class="action-btn">OK</button>
      </div>
    </ff-dialog>
  `,
})
class ProjectionHostComponent {
  readonly dialog = viewChild.required(FfDialogComponent);
}

describe('FfDialogComponent', () => {
  let component: FfDialogComponent;
  let fixture: ComponentFixture<FfDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FfDialogComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(FfDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should not be open by default', () => {
    expect(component.open()).toBe(false);
  });

  it('should have empty title by default', () => {
    expect(component.title()).toBe('');
  });

  it('should have ff-dialog base class', () => {
    const host = fixture.nativeElement as HTMLElement;
    expect(host.classList.contains('ff-dialog')).toBe(true);
  });

  it('should not have variant class by default', () => {
    const host = fixture.nativeElement as HTMLElement;
    expect(host.className).toBe('ff-dialog');
  });

  it('should apply variant class when type is set', () => {
    fixture.componentRef.setInput('type', 'warning');
    fixture.detectChanges();
    const host = fixture.nativeElement as HTMLElement;
    expect(host.classList.contains('ff-dialog--warning')).toBe(true);
  });

  it.each(['success', 'error', 'warning', 'info'] as const)('should apply ff-dialog--%s class', (variant) => {
    fixture.componentRef.setInput('type', variant);
    fixture.detectChanges();
    const host = fixture.nativeElement as HTMLElement;
    expect(host.classList.contains(`ff-dialog--${variant}`)).toBe(true);
    expect(host.classList.contains('ff-dialog')).toBe(true);
  });

  it('should remove variant class when type is cleared', () => {
    fixture.componentRef.setInput('type', 'error');
    fixture.detectChanges();
    fixture.componentRef.setInput('type', undefined);
    fixture.detectChanges();
    const host = fixture.nativeElement as HTMLElement;
    expect(host.className).toBe('ff-dialog');
  });

  it('should not render backdrop when closed', () => {
    const backdrop = fixture.nativeElement.querySelector('.ff-dialog__backdrop');
    expect(backdrop).toBeFalsy();
  });

  it('should render backdrop when open', () => {
    fixture.componentRef.setInput('open', true);
    fixture.detectChanges();

    const backdrop = fixture.nativeElement.querySelector('.ff-dialog__backdrop');
    expect(backdrop).toBeTruthy();
  });

  it('should remove backdrop when closed after being open', () => {
    fixture.componentRef.setInput('open', true);
    fixture.detectChanges();

    fixture.componentRef.setInput('open', false);
    fixture.detectChanges();

    const backdrop = fixture.nativeElement.querySelector('.ff-dialog__backdrop');
    expect(backdrop).toBeFalsy();
  });

  it('should have role dialog on backdrop', () => {
    fixture.componentRef.setInput('open', true);
    fixture.detectChanges();

    const backdrop = fixture.nativeElement.querySelector('.ff-dialog__backdrop');
    expect(backdrop.getAttribute('role')).toBe('dialog');
  });

  it('should have aria-modal true', () => {
    fixture.componentRef.setInput('open', true);
    fixture.detectChanges();

    const backdrop = fixture.nativeElement.querySelector('.ff-dialog__backdrop');
    expect(backdrop.getAttribute('aria-modal')).toBe('true');
  });

  it('should set aria-label from title', () => {
    fixture.componentRef.setInput('open', true);
    fixture.componentRef.setInput('title', 'My Dialog');
    fixture.detectChanges();

    const backdrop = fixture.nativeElement.querySelector('.ff-dialog__backdrop');
    expect(backdrop.getAttribute('aria-label')).toBe('My Dialog');
  });

  it('should render panel inside backdrop', () => {
    fixture.componentRef.setInput('open', true);
    fixture.detectChanges();

    const panel = fixture.nativeElement.querySelector('.ff-dialog__panel');
    expect(panel).toBeTruthy();
  });

  it('should render title when provided', () => {
    fixture.componentRef.setInput('open', true);
    fixture.componentRef.setInput('title', 'Confirm');
    fixture.detectChanges();

    const title = fixture.nativeElement.querySelector('.ff-dialog__title');
    expect(title).toBeTruthy();
    expect(title.textContent.trim()).toBe('Confirm');
  });

  it('should not render header when title is empty', () => {
    fixture.componentRef.setInput('open', true);
    fixture.detectChanges();

    const header = fixture.nativeElement.querySelector('.ff-dialog__header');
    expect(header).toBeFalsy();
  });

  it('should render body zone', () => {
    fixture.componentRef.setInput('open', true);
    fixture.detectChanges();

    const body = fixture.nativeElement.querySelector('.ff-dialog__body');
    expect(body).toBeTruthy();
  });

  it('should render footer zone', () => {
    fixture.componentRef.setInput('open', true);
    fixture.detectChanges();

    const footer = fixture.nativeElement.querySelector('.ff-dialog__footer');
    expect(footer).toBeTruthy();
  });

  it('should emit closed on Escape key', () => {
    fixture.componentRef.setInput('open', true);
    fixture.detectChanges();

    const spy = vi.fn();
    component.closed.subscribe(spy);

    const backdrop = fixture.nativeElement.querySelector('.ff-dialog__backdrop');
    backdrop.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));

    expect(spy).toHaveBeenCalledOnce();
  });

  it('should emit closed on backdrop click', () => {
    fixture.componentRef.setInput('open', true);
    fixture.detectChanges();

    const spy = vi.fn();
    component.closed.subscribe(spy);

    const backdrop = fixture.nativeElement.querySelector('.ff-dialog__backdrop');
    backdrop.click();

    expect(spy).toHaveBeenCalledOnce();
  });

  it('should not emit closed on panel click', () => {
    fixture.componentRef.setInput('open', true);
    fixture.detectChanges();

    const spy = vi.fn();
    component.closed.subscribe(spy);

    const panel = fixture.nativeElement.querySelector('.ff-dialog__panel');
    panel.click();

    expect(spy).not.toHaveBeenCalled();
  });

  it('should not emit closed on non-Escape keys', () => {
    fixture.componentRef.setInput('open', true);
    fixture.detectChanges();

    const spy = vi.fn();
    component.closed.subscribe(spy);

    const backdrop = fixture.nativeElement.querySelector('.ff-dialog__backdrop');
    backdrop.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));

    expect(spy).not.toHaveBeenCalled();
  });
});

describe('FfDialogComponent (content projection)', () => {
  let fixture: ComponentFixture<ProjectionHostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProjectionHostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ProjectionHostComponent);
    fixture.detectChanges();
  });

  it('should project body content', () => {
    const body = fixture.nativeElement.querySelector('.body-text');
    expect(body).toBeTruthy();
    expect(body.textContent.trim()).toBe('Dialog body');
  });

  it('should project actions content', () => {
    const actionBtn = fixture.nativeElement.querySelector('.action-btn');
    expect(actionBtn).toBeTruthy();
    expect(actionBtn.textContent.trim()).toBe('OK');
  });

  it('should render title from host', () => {
    const title = fixture.nativeElement.querySelector('.ff-dialog__title');
    expect(title).toBeTruthy();
    expect(title.textContent.trim()).toBe('Host Title');
  });
});
