import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PackagesService } from '../../services/packages.service';
import { CouponService } from '../../services/coupon.service';
import { Coupon } from '../../model/coupon.model';
import { SnacbarService } from '../../services/snack-bar/snacbar.service';
import { Packages } from '../../model/packages.model';
import { PropertyService } from 'src/app/maubook-admin/services/property.service';
import { PropertyCouponService } from '../../services/property-coupon.service';

// import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-coupon',
  templateUrl: './add.coupon.component.html',
  styleUrls: ['./add.coupon.component.css'],
})
export class AddCouponComponent implements OnInit {
  couponForm!: FormGroup;
  packages: Packages[] = [];
  categories: string[] = [];
  couponForHotels: boolean = true;
  isLoading = false;
  constructor(
    private fb: FormBuilder,
    private cateService: PackagesService,
    private couponService: CouponService,
    private snackbarService: SnacbarService,
    private propertyService: PropertyService,
    private propertyCouponService: PropertyCouponService
  ) {}

  ngOnInit(): void {
    this.couponForm = this.fb.group({
      couponForServiceOrHotel: ['For Hotels', Validators.required],
      quantity: ['', [Validators.required, Validators.min(1)]],
      expiryDate: ['', Validators.required],
      packages: [null, Validators.required],
      category: [null, Validators.required],
      prefix: [
        'MAUBOOK',
        [Validators.required, Validators.minLength(4), Validators.maxLength(8)],
      ],
      couponCode: [
        '',
        [
          Validators.required,
          Validators.minLength(1),
          Validators.maxLength(10),
        ],
      ],

      discount: [
        '',
        [Validators.required, Validators.pattern(/^([1-9][0-9]?|100)%$/)],
      ],
    });

    this.getPropertyCategory();
  }

  getPackagesCategory() {
    this.cateService.getPackageCategories().subscribe((cats) => {
      this.categories = cats;
    });
  }

  getPackages() {
    this.cateService.getPackages().subscribe((data) => {
      this.packages = data;
      console.log(this.packages);
    });
  }

  getPropertyPackages() {
    this.propertyService.getAllPropertiesAsPackages().subscribe((data) => {
      this.packages = data;
      console.log(this.packages);
    });
  }

  getPropertyPackagesByCategory(category: string) {
    this.propertyService.getPropertiesByCategory(category).subscribe((data) => {
      this.packages = data;
      console.log(this.packages);
    });
  }

  getPackagesByCategory(category: string) {
    this.cateService.getPackagesByCategory(category).subscribe((data) => {
      this.packages = data;
      console.log(data);
    });
  }

  getPropertyCategory() {
    this.propertyService.getAllPropertyCategories().subscribe((data) => {
      this.categories = data;
      console.log(this.categories);
    });
  }

  onServiceOrHotelChange(selectedValue: string): void {
    console.log('Selected selectedValue:', selectedValue);
    if (selectedValue === 'For Hotels') {
      this.couponForHotels = true;
      this.getPropertyCategory();
      this.packages = [];
    } else {
      this.couponForHotels = false;
      this.getPackagesCategory();
      this.packages = [];
    }
    // You can call your getPackagesByCategory method here:
    // this.getPackagesByCategory(selectedCategory);
  }

  onCategoryChange(selectedCategory: string): void {
    if (this.couponForm.value.couponForServiceOrHotel == 'For Hotels') {
      this.getPropertyPackagesByCategory(selectedCategory);
    } else {
      this.getPackagesByCategory(selectedCategory);
    }
  }

  generateCouponCode() {
    const chars =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$';
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
        expiryDate: this.couponForm.value.expiryDate,
        couponCode:
          this.couponForm.value.prefix + this.couponForm.value.couponCode,
        discount: this.couponForm.value.discount,
        category: this.couponForm.value.packages.category,
        package: this.couponForm.value.packages.id,
      };
      console.log(coupon);
      if (this.couponForm.value.couponForServiceOrHotel == 'For Hotels') {
        this.propertyCouponService
          .addCoupon(coupon)
          .then(() => {
            this.snackbarService.showSuccess('Coupon added successfully!');
            this.couponForm.reset();
          })
          .catch((error) => {
            console.error('Error adding coupon:', error);
            this.snackbarService.showError(error);
          })
          .finally(() => {
            this.isLoading = false;
          });
      } else {
        this.couponService
          .addCoupon(coupon)
          .then(() => {
            this.snackbarService.showSuccess('Coupon added successfully!');
            this.couponForm.reset();
          })
          .catch((error) => {
            console.error('Error adding coupon:', error);
            this.snackbarService.showError(error);
          })
          .finally(() => {
            this.isLoading = false;
          });
      }
    }
  }
  // Helper getters for form controls (optional, for easy access in template)
  get couponQty() {
    return this.couponForm.get('couponQty');
  }
  get category() {
    return this.couponForm.get('category');
  }
  get expiryDate() {
    return this.couponForm.get('expiryDate');
  }
  get coupon() {
    return this.couponForm.get('coupon');
  }
}
