import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SchemaTypes } from './schema-types';

describe('SchemaTypes', () => {
  let component: SchemaTypes;
  let fixture: ComponentFixture<SchemaTypes>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SchemaTypes],
    }).compileComponents();

    fixture = TestBed.createComponent(SchemaTypes);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
