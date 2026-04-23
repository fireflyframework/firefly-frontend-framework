import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TestingUtils } from './testing-utils';

describe('TestingUtils', () => {
  let component: TestingUtils;
  let fixture: ComponentFixture<TestingUtils>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestingUtils],
    }).compileComponents();

    fixture = TestBed.createComponent(TestingUtils);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
