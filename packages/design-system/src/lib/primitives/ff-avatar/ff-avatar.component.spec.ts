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

  describe('name → initials derivation', () => {
    function initialsText(): string {
      const el = fixture.nativeElement.querySelector('.ff-avatar__initials');
      return el.textContent.trim();
    }

    it('should derive a single initial from a one-word name', () => {
      fixture.componentRef.setInput('name', 'Madonna');
      fixture.detectChanges();

      expect(initialsText()).toBe('M');
    });

    it('should derive first + last initials from a two-word name', () => {
      fixture.componentRef.setInput('name', 'Jane Doe');
      fixture.detectChanges();

      expect(initialsText()).toBe('JD');
    });

    it('should derive first + last initials from a compound (3+ word) name, ignoring middle words', () => {
      fixture.componentRef.setInput('name', 'Maria Garcia Luque');
      fixture.detectChanges();

      expect(initialsText()).toBe('ML');
    });

    it('should collapse extra/irregular whitespace between words', () => {
      fixture.componentRef.setInput('name', '  Jane    Doe  ');
      fixture.detectChanges();

      expect(initialsText()).toBe('JD');
    });

    it('should uppercase derived initials', () => {
      fixture.componentRef.setInput('name', 'jane doe');
      fixture.detectChanges();

      expect(initialsText()).toBe('JD');
    });

    it('should derive initials from unicode names', () => {
      fixture.componentRef.setInput('name', 'Émile Zola');
      fixture.detectChanges();

      expect(initialsText()).toBe('ÉZ');
    });

    it('should render empty initials for an empty name', () => {
      fixture.componentRef.setInput('name', '');
      fixture.detectChanges();

      expect(initialsText()).toBe('');
    });

    it('should render empty initials for a whitespace-only name', () => {
      fixture.componentRef.setInput('name', '   ');
      fixture.detectChanges();

      expect(initialsText()).toBe('');
    });

    it('should let the explicit initials input override the name derivation', () => {
      fixture.componentRef.setInput('name', 'Jane Doe');
      fixture.componentRef.setInput('initials', 'XX');
      fixture.detectChanges();

      expect(initialsText()).toBe('XX');
    });
  });

  describe('numeric size', () => {
    it('should apply the "custom" size class for a numeric size', () => {
      fixture.componentRef.setInput('size', 72);
      fixture.detectChanges();

      const hostEl = fixture.nativeElement as HTMLElement;
      expect(hostEl.classList.contains('ff-avatar--custom')).toBe(true);
    });

    it('should set inline width/height for a numeric size', () => {
      fixture.componentRef.setInput('size', 72);
      fixture.detectChanges();

      const hostEl = fixture.nativeElement as HTMLElement;
      expect(hostEl.style.width).toBe('72px');
      expect(hostEl.style.height).toBe('72px');
    });

    it('should not set inline width/height for a predefined size', () => {
      fixture.componentRef.setInput('size', 'lg');
      fixture.detectChanges();

      const hostEl = fixture.nativeElement as HTMLElement;
      expect(hostEl.style.width).toBe('');
      expect(hostEl.style.height).toBe('');
    });

    it('should set a proportional initials font size for a numeric size', () => {
      fixture.componentRef.setInput('size', 100);
      fixture.detectChanges();

      const hostEl = fixture.nativeElement as HTMLElement;
      expect(hostEl.style.getPropertyValue('--ff-avatar-initials-size').trim()).toBe('40px');
    });
  });

  describe('round / cornerRadius', () => {
    it('should default to round (no square modifier class)', () => {
      const hostEl = fixture.nativeElement as HTMLElement;
      expect(hostEl.classList.contains('ff-avatar--square')).toBe(false);
    });

    it('should apply the square modifier class when round is false', () => {
      fixture.componentRef.setInput('round', false);
      fixture.detectChanges();

      const hostEl = fixture.nativeElement as HTMLElement;
      expect(hostEl.classList.contains('ff-avatar--square')).toBe(true);
    });

    it('should set the corner radius custom property when provided', () => {
      fixture.componentRef.setInput('round', false);
      fixture.componentRef.setInput('cornerRadius', '12px');
      fixture.detectChanges();

      const hostEl = fixture.nativeElement as HTMLElement;
      expect(hostEl.style.getPropertyValue('--ff-avatar-radius').trim()).toBe('12px');
    });

    it('should keep the round shape when cornerRadius is set but round stays true', () => {
      fixture.componentRef.setInput('cornerRadius', '12px');
      fixture.detectChanges();

      const hostEl = fixture.nativeElement as HTMLElement;
      expect(hostEl.classList.contains('ff-avatar--square')).toBe(false);
    });
  });

  describe('tone', () => {
    it('should not apply a tone class by default', () => {
      const hostEl = fixture.nativeElement as HTMLElement;
      expect(hostEl.className).not.toContain('ff-avatar--tone-');
    });

    it('should apply the matching tone class when set', () => {
      fixture.componentRef.setInput('tone', 'success');
      fixture.detectChanges();

      const hostEl = fixture.nativeElement as HTMLElement;
      expect(hostEl.classList.contains('ff-avatar--tone-success')).toBe(true);
    });
  });
});
