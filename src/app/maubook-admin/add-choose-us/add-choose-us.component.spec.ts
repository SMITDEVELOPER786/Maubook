import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddChooseUsComponent } from './add-choose-us.component';

describe('AddChooseUsComponent', () => {
  let component: AddChooseUsComponent;
  let fixture: ComponentFixture<AddChooseUsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AddChooseUsComponent]
    });
    fixture = TestBed.createComponent(AddChooseUsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
