import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PackagesService } from '../../services/packages.service';
import { CouponService } from '../../services/coupon.service';
import { Coupon } from '../../model/coupon.model';
import { SnacbarService } from '../../services/snack-bar/snacbar.service';
import { Packages } from '../../model/packages.model';
import { PropertyService } from 'src/app/maubook-admin/services/property.service';
import { PropertyCouponService } from '../../services/property-coupon.service';
import { AppearanceService } from '../../services/appearance.service';
import { BankInfo } from '../../model/bank.info.model';

@Component({
  selector: 'app-add-account',
  templateUrl: './add-account.component.html',
  styleUrls: ['./add-account.component.scss'],
})
export class AddAccountComponent implements OnInit {
  AccountForm!: FormGroup;
  bankInfo$ = this.accountService.getBankInfo();

  isLoading = false;
  constructor(
    private fb: FormBuilder,
    private accountService: AppearanceService,
    private snackbarService: SnacbarService
  ) {}

  ngOnInit(): void {
    this.AccountForm = this.fb.group({
      bankName: ['', Validators.required],
      bankAccountName: ['', Validators.required],
      accountNumber: ['', Validators.required],
      branch: ['', Validators.required],
    });
  }

  onSubmit() {
    if (this.AccountForm.valid) {
      this.isLoading = true;
      console.log(this.AccountForm.value);
      const bankInfo: BankInfo = this.AccountForm.getRawValue();

      this.accountService
        .saveBankInfo(bankInfo)
        .then(() => {
          this.snackbarService.showSuccess('Bank Info Updated successfully!');
          this.AccountForm.reset();
        })
        .catch((error) => {
          console.error('Error:', error);
          this.snackbarService.showError(error);
        })
        .finally(() => {
          this.isLoading = false;
        });
    }
  }
}
