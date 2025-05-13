import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddActivitiesComponent } from './add-activities.component';

describe('AddActivitiesComponent', () => {
  let component: AddActivitiesComponent;
  let fixture: ComponentFixture<AddActivitiesComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AddActivitiesComponent]
    });
    fixture = TestBed.createComponent(AddActivitiesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
