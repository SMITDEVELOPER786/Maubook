import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddCouponComponent } from './add.coupon.component';

describe('CouponComponent', () => {
  let component: AddCouponComponent;
  let fixture: ComponentFixture<AddCouponComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AddCouponComponent]
    });
    fixture = TestBed.createComponent(AddCouponComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
