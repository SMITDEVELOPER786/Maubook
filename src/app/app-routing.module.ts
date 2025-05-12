import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { WebsiteLayoutComponent } from './layout/website-layout/website-layout.component';
import { AdminLayoutComponent } from './layout/admin-layout/admin-layout.component';
import { HomepageComponent } from './website/pages/homepage/homepage.component';
import { AdminDashboardComponent } from './maubook-admin/admin-dashboard/admin-dashboard.component';
import { StaysComponent } from './website/pages/stays/stays.component';
import { PackagesComponent } from './maubook-admin/packages/packages.component';
import { AddPackagesComponent } from './maubook-admin/add-packages/add-packages.component';
import { AddPropertiesComponent } from './maubook-admin/add-properties/add-properties.component';
import { PropertiesComponent } from './maubook-admin/properties/properties.component';
import { UsersComponent } from './maubook-admin/users/users.component';
import { PropertyDetailsComponent } from './website/pages/property-details/property-details.component';
import { CategoryPackagesComponent } from './website/pages/category-packages/category-packages.component';
import { PackageDetailsComponent } from './website/pages/package-details/package-details.component';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { ProfileComponent } from './user/profile/profile.component';
import { ChangePasswordComponent } from './user/change-password/change-password.component';
import { MyBookingsComponent } from './user/my-bookings/my-bookings.component';
import { HotelBookingsComponent } from './maubook-admin/hotel-bookings/hotel-bookings.component';
import { BookingComponent } from './website/pages/booking/booking.component';
import { PaymentComponent } from './website/payment/payment.component';
import { ConfirmationComponent } from './website/confirmation/confirmation.component';
import { AuthGuard } from './auth.guard';
import { BookingCategoryComponent } from './booking-category/booking-category.component';
import { PackageBookingsComponent } from './maubook-admin/package-bookings/package-bookings.component';

const routes: Routes = [
  // Website routes
  {
    path: '',
    component: WebsiteLayoutComponent,
    children: [
      { path: '', component: HomepageComponent }, // Public: Homepage
      { path: 'login', component: LoginComponent }, // Public: Login
      { path: 'register', component: RegisterComponent }, // Public: Register
      { path: 'stays', component: StaysComponent }, // Public: Stays
      { path: 'property/:id', component: PropertyDetailsComponent }, // Public: Property details
      { path: 'category/:category', component: CategoryPackagesComponent }, // Public: Category packages
      { path: 'package/:id', component: PackageDetailsComponent }, // Public: Package details
      { path: 'booking', component: BookingComponent }, // Public: Booking (adjust if needed)
      { path: 'payment', component: PaymentComponent }, // Public: Payment (adjust if needed)
      { path: 'confirmation', component: ConfirmationComponent }, // Public: Confirmation (adjust if needed)
      { path: 'change-password', component: ChangePasswordComponent }, // Public: Change password (adjust if needed)
      { path: 'booking-category', component: BookingCategoryComponent }, 
      { path: 'profile', component: ProfileComponent, canActivate: [AuthGuard] }, // Protected: User profile
      { path: 'my-bookings', component: MyBookingsComponent, canActivate: [AuthGuard] } // Protected: User bookings
    ]
  },

  // Admin routes
  // {
  //   path: 'admin',
  //   component: AdminLayoutComponent,
  //   children: [
  //     { path: '', component: AdminDashboardComponent },
  //     { path: 'dashboard', component: AdminDashboardComponent },
  //     { path: 'packages', component: PackagesComponent },
  //     { path: 'add-packages', component: AddPackagesComponent },
  //     { path: 'properties', component: PropertiesComponent },
  //     { path: 'add-properties', component: AddPropertiesComponent },
  //     { path: 'users', component: UsersComponent },
  //     { path: 'hotels-bookings', component: HotelBookingsComponent },
  //     { path: 'package-bookings', component: PackageBookingsComponent },
  //   ]
  // },

  // Wildcard route
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { initialNavigation: 'enabledBlocking' })],
  exports: [RouterModule]
})
export class AppRoutingModule {}