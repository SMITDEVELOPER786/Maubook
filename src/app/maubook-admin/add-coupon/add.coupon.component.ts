import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import {PackagesService} from '../services/packages.service';
import { CouponService } from '../services/coupon.service';
import { Coupon } from '../model/coupon.model';
import { SnacbarService } from '../../services/snack-bar/snacbar.service';


// import { HttpClient } from '@angular/common/http';


@Component({
  selector: 'app-coupon',
  templateUrl: './add.coupon.component.html',
  styleUrls: ['./add.coupon.component.css']
})
export class AddCouponComponent implements OnInit{
   couponForm!: FormGroup;
  categories: string[] = [];
  isLoading = false;
constructor(private fb: FormBuilder,private cateService: PackagesService, private couponService: CouponService, private snackbarService: SnacbarService) {}

  ngOnInit(): void {
    this.couponForm = this.fb.group({
      quantity: ['', [Validators.required, Validators.min(1)]],
      expiryDate: ['', Validators.required],
      couponCode: ['', [Validators.required, Validators.minLength(16), Validators.maxLength(16)]],
      categories: [null, Validators.required],
      discount: ['',[Validators.required, Validators.pattern(/^([1-9][0-9]?|100)%$/), ],]
    });

    this.cateService.getPackageCategories().subscribe((cats) => {
      this.categories = cats;
    });
  }
  

    generateCouponCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$';
    let code = '';
    for (let i = 0; i < 16; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    this.couponForm.get('couponCode')?.setValue(code);
  }

  onSubmit() {
    if (this.couponForm.valid) {
      this.isLoading = true;
      console.log(this.couponForm.value);
      // call your API here
      const coupon: Coupon = {
        quantity: this.couponForm.value.quantity,
        category: this.couponForm.value.categories,     
        expiryDate: this.couponForm.value.expiryDate, 
        couponCode: this.couponForm.value.couponCode,
        discount: this.couponForm.value.discount,
      };
      console.log(coupon);

     this.couponService.addCoupon(coupon)
      .then(() => {
        this.snackbarService.showSuccess('Coupon added successfully!');
        this.couponForm.reset();
      })
      .catch((error) => {
        console.error('Error adding coupon:', error);
        this.snackbarService.showError('Failed to add coupon. Please try again.');
      })
      .finally(() => {
        this.isLoading = false;
      });
    }
  }
   // Helper getters for form controls (optional, for easy access in template)
  get couponQty() { return this.couponForm.get('couponQty'); }
  get category() { return this.couponForm.get('category'); }
  get expiryDate() { return this.couponForm.get('expiryDate'); }
  get coupon() { return this.couponForm.get('coupon'); }


}
