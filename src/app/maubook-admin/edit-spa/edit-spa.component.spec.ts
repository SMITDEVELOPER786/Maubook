import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditSpaComponent } from './edit-spa.component';

describe('EditSpaComponent', () => {
  let component: EditSpaComponent;
  let fixture: ComponentFixture<EditSpaComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [EditSpaComponent]
    });
    fixture = TestBed.createComponent(EditSpaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
