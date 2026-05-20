import { Component, ViewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FfPiiMaskDirective } from './pii-mask.directive';

@Component({
  template: `
    <span
      [ffPiiMask]="type"
      [ffPiiMaskValue]="value"
      (ffPiiMaskToggled)="lastEvent = $event">
    </span>
  `,
  standalone: true,
  imports: [FfPiiMaskDirective],
})
class TestHostComponent {
  @ViewChild(FfPiiMaskDirective) directive!: FfPiiMaskDirective;
  type: 'nif' | 'card' | 'phone' | 'email' | 'iban' = 'nif';
  value = '12345678A';
  lastEvent: 'visible' | 'hidden' | null = null;
}

describe('FfPiiMaskDirective', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let host: TestHostComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TestHostComponent],
    });
    fixture = TestBed.createComponent(TestHostComponent);
    host = fixture.componentInstance;
  });

  it('should show masked value initially', () => {
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('span').textContent).toBe('******78A');
  });

  it('should reveal real value after toggle', () => {
    fixture.detectChanges();
    host.directive.toggle();
    expect(fixture.nativeElement.querySelector('span').textContent).toBe('12345678A');
  });

  it('should re-mask after second toggle', () => {
    fixture.detectChanges();
    host.directive.toggle(); // reveal
    host.directive.toggle(); // mask again
    expect(fixture.nativeElement.querySelector('span').textContent).toBe('******78A');
  });

  it('should emit "visible" when revealing', () => {
    fixture.detectChanges();
    host.directive.toggle();
    expect(host.lastEvent).toBe('visible');
  });

  it('should emit "hidden" when re-masking', () => {
    fixture.detectChanges();
    host.directive.toggle(); // visible
    host.directive.toggle(); // hidden
    expect(host.lastEvent).toBe('hidden');
  });

  it('should report isMasked correctly', () => {
    fixture.detectChanges();
    expect(host.directive.isMasked).toBe(true);
    host.directive.toggle();
    expect(host.directive.isMasked).toBe(false);
  });

  it('should render masked value for a different NIF', () => {
    host.value = 'X1234567L';
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('span').textContent).toBe('******67L');
  });

  it('should render masked value for an IBAN', () => {
    host.type = 'iban';
    host.value = 'ES9121000418450200051332';
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('span').textContent).toBe('ES91 **** **** **** **** 1332');
  });

  it('should update when type changes', () => {
    host.type = 'email';
    host.value = 'user@mail.com';
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('span').textContent).toBe('u***@mail.com');
  });

  it('should mask a card number', () => {
    host.type = 'card';
    host.value = '4111111111111111';
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('span').textContent).toBe('**** **** **** 1111');
  });

  it('should handle empty value gracefully', () => {
    host.value = '';
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('span').textContent).toBe('');
  });
});
