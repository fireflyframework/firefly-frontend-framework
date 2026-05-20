import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FfFeatureFlagDirective } from './feature-flag.directive';
import { FeatureFlagService } from './feature-flag.service';
import { provideFeatureFlags } from './provide-feature-flags';

@Component({
  template: `<span *ffFeatureFlag="'new-dashboard'">Visible</span>`,
  standalone: true,
  imports: [FfFeatureFlagDirective],
})
class TestHostComponent {}

describe('FfFeatureFlagDirective', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let service: FeatureFlagService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TestHostComponent],
      providers: [provideFeatureFlags()],
    });

    service = TestBed.inject(FeatureFlagService);
    fixture = TestBed.createComponent(TestHostComponent);
  });

  it('should hide element when flag is not set', () => {
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).not.toContain('Visible');
  });

  it('should show element when flag is enabled', () => {
    service.setFlag('new-dashboard', true);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Visible');
  });

  it('should hide element when flag is disabled', () => {
    service.setFlag('new-dashboard', false);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).not.toContain('Visible');
  });

  it('should hide element when flag is removed via clear', () => {
    service.setFlag('new-dashboard', true);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Visible');

    service.clear();
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).not.toContain('Visible');
  });

  it('should react to flag changes without refresh', () => {
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).not.toContain('Visible');

    service.setFlag('new-dashboard', true);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Visible');

    service.setFlag('new-dashboard', false);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).not.toContain('Visible');
  });
});
