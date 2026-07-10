import { Component } from '@angular/core';
import { TestBed, type ComponentFixture } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { scrollMemory, type ScrollMemoryOptions } from './scroll-memory';

/**
 * jsdom never lays anything out, so `scrollHeight`/`clientHeight` are 0 and the
 * "nearest scrollable ancestor" walk would find nothing. These stubs make one
 * chosen element look scrollable and let `scrollTop` round-trip.
 */
function makeScrollable(element: HTMLElement, scrollHeight = 1000, clientHeight = 500): void {
  Object.defineProperty(element, 'scrollHeight', { value: scrollHeight, configurable: true });
  Object.defineProperty(element, 'clientHeight', { value: clientHeight, configurable: true });
  element.style.overflowY = 'auto';
}

@Component({ standalone: true, template: '' })
class Host {
  static key: string | null = 'page';
  static options: ScrollMemoryOptions = {};
  constructor() {
    scrollMemory(
      () => Host.key,
      () => Host.options,
    );
  }
}

/** Mounts `Host` inside a scrollable container attached to the document. */
function mount(): { fixture: ComponentFixture<Host>; container: HTMLElement } {
  const container = document.createElement('div');
  container.className = 'shell-content';
  document.body.appendChild(container);
  makeScrollable(container);

  const fixture = TestBed.createComponent(Host);
  container.appendChild(fixture.nativeElement);
  fixture.detectChanges();
  TestBed.tick(); // flushes the `afterNextRender` restore
  return { fixture, container };
}

describe('scrollMemory', () => {
  beforeEach(() => {
    sessionStorage.clear();
    Host.key = 'page';
    Host.options = {};
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('persists the offset on destroy, under <key>.scrollTop', () => {
    const { fixture, container } = mount();
    container.scrollTop = 420;
    fixture.destroy();
    expect(sessionStorage.getItem('page.scrollTop')).toBe('420');
  });

  it('restores a previously stored offset after render', () => {
    sessionStorage.setItem('page.scrollTop', '250');
    const { container } = mount();
    expect(container.scrollTop).toBe(250);
  });

  it('leaves the container alone when nothing is stored', () => {
    const { container } = mount();
    expect(container.scrollTop).toBe(0);
  });

  it('stays inert for a null key', () => {
    Host.key = null;
    const { fixture, container } = mount();
    container.scrollTop = 300;
    fixture.destroy();
    expect(sessionStorage.length).toBe(0);
  });

  it('honours an explicit container selector', () => {
    Host.options = { containerSelector: '.shell-content' };
    const { fixture, container } = mount();
    container.scrollTop = 120;
    fixture.destroy();
    expect(sessionStorage.getItem('page.scrollTop')).toBe('120');
  });

  it('honours the local storage lifetime', () => {
    Host.options = { storage: 'local' };
    const { fixture, container } = mount();
    container.scrollTop = 90;
    fixture.destroy();
    expect(localStorage.getItem('page.scrollTop')).toBe('90');
    expect(sessionStorage.getItem('page.scrollTop')).toBeNull();
    localStorage.clear();
  });
});
