import 'zone.js';
import 'zone.js/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  BrowserTestingModule,
  platformBrowserTesting,
} from '@angular/platform-browser/testing';
import { FfAvatarComponent } from './ff-avatar.component';

TestBed.initTestEnvironment(BrowserTestingModule, platformBrowserTesting(), {
  teardown: { destroyAfterEach: true },
});

describe('FfAvatarComponent', () => {
  let component: FfAvatarComponent;
  let fixture: ComponentFixture<FfAvatarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FfAvatarComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(FfAvatarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have default size "md"', () => {
    expect(component.size()).toBe('md');
  });

  it('should have default src empty', () => {
    expect(component.src()).toBe('');
  });

  it('should apply size class to host', () => {
    const hostEl = fixture.nativeElement as HTMLElement;
    expect(hostEl.classList.contains('ff-avatar--md')).toBe(true);
  });

  it('should apply sm size class', () => {
    fixture.componentRef.setInput('size', 'sm');
    fixture.detectChanges();

    const hostEl = fixture.nativeElement as HTMLElement;
    expect(hostEl.classList.contains('ff-avatar--sm')).toBe(true);
  });

  it('should apply lg size class', () => {
    fixture.componentRef.setInput('size', 'lg');
    fixture.detectChanges();

    const hostEl = fixture.nativeElement as HTMLElement;
    expect(hostEl.classList.contains('ff-avatar--lg')).toBe(true);
  });

  it('should have role="img"', () => {
    const hostEl = fixture.nativeElement as HTMLElement;
    expect(hostEl.getAttribute('role')).toBe('img');
  });

  it('should render initials when src is empty', () => {
    fixture.componentRef.setInput('initials', 'JD');
    fixture.detectChanges();

    const initials = fixture.nativeElement.querySelector('.ff-avatar__initials');
    expect(initials).toBeTruthy();
    expect(initials.textContent.trim()).toBe('JD');
  });

  it('should render image when src is provided', () => {
    fixture.componentRef.setInput('src', 'https://example.com/photo.jpg');
    fixture.detectChanges();

    const img = fixture.nativeElement.querySelector('.ff-avatar__img');
    expect(img).toBeTruthy();
    expect(img.getAttribute('src')).toBe('https://example.com/photo.jpg');
  });

  it('should truncate initials to 2 characters', () => {
    fixture.componentRef.setInput('initials', 'ABC');
    fixture.detectChanges();

    const initials = fixture.nativeElement.querySelector('.ff-avatar__initials');
    expect(initials.textContent.trim()).toBe('AB');
  });

  it('should uppercase initials', () => {
    fixture.componentRef.setInput('initials', 'jd');
    fixture.detectChanges();

    const initials = fixture.nativeElement.querySelector('.ff-avatar__initials');
    expect(initials.textContent.trim()).toBe('JD');
  });

  it('should set alt on image', () => {
    fixture.componentRef.setInput('src', 'https://example.com/photo.jpg');
    fixture.componentRef.setInput('alt', 'Jane Doe');
    fixture.detectChanges();

    const img = fixture.nativeElement.querySelector('.ff-avatar__img');
    expect(img.getAttribute('alt')).toBe('Jane Doe');
  });

  it('should set aria-label from alt', () => {
    fixture.componentRef.setInput('alt', 'Jane Doe');
    fixture.detectChanges();

    const hostEl = fixture.nativeElement as HTMLElement;
    expect(hostEl.getAttribute('aria-label')).toBe('Jane Doe');
  });

  it('should fall back to initials as aria-label when no alt', () => {
    fixture.componentRef.setInput('initials', 'JD');
    fixture.detectChanges();

    const hostEl = fixture.nativeElement as HTMLElement;
    expect(hostEl.getAttribute('aria-label')).toBe('JD');
  });

  it('should fallback to initials on image error', () => {
    fixture.componentRef.setInput('src', 'https://example.com/broken.jpg');
    fixture.componentRef.setInput('initials', 'JD');
    fixture.detectChanges();

    // Simulate image error
    component.onImgError();
    fixture.detectChanges();

    const img = fixture.nativeElement.querySelector('.ff-avatar__img');
    expect(img).toBeNull();

    const initials = fixture.nativeElement.querySelector('.ff-avatar__initials');
    expect(initials).toBeTruthy();
    expect(initials.textContent.trim()).toBe('JD');
  });
});
