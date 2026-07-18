import 'zone.js';
import 'zone.js/testing';
import { Component, input } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import {
  BrowserTestingModule,
  platformBrowserTesting,
} from '@angular/platform-browser/testing';

import {
  FfDialogContainerComponent,
  FfDialogItem,
  FfDialogResolution,
} from './ff-dialog-container.component';

TestBed.initTestEnvironment(BrowserTestingModule, platformBrowserTesting(), {
  teardown: { destroyAfterEach: true },
});

/** Minimal standalone component hosted through options.component. */
@Component({
  standalone: true,
  selector: 'ff-test-hosted',
  template: `<p class="hosted">Hello {{ name() }}</p>`,
})
class HostedComponent {
  readonly name = input('nobody');
}

function item(
  id: string,
  options: Partial<FfDialogItem['options']> = {}
): FfDialogItem {
  return { id, options: { type: 'info', ...options } };
}

describe('FfDialogContainerComponent', () => {
  function setup(dialogs: readonly FfDialogItem[] = []) {
    TestBed.configureTestingModule({
      imports: [FfDialogContainerComponent],
    });
    const fixture = TestBed.createComponent(FfDialogContainerComponent);
    fixture.componentRef.setInput('dialogs', dialogs);
    fixture.detectChanges();

    const emitted: FfDialogResolution[] = [];
    fixture.componentInstance.resolved.subscribe((r) => emitted.push(r));
    return { fixture, emitted };
  }

  function query<T extends HTMLElement>(
    fixture: { nativeElement: HTMLElement },
    selector: string
  ): T {
    const element = fixture.nativeElement.querySelector(selector);
    if (element === null) {
      throw new Error(`Missing element '${selector}'`);
    }
    return element as T;
  }

  it('renders nothing when there are no dialogs', () => {
    const { fixture } = setup([]);
    expect(fixture.nativeElement.querySelector('.ff-dialog-container__overlay')).toBeNull();
  });

  it('renders the dialog panel with title, message and complete aria wiring', () => {
    const { fixture } = setup([
      item('d1', { title: 'Delete file?', message: 'This cannot be undone.' }),
    ]);
    const panel = query(fixture, '.ff-dialog-container__panel');
    expect(panel.getAttribute('role')).toBe('dialog');
    expect(panel.getAttribute('aria-modal')).toBe('true');

    const title = query(fixture, '.ff-dialog-container__title');
    expect(title.textContent).toContain('Delete file?');
    expect(panel.getAttribute('aria-labelledby')).toBe(title.id);

    const message = query(fixture, '.ff-dialog-container__message');
    expect(message.textContent).toContain('This cannot be undone.');
    expect(panel.getAttribute('aria-describedby')).toBe(message.id);
  });

  it('renders only the topmost (last) dialog of the stack', () => {
    const { fixture } = setup([
      item('below', { title: 'Below' }),
      item('above', { title: 'Above' }),
    ]);
    const panels = fixture.nativeElement.querySelectorAll('.ff-dialog-container__panel');
    expect(panels.length).toBe(1);
    expect(query(fixture, '.ff-dialog-container__title').textContent).toContain('Above');
  });

  it('defaults the confirm label to "Confirm" and omits cancel without cancelLabel', () => {
    const { fixture } = setup([item('d1', { title: 'T' })]);
    expect(query(fixture, '.ff-dialog-container__confirm').textContent).toContain('Confirm');
    expect(fixture.nativeElement.querySelector('.ff-dialog-container__cancel')).toBeNull();
  });

  it('renders custom confirm/cancel labels', () => {
    const { fixture } = setup([
      item('d1', { confirmLabel: 'Delete', cancelLabel: 'Keep it' }),
    ]);
    expect(query(fixture, '.ff-dialog-container__confirm').textContent).toContain('Delete');
    expect(query(fixture, '.ff-dialog-container__cancel').textContent).toContain('Keep it');
  });

  it('maps the structural type to a panel accent (destructive→error, custom→none)', () => {
    const { fixture } = setup([item('d1', { type: 'destructive' })]);
    expect(
      query(fixture, '.ff-dialog-container__panel').classList.contains(
        'ff-dialog-container__panel--error'
      )
    ).toBe(true);

    fixture.componentRef.setInput('dialogs', [item('d2', { type: 'custom' })]);
    fixture.detectChanges();
    const panel = query(fixture, '.ff-dialog-container__panel');
    for (const accent of ['success', 'error', 'warning', 'info']) {
      expect(panel.classList.contains(`ff-dialog-container__panel--${accent}`)).toBe(false);
    }
  });

  it('emits resolved{confirmed:true} when the confirm button is clicked', () => {
    const { fixture, emitted } = setup([item('yes', { title: 'T' })]);
    query<HTMLButtonElement>(fixture, '.ff-dialog-container__confirm button').click();
    expect(emitted).toEqual([{ id: 'yes', confirmed: true }]);
  });

  it('emits resolved{confirmed:false} on cancel button, backdrop click and Escape', () => {
    const { fixture, emitted } = setup([
      item('no', { title: 'T', cancelLabel: 'Cancel' }),
    ]);

    query<HTMLButtonElement>(fixture, '.ff-dialog-container__cancel button').click();
    query(fixture, '.ff-dialog-container__backdrop').click();
    query(fixture, '.ff-dialog-container__panel').dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })
    );

    expect(emitted).toEqual([
      { id: 'no', confirmed: false },
      { id: 'no', confirmed: false },
      { id: 'no', confirmed: false },
    ]);
  });

  it('keeps the confirm button disabled until the destructive text matches exactly', () => {
    const { fixture, emitted } = setup([
      item('boom', { type: 'destructive', destructiveConfirmText: 'DELETE' }),
    ]);
    const confirmButton = (): HTMLButtonElement =>
      query(fixture, '.ff-dialog-container__confirm button');
    const gate = query<HTMLInputElement>(fixture, '.ff-dialog-container__gate input');

    expect(confirmButton().disabled).toBe(true);
    confirmButton().click();
    expect(emitted).toEqual([]);

    gate.value = 'DELET';
    gate.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    expect(confirmButton().disabled).toBe(true);

    gate.value = 'DELETE';
    gate.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    expect(confirmButton().disabled).toBe(false);

    confirmButton().click();
    expect(emitted).toEqual([{ id: 'boom', confirmed: true, input: 'DELETE' }]);
  });

  it('hosts a custom component through NgComponentOutlet with componentData as inputs', () => {
    const { fixture } = setup([
      item('c1', {
        type: 'custom',
        component: HostedComponent,
        componentData: { name: 'Firefly' },
      }),
    ]);
    const hosted = query(fixture, '.hosted');
    expect(hosted.textContent).toContain('Hello Firefly');
    // Custom components replace the default layout entirely.
    expect(fixture.nativeElement.querySelector('.ff-dialog-container__actions')).toBeNull();
  });

  it('traps focus inside the panel with the CDK focus trap', () => {
    const { fixture } = setup([
      item('trap', { title: 'T', cancelLabel: 'Cancel' }),
    ]);
    const overlay = query(fixture, '.ff-dialog-container__overlay');
    // CdkTrapFocus wraps the trapped region between its two anchors.
    const anchors = overlay.querySelectorAll('.cdk-focus-trap-anchor');
    expect(anchors.length).toBe(2);

    // Every focusable element of the overlay lives inside the panel.
    const panel = query(fixture, '.ff-dialog-container__panel');
    const focusables = overlay.querySelectorAll('button, input, [tabindex]');
    expect(focusables.length).toBeGreaterThan(0);
    for (const element of Array.from(focusables)) {
      if (element.classList.contains('cdk-focus-trap-anchor')) {
        continue;
      }
      expect(panel.contains(element)).toBe(true);
    }
  });

  it('restores focus to the previously focused element when the last dialog resolves', () => {
    const trigger = document.createElement('button');
    document.body.appendChild(trigger);
    trigger.focus();
    expect(document.activeElement).toBe(trigger);

    try {
      const { fixture } = setup([]);
      fixture.componentRef.setInput('dialogs', [item('f1', { title: 'T' })]);
      fixture.detectChanges();

      fixture.componentRef.setInput('dialogs', []);
      fixture.detectChanges();

      expect(document.activeElement).toBe(trigger);
    } finally {
      trigger.remove();
    }
  });
});
