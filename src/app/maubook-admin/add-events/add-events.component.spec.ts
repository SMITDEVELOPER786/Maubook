import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddEventsComponent } from './add-events.component';

describe('AddEventsComponent', () => {
  let component: AddEventsComponent;
  let fixture: ComponentFixture<AddEventsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AddEventsComponent]
    });
    fixture = TestBed.createComponent(AddEventsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
