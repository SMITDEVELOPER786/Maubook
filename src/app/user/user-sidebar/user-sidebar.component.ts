import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-user-sidebar',
  templateUrl: './user-sidebar.component.html',
  styleUrls: ['./user-sidebar.component.scss']
})
export class UserSidebarComponent implements OnInit {
  isActive = false;
  userFirstName: string = '';

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService
  ) {}

  ngOnInit() {
    // Check auth state immediately
    this.authService.authState$.pipe(take(1)).subscribe(user => {
      if (user) {
        this.userFirstName = user.firstName || user.displayName?.split(' ')[0] || '';
        // If we're on login page with returnUrl, redirect to intended destination
        const returnUrl = this.route.snapshot.queryParams['returnUrl'];
        if (returnUrl) {
          this.router.navigateByUrl(returnUrl);
        }
      }
    });
  }
  
  navigateToProfile(tab: string) {
    this.toggleSidebar();
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/profile'], {
        queryParams: { tab }
      });
    }
  }

  toggleSidebar() {
    this.isActive = !this.isActive;
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/']);
    this.toggleSidebar();
  }
}