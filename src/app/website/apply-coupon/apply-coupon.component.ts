import { Component, OnInit, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CouponService } from '../../services/coupon.service';
import { Coupon } from 'src/app/model/coupon.model';

@Component({
  selector: 'app-apply-coupon',
  templateUrl: './apply-coupon.component.html',
  styleUrls: ['./apply-coupon.component.scss'],
})
export class ApplyCouponComponent {
  couponForm: FormGroup;
  couponData: Coupon | null = null;
  errorMessage = '';
  isLoading = false;
  isConfirmed = false;
  category: string = '';
  
  constructor(
    private dialogRef: MatDialogRef<ApplyCouponComponent>,
    private fb: FormBuilder,
    private couponService: CouponService,
    @Inject(MAT_DIALOG_DATA) public data: { category: string }
  ) {
    this.category = data?.category || '';
    this.couponForm = this.fb.group({
      code: ['', Validators.required],
    });
  }

  get code() {
    return this.couponForm.get('code')!;
  }

  async onApply() {
    if (this.isConfirmed && this.couponData) {
      // Return coupon data to parent
      this.dialogRef.close(this.couponData);
      return;
    }
    if (this.couponForm.invalid) return;

    const code = this.code.value.trim();
    this.errorMessage = '';
    this.couponData = null;
    this.isLoading = true;

    try {
      const coupon = await this.couponService.getCouponByCode(code);
      console.log(coupon);
      console.log(this.category)
      if (coupon) {
        if (coupon.category && this.category && coupon.category !== this.category) {
          this.errorMessage = `❌ This coupon is only valid for ${coupon.category} category.`;
          this.couponData = null;
          this.isConfirmed = false;
          return;
        }
        this.couponData = coupon;
        this.isConfirmed = true; // show Confirm button
      } else {
        this.errorMessage = '❌ Invalid coupon code.';
        this.couponData = null;
        this.isConfirmed = false;
      }
    } catch (error) {
      console.error(error);
      this.errorMessage = 'Something went wrong. Please try again.';
    } finally {
      this.isLoading = false;
    }
  }

  close() {
    this.dialogRef.close(); // closes dialog without returning data
  }
}
