import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PackagesService } from '../services/packages.service';
import { CouponService } from '../services/coupon.service';
import { SnacbarService } from 'src/app/services/snack-bar/snacbar.service';
import { Coupon } from '../model/coupon.model';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-edit-coupon',
  templateUrl: './edit-coupon.component.html',
  styleUrls: ['./edit-coupon.component.scss'],
})
export class EditCouponComponent implements OnInit {
  couponForm!: FormGroup;
  categories: string[] = [];
  isLoading = false;
  couponId: string = '';
  isDataFound: Boolean = true;
  constructor(
    private fb: FormBuilder,
    private cateService: PackagesService,
    private couponService: CouponService,
    private snackbarService: SnacbarService,
    private route: ActivatedRoute,
    public router: Router
  ) {}
  ngOnInit(): void {
    this.couponId = this.route.snapshot.paramMap.get('id')!;
    console.log('Coupon ID:', this.couponId);
    this.cateService.getPackageCategories().subscribe((cats) => {
      this.categories = cats;
      this.couponForm = this.fb.group({
        quantity: ['', [Validators.required, Validators.min(1)]],
        expiryDate: ['', Validators.required],
        couponCode: [{ value: '', disabled: true }, [Validators.required]],
        categories: [null, Validators.required],
        discount: [
          '',
          [Validators.required, Validators.pattern(/^([1-9][0-9]?|100)%$/)],
        ],
      });

      this.couponService.getCouponById(this.couponId).subscribe(
        (coupon) => {
          if (coupon?.couponCode) {
            console.log(coupon);
            const expiryDate = (coupon.expiryDate as any)?.toDate?.() ?? null;
            this.couponForm.patchValue({
              quantity: coupon.quantity,
              expiryDate,
              couponCode: coupon.couponCode,
              categories: coupon.category,
              discount: coupon.discount,
            });
            this.couponForm;
          } else {
            // Handle "not found"
            this.isDataFound = false;
          }
        },
        (error) => {
          this.isDataFound = false;
          console.error('Error occurred:', error);
        }
      );
    });
  }

  onSubmit() {
    if (this.couponForm.invalid || !this.couponId) return;
    this.isLoading = true;
    const updatedCoupon: Coupon = this.couponForm.getRawValue(); // getRawValue to get disabled fields too
    console.log(updatedCoupon);

    this.couponService
      .updateCoupon(this.couponId, updatedCoupon)
      .then(() => {
        this.isLoading = false;
        this.snackbarService.showSuccess('Coupon Updated Successfully!');
        // Show a success toast or navigate
        this.router.navigate(['/coupons']);
      })
      .catch((error) => {
        this.isLoading = false;
        console.error('Update failed:', error);
        this.snackbarService.showError(error);
      });
  }
}
