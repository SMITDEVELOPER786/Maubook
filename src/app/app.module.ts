import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { SwiperModule } from 'swiper/angular';

import { HeaderComponent } from './website/components/header/header.component';
import { FooterComponent } from './website/components/footer/footer.component';
import { HomepageComponent } from './website/pages/homepage/homepage.component';
import { AboutusComponent } from './website/pages/aboutus/aboutus.component';
import { ContactusComponent } from './website/pages/contactus/contactus.component';
import { AdminHeaderComponent } from './maubook-admin/admin-components/admin-header/admin-header.component';
import { AdminSidebarComponent } from './maubook-admin/admin-components/admin-sidebar/admin-sidebar.component';
import { AdminDashboardComponent } from './maubook-admin/admin-dashboard/admin-dashboard.component';
import { WebsiteLayoutComponent } from './layout/website-layout/website-layout.component';
import { AdminLayoutComponent } from './layout/admin-layout/admin-layout.component';
import { StaysComponent } from './website/pages/stays/stays.component';

import { PackagesComponent } from './maubook-admin/packages/packages.component';
import { AddPackagesComponent } from './maubook-admin/add-packages/add-packages.component';
import { AddPropertiesComponent } from './maubook-admin/add-properties/add-properties.component';
import { PropertiesComponent } from './maubook-admin/properties/properties.component';
import { UsersComponent } from './maubook-admin/users/users.component';
import { AuthService } from '../app/services/auth.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { environment } from '../environments/environment';

import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { provideFirestore, getFirestore } from '@angular/fire/firestore';
import { provideAuth, getAuth } from '@angular/fire/auth';

import { FirebaseApp, initializeApp as firebaseInitializeApp } from 'firebase/app';
import { getFirestore as firestoreDb } from 'firebase/firestore';
import { getAuth as firebaseAuth } from 'firebase/auth';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { PropertyDetailsComponent } from './website/pages/property-details/property-details.component';

import { AngularFireModule } from '@angular/fire/compat';
import { AngularFirestoreModule } from '@angular/fire/compat/firestore';
import { CategoryPackagesComponent } from './website/pages/category-packages/category-packages.component';
import { PackageDetailsComponent } from './website/pages/package-details/package-details.component';
import { TicketsComponent } from './website/pages/tickets/tickets.component';

import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatNativeDateModule, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { ProfileComponent } from './user/profile/profile.component';
import { ChangePasswordComponent } from './user/change-password/change-password.component';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { UserSidebarComponent } from './user/user-sidebar/user-sidebar.component';
import { MyBookingsComponent } from './user/my-bookings/my-bookings.component';
import { BookingComponent } from './website/pages/booking/booking.component';
import { HotelBookingsComponent } from './maubook-admin/hotel-bookings/hotel-bookings.component';
import { PaymentComponent } from './website/payment/payment.component';
import { ConfirmationComponent } from './website/confirmation/confirmation.component';
// import { TicketComponent } from './website/ticket/ticket.component';
import { BookingCategoryComponent } from './booking-category/booking-category.component';
import { PackageBookingsComponent } from './maubook-admin/package-bookings/package-bookings.component';

import { SeatsioAngularModule } from '@seatsio/seatsio-angular';


export const MY_DATE_FORMATS = {
  parse: {
    dateInput: 'DD/MM/YYYY',
  },
  display: {
    dateInput: 'dd/MM/yyyy',
    monthYearLabel: 'MMM yyyy',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM yyyy',
  },
};

// Firebase instance exports
export const firebaseApp: FirebaseApp = firebaseInitializeApp(environment.firebaseConfig);
export const db = firestoreDb(firebaseApp);
export const auth = firebaseAuth(firebaseApp);

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    FooterComponent,
    HomepageComponent,
    AboutusComponent,
    ContactusComponent,
    AdminHeaderComponent,
    AdminSidebarComponent,
    AdminDashboardComponent,
    WebsiteLayoutComponent,
    AdminLayoutComponent,
    StaysComponent,
    PackagesComponent,
    AddPackagesComponent,
    AddPropertiesComponent,
    PropertiesComponent,
    UsersComponent,
    PropertyDetailsComponent,
    CategoryPackagesComponent,
    PackageDetailsComponent,
    TicketsComponent,
    
    ProfileComponent,
    
    ChangePasswordComponent,
    LoginComponent,
    RegisterComponent,
    UserSidebarComponent,
    MyBookingsComponent,
    BookingComponent,
    HotelBookingsComponent,
    BookingComponent,
    PaymentComponent,
    ConfirmationComponent,
    // TicketComponent,
    BookingCategoryComponent,
    PackageBookingsComponent,
    
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    CommonModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatInputModule,
    MatNativeDateModule,
    ReactiveFormsModule,
    provideFirebaseApp(() => initializeApp(environment.firebaseConfig)),
    provideFirestore(() => getFirestore()),
    provideAuth(() => getAuth()),
    BrowserAnimationsModule,
    AngularFireModule.initializeApp(environment.firebaseConfig),
    AngularFirestoreModule,
    SeatsioAngularModule,
    SwiperModule
    
  ],
  providers: [
    { provide: MAT_DATE_LOCALE, useValue: 'en-GB' },
    { provide: MAT_DATE_FORMATS, useValue: MY_DATE_FORMATS },
    AuthService, // Added AuthService to providers
  ],
  bootstrap: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AppModule {}
