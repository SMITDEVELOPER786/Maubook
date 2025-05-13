import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddEveningComponent } from './add-evening.component';

describe('AddSpaComponent', () => {
  let component: AddEveningComponent;
  let fixture: ComponentFixture<AddEveningComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AddEveningComponent]
    });
    fixture = TestBed.createComponent(AddEveningComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
