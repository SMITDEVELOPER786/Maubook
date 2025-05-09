import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../services/auth.service'; // Import AuthService

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  email = '';
  password = '';
  errorMessage = '';
  returnUrl: string = '/';

  constructor(
    private authService: AuthService, // Inject AuthService
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
  }

  async onLogin() {
    try {
      await this.authService.login(this.email, this.password);
      this.authService.setLoginStatus(true); // Update login status
      await this.router.navigateByUrl(this.returnUrl);
    } catch (error: any) {
      this.errorMessage = error.message || 'Login failed. Please try again.';
    }
  }
}