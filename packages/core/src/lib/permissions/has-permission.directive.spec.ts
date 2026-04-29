import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HasPermissionDirective } from './has-permission.directive';
import { PermissionService } from './permission.service';

@Component({
  template: `<span *ffHasPermission="'resource.write'">Visible</span>`,
  standalone: true,
  imports: [HasPermissionDirective],
})
class TestHostComponent {}

describe('HasPermissionDirective', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let service: PermissionService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TestHostComponent],
    });

    service = TestBed.inject(PermissionService);
    fixture = TestBed.createComponent(TestHostComponent);
  });

  it('should hide element when permission is missing', () => {
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).not.toContain('Visible');
  });

  it('should show element when permission is present', () => {
    service.setPermissions(['resource.write'], []);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Visible');
  });

  it('should hide element when permission is removed', () => {
    service.setPermissions(['resource.write'], []);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Visible');

    service.clear();
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).not.toContain('Visible');
  });

  it('should react to permission changes without refresh', () => {
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).not.toContain('Visible');

    service.setPermissions(['resource.write'], []);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Visible');

    service.setPermissions(['resource.read'], []);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).not.toContain('Visible');
  });
});
