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
import { AddSpaComponent } from './maubook-admin/add-spa/add-spa.component';
import { SpaComponent } from './maubook-admin/spas/spa.component';
import { eveningComponent } from './maubook-admin/evening/evening.component';
import { AddEveningComponent } from './maubook-admin/add-evening/add-evening.component';
import { EventsComponent } from './maubook-admin/events/events.component';
import { AddEventsComponent } from './maubook-admin/add-events/add-events.component';
import { AddResturantComponent } from './maubook-admin/add-resturant/add-resturants.component';
import { resturantsComponent } from './maubook-admin/resturants/resturants.component';
import { ActivitiesComponent } from './maubook-admin/activities/activities.component';
import { AddActivitiesComponent } from './maubook-admin/add-activities/add-activities.component';
import { SettingsComponent } from './maubook-admin/settings/settings.component';
import { EditSpaComponent } from './maubook-admin/edit-spa/edit-spa.component';

const routes: Routes = [
  // Website routes
  {
    path: '',
    component: AdminLayoutComponent,
    children: [
      { path: '', component: AdminDashboardComponent },
      { path: 'dashboard', component: AdminDashboardComponent },
      { path: 'packages', component: PackagesComponent },
      { path: 'add-packages', component: AddPackagesComponent },
      { path: 'properties', component: PropertiesComponent },
      { path: 'add-properties', component: AddPropertiesComponent },
      { path: 'users', component: UsersComponent },
      { path: 'hotels-bookings', component: HotelBookingsComponent },
      { path: 'package-bookings', component: PackageBookingsComponent },
      { path: 'add-spa', component: AddSpaComponent },
      { path: 'spas', component: SpaComponent },
      { path: 'evening', component: eveningComponent },
      { path: 'add-evening', component: AddEveningComponent },
      { path: 'add-events', component: AddEventsComponent },
      { path: 'events', component: EventsComponent },
      { path: 'resturants', component: resturantsComponent },
      { path: 'add-resturants', component: AddResturantComponent },
      { path: 'activities', component: ActivitiesComponent },
      { path: 'add-activities', component: AddActivitiesComponent },
      { path: 'settings', component: SettingsComponent },
      { path: 'spas/edit/:id', component: AddSpaComponent },
      { path: 'evening/edit/:id', component: AddEveningComponent },
      { path: 'events/edit/:id', component: AddEventsComponent },
      { path: 'resturants/edit/:id', component: AddResturantComponent },
      { path: 'activities/edit/:id', component: AddActivitiesComponent },













    ]
  }

];

@NgModule({
  imports: [RouterModule.forRoot(routes, { initialNavigation: 'enabledBlocking' })],
  exports: [RouterModule]
})
export class AppRoutingModule { }