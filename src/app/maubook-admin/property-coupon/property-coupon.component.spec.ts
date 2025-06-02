import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PropertyCouponComponent } from './property-coupon.component';

describe('PropertyCouponComponent', () => {
  let component: PropertyCouponComponent;
  let fixture: ComponentFixture<PropertyCouponComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PropertyCouponComponent]
    });
    fixture = TestBed.createComponent(PropertyCouponComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
