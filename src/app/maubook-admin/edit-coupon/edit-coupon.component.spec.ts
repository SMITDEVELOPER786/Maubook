import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditCouponComponent } from './edit-coupon.component';

describe('EditCouponComponent', () => {
  let component: EditCouponComponent;
  let fixture: ComponentFixture<EditCouponComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [EditCouponComponent]
    });
    fixture = TestBed.createComponent(EditCouponComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
