import { TestBed } from '@angular/core/testing';

import { PropertyCouponService } from './property-coupon.service';

describe('PropertyCouponService', () => {
  let service: PropertyCouponService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PropertyCouponService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
