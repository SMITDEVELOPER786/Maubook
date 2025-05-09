import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddPropertiesComponent } from './add-properties.component';

describe('AddPropertiesComponent', () => {
  let component: AddPropertiesComponent;
  let fixture: ComponentFixture<AddPropertiesComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AddPropertiesComponent]
    });
    fixture = TestBed.createComponent(AddPropertiesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
