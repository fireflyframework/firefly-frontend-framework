import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FrameworkCore } from './framework-core';

describe('FrameworkCore', () => {
  let component: FrameworkCore;
  let fixture: ComponentFixture<FrameworkCore>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FrameworkCore],
    }).compileComponents();

    fixture = TestBed.createComponent(FrameworkCore);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
