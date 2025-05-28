import { Component, OnInit } from '@angular/core';
import { CouponService } from '../services/coupon.service';
import { Coupon } from '../model/coupon.model';

@Component({
  selector: 'app-coupons',
  templateUrl: './coupons.component.html',
  styleUrls: ['./coupons.component.scss']
})
export class CouponsComponent implements OnInit  {

  coupons: Coupon[] = [];
  filterText = '';
  page = 1;
  loading = true;

  constructor(private couponService: CouponService) {}

  ngOnInit(): void {
    this.getCoupons();
  }

  getCoupons(): void {
    this.couponService.getCoupons().subscribe((data) => {
     this.coupons = data.map(coupon => ({
      ...coupon,
      expiryDate: (coupon.expiryDate as any).toDate()  // assuming 'createdAt' is your timestamp field
    }));
    
      this.loading = false;
    });
  }

  get filteredCoupons() {
    const text = this.filterText.toLowerCase();
    return this.coupons.filter(
      (c) => c.couponCode.toLowerCase().includes(text) || c.category.toLowerCase().includes(text)
    );
  }



}
