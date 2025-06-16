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
import { Observable } from 'rxjs';

@Component({
  selector: 'app-add-account',
  templateUrl: './add-account.component.html',
  styleUrls: ['./add-account.component.scss'],
})
export class AddAccountComponent implements OnInit {
  AccountForm!: FormGroup;
  bankInfo$: Observable<BankInfo[]>;
  isLoading = false;
  isEditMode = false;
  editingId: string | null = null;

  constructor(
    private fb: FormBuilder,
    private accountService: AppearanceService,
    private snackbarService: SnacbarService
  ) {
    this.bankInfo$ = this.accountService.getBankInfo();
  }

  ngOnInit(): void {
    this.initForm();
  }

  initForm() {
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
      const bankInfo: BankInfo = this.AccountForm.getRawValue();

      if (this.isEditMode && this.editingId) {
        // Update existing account
        this.accountService.updateBankInfo(this.editingId, bankInfo)
          .then(() => {
            this.snackbarService.showSuccess('Bank Info Updated successfully!');
            this.resetForm();
          })
          .catch((error: Error) => {
            console.error('Error:', error);
            this.snackbarService.showError(error.message);
          })
          .finally(() => {
            this.isLoading = false;
          });
      } else {
        // Add new account
        this.accountService.saveBankInfo(bankInfo)
          .then(() => {
            this.snackbarService.showSuccess('Bank Info Added successfully!');
            this.resetForm();
          })
          .catch((error: Error) => {
            console.error('Error:', error);
            this.snackbarService.showError(error.message);
          })
          .finally(() => {
            this.isLoading = false;
          });
      }
    }
  }

  editAccount(bankInfo: BankInfo) {
    if (!bankInfo.id) {
      console.error('No ID found for bank info:', bankInfo);
      this.snackbarService.showError('Cannot edit: No ID found for this account');
      return;
    }
    this.isEditMode = true;
    this.editingId = bankInfo.id;
    this.AccountForm.patchValue(bankInfo);
  }

  deleteAccount(id: string) {
    if (!id) {
      console.error('No ID provided for deletion');
      this.snackbarService.showError('Cannot delete: No ID found for this account');
      return;
    }

    if (confirm('Are you sure you want to delete this account?')) {
      this.isLoading = true;
      this.accountService.deleteBankInfo(id)
        .then(() => {
          this.snackbarService.showSuccess('Bank Info Deleted successfully!');
        })
        .catch((error: Error) => {
          console.error('Error:', error);
          this.snackbarService.showError(error.message);
        })
        .finally(() => {
          this.isLoading = false;
        });
    }
  }

  resetForm() {
    this.AccountForm.reset();
    this.isEditMode = false;
    this.editingId = null;
  }

  cancelEdit() {
    this.resetForm();
  }
}
