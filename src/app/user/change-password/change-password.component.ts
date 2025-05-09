import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.scss']
})
export class ChangePasswordComponent implements OnInit {
  changePasswordForm: FormGroup;
  errorMessage: string = '';
  successMessage: string = '';
  isSubmitting: boolean = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService
  ) {
    this.changePasswordForm = this.fb.group({
      currentPassword: ['', [Validators.required]],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmNewPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit(): void {}

  passwordMatchValidator(form: FormGroup) {
    const newPassword = form.get('newPassword')?.value;
    const confirmNewPassword = form.get('confirmNewPassword')?.value;
    return newPassword === confirmNewPassword ? null : { passwordMismatch: true };
  }

  async onSubmit() {
    if (this.changePasswordForm.invalid) {
      this.errorMessage = 'Please fill all fields correctly.';
      this.successMessage = '';
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';
    this.successMessage = '';

    const { currentPassword, newPassword } = this.changePasswordForm.value;

    try {
      await this.authService.changePassword(currentPassword, newPassword);
      this.successMessage = 'Password updated successfully!';
      this.errorMessage = '';
      this.changePasswordForm.reset();
    } catch (error: any) {
      console.error('Error changing password:', error);
      switch (error.code) {
        case 'auth/wrong-password':
          this.errorMessage = 'Current password is incorrect.';
          break;
        case 'auth/weak-password':
          this.errorMessage = 'New password is too weak. It must be at least 6 characters.';
          break;
        case 'auth/requires-recent-login':
          this.errorMessage = 'Session expired. Please log out and log in again.';
          break;
        case 'auth/network-request-failed':
          this.errorMessage = 'Network error. Please check your internet connection and try again.';
          break;
        default:
          this.errorMessage = 'Failed to update password. Please try again later.';
      }
      this.successMessage = '';
    } finally {
      this.isSubmitting = false;
    }
  }
}