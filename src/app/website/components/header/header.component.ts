import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import { Subscription } from 'rxjs';
import { UserSidebarComponent } from 'src/app/user/user-sidebar/user-sidebar.component';
import { Router } from '@angular/router';
import { AboutService } from 'src/app/services/about.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit, OnDestroy {
  isLoggedIn: boolean = false;
  userFirstName: string = '';
  logo: string = '';
  isMobileMenuOpen: boolean = false;

  isLoading: boolean = true;
  private authSubscription: Subscription | null = null;
  private loadingSubscription: Subscription | null = null;

  @ViewChild(UserSidebarComponent) sidebar!: UserSidebarComponent;


  constructor(
    private authService: AuthService,
    private  aboutService: AboutService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadingSubscription = this.authService.loading$.subscribe(loading => {
      this.isLoading = loading;
    });
     this.aboutService.getappearance().subscribe((intro: any) => {
      console.log(intro[0]["imageUrl"]);
    this.logo=intro[0]["imageUrl"]
    });

    this.authSubscription = this.authService.authState$.subscribe(user => {
      this.isLoggedIn = !!user;
      this.authService.setLoginStatus(this.isLoggedIn);
      if (user) {
        this.userFirstName = user.firstName || user.displayName?.split(' ')[0] || '';
      } else {
        this.userFirstName = '';
      }
    });
  }

  ngOnDestroy(): void {
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
    if (this.loadingSubscription) {
      this.loadingSubscription.unsubscribe();
    }
  }

  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
    // Prevent body scroll when menu is open
    if (this.isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }

  closeMobileMenu(): void {
    this.isMobileMenuOpen = false;
    document.body.style.overflow = '';
  }

  toggleSidebar(): void {
    console.log('HeaderComponent: toggleSidebar called, isLoading:', this.isLoading, 'isLoggedIn:', this.isLoggedIn);
    if (this.isLoading) {
      return; // Prevent action during loading
    }
    if (!this.isLoggedIn) {
      // Do not redirect for unauthenticated users
      return;
    }
    this.sidebar.toggleSidebar();
    this.closeMobileMenu(); // Close mobile menu when opening sidebar
  }
}