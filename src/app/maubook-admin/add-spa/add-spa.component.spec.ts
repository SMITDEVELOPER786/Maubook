import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddSpaComponent } from './add-spa.component';

describe('AddSpaComponent', () => {
  let component: AddSpaComponent;
  let fixture: ComponentFixture<AddSpaComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AddSpaComponent]
    });
    fixture = TestBed.createComponent(AddSpaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
