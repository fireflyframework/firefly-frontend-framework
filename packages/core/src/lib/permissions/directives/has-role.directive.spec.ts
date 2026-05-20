import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HasRoleDirective } from './has-role.directive';
import { PermissionService } from '../permission.service';
import { providePermissions } from '../provide-permissions';

@Component({
  template: `<span *ffHasRole="'admin'">Admin Only</span>`,
  standalone: true,
  imports: [HasRoleDirective],
})
class TestHostComponent {}

describe('HasRoleDirective', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let service: PermissionService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TestHostComponent],
      providers: [providePermissions()],
    });

    service = TestBed.inject(PermissionService);
    fixture = TestBed.createComponent(TestHostComponent);
  });

  it('should hide element when role is missing', () => {
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).not.toContain('Admin Only');
  });

  it('should show element when role is present', () => {
    service.setPermissions([], ['admin']);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Admin Only');
  });

  it('should hide element when role is removed', () => {
    service.setPermissions([], ['admin']);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Admin Only');

    service.clear();
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).not.toContain('Admin Only');
  });

  it('should react to role changes without refresh', () => {
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).not.toContain('Admin Only');

    service.setPermissions([], ['admin']);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Admin Only');

    service.setPermissions([], ['viewer']);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).not.toContain('Admin Only');
  });
});
